import { Download, Printer, BarChart3, TrendingUp, Users, CalendarCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ClassPerformancePieChart, AttendanceAreaChart, EnrollmentLineChart } from '@/components/shared/Charts';
import { attendanceChartData, classPerformanceData, enrollmentChartData } from '@/data/mockData';

export const AdminReportsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Institution Performance Reports</h1>
          <p className="text-sm text-slate-500">School-wide academic metrics, exam standings, and enrollment evaluations</p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Printer size={15} /> Print Summary
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <Download size={15} /> Export Audit PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Campus Grade Distribution</CardTitle>
            <p className="text-xs text-slate-400">Term 1 overall performance breakdown across all classes</p>
          </CardHeader>
          <CardContent>
            <ClassPerformancePieChart data={classPerformanceData} height={240} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">School-Wide Attendance Volume</CardTitle>
            <p className="text-xs text-slate-400">Daily student presence numbers across campus</p>
          </CardHeader>
          <CardContent>
            <AttendanceAreaChart data={attendanceChartData} height={240} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold">Yearly Enrollment Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <EnrollmentLineChart data={enrollmentChartData} height={240} />
        </CardContent>
      </Card>
    </div>
  );
};
