'use client';

import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Search, Bell, Settings, LogOut, User, X, Sun } from 'lucide-react';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group.tsx';
import { ThemeModeToggle } from '@/components/core/theme-mode-toggle.tsx';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LanguageModeToggle } from '@/components/core/language-mode-toggle.tsx';
import { NotificationsPopover } from '@/pages/customers/components/NotificationsPopover/NotificationsPopover.tsx';

export type HeaderUser = {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
};

export type HeaderProps = {
  user?: HeaderUser | null;
  title?: string;
  className?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
};

export const Header: React.FC<HeaderProps> = ({ user = null, className, onSearch }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Debounce search calls
  useEffect(() => {
    if (!onSearch) return;
    const id = setTimeout(() => {
      onSearch(query.trim());
    }, 300);
    return () => clearTimeout(id);
  }, [query, onSearch]);

  // Keyboard shortcut: focus search on '/'
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <header
      className={cn(
        'flex items-center justify-between gap-4 border-b border-border px-4 py-3 bg-background',
        className,
      )}
      role="banner">
      {/* Left: Brand + Search */}
      <div className="flex items-center gap-4 min-w-0">
        <Link
          to={'/'}
          style={{
            height: '40px',
            width: 'auto',
            padding: '4px',
          }}>
          <img
            src={'/logo.svg'}
            alt="Logo"
            style={{
              height: '100%',
              width: '100%',
            }}
          />
        </Link>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Mobile search trigger */}
        <div className="md:hidden">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open search">
                <Search className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-screen max-w-sm">
              <div className="flex items-center gap-2">
                <Search className="size-4 text-muted-foreground" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t('search')}
                  aria-label="Mobile search"
                />
                {query && (
                  <button
                    className="opacity-70 hover:opacity-100"
                    onClick={() => setQuery('')}
                    aria-label="Clear search">
                    <X className="size-4" />
                  </button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <div className="hidden md:flex items-center">
          <InputGroup>
            <InputGroupInput placeholder={t('search')} />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end"></InputGroupAddon>
          </InputGroup>
        </div>

        {/* Notifications */}
        <Tooltip>
          <TooltipTrigger asChild>
            <NotificationsPopover></NotificationsPopover>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>Notifications</TooltipContent>
        </Tooltip>

        {/* Settings */}
        <Tooltip>
          <TooltipTrigger asChild>
            <ThemeModeToggle></ThemeModeToggle>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>{t('change_theme')}</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <LanguageModeToggle></LanguageModeToggle>
          </TooltipTrigger>
          <TooltipContent sideOffset={6}>{t('change_language')}</TooltipContent>
        </Tooltip>

        {/* User dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              aria-label="Account options">
              <Avatar className="h-8 w-8">
                {user?.avatar ? (
                  <AvatarImage
                    src={user.avatar}
                    alt={user?.name ?? 'User'}
                  />
                ) : (
                  <AvatarFallback>{(user?.name ?? 'U').slice(0, 2)}</AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  {user?.avatar ? (
                    <AvatarImage
                      src={user.avatar}
                      alt={user?.name ?? 'User'}
                    />
                  ) : (
                    <AvatarFallback>{(user?.name ?? 'U').slice(0, 2)}</AvatarFallback>
                  )}
                </Avatar>
                <div className="grid text-sm">
                  <span className="font-medium">{user?.name ?? 'Guest'}</span>
                  <span className="text-xs text-muted-foreground truncate">{user?.email ?? ''}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/')}>
              <LogOut className="size-4" />
              {t('sign_out')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
