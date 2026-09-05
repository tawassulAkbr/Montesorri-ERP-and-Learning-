import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { apiGet, apiPost } from '@/lib/api';
import { useData } from '@/context/DataContext';
import { formatDateTime } from '@/lib/utils';
import type { ChatMessage } from '@/types';

export const ParentMessageThreadPage: React.FC = () => {
  const { teacherId = '' } = useParams();
  const { teachers } = useData();
  const teacher = teachers.find(t => t.id === teacherId);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await apiGet<{ messages: ChatMessage[] }>(`/parents/messages/${teacherId}`);
      setMessages(res.messages);
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [teacherId]);

  useEffect(() => {
    load();
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    setSending(true);
    setSendError('');
    try {
      await apiPost(`/parents/messages/${teacherId}`, { content });
      setDraft('');
      await load();
    } catch (err) {
      console.error('Failed to send message:', err);
      setSendError('Message not sent. Please check your connection and try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Link to="/parent/teachers" className="text-[#667085] hover:text-[#344054]">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-[#101828]">Chat with {teacher?.name ?? 'Teacher'}</h1>
          <p className="text-xs text-[#667085]">{teacher?.subject} · Private conversation about your child</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[65vh]">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <p className="text-xs text-[#667085] text-center py-8">
              No messages yet. Start the conversation about your child's progress!
            </p>
          ) : (
            messages.map(m => (
              <div key={m.id} className={`flex ${m.senderRole === 'parent' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs ${
                  m.senderRole === 'parent'
                    ? 'bg-[#006B5D] text-white rounded-br-sm'
                    : 'bg-slate-100 text-[#344054] rounded-bl-sm'
                }`}>
                  <p className="whitespace-pre-wrap">{m.content}</p>
                  <p className={`text-[9px] mt-1 ${m.senderRole === 'parent' ? 'text-[#006B5D]' : 'text-[#667085]'}`}>
                    {m.senderRole === 'parent' ? 'You' : m.teacherName} · {formatDateTime(m.createdAt)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
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
            placeholder="Write a message..."
            className="flex-1 text-xs border border-slate-200 rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#006B5D]"
          />
          <Button type="submit" size="sm" className="gap-1.5" disabled={sending || !draft.trim()}>
            <Send size={13} /> Send
          </Button>
        </form>
      </div>
    </div>
  );
};

