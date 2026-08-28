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
          <h1 className="text-2xl font-bold text-slate-800">My Academic Report Card</h1>
          <p className="text-sm text-slate-500">Official term performance metrics, subject breakdowns, and attendance summary</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Printer size={15} /> Print
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Download size={15} /> Download PDF
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <Card className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-0 shadow-sm">
        <CardContent className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-indigo-200 font-bold">Academic Transcript</span>
            <h2 className="text-2xl font-bold mt-1">{currentUser?.name}</h2>
            <p className="text-xs text-indigo-100 mt-0.5">
              {me?.class} • Roll No #{me?.rollNo} • Enrollment ID {me?.enrollmentId}
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-bold block">Best Grade</span>
              <span className="text-2xl font-black">{bestGrade ?? '—'}</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-bold block">Class Rank</span>
              <span className="text-2xl font-black">
                {classRank ? `#${classRank.pos} of ${classRank.total}` : '—'}
              </span>
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
          <h4 className="text-sm font-bold text-slate-800 mt-3">Attendance Summary</h4>
          <p className="text-xs text-slate-400 mt-1">
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
            <p className="text-xs text-slate-400 py-6 text-center">No evaluated milestones yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
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
                      <td className="p-3 font-semibold text-slate-800">{res.subject}</td>
                      <td className="p-3 text-slate-600">{res.testTitle}</td>
                      <td className="p-3 font-bold text-indigo-600">{res.marksObtained} / {res.maxMarks}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${getGradeColor(res.grade)}`}>
                          {res.grade}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 italic text-[11px]">{res.teacherComment || 'Satisfactory.'}</td>
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
