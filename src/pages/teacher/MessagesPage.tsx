import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiGet, apiPost } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ChatMessage, MessageThread } from '@/types';

export const TeacherMessagesPage: React.FC = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    try {
      const res = await apiGet<{ threads: MessageThread[] }>('/teachers/messages/threads');
      setThreads(res.threads);
    } catch (err) {
      console.error('Failed to load threads:', err);
    }
  }, []);

  const loadMessages = useCallback(async (parentId: string) => {
    try {
      const res = await apiGet<{ messages: ChatMessage[] }>(`/teachers/messages/${parentId}`);
      setMessages(res.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, []);

  useEffect(() => {
    loadThreads();
    const id = setInterval(loadThreads, 5000);
    return () => clearInterval(id);
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedParentId) return;
    loadMessages(selectedParentId);
    const id = setInterval(() => loadMessages(selectedParentId), 5000);
    return () => clearInterval(id);
  }, [selectedParentId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || !selectedParentId) return;
    setSending(true);
    try {
      await apiPost(`/teachers/messages/${selectedParentId}`, { content });
      setDraft('');
      await loadMessages(selectedParentId);
      await loadThreads();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  const selectedThread = threads.find(t => t.parentId === selectedParentId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Parent Messages</h1>
        <p className="text-sm text-slate-500">Private chatrooms with parents about their child's progress</p>
      </div>

      {threads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-semibold text-slate-700">No conversations yet</p>
            <p className="text-xs text-slate-400 mt-1">When a parent messages you, the chat appears here.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[65vh]">
          {/* Thread list */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-y-auto">
            {threads.map(t => (
              <button
                key={t.parentId}
                onClick={() => setSelectedParentId(t.parentId ?? null)}
                className={cn(
                  'w-full text-left p-3.5 border-b border-slate-50 transition-colors',
                  selectedParentId === t.parentId ? 'bg-indigo-50/60' : 'hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-800">{t.parentName}</span>
                  {t.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                      {t.unread}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 truncate mt-0.5">{t.lastMessage}</p>
                <p className="text-[9px] text-slate-300 mt-0.5">{formatDateTime(t.lastAt)}</p>
              </button>
            ))}
          </div>

          {/* Conversation pane */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            {!selectedThread ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-2">
                <MessageSquare size={32} />
                <p className="text-xs">Select a conversation to view messages</p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-slate-800">{selectedThread.parentName}</p>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.senderRole === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs ${
                        m.senderRole === 'teacher'
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[9px] mt-1 ${m.senderRole === 'teacher' ? 'text-indigo-200' : 'text-slate-400'}`}>
                          {m.senderRole === 'teacher' ? 'You' : m.parentName} · {formatDateTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
                <form onSubmit={handleSend} className="border-t border-slate-100 p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button type="submit" size="sm" className="gap-1.5" disabled={sending || !draft.trim()}>
                    <Send size={13} /> Send
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
