import { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, X, Cpu, User, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet';
import { AiResponseCard } from './AiResponseCard';
import { askAi, SUGGESTED_QUESTIONS } from '@/lib/ai';
import type { AiResponse } from '@/lib/ai';
import { downloadAiReport } from '@/lib/reportImage';
import { useAuth } from '@/hooks/useAuth';
import { useData } from '@/context/DataContext';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text?: string;
  answer?: AiResponse;
  error?: string;
  reportAutoDownloaded?: boolean;
}

let msgSeq = 0;
const nextId = () => `ai-msg-${++msgSeq}`;

export const AssistantPanel: React.FC = () => {
  const { role } = useAuth();
  const { offlineMode } = useData();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const suggestions = role ? SUGGESTED_QUESTIONS[role] : [];

  useEffect(() => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    if (toast) toastTimer.current = setTimeout(() => setToast(null), 3500);
    return () => { if (toastTimer.current) clearTimeout(toastTimer.current); };
  }, [toast]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, open]);

  const triggerDownload = (answer: AiResponse, id: string) => {
    if (!answer.chart) return;
    try {
      downloadAiReport(answer);
      setMessages(prev => prev.map(m => m.id === id ? { ...m, reportAutoDownloaded: true } : m));
      setToast('AI report downloaded to your device.');
    } catch (err) {
      console.error('Auto report download failed:', err);
    }
  };

  const ask = async (question: string) => {
    const q = question.trim();
    if (!q || busy || offlineMode) return;
    setInput('');
    setMessages(prev => [...prev, { id: nextId(), role: 'user', text: q }]);
    setBusy(true);
    const assistantId = nextId();
    try {
      const answer = await askAi(q);
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', answer }]);
      if (answer.chart) triggerDownload(answer, assistantId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', error: msg }]);
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    ask(input);
  };

  return (
    <>
      {/* Floating action button */}
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="gradient-primary fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center text-white hover:shadow-xl transition-shadow"
        aria-label="Open AI assistant"
      >
        <Sparkles size={22} />
      </motion.button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="sm:max-w-md lg:max-w-lg w-full flex flex-col p-0 gap-0">
          {/* Header */}
          <SheetHeader className="border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2.5">
              <span className="gradient-primary w-9 h-9 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                <Sparkles size={17} />
              </span>
              <div>
                <SheetTitle>KinderGuide AI Assistant</SheetTitle>
                <SheetDescription>Ask about your data — answers come with charts and reports.</SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="text-center py-6">
                <span className="inline-flex w-12 h-12 rounded-2xl bg-[#E6F4F1] items-center justify-center text-[#006B5D] mb-3">
                  <Cpu size={22} />
                </span>
                <p className="text-sm font-semibold text-[#344054]">What would you like to know?</p>
                <p className="text-xs text-[#667085] mt-1 mb-4">
                  I only see what your {role ?? 'user'} role can access. Try one of these:
                </p>
                <div className="flex flex-col gap-2 items-stretch">
                  {suggestions.slice(0, 4).map(s => (
                    <button
                      key={s}
                      onClick={() => ask(s)}
                      disabled={busy || offlineMode}
                      className="text-left text-xs font-medium text-[#006B5D] bg-white border border-[#B7DDD6] hover:bg-[#E6F4F1] rounded-lg px-3 py-2 transition-colors disabled:opacity-50"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map(m => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'user' ? (
                  <div className="max-w-[85%] flex items-end gap-2 justify-end">
                    <div className="gradient-primary text-white text-[13px] rounded-2xl rounded-br-md px-3.5 py-2.5 shadow-sm">
                      {m.text}
                    </div>
                    <span className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-[#667085] flex-shrink-0">
                      <User size={14} />
                    </span>
                  </div>
                ) : (
                  <div className="w-full max-w-[95%]">
                    {m.error ? (
                      <div className="bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-3.5 py-2.5">
                        {m.error}
                      </div>
                    ) : m.answer ? (
                      <div className="space-y-1.5">
                        <AiResponseCard answer={m.answer} />
                        {m.reportAutoDownloaded && (
                          <p className="text-[11px] text-emerald-600 flex items-center gap-1 px-1">
                            Report image downloaded automatically.
                          </p>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ))}

            {busy && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <Sparkles size={15} className="text-[#006B5D] animate-pulse" />
                  <span className="text-xs text-[#667085]">Analyzing your data…</span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-slate-100 p-3 bg-white">
            {offlineMode ? (
              <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2.5">
                <WifiOff size={14} className="flex-shrink-0" />
                <span>The AI assistant is unavailable while offline. Reconnect to ask questions.</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Ask about attendance, performance, fees…"
                  disabled={busy}
                  className="flex-1 h-10 text-sm border border-slate-200 rounded-xl px-3.5 outline-none focus:border-[#006B5D] focus:ring-2 focus:ring-[#B7DDD6] transition-colors disabled:bg-slate-50"
                />
                <button
                  type="submit"
                  disabled={busy || !input.trim()}
                  className="gradient-primary w-10 h-10 rounded-xl flex items-center justify-center text-white disabled:opacity-40 transition-opacity flex-shrink-0"
                  aria-label="Send question"
                >
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-24 right-6 z-50 bg-slate-800 text-white text-xs rounded-lg px-4 py-2.5 shadow-lg flex items-center gap-2"
          >
            <span>{toast}</span>
            <button onClick={() => setToast(null)} className="text-slate-300 hover:text-white" aria-label="Dismiss">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
