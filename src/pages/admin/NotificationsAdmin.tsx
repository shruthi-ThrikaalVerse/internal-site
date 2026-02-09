import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { AdminNotification, AdminNotificationType, AdminNotificationPriority, AdminNotificationStatus } from '../../types.ts';

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
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};

const NotificationsAdmin: React.FC = () => {
  const { adminNotifications, addAdminNotification, updateAdminNotification, deleteAdminNotification, employees, notify } = useHRMS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<AdminNotification>>({
    title: '',
    message: '',
    type: 'global',
    targetEmployeeIds: [],
    priority: 'normal',
    status: 'active',
    dateTime: new Date().toLocaleString()
  });

  const filteredNotifications = useMemo(() => {
    return adminNotifications.filter(n =>
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.message.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [adminNotifications, searchTerm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      e.fullName.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(empSearch.toLowerCase())
    );
  }, [employees, empSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      notify('Title and message are required.', 'warning');
      return;
    }

    if (formData.type === 'selected' && (!formData.targetEmployeeIds || formData.targetEmployeeIds.length === 0)) {
      notify('Please select at least one employee.', 'warning');
      return;
    }

    if (editingId) {
      updateAdminNotification(editingId, formData);
    } else {
      addAdminNotification({ ...formData, dateTime: new Date().toLocaleString() });
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      message: '',
      type: 'global',
      targetEmployeeIds: [],
      priority: 'normal',
      status: 'active',
      dateTime: new Date().toLocaleString()
    });
    setEmpSearch('');
  };

  const handleEdit = (n: AdminNotification) => {
    setEditingId(n.id);
    setFormData({
      title: n.title,
      message: n.message,
      type: n.type,
      targetEmployeeIds: n.targetEmployeeIds,
      priority: n.priority,
      status: n.status,
      dateTime: n.dateTime
    });
    setIsModalOpen(true);
  };

  const toggleStatus = (n: AdminNotification) => {
    const nextStatus = n.status === 'active' ? 'inactive' : 'active';
    updateAdminNotification(n.id, { status: nextStatus });
    notify(`Notification marked as ${nextStatus}.`);
  };

  const toggleEmployeeSelection = (id: string) => {
    setFormData(prev => {
      const current = prev.targetEmployeeIds || [];
      const next = current.includes(id)
        ? current.filter(cid => cid !== id)
        : [...current, id];
      return { ...prev, targetEmployeeIds: next };
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Broadcast Management</h1>
          <p className="text-slate-500 text-sm font-medium">Coordinate system alerts and targeted messages to specific segments.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <Icon name="Plus" className="w-5 h-5" /> Post Announcement
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="relative flex-1 group w-full">
            <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
            <input
              aria-label="Search historical broadcasts"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search historical broadcasts..."
              className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600 shadow-inner"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-[24px] border border-slate-50">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Context</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Deployment</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Priority</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Audience</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredNotifications.length > 0 ? filteredNotifications.map(n => (
                <tr key={n.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="max-w-xs">
                      <p className="text-sm font-black text-slate-800 truncate">{n.title}</p>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-1">{n.message}</p>
                      <p className="text-[9px] font-bold text-slate-300 uppercase mt-1.5">{n.dateTime}</p>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${n.type === 'global' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                        }`}>
                        {n.type === 'global' ? 'Global' : 'Selected'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${n.priority === 'urgent' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      n.priority === 'high' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                        'bg-slate-50 text-slate-400 border-slate-100'
                      }`}>
                      {n.priority}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-xs font-black text-slate-800">{n.type === 'global' ? 'All Staff' : `${n.targetEmployeeIds.length} Targeted`}</span>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{n.readBy.length} Read</span>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button aria-label={`Edit notification ${n.title}`} onClick={() => handleEdit(n)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent transition-all"><Icon name="Edit3" className="w-4 h-4" /></button>
                      <button aria-label={`Delete notification ${n.title}`} onClick={() => deleteAdminNotification(n.id)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-white rounded-xl shadow-sm border border-transparent transition-all"><Icon name="Trash2" className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                      <Icon name="BellOff" className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Zero historical broadcasts found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Update Directive" : "New Broadcast"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Announcement Header</label>
            <input
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
              placeholder="Brief summary of the update"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Comprehensive Message</label>
            <textarea
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 min-h-[100px] shadow-inner"
              placeholder="Detailed description, instructions, or news..."
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Scope</label>
              <div className="flex gap-2">
                {(['global', 'selected'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, type, targetEmployeeIds: [] })}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.type === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slace-50'
                      }`}
                  >
                    {type === 'global' ? 'Global Staff' : 'Target Selection'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Criticality Level</label>
              <div className="flex gap-2">
                {(['normal', 'high', 'urgent'] as AdminNotificationPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.priority === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {formData.type === 'selected' && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audience Targeting</label>
                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-lg">{formData.targetEmployeeIds?.length} Selected</span>
              </div>
              <div className="relative group">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Search personal..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                />
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 max-h-[180px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {filteredEmployees.map(emp => {
                  const isSelected = formData.targetEmployeeIds?.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployeeSelection(emp.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} className="w-8 h-8 rounded-lg shadow-sm border border-white" alt={`${emp.fullName} avatar`} />
                        <div>
                          <p className="text-xs font-black text-slate-800 leading-none">{emp.fullName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{emp.employeeId} • {emp.department}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'}`}>
                        <Icon name="Check" className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              {editingId ? "Update System Alert" : "Commit Announcement"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default NotificationsAdmin;
