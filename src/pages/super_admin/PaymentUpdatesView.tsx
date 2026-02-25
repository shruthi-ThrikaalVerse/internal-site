
import React from 'react';
import { MOCK_PAYMENT_UPDATES } from '../../constants';
import { SectionHeader, Badge } from '../../components/super_admin/UI.tsx';
import { Check, X, RefreshCw, DollarSign, Wallet } from 'lucide-react';

export const PaymentUpdatesView = () => {
  return (
    <div className="space-y-6">
      <SectionHeader title="Payment Updates" description="Review requests for compensation changes and payment method updates." />

      <div className="bg-[#0b1220] rounded-2xl border border-[#1f2937] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#0f172a] border-b border-[#1f2937]">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase tracking-wider">Update Type</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#9aa8bd] uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {MOCK_PAYMENT_UPDATES.map((update) => (
                <tr key={update.id} className="hover:bg-[#0f172a] transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-[#e6eef8]">{update.employeeName}</div>
                    <div className="text-[10px] text-[#9aa8bd] font-medium tracking-wide">Request Date: {update.date}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {update.updateType === 'salary' ? <DollarSign size={14} className="text-emerald-400" /> : <Wallet size={14} className="text-blue-400" />}
                      <span className="text-sm font-semibold capitalize">{update.updateType}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-[#9aa8bd] bg-[#1f2937] px-3 py-1.5 rounded-lg border border-[#1f2937]">
                      {update.details}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge color={update.status === 'approved' ? 'green' : update.status === 'rejected' ? 'red' : 'yellow'}>
                      {update.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {update.status === 'pending' && (
                      <div className="flex items-center justify-end gap-2">
                        <button title="Approve" className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg hover:bg-emerald-500/20 transition-all border border-emerald-500/20">
                          <Check size={16} />
                        </button>
                        <button title="Reject" className="p-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-all border border-rose-500/20">
                          <X size={16} />
                        </button>
                      </div>
                    )}
                    {update.status !== 'pending' && (
                      <button title="Refresh status" className="p-2 text-[#9aa8bd] hover:text-[#e6eef8] transition-all">
                        <RefreshCw size={16} />
                      </button>
                    )}
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
