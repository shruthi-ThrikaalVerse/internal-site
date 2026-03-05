
import React, { useState, useEffect } from 'react';
import { SectionHeader, Badge } from '../../components/super_admin/UI.tsx';
import { Bell, Send, Clock, ShieldAlert, Info, Megaphone, Plus, Trash2, Edit2 } from 'lucide-react';
import * as notificationsApi from '../../api/notifications.ts';

interface Notification {
  id: number | string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  status: 'sent' | 'pending' | 'draft';
  date: string;
  recipient: string;
}

export const NotificationsView = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'draft' as 'sent' | 'pending' | 'draft',
    recipient: 'All Employees',
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
          priority: (notif.priority || 'medium').toLowerCase() as any,
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

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleAddNew = () => {
    setIsNew(true);
    setSelectedNotification(null);
    setFormData({
      title: '',
      message: '',
      priority: 'medium',
      status: 'draft',
      recipient: 'All Employees',
    });
    setIsModalOpen(true);
  };

  const handleEdit = (notif: Notification) => {
    setIsNew(false);
    setSelectedNotification(notif);
    setFormData({
      title: notif.title,
      message: notif.message,
      priority: notif.priority,
      status: notif.status,
      recipient: notif.recipient,
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const payload = {
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        status: formData.status,
        recipient: formData.recipient,
      };

      if (isNew) {
        const result = await notificationsApi.createNotification(payload);
        console.log('Notification created:', result);
        const newNotif: Notification = {
          id: result?.id || result?.notificationId || String(Date.now()),
          title: formData.title,
          message: formData.message,
          priority: formData.priority,
          status: formData.status,
          date: new Date().toISOString().split('T')[0],
          recipient: formData.recipient,
        };
        setNotifications(prev => [newNotif, ...prev]);
      } else if (selectedNotification) {
        const result = await notificationsApi.updateNotification(Number(selectedNotification.id), payload);
        console.log('Notification updated:', result);
        setNotifications(prev => prev.map(n => n.id === selectedNotification.id ? {
          ...n,
          ...formData,
        } : n));
      }
      setIsModalOpen(false);
      setFormData({ title: '', message: '', priority: 'medium' as 'high' | 'medium' | 'low', status: 'draft' as 'sent' | 'pending' | 'draft', recipient: 'All Employees' });
    } catch (err: any) {
      console.error('Error saving notification:', err);
      setError(err?.message || 'Failed to save notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (notificationId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      setLoading(true);
      const result = await notificationsApi.deleteNotification(Number(notificationId));
      console.log('Notification deleted:', result);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err: any) {
      console.error('Error deleting notification:', err);
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
            className="flex items-center gap-2 bg-blue-600 px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-500/50"
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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-2">Loading notifications...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {notifications.map((notif) => (
            <div key={notif.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 transition-all group">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl border shrink-0 ${notif.priority === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                  notif.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                    'bg-blue-500/10 border-blue-500/20 text-blue-500'
                  }`}>
                  {notif.priority === 'high' ? <ShieldAlert size={20} /> : <Info size={20} />}
                </div> 

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                    <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">{notif.title}</h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge color={notif.status === 'sent' ? 'green' : notif.status === 'pending' ? 'yellow' : 'slate'}>
                        {notif.status.toUpperCase()}
                      </Badge>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">{notif.date}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-3 leading-relaxed line-clamp-2">{notif.message}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5"><Send size={12} /> To: {notif.recipient}</span>
                      <span className="flex items-center gap-1.5"><Clock size={12} /> Priority: {notif.priority}</span>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => handleEdit(notif)}
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {isNew ? 'Create Notification' : 'Edit Notification'}
            </h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Notification title"
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Notification message..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as any }))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="sent">Sent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Recipient</label>
                <select
                  value={formData.recipient}
                  onChange={(e) => setFormData(prev => ({ ...prev, recipient: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All Employees">All Employees</option>
                  <option value="Admin Only">Admin Only</option>
                  <option value="Department">Department</option>
                  <option value="Team Lead">Team Lead</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-3 bg-gray-100 text-gray-900 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading || !formData.title || !formData.message}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
