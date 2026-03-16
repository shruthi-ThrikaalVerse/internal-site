
import React, { useState, useMemo, useEffect } from 'react';
import {
    BarChart3, Mail, Shield, Calendar, RotateCcw, UserPlus,
    MessageSquare, CheckCircle, CheckSquare, Edit3, Send, History,
    Star
} from 'lucide-react';
import { MOCK_REVIEWS } from '../../constants.js';
import { SectionHeader, Badge, StarRating } from './UI.tsx';
import { User } from '../../types.tsx';
import { Modal } from '../../components/super_admin/Modal.tsx';
import { FormSelect } from '../../components/super_admin/FormFields.tsx';
import { useApp } from '../../context/AppContext.tsx';
import * as usersApi from '../../api/users.js';
import { getAllReviews, submitReview, getPerformancePercentage } from '../../api/performance.ts';
import { PerformanceAnalyticsResponse } from '../../types.tsx';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const ADMIN_TIERS = ['ADMIN', 'PROJECT_MANAGER', 'HR', 'OPERATIONAL_MANAGER', 'SECURITY_ADMIN'];

interface PerformanceReview {
    id: string;
    adminName: string;
    adminId: string;
    period: 'monthly' | 'quarterly' | 'yearly';
    periodLabel: string;
    rating: number;
    feedback: string;
    strengths: string;
    improvements: string;
    submittedDate: string;
    submittedBy: string;
}

export const ReviewsView = () => {
    const { globalSearch, admins, setAdmins, currentUser } = useApp();

    // Admin List States
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    // Performance Metrics States
    const [performanceViewPeriod, setPerformanceViewPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [performanceViewFilter, setPerformanceViewFilter] = useState('');
    const [performanceViewYear, setPerformanceViewYear] = useState<number>(new Date().getFullYear());
    const [performanceFormPeriod, setPerformanceFormPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [performanceFormFilter, setPerformanceFormFilter] = useState('');
    const [performanceFormData, setPerformanceFormData] = useState({
        rating: '',
        feedback: '',
        strengths: '',
        improvements: ''
    });
    const [reviewHistory, setReviewHistory] = useState<PerformanceReview[]>([]);
    const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [analytics, setAnalytics] = useState<PerformanceAnalyticsResponse | null>(null);
    const [searchReview, setSearchReview] = useState('');
    const [reviewHistoryPeriodFilter, setReviewHistoryPeriodFilter] = useState<'all' | 'monthly' | 'quarterly' | 'yearly'>('all');
    const [ratingError, setRatingError] = useState<string | null>(null);

    const statuses = ['All Statuses', 'active', 'inactive', 'pending'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const formatBase64Image = (imageData: string | null | undefined): string => {
        if (!imageData) return '';
        if (imageData.startsWith('data:image')) return imageData;
        if (imageData.startsWith('http://') || imageData.startsWith('https://')) return imageData;
        if (imageData.startsWith('/') && imageData.length < 100) return imageData;
        if (imageData.match(/^[A-Za-z0-9+/=]+$/) && imageData.length > 100) {
            return `data:image/jpeg;base64,${imageData}`;
        }
        return '';
    };

    const transformAdminData = (apiData: any): User => {
        const formattedAvatar = formatBase64Image(apiData.profileImage || apiData.avatar);
        return {
            id: apiData.id || apiData.employeeId || apiData.userId || `adm-${Date.now()}`,
            name: apiData.name || `${apiData.firstName || ''} ${apiData.lastName || ''}`.trim(),
            firstName: apiData.firstName || '',
            lastName: apiData.lastName || '',
            email: apiData.email || '',
            role: apiData.role || 'ADMIN',
            status: apiData.status || 'active',
            avatar: formattedAvatar,
            employeeId: apiData.employeeId || apiData.id,
            username: apiData.username || apiData.firstName?.toUpperCase() || '',
            designation: apiData.designation || '',
            department: apiData.department || 'IT',
            phoneNumber: apiData.phoneNumber || '',
            address: apiData.address || '',
            dateOfJoining: apiData.dateOfJoining || apiData.joiningDate || new Date().toISOString().split('T')[0],
            dateOfBirth: apiData.dateOfBirth || '',
            employmentType: apiData.employmentType || apiData.userType || 'FULL_TIME',
            location: apiData.location || 'Central Command Hub',
            profileImage: apiData.profileImage,
            createdByEmployeeId: apiData.createdByEmployeeId || '',
            createdByRole: apiData.createdByRole || '',
            createdByName: apiData.createdByName || '',
            hrEmployeeId: apiData.hrEmployeeId || '',
        };
    };

    // Load admins on mount
    useEffect(() => {
        const loadAdminEmployees = async () => {
            try {
                const employees = await usersApi.getAllEmployees();
                if (Array.isArray(employees)) {
                    const formattedAdmins: User[] = employees
                        .filter((emp: any) => {
                            const roleVal = String((emp.role?.name || emp.role) || emp.userType || '').toUpperCase();
                            return ADMIN_TIERS.includes(roleVal);
                        })
                        .map((emp: any) => {
                            const roleVal = String((emp.role?.name || emp.role) || emp.userType || 'ADMIN').toUpperCase();
                            const statusValue = String(emp.status || 'active') as 'active' | 'inactive' | 'probation' | 'resigned';
                            return {
                                id: String(emp.employeeId || emp.id || `adm-${Date.now()}`),
                                name: `${String(emp.firstName || '')} ${String(emp.lastName || '')}`.trim(),
                                firstName: String(emp.firstName || ''),
                                lastName: String(emp.lastName || ''),
                                email: String(emp.email || ''),
                                role: (ADMIN_TIERS.includes(roleVal) ? roleVal : 'ADMIN') as any,
                                status: statusValue,
                                department: String(emp.department || 'IT'),
                                avatar: formatBase64Image(String(emp.profileImage || emp.avatar || '')),
                                employmentType: String(emp.userType || 'FULL_TIME'),
                                dateOfJoining: String(emp.dateOfJoining || new Date().toISOString().split('T')[0]),
                                employeeId: String(emp.employeeId || ''),
                                designation: String(emp.designation || 'Admin'),
                            };
                        });
                    setAdmins(formattedAdmins);
                }
            } catch (err) {
                console.error('Failed to load admin employees:', err);
                setAdmins([]);
            }
        };
        loadAdminEmployees();
    }, [setAdmins]);

    const filteredAdmins = useMemo(() => {
        return admins.filter(a => {
            if (!ADMIN_TIERS.includes(String(a.role).toUpperCase())) return false;
            const fullName = `${a.firstName || ''} ${a.lastName || a.name || ''}`.toLowerCase();
            const matchesSearch = !globalSearch ||
                fullName.includes(globalSearch.toLowerCase()) ||
                a.email.toLowerCase().includes(globalSearch.toLowerCase());
            const matchesStatus = selectedStatus === 'All Statuses' || a.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [admins, globalSearch, selectedStatus]);

    const convertRatingToEnum = (rating: string): 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE' => {
        const ratingNum = parseFloat(rating);
        if (ratingNum <= 1) return 'ONE';
        if (ratingNum <= 2) return 'TWO';
        if (ratingNum <= 3) return 'THREE';
        if (ratingNum <= 4) return 'FOUR';
        return 'FIVE';
    };

    const convertRatingToNumber = (rating: string): number => {
        const ratingMap: Record<string, number> = {
            'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5
        };
        return ratingMap[rating] || 3;
    };

    const availablePeriods = useMemo(() => {
        if (performanceViewPeriod === 'monthly') {
            return monthNames.map((m, i) => ({ label: m, value: (i + 1).toString() }));
        }
        if (performanceViewPeriod === 'quarterly') {
            return [
                { label: 'Q1', value: '1' }, { label: 'Q2', value: '2' },
                { label: 'Q3', value: '3' }, { label: 'Q4', value: '4' }
            ];
        }
        return [performanceViewYear - 1, performanceViewYear].map(y => ({ label: y.toString(), value: y.toString() }));
    }, [performanceViewPeriod, performanceViewYear]);

    const availableFormPeriods = useMemo(() => {
        if (performanceFormPeriod === 'monthly') {
            return monthNames.map((m, i) => ({ label: m, value: (i + 1).toString() }));
        }
        if (performanceFormPeriod === 'quarterly') {
            return [
                { label: 'Q1', value: '1' }, { label: 'Q2', value: '2' },
                { label: 'Q3', value: '3' }, { label: 'Q4', value: '4' }
            ];
        }
        return [performanceViewYear - 1, performanceViewYear].map(y => ({ label: y.toString(), value: y.toString() }));
    }, [performanceFormPeriod, performanceViewYear]);

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

    const generatePerformanceData = () => {
        if (analytics) {
            const attendanceData = [
                { name: 'Present', value: analytics.attendanceAnayticsResponse?.presentDays || 0, fill: '#10b981' },
                { name: 'Absent', value: analytics.attendanceAnayticsResponse?.absentDays || 0, fill: '#ef4444' }
            ];
            const leaveData = [
                { name: 'Leaves Taken', value: analytics.leaveAnalyticsResponse?.leavesTaken || 0, fill: '#ef4444' },
                { name: 'Working Days', value: analytics.leaveAnalyticsResponse?.workingDays || 0, fill: '#10b981' }
            ];
            const projectsData = [
                { name: 'Completed', value: analytics.projectAnalyticsResponse?.completed || 0, fill: '#10b981' },
                { name: 'In Progress', value: analytics.projectAnalyticsResponse?.inProgress || 0, fill: '#3b82f6' },
                { name: 'Assigned', value: analytics.projectAnalyticsResponse?.assigned || 0, fill: '#f59e0b' }
            ];
            return { attendance: attendanceData, leave: leaveData, projects: projectsData };
        }
        return { attendance: [], leave: [], projects: [] };
    };

    const pieChartData = useMemo(() => generatePerformanceData(), [analytics]);

    useEffect(() => {
        if (!viewingUser || !viewingUser.employeeId) {
            setReviewHistory([]);
            return;
        }

        const loadReviews = async () => {
            try {
                const reviews = await getAllReviews();
                const userReviews = reviews
                    .filter(review => review.employeeId !== 'N/A' && review.employeeId === viewingUser.employeeId)
                    .map(review => ({
                        id: review.id.toString(),
                        adminName: viewingUser.name,
                        adminId: viewingUser.employeeId,
                        period: review.periodType.toLowerCase() as 'monthly' | 'quarterly' | 'yearly',
                        periodLabel: review.period,
                        rating: convertRatingToNumber(review.rating),
                        feedback: review.feedback,
                        strengths: review.strengths,
                        improvements: review.areasOfImprovement,
                        submittedDate: review.createdAt.split('T')[0],
                        submittedBy: 'Admin User'
                    }))
                    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime());
                setReviewHistory(userReviews);
            } catch (error) {
                console.error('Failed to load reviews:', error);
                setReviewHistory([]);
            }
        };
        loadReviews();
    }, [viewingUser]);

    useEffect(() => {
        if (!viewingUser || !viewingUser.employeeId) {
            setAnalytics(null);
            return;
        }

        const loadAnalytics = async () => {
            try {
                const year = performanceViewYear;
                const month = performanceViewPeriod === 'monthly' ? parseInt(performanceViewFilter, 10) : undefined;
                const quarter = performanceViewPeriod === 'quarterly' ? parseInt(performanceViewFilter, 10) : undefined;
                const data = await getPerformancePercentage({
                    employeeId: viewingUser.employeeId,
                    periodType: performanceViewPeriod,
                    year,
                    month,
                    quarter
                });
                setAnalytics(data);
            } catch (error) {
                console.error('Failed to load performance analytics:', error);
                setAnalytics(null);
            }
        };

        if (performanceViewFilter) {
            loadAnalytics();
        }
    }, [viewingUser, performanceViewPeriod, performanceViewFilter, performanceViewYear]);

    const handlePerformanceReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Check if user is selected first
        if (!viewingUser || !viewingUser.employeeId) {
            alert('Please select an admin from the list first by clicking "View Metrics"');
            return;
        }

        let hasError = false;
        if (!performanceFormData.rating) {
            setRatingError('Please select a rating');
            hasError = true;
        } else {
            setRatingError(null);
        }
        if (!performanceFormData.feedback) {
            alert('Please fill in the feedback field');
            hasError = true;
        }
        if (hasError) {
            return;
        }

        try {
            const periodString = performanceFormPeriod === 'monthly'
                ? monthNames[parseInt(performanceFormFilter) - 1] + ' ' + performanceViewYear
                : performanceFormPeriod === 'quarterly'
                    ? `Q${performanceFormFilter} ${performanceViewYear}`
                    : `Year ${performanceFormFilter}`;

            const periodTypeMap: Record<'monthly' | 'quarterly' | 'yearly', 'MONTHLY' | 'QUARTERLY' | 'YEARLY'> = {
                'monthly': 'MONTHLY', 'quarterly': 'QUARTERLY', 'yearly': 'YEARLY'
            };

            await submitReview({
                employeeId: viewingUser.employeeId,
                employeeName: viewingUser.name,
                feedback: performanceFormData.feedback,
                strengths: performanceFormData.strengths,
                areasOfImprovement: performanceFormData.improvements,
                periodType: periodTypeMap[performanceFormPeriod],
                rating: convertRatingToEnum(performanceFormData.rating),
                period: periodString
            });

            const newReview: PerformanceReview = {
                id: String(reviewHistory.length + 1),
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: performanceFormPeriod,
                periodLabel: periodString,
                rating: parseFloat(performanceFormData.rating),
                feedback: performanceFormData.feedback,
                strengths: performanceFormData.strengths,
                improvements: performanceFormData.improvements,
                submittedDate: new Date().toISOString().split('T')[0],
                submittedBy: 'Admin User'
            };

            setReviewHistory([newReview, ...reviewHistory]);
            setPerformanceFormData({ rating: '', feedback: '', strengths: '', improvements: '' });
            setRatingError(null);
            alert('Performance review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader title="Reviews & Ratings" description="Manage admin performance reviews and metrics." />

            {/* Admin List Section */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-gray-900">Select Admin for Performance Review</h3>
                
                <div className="bg-white/50 p-4 rounded-2xl border border-gray-200 backdrop-blur-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 flex gap-3 w-full">
                        <div className="flex-1 max-w-xs">
                            <FormSelect
                                label="Account Status"
                                value={selectedStatus}
                                onChange={setSelectedStatus}
                                options={statuses}
                            />
                        </div>
                    </div>
                    {selectedStatus !== 'All Statuses' && (
                        <button
                            onClick={() => setSelectedStatus('All Statuses')}
                            title="Reset filters"
                            className="h-[44px] px-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all border border-gray-200"
                        >
                            <RotateCcw size={16} />
                        </button>
                    )}
                </div>

                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse min-w-[1100px]">
                            <thead className="bg-gray-50 backdrop-blur-md border-b border-gray-200">
                                <tr>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Administrator</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Role</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Status</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Email</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Joining Date</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {filteredAdmins.map((a) => (
                                    <tr key={a.id} className="hover:bg-gray-50 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="relative shrink-0">
                                                    {a.avatar && (
                                                        <>
                                                            <img
                                                                src={formatBase64Image(a.avatar)}
                                                                alt={a.name}
                                                                className="w-12 h-12 rounded-xl border border-gray-200 shadow-xl group-hover:scale-105 transition-transform object-cover"
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.style.display = 'none';
                                                                }}
                                                            />
                                                            <Shield className="absolute -bottom-1 -right-1 w-4 h-4 p-0.5 rounded-full border border-white bg-emerald-500 text-white" />
                                                        </>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="font-bold text-gray-900 truncate">{a.firstName ? `${a.firstName} ${a.lastName}` : a.name}</div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] text-gray-500 font-mono opacity-70">UID: {a.employeeId || a.id}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <Badge color={a.role.includes('SUPER') ? 'red' : 'green'}>{a.role.toUpperCase()}</Badge>
                                        </td>
                                        <td className="px-8 py-5">
                                            <Badge color={a.status === 'active' ? 'green' : 'red'}>{a.status.toUpperCase()}</Badge>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-[11px] text-gray-900 font-mono bg-gray-100 px-3 py-1.5 rounded-lg w-fit">
                                                <Mail size={12} /> {a.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-2 text-[11px] text-gray-900 font-bold">
                                                <Calendar size={12} />
                                                {a.dateOfJoining || '2024-01-01'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => setViewingUser(a)}
                                                className="px-4 py-2 text-white text-xs font-black rounded-lg transition-all"
                                                style={{ backgroundColor: '#c97a4c' }}
                                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'}
                                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
                                            >
                                                View Metrics
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredAdmins.length === 0 && (
                            <div className="p-24 text-center flex flex-col items-center gap-4 bg-white">
                                <Shield size={64} className="text-gray-300 animate-pulse" />
                                <div className="space-y-1">
                                    <h4 className="text-gray-900 font-bold text-lg">No Admins Found</h4>
                                    <p className="text-gray-500 text-sm max-w-xs">No matching admins available.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Performance Metrics Modal */}
            {viewingUser && (
                <Modal
                    isOpen={!!viewingUser}
                    onClose={() => setViewingUser(null)}
                    title={`Performance Metrics - ${viewingUser.name}`}
                    onSave={() => setViewingUser(null)}
                    isLoading={false}
                    maxWidth="max-w-6xl"
                    showFooter={false}
                >
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 flex items-center gap-3">
                                <div className="p-3 bg-indigo-100 rounded-2xl">
                                    <BarChart3 className="w-7 h-7 text-indigo-600" />
                                </div>
                                Performance Metrics & Review
                            </h2>
                            <p className="text-slate-600 text-sm">Monitor admin performance across attendance, leave, and project metrics</p>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
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
                                        title="Select performance review year"
                                        value={performanceViewYear}
                                        onChange={(e) => setPerformanceViewYear(parseInt(e.target.value, 10))}
                                        className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    />
                                </div>

                                <div className="flex-1 max-w-xs">
                                    <label className="text-xs font-black text-black uppercase tracking-widest mb-1 block">Select Period</label>
                                    <select
                                        title="Select performance review period"
                                        value={performanceViewFilter}
                                        onChange={(e) => setPerformanceViewFilter(e.target.value)}
                                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                    >
                                        {availablePeriods.map((p) => (
                                            <option key={p.value} value={p.value}>{p.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="col-span-1 space-y-8">
                                {/* Attendance Chart */}
                                <div className="bg-white rounded-3xl shadow-md border-2 overflow-hidden hover:shadow-lg transition-shadow" style={{ borderColor: '#c97a4c' }}>
                                    <div className="bg-gradient-to-r p-6 border-b" style={{ backgroundImage: 'linear-gradient(90deg, #f5ede3 0%, #f0e6dc 100%)', borderColor: '#c97a4c' }}>
                                        <h3 className="text-lg font-black text-black flex items-center gap-3">
                                            <div className="p-2 rounded-xl" style={{ backgroundColor: '#f5ede3', color: '#c97a4c' }}>
                                                <CheckCircle className="w-6 h-6" style={{ color: '#c97a4c' }} />
                                            </div>
                                            Attendance Record
                                        </h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 text-center">
                                                <p className="text-2xl font-black text-blue-600">{pieChartData.attendance[0]?.value || 0}</p>
                                                <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mt-2">Present</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200 text-center">
                                                <p className="text-2xl font-black text-yellow-600">{pieChartData.attendance[1]?.value || 0}</p>
                                                <p className="text-xs font-bold text-yellow-700 uppercase tracking-widest mt-2">Absent</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 text-center">
                                                <p className="text-2xl font-black text-green-600">{Math.round((pieChartData.attendance[0]?.value || 0) / ((pieChartData.attendance[0]?.value || 0) + (pieChartData.attendance[1]?.value || 1)) * 100)}%</p>
                                                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-2">Rate</p>
                                            </div>
                                        </div>
                                        <div className="h-96">
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

                                {/* Leave Chart */}
                                <div className="bg-white rounded-3xl shadow-md border border-red-200 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-red-200">
                                        <h3 className="text-lg font-black text-black flex items-center gap-3">
                                            <div className="p-2 bg-red-100 rounded-xl">
                                                <Calendar className="w-6 h-6 text-red-600" />
                                            </div>
                                            Leave Balance
                                        </h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200">
                                                <p className="text-2xl font-black text-red-600">{pieChartData.leave[0]?.value || 0}</p>
                                                <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-2">Leaves Taken</p>
                                            </div>
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                                                <p className="text-2xl font-black text-green-600">{pieChartData.leave[1]?.value || 0}</p>
                                                <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-2">Working Days</p>
                                            </div>
                                        </div>
                                        <div className="h-96">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={pieChartData.leave}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={false}
                                                        label={({ name, value }) => `${name}: ${value}`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="value"
                                                    >
                                                        {pieChartData.leave.map((entry, index) => (
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

                                {/* Projects Chart */}
                                <div className="bg-white rounded-3xl shadow-md border border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-200">
                                        <h3 className="text-lg font-black text-black flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-xl">
                                                <CheckSquare className="w-6 h-6 text-purple-600" />
                                            </div>
                                            Project Status
                                        </h3>
                                    </div>
                                    <div className="p-6 space-y-6">
                                        {pieChartData.projects.length > 0 ? (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    {pieChartData.projects.map((item, idx) => {
                                                        const colorConfigs = [
                                                            { bg: 'from-purple-50 to-purple-100', border: 'border-purple-200', text: 'text-purple-600', label: 'text-purple-700' },
                                                            { bg: 'from-blue-50 to-blue-100', border: 'border-blue-200', text: 'text-blue-600', label: 'text-blue-700' },
                                                            { bg: 'from-amber-50 to-amber-100', border: 'border-amber-200', text: 'text-amber-600', label: 'text-amber-700' }
                                                        ];
                                                        const color = colorConfigs[idx % colorConfigs.length];
                                                        return (
                                                            <div key={idx} className={`bg-gradient-to-br ${color.bg} rounded-2xl p-4 ${color.border} border text-center`}>
                                                                <p className={`text-2xl font-black ${color.text}`}>{item.value}</p>
                                                                <p className={`text-xs font-bold ${color.label} uppercase tracking-widest mt-2`}>{item.name}</p>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                                <div className="h-96">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={pieChartData.projects}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {pieChartData.projects.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `${value}`} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <p className="text-sm font-medium">No project data available</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Form Section */}
                            <div className="col-span-1 flex flex-col h-full">
                                <div className="flex-shrink-0 mb-6">
                                    <h3 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                        <div className="p-3 bg-indigo-100 rounded-2xl">
                                            <Edit3 className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        Add Performance Review
                                    </h3>

                                    <form onSubmit={handlePerformanceReviewSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
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
                                                title="Select performance review period"
                                                value={performanceFormFilter}
                                                onChange={(e) => setPerformanceFormFilter(e.target.value)}
                                                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-semibold text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            >
                                                {availableFormPeriods.map((p) => (
                                                    <option key={p.value} value={p.value}>{p.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Rating</label>
                                            <select
                                                title="Select performance rating"
                                                value={performanceFormData.rating}
                                                onChange={(e) => setPerformanceFormData({ ...performanceFormData, rating: e.target.value })}
                                                className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                            >
                                                <option value="">Select a rating</option>
                                                <option value="1">1 - Poor</option>
                                                <option value="2">2 - Fair</option>
                                                <option value="3">3 - Good</option>
                                                <option value="4">4 - Very Good</option>
                                                <option value="5">5 - Excellent</option>
                                            </select>
                                            {ratingError && <div className="text-red-500 text-xs mt-1">{ratingError}</div>}
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
                                            <Send className="w-4 h-4 inline mr-2" />
                                            Submit Review
                                        </button>
                                    </form>
                                </div>

                                <div className="flex-1 flex flex-col min-h-0 border-t border-slate-200 pt-6 overflow-hidden">
                                    <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-3 flex-shrink-0">
                                        <div className="p-3 bg-purple-100 rounded-2xl">
                                            <History className="w-6 h-6 text-purple-600" />
                                        </div>
                                        Review History
                                    </h3>
                                    {reviewHistory.length > 0 ? (
                                        <div className="space-y-4 overflow-y-auto custom-scrollbar">
                                            <div className="grid grid-cols-2 gap-3 p-4 rounded-xl flex-shrink-0" style={{ backgroundColor: 'rgb(243, 232, 255)', borderColor: '#c97a4c', borderWidth: '1px' }}>
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Reviews</p>
                                                    <p className="text-2xl font-black text-purple-600 mt-1">{reviewHistory.length}</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Rating</p>
                                                    <div className="flex gap-1 justify-center mt-2">
                                                        {(() => {
                                                            const avg = reviewHistory.reduce((acc, r) => acc + (Number(r.rating) || 0), 0) / reviewHistory.length;
                                                            const filledStars = isNaN(avg) ? 0 : Math.round(avg);
                                                            return [...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    size={20}
                                                                    className={i < filledStars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                                                />
                                                            ));
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                {reviewHistory
                                                    .filter((review) => {
                                                        const matchesSearch = review.periodLabel.toLowerCase().includes(searchReview.toLowerCase()) || review.feedback.toLowerCase().includes(searchReview.toLowerCase());
                                                        const matchesPeriod = reviewHistoryPeriodFilter === 'all' || review.period === reviewHistoryPeriodFilter;
                                                        return matchesSearch && matchesPeriod;
                                                    })
                                                    .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
                                                    .map((review) => (
                                                        <div
                                                            key={review.id}
                                                            onClick={() => { setSelectedReview(review); setShowReviewModal(true); }}
                                                            className="p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all hover:shadow-md text-sm"
                                                        >
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="font-black text-black text-xs">{review.periodLabel}</span>
                                                                <span className="font-black text-yellow-500 text-xs px-1.5 py-0.5 bg-yellow-50 rounded">{review.rating}</span>
                                                            </div>
                                                            <p className="text-xs text-slate-600 line-clamp-2">{review.feedback}</p>
                                                        </div>
                                                    ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <p className="text-sm font-medium">No reviews yet</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Review Details Modal */}
            {showReviewModal && selectedReview && (
                <Modal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    title="Review Details"
                    onSave={() => setShowReviewModal(false)}
                    isLoading={false}
                >
                    <div className="space-y-4">
                        <p><strong>Period:</strong> {selectedReview.periodLabel}</p>
                        <p><strong>Rating:</strong> {selectedReview.rating} / 5</p>
                        <p><strong>Feedback:</strong> {selectedReview.feedback}</p>
                        <p><strong>Strengths:</strong> {selectedReview.strengths}</p>
                        <p><strong>Improvements:</strong> {selectedReview.improvements}</p>
                        <p><strong>Submitted:</strong> {selectedReview.submittedDate}</p>
                    </div>
                </Modal>
            )}

            {/* ...removed legacy review summary and mock data... */}
        </div>
    );
};
