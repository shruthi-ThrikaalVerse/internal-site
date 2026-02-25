
import React from 'react';
import { SectionHeader, Badge } from '../../components/super_admin/UI.tsx';
import { Server, Database, Globe, Cpu, CheckCircle2, AlertCircle } from 'lucide-react';

export const SystemMaintenance = () => {
  const services = [
    { name: 'API Server (US-East)', status: 'operational', load: '12%', uptime: '99.99%', icon: <Server size={18} /> },
    { name: 'Main Database', status: 'operational', load: '45%', uptime: '99.95%', icon: <Database size={18} /> },
    { name: 'CDN & Assets', status: 'operational', load: '8%', uptime: '100%', icon: <Globe size={18} /> },
    { name: 'Compute Engine', status: 'degraded', load: '98%', uptime: '98.5%', icon: <Cpu size={18} /> },
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="System Maintenance" description="Real-time infrastructure health and operational status." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#0b1220] border border-[#1f2937] rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-[#1f2937] flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-500" /> Service Status</h3>
            <Badge color="green">All Systems Nominal</Badge>
          </div>
          <div className="divide-y divide-[#1f2937]">
            {services.map((s, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between hover:bg-[#0f172a] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${s.status === 'operational' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {s.icon}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#e6eef8]">{s.name}</div>
                    <div className="text-[10px] text-[#9aa8bd] uppercase tracking-widest font-bold">Uptime: {s.uptime}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge color={s.status === 'operational' ? 'green' : 'red'}>{s.status.toUpperCase()}</Badge>
                  <div className="text-[10px] text-[#9aa8bd] mt-1">Load: {s.load}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6">
            <h3 className="text-amber-400 font-bold mb-3 flex items-center gap-2">
              <AlertCircle size={18} /> Scheduled Maintenance
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-[#0b1220] rounded-xl border border-amber-500/10">
                <div className="text-sm font-bold text-[#e6eef8]">Database Optimization</div>
                <p className="text-xs text-[#9aa8bd] mt-1">Dec 12, 2024 • 02:00 AM UTC (Est. 2h)</p>
              </div>
            </div>
          </div>

          <div className="bg-[#0b1220] border border-[#1f2937] rounded-2xl p-6">
            <h3 className="font-bold mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-3">
              <button className="p-3 rounded-xl bg-[#1f2937] text-xs font-bold hover:bg-[#2d3748] transition-colors">Clear Cache</button>
              <button className="p-3 rounded-xl bg-[#1f2937] text-xs font-bold hover:bg-[#2d3748] transition-colors">Rebuild Index</button>
              <button className="p-3 rounded-xl bg-[#1f2937] text-xs font-bold hover:bg-[#2d3748] transition-colors">Restart Load Balancer</button>
              <button className="p-3 rounded-xl bg-rose-500/10 text-rose-500 text-xs font-bold hover:bg-rose-500/20 transition-colors">Emergency Shutdown</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
