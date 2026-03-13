import React, { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { getAllEmployees } from '../../api/users.ts';
import {
  getNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
} from '../../api/notifications.ts';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-white rounded-[32px] w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-black">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <Icon name="X" className="w-6 h-6 text-black" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};

const NotificationsAdmin: React.FC = () => {
  interface Notification {
    id: number;
    title: string;
    message: string;
    targetSelection: 'GLOBAL' | 'TARGET';
    priority: 'NORMAL' | 'HIGH' | 'URGENT';
    active: boolean;
    createdAt: string;
    employeeCount: number;
  }

  interface Employee {
    id: string;
    employeeId: string;
    fullName: string;
    email?: string;
    department?: string;
    avatar?: string;
  }

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: '',
    message: '',
    targetSelection: 'GLOBAL',
    employeeIds: [],
    priority: 'NORMAL',
  });

  const notify = (msg: string, type: 'success' | 'error' | 'warning' = 'success') => {
    console.log(`[${type.toUpperCase()}] ${msg}`);
  };

  useEffect(() => {
    fetchNotifications();
    fetchEmployees();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notify(err?.message || 'Failed to fetch notifications', 'error');
      setNotifications([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notify(err?.message || 'Failed to fetch employees', 'error');
      setEmployees([]);
    }
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [notifications, searchTerm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      (e.fullName || '').toLowerCase().includes(empSearch.toLowerCase()) ||
      (e.employeeId || '').toLowerCase().includes(empSearch.toLowerCase())
    );
  }, [employees, empSearch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.message?.trim()) {
      notify('Title and message are required.', 'warning');
      return;
    }

    if (formData.targetSelection === 'TARGET' && (!formData.employeeIds || formData.employeeIds.length === 0)) {
      notify('Please select at least one employee.', 'warning');
      return;
    }

    setIsLoading(true);
    try {
      const payload: any = {
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        targetSelection: formData.targetSelection,
      };

      if (formData.targetSelection === 'TARGET') {
        payload.employeeIds = formData.employeeIds;
      }

      if (editingId) {
        await updateNotification(editingId, payload);
      } else {
        await createNotification(payload);
      }

      setIsModalOpen(false);
      resetForm();
      await fetchNotifications();
    } catch (err: any) {
      notify(err?.message || 'Failed to save notification', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      message: '',
      targetSelection: 'GLOBAL',
      employeeIds: [],
      priority: 'NORMAL',
    });
    setEmpSearch('');
  };

  const handleEdit = (n: Notification) => {
    setEditingId(n.id);
    setFormData({
      title: n.title,
      message: n.message,
      targetSelection: n.targetSelection,
      employeeIds: [],
      priority: n.priority,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (n: Notification) => {
    if (!window.confirm(`Delete "${n.title}"?`)) return;
    try {
      await deleteNotification(n.id);
      await fetchNotifications();
    } catch (err: any) {
      notify(err?.message || 'Failed to delete notification', 'error');
    }
  };

  const toggleEmployeeSelection = (id: string) => {
    setFormData(prev => {
      const current = prev.employeeIds || [];
      const next = current.includes(id)
        ? current.filter(cid => cid !== id)
        : [...current, id];
      return { ...prev, employeeIds: next };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Broadcast Management</h1>
          <p className="text-black text-sm font-medium">Coordinate system alerts and targeted messages to specific segments.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3.5 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          style={{backgroundColor: '#c97a4c', boxShadow: 'rgba(201, 122, 76, 0.2) 0px 20px 25px -5px'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
        >
          <Icon name="Plus" className="w-5 h-5 text-white" /> Post Announcement
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 group w-full">
            <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black group-focus-within:text-indigo-500 transition-colors" />
            <input
              aria-label="Search historical broadcasts"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search historical broadcasts..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-black placeholder:text-slate-400 shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-50">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 sticky top-0 z-10">
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.2em]">Context</th>
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.2em]">Deployment</th>
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.2em] text-center">Priority</th>
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.2em] text-center">Audience</th>
                <th className="px-8 py-5 text-[10px] font-black text-black uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
          </table>
          <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
            <table className="w-full text-left">
              <tbody className="divide-y divide-slate-50">
                {filteredNotifications.length > 0 ? filteredNotifications.map(n => (
                  <tr key={n.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="max-w-xs">
                        <p className="text-sm font-black text-black truncate">{n.title}</p>
                        <div
                          className="text-xs text-black line-clamp-1 mt-1 prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{ __html: n.message }}
                        />
                        <p className="text-[9px] font-bold text-black uppercase mt-1.5">{n.createdAt}</p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${n.targetSelection === 'GLOBAL' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                          }`}>
                          {n.targetSelection === 'GLOBAL' ? 'Global' : 'Selected'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${n.priority === 'URGENT' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                        n.priority === 'HIGH' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-slate-50 text-black border-slate-100'
                        }`}>
                        {n.priority}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-xs font-black text-black">{n.targetSelection === 'GLOBAL' ? 'All Staff' : `${n.employeeCount} Targeted`}</span>
                        <span className="text-[9px] font-bold text-black uppercase tracking-tighter">{n.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button aria-label={`Edit notification ${n.title}`} onClick={() => handleEdit(n)} className="p-2 text-black hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent transition-all"><Icon name="Edit3" className="w-4 h-4" /></button>
                        <button aria-label={`Delete notification ${n.title}`} onClick={() => handleDelete(n)} className="p-2 text-black hover:text-rose-500 hover:bg-white rounded-xl shadow-sm border border-transparent transition-all"><Icon name="Trash2" className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                        <Icon name="BellOff" className="w-10 h-10 text-black" />
                      </div>
                      <p className="text-black font-black uppercase text-xs tracking-widest">Zero historical broadcasts found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Update Directive" : "New Broadcast"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Announcement Header</label>
            <input
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-black placeholder:text-slate-400 shadow-inner"
              placeholder="Brief summary of the update"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Comprehensive Message</label>
            <textarea
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-black min-h-[100px] placeholder:text-slate-400 shadow-inner"
              placeholder="Detailed description, instructions, or news..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Deployment Scope</label>
              <div className="flex gap-2">
                {(['GLOBAL', 'TARGET'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, targetSelection: type, employeeIds: [] })}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.targetSelection === type ? 'text-white shadow-lg' : 'bg-white border-slate-100 text-black hover:bg-slate-50'}`}
                    style={formData.targetSelection === type ? { backgroundColor: '#c97a4c', borderColor: '#c97a4c' } : {}}
                    
                  >
                    {type === 'GLOBAL' ? 'Global Staff' : 'Target Selection'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Criticality Level</label>
              <div className="flex gap-2">
                {(['NORMAL', 'HIGH', 'URGENT'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.priority === p ? 'text-white shadow-lg' : 'bg-white border-slate-100 text-black hover:bg-slate-50'}`}
                    style={formData.priority === p ? { backgroundColor: '#c97a4c', borderColor: '#c97a4c' } : {}}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {formData.targetSelection === 'TARGET' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Audience Targeting</label>
                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-lg">{formData.employeeIds?.length} Selected</span>
              </div>
              <div className="relative group">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <input
                  type="text"
                  placeholder="Search personal..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold text-black placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                />
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 max-h-[180px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {filteredEmployees.map(emp => {
                  const isSelected = formData.employeeIds?.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployeeSelection(emp.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} className="w-8 h-8 rounded-lg shadow-sm border border-white" alt={`${emp.fullName} avatar`} />
                        <div>
                          <p className="text-xs font-black text-black leading-none">{emp.fullName}</p>
                          <p className="text-[9px] font-bold text-black uppercase tracking-tighter mt-1">{emp.employeeId} • {emp.department}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'}`}>
                        <Icon name="Check" className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} disabled={isLoading} className="flex-1 py-4 text-black font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50">Discard</button>
            <button type="submit" disabled={isLoading} className="flex-1 py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 disabled:opacity-50" style={{backgroundColor: '#c97a4c', boxShadow: 'rgba(201, 122, 76, 0.2) 0px 20px 25px -5px'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}>
              {isLoading ? 'Saving...' : editingId ? "Update System Alert" : "Commit Announcement"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationsAdmin;