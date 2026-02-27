
import React from 'react';
import { MOCK_LOGS } from '../../constants';
import { SectionHeader, Badge } from '../../components/super_admin/UI.tsx';
import { ShieldAlert, ShieldCheck, Info } from 'lucide-react';

export const AuditLogsView = () => {
  return (
    <div className="space-y-6">
      <SectionHeader title="Audit Logs" description="Full traceability of administrative and system actions." />
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">User</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Action</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {MOCK_LOGS.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-xs text-gray-500 font-mono">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900">{log.user}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{log.action}</td>
                  <td className="px-6 py-4 text-xs">
                    <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded capitalize">{log.category}</span>
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
