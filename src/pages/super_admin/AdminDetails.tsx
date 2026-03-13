import React, { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext.tsx';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceAnalyticsResponse } from '../../types.ts';
import { getPerformancePercentage } from '../../api/performance.ts';

const Icon = ({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) => {
    const LucideIcon = (LucideIcons as any)[name];
    return LucideIcon ? <LucideIcon className={className} onClick={onClick} /> : null;
};

const AdminDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { admins } = useApp();
    const [copiedField, setCopiedField] = useState<string | null>(null);
    const [performanceViewPeriod, setPerformanceViewPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [performanceViewFilter, setPerformanceViewFilter] = useState('');
    const [performanceViewYear, setPerformanceViewYear] = useState<number>(new Date().getFullYear());

    const [analytics, setAnalytics] = useState<PerformanceAnalyticsResponse | null>(null);

    const [performanceFormPeriod, setPerformanceFormPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [performanceFormFilter, setPerformanceFormFilter] = useState('');
    const [performanceFormData, setPerformanceFormData] = useState({
        rating: '',
        feedback: '',
        strengths: '',
        improvements: ''
    });
    const [activeTab, setActiveTab] = useState<'personal' | 'performance'>('personal');

    // Find the admin
    const selectedAdmin = admins.find(admin => admin.id === id);

    // whenever the period or filter or year changes, fire off an API call
    useEffect(() => {
        if (!selectedAdmin) {
            setAnalytics(null);
            return;
        }

        const fetch = async () => {
            try {
                const year = performanceViewYear;
                const month = performanceViewPeriod === 'monthly' ? parseInt(performanceViewFilter, 10) : undefined;
                const quarter = performanceViewPeriod === 'quarterly' ? parseInt(performanceViewFilter, 10) : undefined;

                const resp = await getPerformancePercentage({
                    employeeId: selectedAdmin.employeeId,
                    periodType: performanceViewPeriod,
                    year,
                    month,
                    quarter
                });
                setAnalytics(resp);
            } catch (e) {
                console.error('Failed to load performance analytics', e);
                setAnalytics(null);
            }
        };

        if (performanceViewFilter) {
            fetch();
        }
    }, [selectedAdmin, performanceViewPeriod, performanceViewFilter, performanceViewYear]);

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const availablePeriods = useMemo(() => {
        if (performanceViewPeriod === 'monthly') {
            return monthNames.map((m, i) => ({ label: m, value: (i + 1).toString() }));
        }
        if (performanceViewPeriod === 'quarterly') {
            return [
                { label: 'Q1', value: '1' },
                { label: 'Q2', value: '2' },
                { label: 'Q3', value: '3' },
                { label: 'Q4', value: '4' }
            ];
        }
        return [performanceViewYear - 1, performanceViewYear].map(y => ({ label: y.toString(), value: y.toString() }));
    }, [performanceViewPeriod, performanceViewYear]);

    const pieChartData = useMemo(() => {
        if (!analytics) {
            return { leaves: [], attendance: [], tasks: [] };
        }
        const pendingTasks =
            analytics.taskAnalyticsResponse.assigned -
            analytics.taskAnalyticsResponse.completed -
            analytics.taskAnalyticsResponse.inProgress;
        return {
            leaves: [
                { name: 'Leaves Taken', value: analytics.leaveAnalyticsResponse.leavesTaken, fill: '#ef4444' },
                {
                    name: 'Working Days',
                    value: analytics.leaveAnalyticsResponse.workingDays - analytics.leaveAnalyticsResponse.leavesTaken,
                    fill: '#10b981'
                }
            ],
            attendance: [
                { name: 'Present', value: analytics.attendanceAnayticsResponse.presentDays, fill: '#c97a4c' },
                { name: 'Absent', value: analytics.attendanceAnayticsResponse.absentDays, fill: '#fbbf24' }
            ],
            tasks: [
                { name: 'Completed', value: analytics.taskAnalyticsResponse.completed, fill: '#10b981' },
                { name: 'Pending', value: pendingTasks, fill: '#ef4444' }
            ]
        };
    }, [analytics]);


    const availableFormPeriods = useMemo(() => {
        if (performanceFormPeriod === 'monthly') {
            return monthNames.map((m, i) => ({ label: m, value: (i + 1).toString() }));
        }
        if (performanceFormPeriod === 'quarterly') {
            return [
                { label: 'Q1', value: '1' },
                { label: 'Q2', value: '2' },
                { label: 'Q3', value: '3' },
                { label: 'Q4', value: '4' }
            ];
        }
        return [performanceViewYear - 1, performanceViewYear].map(y => ({ label: y.toString(), value: y.toString() }));
    }, [performanceFormPeriod, performanceViewYear]);

    // reset filters when the available periods change; choose the current
    // month/quarter/year instead of simply taking the first list element.
    useEffect(() => {
        if (availablePeriods.length === 0) return;
        const now = new Date();
        if (performanceViewPeriod === 'monthly') {
            setPerformanceViewFilter((now.getMonth() + 1).toString());
        } else if (performanceViewPeriod === 'quarterly') {
            const q = Math.floor(now.getMonth() / 3) + 1;
            setPerformanceViewFilter(q.toString());
        } else {
            setPerformanceViewFilter(performanceViewYear.toString());
        }
    }, [availablePeriods, performanceViewPeriod, performanceViewYear]);

    useEffect(() => {
        if (availableFormPeriods.length === 0) return;
        const now = new Date();
        if (performanceFormPeriod === 'monthly') {
            setPerformanceFormFilter((now.getMonth() + 1).toString());
        } else if (performanceFormPeriod === 'quarterly') {
            const q = Math.floor(now.getMonth() / 3) + 1;
            setPerformanceFormFilter(q.toString());
        } else {
            setPerformanceFormFilter(performanceViewYear.toString());
        }
    }, [availableFormPeriods, performanceFormPeriod, performanceViewYear]);

    const handleCopy = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (!selectedAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
                <Icon name="AlertCircle" className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-black text-black mb-2">Admin Not Found</h1>
                <p className="text-slate-600 mb-6">The admin you're looking for doesn't exist.</p>
                <button
                    onClick={() => navigate('/super-admin/admin-hub')}
                    className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors"
                >
                    Back to Admin Hub
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/super-admin/admin-hub')}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
                >
                    <Icon name="ChevronLeft" className="w-5 h-5" />
                    Back to Admin Hub
                </button>

                {/* Main Card */}
                <div className="bg-white rounded-[32px] shadow-xl overflow-hidden">
                    <div className="flex">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 px-6 py-5 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'personal'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Icon name="User" className="w-5 h-5" />
                            Personal Details
                        </button>
                        <button
                            onClick={() => setActiveTab('performance')}
                            className={`flex-1 px-6 py-5 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'performance'
                                    ? 'bg-indigo-600 text-white'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                        >
                            <Icon name="BarChart3" className="w-5 h-5" />
                            Performance Metrics
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="p-8">
                        {/* Personal Details Tab */}
                        {activeTab === 'personal' && (
                            <div className="space-y-6">
                                {/* Header Section */}
                                <div className="flex flex-col items-center text-center">
                                    <img
                                        src={selectedAdmin.avatar}
                                        className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-slate-50 shadow-lg mb-4"
                                        alt={selectedAdmin.name}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <h1 className="text-3xl font-black text-black line-clamp-2">{selectedAdmin.name}</h1>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                                        {selectedAdmin.employeeId} • {selectedAdmin.designation}
                                    </p>

                                    {/* Badges */}
                                    <div className="mt-6 flex flex-wrap gap-2 justify-center">
                                        <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                                            {selectedAdmin.department}
                                        </span>
                                        <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                                            {selectedAdmin.status}
                                        </span>
                                        <span
                                            className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${selectedAdmin.employmentType === 'FULL_TIME'
                                                    ? 'bg-[#f5ede3] text-[#8b5a3c]'
                                                    : selectedAdmin.employmentType === 'PART_TIME'
                                                        ? 'bg-purple-50 text-purple-600 border-purple-100'
                                                        : 'bg-amber-50 text-amber-600 border-amber-100'
                                                }`}
                                        >
                                            {selectedAdmin.employmentType}
                                        </span>
                                        {selectedAdmin.role && (
                                            <span className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest border border-indigo-600">
                                                {selectedAdmin.role}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Separator */}
                                <div className="border-t border-slate-100" />

                                {/* Contact Info Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <p className="text-xs font-black text-black uppercase tracking-widest mb-2">Email</p>
                                        <p className="text-sm font-bold text-black break-all">{selectedAdmin.email}</p>
                                    </div>
                                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                                        <p className="text-xs font-black text-black uppercase tracking-widest mb-2">Phone</p>
                                        <p className="text-sm font-bold text-black">{selectedAdmin.phoneNumber || 'No direct line'}</p>
                                    </div>
                                </div>

                                {/* Credentials Section */}
                                <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
                                    <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                                        <Icon name="ShieldCheck" className="w-32 h-32" />
                                    </div>
                                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70 pr-8">Admin Access Credentials</h3>
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-bold uppercase opacity-50 mb-1">Username / Email</p>
                                                <p className="text-sm font-black break-all">{selectedAdmin.email}</p>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(selectedAdmin.email, 'email')}
                                                aria-label="Copy username"
                                                className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0 relative"
                                            >
                                                <Icon
                                                    name={copiedField === 'email' ? 'Check' : 'Copy'}
                                                    className="w-5 h-5 text-white"
                                                />
                                                {copiedField === 'email' && (
                                                    <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white text-indigo-600 text-xs font-black px-2 py-1 rounded-lg whitespace-nowrap">
                                                        Copied!
                                                    </span>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Info Cards Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-xs font-black text-black uppercase tracking-widest mb-2">Admin Tier</p>
                                        <p className="text-lg font-bold text-black">{selectedAdmin.role}</p>
                                    </div>
                                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                        <p className="text-xs font-black text-black uppercase tracking-widest mb-2">Onboard Date</p>
                                        <p className="text-lg font-bold text-black">{selectedAdmin.dateOfJoining || 'Not available'}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Performance Metrics Tab */}
                        {activeTab === 'performance' && (
                            <div className="flex flex-col h-full">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 flex items-center gap-3">
                                        <div className="p-3 bg-indigo-100 rounded-2xl">
                                            <Icon name="BarChart3" className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        Admin Performance Metrics & Review
                                    </h2>
                                    <p className="text-slate-600 text-sm">Monitor admin performance across leaves, attendance, and administrative tasks</p>
                                </div>

                                {/* Filter Controls */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-8">
                                    <div className="flex flex-wrap items-end gap-6">
                                        <div>
                                            <label className="text-xs font-black text-black uppercase tracking-widest mb-2 block">Period Type</label>
                                            <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                                                {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                                                    <button
                                                        key={period}
                                                        onClick={() => setPerformanceViewPeriod(period)}
                                                        className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${performanceViewPeriod === period
                                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                                : 'bg-transparent text-slate-600 hover:text-black'
                                                            }`}
                                                    >
                                                        {period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Yearly'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-black text-black uppercase tracking-widest mb-1 block">Year</label>
                                            <input
                                                type="number"
                                                value={performanceViewYear}
                                                onChange={(e) => setPerformanceViewYear(parseInt(e.target.value, 10))}
                                                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            />
                                        </div>

                                        <div className="flex-1 max-w-xs">
                                            <label className="text-xs font-black text-black uppercase tracking-widest mb-1 block">Select Period</label>
                                            <select
                                                value={performanceViewFilter}
                                                onChange={(e) => setPerformanceViewFilter(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            >
                                                {availablePeriods.map((p) => (
                                                    <option key={p.value} value={p.value}>
                                                        {p.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts and Form in 2-Column Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1">
                                    {/* 3 Charts Section - Stacked Vertically */}
                                    <div className="col-span-1 lg:col-span-2 space-y-8">
                                        {/* Leaves Chart */}
                                        <div className="bg-white rounded-3xl shadow-md border border-red-200 overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-red-200">
                                                <h3 className="text-lg font-black text-black flex items-center gap-3">
                                                    <div className="p-2 bg-red-100 rounded-xl">
                                                        <Icon name="Calendar" className="w-6 h-6 text-red-600" />
                                                    </div>
                                                    Leave Balance
                                                </h3>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {(() => {
                                                    const leaveData = analytics ? {
                                                        workingDays: analytics.leaveAnalyticsResponse.workingDays,
                                                        leavesTaken: analytics.leaveAnalyticsResponse.leavesTaken
                                                    } : null;
                                                    return leaveData ? (
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200">
                                                                <p className="text-2xl font-black text-red-600">{leaveData.workingDays}</p>
                                                                <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-2">Working Days</p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                                                                <p className="text-2xl font-black text-green-600">{leaveData.leavesTaken}</p>
                                                                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-2">Leaves Taken</p>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}
                                                <div className="h-72">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={analytics ? [
                                                                    { name: 'Leaves Taken', value: analytics.leaveAnalyticsResponse.leavesTaken, fill: '#ef4444' },
                                                                    { name: 'Working Days', value: analytics.leaveAnalyticsResponse.workingDays - analytics.leaveAnalyticsResponse.leavesTaken, fill: '#10b981' }
                                                                ] : []}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, value }) => `${name}: ${value}`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {analytics && analytics.leaveAnalyticsResponse && analytics.leaveAnalyticsResponse.leavesTaken !== undefined
                                                                    ? [analytics.leaveAnalyticsResponse.leavesTaken, analytics.leaveAnalyticsResponse.workingDays - analytics.leaveAnalyticsResponse.leavesTaken].map((_, index) => (
                                                                        <Cell key={`cell-${index}`} fill={['#ef4444', '#10b981'][index]} />
                                                                    ))
                                                                    : null}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `${value} days`} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Attendance Chart */}
                                        <div className="bg-white rounded-3xl shadow-md border-2 overflow-hidden hover:shadow-lg transition-shadow" style={{borderColor: '#c97a4c'}}>
                                            <div className="bg-gradient-to-r p-6 border-b" style={{backgroundImage: 'linear-gradient(90deg, #f5ede3 0%, #f0e6dc 100%)', borderColor: '#c97a4c'}}>
                                                <h3 className="text-lg font-black text-black flex items-center gap-3">
                                                    <div className="p-2 rounded-xl" style={{backgroundColor: '#f5ede3', color: '#c97a4c'}}>
                                                        <Icon name="CheckCircle" className="w-6 h-6" style={{color: '#c97a4c'}} />
                                                    </div>
                                                    Attendance Record
                                                </h3>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {(() => {
                                                    const attendanceData = analytics ? {
                                                        presentDays: analytics.attendanceAnayticsResponse.presentDays,
                                                        absentDays: analytics.attendanceAnayticsResponse.absentDays
                                                    } : null;
                                                    const attendanceRate = attendanceData
                                                        ? Math.round((attendanceData.presentDays / (attendanceData.presentDays + attendanceData.absentDays)) * 100)
                                                        : 0;
                                                    return attendanceData ? (
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="rounded-2xl p-4 text-center" style={{backgroundColor: '#f5ede3', borderColor: '#c97a4c', borderWidth: '2px'}}>
                                                                <p className="text-2xl font-black" style={{color: '#c97a4c'}}>{attendanceData.presentDays}</p>
                                                                <p className="text-xs font-bold uppercase tracking-widest mt-2" style={{color: '#8b5a3c'}}>Present</p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200 text-center">
                                                                <p className="text-2xl font-black text-yellow-600">{attendanceData.absentDays}</p>
                                                                <p className="text-xs font-bold text-yellow-700 uppercase tracking-widest mt-2">Absent</p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 text-center">
                                                                <p className="text-2xl font-black text-green-600">{attendanceRate}%</p>
                                                                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-2">Rate</p>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}
                                                <div className="h-72">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={pieChartData.attendance}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, value }) => `${name}: ${value}`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {pieChartData.attendance.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `${value} days`} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tasks Chart */}
                                        <div className="bg-white rounded-3xl shadow-md border border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-200">
                                                <h3 className="text-lg font-black text-black flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-xl">
                                                        <Icon name="CheckSquare" className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    Task Completion
                                                </h3>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                {(() => {
                                                    const tasksData = analytics ? {
                                                        tasksAssigned: analytics.taskAnalyticsResponse.assigned,
                                                        tasksCompleted: analytics.taskAnalyticsResponse.completed,
                                                        inProgress: analytics.taskAnalyticsResponse.inProgress
                                                    } : null;
                                                    const completionRate = tasksData
                                                        ? Math.round((tasksData.tasksCompleted / (tasksData.tasksAssigned || 1)) * 100)
                                                        : 0;
                                                    return tasksData ? (
                                                        <div className="grid grid-cols-3 gap-3">
                                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 text-center">
                                                                <p className="text-2xl font-black text-purple-600">{tasksData.tasksAssigned}</p>
                                                                <p className="text-xs font-bold text-purple-700 uppercase tracking-widest mt-2">Assigned</p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 text-center">
                                                                <p className="text-2xl font-black text-green-600">{tasksData.tasksCompleted}</p>
                                                                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-2">Completed</p>
                                                            </div>
                                                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200 text-center">
                                                                <p className="text-2xl font-black text-red-600">{completionRate}%</p>
                                                                <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-2">Rate</p>
                                                            </div>
                                                        </div>
                                                    ) : null;
                                                })()}
                                                <div className="h-72">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={pieChartData.tasks}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, value }) => `${name}: ${value}`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {pieChartData.tasks.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `${value} tasks`} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Section */}
                                    <div className="col-span-1">
                                        <h3 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                            <div className="p-3 bg-indigo-100 rounded-2xl">
                                                <Icon name="Edit3" className="w-6 h-6 text-indigo-600" />
                                            </div>
                                            Performance Review
                                        </h3>

                                        <form className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md sticky top-6">
                                            <div>
                                                <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Period Type</label>
                                                <div className="flex gap-2 bg-slate-100 p-2 rounded-xl">
                                                    {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                                                        <button
                                                            key={period}
                                                            type="button"
                                                            onClick={() => setPerformanceFormPeriod(period)}
                                                            className={`flex-1 px-3 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${performanceFormPeriod === period
                                                                    ? 'bg-indigo-600 text-white shadow-lg'
                                                                    : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                                                }`}
                                                        >
                                                            {period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Yearly'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Select Period</label>
                                                <select
                                                    value={performanceFormFilter}
                                                    onChange={(e) => setPerformanceFormFilter(e.target.value)}
                                                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-semibold text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                >
                                                    {availableFormPeriods.map((p) => (
                                                        <option key={p.value} value={p.value}>
                                                            {p.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>

                                            <div>
                                                <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Rating (1-5)</label>
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="5"
                                                    step="0.5"
                                                    value={performanceFormData.rating}
                                                    onChange={(e) => setPerformanceFormData({ ...performanceFormData, rating: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    placeholder="e.g., 4.5"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Feedback</label>
                                                <textarea
                                                    value={performanceFormData.feedback}
                                                    onChange={(e) => setPerformanceFormData({ ...performanceFormData, feedback: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                                                    placeholder="Enter feedback..."
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Strengths</label>
                                                <textarea
                                                    value={performanceFormData.strengths}
                                                    onChange={(e) => setPerformanceFormData({ ...performanceFormData, strengths: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                                                    placeholder="List strengths..."
                                                    rows={2}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Areas for Improvement</label>
                                                <textarea
                                                    value={performanceFormData.improvements}
                                                    onChange={(e) => setPerformanceFormData({ ...performanceFormData, improvements: e.target.value })}
                                                    className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                                                    placeholder="List improvements..."
                                                    rows={2}
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
                                            >
                                                <Icon name="Send" className="w-4 h-4 inline mr-2" />
                                                Submit Review
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDetails;
