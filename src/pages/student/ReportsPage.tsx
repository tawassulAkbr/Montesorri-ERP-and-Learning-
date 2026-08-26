import { BarChart3, Download, Printer, Award, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TestScoreBarChart, RadialProgress } from '@/components/shared/Charts';
import { testResults, scoreChartData } from '@/data/mockData';
import { getGradeColor } from '@/lib/utils';

export const StudentReportsPage: React.FC = () => {
  const myResults = testResults.filter(r => r.studentId === 's1');

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
            <h2 className="text-2xl font-bold mt-1">Ali Hassan</h2>
            <p className="text-xs text-indigo-100 mt-0.5">
              Grade 5A • Roll No #01 • Enrollment ID STU-2024-001
            </p>
          </div>

          <div className="flex items-center gap-6 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl">
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-bold block">Term Standing</span>
              <span className="text-2xl font-black">Grade A+</span>
            </div>
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-bold block">Class Rank</span>
              <span className="text-2xl font-black">#2 of 24</span>
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
            <TestScoreBarChart data={scoreChartData} height={240} />
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <RadialProgress value={94} label="Roll Call" color="#10B981" />
          <h4 className="text-sm font-bold text-slate-800 mt-3">Exemplary Attendance</h4>
          <p className="text-xs text-slate-400 mt-1">28 days present, 1 day absent, 1 approved leave</p>
        </Card>
      </div>

      {/* Breakdown Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Detailed Exam & Assessment Records</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};
