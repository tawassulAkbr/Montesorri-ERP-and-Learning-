import { useMemo } from 'react';
import { Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClassPerformancePieChart, AttendanceAreaChart } from '@/components/shared/Charts';
import { useData } from '@/context/DataContext';
import { buildAttendanceChartData, buildClassPerformanceData, MONTESSORI_CLASSES } from '@/lib/utils';

export const AdminReportsPage: React.FC = () => {
  const { attendance, testResults, students } = useData();

  const attendanceChart = useMemo(() => buildAttendanceChartData(attendance), [attendance]);
  const performanceChart = useMemo(() => buildClassPerformanceData(testResults), [testResults]);
  const classDistribution = useMemo(() => MONTESSORI_CLASSES.map(cls => ({
    month: cls.split(' (')[0].replace('Montessori', '').trim() || cls,
    students: students.filter(s => s.class === cls).length,
  })), [students]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">Institution Performance Reports</h1>
          <p className="text-sm text-[#667085]">School-wide academic metrics, milestone standings, and enrollment overview</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => window.print()}>
            <Printer size={15} /> Print Summary
          </Button>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => window.print()}>
            <Download size={15} /> Export PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Milestone Grade Distribution</CardTitle>
            <p className="text-xs text-[#667085]">Overall performance breakdown across all evaluated milestones</p>
          </CardHeader>
          <CardContent>
            <ClassPerformancePieChart data={performanceChart} height={240} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">School-Wide Attendance Volume</CardTitle>
            <p className="text-xs text-[#667085]">Daily student presence numbers across campus (30 days)</p>
          </CardHeader>
          <CardContent>
            <AttendanceAreaChart data={attendanceChart} height={240} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Enrollment by Class</CardTitle>
          <p className="text-xs text-[#667085]">Current student distribution across Montessori cohorts</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {classDistribution.map(item => (
              <div key={item.month} className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-center">
                <p className="text-2xl font-bold text-[#006B5D]">{item.students}</p>
                <p className="text-xs font-semibold text-[#344054] mt-1">{item.month}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
