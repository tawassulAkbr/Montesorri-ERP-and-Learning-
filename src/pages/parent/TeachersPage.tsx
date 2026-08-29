import { useNavigate } from 'react-router-dom';
import { Mail, Phone, MessageSquare, GraduationCap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';

export const ParentTeachersPage: React.FC = () => {
  const { teachers, students } = useData();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const myClassSet = new Set(
    students.filter(s => s.parentId === currentUser?.id).map(s => s.class)
  );
  const orderedTeachers = [...teachers].sort((a, b) => {
    const aMine = a.classes.some(c => myClassSet.has(c)) ? 0 : 1;
    const bMine = b.classes.some(c => myClassSet.has(c)) ? 0 : 1;
    return aMine - bMine;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Montessori Guides & Private Chatrooms</h1>
        <p className="text-sm text-slate-500">Open a private chatroom with any teacher to discuss your child's progress</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {orderedTeachers.map(teacher => {
          const initials = teacher.name.split(' ').map(n => n[0]).join('');
          const isMyChildTeacher = teacher.classes.some(c => myClassSet.has(c));
          return (
            <Card key={teacher.id} className="border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base flex-shrink-0 shadow-inner">
                    {initials}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{teacher.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-xs">
                        {teacher.subject}
                      </Badge>
                      {isMyChildTeacher && (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                          My child's class
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400" />
                    <span className="truncate">{teacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={13} className="text-slate-400" />
                    <span>{teacher.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GraduationCap size={13} className="text-slate-400" />
                    <span>{teacher.qualification}</span>
                  </div>
                </div>
              </CardContent>

              <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex justify-end">
                <Button
                  size="sm"
                  onClick={() => navigate(`/parent/messages/${teacher.id}`)}
                  className="w-full gap-2 shadow-sm text-xs"
                >
                  <MessageSquare size={14} /> Open Chatroom
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
