import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Download, Printer, Search, ArrowUpRight, Award, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestScoreBarChart } from '@/components/shared/Charts';
import { useData } from '@/context/DataContext';
import { buildScoreChartData, getGradeColor } from '@/lib/utils';

export const ReportsPage: React.FC = () => {
  const { students, testResults } = useData();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedStudent = students.find(s => s.id === selectedStudentId) || students[0];

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.includes(searchQuery)
  );

  const studentResults = testResults.filter(r => r.studentId === selectedStudent?.id);
  const scoreChart = useMemo(
    () => buildScoreChartData(testResults, selectedStudent?.id),
    [testResults, selectedStudent?.id]
  );

  if (!selectedStudent) {
    return (
      <div className="p-10 text-center bg-white rounded-2xl border border-slate-100">
        <p className="text-sm font-semibold text-slate-700">No students enrolled yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Student Reports & Evaluation</h1>
          <p className="text-sm text-slate-500">Analyze test metrics, exam grade breakdowns, and generate student evaluation cards</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Printer size={15} /> Print Report
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Download size={15} /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Students List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Select Student</CardTitle>
            <div className="pt-2">
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by student name or roll..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto divide-y divide-slate-100 p-0 px-4">
            {filteredStudents.map(student => (
              <button
                key={student.id}
                onClick={() => setSelectedStudentId(student.id)}
                className={`w-full py-3 px-2 flex items-center justify-between text-left rounded-lg transition-colors ${
                  selectedStudent.id === student.id
                    ? 'bg-indigo-50/80 text-indigo-700'
                    : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <p className="text-xs font-semibold">{student.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">{student.class} • Roll #{student.rollNo}</p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-white">
                  Report Card
                </Badge>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Right: Selected Student Evaluation */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Profile Overview Card */}
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0 shadow-sm">
            <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-indigo-100 font-bold">Academic Evaluation</span>
                <h2 className="text-2xl font-bold mt-1">{selectedStudent.name}</h2>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Class: {selectedStudent.class} • Roll No: {selectedStudent.rollNo} • ID: {selectedStudent.enrollmentId}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl">
                <div>
                  <span className="text-[10px] text-indigo-100 uppercase font-bold block">Overall Standing</span>
                  <span className="text-xl font-bold">Grade A</span>
                </div>
                <Award className="text-amber-300" size={28} />
              </div>
            </CardContent>
          </Card>

          {/* Subject Performance Chart */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Subject-Wise Performance (vs Class Average)</CardTitle>
            </CardHeader>
            <CardContent>
              <TestScoreBarChart data={scoreChart} height={200} />
            </CardContent>
          </Card>

          {/* Test Scores Table */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">Exam & Test History</CardTitle>
            </CardHeader>
            <CardContent>
              {studentResults.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recorded test results for this student yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
                      <tr>
                        <th className="p-2.5">Test Title</th>
                        <th className="p-2.5">Subject</th>
                        <th className="p-2.5">Score</th>
                        <th className="p-2.5">Grade</th>
                        <th className="p-2.5">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {studentResults.map(res => (
                        <tr key={res.id}>
                          <td className="p-2.5 font-semibold text-slate-800">{res.testTitle}</td>
                          <td className="p-2.5 text-slate-600">{res.subject}</td>
                          <td className="p-2.5 font-bold text-indigo-600">{res.marksObtained} / {res.maxMarks}</td>
                          <td className="p-2.5">
                            <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${getGradeColor(res.grade)}`}>
                              {res.grade}
                            </span>
                          </td>
                          <td className="p-2.5 text-slate-500 italic text-[11px]">{res.teacherComment || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
