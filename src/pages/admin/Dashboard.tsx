import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { mockDepartmentHeadcount } from '../../mockData.ts';
import { getPerformanceDashboard } from '../../api/performance.ts';
// (Removed duplicate Dashboard definition and moved hooks inside the main function below)
import { getPendingLeaveRequests, updateLeaveStatus as updateLeaveStatusAPI } from '../../api/leave.ts';
import { getNotifications } from '../../api/notifications.ts';
import { getEmployeeTickets, updateTicketStatus } from '../../api/tickets.ts';
import { getEvents } from '../../api/events.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { ParticipationStatus, PayslipData } from '../../types.ts';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const StatsCard = ({ title, value, icon, color, subValue, trend }: any) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-150 transition-transform">
      <Icon name={icon} className="w-32 h-32" />
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${color} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        <Icon name={icon} className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${trend > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend > 0 ? '+' : ''}{trend}% this month
        </span>
      )}
    </div>
    <h3 className="text-black text-[10px] font-black uppercase tracking-widest">{title}</h3>
    <div className="flex items-baseline gap-2 mt-1">
      <p className="text-3xl font-black text-black">{value}</p>
      {subValue && <span className="text-xs font-bold text-black">{subValue}</span>}
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  // Department headcount state for department chart
  const [departmentHeadcount, setDepartmentHeadcount] = useState<any[]>([]);
  const [isLoadingDept, setIsLoadingDept] = useState(false);

  // Fetch department headcount from backend
  const fetchDepartmentHeadcount = useCallback(async () => {
    try {
      setIsLoadingDept(true);
      const data = await getPerformanceDashboard();
      if (data && Array.isArray(data.departmentPerformance)) {
        // Optionally add color if not present
        const colors = ["#6366f1", "#22d3ee", "#f59e42", "#10b981", "#f43f5e", "#a78bfa", "#fbbf24", "#34d399", "#f87171", "#818cf8"];
        const deptData = data.departmentPerformance.map((d, i) => ({
          ...d,
          color: d.color || colors[i % colors.length],
        }));
        setDepartmentHeadcount(deptData);
      } else {
        setDepartmentHeadcount([]);
      }
    } catch (err) {
      console.error('Failed to fetch department headcount', err);
      setDepartmentHeadcount([]);
    } finally {
      setIsLoadingDept(false);
    }
  }, []);

  // Backend events state
  const [backendEvents, setBackendEvents] = useState<any[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);

  // Fetch events from backend
  const fetchBackendEvents = useCallback(async () => {
    try {
      setIsLoadingEvents(true);
      const data = await getEvents();
      if (Array.isArray(data)) {
        // Sort by startDate descending, then startTime
        const sorted = data.sort((a, b) => {
          const dateA = new Date(a.startDate + 'T' + (a.startTime || '00:00:00'));
          const dateB = new Date(b.startDate + 'T' + (b.startTime || '00:00:00'));
          return dateB.getTime() - dateA.getTime();
        });
        setBackendEvents(sorted);
      } else {
        setBackendEvents([]);
      }
    } catch (err) {
      console.error('Failed to fetch backend events', err);
      setBackendEvents([]);
    } finally {
      setIsLoadingEvents(false);
    }
  }, []);

  // SAFEGUARD: Ensure HRMS context is available
  const hrms = useHRMS();
  if (!hrms) {
    return <div style={{color: 'red', fontWeight: 'bold', padding: 32}}>HRMS context not found. Please ensure Dashboard is rendered inside HRMSProvider.</div>;
  }
  const { employees, activities, leaves, attendance, updateLeaveStatus, events, toggleEventParticipation, payslips, notify } = hrms;
  const { user } = useAuth();
  const navigate = useNavigate();
  const [eventFilter, setEventFilter] = useState<'all' | 'mine'>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [showActivityFilter, setShowActivityFilter] = useState(false);
  const [backendPendingLeaves, setBackendPendingLeaves] = useState<any[]>([]);
  const [isLoadingLeaves, setIsLoadingLeaves] = useState(false);
  const [backendTickets, setBackendTickets] = useState<any[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
    // Fetch support tickets from backend
    const fetchTickets = useCallback(async () => {
      try {
        setIsLoadingTickets(true);
        const data = await getEmployeeTickets();
        if (Array.isArray(data)) {
          // Normalize ticket fields for display
          const mapped = data.map((item: any) => ({
            id: String(item.id || item.ticketId),
            ticketId: item.id || item.ticketId,
            employeeId: item.employeeId,
            employeeName: item.employeeName || item.requestedBy || item.employeeId,
            type: item.type || 'Support',
            subject: item.subject || item.title || 'Support Ticket',
            reason: item.description || item.details || '',
            status: (item.status || 'pending').toString().toLowerCase(),
            createdAt: item.createdAt || item.date || '',
          }));
          setBackendTickets(mapped.filter(t => t.status === 'pending'));
        } else {
          setBackendTickets([]);
        }
      } catch (err) {
        console.error('Failed to fetch tickets', err);
        setBackendTickets([]);
      } finally {
        setIsLoadingTickets(false);
      }
    }, []);
  const [backendActivities, setBackendActivities] = useState<any[]>([]);
  const [isLoadingActivities, setIsLoadingActivities] = useState(false);

  // Fetch pending leaves from backend
  const fetchPendingLeaves = useCallback(async () => {
    try {
      setIsLoadingLeaves(true);
      const data = await getPendingLeaveRequests();
      if (Array.isArray(data)) {
        const mapped = data.map((item: any) => ({
          id: String(item.leaveId),
          leaveId: item.leaveId,
          employeeId: item.employeeId,
          employeeName: (item.firstName || item.lastName) ? `${item.firstName || ''} ${item.lastName || ''}`.trim() : item.employeeId,
          leaveType: item.category || item.type || 'Leave',
          reason: item.reason || '',
          status: (item.status || 'pending').toString().toLowerCase()
        }));
        setBackendPendingLeaves(mapped);
      } else {
        setBackendPendingLeaves([]);
      }
    } catch (err) {
      console.error('Failed to fetch pending leaves', err);
      setBackendPendingLeaves([]);
    } finally {
      setIsLoadingLeaves(false);
    }
  }, []);

  // Fetch activities from backend notifications API
  const fetchActivities = useCallback(async () => {
    try {
      setIsLoadingActivities(true);
      const data = await getNotifications();
      if (Array.isArray(data)) {
        const mapped = data.map((notif: any) => {
          // Determine activity type based on notification subject/message
          let type = 'update';
          const message = (notif.message || notif.subject || '').toLowerCase();
          if (message.includes('check in') || message.includes('checked in')) type = 'checkin';
          else if (message.includes('check out') || message.includes('checked out')) type = 'checkout';
          else if (message.includes('leave') || message.includes('request')) type = 'leave';
          else if (message.includes('document') || message.includes('upload')) type = 'document';
          else if (message.includes('profile') || message.includes('update')) type = 'update';

          return {
            id: String(notif.id || notif.notificationId),
            type,
            employeeName: notif.createdBy || notif.employeeName || 'System',
            time: notif.createdAt ? new Date(notif.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
            details: notif.message || notif.subject || 'Activity update'
          };
        });
        setBackendActivities(mapped.reverse().slice(0, 10)); // Show latest 10 activities
      } else {
        setBackendActivities([]);
      }
    } catch (err) {
      console.error('Failed to fetch activities', err);
      setBackendActivities([]);
    } finally {
      setIsLoadingActivities(false);
    }
  }, []);

  // Fetch pending leaves, tickets, and events on component mount
  useEffect(() => {
    fetchPendingLeaves();
    fetchTickets();
    fetchBackendEvents();
    fetchDepartmentHeadcount();
    // Set up polling to refresh every 30 seconds
    const intervalId = setInterval(() => {
      fetchPendingLeaves();
      fetchTickets();
      fetchBackendEvents();
      fetchDepartmentHeadcount();
    }, 30000);
    return () => clearInterval(intervalId);
  }, [fetchPendingLeaves, fetchTickets, fetchBackendEvents, fetchDepartmentHeadcount]);

  // Fetch activities on component mount
  useEffect(() => {
    fetchActivities();
    // Set up polling to refresh every 30 seconds
    const intervalId = setInterval(fetchActivities, 30000);
    return () => clearInterval(intervalId);
  }, [fetchActivities]);

  const handleUpdateLeaveStatus = async (leaveId: string | number, status: 'approved' | 'rejected') => {
    try {
      await updateLeaveStatusAPI(leaveId, status);
      // Remove from list
      setBackendPendingLeaves(prev => prev.filter(l => l.id !== String(leaveId)));
      notify(`Leave ${status} successfully`, 'success');
      // Refresh the list
      await fetchPendingLeaves();
    } catch (err: any) {
      console.error('Failed to update leave status', err);
      notify(err.message || `Failed to ${status} leave`, 'error');
    }
  };

  // Merge pending leaves and tickets for the request queue
  const pendingLeaves = backendPendingLeaves.length > 0 ? backendPendingLeaves : leaves.filter(l => l.status === 'pending');
  const pendingTickets = backendTickets;
  const requestQueue = [
    ...pendingLeaves.map(l => ({
      ...l,
      requestType: 'Leave',
      displayType: l.leaveType || 'Leave',
      displayReason: l.reason,
      displayId: l.leaveId || l.id,
    })),
    ...pendingTickets.map(t => ({
      ...t,
      requestType: 'Support',
      displayType: t.type || 'Support',
      displayReason: t.reason,
      displayId: t.ticketId || t.id,
    })),
  ];
  const displayActivities = backendActivities.length > 0 ? backendActivities : activities;

  const safeEmployees = Array.isArray(employees) ? employees : [];
  const activeCount = safeEmployees.filter(e => e.status === 'active').length;
  const inactiveCount = safeEmployees.length - activeCount;

  const today = '2024-05-15';
  const presentCount = attendance.filter(a => a.date === today && (a.status === 'present' || a.status === 'late')).length;
  const presenceRate = safeEmployees.length > 0 ? Math.round((presentCount / safeEmployees.length) * 100) : 0;

  const currentEmployee = safeEmployees.find(e => e.email === user?.email);

  // Use backend events for Events Hub
  const displayEvents = useMemo(() => {
    let list = backendEvents;
    if (eventFilter === 'mine' && user) {
      // Only show events where the current user's id (employeeId) is in event.employeeIds
      list = list.filter(evt => Array.isArray(evt.employeeIds) && evt.employeeIds.includes(user.id));
    }
    return list.slice(0, 2);
  }, [backendEvents, eventFilter, user]);

  const userPayslips = useMemo(() => {
    if (!currentEmployee) return [];
    return payslips.filter(p => (p.employeeId === currentEmployee.employeeId || p.employeeId === currentEmployee.id) && p.status === 'sent');
  }, [payslips, currentEmployee]);

  const activityTypes = [
    { id: 'all', label: 'All Activities', icon: 'List' },
    { id: 'checkin', label: 'Check-ins', icon: 'Zap' },
    { id: 'checkout', label: 'Check-outs', icon: 'LogOut' },
    { id: 'leave', label: 'Leave Requests', icon: 'Calendar' },
    { id: 'document', label: 'Documents', icon: 'FileText' },
    { id: 'update', label: 'Profile Updates', icon: 'UserCog' },
  ];

  const filteredActivities = useMemo(() => {
    let filtered = [...displayActivities];

    if (activityFilter !== 'all') {
      filtered = filtered.filter(activity => activity.type === activityFilter);
    }

    return filtered
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 5);
  }, [displayActivities, activityFilter]);

  const handleTraceActivity = (type: string, name: string) => {

    switch (type) {
      case 'checkin':
      case 'checkout':
        navigate('/admin/attendance');
        break;
      case 'leave':
        navigate('/admin/leave');
        break;
      case 'document':
        navigate('/admin/documents');
        break;
      case 'update':
        navigate('/admin/employees');
        break;
      default:
        navigate('/admin/employees');
    }
  };

  const handleToggleParticipation = (evtId: string, status: ParticipationStatus) => {
    if (!user) return;
    toggleEventParticipation(evtId, user.email, status);
  };

  const handleDownloadPayslip = (p: PayslipData) => {
    const content = `PAYSLIP - ${p.month} ${p.year}\nBasic: ${p.basic}\nGross: ${p.grossSalary}\nNet: ${p.netPay}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Payslip_${p.month}_${p.year}.txt`;
    a.click();
  };

  const clearActivityFilter = () => {
    setActivityFilter('all');
    setShowActivityFilter(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Executive Dashboard</h1>
          <p className="text-black text-sm font-medium">Global system overview and administrative health metrics.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-black uppercase tracking-widest">System Operational</span>
          </div>
        </div>
      </div>

      {/* Primary Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={employees.length}
          icon="Users"
          color="bg-indigo-500"
          trend={employees.length > 20 ? 5.4 : 0}
          subValue="Staff"
        />
        <StatsCard
          title="Employees Present Today"
          value={`${presenceRate}%`}
          icon="CalendarCheck"
          color="bg-blue-500"
          subValue={`${presentCount} / ${employees.length}`}
        />
        <StatsCard
          title="Active Directory"
          value={activeCount}
          icon="ShieldCheck"
          color="bg-emerald-500"
          subValue={`/ ${inactiveCount} Inactive`}
        />
        <StatsCard
          title="Open Requests"
          value={pendingLeaves.length}
          icon="Bell"
          color="bg-rose-500"
          subValue="Action Needed"
        />
      </div>

      {/* Main Insight Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Col: Headcount + Live Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-xl font-bold text-black">Distribution by Department</h2>
                <p className="text-xs text-black font-medium mb-4">Staffing density across key modules.</p>
              </div>
            </div>
            <div className="h-72 w-full flex flex-col items-center justify-center">
              <ResponsiveContainer width="60%" height="100%" minWidth={0}>
                <PieChart>
                  <Pie
                    data={departmentHeadcount}
                    dataKey="count"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    innerRadius={60}
                    paddingAngle={2}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {departmentHeadcount.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value, name, props) => [`${value}`, 'Employees']}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-4 mt-4">
                {departmentHeadcount.map((entry, idx) => (
                  <div key={entry.department} className="flex items-center gap-2 text-xs font-bold">
                    <span style={{ backgroundColor: entry.color, width: 14, height: 14, display: 'inline-block', borderRadius: '50%' }}></span>
                    <span>{entry.department}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm">
            <div className="p-8 border-b flex items-center justify-between relative">
              <div>
                <h2 className="text-xl font-bold text-black">Live Activity Feed</h2>
                <p className="text-xs text-black font-medium mb-4">Real-time sync from across the organization.</p>
              </div>

              <div className="relative z-30">
                <button
                  onClick={() => setShowActivityFilter(!showActivityFilter)}
                  title="Filter activities"
                  aria-label="Filter activities"
                  className="p-3 rounded-2xl transition-all flex items-center gap-2 font-bold shadow-sm text-white"
                  style={showActivityFilter || activityFilter !== 'all' 
                    ? {backgroundColor: '#c97a4c', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}
                    : {backgroundColor: '#c97a4c', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                  }
                >
                  <Icon name="Filter" className="w-5 h-5" />
                  {activityFilter !== 'all' && (
                    <span className="text-xs">Filter</span>
                  )}
                </button>

                {/* Filter Popover */}
                {showActivityFilter && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setShowActivityFilter(false)}
                    />
                    <div className="absolute right-0 top-full mt-3 z-40 bg-white rounded-2xl border border-slate-200 shadow-2xl p-1 min-w-[260px] max-h-[350px] flex flex-col overflow-hidden">
                      <div className="px-4 py-3 border-b border-slate-100 flex-shrink-0">
                        <p className="text-xs font-black text-black uppercase tracking-widest">Filter Activities</p>
                      </div>
                      <div className="space-y-0.5 overflow-y-auto flex-1 px-1 py-1">
                        {activityTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => {
                              setActivityFilter(type.id);
                              setShowActivityFilter(false);
                            }}
                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left transition-all ${activityFilter === type.id
                              ? 'bg-blue-50 text-blue-700 font-semibold'
                              : 'text-black hover:bg-slate-50 hover:text-black'
                              }`}
                          >
                            <Icon name={type.icon} className="w-4 h-4 flex-shrink-0" />
                            <span className="text-sm font-medium flex-1">{type.label}</span>
                            {activityFilter === type.id && (
                              <Icon name="Check" className="w-4 h-4 flex-shrink-0 text-blue-600 font-bold" />
                            )}
                          </button>
                        ))}
                      </div>

                      {activityFilter !== 'all' && (
                        <button
                          onClick={clearActivityFilter}
                          className="w-full py-2.5 text-center text-xs font-bold text-black hover:text-blue-600 border-t border-slate-100 flex-shrink-0 hover:bg-slate-50 transition-colors"
                        >
                          <Icon name="X" className="w-3 h-3 inline mr-2" />
                          Clear Filter
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Active Filter Badge */}
              {activityFilter !== 'all' && (
                <div className="absolute bottom-3 left-8">
                  <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-200">
                    <Icon name={activityTypes.find(t => t.id === activityFilter)?.icon || 'Filter'} className="w-3 h-3" />
                    {activityTypes.find(t => t.id === activityFilter)?.label}
                    <button
                      onClick={clearActivityFilter}
                      className="ml-1 hover:text-blue-900"
                    >
                      <Icon name="X" className="w-3 h-3" />
                    </button>
                  </span>
                </div>
              )}
            </div>
            <div className="overflow-hidden">

              {/* Scrollable container with invisible scrollbar */}
              <div
                className="divide-y divide-slate-50 max-h-[500px] overflow-y-auto"
                style={{
                  scrollbarWidth: 'none', /* Firefox */
                  msOverflowStyle: 'none', /* IE/Edge */
                }}
              >
                <style>
                  {`
                  .divide-y > *::-webkit-scrollbar {
                    display: none; /* Chrome, Safari, Opera */
                  }
                `}
                </style>
                {filteredActivities.length > 0 ? filteredActivities.map((activity) => (
                  <div key={activity.id} className="p-6 hover:bg-slate-50 transition-colors flex items-center gap-6 group">
                    <div className={`p-4 rounded-2xl transition-all group-hover:scale-110 group-hover:shadow-lg ${activity.type === 'checkin' || activity.type === 'checkout' ? 'bg-emerald-50 text-emerald-600' :
                      activity.type === 'leave' ? 'bg-amber-50 text-amber-600' :
                        activity.type === 'document' ? 'bg-blue-50 text-blue-600' :
                          'bg-[#f5ede3] text-[#8b5a3c]'
                      }`}>
                      <Icon name={
                        activity.type === 'checkin' ? 'Zap' :
                          activity.type === 'checkout' ? 'LogOut' :
                            activity.type === 'leave' ? 'Calendar' :
                              activity.type === 'document' ? 'FileText' :
                                'UserCog'
                      } className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-black">
                        <span className="text-black font-black">{activity.employeeName}</span>
                        <span className="text-black font-medium"> {activity.details}</span>
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Icon name="Clock" className="w-3 h-3 text-black" />
                        <p className="text-[10px] text-black font-black uppercase tracking-widest">{activity.time}</p>
                        <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter bg-slate-100 text-black">
                          {activity.type}
                        </span>
                      </div>
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all">
                      <button
                        onClick={() => handleTraceActivity(activity.type, activity.employeeName)}
                        className="p-2 text-indigo-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest flex items-center gap-1"
                      >
                        Trace <Icon name="ChevronRight" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-10 text-center">
                    <div className="inline-flex p-4 bg-slate-50 rounded-2xl mb-4">
                      <Icon name="FilterX" className="w-8 h-8 text-black" />
                    </div>
                    <p className="text-sm font-bold text-black mb-1">No activities found</p>
                    <p className="text-xs text-black">
                      {activityFilter !== 'all'
                        ? `No ${activityTypes.find(t => t.id === activityFilter)?.label.toLowerCase()} in the feed`
                        : 'No recent activities to display'}
                    </p>
                    {activityFilter !== 'all' && (
                      <button
                        onClick={clearActivityFilter}
                        className="mt-4 px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-colors" style={{backgroundColor: '#f5ede3', color: '#8b5a3c'}} onMouseEnter={(e) => {e.currentTarget.style.backgroundColor = '#e8d4c1';}} onMouseLeave={(e) => {e.currentTarget.style.backgroundColor = '#f5ede3';}}
                      >
                        Show All Activities
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Task Queue + Upcoming Events */}
        <div className="space-y-8">

          {/* Organization Calendar Widget */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Icon name="CalendarDays" className="text-indigo-600" />
                Events Hub
              </h2>
              <div className="flex bg-slate-50 p-1 rounded-xl">
                <button
                  onClick={() => setEventFilter('all')}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${eventFilter === 'all' ? 'bg-white shadow-sm text-indigo-600' : 'text-black'}`}
                >All</button>
                <button
                  onClick={() => setEventFilter('mine')}
                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${eventFilter === 'mine' ? 'bg-white shadow-sm text-indigo-600' : 'text-black'}`}
                >For Me</button>
              </div>
            </div>
            <div className="space-y-4 flex-1">
              {displayEvents.length > 0 ? displayEvents.slice(0, 3).map(evt => {
                const userPart = Array.isArray(evt.participations)
                  ? evt.participations.find(p => p.employeeEmail === user?.email)
                  : undefined;
                return (
                  <div key={evt.id} className="p-5 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 transition-all group">
                    <div className="mb-3 text-[11px] text-black leading-relaxed">
                      <div><span className="font-bold">Event ID:</span> {evt.id}</div>
                      <div><span className="font-bold">Title:</span> {evt.title}</div>
                      <div><span className="font-bold">Date:</span> {evt.startDate}</div>
                      <div><span className="font-bold">Time:</span> {evt.startTime}</div>
                      <div>
                        <span className="font-bold">Meeting:</span> {
                          evt.meetingLink && /^(https?:\/\/)/i.test(evt.meetingLink)
                            ? <a href={evt.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{evt.meetingLink}</a>
                            : (evt.meetingLink || 'N/A')
                        }
                      </div>
                    </div>
                    {/* Removed Attending and Maybe buttons as requested */}
                  </div>
                );
              }) : (
                <div className="py-12 text-center opacity-30">
                  <Icon name="Inbox" className="w-10 h-10 mx-auto mb-2 text-black" />
                  <p className="text-xs font-bold uppercase text-black">NO UPCOMING EVENTS</p>
                </div>
              )}
              <button
                onClick={() => navigate('/admin/events')}
                className="w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all" style={{backgroundColor: '#f5ede3', color: '#8b5a3c'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#e8d4c1'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#f5ede3'}
              >View Events Hub</button>
            </div>
          </div>

          {/* My Payslips Widget */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black flex items-center gap-2">
                <Icon name="ReceiptText" className="text-emerald-500" />
                My Payslips
              </h2>
              <span className="text-[9px] font-black uppercase text-black">Ledger Index</span>
            </div>
            <div className="space-y-3">
              {userPayslips.length > 0 ? userPayslips.slice(0, 3).map(ps => (
                <div key={ps.id} className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 hover:bg-white hover:border-emerald-200 transition-all group flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-black">{ps.month} {ps.year}</p>
                    <p className="text-[10px] font-bold text-emerald-600 mt-0.5">₹{ps.netPay.toLocaleString()}</p>
                  </div>
                  <button
                    title={`Download payslip ${ps.month} ${ps.year}`}
                    aria-label={`Download payslip for ${ps.month} ${ps.year}`}
                    onClick={() => handleDownloadPayslip(ps)}
                    className="p-2 text-black hover:text-emerald-600 transition-colors"
                  >
                    <Icon name="Download" className="w-4 h-4" />
                  </button>
                </div>
              )) : (
                <div className="py-8 text-center opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-widest text-black">No payslips issued yet</p>
                </div>
              )}
              {userPayslips.length > 0 && (
                <button className="w-full py-2.5 text-[9px] font-black text-black uppercase tracking-widest hover:text-indigo-600 transition-colors">
                  View Full History
                </button>
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">Request Queue</h2>
              <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest" style={{backgroundColor: '#f5ede3', color: '#8b5a3c'}}>{requestQueue.length} NEW</span>
            </div>
            <div className="space-y-4 flex-1 overflow-y-auto max-h-[400px] pr-2 custom-scrollbar">
              {requestQueue.length > 0 ? requestQueue.map((item) => (
                <div key={item.id} className="p-5 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all group">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-bold text-black text-xs shadow-sm">
                        {item.employeeName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-black text-black leading-none">{item.employeeName}</p>
                        <p className="text-[10px] text-black font-bold uppercase tracking-tighter mt-1">{item.displayType} {item.requestType === 'Leave' ? 'REQUEST' : 'TICKET'}</p>
                      </div>
                    </div>
                  </div>
                  {item.requestType === 'Support' ? (
                    <div className="mb-4 text-[11px] text-black leading-relaxed">
                      <div><span className="font-bold">Ticket ID:</span> {item.ticketId}</div>
                      <div><span className="font-bold">Type:</span> {item.type}</div>
                      <div><span className="font-bold">Subject:</span> {item.subject}</div>
                      <div><span className="font-bold">Employee ID:</span> {item.employeeId}</div>
                    </div>
                  ) : (
                    <p className="text-[11px] text-black mb-4 line-clamp-2 leading-relaxed italic">"{item.displayReason}"</p>
                  )}
                  <div className="flex items-center gap-2">
                    {item.requestType === 'Leave' ? (
                      <>
                        <button
                          onClick={() => handleUpdateLeaveStatus(item.leaveId || item.id, 'approved')}
                          className="flex-1 py-2 text-white text-[10px] font-black rounded-xl shadow-lg transition-all uppercase tracking-widest" style={{backgroundColor: '#c97a4c', boxShadow: '0 10px 15px -3px rgba(201, 122, 76, 0.2)'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleUpdateLeaveStatus(item.leaveId || item.id, 'rejected')}
                          className="flex-1 py-2 bg-white border border-slate-200 text-black text-[10px] font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
                        >
                          Ignore
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={async () => {
                            await updateTicketStatus(item.ticketId || item.id, 'approved');
                            setBackendTickets(prev => prev.filter(t => t.id !== item.id));
                            notify('Ticket approved successfully', 'success');
                            fetchTickets();
                          }}
                          className="flex-1 py-2 text-white text-[10px] font-black rounded-xl shadow-lg transition-all uppercase tracking-widest" style={{backgroundColor: '#c97a4c', boxShadow: '0 10px 15px -3px rgba(201, 122, 76, 0.2)'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
                        >
                          Approve
                        </button>
                        <button
                          onClick={async () => {
                            await updateTicketStatus(item.ticketId || item.id, 'rejected');
                            setBackendTickets(prev => prev.filter(t => t.id !== item.id));
                            notify('Ticket rejected', 'success');
                            fetchTickets();
                          }}
                          className="flex-1 py-2 bg-white border border-slate-200 text-black text-[10px] font-black rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest"
                        >
                          Ignore
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-10 opacity-40">
                  <Icon name="Inbox" className="w-12 h-12 text-black mb-2" />
                  <p className="text-sm text-black font-bold">Queue Empty</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;