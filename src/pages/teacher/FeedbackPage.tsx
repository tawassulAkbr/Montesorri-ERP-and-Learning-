import { MessageSquareHeart, CheckCircle2, UserX } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/DataContext';
import { formatDate } from '@/lib/utils';

export const TeacherFeedbackPage: React.FC = () => {
  const { feedbacks, markFeedbackRead } = useData();
  const unread = feedbacks.filter(f => !f.readByTeacher).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Student Feedback</h1>
        <p className="text-sm text-slate-500 flex items-center gap-1.5">
          <UserX size={15} className="text-indigo-600" />
          Feedback is anonymous — student identities are not shown.
        </p>
      </div>

      {unread > 0 && (
        <div className="text-xs text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-lg w-fit">
          {unread} unread feedback message{unread > 1 ? 's' : ''}
        </div>
      )}

      <div className="space-y-3">
        {feedbacks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-700">No feedback yet</p>
              <p className="text-xs text-slate-400 mt-1">When students share anonymous feedback, it appears here.</p>
            </CardContent>
          </Card>
        ) : (
          feedbacks.map(fb => (
            <Card key={fb.id} className={!fb.readByTeacher ? 'border-indigo-200 bg-indigo-50/20' : ''}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0">
                    <MessageSquareHeart size={18} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 mb-1">
                      A student · {formatDate(fb.createdAt)}
                    </p>
                    <p className="text-sm text-slate-700">{fb.content}</p>
                  </div>
                </div>
                {!fb.readByTeacher && (
                  <Button variant="outline" size="sm" className="gap-1.5 text-xs flex-shrink-0" onClick={() => markFeedbackRead(fb.id)}>
                    <CheckCircle2 size={14} /> Mark Read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
