import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, Search, Edit, Trash2, Mail, Phone, User } from 'lucide-react';

interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  joinDate: string;
  status: 'active' | 'on-leave' | 'inactive';
}

const dummyStaff: StaffMember[] = [
  { id: '1', name: 'Sarah Johnson', email: 'sarah@school.edu', phone: '+1 555-0101', role: 'Lead Teacher', department: 'Primary', joinDate: '2024-01-15', status: 'active' },
  { id: '2', name: 'Michael Chen', email: 'michael@school.edu', phone: '+1 555-0102', role: 'Teacher', department: 'Toddler', joinDate: '2024-03-20', status: 'active' },
  { id: '3', name: 'Emily Davis', email: 'emily@school.edu', phone: '+1 555-0103', role: 'Assistant', department: 'Primary', joinDate: '2024-06-01', status: 'active' },
  { id: '4', name: 'James Wilson', email: 'james@school.edu', phone: '+1 555-0104', role: 'Teacher', department: 'Elementary', joinDate: '2023-09-01', status: 'on-leave' },
  { id: '5', name: 'Lisa Martinez', email: 'lisa@school.edu', phone: '+1 555-0105', role: 'Administrator', department: 'Admin', joinDate: '2023-01-10', status: 'active' },
  { id: '6', name: 'Robert Brown', email: 'robert@school.edu', phone: '+1 555-0106', role: 'Teacher', department: 'Primary', joinDate: '2025-01-05', status: 'inactive' },
];

export default function Staff() {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [staff] = useState<StaffMember[]>(dummyStaff);
  const [newStaff, setNewStaff] = useState({ name: '', email: '', phone: '', role: 'Teacher', department: 'Primary' });

  const filtered = staff.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.role.toLowerCase().includes(search.toLowerCase()) ||
    s.department.toLowerCase().includes(search.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-700',
    'on-leave': 'bg-yellow-100 text-yellow-700',
    inactive: 'bg-red-100 text-red-700',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Staff & HR</h1>
          <p className="text-surface-500 text-sm mt-1">Manage your school staff and teachers</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add Staff Member
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, role, or department..."
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-surface-200">
          <p className="text-2xl font-bold text-surface-900">{staff.length}</p>
          <p className="text-sm text-surface-500">Total Staff</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-surface-200">
          <p className="text-2xl font-bold text-green-600">{staff.filter(s => s.status === 'active').length}</p>
          <p className="text-sm text-surface-500">Active</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-surface-200">
          <p className="text-2xl font-bold text-yellow-600">{staff.filter(s => s.status === 'on-leave').length}</p>
          <p className="text-sm text-surface-500">On Leave</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-surface-200">
          <p className="text-2xl font-bold text-surface-400">{staff.filter(s => s.role === 'Teacher' || s.role === 'Lead Teacher').length}</p>
          <p className="text-sm text-surface-500">Teachers</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface-50 border-b border-surface-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Department</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Contact</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-surface-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {filtered.map(member => (
                <tr key={member.id} className="hover:bg-surface-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-sm">
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-semibold text-surface-900">{member.name}</p>
                        <p className="text-xs text-surface-500">Joined {member.joinDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-700">{member.role}</td>
                  <td className="px-6 py-4 text-sm text-surface-700">{member.department}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <a href={`mailto:${member.email}`} className="text-surface-400 hover:text-brand-600"><Mail className="w-4 h-4" /></a>
                      <a href={`tel:${member.phone}`} className="text-surface-400 hover:text-brand-600"><Phone className="w-4 h-4" /></a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[member.status]}`}>
                      {member.status.replace('-', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button className="p-2 rounded-lg hover:bg-surface-100 text-surface-400 hover:text-brand-600"><Edit className="w-4 h-4" /></button>
                      <button className="p-2 rounded-lg hover:bg-red-50 text-surface-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-bold mb-6">Add Staff Member</h3>
            <div className="space-y-4">
              <input type="text" placeholder="Full Name" value={newStaff.name} onChange={e => setNewStaff({...newStaff, name: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="email" placeholder="Email Address" value={newStaff.email} onChange={e => setNewStaff({...newStaff, email: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <input type="tel" placeholder="Phone Number" value={newStaff.phone} onChange={e => setNewStaff({...newStaff, phone: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              <select value={newStaff.role} onChange={e => setNewStaff({...newStaff, role: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="Teacher">Teacher</option>
                <option value="Lead Teacher">Lead Teacher</option>
                <option value="Assistant">Assistant</option>
                <option value="Administrator">Administrator</option>
              </select>
              <select value={newStaff.department} onChange={e => setNewStaff({...newStaff, department: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-surface-200 focus:outline-none focus:ring-2 focus:ring-brand-500">
                <option value="Toddler">Toddler</option>
                <option value="Primary">Primary</option>
                <option value="Elementary">Elementary</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl border border-surface-200 text-surface-700 font-semibold hover:bg-surface-50">Cancel</button>
              <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-3 rounded-xl bg-brand-500 text-white font-semibold hover:bg-brand-600">Add Member</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
