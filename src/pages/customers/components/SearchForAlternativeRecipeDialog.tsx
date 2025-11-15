import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';
import { toast } from 'sonner';
import { productService } from '@/services/ProductService';
import { generateGeminiRecipe, generateGeminiContent } from '@/pages/gemini/gemini-functions';
import type { Item } from '@/pages/aimo/picking-dashboard';

type Message = { role: 'user' | 'assistant'; text: string };
function cacheKey(item: Item) {
  return `alt_chat:${item.id}`;
}

function loadCachedMessages(item: Item) {
  try {
    const key = cacheKey(item);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Message[];
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedMessages(item: Item, msgs: Message[]) {
  try {
    const key = cacheKey(item);
    localStorage.setItem(key, JSON.stringify(msgs));
  } catch {
    // ignore
  }
}

export default function SearchForAlternativeRecipeDialog({ item }: { item: Item }) {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cachedLoaded, setCachedLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Try to load cached conversation for these selected IDs
    const cached = loadCachedMessages(item);
    if (cached && cached.length > 0) {
      setMessages(cached);
      setCachedLoaded(true);
      return;
    }

    // when opened and no cache, trigger recipe generation
    (async () => {
      setLoading(true);
      try {
        // const names = selectedIds
        //   .map((id) => productService.getProductById(id)?.name)
        //   .filter(Boolean) as string[];
        // seed a couple of assistant messages
        const seed: Message[] = [{ role: 'assistant', text: 'Looking at selected items...' }];
        setMessages(seed);
        const langShort = i18n?.language?.split('-')[0];
        const context = seed.map((m) => `${m.role}: ${m.text}`);
        const recipe = await generateGeminiRecipe(['foo'], context, langShort);
        const msgs: Message[] = [...seed, { role: 'assistant', text: recipe }];
        setMessages(msgs);
        saveCachedMessages(item, msgs);
        setCachedLoaded(true);
      } catch {
        const errMsg: Message = {
          role: 'assistant',
          text: t('select_alternatives.dialog.error_retry'),
        };
        setMessages((prev) => {
          const next = [...prev, errMsg];
          saveCachedMessages(item, next);
          return next;
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, item, i18n?.language, t]);

  function clearCacheForSelection(item: Item) {
    try {
      const key = cacheKey(item);
      localStorage.removeItem(key);
      setCachedLoaded(false);
      toast.success(t('select_alternatives.dialog.cache_cleared'));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    // scroll to bottom when messages change
    const el = containerRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages]);

  function markdownToHtml(md: string) {
    const escapeHtml = (unsafe: string) =>
      unsafe.replace(/[&<"']/g, function (m) {
        switch (m) {
          case '&':
            return '&amp;';
          case '<':
            return '&lt;';
          case '"':
            return '&quot;';
          case "'":
            return '&#039;';
          default:
            return m;
        }
      });

    return md
      .replace(
        /```([\s\S]*?)```/g,
        (_, code) =>
          `<pre class="rounded bg-gray-800 text-white p-3 overflow-auto"><code>${escapeHtml(code)}</code></pre>`,
      )
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="cursor-pointer">
          Alternative Recipes
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col w-[95vw] sm:w-[80vw] sm:max-w-5xl max-w-full max-h-[80vh] overflow-hidden">
        <DialogHeader className="sticky top-0 bg-white z-20 border-b flex items-center justify-between">
          <DialogTitle>{t('select_alternatives.dialog.title')}</DialogTitle>
          <div className="flex items-center gap-2">
            {cachedLoaded && (
              <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">
                {t('select_alternatives.dialog.loaded_from_cache')}
              </div>
            )}
            {cachedLoaded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => clearCacheForSelection(item)}>
                {t('select_alternatives.dialog.clear_cache')}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 rounded-md overflow-hidden relative flex flex-col min-h-0">
            <div
              ref={containerRef}
              className="relative z-10 w-full p-4 overflow-auto flex-1 min-h-0 pb-6">
              {messages.length === 0 ? (
                loading ? (
                  <div className="text-center text-sm text-gray-500">
                    {t('select_alternatives.dialog.loading')}
                  </div>
                ) : null
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.role === 'assistant' ? (
                      <div
                        className="prose max-w-none inline-block px-3 py-2 rounded bg-gray-50"
                        dangerouslySetInnerHTML={{ __html: markdownToHtml(m.text) }}
                      />
                    ) : (
                      <div className={`inline-block px-3 py-2 rounded bg-blue-100`}>{m.text}</div>
                    )}
                  </div>
                ))
              )}

              {loading && messages.length > 0 && (
                <div className="mb-2 text-left">
                  <div className="inline-block px-3 py-2 rounded bg-gray-50 text-gray-500 animate-pulse">
                    {t('select_alternatives.dialog.loading')}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`bg-white z-20 p-4 ${loading ? 'opacity-60' : ''}`}>
            {loading && (
              <div className="w-full h-0.75 overflow-hidden relative mb-2">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-300 to-transparent"
                  style={{ transform: 'translateX(-25%)', animation: 'shimmer 1.2s infinite' }}
                />
                <style>{`@keyframes shimmer { 0% { transform: translateX(-100%);} 100% { transform: translateX(100%);} } .h-0\\.75{height:3px}`}</style>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t(
                  'select_alternatives.dialog.placeholder',
                  'Type your question about alternatives...',
                )}
                className="flex-1 p-2 border rounded resize-none"
                rows={2}
                disabled={loading}
              />
              <Button
                variant={input.trim() && !loading ? 'default' : 'ghost'}
                size="icon"
                className="h-10 w-10 p-2 flex items-center justify-center"
                aria-label={t('select_alternatives.dialog.send')}
                disabled={loading}
                onClick={async () => {
                  if (!input.trim() || loading) return;
                  const userMsg: Message = { role: 'user', text: input.trim() };
                  const currentMsgs = [...messages, userMsg];
                  setMessages(currentMsgs);
                  setInput('');
                  setLoading(true);
                  try {
                    const langShort = i18n?.language?.split('-')[0];
                    const context = currentMsgs.map((m) => `${m.role}: ${m.text}`);
                    // For follow-ups, ask the model directly using the chat context so it answers questions
                    const followUpPrompt = input.trim();
                    const reply = await generateGeminiContent(
                      followUpPrompt,
                      undefined,
                      200,
                      context,
                      langShort,
                    );
                    const assistantMsg: Message = { role: 'assistant', text: reply };
                    setMessages((m) => {
                      const next = [...m, assistantMsg];
                      saveCachedMessages(item, next);
                      setCachedLoaded(true);
                      return next;
                    });
                  } catch {
                    const errMsg: Message = {
                      role: 'assistant',
                      text: t('select_alternatives.dialog.error_retry'),
                    };
                    setMessages((m) => {
                      const next = [...m, errMsg];
                      saveCachedMessages(item, next);
                      return next;
                    });
                  } finally {
                    setLoading(false);
                  }
                }}>
                <Send className="size-6" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
