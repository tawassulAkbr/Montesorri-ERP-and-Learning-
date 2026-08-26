import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, GraduationCap, Heart, BookMarked, TrendingUp, UserPlus, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { StatCard } from '@/components/shared/StatCard';
import { EnrollmentLineChart, AttendanceAreaChart } from '@/components/shared/Charts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  teachers,
  students,
  parents,
  attendanceChartData,
  enrollmentChartData,
  notifications,
} from '@/data/mockData';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Administrator Console</h1>
          <p className="text-sm text-slate-500">School-wide institution metrics, user administration, and system health</p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin/users">
            <Button size="sm" className="gap-1.5 shadow-sm">
              <UserPlus size={15} /> Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Teachers"
          value={teachers.length}
          subtitle="Active faculty staff"
          icon={<GraduationCap className="text-indigo-600" size={20} />}
          iconBg="bg-indigo-50"
        />
        <StatCard
          title="Total Students"
          value={students.length}
          subtitle="Enrolled across grades"
          icon={<Users className="text-emerald-600" size={20} />}
          trend={12}
          iconBg="bg-emerald-50"
        />
        <StatCard
          title="Registered Parents"
          value={parents.length}
          subtitle="Connected guardians"
          icon={<Heart className="text-sky-600" size={20} />}
          trend={8}
          iconBg="bg-sky-50"
        />
        <StatCard
          title="Active Classes"
          value="4"
          subtitle="Grade 5A, 5B, 6A, 6B"
          icon={<BookMarked className="text-violet-600" size={20} />}
          iconBg="bg-violet-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enrollment Trend */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Annual Student Enrollment Trend</CardTitle>
            <p className="text-xs text-slate-400">Total registered student count over the last 12 months</p>
          </CardHeader>
          <CardContent>
            <EnrollmentLineChart data={enrollmentChartData} height={240} />
          </CardContent>
        </Card>

        {/* Institution Attendance */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">School Attendance Rate (30 Days)</CardTitle>
            <p className="text-xs text-slate-400">Campus daily present vs absent count</p>
          </CardHeader>
          <CardContent>
            <AttendanceAreaChart data={attendanceChartData} height={240} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Log & Quick Admin Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold">System Audit & Activity Feed</CardTitle>
            <Badge variant="outline" className="text-xs">Live Logs</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {notifications.map(n => (
              <div key={n.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{n.message}</p>
                </div>
                <span className="text-[10px] text-slate-400">{n.createdAt.split('T')[0]}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Quick Links */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Administrative Shortcuts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2.5">
            <Link to="/admin/users" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-800 block">Manage Users Directory</span>
              <span className="text-[11px] text-slate-400">Create, edit, or deactivate accounts</span>
            </Link>
            <Link to="/admin/classes" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-800 block">Class Sections & Curriculum</span>
              <span className="text-[11px] text-slate-400">Assign teachers and manage schedules</span>
            </Link>
            <Link to="/admin/reports" className="block p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
              <span className="text-xs font-bold text-slate-800 block">Campus Performance Reports</span>
              <span className="text-[11px] text-slate-400">Analyze overall academic standings</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
