import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { productService } from '@/services/ProductService';
import { generateGeminiRecipe } from '@/pages/gemini/gemini-functions';

type Message = { role: 'user' | 'assistant'; text: string };
function cacheKey(ids: string[]) {
  const sorted = [...ids].sort();
  return `alt_chat:${sorted.join('|')}`;
}

function loadCachedMessages(ids: string[]) {
  try {
    const key = cacheKey(ids);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Message[];
    return parsed;
  } catch {
    return null;
  }
}

function saveCachedMessages(ids: string[], msgs: Message[]) {
  try {
    const key = cacheKey(ids);
    localStorage.setItem(key, JSON.stringify(msgs));
  } catch {
    // ignore
  }
}

export default function SelectAlternativesDialogue({ selectedIds }: { selectedIds: string[] }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cachedLoaded, setCachedLoaded] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    // Try to load cached conversation for these selected IDs
    const cached = loadCachedMessages(selectedIds);
    if (cached && cached.length > 0) {
      setMessages(cached);
      return;
    }

    // when opened and no cache, trigger recipe generation
    (async () => {
      setLoading(true);
      try {
        const names = selectedIds.map((id) => productService.getProductById(id)?.name).filter(Boolean) as string[];
        // seed a couple of assistant messages
        const seed: Message[] = [{ role: 'assistant', text: 'Looking at selected items...' }];
        setMessages(seed);
        const recipe = await generateGeminiRecipe(names);
        const msgs: Message[] = [...seed, { role: 'assistant', text: recipe }];
        setMessages(msgs);
        saveCachedMessages(selectedIds, msgs);
      } catch {
        const errMsg: Message = { role: 'assistant', text: 'Error generating recipe.' };
        setMessages((prev) => {
          const next = [...prev, errMsg];
          saveCachedMessages(selectedIds, next);
          return next;
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [open, selectedIds]);

  function clearCacheForSelection(ids: string[]) {
    try {
      const key = cacheKey(ids);
      localStorage.removeItem(key);
      setCachedLoaded(false);
      toast.success(t('select_alternatives.dialog.cache_cleared', 'Cache cleared'));
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
      .replace(/```([\s\S]*?)```/g, (_, code) => `<pre class="rounded bg-gray-800 text-white p-3 overflow-auto"><code>${escapeHtml(code)}</code></pre>`)
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold">$1</h1>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/\n/g, '<br/>');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={selectedIds.length === 0} className="cursor-pointer">
          Alternative Recipes
        </Button>
      </DialogTrigger>

      <DialogContent className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[95vw] max-w-full max-h-[80vh] overflow-hidden z-50">
        <DialogHeader className="sticky top-0 bg-white z-20 border-b flex items-center justify-between">
          <DialogTitle>{t('select_alternatives.dialog.title', 'Alternative Recipes')}</DialogTitle>
          <div className="flex items-center gap-2">
            {cachedLoaded && (
              <div className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded">{t('select_alternatives.dialog.loaded_from_cache', 'Loaded from cache')}</div>
            )}
            {cachedLoaded && (
              <Button variant="ghost" size="sm" onClick={() => clearCacheForSelection(selectedIds)}>
                {t('select_alternatives.dialog.clear_cache', 'Clear cache')}
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="flex-1 flex flex-col gap-4 min-h-0">
          <div className="flex-1 rounded-md overflow-hidden relative flex flex-col min-h-0">
            <div ref={containerRef} className="relative z-10 w-full p-4 overflow-auto flex-1 min-h-0 pb-6">
              {loading ? (
                <div className="text-center text-sm text-gray-500">{t('select_alternatives.dialog.loading', 'Generating recipe...')}</div>
              ) : messages.length === 0 ? null : (
                messages.map((m, idx) => (
                  <div key={idx} className={`mb-2 ${m.role === 'user' ? 'text-right' : 'text-left'}`}>
                    {m.role === 'assistant' ? (
                      <div className="prose max-w-none inline-block px-3 py-2 rounded bg-gray-50" dangerouslySetInnerHTML={{ __html: markdownToHtml(m.text) }} />
                    ) : (
                      <div className={`inline-block px-3 py-2 rounded bg-blue-100`}>{m.text}</div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white z-20 p-4 flex gap-2 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t('select_alternatives.dialog.placeholder', 'Type your question about alternatives...')}
              className="flex-1 p-2 border rounded resize-none"
              rows={2}
              disabled={loading}
            />
            <Button
              disabled={loading}
              onClick={async () => {
                if (!input.trim() || loading) return;
                const userMsg: Message = { role: 'user', text: input.trim() };
                setMessages((m) => [...m, userMsg]);
                setInput('');
                setLoading(true);
                try {
                  const reply = await generateGeminiRecipe(selectedIds.map((id) => productService.getProductById(id)?.name).filter(Boolean) as string[]);
                  const assistantMsg: Message = { role: 'assistant', text: reply };
                  setMessages((m) => {
                    const next = [...m, assistantMsg];
                    saveCachedMessages(selectedIds, next);
                    return next;
                  });
                } catch {
                  const errMsg: Message = { role: 'assistant', text: t('select_alternatives.dialog.error_fetch', 'Error fetching response.') };
                  setMessages((m) => {
                    const next = [...m, errMsg];
                    saveCachedMessages(selectedIds, next);
                    return next;
                  });
                } finally {
                  setLoading(false);
                }
              }}
            >
              {loading ? t('select_alternatives.dialog.loading_btn', 'Loading...') : t('select_alternatives.dialog.send', 'Send')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
