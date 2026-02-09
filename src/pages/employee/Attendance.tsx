import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock, Play, Square, MapPin,
  Timer, Navigation, Activity, ArrowUpRight, ArrowDownLeft, Loader2, Check, X, Filter, RotateCcw,
  CheckCircle, Calendar, Coffee, Briefcase
} from 'lucide-react';
import { AttendanceRecord as SharedAttendanceRecord } from '../../types.ts';
import { GoogleGenAI } from "@google/genai";
import { getUserSpecificKey } from '../../utils/storage.ts';

// Add this SYSTEM_HOLIDAYS array to the attendance component
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

// Add WORKING_SATURDAYS array
const WORKING_SATURDAYS = [
  '2026-01-31', // January 31st
  '2026-02-14', // February 14
  '2026-03-21', // March 21
  '2026-04-18', // April 18
  '2026-05-23', // May 23
  '2026-06-13', // June 13
  '2026-07-25', // July 25
  '2026-08-22', // August 22
  '2026-09-26', // September 26
  '2026-10-17', // October 17
  '2026-11-21', // November 21
  '2026-12-26', // December 26
];

// Create an extended interface for attendance component
interface AttendanceRecord extends SharedAttendanceRecord {
  location?: string;
  locationName?: string;
  // Make these optional to match the parent interface
  timeIn: string;
  timeOut: string;
}

const Attendance: React.FC = () => {
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isPunchedIn, setIsPunchedIn] = useState<boolean>(false);
  const [todayRecord, setTodayRecord] = useState<AttendanceRecord | null>(null);
  const [workDuration, setWorkDuration] = useState<string>('00:00:00');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Filtering states (FROM OLD CODE)
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  // Manual location naming states
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [customLocationName, setCustomLocationName] = useState('');

  // Confirmation dialog state
  const [showCheckoutConfirm, setShowCheckoutConfirm] = useState(false);

  // Get today's date in YYYY-MM-DD format
  const getTodayDateString = useCallback(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Get max date for filter inputs (today)
  const maxDate = getTodayDateString();

  // Helper functions
  const isHoliday = useCallback((dateString: string) => {
    return SYSTEM_HOLIDAYS.some(holiday => holiday.date === dateString);
  }, []);

  const isWeekend = useCallback((date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  }, []);

  const isWorkingSaturday = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    return WORKING_SATURDAYS.includes(dateStr);
  }, []);

  const getTodayString = useCallback(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }, []);

  // Calculate duration between timeIn and timeOut (or current time if still checked in)
  const calculateDuration = useCallback((startIso: string, endIso?: string) => {
    const start = new Date(startIso).getTime();
    const end = endIso ? new Date(endIso).getTime() : Date.now();
    const diff = Math.max(0, end - start);
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  // FROM OLD CODE: Generate absent records function
  const generateAbsentRecords = useCallback((existingRecords: AttendanceRecord[]) => {
    const records = [...existingRecords];
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    // Create a set of existing record dates for quick lookup
    const existingDates = new Set(records.map(r => r.date));

    // Calculate the number of days to generate
    const daysToGenerate = Math.ceil((today.getTime() - oneYearAgo.getTime()) / (1000 * 60 * 60 * 24));

    // Generate records for the past year
    for (let i = 0; i < daysToGenerate; i++) {
      const date = new Date(oneYearAgo);
      date.setDate(oneYearAgo.getDate() + i);
      const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

      // Skip if record already exists or if it's a holiday/weekend/working Saturday
      if (existingDates.has(dateString) || 
          isHoliday(dateString) || 
          isWeekend(date) || 
          isWorkingSaturday(date)) {
        continue;
      }

      // Create absent record with empty strings for timeIn/timeOut
      const absentRecord: AttendanceRecord = {
        id: `absent-${dateString}`,
        date: dateString,
        status: 'Absent',
        workingHours: 0,
        timeIn: '',
        timeOut: '',
        location: '',
        locationName: ''
      };

      records.push(absentRecord);
    }

    return records;
  }, [isHoliday, isWeekend, isWorkingSaturday]);

  const triggerNotification = useCallback((title: string, msg: string, icon: string, color: string) => {
    const saved = JSON.parse(localStorage.getItem(getUserSpecificKey('user_notifications_v1')) || '[]');
    const newNotif = {
      id: `notif-${Date.now()}`,
      title,
      msg,
      time: new Date().toISOString(),
      icon,
      color,
      read: false,
      type: 'info'
    };
    localStorage.setItem(getUserSpecificKey('user_notifications_v1'), JSON.stringify([newNotif, ...saved]));
    window.dispatchEvent(new Event('storage'));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadData = () => {
      const recordsStr = localStorage.getItem(getUserSpecificKey('attendance_records'));
      let records: AttendanceRecord[] = recordsStr ? JSON.parse(recordsStr) : [];

      // Generate absent records for missing working days (FROM OLD CODE)
      records = generateAbsentRecords(records);

      // Sort by date (newest first)
      records.sort((a, b) => b.date.localeCompare(a.date));

      setAttendanceRecords(records);

      const today = getTodayString();
      const rec = records.find((r: AttendanceRecord) => r.date === today);

      if (rec) {
        const hasTimeIn = !!rec.timeIn;
        const hasTimeOut = !!rec.timeOut;
        const isActive = hasTimeIn && !hasTimeOut;

        setTodayRecord(rec);
        setIsPunchedIn(isActive);

        if (hasTimeIn) {
          const duration = calculateDuration(rec.timeIn, rec.timeOut);
          setWorkDuration(duration);
        } else {
          setWorkDuration('00:00:00');
        }

        setCustomLocationName(rec.locationName || '');
      } else {
        setTodayRecord(null);
        setIsPunchedIn(false);
        setWorkDuration('00:00:00');
        setCustomLocationName('');
      }
    };

    loadData();

    const handleStorage = () => loadData();
    window.addEventListener('storage', handleStorage);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn('Geolocation error:', err.message),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    }

    return () => window.removeEventListener('storage', handleStorage);
  }, [getTodayString, calculateDuration, generateAbsentRecords]);

  // Update work duration in real-time when checked in
  useEffect(() => {
    let interval: any;
    if (isPunchedIn && todayRecord?.timeIn) {
      interval = setInterval(() => {
        const duration = calculateDuration(todayRecord.timeIn);
        setWorkDuration(duration);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPunchedIn, todayRecord, calculateDuration]);

  const resolveLocationName = useCallback(async (lat: number, lng: number) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Given GPS coordinates ${lat}, ${lng}, provide a concise and descriptive name for this location (e.g., "Financial District, SF" or "Office Park Area"). Only the name.`,
      });
      return response.text?.trim() || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (e) {
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }, []);

  // Handle check-in
  const handleCheckIn = async () => {
    const now = new Date();
    const today = getTodayString();

    // Holiday restriction
    if (isHoliday(today)) {
      triggerNotification(
        'Holiday Restriction',
        `Today (${today}) is a company holiday. Check-ins are not allowed.`,
        'AlertTriangle',
        'text-purple-500 bg-purple-50'
      );
      return;
    }

    // Weekend restriction (excluding working Saturdays)
    if (isWeekend(now) && !isWorkingSaturday(now)) {
      triggerNotification(
        'Weekend Restriction',
        'Check-ins are not allowed on weekends.',
        'AlertTriangle',
        'text-slate-500 bg-slate-50'
      );
      return;
    }

    const recordsStr = localStorage.getItem(getUserSpecificKey('attendance_records'));
    const updated: AttendanceRecord[] = recordsStr ? JSON.parse(recordsStr) : [];
    const idx = updated.findIndex((r: AttendanceRecord) => r.date === today);

    // Check if already checked in today
    if (idx > -1 && updated[idx].timeIn) {
      triggerNotification(
        'Already Checked In',
        'You are already checked in for today.',
        'Clock',
        'text-amber-500 bg-amber-50'
      );
      return;
    }

    setIsResolvingLocation(true);

    let locName = "Remote Office";
    let locStr = "Location Unavailable";

    if (location) {
      locName = await resolveLocationName(location.lat, location.lng);
      locStr = `${location.lat.toFixed(6)}, ${location.lng.toFixed(6)}`;
    }

    const newRecord: AttendanceRecord = {
      id: `att-${Date.now()}`,
      date: today,
      status: new Date().getHours() < 9 ? 'Present' : 'Late',
      workingHours: 0,
      timeIn: now.toISOString(),
      timeOut: '',
      location: locStr,
      locationName: locName
    };

    // Try to persist to backend first. On failure, fall back to localStorage so app remains functional offline.
    try {
      const resp = await fetch('http://localhost:8085/api/employee_attend/check-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ date: today, timeIn: newRecord.timeIn, location: locStr, locationName: locName })
      });

      if (resp.ok) {
        const data = await resp.json().catch(() => null);
        const serverRecord = data?.record || data || newRecord;

        // Merge server-provided values into local record
        if (idx > -1) {
          updated[idx] = { ...updated[idx], ...serverRecord } as AttendanceRecord;
        } else {
          updated.push(serverRecord as AttendanceRecord);
        }

        const finalRecords = generateAbsentRecords(updated);
        localStorage.setItem(getUserSpecificKey('attendance_records'), JSON.stringify(finalRecords));
        setAttendanceRecords(finalRecords);

        const todayRec = finalRecords.find(r => r.date === today) || null;
        setTodayRecord(todayRec);
        setIsPunchedIn(true);

        setCustomLocationName(serverRecord.locationName || locName);

        triggerNotification(
          'Check-In Successful',
          `Checked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
          'Clock',
          'text-emerald-500 bg-emerald-50'
        );

        setIsResolvingLocation(false);
        return;
      }

      // If resp not ok, fall through to local fallback
      console.warn('Check-in failed on server:', resp.status);
    } catch (err) {
      console.warn('Network error during check-in:', err);
    }

    // Local fallback (offline or server failed)
    if (idx > -1) {
      updated[idx] = { ...updated[idx], ...newRecord };
    } else {
      updated.push(newRecord);
    }

    setCustomLocationName(locName);
    setIsResolvingLocation(false);

    // Regenerate absent records to ensure they're included (FROM OLD CODE)
    const finalRecords = generateAbsentRecords(updated);

    localStorage.setItem(getUserSpecificKey('attendance_records'), JSON.stringify(finalRecords));
    setAttendanceRecords(finalRecords);

    const todayRec = finalRecords.find(r => r.date === today) || null;
    setTodayRecord(todayRec);
    setIsPunchedIn(true);

    triggerNotification(
      'Check-In Successful',
      `Checked in at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      'Clock',
      'text-emerald-500 bg-emerald-50'
    );
  };

  // Handle check-out with confirmation
  const handleCheckOut = () => {
    setShowCheckoutConfirm(true);
  };

  // Confirm check-out
  const confirmCheckOut = async () => {
    setIsProcessingCheckout(true);
    const now = new Date();
    const today = getTodayString();

    const recordsStr = localStorage.getItem(getUserSpecificKey('attendance_records'));
    const updated: AttendanceRecord[] = recordsStr ? JSON.parse(recordsStr) : [];
    const idx = updated.findIndex((r: AttendanceRecord) => r.date === today);

    if (idx > -1 && updated[idx].timeIn) {
      const timeIn = updated[idx].timeIn;

      // Try to call server checkout endpoint first
      try {
        const resp = await fetch('http://localhost:8085/api/employee_attend/check-out', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ date: today, timeOut: now.toISOString(), recordId: updated[idx].id })
        });

        if (resp.ok) {
          const data = await resp.json().catch(() => null);
          const serverRecord = data?.record || data || {
            ...updated[idx],
            timeOut: now.toISOString()
          };

          updated[idx] = { ...updated[idx], ...serverRecord } as AttendanceRecord;

          const finalRecords = generateAbsentRecords(updated);
          localStorage.setItem(getUserSpecificKey('attendance_records'), JSON.stringify(finalRecords));
          setAttendanceRecords(finalRecords);

          const todayRec = finalRecords.find(r => r.date === today) || null;
          setTodayRecord(todayRec);
          setIsPunchedIn(false);

          const duration = calculateDuration(updated[idx].timeIn, serverRecord.timeOut || now.toISOString());
          setWorkDuration(duration);

          triggerNotification(
            'Check-Out Successful',
            `Checked out at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
            'Clock',
            'text-blue-500 bg-blue-50'
          );

          setIsProcessingCheckout(false);
          setShowCheckoutConfirm(false);
          return;
        }

        console.warn('Checkout failed on server:', resp.status);
      } catch (err) {
        console.warn('Network error during checkout:', err);
      }

      // Fallback local update if server call fails
      const checkInTime = new Date(timeIn);
      const checkOutTime = now;
      const durationMs = checkOutTime.getTime() - checkInTime.getTime();
      const workingHours = durationMs / (1000 * 60 * 60);

      updated[idx] = {
        ...updated[idx],
        timeOut: now.toISOString(),
        workingHours: parseFloat(workingHours.toFixed(2))
      };

      const finalRecords = generateAbsentRecords(updated);

      localStorage.setItem(getUserSpecificKey('attendance_records'), JSON.stringify(finalRecords));
      setAttendanceRecords(finalRecords);

      const todayRec = finalRecords.find(r => r.date === today) || null;
      setTodayRecord(todayRec);
      setIsPunchedIn(false);

      const duration = calculateDuration(timeIn, now.toISOString());
      setWorkDuration(duration);

      triggerNotification(
        'Check-Out Successful',
        `Checked out at ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
        'Clock',
        'text-blue-500 bg-blue-50'
      );
    }

    setIsProcessingCheckout(false);
    setShowCheckoutConfirm(false);
  };

  // Cancel check-out
  const cancelCheckOut = () => {
    setShowCheckoutConfirm(false);
  };

  const updateLocationName = () => {
    if (!todayRecord) return;

    const recordsStr = localStorage.getItem(getUserSpecificKey('attendance_records'));
    const records: AttendanceRecord[] = recordsStr ? JSON.parse(recordsStr) : [];
    const idx = records.findIndex((r: any) => r.id === todayRecord.id);

    if (idx > -1) {
      records[idx].locationName = customLocationName;
      
      const finalRecords = generateAbsentRecords(records);
      localStorage.setItem(getUserSpecificKey('attendance_records'), JSON.stringify(finalRecords));
      setAttendanceRecords(finalRecords);
      
      setTodayRecord(records[idx]);
    }

    setIsEditingLocation(false);
  };

  // FROM OLD CODE: Filter logic for Historical Registry
  const clearFilters = () => {
    setFilterStatus('All');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  // Handle date filter changes with validation
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if date is in the future
    if (value && value > maxDate) {
      triggerNotification(
        'Invalid Date',
        'Cannot select a future date. Please select a date up to today.',
        'Calendar',
        'text-amber-500 bg-amber-50'
      );
      return;
    }

    setStartDateFilter(value);

    // If start date is after end date, reset end date
    if (value && endDateFilter && value > endDateFilter) {
      setEndDateFilter(value);
    }
  };

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    // Check if date is in the future
    if (value && value > maxDate) {
      triggerNotification(
        'Invalid Date',
        'Cannot select a future date. Please select a date up to today.',
        'Calendar',
        'text-amber-500 bg-amber-50'
      );
      return;
    }

    // Check if end date is before start date
    if (value && startDateFilter && value < startDateFilter) {
      triggerNotification(
        'Invalid Date Range',
        'End date cannot be before start date.',
        'Calendar',
        'text-amber-500 bg-amber-50'
      );
      return;
    }

    setEndDateFilter(value);
  };

  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter(rec => {
      const matchesStatus = filterStatus === 'All' ||
        (filterStatus === 'Present' && (rec.status === 'Present' || rec.status === 'Late')) ||
        rec.status === filterStatus;
      const matchesStartDate = !startDateFilter || rec.date >= startDateFilter;
      const matchesEndDate = !endDateFilter || rec.date <= endDateFilter;
      return matchesStatus && matchesStartDate && matchesEndDate;
    }).sort((a, b) => b.date.localeCompare(a.date));
  }, [attendanceRecords, filterStatus, startDateFilter, endDateFilter]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
        <div className="text-center md:text-left">
          <h1 className="text-2xl font-bold text-slate-900">Attendance Registry</h1>
          <p className="text-slate-500 text-sm">Professional time-tracking and GPS-verified check-ins.</p>
        </div>
        <div className="mt-4 md:mt-0 px-6 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-slate-700">
          {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Punching Card */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-10 flex flex-col items-center justify-center shadow-sm relative overflow-hidden">
            <div className="text-center">
              <div className={`mb-6 inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isPunchedIn ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                {isPunchedIn ? 'Currently Checked In' : 'Ready for Check-in'}
              </div>
              <div className="text-7xl font-black text-slate-900 tabular-nums tracking-tighter">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
              </div>
            </div>

            <div className="w-full max-sm mt-12 space-y-4">
              <button
                onClick={isPunchedIn ? handleCheckOut : handleCheckIn}
                disabled={
                  isResolvingLocation ||
                  isHoliday(getTodayString()) ||
                  (isWeekend(new Date()) && !isWorkingSaturday(new Date())) ||
                  (todayRecord?.timeOut && !isPunchedIn)
                }
                className={`w-full py-6 rounded-xl font-black text-lg transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 ${isPunchedIn
                  ? 'bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700 shadow-rose-200'
                  : (isHoliday(getTodayString()) || (isWeekend(new Date()) && !isWorkingSaturday(new Date())))
                    ? 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-600 cursor-not-allowed shadow-slate-200'
                    : todayRecord?.timeOut
                      ? 'bg-gradient-to-r from-green-300 to-green-400 text-green-700 cursor-not-allowed shadow-green-200'
                      : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-blue-200'
                  } disabled:opacity-60 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none`}
              >
                {isResolvingLocation ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : isPunchedIn ? (
                  <>
                    <Square size={24} className="text-white" />
                    <span>Check Out Now</span>
                  </>
                ) : todayRecord?.timeOut ? (
                  <>
                    <CheckCircle size={24} className="text-green-600" />
                    <span>Already Checked Out Today</span>
                  </>
                ) : isHoliday(getTodayString()) ? (
                  <>
                    <Calendar size={24} className="text-slate-500" />
                    <span>Holiday Today</span>
                  </>
                ) : (isWeekend(new Date()) && !isWorkingSaturday(new Date())) ? (
                  <>
                    <Coffee size={24} className="text-slate-500" />
                    <span>Week Off</span>
                  </>
                ) : isWorkingSaturday(new Date()) ? (
                  <>
                    <Briefcase size={24} className="text-orange-500" />
                    <span>Working Saturday - Check In</span>
                  </>
                ) : (
                  <>
                    <Play size={24} className="text-white" />
                    <span>Check In Now</span>
                  </>
                )}
              </button>

              {/* Status Message */}
              <div className="text-center">
                {isPunchedIn ? (
                  <p className="text-sm text-rose-600 font-medium">You're currently checked in</p>
                ) : isHoliday(getTodayString()) ? (
                  <p className="text-sm text-amber-600 font-medium">Today is a company holiday</p>
                ) : (isWeekend(new Date()) && !isWorkingSaturday(new Date())) ? (
                  <p className="text-sm text-slate-600 font-medium">Weekend - no attendance required</p>
                ) : isWorkingSaturday(new Date()) &&
                  <p className="text-sm text-orange-600 font-medium">Working Saturday - Check-in enabled</p>
                }
              </div>

              {/* Location Feedback */}
              {(isPunchedIn || todayRecord?.timeOut) && (
                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-blue-600">
                      <MapPin size={16} />
                    </div>
                    {isEditingLocation ? (
                      <input
                        type="text"
                        value={customLocationName}
                        onChange={(e) => setCustomLocationName(e.target.value)}
                        className="bg-white border border-blue-200 rounded px-2 py-1 text-xs font-bold w-full focus:ring-2 focus:ring-blue-100 outline-none"
                        autoFocus
                      />
                    ) : (
                      <div className="truncate">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Logged Location</p>
                        <p className="text-xs font-bold text-slate-700 truncate">{todayRecord?.locationName || 'Unknown'}</p>
                      </div>
                    )}
                  </div>

                  
                </div>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Navigation size={18} className="text-blue-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">GPS Coordinates</h3>
              </div>
              <p className="text-sm font-bold text-slate-800">
                {location ? `${location.lat.toFixed(6)}° N` : 'Detecting...'}
              </p>
              <p className="text-sm font-bold text-slate-800">
                {location ? `${location.lng.toFixed(6)}° E` : 'Please enable location'}
              </p>
            </div>
            <div className="bg-white p-6 border border-slate-200 rounded-xl shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Timer size={18} className="text-blue-500" />
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Logged Work Hours</h3>
              </div>
              <p className="text-3xl font-black text-slate-900 tabular-nums tracking-tight">{workDuration}</p>
            </div>
          </div>
        </div>

        {/* Sidebar Logs */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
          <h3 className="font-bold text-slate-900 mb-8 flex items-center gap-3">
            <Activity size={20} className="text-blue-600" /> Today's Timeline
          </h3>
          <div className="space-y-8 relative">
            <div className="absolute left-5 top-2 bottom-2 w-px bg-slate-100"></div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                <ArrowUpRight size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-In Time</p>
                <p className="text-lg font-bold text-slate-800">
                  {todayRecord?.timeIn ? new Date(todayRecord.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-5 relative z-10">
              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 border border-slate-100">
                <ArrowDownLeft size={18} />
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Check-Out Time</p>
                <p className="text-lg font-bold text-slate-800">
                  {todayRecord?.timeOut ? new Date(todayRecord.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                </p>
              </div>
            </div>

            <div className="pt-8 border-t border-slate-50 flex justify-between items-center">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Status</span>
              <span className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${todayRecord?.status === 'Present' ? 'bg-emerald-100 text-emerald-700' : todayRecord?.status === 'Working Saturday' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                {todayRecord?.status || 'No Session'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Check-out Confirmation Modal */}
      {showCheckoutConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="text-center">
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Square size={32} className="text-rose-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Confirm Check-Out</h3>
              <p className="text-slate-600 mb-6">
                Are you sure you want to check out now? This will end your current work session.
              </p>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-slate-500">Current Duration:</span>
                  <span className="text-lg font-bold text-slate-900">{workDuration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-slate-500">Check-in Time:</span>
                  <span className="text-sm font-bold text-slate-800">
                    {todayRecord?.timeIn ? new Date(todayRecord.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--:--'}
                  </span>
                </div>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={cancelCheckOut}
                  className="flex-1 py-3 px-4 border border-slate-300 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmCheckOut}
                  disabled={isProcessingCheckout}
                  className="flex-1 py-3 px-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white font-medium rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isProcessingCheckout ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Yes, Check Out'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* History Table with Filters - FIXED DATE INPUTS and RESPONSIVE */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-4 sm:px-6 lg:px-8 py-6 border-b border-slate-100 bg-slate-50/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center justify-between w-full md:w-auto">
              <h2 className="font-bold text-slate-900 text-lg md:text-xl">Historical Registry</h2>
              <button
                onClick={clearFilters}
                className="flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors md:hidden"
              >
                <RotateCcw size={12} /> Clear
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
              {/* Status Filter */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  title="Filter by attendance status"
                  className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 px-3 py-2 rounded-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all w-full"
                >
                  <option>All</option>
                  <option>Present</option>
                  <option>Late</option>
                  <option>Absent</option>
                  <option>Working Saturday</option>
                </select>
              </div>
              
              {/* From Date Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">From Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={handleStartDateChange}
                    title="Filter from date"
                    max={maxDate}
                    className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all w-full"
                  />
                </div>
              </div>
              
              {/* To Date Input */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">To Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={handleEndDateChange}
                    title="Filter to date"
                    max={maxDate}
                    className="text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 pl-9 pr-3 py-2 rounded-lg outline-none focus:ring-4 focus:ring-blue-100 transition-all w-full"
                  />
                </div>
              </div>
              
              {/* Clear Filters Button (Desktop) */}
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="hidden md:flex items-center gap-2 text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors h-10"
                >
                  <RotateCcw size={12} /> Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scrollable Records Container */}
        <div className="relative">
          {/* Fixed Table Header */}
          <div className="sticky top-0 z-10 bg-white border-b border-slate-100">
            <div className="grid grid-cols-5 px-4 sm:px-6 lg:px-8 py-4 bg-slate-50/50">
              <div className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</div>
              <div className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Time (In / Out)</div>
              <div className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</div>
              <div className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Work Hours</div>
              <div className="px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</div>
            </div>
          </div>
          
          {/* Scrollable Records without scrollbar */}
          <div className="overflow-y-auto max-h-[400px] scrollbar-hide">
            <div className="divide-y divide-slate-100">
              {filteredRecords.map((rec) => {
                const displayLocation = rec.locationName || 'N/A';
                const workingHours = rec.workingHours || 0;
                
                return (
                  <div 
                    key={rec.id} 
                    className="grid grid-cols-5 px-4 sm:px-6 lg:px-8 py-5 hover:bg-slate-50/50 transition-colors"
                  >
                    {/* Date */}
                    <div className="px-2 font-bold text-slate-800 text-sm">
                      {new Date(rec.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    
                    {/* Time (In / Out) */}
                    <div className="px-2 text-slate-600 font-medium text-sm">
                      <div className="flex flex-col gap-1">
                        <span>
                          {rec.timeIn ? new Date(rec.timeIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--'}
                        </span>
                        <span className="text-slate-400">-</span>
                        <span>
                          {rec.timeOut ? new Date(rec.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : '--'}
                        </span>
                      </div>
                    </div>
                    
                    {/* Location */}
                    <div className="px-2">
                      <div className="flex items-center gap-2 text-slate-500">
                        <MapPin size={12} className="text-blue-500 flex-shrink-0" />
                        <span 
                          className="text-xs font-semibold truncate" 
                          title={displayLocation}
                        >
                          {displayLocation}
                        </span>
                      </div>
                    </div>
                    
                    {/* Work Hours */}
                    <div className="px-2 font-bold text-slate-700 tabular-nums text-sm">
                      {workingHours > 0 ? `${workingHours.toFixed(2)} hrs` : '--'}
                    </div>
                    
                    {/* Status */}
                    <div className="px-2 text-right">
                      <span className={`inline-flex px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${rec.status === 'Present' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                        rec.status === 'Late' ? 'bg-amber-50 text-amber-600 border border-amber-100' :
                          rec.status === 'Absent' ? 'bg-rose-50 text-rose-600 border border-rose-100' :
                            rec.status === 'Working Saturday' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                              'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                        {rec.status}
                      </span>
                    </div>
                  </div>
                );
              })}
              
              {/* Empty State */}
              {filteredRecords.length === 0 && (
                <div className="py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest px-4 sm:px-6 lg:px-8">
                  No matching logs found
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Add CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Attendance;