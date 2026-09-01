import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ChevronRight, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { apiGet } from '@/lib/api';
import { getInitials, avatarColors, cn, formatDateTime } from '@/lib/utils';
import type { MessageThread } from '@/types';

export const ParentMessagesPage: React.FC = () => {
  const navigate = useNavigate();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiGet<{ threads: MessageThread[] }>('/parents/messages/threads');
      setThreads(res.threads);
    } catch (err) {
      console.error('Failed to load messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [load]);

  const totalUnread = threads.reduce((s, t) => s + t.unread, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Messages</h1>
          <p className="text-sm text-slate-500">Private conversations with your child's teachers</p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-1.5 text-xs">
          <RefreshCw size={13} /> Refresh
        </Button>
      </div>

      {totalUnread > 0 && (
        <div className="flex items-center gap-2 p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs font-semibold text-indigo-700 w-fit">
          <MessageSquare size={14} /> {totalUnread} unread message{totalUnread > 1 ? 's' : ''}
        </div>
      )}

      {loading && threads.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-sm text-slate-400">Loading conversations...</CardContent></Card>
      ) : threads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <MessageSquare className="mx-auto text-slate-300 mb-2" size={36} />
            <p className="text-sm font-semibold text-slate-700">No conversations yet</p>
            <p className="text-xs text-slate-400 mt-1">
              Open the <span className="font-semibold">Montessori Guides</span> page and start a chat with a teacher.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100">
            {threads.map(t => (
              <button
                key={t.teacherId}
                onClick={() => navigate(`/parent/messages/${t.teacherId}`)}
                className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center gap-3"
              >
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0', avatarColors(t.teacherName ?? ''))}>
                  {getInitials(t.teacherName ?? 'T')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-slate-800">{t.teacherName}</span>
                    {t.unread > 0 && (
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                        {t.unread}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 truncate mt-0.5">{t.lastMessage}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] text-slate-400">{t.lastAt ? formatDateTime(t.lastAt) : ''}</span>
                  <ChevronRight size={16} className="text-slate-300" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
