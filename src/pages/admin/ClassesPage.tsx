import { BookMarked, Users, GraduationCap, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/context/DataContext';
import { MONTESSORI_CLASSES } from '@/lib/utils';

export const AdminClassesPage: React.FC = () => {
  const { students, teachers, schedules } = useData();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Montessori Cohorts</h1>
        <p className="text-sm text-slate-500">Live overview of each cohort — enrollment, assigned guides, and fee status</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {MONTESSORI_CLASSES.map(cohort => {
          const cohortStudents = students.filter(s => s.class === cohort);
          const cohortTeachers = teachers.filter(t => t.classes.includes(cohort));
          const feeDueCount = cohortStudents.filter(s => s.feeDue).length;
          const scheduleCount = schedules.filter(s => s.class === cohort).length;

          return (
            <Card key={cohort} className="border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between">
              <CardHeader className="p-5 bg-slate-50/70 border-b border-slate-100 flex flex-row items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-800">{cohort}</h3>
                  <p className="text-xs text-slate-400">
                    {cohortTeachers.length} guide{cohortTeachers.length !== 1 ? 's' : ''} assigned
                  </p>
                </div>
                <Badge className="bg-indigo-600 text-white text-xs">
                  <Users size={12} className="mr-1" /> {cohortStudents.length}
                </Badge>
              </CardHeader>

              <CardContent className="p-5 space-y-3">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block mb-1.5">
                    Assigned Guides
                  </span>
                  {cohortTeachers.length === 0 ? (
                    <p className="text-xs text-slate-400">No guides assigned yet.</p>
                  ) : (
                    <div className="space-y-1.5">
                      {cohortTeachers.map(t => (
                        <div key={t.id} className="flex items-center gap-2 text-xs">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                            <GraduationCap size={12} />
                          </div>
                          <span className="text-slate-700 font-medium">{t.name}</span>
                          <span className="text-slate-400 text-[10px] truncate">{t.subject}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-slate-50 rounded-lg p-2.5 text-center">
                    <p className="text-lg font-bold text-slate-800">{scheduleCount}</p>
                    <p className="text-[10px] text-slate-400">Daily activities</p>
                  </div>
                  <div className={`rounded-lg p-2.5 text-center ${feeDueCount > 0 ? 'bg-red-50' : 'bg-emerald-50'}`}>
                    <p className={`text-lg font-bold ${feeDueCount > 0 ? 'text-red-600' : 'text-emerald-600'}`}>{feeDueCount}</p>
                    <p className={`text-[10px] ${feeDueCount > 0 ? 'text-red-400' : 'text-emerald-400'}`}>Fee due</p>
                  </div>
                </div>

                {feeDueCount > 0 && (
                  <div className="flex items-center gap-1.5 text-[11px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-2.5 py-2">
                    <AlertCircle size={13} />
                    {cohortStudents.filter(s => s.feeDue).map(s => s.name).join(', ')}
                  </div>
                )}
              </CardContent>

              <div className="p-4 bg-slate-50/40 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  <BookMarked size={13} /> Active cohort
                </span>
                <span className="text-xs text-slate-500 font-medium">{cohortStudents.length} enrolled</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
