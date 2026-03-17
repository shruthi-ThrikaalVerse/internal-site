// src/pages/admin/AdminCalendar.tsx
import React, { useState, useEffect } from 'react';
import {
  ChevronLeft, ChevronRight, X, Clock, Calendar as CalendarIcon,
  AlertTriangle, CheckCircle2, TrendingUp, Briefcase,
  CalendarDays, MapPin, Users, MoreHorizontal
} from 'lucide-react';
import { CalendarAttendanceRecord, User } from '../../types.ts';
import { useAuth } from '../../context/AuthContext.tsx';

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

const WORKING_SATURDAYS = [
  '2026-01-31', '2026-02-14', '2026-03-21', '2026-04-18', '2026-05-23',
  '2026-06-13', '2026-07-25', '2026-08-22', '2026-09-26', '2026-10-17',
  '2026-11-21', '2026-12-26',
];

interface CalendarEvent {
  id: number;
  eventId: number;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  addedAt: string;
}



const AdminCalendar: React.FC = () => {
  const { user }: { user: User | null } = useAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<CalendarAttendanceRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<CalendarAttendanceRecord | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTodayPresent, setIsTodayPresent] = useState(false);
  const [monthlyStats, setMonthlyStats] = useState({
    totalHours: 0,
    workDays: 0,
    leaves: 0,
    holidays: 0,
    workingSaturdays: 0,
    eventDays: 0
  });
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    setCurrentMonth(new Date());
    setAttendanceRecords([]);
    setSelectedRecord(null);
    setSelectedEvents([]);
    setIsModalOpen(false);
    setIsTodayPresent(false);
    setMonthlyStats({
      totalHours: 0,
      workDays: 0,
      leaves: 0,
      holidays: 0,
      workingSaturdays: 0,
      eventDays: 0
    });
  }, [user?.id]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize('mobile');
      else if (width < 1024) setScreenSize('tablet');
      else setScreenSize('desktop');
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const formatDateString = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isWorkingSaturday = (dateStr: string) => {
    return WORKING_SATURDAYS.includes(dateStr);
  };

  // Calendar events, attendance, and leaves should be fetched from backend API
  const loadCalendarEvents = (): CalendarEvent[] => {
    // TODO: Replace with backend API call for admin calendar events
    return [];
  };

  const deriveFromAttendance = (rec: any) => {
    const sessions = Array.isArray(rec.sessions) ? rec.sessions : [];
    const timeIn =
      rec.timeIn ||
      rec.firstIn ||
      (sessions.length ? sessions[0]?.in : null) ||
      null;
    const timeOut =
      rec.timeOut ||
      rec.lastOut ||
      (sessions.length ? (sessions.slice().reverse().find((s: any) => s.out)?.out || null) : null);
    const totalMs =
      typeof rec.totalMs === 'number'
        ? rec.totalMs
        : sessions.length
          ? sessions.reduce((sum: number, s: any) => {
            const start = new Date(s.in).getTime();
            const end = s.out ? new Date(s.out).getTime() : Date.now();
            return sum + Math.max(0, end - start);
          }, 0)
          : 0;
    const workingHours =
      typeof rec.workingHours === 'number' && rec.workingHours > 0
        ? rec.workingHours
        : parseFloat((totalMs / (1000 * 60 * 60)).toFixed(2));
    const isLate = timeIn ? new Date(timeIn).getHours() >= 9 : false;
    const totalHours =
      workingHours
        ? `${Math.floor(workingHours)}:${String(Math.round((workingHours % 1) * 60)).padStart(2, '0')}:00`
        : undefined;
    const activeSession = sessions.length > 0 && !sessions[sessions.length - 1].out;
    const legacyActive = !!(rec.timeIn && !rec.timeOut);
    return { timeIn, timeOut, workingHours, totalHours, isLate, activeSession: activeSession || legacyActive };
  };

  const calculateMonthlyStats = (records: CalendarAttendanceRecord[], calendarEvents: CalendarEvent[]) => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let totalHours = 0;
    let workDays = 0;
    let leaves = 0;
    let holidays = 0;
    let workingSaturdays = 0;
    let eventDays = 0;
    const eventDates = new Set<string>();
    const currentDate = new Date(firstDay);
    while (currentDate <= lastDay) {
      const dateStr = formatDateString(currentDate);
      const record = records.find(r => r.date === dateStr);
      const isSat = currentDate.getDay() === 6;
      const hasEvents = calendarEvents.some(event => event.date === dateStr);
      if (hasEvents) {
        eventDates.add(dateStr);
      }
      if (record) {
        if (record.status === 'Present' || record.status === 'Late') {
          workDays++;
          totalHours += record.workingHours || 0;
          if (isSat && isWorkingSaturday(dateStr)) {
            workingSaturdays++;
          }
        } else if (record.status === 'On Leave') {
          leaves++;
        } else if (record.status === 'Holiday') {
          holidays++;
        } else if (record.status === 'Working Saturday') {
          workingSaturdays++;
          workDays++;
          totalHours += record.workingHours || 0;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    setMonthlyStats({
      totalHours: parseFloat(totalHours.toFixed(2)),
      workDays,
      leaves,
      holidays,
      workingSaturdays,
      eventDays: eventDates.size
    });
  };

  const refreshData = async () => {
    // Fetch CURRENT ADMIN's own attendance records from backend
    let recordsArray: CalendarAttendanceRecord[] = [];
    try {
      // Get current admin's employee ID
      const adminEmployeeId = user?.employeeId || user?.id;

      if (!adminEmployeeId) {
        console.warn('Admin employee ID not found');
        return;
      }

      const year = currentMonth.getFullYear();
      const month = currentMonth.getMonth() + 1;
      const from = `${year}-${String(month).padStart(2, '0')}-01`;
      const to = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`;
      const params = new URLSearchParams();
      params.set('from', from);
      params.set('to', to);
      params.set('employeeId', String(adminEmployeeId)); // Filter for current admin only

      const url = `http://localhost:8085/api/employee_attend/attendance?${params.toString()}`;
      const resp = await fetch(url, { method: 'GET', credentials: 'include' });
      if (resp.ok) {
        const data = await resp.json().catch(() => []);
        // Handle both array and object response formats
        const arr = Array.isArray(data) ? data : (Array.isArray(data?.data) ? data.data : (data?.attendance ? [data] : []));

        recordsArray = arr.map((record: any) => ({
          id: record.id || `${adminEmployeeId}-${record.date}`,
          date: record.date,
          status: record.status || 'Absent',
          timeIn: record.timeIn || null,
          timeOut: record.timeOut || null,
          workingHours: record.workingHours || 0,
          isLate: record.isLate || false,
          locationName: record.locationName || null,
          sessions: record.sessions || []
        }));

        console.log(`Loaded ${recordsArray.length} attendance records for admin ${adminEmployeeId}`);
      }
    } catch (err) {
      console.warn('Failed to fetch admin attendance:', err);
    }
    const calendarEvents: CalendarEvent[] = loadCalendarEvents();
    setAttendanceRecords(recordsArray);
    calculateMonthlyStats(recordsArray, calendarEvents);
  };

  useEffect(() => {
    refreshData();
    const handleStorage = () => refreshData();
    window.addEventListener('storage', handleStorage);
    const handleCalendarUpdate = () => refreshData();
    window.addEventListener('calendarEventsUpdated', handleCalendarUpdate);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('calendarEventsUpdated', handleCalendarUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMonth]);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = screenSize === 'mobile'
    ? ["S", "M", "T", "W", "T", "F", "S"]
    : ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
  const years = [2024, 2025, 2026, 2027];

  const handleYearChange = (year: number) => setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
  const handleMonthChange = (monthIdx: number) => setCurrentMonth(new Date(currentMonth.getFullYear(), monthIdx, 1));

  const getMarkerColorClass = (record: CalendarAttendanceRecord) => {
    if (record.isLate) return 'bg-amber-400';
    switch (record.status) {
      case 'Present': return 'bg-emerald-500';
      case 'Absent': return 'bg-red-500';
      case 'On Leave': return 'bg-[#f5ede3]';
      case 'Holiday': return 'bg-purple-500';
      case 'Weekend': return 'bg-slate-400';
      case 'Working Saturday': return 'bg-orange-500';
      default: return 'bg-transparent';
    }
  };

  const getBGColorClass = (record: CalendarAttendanceRecord) => {
    if (record.isLate || record.status === 'Present') return 'bg-emerald-500';
    switch (record.status) {
      case 'Absent': return 'bg-red-500';
      case 'On Leave': return 'bg-blue-500';
      case 'Holiday': return 'bg-purple-500';
      case 'Weekend': return 'bg-slate-400';
      case 'Working Saturday': return 'bg-orange-500';
      default: return 'bg-transparent';
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'workshop': return 'bg-green-100 text-green-700 border-green-200';
      case 'training': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'conference': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'team_building': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'celebration': return 'bg-pink-100 text-pink-700 border-pink-200';
      case 'anniversary': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'party': return 'bg-red-100 text-red-700 border-red-200';
      case 'health_checkup': return 'bg-teal-100 text-teal-700 border-teal-200';
      case 'awards': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'webinar': return 'bg-[#f5ede3] text-[#8b5a3c] border-[2px]' + ' border-[#c97a4c]';
      case 'social': return 'bg-cyan-100 text-cyan-700 border-cyan-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getDayBGClass = (day: any) => {
    if (!day.isCurrentMonth) {
      return 'bg-slate-50 opacity-40';
    }
    if (day.record) {
      if (day.record.status === 'Working Saturday') return 'bg-orange-50';
      if (day.record.isLate || day.record.status === 'Present') return 'bg-emerald-50';
      if (day.record.status === 'Absent') return 'bg-red-50';
      if (day.record.status === 'On Leave') return 'bg-[#f0e6dc]';
      if (day.record.status === 'Holiday') return 'bg-purple-50';
      if (day.record.status === 'Weekend') return 'bg-slate-50';
    } else if (day.isWeekend && !isWorkingSaturday(formatDateString(day.date))) {
      return 'bg-slate-50';
    }
    return '';
  };

  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();
    const days: any[] = [];
    const todayStr = formatDateString(new Date());
    const calendarEvents = loadCalendarEvents();
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month, -i),
        isCurrentMonth: false,
        record: null,
        events: []
      });
    }
    for (let d = 1; d <= lastDate; d++) {
      const date = new Date(year, month, d);
      const dateStr = formatDateString(date);
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isWorkingSat = isWorkingSaturday(dateStr);
      let record = attendanceRecords.find(r => r.date === dateStr);
      const dayEvents = calendarEvents.filter((event: CalendarEvent) => event.date === dateStr);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (isWorkingSat && !record) {
        record = {
          id: `working-sat-${dateStr}`,
          date: dateStr,
          status: 'Working Saturday',
          timeIn: null,
          timeOut: null,
          workingHours: 0,
          isLate: false
        };
      }
      else if (isWeekend && !record && !isWorkingSat) {
        record = {
          id: `weekend-${dateStr}`,
          date: dateStr,
          status: 'Weekend',
          timeIn: null,
          timeOut: null,
          workingHours: 0,
          isLate: false
        };
      }
      else if (!record && !isWeekend && date < today) {
        record = {
          id: `absent-${dateStr}`,
          date: dateStr,
          status: 'Absent',
          timeIn: null,
          timeOut: null,
          workingHours: 0,
          isLate: false
        };
      }
      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        isWeekend,
        isWorkingSaturday: isWorkingSat,
        record,
        events: dayEvents
      });
    }
    while (days.length < 42) {
      days.push({
        date: new Date(year, month + 1, days.length - lastDate - firstDay + 1),
        isCurrentMonth: false,
        record: null,
        events: []
      });
    }
    return days;
  };

  const formatTime = (iso: string | null) => {
    if (!iso) return '--:--';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatTimeRange = (startTime?: string, endTime?: string) => {
    if (!startTime) return '';
    const formatSingleTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    if (!endTime) return formatSingleTime(startTime);
    return `${formatSingleTime(startTime)} - ${formatSingleTime(endTime)}`;
  };

  const formatHours = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date > today;
  };

  const handleDayClick = (day: any) => {
    if (day.record) {
      setSelectedRecord(day.record);
      setSelectedEvents(day.events);
      setIsModalOpen(true);
    } else if (day.events.length > 0) {
      setSelectedRecord({
        id: `events-${formatDateString(day.date)}`,
        date: formatDateString(day.date),
        status: 'Events',
        timeIn: null,
        timeOut: null,
        workingHours: 0,
        isLate: false
      });
      setSelectedEvents(day.events);
      setIsModalOpen(true);
    } else if (day.isCurrentMonth && !day.isWeekend) {
      const futureRecord: CalendarAttendanceRecord = {
        id: `future-${formatDateString(day.date)}`,
        date: formatDateString(day.date),
        status: isFutureDate(day.date) ? 'Future' : 'Absent',
        timeIn: null,
        timeOut: null,
        workingHours: 0,
        isLate: false
      };
      setSelectedRecord(futureRecord);
      setSelectedEvents(day.events);
      setIsModalOpen(true);
    }
  };

  const getCalendarCellHeight = () => {
    switch (screenSize) {
      case 'mobile': return 'min-h-[80px]';
      case 'tablet': return 'min-h-[100px]';
      default: return 'min-h-[120px]';
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 lg:space-y-8 pb-8 sm:pb-12 lg:pb-16 font-inter px-2 sm:px-4 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 sm:p-6 lg:p-8 border border-slate-200 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] shadow-sm">
        <div className="text-center sm:text-left flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-4 sm:mb-0">
          <div>
            <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-slate-900 tracking-tight uppercase">
              Admin Attendance Calendar
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm font-medium mt-1">Multi-year records with direct navigation.</p>
          </div>
          {isTodayPresent && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-[1.5rem] border border-emerald-100 shadow-sm">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-black uppercase tracking-wider">Active</span>
            </div>
          )}
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl sm:rounded-2xl border border-slate-200 gap-1 w-full sm:w-auto">
            <button
              title="Previous month"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="text-black p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-600 transition-all"
            >
              <ChevronLeft size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </button>
            <div className="flex items-center gap-1 flex-1 justify-center sm:justify-start min-w-0">
              <select
                title="Select month"
                value={currentMonth.getMonth()}
                onChange={(e) => handleMonthChange(parseInt(e.target.value))}
                className="text-black bg-white border-none text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-1 rounded-lg outline-none cursor-pointer flex-1 sm:flex-none"
              >
                {monthNames.map((m, i) => <option key={i} value={i}>{screenSize === 'mobile' ? m.substring(0, 3) : m}</option>)}
              </select>
              <select
                title="Select year"
                value={currentMonth.getFullYear()}
                onChange={(e) => handleYearChange(parseInt(e.target.value))}
                className="text-black bg-white border-none text-[9px] sm:text-[10px] font-black uppercase tracking-wider px-1.5 sm:px-2 py-1 rounded-lg outline-none cursor-pointer flex-1 sm:flex-none"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
            <button
              title="Next month"
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-1.5 sm:p-2 bg-white rounded-lg sm:rounded-xl hover:bg-slate-50 text-slate-600 transition-all"
            >
              <ChevronRight size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
            </button>
          </div>
          <button
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 sm:px-4 py-1.5 sm:py-2 text-white text-xs font-black rounded-xl sm:rounded-2xl uppercase tracking-wider shadow active:scale-95 transition-all w-full sm:w-auto"
            style={{ backgroundColor: '#c97a4c' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
          >
            Today
          </button>
        </div>
      </div>

      {/* Monthly Stats Dashboard - Responsive */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl sm:rounded-2xl lg:rounded-[2rem] p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-emerald-600" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-emerald-500">Hours</span>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-emerald-900">{formatHours(monthlyStats.totalHours)}</p>
          <p className="text-[9px] sm:text-xs text-emerald-600 mt-1 font-medium truncate">
            {monthlyStats.workDays} work day{monthlyStats.workDays !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="bg-[#f5ede3] border-2 rounded-xl sm:rounded-2xl lg:rounded-[2rem] p-3 sm:p-4 lg:p-6 shadow-sm" style={{ borderColor: '#c97a4c' }}>
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8" style={{ color: '#c97a4c' }} />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-wider" style={{ color: '#c97a4c' }}>Work Days</span>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black" style={{ color: '#8b5a3c' }}>{monthlyStats.workDays}</p>
          <p className="text-[9px] sm:text-xs mt-1 font-medium truncate" style={{ color: '#c97a4c' }}>Days recorded</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl sm:rounded-2xl lg:rounded-[2rem] p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-indigo-600" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-indigo-500">Leaves</span>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-indigo-900">{monthlyStats.leaves}</p>
          <p className="text-[9px] sm:text-xs text-indigo-600 mt-1 font-medium truncate">Leave days</p>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl sm:rounded-2xl lg:rounded-[2rem] p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-purple-600" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-purple-500">Holidays</span>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-purple-900">{monthlyStats.holidays}</p>
          <p className="text-[9px] sm:text-xs text-purple-600 mt-1 font-medium truncate">Company holidays</p>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200 rounded-xl sm:rounded-2xl lg:rounded-[2rem] p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-orange-600" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-orange-500">Working Sats</span>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-orange-900">{monthlyStats.workingSaturdays}</p>
          <p className="text-[9px] sm:text-xs text-orange-600 mt-1 font-medium truncate">Scheduled Saturdays</p>
        </div>
        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl sm:rounded-2xl lg:rounded-[2rem] p-3 sm:p-4 lg:p-6 shadow-sm">
          <div className="flex items-center justify-between mb-2 sm:mb-3 lg:mb-4">
            <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-cyan-600" />
            <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-wider text-cyan-500">Events</span>
          </div>
          <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-cyan-900">{monthlyStats.eventDays}</p>
          <p className="text-[9px] sm:text-xs text-cyan-600 mt-1 font-medium truncate">Event days</p>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="bg-white border border-slate-200 rounded-xl sm:rounded-2xl lg:rounded-[3rem] shadow-lg lg:shadow-2xl overflow-hidden">
        {/* Fixed Day Headers */}
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200">
          <div className="grid grid-cols-7 bg-slate-50">
            {dayNames.map((d, idx) => (
              <div
                key={`day-${idx}`}
                className="py-2 sm:py-3 lg:py-4 xl:py-5 text-center text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>
        </div>
        {/* Calendar Days Grid */}
        <div className={`grid grid-cols-7 ${screenSize === 'mobile' ? 'gap-0.5' : 'gap-1'} p-0.5 sm:p-1`}>
          {generateCalendarDays().map((day, idx) => (
            <div
              key={idx}
              onClick={() => handleDayClick(day)}
              className={`
                ${getCalendarCellHeight()}
                p-1 sm:p-1.5 lg:p-2 xl:p-3
                transition-all flex flex-col justify-between cursor-pointer relative
                border border-slate-100 sm:border-slate-200
                ${getDayBGClass(day)}
                ${day.isToday ? 'ring-1 sm:ring-2 ring-blue-500 ring-inset' : 'hover:bg-slate-50/50'}
                overflow-hidden
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <div className="flex flex-col">
                  <span className={`
                    text-xs sm:text-sm font-black
                    ${day.isToday ? 'text-blue-600' : day.isCurrentMonth ? 'text-slate-800' : 'text-slate-300'}
                  `}>
                    {day.date.getDate()}
                    {day.isWorkingSaturday && (
                      <span className="ml-0.5 text-[6px] sm:text-[8px] lg:text-[10px] text-orange-600 font-black">*</span>
                    )}
                  </span>
                  {day.events.length > 0 && (
                    <div className="mt-0.5 flex items-center gap-0.5">
                      <CalendarDays className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 text-blue-500" />
                      {screenSize !== 'mobile' && (
                        <span className="text-[6px] sm:text-[7px] lg:text-[8px] font-bold text-blue-600">
                          {day.events.length}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {day.record && <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5 rounded-full ${getMarkerColorClass(day.record)}`}></div>}
              </div>
              <div className="flex-1 mt-0.5 sm:mt-1 lg:mt-2 space-y-0.5 sm:space-y-1 lg:space-y-1.5">
                {screenSize === 'mobile' ? (
                  <>
                    {day.record?.timeIn ? (
                      <div className={`
                        p-0.5 rounded-md border ${day.isWorkingSaturday ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'}
                      `}>
                        <p className={`text-[5px] font-black uppercase text-center ${day.isWorkingSaturday ? 'text-orange-600' : 'text-emerald-600'}`}>
                          {day.isWorkingSaturday ? 'SAT' : 'IN'}
                        </p>
                        <p className={`text-[6px] font-bold tabular-nums text-center ${day.record.isLate ? 'text-amber-700' : 'text-slate-800'}`}>
                          {formatTime(day.record.timeIn)?.split(':')[0]}:{formatTime(day.record.timeIn)?.split(':')[1]}
                        </p>
                      </div>
                    ) : day.record?.status === 'Working Saturday' ? (
                      <div className="text-[5px] sm:text-[6px] font-black text-orange-600 bg-orange-50 p-0.5 rounded-md border border-orange-100 text-center truncate">
                        SAT
                      </div>
                    ) : day.record?.status === 'Holiday' ? (
                      <div className="text-[5px] sm:text-[6px] font-black text-purple-600 bg-purple-50 p-0.5 rounded-md border border-purple-100 text-center truncate">
                        HOL
                      </div>
                    ) : day.record?.status === 'On Leave' ? (
                      <div className="text-[5px] sm:text-[6px] font-black text-blue-600 bg-blue-50 p-0.5 rounded-md border border-blue-100 text-center">LV</div>
                    ) : day.record?.status === 'Weekend' ? (
                      <div className="text-[5px] sm:text-[6px] font-black text-slate-600 bg-slate-100 p-0.5 rounded-md border border-slate-200 text-center">WE</div>
                    ) : day.record?.status === 'Absent' ? (
                      <div className="text-[5px] sm:text-[6px] font-black text-red-600 bg-red-50 p-0.5 rounded-md border border-red-100 text-center">AB</div>
                    ) : null}
                  </>
                ) : (
                  <>
                    {day.events.slice(0, screenSize === 'tablet' ? 1 : 2).map((event: CalendarEvent, eventIdx: number) => (
                      <div
                        key={event.id || eventIdx}
                        className={`text-[5px] sm:text-[6px] lg:text-[7px] font-bold truncate px-0.5 sm:px-1 lg:px-1.5 py-0.5 rounded
                          ${eventIdx === 0 ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-blue-100 text-blue-800 border border-blue-200'}`}
                        title={event.title}
                      >
                        {event.startTime ? `${event.startTime.split(':')[0]}:${event.startTime.split(':')[1]}` : ''} {event.title.length > 8 ? `${event.title.substring(0, 8)}...` : event.title}
                      </div>
                    ))}
                    {day.events.length > (screenSize === 'tablet' ? 1 : 2) && (
                      <div className="text-[4px] sm:text-[5px] lg:text-[6px] text-blue-500 font-bold text-center">
                        +{day.events.length - (screenSize === 'tablet' ? 1 : 2)} more
                      </div>
                    )}
                    {day.record?.timeIn ? (
                      <div className={`p-1 sm:p-1.5 lg:p-2 rounded-lg sm:rounded-xl border ${day.isWorkingSaturday ? 'bg-orange-50 border-orange-200' : 'bg-emerald-50 border-emerald-200'} shadow-sm`}>
                        <div className="flex items-center justify-center gap-0.5 mb-0.5">
                          <p className={`text-[6px] sm:text-[7px] lg:text-[8px] font-black uppercase tracking-wider ${day.isWorkingSaturday ? 'text-orange-600' : 'text-emerald-600'}`}>
                            {day.isWorkingSaturday ? 'WORK SAT' : 'PRESENT'}
                          </p>
                          {day.record.isLate && (
                            <span className="bg-amber-500 text-white px-0.5 py-0.25 rounded-sm text-[4px] sm:text-[5px] lg:text-[6px] font-black uppercase">LATE</span>
                          )}
                        </div>
                        <div className="space-y-0.25">
                          <div className="flex justify-between items-center">
                            <span className="text-[5px] sm:text-[6px] lg:text-[7px] font-black text-slate-400 uppercase">IN</span>
                            <span className={`text-[6px] sm:text-[7px] lg:text-[8px] font-bold tabular-nums ${day.record.isLate ? 'text-amber-700' : 'text-slate-800'}`}>
                              {formatTime(day.record.timeIn)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[5px] sm:text-[6px] lg:text-[7px] font-black text-slate-400 uppercase">OUT</span>
                            <span className="text-[6px] sm:text-[7px] lg:text-[8px] font-bold text-slate-800 tabular-nums">
                              {formatTime(day.record.timeOut)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : day.record?.status === 'Working Saturday' ? (
                      <div className="text-[6px] sm:text-[7px] lg:text-[8px] font-black text-orange-600 bg-orange-50 p-1 sm:p-1.5 rounded-lg border border-orange-100 text-center truncate">
                        <div className="flex items-center justify-center gap-0.5">
                          <Briefcase size={6} className="sm:w-1.5 sm:h-1.5 lg:w-2 lg:h-2" />
                          WORK SAT
                        </div>
                      </div>
                    ) : day.record?.status === 'Holiday' ? (
                      <div className="text-[6px] sm:text-[7px] lg:text-[8px] font-black text-purple-600 bg-purple-50 p-1 sm:p-1.5 rounded-lg border border-purple-100 text-center truncate">
                        {screenSize === 'tablet'
                          ? (day.record.locationName?.split(' ')[0]?.substring(0, 8) || 'HOLIDAY')
                          : (day.record.locationName?.split(' ')[0] || 'HOLIDAY')}
                      </div>
                    ) : day.record?.status === 'On Leave' ? (
                      <div className="text-[6px] sm:text-[7px] lg:text-[8px] font-black text-blue-600 bg-blue-50 p-1 sm:p-1.5 rounded-lg border border-blue-100 text-center truncate">ON LEAVE</div>
                    ) : day.record?.status === 'Weekend' ? (
                      <div className="text-[6px] sm:text-[7px] lg:text-[8px] font-black text-slate-600 bg-slate-100 p-1 sm:p-1.5 rounded-lg border border-slate-200 text-center">WEEKEND</div>
                    ) : day.record?.status === 'Absent' ? (
                      <div className="text-[6px] sm:text-[7px] lg:text-[8px] font-black text-red-600 bg-red-50 p-1 sm:p-1.5 rounded-lg border border-red-100 text-center">ABSENT</div>
                    ) : null}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend - Responsive */}
      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 lg:gap-6 bg-white p-3 sm:p-4 lg:p-6 xl:p-8 border border-slate-200 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] shadow-sm">
        <LegendItem label="Present" dotColor="#10b981" screenSize={screenSize} />
        <LegendItem label="Late" dotColor="#fbbf24" screenSize={screenSize} />
        <LegendItem label="Absent" dotColor="#ef4444" screenSize={screenSize} />
        <LegendItem label="Leave" dotColor="#c97a4c" screenSize={screenSize} />
        <LegendItem label="Holiday" dotColor="#8b5cf6" screenSize={screenSize} />
        <LegendItem label="Weekend" dotColor="#94a3b8" screenSize={screenSize} />
        <LegendItem label="Work Sat" dotColor="#f97316" screenSize={screenSize} />
        <LegendItem label="Event" dotColor="#c97a4c" screenSize={screenSize} />
      </div>

      {/* Modal */}
      {isModalOpen && (selectedRecord || selectedEvents.length > 0) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 lg:p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg rounded-xl sm:rounded-2xl lg:rounded-[3.5rem] shadow-2xl border border-slate-200 overflow-hidden mx-2 sm:mx-4">
            <div className="px-4 sm:px-6 lg:px-8 py-3 sm:py-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-black text-slate-800 uppercase tracking-wider text-[9px] sm:text-[10px]">Day Details</h3>
              <button
                type="button"
                title="Close modal"
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedEvents([]);
                  setSelectedRecord(null);
                }}
                className="p-1.5 sm:p-2 lg:p-3 hover:bg-slate-100 rounded-lg sm:rounded-xl lg:rounded-2xl text-slate-400 transition-all active:scale-90"
              >
                <X size={16} className="sm:w-4 sm:h-4 lg:w-5 lg:h-5" />
              </button>
            </div>
            <div className="p-4 sm:p-6 lg:p-8 space-y-3 sm:space-y-4 lg:space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="text-center">
                <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-black text-slate-900">
                  {selectedRecord && new Date(selectedRecord.date).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
                {selectedRecord && selectedRecord.status !== 'Events' && (
                  <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                    <div className={`px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white ${selectedRecord.status === 'Working Saturday' ? 'bg-orange-500' :
                      selectedRecord.timeIn ? 'bg-emerald-500' :
                        selectedRecord.status === 'Future' ? 'bg-gray-500' :
                          selectedRecord.status === 'Weekend' ? 'bg-slate-400' :
                            getBGColorClass(selectedRecord)
                      }`}>
                      {selectedRecord.status === 'Future' ? 'FUTURE' :
                        selectedRecord.status === 'Weekend' ? 'WEEKEND' :
                          selectedRecord.status === 'Working Saturday' ? 'WORKING SAT' :
                            selectedRecord.timeIn ? 'PRESENT' :
                              selectedRecord.status}
                    </div>
                    {selectedRecord.isLate && (
                      <div className="px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white flex items-center gap-0.5">
                        <AlertTriangle size={10} className="sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3" /> LATE
                      </div>
                    )}
                  </div>
                )}
              </div>
              {selectedEvents.length > 0 && (
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <CalendarDays className="w-3.5 h-3.5 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-blue-600" />
                    <h4 className="text-xs sm:text-sm font-black text-slate-800 uppercase tracking-wider">Events ({selectedEvents.length})</h4>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2 max-h-32 sm:max-h-40 overflow-y-auto pr-1">
                    {selectedEvents.map((event, idx) => (
                      <div key={event.id || idx} className="p-2 sm:p-3 lg:p-4 bg-blue-50 rounded-lg sm:rounded-xl lg:rounded-2xl border border-blue-100">
                        <div className="flex justify-between items-start mb-1 sm:mb-1.5 lg:mb-2">
                          <h5 className="font-bold text-blue-900 text-xs sm:text-sm truncate flex-1 mr-2">{event.title}</h5>
                          <span className={`px-1 sm:px-1.5 lg:px-2 py-0.5 rounded-full text-[6px] sm:text-[7px] lg:text-[8px] font-bold uppercase ${getEventTypeColor(event.type)} shrink-0`}>
                            {event.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="space-y-0.5 sm:space-y-1 text-[9px] sm:text-[10px] lg:text-xs text-blue-700">
                          {event.startTime && (
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <Clock className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3" />
                              <span className="font-medium">{formatTimeRange(event.startTime, event.endTime)}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <MapPin className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3" />
                              <span className="truncate">{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {selectedRecord && selectedRecord.timeIn ? (
                <div className="space-y-2 sm:space-y-3">
                  <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
                    <div className="bg-slate-50 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-100 text-center">
                      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-0.5 flex items-center justify-center gap-0.5">
                        <Clock size={7} className="sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5" /> Entry
                      </p>
                      <p className={`text-xs sm:text-sm font-black ${selectedRecord.isLate ? 'text-amber-600' : 'text-slate-800'}`}>{formatTime(selectedRecord.timeIn)}</p>
                    </div>
                    <div className="bg-slate-50 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl border border-slate-100 text-center">
                      <p className="text-[8px] sm:text-[9px] font-black text-slate-400 uppercase mb-0.5 flex items-center justify-center gap-0.5">
                        <CheckCircle2 size={7} className="sm:w-2 sm:h-2 lg:w-2.5 lg:h-2.5" /> Exit
                      </p>
                      <p className="text-xs sm:text-sm font-black text-slate-800">{formatTime(selectedRecord.timeOut)}</p>
                    </div>
                  </div>
                  {selectedRecord.totalHours && (
                    <div className="bg-blue-50 border border-blue-100 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center">
                      <p className="text-[8px] sm:text-[9px] font-black text-blue-400 uppercase tracking-wider mb-0.5">Duration</p>
                      <p className="text-sm sm:text-base lg:text-lg font-black text-blue-700 tabular-nums">{selectedRecord.totalHours}</p>
                    </div>
                  )}
                </div>
              ) : selectedRecord && selectedRecord.status !== 'Events' ? (
                <div className="bg-slate-50 border border-slate-200 p-3 sm:p-4 lg:p-6 rounded-lg sm:rounded-xl lg:rounded-2xl text-center">
                  <p className="text-xs sm:text-sm font-bold text-slate-600 mb-1.5">
                    {selectedRecord.status === 'Future' ? 'Future Date' : 'No attendance record'}
                  </p>
                  {selectedRecord.status === 'Working Saturday' && (
                    <p className="text-[9px] sm:text-[10px] lg:text-xs text-orange-600 font-medium">
                      This is a scheduled working Saturday
                    </p>
                  )}
                </div>
              ) : null}
              {selectedRecord?.locationName && selectedRecord.status === 'Holiday' && (
                <div className="bg-purple-50 border border-purple-100 p-2 sm:p-3 lg:p-4 rounded-lg sm:rounded-xl lg:rounded-2xl text-center">
                  <p className="text-xs sm:text-sm font-bold text-purple-700">{selectedRecord.locationName}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const LegendItem = ({ label, dotColor, screenSize }: { label: string; dotColor: string; screenSize: 'mobile' | 'tablet' | 'desktop' }) => {
  const shortLabel = screenSize === 'mobile'
    ? label.split(' ')[0]
    : screenSize === 'tablet'
      ? (label.length > 12 ? label.split(' ').map(word => word[0]).join('') : label)
      : label;
  return (
    <div className="flex items-center gap-1 sm:gap-1.5">
      <div
        className="w-2 h-2 sm:w-2.5 sm:h-2.5 lg:w-3 lg:h-3 rounded-full shadow-sm"
        style={{ backgroundColor: dotColor } as React.CSSProperties}
      ></div>
      <span className="text-[8px] sm:text-[9px] lg:text-[10px] font-black text-slate-500 uppercase tracking-wider truncate max-w-[50px] sm:max-w-[60px] lg:max-w-none">
        {shortLabel}
      </span>
    </div>
  );
};

export default AdminCalendar;
