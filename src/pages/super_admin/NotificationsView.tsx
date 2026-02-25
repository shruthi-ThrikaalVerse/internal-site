
import React from 'react';
import { MOCK_NOTIFICATIONS } from '../../constants';
import { SectionHeader, Badge } from '../../components/super_admin/UI.tsx';
import { Bell, Send, Clock, ShieldAlert, Info, Megaphone } from 'lucide-react';

export const NotificationsView = () => {
  return (
    <div className="space-y-6">
      <SectionHeader
        title="System Notifications"
        description="Broadcast announcements and monitor system-wide alerts."
        actions={
          <button className="flex items-center gap-2 bg-[#f37321] px-4 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-[#f37321]/20 hover:bg-[#e06410] transition-all">
            <Megaphone size={18} />
            Broadcast Alert
          </button>
        }
      />

      <div className="grid grid-cols-1 gap-4">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <div key={notif.id} className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-5 hover:border-[#f37321]/30 transition-all group">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-xl border shrink-0 ${notif.priority === 'high' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' :
                notif.priority === 'medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                  'bg-blue-500/10 border-blue-500/20 text-blue-500'
                }`}>
                {notif.priority === 'high' ? <ShieldAlert size={20} /> : <Info size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1">
                  <h3 className="font-bold text-[#e6eef8] truncate group-hover:text-[#f37321] transition-colors">{notif.title}</h3>
                  <div className="flex items-center gap-2">
                    <Badge color={notif.status === 'sent' ? 'green' : 'slate'}>{notif.status.toUpperCase()}</Badge>
                    <span className="text-[10px] font-bold text-[#9aa8bd] uppercase">{notif.date}</span>
                  </div>
                </div>
                <p className="text-sm text-[#9aa8bd] mb-3 leading-relaxed">{notif.message}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-[#9aa8bd] uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><Send size={12} /> To: {notif.recipient}</span>
                  <span className="flex items-center gap-1.5"><Clock size={12} /> Priority: {notif.priority}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
