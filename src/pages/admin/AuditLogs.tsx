import React, { useEffect, useMemo, useState, useRef } from 'react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { fetchAuditLogs, exportAuditLogs, AuditQuery } from '../../api/audit.ts';
import { AuditLog } from '../../types.ts';
import { AdminRoute } from '../../components/admin/RouteGuards.tsx';

const LEVELS = ['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL', 'LOGIN', 'SECURITY', 'CREATE', 'UPDATE', 'DELETE'];

const formatLocal = (iso?: string) => {
    if (!iso) return '-';
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch (e) {
        return iso;
    }
};

const maskSensitive = (obj: any) => {
    if (!obj || typeof obj !== 'object') return obj;
    const clone: any = Array.isArray(obj) ? [] : {};
    Object.keys(obj).forEach((k) => {
        const v = obj[k];
        if (/pass(word)?|secret|api(key)?|token|ssn/i.test(k)) {
            clone[k] = '***';
        } else if (typeof v === 'object') clone[k] = maskSensitive(v);
        else clone[k] = v;
    });
    return clone;
};

const AuditLogsPage: React.FC = () => {
    const { user } = useAuth();
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [total, setTotal] = useState(0);

    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [search, setSearch] = useState('');
    const [level, setLevel] = useState('ALL');
    const [startDate, setStartDate] = useState<string | undefined>(undefined);
    const [endDate, setEndDate] = useState<string | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(false);
    const [sort, setSort] = useState('timestamp');
    const [order, setOrder] = useState<'asc' | 'desc'>('desc');
    const [liveTail, setLiveTail] = useState(false);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [usingMock, setUsingMock] = useState(false);
    const tailRef = useRef<number | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const presets = {
        today: () => {
            const d = new Date();
            d.setHours(0, 0, 0, 0);
            setStartDate(d.toISOString());
            setEndDate(new Date().toISOString());
        },
        last24h: () => {
            const end = new Date();
            const start = new Date(end.getTime() - 24 * 3600 * 1000);
            setStartDate(start.toISOString());
            setEndDate(end.toISOString());
        },
        last7d: () => {
            const end = new Date();
            const start = new Date(end.getTime() - 7 * 24 * 3600 * 1000);
            setStartDate(start.toISOString());
            setEndDate(end.toISOString());
        }
    };

    const load = async () => {
        setIsLoading(true);
        try {
            const q: AuditQuery = { page, limit, search, sort, order };
            if (level && level !== 'ALL') q.level = level;
            if (startDate) q.startDate = startDate;
            if (endDate) q.endDate = endDate;
            const res: any = await fetchAuditLogs(q);
            setUsingMock(!!res.fromMock);
            setLogs((res.logs || []).map((l: any) => ({
                ...l,
                details: maskSensitive(typeof l.details === 'string' ? tryParse(l.details) : l.details)
            })));
            setTotal(res.total || 0);
        } catch (e: any) {
            console.error(e);
            // TODO: show toast notification
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, search, level, startDate, endDate, sort, order]);

    // Live tail polling
    useEffect(() => {
        if (liveTail) {
            tailRef.current = window.setInterval(() => {
                load();
            }, 5000);
        } else if (tailRef.current) {
            window.clearInterval(tailRef.current);
            tailRef.current = null;
        }
        return () => {
            if (tailRef.current) window.clearInterval(tailRef.current);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liveTail]);

    const tryParse = (s: string) => {
        try { return JSON.parse(s); } catch { return s; }
    };

    const exportCsv = async (fmt: 'csv' | 'json') => {
        try {
            const blob = await exportAuditLogs(
                { startDate, endDate, level: level === 'ALL' ? undefined : level, search },
                fmt
            );
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.${fmt}`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
        }
    };

    const sortToggle = (field: string) => {
        if (sort === field) setOrder(order === 'asc' ? 'desc' : 'asc');
        else { setSort(field); setOrder('desc'); }
    };

    const metrics = useMemo(() => {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const logsToday = logs.filter(l => new Date(l.timestamp) >= todayStart).length;
        const critical24h = logs.filter(
            l => (l.level === 'ERROR' || l.level === 'CRITICAL') &&
                (new Date(l.timestamp) >= new Date(Date.now() - 24 * 3600 * 1000))
        ).length;
        const failedLogins = logs.filter(l => l.level === 'LOGIN' && /failed/i.test(l.message)).length;

        return { logsToday, critical24h, failedLogins };
    }, [logs]);

    return (
        <AdminRoute>
            <div className="w-full">
                {/* Warning Banner - Fixed at top */}
                {/* {usingMock && (
                        // <div className="sticky top-0 z-50 w-full">
                        //     <div className="max-w-full mx-auto px-4 md:px-6 py-2">
                        //         <div className="rounded-md bg-yellow-50 border border-yellow-100 text-yellow-800 px-4 py-2 text-sm">
                        //             Using local mock audit logs because the backend is unavailable.
                        //         </div>
                        //     </div>
                        // </div>
                    )} */}

                {/* Header + Actions - Fixed positioning removed, added margin top */}
                <div className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 md:px-6 md:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-7xl mx-auto">
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Audit Logs</h1>
                            <p className="text-sm text-gray-600 mt-0.5">System activity & security events</p>
                        </div>

                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Live Tail Toggle */}
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600 hidden sm:inline">Live</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        aria-label="Live tail"
                                        checked={liveTail}
                                        onChange={(e) => setLiveTail(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                            </div>

                            {/* Export buttons */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => exportCsv('csv')}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                                >
                                    <LucideIcons.Download size={16} />
                                    CSV
                                </button>
                                <button
                                    onClick={() => exportCsv('json')}
                                    className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-1.5 shadow-sm whitespace-nowrap"
                                >
                                    <LucideIcons.Download size={16} />
                                    JSON
                                </button>
                            </div>

                            {/* Mobile filter toggle */}
                            <button
                                onClick={() => setShowMobileFilters(!showMobileFilters)}
                                className="md:hidden px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                            >
                                {showMobileFilters ? 'Hide Filters' : 'Show Filters'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content Container */}
                <div className="max-w-7xl mx-auto px-4 md:px-6 pt-5">
                    {/* Metrics Grid - Removed overlapping margins */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-900">Total Logs</p>
                                    <p className="text-2xl font-bold mt-1 text-black">{total.toLocaleString()}</p>
                                </div>
                                <div className="p-3 bg-blue-50 rounded-lg">
                                    <LucideIcons.Database size={24} className="text-blue-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-900">Critical (24h)</p>
                                    <p className={`text-2xl font-bold mt-1 ${metrics.critical24h > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                        {metrics.critical24h}
                                    </p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-lg">
                                    <LucideIcons.AlertTriangle size={24} className="text-red-600" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-900">Failed Logins (24h)</p>
                                    <p className={`text-2xl font-bold mt-1 ${metrics.failedLogins > 0 ? 'text-amber-600' : 'text-gray-900'}`}>
                                        {metrics.failedLogins}
                                    </p>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg">
                                    <LucideIcons.ShieldAlert size={24} className="text-amber-600" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Filters Panel - Enhanced Design */}
                    <div className={`mb-6 ${showMobileFilters ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Header */}
                            <div className="px-5 py-4 bg-gradient-to-r from-gray-50 to-gray-100/50 border-b border-gray-200">
                                <div className="flex items-center gap-2">
                                    <LucideIcons.Filter className="w-5 h-5 text-gray-600" />
                                    <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Filters</h2>
                                </div>
                            </div>

                            {/* Quick Presets - Compact */}
                            <div className="px-5 pt-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="text-xs font-medium text-gray-500 mr-1">Quick:</span>
                                    <button
                                        onClick={presets.today}
                                        className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        Today
                                    </button>
                                    <button
                                        onClick={presets.last24h}
                                        className="px-3 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        Last 24h
                                    </button>
                                    <button
                                        onClick={presets.last7d}
                                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition-colors"
                                    >
                                        7 Days
                                    </button>
                                </div>
                            </div>

                            {/* Filter Grid */}
                            <div className="p-5 space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {/* Level Select */}
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                                            Log Level
                                        </label>
                                        <select
                                            value={level}
                                            onChange={(e) => setLevel(e.target.value)}
                                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                        >
                                            {LEVELS.map(l => (
                                                <option key={l} value={l}>{l}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Search */}
                                    <div className="md:col-span-2 lg:col-span-1">
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                                            Search
                                        </label>
                                        <div className="relative">
                                            <LucideIcons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                value={search}
                                                onChange={(e) => setSearch(e.target.value)}
                                                placeholder="User, message, IP..."
                                                className="w-full pl-9 pr-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-gray-400 text-gray-900"
                                            />
                                        </div>
                                    </div>

                                    {/* Date Range */}
                                    <div className="md:col-span-2 lg:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1.5">
                                            Date Range
                                        </label>
                                        <div className="grid grid-cols-2 gap-4 w-full">
                                            <div className="relative">
                                                <LucideIcons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={startDate ? startDate.split('T')[0] : ''}
                                                    onChange={e => setStartDate(e.target.value ? `${e.target.value}T00:00:00Z` : undefined)}
                                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                                    placeholder="From"
                                                />
                                            </div>
                                            <div className="relative">
                                                <LucideIcons.Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="date"
                                                    value={endDate ? endDate.split('T')[0] : ''}
                                                    onChange={e => setEndDate(e.target.value ? `${e.target.value}T23:59:59Z` : undefined)}
                                                    className="w-full pl-10 pr-3 py-2.5 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                                    placeholder="To"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                                    <button
                                        onClick={() => {
                                            setSearch('');
                                            setLevel('ALL');
                                            setStartDate(undefined);
                                            setEndDate(undefined);
                                            setPage(1);
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                                    >
                                        Reset
                                    </button>
                                    <button
                                        onClick={() => { setPage(1); load(); }}
                                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center gap-2"
                                    >
                                        <LucideIcons.Filter className="w-4 h-4" />
                                        Apply Filters
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logs Content */}
                    <div className="mb-6">
                        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                            {/* Table Header Info */}
                            <div className="px-4 py-3 md:px-5 md:py-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <h2 className="text-lg font-semibold text-gray-900">Audit Entries</h2>
                                <div className="text-sm text-gray-600 whitespace-nowrap">
                                    Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()}
                                </div>
                            </div>

                            {/* Desktop Table - Fixed header with scrollable body and invisible scrollbar */}
                            <div className="hidden md:block">
                                <style>{`
                                    .hide-scrollbar {
                                        scrollbar-width: none;
                                        -ms-overflow-style: none;
                                    }
                                    .hide-scrollbar::-webkit-scrollbar {
                                        display: none;
                                    }
                                    .table-fixed-header {
                                        position: sticky;
                                        top: 0;
                                        background-color: #f9fafb;
                                        z-index: 10;
                                    }
                                `}</style>
                                <div
                                    ref={scrollContainerRef}
                                    className="overflow-x-auto overflow-y-auto max-h-[600px] hide-scrollbar"
                                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                >
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50 table-fixed-header">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[150px]" onClick={() => sortToggle('timestamp')}>
                                                    Time {sort === 'timestamp' && (order === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[80px]" onClick={() => sortToggle('level')}>
                                                    Level {sort === 'level' && (order === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100 min-w-[100px]" onClick={() => sortToggle('user')}>
                                                    User {sort === 'user' && (order === 'asc' ? '↑' : '↓')}
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px]">Role</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">Action</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">Module</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">Entity</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[80px]">Entity ID</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[180px]">Message</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[120px]">Service</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[100px]">IP Address</th>
                                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">Details</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200 bg-white">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={12} className="px-6 py-16 text-center text-gray-500">
                                                        Loading audit logs...
                                                    </td>
                                                </tr>
                                            ) : logs.length === 0 ? (
                                                <tr>
                                                    <td colSpan={12} className="px-6 py-16 text-center text-gray-500">
                                                        No matching audit logs found
                                                    </td>
                                                </tr>
                                            ) : (
                                                logs.map(log => <DesktopRow key={log.id} log={log} />)
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Mobile Cards */}
                            <div className="md:hidden divide-y divide-gray-200">
                                {isLoading ? (
                                    <div className="p-8 text-center text-gray-500">Loading...</div>
                                ) : logs.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">No logs found</div>
                                ) : (
                                    logs.map(log => <MobileRow key={log.id} log={log} />)
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="px-4 py-4 md:px-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm text-gray-600 order-2 sm:order-1">
                                    Page {page} of {Math.ceil(total / limit) || 1}
                                </div>
                                <div className="flex items-center gap-2 order-1 sm:order-2">
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={page <= 1 || isLoading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors text-black"
                                    >
                                        Previous
                                    </button>
                                    <span className="px-4 py-2 font-medium text-black">{page}</span>
                                    <button
                                        onClick={() => setPage(p => p + 1)}
                                        disabled={page * limit >= total || isLoading}
                                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50 transition-colors text-black"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminRoute>
    );
};

const DetailPreview: React.FC<{ details?: any }> = ({ details }) => {
    if (!details) return <span className="text-sm text-gray-500">-</span>;

    // Format details as readable key-value pairs instead of JSON
    const formatDetails = (obj: any): string => {
        if (typeof obj === 'string') return obj;
        if (typeof obj !== 'object') return String(obj);

        const lines: string[] = [];
        const recurse = (o: any, indent = '') => {
            if (o === null || o === undefined) return;
            if (typeof o !== 'object') {
                lines.push(String(o));
                return;
            }

            Object.entries(o).forEach(([key, value]) => {
                const displayKey = key.replace(/([A-Z])/g, ' $1').trim(); // camelCase to Title Case

                if (value === null || value === undefined) {
                    lines.push(`${indent}${displayKey}: -`);
                } else if (typeof value === 'object' && !Array.isArray(value)) {
                    lines.push(`${indent}${displayKey}:`);
                    recurse(value, indent + '  ');
                } else if (Array.isArray(value)) {
                    lines.push(`${indent}${displayKey}: ${value.join(', ')}`);
                } else {
                    lines.push(`${indent}${displayKey}: ${value}`);
                }
            });
        };
        recurse(obj);
        return lines.join('\n');
    };

    const formatted = formatDetails(details);
    const truncated = formatted.length > 300 ? `${formatted.slice(0, 300)}…` : formatted;

    return (
        <div className="text-sm text-gray-700 max-h-52 overflow-auto bg-gray-50 p-3 rounded border border-gray-200 font-sans hide-scrollbar" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
        }}>
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
            {truncated.split('\n').map((line, i) => (
                <div key={i} className="whitespace-pre-wrap break-words text-xs leading-relaxed">
                    {line}
                </div>
            ))}
        </div>
    );
};

const DesktopRow: React.FC<{ log: AuditLog }> = ({ log }) => {
    return (
        <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatLocal(log.timestamp)}</td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                    {log.level || 'N/A'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{log.user || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.role || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-semibold">{log.action || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.module || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{log.entity || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-mono">{log.entityId || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-700 max-w-[280px] truncate" title={log.message}>{log.message || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono text-xs">{log.serviceName || '-'}</td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-mono text-xs">{log.ipAddress || '-'}</td>
            <td className="px-6 py-4 text-sm text-gray-700 max-w-[180px]">
                <DetailPreview details={log.details} />
            </td>
        </tr>
    );
};

const MobileRow: React.FC<{ log: AuditLog }> = ({ log }) => {
    return (
        <div className="p-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                            {log.level || 'N/A'}
                        </span>
                        <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded">{log.action || '-'}</span>
                    </div>

                    <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                        <LucideIcons.User size={14} />
                        <span>{log.user || 'System'} {log.role ? `(${log.role})` : ''}</span>
                    </div>

                    <div className="text-sm text-gray-700">{log.message || '-'}</div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                        <div><strong>Module:</strong> {log.module || '-'}</div>
                        <div><strong>Entity:</strong> {log.entity || '-'}</div>
                        <div><strong>Entity ID:</strong> <span className="font-mono">{log.entityId || '-'}</span></div>
                        <div><strong>Service:</strong> {log.serviceName || '-'}</div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <LucideIcons.Clock size={14} />
                        <span>{formatLocal(log.timestamp)}</span>
                        <span className="mx-1">•</span>
                        <LucideIcons.Globe size={14} />
                        <span className="font-mono">{log.ipAddress || '-'}</span>
                    </div>

                    {log.details && (
                        <div className="mt-3">
                            <DetailPreview details={log.details} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Helper function for level colors
const getLevelColor = (level?: string) => {
    switch (level?.toUpperCase()) {
        case 'ERROR':
        case 'CRITICAL':
            return 'bg-red-100 text-red-700';
        case 'WARN':
            return 'bg-amber-100 text-amber-700';
        case 'LOGIN':
        case 'SECURITY':
            return 'bg-purple-100 text-purple-700';
        case 'CREATE':
            return 'bg-green-100 text-green-700';
        case 'UPDATE':
            return 'bg-blue-100 text-blue-700';
        case 'DELETE':
            return 'bg-rose-100 text-rose-700';
        default:
            return 'bg-gray-100 text-gray-700';
    }
};

export default AuditLogsPage;