import { useCallback, useEffect, useRef, useState } from 'react';
import { MessageSquare, Send, Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { apiGet, apiPost } from '@/lib/api';
import { formatDateTime } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { ChatMessage, MessageThread } from '@/types';

interface ParentContact {
  parentId: string;
  parentName: string;
  studentName: string;
  className: string;
}

export const TeacherMessagesPage: React.FC = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [contacts, setContacts] = useState<ParentContact[]>([]);
  const [selectedParentId, setSelectedParentId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const [loadError, setLoadError] = useState('');
  const [newChatOpen, setNewChatOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const loadThreads = useCallback(async () => {
    try {
      const res = await apiGet<{ threads: MessageThread[] }>('/teachers/messages/threads');
      setThreads(res.threads);
      setLoadError('');
    } catch (err) {
      console.error('Failed to load threads:', err);
      setLoadError('Could not reach the server. Check that the backend is running, then try again.');
    }
  }, []);

  const loadContacts = useCallback(async () => {
    try {
      const res = await apiGet<{ contacts: ParentContact[] }>('/teachers/messages/contacts');
      setContacts(res.contacts);
    } catch (err) {
      console.error('Failed to load contacts:', err);
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
    loadContacts();
    const id = setInterval(loadThreads, 5000);
    return () => clearInterval(id);
  }, [loadThreads, loadContacts]);

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
    setSendError('');
    try {
      await apiPost(`/teachers/messages/${selectedParentId}`, { content });
      setDraft('');
      await loadMessages(selectedParentId);
      await loadThreads();
    } catch (err) {
      console.error('Failed to send message:', err);
      setSendError('Message not sent. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  const selectedThread = threads.find(t => t.parentId === selectedParentId);
  const selectedContact = contacts.find(c => c.parentId === selectedParentId);
  const selectedName = selectedThread?.parentName ?? selectedContact?.parentName ?? '';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Parent Messages</h1>
          <p className="text-sm text-[#667085]">Private chatrooms with parents about their child's progress</p>
        </div>
        <Button onClick={() => setNewChatOpen(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> New Conversation
        </Button>
      </div>

      {loadError && (
        <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={15} className="flex-shrink-0" />
          {loadError}
        </div>
      )}

      {threads.length === 0 && !selectedParentId ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm font-semibold text-[#344054]">No conversations yet</p>
            <p className="text-xs text-[#667085] mt-1">
              When a parent messages you it appears here, or start one yourself with "New Conversation".
            </p>
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
                  selectedParentId === t.parentId ? 'bg-[#E6F4F1]/60' : 'hover:bg-slate-50'
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#101828]">{t.parentName}</span>
                  {t.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[#006B5D] text-white text-[10px] font-bold flex items-center justify-center">
                      {t.unread}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[#667085] truncate mt-0.5">{t.lastMessage}</p>
                <p className="text-[9px] text-slate-300 mt-0.5">{formatDateTime(t.lastAt)}</p>
              </button>
            ))}
          </div>

          {/* Conversation pane */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col">
            {!selectedParentId ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300 gap-2">
                <MessageSquare size={32} />
                <p className="text-xs">Select a conversation to view messages</p>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="text-sm font-bold text-[#101828]">{selectedName || 'Parent'}</p>
                  {selectedContact && (
                    <p className="text-[10px] text-[#667085]">
                      About {selectedContact.studentName} · {selectedContact.className}
                    </p>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map(m => (
                    <div key={m.id} className={`flex ${m.senderRole === 'teacher' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs ${
                        m.senderRole === 'teacher'
                          ? 'bg-[#006B5D] text-white rounded-br-sm'
                          : 'bg-slate-100 text-[#344054] rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{m.content}</p>
                        <p className={`text-[9px] mt-1 ${m.senderRole === 'teacher' ? 'text-[#006B5D]' : 'text-[#667085]'}`}>
                          {m.senderRole === 'teacher' ? 'You' : m.parentName} · {formatDateTime(m.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>

                {sendError && (
                  <div className="flex items-center gap-2 text-xs text-red-700 bg-red-50 border-t border-red-100 px-4 py-2">
                    <AlertCircle size={14} className="flex-shrink-0" />
                    {sendError}
                  </div>
                )}

                <form onSubmit={handleSend} className="border-t border-slate-100 p-3 flex items-center gap-2">
                  <input
                    type="text"
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="Write a reply..."
                    className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#006B5D]"
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

      {/* New conversation picker */}
      <Dialog open={newChatOpen} onOpenChange={o => setNewChatOpen(o)}>
        <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Start a Conversation</DialogTitle>
            <DialogDescription>Choose a parent from your classes to message about their child.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {contacts.length === 0 ? (
              <p className="text-xs text-[#667085] text-center py-6">No parents found in your assigned classes.</p>
            ) : (
              contacts.map(c => (
                <button
                  key={c.parentId}
                  onClick={() => { setSelectedParentId(c.parentId); setNewChatOpen(false); }}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-[#B7DDD6] hover:bg-[#E6F4F1]/40 transition-colors"
                >
                  <p className="text-xs font-semibold text-[#101828]">{c.parentName}</p>
                  <p className="text-[10px] text-[#667085] mt-0.5">
                    Parent of {c.studentName} · {c.className}
                  </p>
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
