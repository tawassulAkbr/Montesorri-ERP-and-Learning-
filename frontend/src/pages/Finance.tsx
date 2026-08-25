import React, { useState } from 'react';
import { DollarSign, Download, Filter, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const monthlyData = [
  { month: 'Jan', collected: 12000, pending: 3000 },
  { month: 'Feb', collected: 14500, pending: 2000 },
  { month: 'Mar', collected: 13000, pending: 4000 },
  { month: 'Apr', collected: 15000, pending: 1500 },
  { month: 'May', collected: 14000, pending: 2500 },
  { month: 'Jun', collected: 11000, pending: 5000 },
];

interface FeeRecord {
  id: string;
  student: string;
  parent: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'pending' | 'overdue';
  month: string;
}

const feeRecords: FeeRecord[] = [
  { id: '1', student: 'Emma Thompson', parent: 'Laura Thompson', amount: 850, dueDate: '2026-08-01', status: 'paid', month: 'August' },
  { id: '2', student: 'Liam Garcia', parent: 'Maria Garcia', amount: 850, dueDate: '2026-08-01', status: 'paid', month: 'August' },
  { id: '3', student: 'Sophia Patel', parent: 'Raj Patel', amount: 850, dueDate: '2026-08-01', status: 'pending', month: 'August' },
  { id: '4', student: 'Noah Kim', parent: 'Soo Kim', amount: 950, dueDate: '2026-08-01', status: 'overdue', month: 'August' },
  { id: '5', student: 'Ava Williams', parent: 'Jessica Williams', amount: 750, dueDate: '2026-08-01', status: 'paid', month: 'August' },
  { id: '6', student: 'Oliver Johnson', parent: 'Mark Johnson', amount: 850, dueDate: '2026-08-01', status: 'pending', month: 'August' },
  { id: '7', student: 'Isabella Lee', parent: 'David Lee', amount: 850, dueDate: '2026-07-01', status: 'overdue', month: 'July' },
  { id: '8', student: 'Ethan Brown', parent: 'Amy Brown', amount: 950, dueDate: '2026-08-01', status: 'paid', month: 'August' },
];

export default function Finance() {
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = feeRecords.filter(f => statusFilter === 'all' || f.status === statusFilter);

  const totalCollected = feeRecords.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
  const totalPending = feeRecords.filter(f => f.status === 'pending').reduce((sum, f) => sum + f.amount, 0);
  const totalOverdue = feeRecords.filter(f => f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);

  const statusColors: Record<string, string> = {
    paid: 'bg-green-100 text-green-700',
    pending: 'bg-yellow-100 text-yellow-700',
    overdue: 'bg-red-100 text-red-700',
  };

  const statusIcons: Record<string, typeof CheckCircle> = {
    paid: CheckCircle,
    pending: Clock,
    overdue: AlertTriangle,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Fees & Finance</h1>
          <p className="text-surface-500 text-sm mt-1">Track fee collection and outstanding payments</p>
        </div>
        <button className="bg-surface-900 hover:bg-black text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm">
          <Download className="w-4 h-4" /> Export Report
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <DollarSign className="w-6 h-6 opacity-80" />
            <span className="text-green-100 font-medium">Collected</span>
          </div>
          <p className="text-3xl font-bold">${totalCollected.toLocaleString()}</p>
          <p className="text-green-200 text-sm mt-1">{feeRecords.filter(f => f.status === 'paid').length} payments</p>
        </div>
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 opacity-80" />
            <span className="text-yellow-100 font-medium">Pending</span>
          </div>
          <p className="text-3xl font-bold">${totalPending.toLocaleString()}</p>
          <p className="text-yellow-200 text-sm mt-1">{feeRecords.filter(f => f.status === 'pending').length} invoices</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 text-white p-6 rounded-2xl shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <AlertTriangle className="w-6 h-6 opacity-80" />
            <span className="text-red-100 font-medium">Overdue</span>
          </div>
          <p className="text-3xl font-bold">${totalOverdue.toLocaleString()}</p>
          <p className="text-red-200 text-sm mt-1">{feeRecords.filter(f => f.status === 'overdue').length} overdue</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-2xl border border-surface-200 shadow-sm">
        <h3 className="text-lg font-bold mb-4">Monthly Collection Overview</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="collected" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filter & Table */}
      <div className="flex gap-2 items-center">
        <Filter className="w-4 h-4 text-surface-400" />
        {['all', 'paid', 'pending', 'overdue'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${statusFilter === s ? 'bg-brand-500 text-white' : 'bg-white border border-surface-200 text-surface-600 hover:bg-surface-50'}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-surface-50 border-b border-surface-200">
            <tr>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Student</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Parent</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Amount</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Month</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Due Date</th>
              <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {filtered.map(record => {
              const StatusIcon = statusIcons[record.status];
              return (
                <tr key={record.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-surface-900">{record.student}</td>
                  <td className="px-6 py-4 text-sm text-surface-600">{record.parent}</td>
                  <td className="px-6 py-4 font-bold text-surface-900">${record.amount}</td>
                  <td className="px-6 py-4 text-sm text-surface-600">{record.month}</td>
                  <td className="px-6 py-4 text-sm text-surface-600">{record.dueDate}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[record.status]}`}>
                      <StatusIcon className="w-3.5 h-3.5" />
                      {record.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
