import { useMemo } from 'react';
import { BarChart3, Download, Printer, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TestScoreBarChart, RadialProgress } from '@/components/shared/Charts';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/hooks/useAuth';
import { buildScoreChartData, getGradeColor } from '@/lib/utils';

const GRADE_ORDER = ['A+', 'A', 'B', 'C', 'D', 'F'];

export const StudentReportsPage: React.FC = () => {
  const { testResults, attendance, students } = useData();
  const { currentUser } = useAuth();
  const me = students.find(s => s.id === currentUser?.id);

  const myResults = testResults.filter(r => r.studentId === currentUser?.id);

  const scoreChart = useMemo(() => buildScoreChartData(testResults, currentUser?.id), [testResults, currentUser?.id]);

  const myAttendance = attendance.filter(a => a.studentId === currentUser?.id);
  const presentDays = myAttendance.filter(a => a.status === 'present').length;
  const absentDays = myAttendance.filter(a => a.status === 'absent').length;
  const leaveDays = myAttendance.filter(a => a.status === 'leave').length;
  const attendanceRate = myAttendance.length ? Math.round((presentDays / myAttendance.length) * 100) : 100;

  const bestGrade = myResults.length
    ? [...myResults].sort((a, b) => GRADE_ORDER.indexOf(a.grade) - GRADE_ORDER.indexOf(b.grade))[0].grade
    : null;

  const classRank = useMemo(() => {
    if (!me) return null;
    const classmates = students.filter(s => s.class === me.class);
    const averages = classmates
      .map(s => {
        const results = testResults.filter(r => r.studentId === s.id);
        if (results.length === 0) return { id: s.id, avg: -1 };
        const avg = results.reduce((sum, r) => sum + (r.marksObtained / r.maxMarks) * 100, 0) / results.length;
        return { id: s.id, avg };
      })
      .filter(e => e.avg >= 0)
      .sort((a, b) => b.avg - a.avg);
    const pos = averages.findIndex(e => e.id === currentUser?.id);
    return pos >= 0 ? { pos: pos + 1, total: averages.length } : null;
  }, [me, students, testResults, currentUser?.id]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">My Academic Report Card</h1>
          <p className="text-sm text-[#667085]">Official term performance metrics, subject breakdowns, and attendance summary</p>
        </div>

        <div className="no-print flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.print()}>
            <Printer size={15} /> Print Report
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => window.print()}>
            <Download size={15} /> Export PDF
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-[#013A33] via-[#006B5D] to-[#0A8B7A] text-white shadow-lg">
        {/* Decorative pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', backgroundSize: '28px 28px' }}
        />
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-[#FBBF24]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 -bottom-10 h-44 w-44 rounded-full bg-white/10 blur-2xl" />

        <CardContent className="relative z-10 p-7 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.18em] text-[#FBBF24] font-extrabold mb-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#FBBF24]" />
              Academic Evaluation · {new Date().getFullYear()}
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mt-1">
              {currentUser?.name}
            </h2>
            <p className="text-[13px] text-emerald-50/80 mt-2.5 font-medium leading-relaxed">
              <span className="inline-block">{me?.class}</span>
              <span className="mx-1.5 text-emerald-50/40">•</span>
              <span className="inline-block">Roll No {me?.rollNo}</span>
              <span className="mx-1.5 text-emerald-50/40">•</span>
              <span className="inline-block font-mono tracking-wide">{me?.enrollmentId}</span>
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-white/10 px-5 py-3.5 backdrop-blur-md shadow-inner">
            <div>
              <span className="text-[10px] text-emerald-50/70 uppercase tracking-[0.16em] font-bold block mb-1">Overall Standing</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-[11px] text-emerald-50/60 font-bold">Grade</span>
                <span className="text-4xl font-black leading-none tracking-tight text-white">{bestGrade ?? '—'}</span>
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#FBBF24] text-[#013A33] shadow-md">
              <Award size={24} strokeWidth={2.5} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Subject Evaluation vs Class Average</CardTitle>
          </CardHeader>
          <CardContent>
            <TestScoreBarChart data={scoreChart} height={240} />
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <RadialProgress value={attendanceRate} label="Roll Call" color="#10B981" />
          <h4 className="text-sm font-bold text-[#101828] mt-3">Attendance Summary</h4>
          <p className="text-xs text-[#667085] mt-1">
            {presentDays} days present, {absentDays} absent, {leaveDays} approved leave
          </p>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Detailed Exam & Assessment Records</CardTitle>
        </CardHeader>
        <CardContent>
          {myResults.length === 0 ? (
            <p className="text-xs text-[#667085] py-6 text-center">No evaluated milestones yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-[#667085] font-medium border-b border-slate-100">
                  <tr>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Assessment Title</th>
                    <th className="p-3">Score</th>
                    <th className="p-3">Grade</th>
                    <th className="p-3">Teacher Evaluation Comments</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myResults.map(res => (
                    <tr key={res.id}>
                      <td className="p-3 font-semibold text-[#101828]">{res.subject}</td>
                      <td className="p-3 text-[#344054]">{res.testTitle}</td>
                      <td className="p-3 font-bold text-[#006B5D]">{res.marksObtained} / {res.maxMarks}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${getGradeColor(res.grade)}`}>
                          {res.grade}
                        </span>
                      </td>
                      <td className="p-3 text-[#667085] italic text-[11px]">{res.teacherComment || 'Satisfactory.'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
