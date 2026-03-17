// src/pages/.../AttendanceMonitor.tsx
// AttendanceMonitor migrated (FULL UPDATED COMPLETE CODE)
import React, { useMemo, useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';

const Icon = ({ name, className }: { name: string; className?: string }) => {
    const LucideIcon = (LucideIcons as any)[name];
    return LucideIcon ? <LucideIcon className={className} /> : null;
};

type StatusFilter = 'all' | 'present' | 'absent' | 'late' | 'on-leave';

type AttendanceRow = {
    employeeId: string;
    name: string;
    department?: string;
    date: string; // YYYY-MM-DD
    checkIn: string; // e.g. 10:08 AM or --
    checkOut: string; // e.g. 06:10 PM or --
    totalHours: string; // e.g. 00:02:22
    status: 'present' | 'absent' | 'late' | 'on-leave';
    location?: string;
};

const AttendanceMonitor: React.FC = () => {
    const { employees, leaves } = useHRMS();
    const [attendanceData, setAttendanceData] = useState<AttendanceRow[]>([]);

    // State for date and status filtering
    // Default kept same as your file (fully supports dynamic selection)
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
    const [lastRefresh, setLastRefresh] = useState(new Date());

    // Simulate "Live" feed refresh
    useEffect(() => {
        const interval = setInterval(() => setLastRefresh(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const years = Array.from({ length: 11 }, (_, i) => new Date().getFullYear() - 5 + i);

    const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();

    const handleDateUpdate = (year?: number, month?: number, day?: number) => {
        const newDate = new Date(selectedDate);
        if (year !== undefined) newDate.setFullYear(year);
        if (month !== undefined) {
            const maxDays = getDaysInMonth(newDate.getFullYear(), month);
            if (newDate.getDate() > maxDays) newDate.setDate(maxDays);
            newDate.setMonth(month);
        }
        if (day !== undefined) newDate.setDate(day);
        setSelectedDate(newDate);
    };

    const formatDateToISO = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    };

    const formatTimeHHMM = (isoDateTime: string | null | undefined) => {
        if (!isoDateTime) return '--';
        const dt = new Date(isoDateTime);
        if (Number.isNaN(dt.getTime())) return '--';
        return dt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    // ✅ Fetch attendance from backend admin endpoint for selected date and optional status
    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const from = formatDateToISO(selectedDate);
                const to = from; // single day
                const params = new URLSearchParams();
                params.set('from', from);
                params.set('to', to);
                if (statusFilter && statusFilter !== 'all') params.set('status', statusFilter);

                // Use super admin API endpoint
                const url = `http://localhost:8085/api/employee_attend/admin/attendance?${params.toString()}`;
                const res = await fetch(url, { method: 'GET', credentials: 'include' });

                if (!res.ok) {
                    const err = await res.text().catch(() => 'Failed');
                    setAttendanceData([]);
                    return;
                }

                const data = await res.json().catch(() => []);
                const arr = Array.isArray(data) ? data : (data?.data ?? []);

                // ✅ FLATTEN: backend response is employees[] -> each has attendance[]
                const flattened: AttendanceRow[] = arr.flatMap((emp: any) => {
                    const empId = String(emp?.employeeId ?? '').trim();
                    const name = emp?.username || emp?.fullName || emp?.name || '';
                    const dept = emp?.department || '';

                    const attendanceArr = Array.isArray(emp?.attendance) ? emp.attendance : [];

                    return attendanceArr.map((a: any) => {
                        const dateStr = String(a?.date || from).slice(0, 10);

                        const rawStatus = String(a?.status || '').toLowerCase(); // "Late" -> "late"
                        const normalizedStatus: AttendanceRow['status'] =
                            rawStatus === 'late'
                                ? 'late'
                                : rawStatus === 'present'
                                    ? 'present'
                                    : rawStatus === 'absent'
                                        ? 'absent'
                                        : rawStatus === 'on-leave' || rawStatus === 'on_leave'
                                            ? 'on-leave'
                                            : 'present'; // if backend sends unknown but record exists, treat as present

                        return {
                            employeeId: empId,
                            name,
                            department: dept,
                            date: dateStr,
                            checkIn: formatTimeHHMM(a?.timeIn),
                            checkOut: formatTimeHHMM(a?.timeOut),
                            totalHours: a?.totalHours || '00:00',
                            status: normalizedStatus,
                            location: a?.locationName || ''
                        };
                    });
                });

                setAttendanceData(flattened);
            } catch (err) {
                console.error('Attendance fetch error', err);
                setAttendanceData([]);
            }
        };

        fetchAttendance();
    }, [selectedDate, statusFilter, lastRefresh]);

    // 1. Data Normalization & Feed Derivation
    const dailyMasterFeed = useMemo(() => {
        const dateStr = formatDateToISO(selectedDate);

        // Use attendanceData as the primary source (this has the actual attendance records)
        const feedFromAttendance = attendanceData
            .filter((record) => String(record.date).slice(0, 10) === dateStr)
            .map((record: any) => {
                let status: AttendanceRow['status'] = record.status;

                // If checkIn exists, compute late threshold (09:30 AM)
                if (record.checkIn && record.checkIn !== '--') {
                    const parsed = record.checkIn; // e.g. "10:08 AM"
                    const [time, period] = parsed.split(' ');
                    const [hoursStr, minutesStr] = time.split(':');
                    let hours = Number(hoursStr);
                    const minutes = Number(minutesStr);

                    if (period === 'PM' && hours !== 12) hours += 12;
                    if (period === 'AM' && hours === 12) hours = 0;

                    const totalMinutes = hours * 60 + minutes;
                    status = totalMinutes > 570 ? 'late' : 'present';
                }

                return {
                    ...record,
                    status
                };
            });

        // Now add employees who are on leave but don't have attendance record
        const employeesWithAttendance = feedFromAttendance.map((r) => String(r.employeeId).trim());

        const feedFromLeaves = employees
            .filter((emp: any) => !employeesWithAttendance.includes(String(emp.employeeId).trim()))
            .map((emp: any) => {
                const onLeave = leaves.find(
                    (l: any) =>
                        (l.employeeId === emp.id || l.employeeId === emp.employeeId) &&
                        l.status === 'approved' &&
                        l.startDate <= dateStr &&
                        l.endDate >= dateStr
                );

                if (onLeave) {
                    return {
                        employeeId: String(emp.employeeId).trim(),
                        name: emp.fullName || emp.username,
                        department: emp.department,
                        date: dateStr,
                        checkIn: '--',
                        checkOut: '--',
                        totalHours: '00:00',
                        status: 'on-leave' as const,
                        location: emp.location
                    };
                }
                return null;
            })
            .filter(Boolean);

        // Combine both feeds
        const combined = [...feedFromAttendance, ...feedFromLeaves];

        return combined.sort((a: any, b: any) => {
            // Sort priority: Late > Present > On Leave > Absent
            const order: Record<string, number> = { late: 1, present: 2, 'on-leave': 3, absent: 4 };
            return (order[a.status] || 5) - (order[b.status] || 5);
        });
    }, [attendanceData, employees, leaves, selectedDate]);

    // 2. Filter logic for the UI feed
    const filteredFeed = useMemo(() => {
        if (statusFilter === 'all') return dailyMasterFeed;
        if (statusFilter === 'present') {
            // Show both present and late records
            return dailyMasterFeed.filter((f: any) => f.status === 'present' || f.status === 'late');
        }
        return dailyMasterFeed.filter((f: any) => f.status === statusFilter);
    }, [dailyMasterFeed, statusFilter]);

    // 3. Header Stats calculation
    const statsSummary = useMemo(() => {
        const total = employees.length;
        const presentCount = dailyMasterFeed.filter((a: any) => a.status === 'present').length;
        const lateCount = dailyMasterFeed.filter((a: any) => a.status === 'late').length;
        const onLeaveCount = dailyMasterFeed.filter((a: any) => a.status === 'on-leave').length;
        const absentCount = dailyMasterFeed.filter((a: any) => a.status === 'absent').length;

        return [
            { id: 'all', label: 'Total', count: total, color: 'blue' },
            { id: 'present', label: 'Present', count: presentCount, color: 'green' },
            { id: 'absent', label: 'Absent', count: absentCount, color: 'red' },
            { id: 'late', label: 'Late', count: lateCount, color: 'yellow' },
            { id: 'on-leave', label: 'On Leave', count: onLeaveCount, color: 'purple' }
        ];
    }, [dailyMasterFeed, employees.length]);

    const downloadReport = () => {
        const headers = ['Employee ID', 'Name', 'Date', 'Check-In', 'Check-Out', 'Total Hours', 'Status', 'Location'];
        const rows = filteredFeed.map((r: any) => [
            r.employeeId,
            r.name,
            r.date,
            r.checkIn,
            r.checkOut,
            r.totalHours,
            r.status,
            r.location || 'HQ Office'
        ]);

        const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map((e) => e.join(',')).join('\n');

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `Attendance_Report_${formatDateToISO(selectedDate)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-sans font-bold text-black tracking-tight">Attendance Monitor</h1>
                    <p className="text-black text-sm font-medium">Tracking system for {employees.length} Persons.</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <select
                        aria-label="Select Year"
                        value={selectedDate.getFullYear()}
                        onChange={(e) => handleDateUpdate(parseInt(e.target.value))}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-black outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                        {years.map((y) => (
                            <option key={y} value={y} className="text-black">
                                {y}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Select Month"
                        value={selectedDate.getMonth()}
                        onChange={(e) => handleDateUpdate(undefined, parseInt(e.target.value))}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-black outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                        {months.map((m, i) => (
                            <option key={m} value={i} className="text-black">
                                {m}
                            </option>
                        ))}
                    </select>

                    <select
                        aria-label="Select Day"
                        value={selectedDate.getDate()}
                        onChange={(e) => handleDateUpdate(undefined, undefined, parseInt(e.target.value))}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold uppercase tracking-wider text-black outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    >
                        {Array.from(
                            { length: getDaysInMonth(selectedDate.getFullYear(), selectedDate.getMonth()) },
                            (_, i) => i + 1
                        ).map((d) => (
                            <option key={d} value={d} className="text-black">
                                {d}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={() => setSelectedDate(new Date())}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
                    >
                        Today
                    </button>

                    <div className="flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden bg-white shadow-sm">
                        <button
                            aria-label="Previous day"
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() - 1);
                                setSelectedDate(d);
                            }}
                            className="p-2 hover:bg-gray-50 transition-colors border-r"
                        >
                            <Icon name="ChevronLeft" className="w-4 h-4 text-black" />
                        </button>
                        <button
                            aria-label="Next day"
                            onClick={() => {
                                const d = new Date(selectedDate);
                                d.setDate(d.getDate() + 1);
                                setSelectedDate(d);
                            }}
                            className="p-2 hover:bg-gray-50 transition-colors"
                        >
                            <Icon name="ChevronRight" className="w-4 h-4 text-black" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {statsSummary.map((stat) => (
                    <button
                        key={stat.id}
                        onClick={() => setStatusFilter(stat.id as StatusFilter)}
                        className={`bg-white p-5 rounded-2xl border transition-all text-center group ${statusFilter === stat.id
                            ? `border-indigo-200 ring-4 ring-indigo-50 shadow-md scale-105`
                            : 'border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200'
                            }`}
                    >
                        <p className="text-[10px] font-black uppercase text-black mb-1 tracking-widest">{stat.label}</p>
                        <p
                            className={`text-2xl font-black ${stat.color === 'blue'
                                ? 'text-indigo-600'
                                : stat.color === 'green'
                                    ? 'text-emerald-600'
                                    : stat.color === 'red'
                                        ? 'text-rose-600'
                                        : stat.color === 'yellow'
                                            ? 'text-amber-600'
                                            : 'text-purple-600'
                                }`}
                        >
                            {stat.count}
                        </p>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                        <div>
                            <h2 className="text-lg font-black text-black uppercase tracking-tighter">Live Attendance Feed</h2>
                            <p className="text-xs text-black font-medium">
                                Real-time presence logs for {selectedDate.toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                        {(['all', 'present', 'absent', 'late', 'on-leave'] as StatusFilter[]).map((f) => (
                            <button
                                key={f}
                                onClick={() => setStatusFilter(f)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-md' : 'text-black hover:text-indigo-600 hover:bg-gray-50'
                                    }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto max-h-[60vh] overflow-y-auto invisible-scrollbar">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b bg-white text-left">
                                <th className="py-4 px-8 text-[11px] font-black text-black uppercase tracking-widest">Employee Profile</th>
                                <th className="py-4 px-8 text-[11px] font-black text-black uppercase tracking-widest text-center">Clock-In</th>
                                <th className="py-4 px-8 text-[11px] font-black text-black uppercase tracking-widest text-center">Clock-Out</th>
                                <th className="py-4 px-8 text-[11px] font-black text-black uppercase tracking-widest text-center">Total Hours</th>
                                <th className="py-4 px-8 text-[11px] font-black text-black uppercase tracking-widest">Status Label</th>
                                <th className="py-4 px-8 text-[11px] font-black text-black uppercase tracking-widest">Origin</th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-50">
                            {filteredFeed.length > 0 ? (
                                filteredFeed.map((record: any) => (
                                    <tr key={record.employeeId} className="hover:bg-indigo-50/30 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 bg-gray-100 rounded-xl flex items-center justify-center text-xs font-black text-black border border-gray-200 group-hover:bg-white group-hover:text-indigo-600 transition-colors">
                                                    {record.name?.charAt(0) || '?'}
                                                </div>
                                                <div>
                                                    <p className="font-black text-black leading-none mb-1 text-sm">{record.name}</p>
                                                    <p className="text-[10px] text-black font-bold uppercase tracking-widest">{record.employeeId}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="py-5 px-8 text-xs font-bold text-black text-center">{record.checkIn}</td>
                                        <td className="py-5 px-8 text-xs font-bold text-black text-center">{record.checkOut}</td>
                                        <td className="py-5 px-8 text-xs font-black text-indigo-600 text-center">{record.totalHours}</td>

                                        <td className="py-5 px-8">
                                            <span
                                                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${record.status === 'present'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : record.status === 'late'
                                                        ? 'bg-amber-50 text-amber-600 border-amber-100'
                                                        : record.status === 'on-leave'
                                                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                            : 'bg-rose-50 text-rose-600 border-rose-100'
                                                    }`}
                                            >
                                                {record.status}
                                            </span>
                                        </td>

                                        <td className="py-5 px-8 text-xs font-medium text-black">
                                            <div className="flex items-center gap-2">
                                                <Icon name="MapPin" className="w-3.5 h-3.5 text-black" />
                                                <span className="text-[10px] font-bold uppercase tracking-wide text-black">{record.location || 'HQ Office'}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-24 text-center">
                                        <div className="w-20 h-20 bg-gray-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                                            <Icon name="Users" className="w-10 h-10 text-black" />
                                        </div>
                                        <p className="text-black font-black uppercase text-xs tracking-widest">
                                            Zero {statusFilter !== 'all' ? statusFilter : ''} logs for this selection.
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                    <p className="text-[10px] font-black text-black uppercase tracking-widest">
                        System Refresh at {lastRefresh.toLocaleTimeString()}
                    </p>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            aria-label="Generate report"
                            onClick={downloadReport}
                            className="px-5 py-2.5 bg-white border border-gray-200 text-black hover:text-indigo-600 hover:border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        >
                            Generate Report
                        </button>
                        <button
                            type="button"
                            aria-label="Refresh now"
                            onClick={() => {
                                setLastRefresh(new Date());
                            }}
                            className="px-5 py-2.5 bg-white border border-gray-200 text-black hover:text-indigo-600 hover:border-indigo-100 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm"
                        >
                            Refresh Now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default AttendanceMonitor;