
import React from 'react';
import { MOCK_LOGS } from '../../constants.js';
import { SectionHeader, Badge } from '../../components/super_admin/UI.tsx';
import { ShieldAlert, ShieldCheck, Info } from 'lucide-react';

export const AuditLogsView = () => {
  return (
    <div className="space-y-6">
      <SectionHeader title="Audit Logs" description="Full traceability of administrative and system actions." />
      <div className="bg-[#0b1220] rounded-2xl border border-[#1f2937] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0f172a] border-b border-[#1f2937]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-[#0f172a] transition-colors group">
                  <td className="px-6 py-4 text-xs text-[#9aa8bd] font-mono">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-[#e6eef8]">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-[#e6eef8]">{log.action}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="bg-[#1f2937] text-[#9aa8bd] px-2 py-1 rounded capitalize">{log.category}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {log.severity === 'high' ? <ShieldAlert size={14} className="text-rose-500" /> : log.severity === 'medium' ? <ShieldCheck size={14} className="text-amber-500" /> : <Info size={14} className="text-blue-500" />}
                      <Badge color={log.severity === 'high' ? 'red' : log.severity === 'medium' ? 'yellow' : 'blue'}>
                        {log.severity.toUpperCase()}
                      </Badge>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
