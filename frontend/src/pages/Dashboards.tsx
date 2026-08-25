import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Building, BookOpen, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const dummyChartData = [
  { name: 'Mon', attendance: 95 },
  { name: 'Tue', attendance: 98 },
  { name: 'Wed', attendance: 92 },
  { name: 'Thu', attendance: 96 },
  { name: 'Fri', attendance: 94 },
];

export function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="Total Tenants" value="12" icon={Building} color="blue" />
        <StatCard title="Active Users" value="1,245" icon={Users} color="green" />
        <StatCard title="Platform Revenue" value="$4,500" icon={TrendingUp} color="purple" />
      </div>
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Platform Usage Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dummyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="attendance" stroke="#14b8a6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function SchoolAdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Students" value="342" icon={Users} color="blue" />
        <StatCard title="Total Staff" value="28" icon={Building} color="indigo" />
        <StatCard title="Avg Attendance" value="94%" icon={CheckCircle} color="green" />
        <StatCard title="Fees Due" value="$12,000" icon={AlertTriangle} color="red" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Recent Insights (AI Generated)</h3>
          <ul className="space-y-4">
            <li className="flex gap-3 text-surface-700 bg-surface-50 p-4 rounded-xl">
              <span className="text-brand-500">✨</span>
              <span>Overall attendance is slightly down this week. Consider sending a reminder to parents.</span>
            </li>
            <li className="flex gap-3 text-surface-700 bg-surface-50 p-4 rounded-xl">
              <span className="text-brand-500">✨</span>
              <span>15 students have outstanding fees from last month.</span>
            </li>
          </ul>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Attendance Trend</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dummyChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="attendance" stroke="#14b8a6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

export function TeacherDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard title="My Students" value="24" icon={Users} color="blue" />
        <StatCard title="Pending Observations" value="5" icon={BookOpen} color="yellow" />
        <StatCard title="Today's Attendance" value="96%" icon={CheckCircle} color="green" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Today's Lesson Plan</h3>
            <button className="text-sm text-brand-600 font-medium">View All</button>
          </div>
          <div className="space-y-3">
            <div className="p-4 rounded-xl border border-surface-100 flex justify-between items-center hover:bg-surface-50 cursor-pointer">
              <div>
                <h4 className="font-semibold text-surface-900">Sensory: Pink Tower</h4>
                <p className="text-sm text-surface-500">10:00 AM • 5 Students</p>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Planned</div>
            </div>
            <div className="p-4 rounded-xl border border-surface-100 flex justify-between items-center hover:bg-surface-50 cursor-pointer">
              <div>
                <h4 className="font-semibold text-surface-900">Math: Number Rods</h4>
                <p className="text-sm text-surface-500">11:30 AM • 8 Students</p>
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Planned</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Recent Observations</h3>
          <div className="text-center py-12 text-surface-500">
            No recent observations. <br/>
            <button className="mt-4 bg-brand-50 text-brand-700 px-4 py-2 rounded-lg font-medium hover:bg-brand-100">Log Observation</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ParentDashboard() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-white shadow-lg">
        <h2 className="text-2xl font-bold mb-2">Weekly Progress Digest</h2>
        <p className="opacity-90 mb-4 max-w-2xl">
          ✨ "Emma has shown great focus in practical life activities this week. She mastered the pouring exercise and has been very helpful to her peers. In math, she's beginning to understand the concept of tens using the golden beads."
        </p>
        <button className="bg-white text-brand-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-brand-50 transition-colors">View Full Report</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Milestones Reached</h3>
          <div className="space-y-3">
             <div className="flex items-center gap-4 p-3 rounded-xl border border-surface-100">
               <div className="w-10 h-10 bg-green-100 text-green-600 flex items-center justify-center rounded-lg">🏅</div>
               <div>
                 <h4 className="font-semibold">Mastered: Sandpaper Letters</h4>
                 <p className="text-xs text-surface-500">Language • 2 days ago</p>
               </div>
             </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
          <h3 className="text-lg font-bold mb-4">Recent Announcements</h3>
           <div className="p-4 bg-yellow-50 text-yellow-800 rounded-xl text-sm border border-yellow-100">
             <strong>Reminder:</strong> School will be closed this Friday for a Teacher Work Day.
           </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorMap[color] || 'bg-surface-100'}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-surface-500">{title}</p>
        <p className="text-2xl font-bold text-surface-900">{value}</p>
      </div>
    </div>
  );
}

export default function DashboardRouter() {
  const { user } = useAuth();

  if (!user) return null;

  switch (user.role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'SCHOOL_ADMIN':
      return <SchoolAdminDashboard />;
    case 'TEACHER':
      return <TeacherDashboard />;
    case 'PARENT':
    case 'STUDENT':
      return <ParentDashboard />;
    default:
      return <div>Unknown role</div>;
  }
}
