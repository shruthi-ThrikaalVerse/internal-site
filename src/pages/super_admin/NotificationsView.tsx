
import React, { useState, useEffect, useMemo } from 'react';
import { SectionHeader, Badge } from './UI.tsx';
import { Bell, Send, Clock, ShieldAlert, Info, Megaphone, Plus, Trash2, Edit2, X } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import * as notificationsApi from '../../api/notifications.ts';
import { getAllEmployees } from '../../api/users.ts';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

interface Notification {
  id: number | string;
  title: string;
  message: string;
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'sent' | 'pending' | 'draft';
  date: string;
  recipient: string;
}

export const NotificationsView = () => {
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
  const [departments, setDepartments] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [empSearch, setEmpSearch] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<any>({
    title: '',
    message: '',
    targetSelection: 'GLOBAL',
    employeeIds: [],
    departments: [],
    priority: 'NORMAL',
  });

  const [formErrors, setFormErrors] = useState({
    employeeSelection: '',
    departmentSelection: ''
  });

  const loadNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading notifications...');
      const data = await notificationsApi.getNotifications();
      console.log('Notifications loaded:', data);
      if (Array.isArray(data)) {
        const transformed: Notification[] = data.map((notif: any) => ({
          id: notif.id || notif.notificationId || String(Date.now()),
          title: String(notif.title || notif.subject || 'Notification'),
          message: String(notif.message || notif.description || ''),
          priority: (notif.priority || 'NORMAL').toUpperCase() as any,
          status: (notif.status || 'draft').toLowerCase() as any,
          date: String(notif.date || notif.createdDate || new Date().toISOString().split('T')[0]),
          recipient: String(notif.recipient || notif.recipientType || 'All Employees'),
        }));
        setNotifications(transformed);
      }
    } catch (err: any) {
      console.error('Error loading notifications:', err);
      setError(err?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setEmployees([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const resp = await fetch('http://localhost:8085/api/users/departments', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!resp.ok) throw new Error('Failed to fetch departments');
      const data = await resp.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
      setDepartments([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const handleAddNew = () => {
    setIsNew(true);
    setEditingId(null);
    setSelectedNotification(null);
    setFormData({
      title: '',
      message: '',
      targetSelection: 'GLOBAL',
      employeeIds: [],
      departments: [],
      priority: 'NORMAL',
    });
    setEmpSearch('');
    setFormErrors({ employeeSelection: '', departmentSelection: '' });
    setIsModalOpen(true);
  };

  const filteredEmployees = useMemo(() => {
    return employees
      .filter(e => e.employeeId && String(e.employeeId).trim() !== '')
      .filter(e => {
        const searchLower = empSearch.toLowerCase();
        return (e.fullName || '').toLowerCase().includes(searchLower) ||
               String(e.employeeId || '').toLowerCase().includes(searchLower);
      });
  }, [employees, empSearch]);

  const toggleEmployeeSelection = (employeeId: string) => {
    const id = String(employeeId).trim();
    if (!id) {
      console.warn('Empty employeeId attempted to be selected');
      return;
    }
    setFormData(prev => {
      const current = prev.employeeIds || [];
      const next = current.includes(id)
        ? current.filter(eId => eId !== id)
        : [...current, id];
      return { ...prev, employeeIds: next };
    });
    if (formErrors.employeeSelection) {
      setFormErrors(prev => ({ ...prev, employeeSelection: '' }));
    }
  };

  const toggleDepartmentSelection = (dept: string) => {
    setFormData(prev => {
      const current = prev.departments || [];
      const next = current.includes(dept)
        ? current.filter(d => d !== dept)
        : [...current, dept];
      return { ...prev, departments: next };
    });
    if (formErrors.departmentSelection) {
      setFormErrors(prev => ({ ...prev, departmentSelection: '' }));
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      message: '',
      targetSelection: 'GLOBAL',
      employeeIds: [],
      departments: [],
      priority: 'NORMAL',
    });
    setEmpSearch('');
    setFormErrors({ employeeSelection: '', departmentSelection: '' });
  };

  const handleEdit = (notif: Notification) => {
    setIsNew(false);
    setEditingId(notif.id as number);
    setSelectedNotification(notif);
    setFormData({
      title: notif.title,
      message: notif.message,
      targetSelection: 'GLOBAL',
      employeeIds: [],
      departments: [],
      priority: notif.priority,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title?.trim() || !formData.message?.trim()) {
      setError('Title and message are required.');
      return;
    }

    if (formData.targetSelection === 'TARGET' && (!formData.employeeIds || formData.employeeIds.length === 0)) {
      setFormErrors({ employeeSelection: 'Please select at least one employee.', departmentSelection: '' });
      return;
    } else if (formData.targetSelection === 'DEPARTMENT' && (!formData.departments || formData.departments.length === 0)) {
      setFormErrors({ employeeSelection: '', departmentSelection: 'Please select at least one department.' });
      return;
    } else {
      setFormErrors({ employeeSelection: '', departmentSelection: '' });
    }

    setIsLoading(true);
    try {
      const payload: any = {
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        targetSelection: formData.targetSelection,
      };

      if (formData.targetSelection === 'TARGET' && formData.employeeIds?.length > 0) {
        // Filter out any blank employee IDs
        const validEmployeeIds = formData.employeeIds.filter((id: string) => id && id.trim() !== '');
        if (validEmployeeIds.length === 0) {
          setFormErrors({ employeeSelection: 'Please select valid employees.', departmentSelection: '' });
          setIsLoading(false);
          return;
        }
        payload.employeeIds = validEmployeeIds;
      } 
      if (formData.targetSelection === 'DEPARTMENT' && formData.departments?.length > 0) {
        payload.departments = formData.departments;
      }

      console.log('Sending payload:', JSON.stringify(payload, null, 2));

      if (editingId) {
        await notificationsApi.updateNotification(editingId, payload);
      } else {
        await notificationsApi.createNotification(payload);
      }

      setIsModalOpen(false);
      resetForm();
      await loadNotifications();
    } catch (err: any) {
      console.error('Error details:', err);
      setError(err?.message || 'Failed to save notification');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (notificationId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;

    try {
      setLoading(true);
      await notificationsApi.deleteNotification(Number(notificationId));
      await loadNotifications();
    } catch (err: any) {
      setError(err?.message || 'Failed to delete notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="System Notifications"
        description="Broadcast announcements and monitor system-wide alerts."
        actions={
          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 bg-amber-700 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-amber-200 hover:bg-amber-800 transition-all focus:ring-4 focus:ring-amber-600/50 text-white"
          >
            <Plus size={18} />
            New Notification
          </button>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700 font-medium">⚠️ {error}</p>
        </div>
      )}

      {loading && !notifications.length ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
          <p className="text-gray-500 mt-2">Loading notifications...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-amber-200 transition-all group">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border shrink-0 ${notif.priority === 'URGENT' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                  notif.priority === 'HIGH' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-500'
                  }`}>
                  {notif.priority === 'URGENT' ? <ShieldAlert size={20} /> : <Info size={20} />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-amber-700 transition-colors">{notif.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge color={notif.status === 'sent' ? 'green' : notif.status === 'pending' ? 'yellow' : 'slate'}>
                        {notif.status.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{notif.date}</span>
                    </div>
                  </div>
                  <div
                    className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: notif.message }}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Send size={12} /> To: {notif.recipient}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Priority: {notif.priority}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(notif)}
                        className="p-2 text-gray-500 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(notif.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Notification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
          <div className={`bg-white rounded-[32px] w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
            <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
              <h2 className="text-2xl font-black text-black">{editingId ? "Update Directive" : "New Broadcast"}</h2>
              <button aria-label="Close dialog" onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
                <X className="w-6 h-6 text-black" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1">
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
                      {(['GLOBAL', 'TARGET', 'DEPARTMENT'] as const).map(type => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, targetSelection: type, employeeIds: [], departments: [] });
                            setFormErrors({ employeeSelection: '', departmentSelection: '' });
                          }}
                          className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.targetSelection === type ? 'bg-[#c97a4c] border-[#c97a4c] text-white shadow-lg' : 'bg-white border-slate-100 text-black hover:bg-slate-50'
                            }`}
                        >
                          {type}
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
                      {filteredEmployees.length > 0 ? filteredEmployees.map(emp => {
                        const isSelected = formData.employeeIds?.includes(String(emp.employeeId)) || false;
                        return (
                          <div
                            key={emp.employeeId}
                            onClick={() => toggleEmployeeSelection(emp.employeeId)}
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
                      }) : (
                        <div className="p-4 text-center text-slate-400 font-bold text-xs">No employees found</div>
                      )}
                    </div>
                    {formErrors.employeeSelection && (
                      <p className="text-xs text-red-500 font-medium">{formErrors.employeeSelection}</p>
                    )}
                  </div>
                )}

                {formData.targetSelection === 'DEPARTMENT' && (
                  <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
                    <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Select Departments</label>
                    <div className="bg-slate-50 rounded-2xl border border-slate-100 max-h-[180px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                      {departments.length > 0 ? (
                        departments.map(dept => {
                          const isSelected = formData.departments?.includes(dept);
                          return (
                            <div
                              key={dept}
                              onClick={() => toggleDepartmentSelection(dept)}
                              className="p-3 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors group"
                            >
                              <span className="text-xs font-black text-black">{dept}</span>
                              <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'}`}>
                                <Icon name="Check" className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="p-4 text-center text-slate-400 font-bold text-xs">No departments available</div>
                      )}
                    </div>
                    {formErrors.departmentSelection && (
                      <p className="text-xs text-red-500 font-medium">{formErrors.departmentSelection}</p>
                    )}
                  </div>
                )}

                <div className="pt-6 border-t border-slate-100 flex gap-4">
                  <button type="button" onClick={() => setIsModalOpen(false)} disabled={isLoading} className="flex-1 py-4 text-black font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all disabled:opacity-50">Discard</button>
                  <button type="submit" disabled={isLoading} className="flex-1 py-4 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95 disabled:opacity-50" style={{backgroundColor: '#c97a4c', boxShadow: 'rgba(201, 122, 76, 0.2) 0px 20px 25px -5px'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}>
                    {isLoading ? 'Saving...' : editingId ? "Update System Alert" : "Commit Announcement"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
