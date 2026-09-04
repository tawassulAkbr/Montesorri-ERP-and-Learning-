import { useMemo, useState } from 'react';
import { Banknote, CalendarCheck, Download, Plus, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { StatCard } from '@/components/shared/StatCard';
import { useData } from '@/context/DataContext';
import { formatPKR, todayISO } from '@/lib/utils';

type SalaryMap = Record<string, number>;
type PayrollRun = { id: string; month: string; gross: number; deductions: number; net: number; staff: number };

const salaryKey = 'kg_hr_salary';
const payrollKey = 'kg_hr_payroll';

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) as T : fallback;
  } catch {
    return fallback;
  }
};

export const HrPayrollPage: React.FC = () => {
  const { teachers, teacherAttendance, leaveRequests } = useData();
  const [salary, setSalary] = useState<SalaryMap>(() => readJson(salaryKey, {}));
  const [runs, setRuns] = useState<PayrollRun[]>(() => readJson(payrollKey, []));
  const [month, setMonth] = useState(() => todayISO().slice(0, 7));

  const saveSalary = (id: string, value: string) => {
    const next = { ...salary, [id]: Math.max(0, Number(value) || 0) };
    setSalary(next);
    localStorage.setItem(salaryKey, JSON.stringify(next));
  };

  const rows = useMemo(() => teachers.map(t => {
    const records = teacherAttendance.filter(a => a.teacherId === t.id && a.date.startsWith(month));
    const leaves = records.filter(r => r.status === 'leave').length;
    const absent = records.filter(r => r.status === 'absent').length;
    const gross = salary[t.id] ?? 0;
    const deduction = Math.round((gross / 26) * absent);
    return { teacher: t, gross, leaves, absent, deduction, net: Math.max(0, gross - deduction) };
  }), [teachers, teacherAttendance, salary, month]);

  const pendingLeaves = leaveRequests.filter(l => l.kind === 'teacher' && l.status === 'pending').length;
  const gross = rows.reduce((s, r) => s + r.gross, 0);
  const deductions = rows.reduce((s, r) => s + r.deduction, 0);
  const net = gross - deductions;

  const generatePayroll = () => {
    const run = { id: `pay-${Date.now()}`, month, gross, deductions, net, staff: rows.length };
    const next = [run, ...runs].slice(0, 12);
    setRuns(next);
    localStorage.setItem(payrollKey, JSON.stringify(next));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#101828]">HR & Payroll</h1>
          <p className="text-sm text-[#667085]">Staff salary setup, attendance deductions, leave visibility, and payroll runs.</p>
        </div>
        <div className="flex items-center gap-2">
          <Input type="month" value={month} onChange={e => setMonth(e.target.value)} className="w-40" />
          <Button onClick={generatePayroll} className="gap-2"><Download size={15} /> Generate</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Active Staff" value={String(teachers.filter(t => t.status !== 'resigned').length)} subtitle={`${teachers.length} total records`} icon={<Users size={20} className="text-[#006B5D]" />} />
        <StatCard title="Monthly Gross" value={formatPKR(gross)} subtitle={month} icon={<Banknote size={20} className="text-[#006B5D]" />} />
        <StatCard title="Deductions" value={formatPKR(deductions)} subtitle="Attendance based" icon={<CalendarCheck size={20} className="text-red-600" />} iconBg="bg-red-50" />
        <StatCard title="Pending Leaves" value={String(pendingLeaves)} subtitle="Teacher requests" icon={<Plus size={20} className="text-[#006B5D]" />} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Salary Structure</CardTitle></CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-slate-50 text-[#667085]">
              <tr><th className="p-3 pl-5">Staff</th><th className="p-3">Status</th><th className="p-3">Leaves</th><th className="p-3">Absent</th><th className="p-3">Gross</th><th className="p-3 text-right pr-5">Net Pay</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map(r => (
                <tr key={r.teacher.id}>
                  <td className="p-3 pl-5"><p className="font-semibold text-[#101828]">{r.teacher.name}</p><p className="text-[10px] text-[#667085]">{r.teacher.subject}</p></td>
                  <td className="p-3"><Badge variant="outline">{r.teacher.status ?? 'active'}</Badge></td>
                  <td className="p-3">{r.leaves}</td>
                  <td className="p-3 text-red-600">{r.absent}</td>
                  <td className="p-3"><Label className="sr-only">Salary</Label><Input type="number" min={0} value={r.gross || ''} onChange={e => saveSalary(r.teacher.id, e.target.value)} className="w-28 text-xs" /></td>
                  <td className="p-3 pr-5 text-right font-mono font-bold text-[#006B5D]">{formatPKR(r.net)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Payroll Runs</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {runs.length === 0 ? <p className="py-4 text-center text-xs text-[#98A2B3]">No payroll generated yet.</p> : runs.map(r => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs">
              <span className="font-semibold text-[#344054]">{r.month} - {r.staff} staff</span>
              <span className="font-mono text-[#006B5D]">{formatPKR(r.net)}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
