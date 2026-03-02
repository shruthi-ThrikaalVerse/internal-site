
import React from 'react';
import { MOCK_PAYROLL } from '../../constants';
import { SectionHeader, StatCard, Badge } from '../../components/super_admin/UI.tsx';
import { CreditCard, DollarSign, Wallet } from 'lucide-react';

export const PayrollView = () => {
  return (
    <div className="space-y-6">
      <SectionHeader title="Payroll & Payments" description="Manage disbursements and view financial history." />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Payout (Monthly)" value="$48,500" icon={<DollarSign size={20} />} trend="stable" trendValue="0% change" />
        <StatCard title="Pending Payments" value="12" icon={<Wallet size={20} />} trend="up" trendValue="+2 vs last cycle" />
        <StatCard title="Next Cycle" value="Dec 01" icon={<CreditCard size={20} />} />
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold">Transaction History</h3>
          <button className="text-xs font-bold text-blue-600 hover:underline focus:ring-4 focus:ring-blue-500/50">Download CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
              <tr>
                <th className="px-6 py-4">Recipient</th>
                <th className="px-6 py-4">Amount</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {MOCK_PAYROLL.map((item) => (
                <tr key={item.id} className="hover:bg-gray-100 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{item.employeeName}</td>
                  <td className="px-6 py-4 text-sm font-mono text-gray-900">${item.amount.toLocaleString()}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.date}</td>
                  <td className="px-6 py-4">
                    <Badge color={item.status === 'paid' ? 'green' : 'yellow'}>{item.status.toUpperCase()}</Badge>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{item.method}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
