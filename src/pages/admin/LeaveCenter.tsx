// LeaveCenter migrated
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const SYSTEM_HOLIDAYS = [
  { date: '2026-01-15', name: 'Makara Sankranti/ Pongal' },
  { date: '2026-01-26', name: 'Republic Day' },
  { date: '2026-03-04', name: 'HOLI' },
  { date: '2026-03-19', name: 'Ugadhi' },
  { date: '2026-04-03', name: 'Good Friday' },
  { date: '2026-05-01', name: 'MAY DAY' },
  { date: '2026-05-28', name: 'Bakrid' },
  { date: '2026-06-02', name: 'Telangana Formation Day' },
  { date: '2026-09-14', name: 'Vinayaka Chaturthi' },
  { date: '2026-10-02', name: 'Gandhi Jayanthi' },
  { date: '2026-10-20', name: 'DASARA' },
  { date: '2026-11-10', name: 'Diwali' },
  { date: '2026-12-25', name: 'Christmas' },
];

const LeaveCenter: React.FC = () => {
  const { leaves, updateLeaveStatus } = useHRMS();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');

  const pendingLeaves = leaves.filter(l => l.status === 'pending');
  const pastLeaves = leaves.filter(l => l.status !== 'pending');

  const displayLeaves = activeTab === 'pending' ? pendingLeaves : pastLeaves;

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return {
      month: months[date.getMonth()],
      day: date.getDate(),
      weekday: days[date.getDay()]
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Time Off Requests</h1>
          <p className="text-gray-500 text-sm">Review and manage leave applications.</p>
        </div>
        <div className="flex items-center bg-white p-1 rounded-xl border border-gray-100 shadow-sm">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
          >
            Pending ({pendingLeaves.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:text-gray-900'}`}
          >
            History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {displayLeaves.length > 0 ? displayLeaves.map((req) => (
            <div key={req.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-bold shadow-sm border border-blue-100">
                    {req.employeeName.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{req.employeeName}</h3>
                    <p className="text-xs text-gray-400 font-medium">Applied on {req.appliedDate}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${req.status === 'pending' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                    req.status === 'approved' ? 'bg-green-50 text-green-600 border border-green-100' :
                      'bg-red-50 text-red-600 border border-red-100'
                    }`}>
                    {req.status}
                  </span>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">{req.leaveType} Leave</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 bg-gray-50/50 p-5 rounded-2xl border border-gray-50">
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">From</p>
                  <p className="text-sm font-bold text-gray-900">{req.startDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">To</p>
                  <p className="text-sm font-bold text-gray-900">{req.endDate}</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Duration</p>
                  <div className="flex items-center gap-1">
                    <p className="text-sm font-bold text-gray-900">{req.days}</p>
                    <span className="text-[10px] text-gray-400 font-medium uppercase">Working Days</span>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Employee Reason</p>
                <p className="text-sm text-gray-600 italic">"{req.reason}"</p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
                {req.status === 'pending' ? (
                  <>
                    <button
                      onClick={() => updateLeaveStatus(req.id, 'approved')}
                      className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all uppercase text-xs"
                    >
                      Approve Leave
                    </button>
                    <button
                      onClick={() => updateLeaveStatus(req.id, 'rejected')}
                      className="flex-1 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all uppercase text-xs"
                    >
                      Reject Request
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => updateLeaveStatus(req.id, 'pending')}
                    className="flex-1 py-3 bg-white border border-gray-200 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all uppercase text-xs flex items-center justify-center gap-2"
                  >
                    <Icon name="Edit3" className="w-4 h-4" />
                    Revert to Pending
                  </button>
                )}
              </div>
            </div>
          )) : (
            <div className="bg-white border border-dashed border-gray-300 rounded-3xl p-20 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <Icon name="SearchX" className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">No requests found</h3>
              <p className="text-sm text-gray-400 max-w-xs mt-1">There are currently no {activeTab} leave applications to display.</p>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-fit">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Upcoming Holidays</h2>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                {SYSTEM_HOLIDAYS.length} Total
              </span>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2">
              {SYSTEM_HOLIDAYS.map((h, i) => {
                const label = formatDateLabel(h.date);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-all group border border-transparent hover:border-gray-100"
                  >
                    <div className="min-w-14 h-14 rounded-xl flex flex-col items-center justify-center font-bold bg-blue-50 text-blue-500 border border-blue-100">
                      <span className="text-[10px] uppercase leading-none font-bold tracking-wider">{label.month}</span>
                      <span className="text-lg leading-tight font-bold">{label.day}</span>
                      <span className="text-[9px] text-blue-400 font-medium mt-[-2px]">{label.weekday}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                        {h.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-gray-400">2026</span>
                        <span className="text-[10px] text-blue-400 font-medium bg-blue-50 px-1.5 py-0.5 rounded">
                          Public Holiday
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveCenter;