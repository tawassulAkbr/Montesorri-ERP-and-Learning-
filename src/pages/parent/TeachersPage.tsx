import { useState } from 'react';
import { Mail, Phone, MessageSquare, Send, CheckCircle2, GraduationCap } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import type { Teacher } from '@/types';

export const ParentTeachersPage: React.FC = () => {
  const { teachers, students } = useData();
  const { currentUser } = useAuth();
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [message, setMessage] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const myClassSet = new Set(
    students.filter(s => s.parentId === currentUser?.id).map(s => s.class)
  );
  const orderedTeachers = [...teachers].sort((a, b) => {
    const aMine = a.classes.some(c => myClassSet.has(c)) ? 0 : 1;
    const bMine = b.classes.some(c => myClassSet.has(c)) ? 0 : 1;
    return aMine - bMine;
  });

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message) return;

    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      setSelectedTeacher(null);
      setMessage('');
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Subject Teachers & Direct Contact</h1>
        <p className="text-sm text-slate-500">Connect with your child's teachers, request meetings, or send academic inquiries</p>
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
                  onClick={() => setSelectedTeacher(teacher)}
                  className="w-full gap-2 shadow-sm text-xs"
                >
                  <MessageSquare size={14} /> Send Direct Message
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Contact Message Dialog */}
      {selectedTeacher && (
        <Dialog open={!!selectedTeacher} onOpenChange={() => setSelectedTeacher(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MessageSquare className="text-indigo-600" size={18} />
                Message {selectedTeacher.name} ({selectedTeacher.subject})
              </DialogTitle>
            </DialogHeader>

            {sentSuccess ? (
              <div className="py-6 text-center">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 size={24} />
                </div>
                <h4 className="text-sm font-bold text-slate-800">Message Sent!</h4>
                <p className="text-xs text-slate-500 mt-1">{selectedTeacher.name} will respond to your registered email shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSendMessage} className="space-y-4">
                <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                  <p className="text-slate-500">To: <span className="font-semibold text-slate-800">{selectedTeacher.name}</span></p>
                  <p className="text-slate-500">Subject: <span className="font-semibold text-slate-800">{selectedTeacher.subject} Teacher</span></p>
                </div>

                <div>
                  <Label className="text-xs font-medium text-slate-600">Your Message / Query</Label>
                  <textarea
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Ask about homework, attendance, upcoming tests, or schedule an in-person meeting..."
                    className="w-full mt-1.5 text-xs border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    required
                  />
                </div>

                <DialogFooter>
                  <Button variant="outline" type="button" onClick={() => setSelectedTeacher(null)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="gap-1.5">
                    <Send size={14} /> Send Message
                  </Button>
                </DialogFooter>
              </form>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
