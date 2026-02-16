// src/pages/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCheck, UserX, Umbrella, Clock, Timer, CalendarDays, Calendar,
  CheckCircle, XCircle, Coffee, Plus, MessageCircle,
  RefreshCw, History
} from 'lucide-react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { useLeave } from '../../context/LeaveContext.tsx';
import { getUserSpecificKey } from '../../utils/storage.ts';

ChartJS.register(ArcElement, Tooltip, Legend);

// Unified Holiday List - Source of Truth (2026)
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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { leaveBalance, onLeaveCount, upcomingLeaves } = useLeave(); // (upcomingLeaves kept as-is if you use it elsewhere)

  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState<any>(null);
  const [selectedMonth, setSelectedMonth] = useState<'current' | 'previous'>('current');

  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    lateArrivals: 0,
    monthlyWorkHours: 0,
    presentRate: 0,
    absentRate: 0
  });

  // status: not_checked_in | checked_in | checked_out
  const [todayStatus, setTodayStatus] = useState({
    status: 'not_checked_in',
    checkIn: '--:--',
    checkOut: '--:--',
    todayWorkHours: 0,
    canPunch: true
  });

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  // Filter the next 3 holidays from today's date
  const upcomingHolidays = SYSTEM_HOLIDAYS
    .filter(h => {
      const hDate = new Date(h.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return hDate >= today;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)
    .map((h, idx) => ({
      id: idx,
      name: h.name,
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      day: new Date(h.date).toLocaleDateString('en-US', { weekday: 'long' }),
      type: 'public'
    }));

  // Local date string helper to avoid UTC mismatch
  const getLocalDStr = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // ✅ sessions-aware derive helper (supports old model too)
  const deriveFromAttendance = (rec: any) => {
    const sessions = Array.isArray(rec?.sessions) ? rec.sessions : [];

    const firstIn =
      rec?.firstIn ||
      rec?.timeIn ||
      (sessions.length ? sessions[0]?.in : null) ||
      null;

    const lastOut =
      rec?.lastOut ||
      rec?.timeOut ||
      (sessions.length ? (sessions.slice().reverse().find((s: any) => s?.out)?.out || null) : null);

    const hasOpenSession = sessions.length > 0 && !sessions[sessions.length - 1]?.out;

    // totalMs: prefer stored totalMs else compute from sessions (open session counts up to now)
    const totalMs =
      typeof rec?.totalMs === 'number'
        ? rec.totalMs
        : sessions.length
          ? sessions.reduce((sum: number, s: any) => {
            if (!s?.in) return sum;
            const start = new Date(s.in).getTime();
            const end = s?.out ? new Date(s.out).getTime() : Date.now();
            return sum + Math.max(0, end - start);
          }, 0)
          : 0;

    const workingHours =
      typeof rec?.workingHours === 'number' && rec.workingHours > 0
        ? rec.workingHours
        : parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2));

    const isLate = firstIn ? new Date(firstIn).getHours() >= 9 : false;

    return { firstIn, lastOut, totalMs, workingHours, isLate, hasOpenSession };
  };

  const calculateMonthlyHours = (records: any[], month: Date) => {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

    let totalHours = 0;

    const monthRecords = records.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= monthStart && recordDate <= monthEnd;
    });

    monthRecords.forEach(record => {
      const derived = deriveFromAttendance(record);
      if (derived.workingHours && typeof derived.workingHours === 'number') {
        totalHours += derived.workingHours;
      }
    });

    return parseFloat(totalHours.toFixed(2));
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);

    const loadData = () => {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      setUser(userData);

      const records = JSON.parse(localStorage.getItem(getUserSpecificKey('attendance_records')) || '[]');
      const leaves = JSON.parse(localStorage.getItem(getUserSpecificKey('leave_requests')) || '[]');

      const todayStr = getLocalDStr(new Date());

      // ✅ Today's status (sessions-aware)
      const todayRec = records.find((r: any) => r.date === todayStr);
      if (todayRec) {
        const derived = deriveFromAttendance(todayRec);

        const status = derived.firstIn
          ? (derived.hasOpenSession ? 'checked_in' : 'checked_out')
          : 'not_checked_in';

        setTodayStatus({
          status,
          checkIn: derived.firstIn
            ? new Date(derived.firstIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--:--',
          checkOut: derived.lastOut
            ? new Date(derived.lastOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '--:--',
          todayWorkHours: parseFloat((derived.workingHours || 0).toFixed(2)),
          // You can always punch again unless your Attendance page blocks it by holiday/weekend rules.
          canPunch: true
        });
      } else {
        setTodayStatus({
          status: 'not_checked_in',
          checkIn: '--:--',
          checkOut: '--:--',
          todayWorkHours: 0,
          canPunch: true
        });
      }

      const now = new Date();
      let startDate: Date;
      let endDate: Date;

      if (selectedMonth === 'current') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        endDate = new Date(now.getFullYear(), now.getMonth(), 0);
      }

      let presentCount = 0;
      let absentCount = 0;
      let lateCount = 0;

      const iter = new Date(startDate);
      iter.setHours(12, 0, 0, 0);
      const realToday = new Date();
      realToday.setHours(0, 0, 0, 0);

      while (iter <= endDate) {
        const dStr = getLocalDStr(iter);
        const isWeekend = iter.getDay() === 0 || iter.getDay() === 6;
        const holiday = SYSTEM_HOLIDAYS.find(h => h.date === dStr);
        const record = records.find((r: any) => r.date === dStr);

        const onLeave = leaves.some((l: any) => {
          const lStatus = (l.status || 'pending').toLowerCase();
          if (lStatus !== 'approved') return false;
          return dStr >= l.startDate && dStr <= l.endDate;
        });

        if (record) {
          const derived = deriveFromAttendance(record);
          if (derived.firstIn) {
            presentCount++;
            if (derived.isLate) lateCount++;
          } else if (onLeave) {
            // leave handled by context
          } else if (!isWeekend && !holiday && iter < realToday) {
            absentCount++;
          }
        } else if (onLeave) {
          // leave handled by context
        } else if (!isWeekend && !holiday && iter < realToday) {
          absentCount++;
        }

        iter.setDate(iter.getDate() + 1);
      }

      const totalDays = Math.max(1, presentCount + absentCount + onLeaveCount);

      // ✅ Monthly hours (sessions-aware)
      const targetMonth = selectedMonth === 'current' ? now : new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const monthlyWorkHours = calculateMonthlyHours(records, targetMonth);

      setStats({
        present: presentCount,
        absent: absentCount,
        lateArrivals: lateCount,
        monthlyWorkHours,
        presentRate: Math.round((presentCount / totalDays) * 100),
        absentRate: Math.round((absentCount / totalDays) * 100)
      });

      // ✅ Recent activities (sessions-aware)
      const activities = records
        .slice()
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
        .map((r: any) => {
          const derived = deriveFromAttendance(r);
          const type = derived.hasOpenSession ? 'checkin' : (derived.lastOut ? 'checkout' : 'checkin');
          const displayTime = derived.hasOpenSession
            ? (derived.firstIn ? new Date(derived.firstIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--')
            : (derived.lastOut ? new Date(derived.lastOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--');

          return {
            id: r.id || `att-${r.date}`,
            type,
            time: displayTime,
            date: r.date === todayStr ? 'Today' : new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            status: derived.isLate ? 'late' : 'on_time',
            description: derived.hasOpenSession ? 'Checked in (Active)' : (derived.lastOut ? 'Checked out' : 'Checked in'),
            workHours: typeof derived.workingHours === 'number' ? `${derived.workingHours.toFixed(2)} hrs` : '--'
          };
        });

      setRecentActivities(activities);
    };

    loadData();

    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorage);
    };
  }, [selectedMonth, onLeaveCount]);

  const chartData = {
    labels: ['Present', 'Absent', 'On Leave', 'Late'],
    datasets: [{
      data: [stats.present, stats.absent, leaveBalance.used, stats.lateArrivals],
      backgroundColor: ['#10b981', '#ef4444', '#3b82f6', '#f59e0b'],
      borderColor: '#ffffff',
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            family: "'Inter', sans-serif",
            size: 12,
            weight: 600
          }
        }
      },
    },
  };

  const getStatusButton = () => {
    switch (todayStatus.status) {
      case 'not_checked_in':
        return {
          text: 'Check In',
          color: 'bg-blue-600 hover:bg-blue-700',
          icon: <CheckCircle className="w-4 h-4" />
        };
      case 'checked_in':
        return {
          text: 'Check Out',
          color: 'bg-green-600 hover:bg-green-700',
          icon: <XCircle className="w-4 h-4" />
        };
      case 'checked_out':
        return {
          text: 'Check In Again',
          color: 'bg-blue-600 hover:bg-blue-700',
          icon: <CheckCircle className="w-4 h-4" />
        };
      default:
        return {
          text: 'Check In',
          color: 'bg-blue-600 hover:bg-blue-700',
          icon: <CheckCircle className="w-4 h-4" />
        };
    }
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const statusButton = getStatusButton();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 font-sans">
      <div className="mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Welcome back, {user?.firstName || user?.name || 'Employee'}!
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Monthly overview for <span className="font-bold">
                {selectedMonth === 'current'
                  ? currentTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                  : new Date(new Date().getFullYear(), new Date().getMonth() - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </span>
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/attendance')}
              className="px-4 md:px-6 py-2.5 md:py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold flex items-center gap-2 shadow-md shadow-blue-100"
            >
              <CheckCircle className="w-4 h-4 md:w-5 md:h-5" /> Mark Attendance
            </button>
            <button
              onClick={() => navigate('/leave')}
              className="px-4 md:px-6 py-2.5 md:py-3 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-semibold flex items-center gap-2"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" /> Apply Leave
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4 mb-6">
        {/* Present Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow min-h-[160px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.present}</span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mt-6">Present</p>
            <p className="text-xs font-semibold text-green-600">{stats.presentRate}% Rate</p>
          </div>
        </div>

        {/* Absent Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow min-h-[160px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <UserX className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.absent}</span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mt-6">Absent</p>
            <p className="text-xs font-semibold text-red-600">{stats.absentRate}% Rate</p>
          </div>
        </div>

        {/* On Leave Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow min-h-[160px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Umbrella className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{leaveBalance.used}</span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mt-6">On Leave</p>
            <p className="text-xs font-semibold text-blue-600">Days used</p>
          </div>
        </div>

        {/* Late Arrivals Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow min-h-[160px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.lateArrivals}</span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mt-6">Late Arrivals</p>
            <p className="text-xs font-semibold text-yellow-600">Month Total</p>
          </div>
        </div>

        {/* Monthly Work Hours Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow min-h-[160px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Timer className="w-5 h-5 text-indigo-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{formatHours(stats.monthlyWorkHours)}</span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mt-6">Monthly Hours</p>
            <p className="text-xs font-semibold text-indigo-600">
              {selectedMonth === 'current' ? 'Current Month' : 'Previous Month'}
            </p>
          </div>
        </div>

        {/* Leave Balance Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow min-h-[160px]">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{leaveBalance.available}</span>
          </div>
          <div className="mt-3">
            <p className="text-sm text-gray-600 mt-6">Leave Bal.</p>
            <p className="text-xs font-semibold text-purple-600">Days left</p>
          </div>
        </div>

        {/* Today's Status Card */}
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl p-4 text-white hover:shadow-lg transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 opacity-70 ml-4" />
              <span className="text-sm font-semibold">Today</span>
            </div>
          </div>
          <div className="space-y-6 text-xs">
            <div className="flex justify-between opacity-90 font-bold mt-5">
              <span>IN: {todayStatus.checkIn}</span>
              <span>OUT: {todayStatus.checkOut}</span>
            </div>
            <button
              onClick={() => navigate('/attendance')}
              className={`w-full py-2 rounded-lg font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2 ${statusButton.color}`}
            >
              {statusButton.icon} {statusButton.text}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Attendance Distribution Chart */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Attendance Distribution</h2>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-widest outline-none text-black"
              title="Select month for attendance overview"
            >
              <option value="current">Current Month</option>
              <option value="previous">Previous Month</option>
            </select>
          </div>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={chartData} options={chartOptions} />
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Monthly Total Hours: <span className="font-bold text-indigo-700">{formatHours(stats.monthlyWorkHours)}</span>
            </p>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Activity Log</h2>
            <button
              onClick={() => window.location.reload()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh activity log"
            >
              <RefreshCw className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="space-y-4">
            {recentActivities.length > 0 ? recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.status === 'on_time' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 text-sm">{activity.description}</div>
                  <div className="text-xs text-gray-600">{activity.time} • {activity.date}</div>
                  {activity.workHours && activity.workHours !== '--' && (
                    <div className="text-xs font-semibold text-indigo-600 mt-1">
                      {activity.workHours}
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-400">
                <History size={48} className="mx-auto opacity-10 mb-2" />
                <p className="text-xs font-bold uppercase tracking-widest">Awaiting Logs</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Mark Attendance', path: '/attendance', icon: CheckCircle, color: 'bg-blue-100 text-blue-600' },
              { label: 'Apply Leave', path: '/leave', icon: Plus, color: 'bg-green-100 text-green-600' },
              { label: 'View Calendar', path: '/calendar', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
              { label: 'Support', path: '/requests', icon: MessageCircle, color: 'bg-amber-100 text-amber-600' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => action.path !== '#' && navigate(action.path)}
                className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center justify-center gap-3"
              >
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color}`}>
                  <action.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-gray-900 text-center">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Coffee className="w-5 h-5 text-rose-500" /> Upcoming Holidays
          </h2>
          <div className="space-y-4">
            {upcomingHolidays.map((holiday) => (
              <div key={holiday.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                    <Coffee className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 text-sm">{holiday.name}</div>
                    <div className="text-xs text-gray-600">{holiday.day}, {holiday.date}</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-white rounded-full text-[10px] font-black text-gray-600 border border-gray-300 uppercase">Holiday</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
