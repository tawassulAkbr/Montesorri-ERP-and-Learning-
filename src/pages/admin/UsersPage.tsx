import { useState } from 'react';
import { Users, Plus, Search, Filter, MoreHorizontal, UserCheck, Trash2, Edit2, ShieldCheck, Heart, BookOpen, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { teachers, students, parents } from '@/data/mockData';
import type { Role } from '@/types';

export const AdminUsersPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Role>('teacher');
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddModal, setOpenAddModal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [extra, setExtra] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`User ${name} successfully created as ${activeTab}!`);
    setOpenAddModal(false);
    setName('');
    setEmail('');
    setPhone('');
    setExtra('');
  };

  const getList = () => {
    switch (activeTab) {
      case 'teacher':
        return teachers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.email.includes(searchQuery));
      case 'student':
        return students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.rollNo.includes(searchQuery));
      case 'parent':
        return parents.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.email.includes(searchQuery));
      default:
        return [];
    }
  };

  const list = getList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">User Management Directory</h1>
          <p className="text-sm text-slate-500">Manage teacher faculty, student enrollments, and parent guardian accounts</p>
        </div>

        <Button onClick={() => setOpenAddModal(true)} className="gap-2 shadow-sm">
          <Plus size={16} /> Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
        </Button>
      </div>

      {/* Role Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'teacher', label: `Teachers (${teachers.length})`, icon: <GraduationCap size={15} /> },
          { id: 'student', label: `Students (${students.length})`, icon: <BookOpen size={15} /> },
          { id: 'parent', label: `Parents (${parents.length})`, icon: <Heart size={15} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Role)}
            className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm flex items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={`Search ${activeTab}s by name or email...`}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-medium border-b border-slate-100">
              <tr>
                <th className="p-3.5 pl-5">User</th>
                <th className="p-3.5">Email</th>
                {activeTab === 'teacher' && <th className="p-3.5">Subject</th>}
                {activeTab === 'teacher' && <th className="p-3.5">Assigned Classes</th>}
                {activeTab === 'student' && <th className="p-3.5">Roll No</th>}
                {activeTab === 'student' && <th className="p-3.5">Class</th>}
                {activeTab === 'parent' && <th className="p-3.5">Contact Phone</th>}
                {activeTab === 'parent' && <th className="p-3.5">Linked Children</th>}
                <th className="p-3.5">Status</th>
                <th className="p-3.5 pr-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((u: any) => (
                <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 pl-5 font-semibold text-slate-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-[10px]">
                      {u.name.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <span>{u.name}</span>
                  </td>
                  <td className="p-3.5 text-slate-500 font-mono text-[11px]">{u.email}</td>

                  {activeTab === 'teacher' && (
                    <td className="p-3.5">
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                        {u.subject}
                      </Badge>
                    </td>
                  )}
                  {activeTab === 'teacher' && (
                    <td className="p-3.5 text-slate-600">{u.classes?.join(', ')}</td>
                  )}

                  {activeTab === 'student' && (
                    <td className="p-3.5 text-slate-700 font-mono">#{u.rollNo}</td>
                  )}
                  {activeTab === 'student' && (
                    <td className="p-3.5 text-slate-600">{u.class}</td>
                  )}

                  {activeTab === 'parent' && (
                    <td className="p-3.5 text-slate-600">{u.phone}</td>
                  )}
                  {activeTab === 'parent' && (
                    <td className="p-3.5 text-slate-600">{u.childrenIds?.length || 0} students</td>
                  )}

                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">
                      Active
                    </span>
                  </td>

                  <td className="p-3.5 pr-5 text-right space-x-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-indigo-600">
                      <Edit2 size={13} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-600">
                      <Trash2 size={13} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Dialog open={openAddModal} onOpenChange={setOpenAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddUser} className="space-y-4">
            <div>
              <Label className="text-xs font-medium text-slate-600">Full Name</Label>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">Email Address</Label>
              <Input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="john.doe@kinderguide.edu"
                className="mt-1 text-xs"
                required
              />
            </div>

            <div>
              <Label className="text-xs font-medium text-slate-600">Phone Number</Label>
              <Input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+92 300 0000000"
                className="mt-1 text-xs"
              />
            </div>

            {activeTab === 'teacher' && (
              <div>
                <Label className="text-xs font-medium text-slate-600">Primary Subject</Label>
                <select
                  value={extra}
                  onChange={e => setExtra(e.target.value)}
                  className="w-full mt-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>Mathematics</option>
                  <option>Science</option>
                  <option>English</option>
                  <option>Arabic</option>
                  <option>Art & Craft</option>
                </select>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setOpenAddModal(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
