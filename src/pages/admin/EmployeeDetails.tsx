import React, { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { PerformanceAnalyticsResponse } from '../../types.ts';
import { getPerformancePercentage, submitReview, getAllReviews } from '../../api/performance.ts';

const Icon = ({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} onClick={onClick} /> : null;
};

// Helper function to convert rating string to number
const convertRatingToNumber = (rating: string): number => {
  const ratingMap: Record<string, number> = {
    'ONE': 1,
    'TWO': 2,
    'THREE': 3,
    'FOUR': 4,
    'FIVE': 5
  };
  return ratingMap[rating] || 1;
};


// Review History Type
interface PerformanceReview {
  id: string;
  employeeName: string;
  employeeId: string;
  period: 'monthly' | 'quarterly' | 'yearly';
  periodLabel: string;
  rating: number;
  feedback: string;
  strengths: string;
  improvements: string;
  submittedDate: string;
  submittedBy: string;
}

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employees, updateEmployee } = useHRMS();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [reviewHistory, setReviewHistory] = useState<PerformanceReview[]>([]);
  const [searchReview, setSearchReview] = useState('');
  const [reviewHistoryPeriodFilter, setReviewHistoryPeriodFilter] = useState<'all' | 'monthly' | 'quarterly' | 'yearly'>('all');
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
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

  // Find the employee
  const selectedEmployee = employees.find(emp => emp.id === id);

  // whenever the period or filter or year changes, fire off an API call
  useEffect(() => {
    // Load reviews from API
    const loadReviews = async () => {
      try {
        const reviews = await getAllReviews();
        // Transform API review to PerformanceReview format
        const formattedReviews: PerformanceReview[] = reviews.map((review) => {
          // Find employee name from the employees list
          const employee = employees.find(emp => emp.employeeId === review.employeeId);
          return {
            id: review.id.toString(),
            employeeName: employee?.fullName || 'Unknown',
            employeeId: review.employeeId,
            period: review.periodType.toLowerCase() as 'monthly' | 'quarterly' | 'yearly',
            periodLabel: review.period,
            rating: convertRatingToNumber(review.rating),
            feedback: review.feedback,
            strengths: review.strengths,
            improvements: review.areasOfImprovement,
            submittedDate: review.createdAt.split('T')[0],
            submittedBy: 'Admin User'
          };
        });
        setReviewHistory(formattedReviews);
      } catch (error) {
        console.error('Failed to load reviews:', error);
        setReviewHistory([]);
      }
    };

    loadReviews();
  }, [employees]);

  useEffect(() => {
    if (!selectedEmployee) {
      setAnalytics(null);
      return;
    }

    const fetch = async () => {
      try {
        const year = performanceViewYear;
        const month = performanceViewPeriod === 'monthly' ? parseInt(performanceViewFilter, 10) : undefined;
        const quarter = performanceViewPeriod === 'quarterly' ? parseInt(performanceViewFilter, 10) : undefined;

        const resp = await getPerformancePercentage({
          employeeId: selectedEmployee.employeeId,
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
  }, [selectedEmployee, performanceViewPeriod, performanceViewFilter, performanceViewYear]);

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

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
    if (!analytics || !analytics.leaveAnalyticsResponse || !analytics.attendanceAnayticsResponse) {
      return { leaves: [], attendance: [], tasks: [] };
    }
    
    // Handle task data if available
    let tasksData: any[] = [];
    if (analytics.taskAnalyticsResponse) {
      const pendingTasks = analytics.taskAnalyticsResponse.assigned - analytics.taskAnalyticsResponse.completed;
      tasksData = [
        { name: 'Completed', value: analytics.taskAnalyticsResponse.completed, fill: '#10b981' },
        { name: 'Pending', value: pendingTasks, fill: '#ef4444' }
      ];
    }
    
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
        { name: 'Present', value: analytics.attendanceAnayticsResponse.presentDays, fill: '#3b82f6' },
        { name: 'Absent', value: analytics.attendanceAnayticsResponse.absentDays, fill: '#fbbf24' }
      ],
      tasks: tasksData
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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!performanceFormData.rating || !performanceFormData.feedback) {
      alert('Please fill in rating and feedback');
      return;
    }

    try {
      // Convert rating string to enum format
      const ratingMap: Record<string, 'ONE' | 'TWO' | 'THREE' | 'FOUR' | 'FIVE'> = {
        'one': 'ONE',
        'two': 'TWO',
        'three': 'THREE',
        'four': 'FOUR',
        'five': 'FIVE'
      };

      const periodTypeMap: Record<'monthly' | 'quarterly' | 'yearly', 'MONTHLY' | 'QUARTERLY' | 'YEARLY'> = {
        'monthly': 'MONTHLY',
        'quarterly': 'QUARTERLY',
        'yearly': 'YEARLY'
      };

      const periodString = performanceFormPeriod === 'monthly' 
        ? monthNames[parseInt(performanceFormFilter) - 1] + ' ' + performanceViewYear
        : performanceFormPeriod === 'quarterly'
        ? `Q${performanceFormFilter} ${performanceViewYear}`
        : `Year ${performanceFormFilter}`;

      // Try to submit via API (will use dummy data if API not available)
      try {
        await submitReview({
          employeeId: selectedEmployee?.employeeId || 'N/A',
          employeeName: selectedEmployee?.fullName || 'Unknown',
          feedback: performanceFormData.feedback,
          strengths: performanceFormData.strengths,
          areasOfImprovement: performanceFormData.improvements,
          periodType: periodTypeMap[performanceFormPeriod],
          rating: ratingMap[performanceFormData.rating] || 'ONE',
          period: periodString
        });
      } catch (apiError) {
        console.warn('API not available, adding review locally:', apiError);
        // Continue with local storage if API fails
      }

      // Add to local state regardless
      const ratingValueMap: Record<string, number> = {
        'one': 1,
        'two': 2,
        'three': 3,
        'four': 4,
        'five': 5
      };

      const newReview: PerformanceReview = {
        id: String(reviewHistory.length + 1),
        employeeName: selectedEmployee?.fullName || 'Unknown',
        employeeId: selectedEmployee?.employeeId || 'N/A',
        period: performanceFormPeriod,
        periodLabel: periodString,
        rating: ratingValueMap[performanceFormData.rating] || 1,
        feedback: performanceFormData.feedback,
        strengths: performanceFormData.strengths,
        improvements: performanceFormData.improvements,
        submittedDate: new Date().toISOString().split('T')[0],
        submittedBy: 'Admin User'
      };

      setReviewHistory([newReview, ...reviewHistory]);
      
      // Reset form
      setPerformanceFormData({
        rating: '',
        feedback: '',
        strengths: '',
        improvements: ''
      });
      
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    }
  };

  if (!selectedEmployee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Icon name="AlertCircle" className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-black mb-2">Employee Not Found</h1>
        <p className="text-slate-600 mb-6">The employee you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/employee-hub')}
          className="px-6 py-3 text-white font-black rounded-xl transition-colors" style={{backgroundColor: '#c97a4c'}} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
        >
          Back to Employee Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/employee-hub')}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
        >
          <Icon name="ChevronLeft" className="w-5 h-5" />
          Back to Employee Hub
        </button>

        {/* Main Card */}
        <div className="bg-white rounded-[32px] shadow-xl overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('personal')}
              className={`flex-1 px-6 py-5 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'personal'
                  ? 'text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              style={{backgroundColor: activeTab === 'personal' ? '#c97a4c' : ''}}
            >
              <Icon name="User" className="w-5 h-5" />
              Personal Details
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex-1 px-6 py-5 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'performance'
                  ? 'text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
              style={{backgroundColor: activeTab === 'performance' ? '#c97a4c' : ''}}
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
                    src={selectedEmployee.avatar}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-slate-50 shadow-lg mb-4"
                    alt={selectedEmployee.fullName}
                  />
                  <h1 className="text-3xl font-black text-black line-clamp-2">{selectedEmployee.fullName}</h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                    {selectedEmployee.employeeId} • {selectedEmployee.designation}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <span className="px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border" style={{backgroundColor: '#f5ede3', color: '#8b5a3c', borderColor: '#c97a4c'}}>
                      {selectedEmployee.department}
                    </span>
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                      {selectedEmployee.status}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
                        selectedEmployee.employmentType === 'Full-time'
                          ? 'bg-[#f5ede3] text-[#8b5a3c] border-[2px]'
                          : selectedEmployee.employmentType === 'Part-time'
                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                      style={selectedEmployee.employmentType === 'Full-time' ? {borderColor: '#c97a4c'} : {}}
                    >
                      {selectedEmployee.employmentType}
                    </span>
                    {(selectedEmployee as any).role && (
                  <span className="px-4 py-2 text-white rounded-full text-xs font-black uppercase tracking-widest border" style={{backgroundColor: '#c97a4c', borderColor: '#c97a4c'}}>
                        {(selectedEmployee as any).role}
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
                    <p className="text-sm font-bold text-black break-all">{selectedEmployee.email}</p>
                  </div>
                  <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                    <p className="text-xs font-black text-black uppercase tracking-widest mb-2">Phone</p>
                    <p className="text-sm font-bold text-black">{selectedEmployee.phone || 'No direct line'}</p>
                  </div>
                </div>

                {/* Credentials Section */}
                <div className="p-6 rounded-[32px] text-white relative overflow-hidden group" style={{backgroundColor: '#c97a4c', boxShadow: '0 20px 25px -5px rgba(201, 122, 76, 0.2)'}}>
                  <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform">
                    <Icon name="ShieldCheck" className="w-32 h-32" />
                  </div>
                  <h3 className="text-xs font-black uppercase tracking-widest mb-4 opacity-70 pr-8">Employee Access Credentials</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold uppercase opacity-50 mb-1">Username / Email</p>
                        <p className="text-sm font-black break-all">{selectedEmployee.email}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(selectedEmployee.email, 'email')}
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
                    <p className="text-xs font-black text-black uppercase tracking-widest mb-2">Leave Balance</p>
                    <p className="text-3xl font-black text-black">
                      {selectedEmployee.leaveBalance} <span className="text-sm font-bold">days</span>
                    </p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                    <p className="text-xs font-black text-black uppercase tracking-widest mb-2">Onboard Date</p>
                    <p className="text-lg font-bold text-black">{selectedEmployee.dateOfJoining || 'Not available'}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-8 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const nextStatus = selectedEmployee.status === 'active' ? 'inactive' : 'active';
                      updateEmployee(selectedEmployee.id, { status: nextStatus as any });
                    }}
                    className="py-4 px-4 bg-white border-2 border-slate-100 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    {selectedEmployee.status === 'active' ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="py-4 px-4 bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all">
                    Terminate Employee
                  </button>
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
                    Performance Metrics & Review
                  </h2>
                  <p className="text-slate-600 text-sm">Monitor employee performance across leaves, attendance, and task completion</p>
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
                          className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                            performanceViewPeriod === period
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
                                    <Cell key={`cell-${index}`} fill={[ '#ef4444', '#10b981' ][index]} />
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
                    <div className="bg-white rounded-3xl shadow-md border border-blue-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-200">
                        <h3 className="text-lg font-black text-black flex items-center gap-3">
                          <div className="p-2 bg-blue-100 rounded-xl">
                            <Icon name="CheckCircle" className="w-6 h-6 text-blue-600" />
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
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 text-center">
                              <p className="text-2xl font-black text-blue-600">{attendanceData.presentDays}</p>
                              <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mt-2">Present</p>
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

                    <form onSubmit={handleReviewSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md sticky top-6">
                      <div>
                        <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Period Type</label>
                        <div className="flex gap-2 bg-slate-100 p-2 rounded-xl">
                          {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() => setPerformanceFormPeriod(period)}
                              className={`flex-1 px-3 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                                performanceFormPeriod === period
                                  ? 'text-white rounded-lg'
                                  : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                              }`}
                              style={performanceFormPeriod === period ? {backgroundColor: '#c97a4c', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} : undefined}
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
                        <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Rating</label>
                        <select
                          value={performanceFormData.rating}
                          onChange={(e) => setPerformanceFormData({ ...performanceFormData, rating: e.target.value })}
                          className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        >
                          <option value="">Select a rating</option>
                          <option value="one">One</option>
                          <option value="two">Two</option>
                          <option value="three">Three</option>
                          <option value="four">Four</option>
                          <option value="five">Five</option>
                        </select>
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

                    {/* Review History Section */}
                    <div className="mt-8">
                      <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-2xl">
                          <Icon name="History" className="w-6 h-6 text-purple-600" />
                        </div>
                        Review History
                      </h3>
                      <div className="relative flex-1 mb-4">
                        <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search reviews by employee name..."
                          value={searchReview}
                          onChange={(e) => setSearchReview(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>

                      {/* Period Filter Buttons */}
                      <div className="flex gap-2 mb-4 flex-wrap">
                        <button
                          onClick={() => setReviewHistoryPeriodFilter('all')}
                          className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                            reviewHistoryPeriodFilter === 'all'
                              ? 'bg-indigo-600 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          All Reviews
                        </button>
                        <button
                          onClick={() => setReviewHistoryPeriodFilter('monthly')}
                          className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                            reviewHistoryPeriodFilter === 'monthly'
                              ? 'text-white rounded-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                          style={reviewHistoryPeriodFilter === 'monthly' ? {backgroundColor: '#c97a4c', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'} : undefined}
                        >
                          Monthly
                        </button>
                        <button
                          onClick={() => setReviewHistoryPeriodFilter('quarterly')}
                          className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                            reviewHistoryPeriodFilter === 'quarterly'
                              ? 'bg-purple-600 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Quarterly
                        </button>
                        <button
                          onClick={() => setReviewHistoryPeriodFilter('yearly')}
                          className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                            reviewHistoryPeriodFilter === 'yearly'
                              ? 'bg-orange-600 text-white shadow-lg'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                          }`}
                        >
                          Yearly
                        </button>
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {reviewHistory
                          .filter(review => {
                            const matchesSearch = review.employeeName.toLowerCase().includes(searchReview.toLowerCase()) ||
                              review.employeeId.toLowerCase().includes(searchReview.toLowerCase());
                            const matchesPeriod = reviewHistoryPeriodFilter === 'all' || review.period === reviewHistoryPeriodFilter;
                            return matchesSearch && matchesPeriod;
                          })
                          .map((review) => (
                            <div
                              key={review.id}
                              onClick={() => {
                                setSelectedReview(review);
                                setShowReviewModal(true);
                              }}
                              className="bg-gradient-to-r from-slate-50 to-slate-100 p-4 rounded-2xl border border-slate-200 hover:shadow-lg hover:border-indigo-300 cursor-pointer transition-all"
                            >
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="font-black text-black text-sm truncate">{review.employeeName}</p>
                                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{review.employeeId} • {review.periodLabel}</p>
                                  <p className="text-xs text-slate-600 mt-2 line-clamp-2">{review.feedback}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <div className={`px-3 py-2 rounded-xl text-center`}>
                                    <p className={`text-lg font-black ${
                                      review.rating >= 4.5 ? 'text-emerald-600' :
                                      review.rating >= 3.5 ? 'text-blue-600' :
                                      'text-amber-600'
                                    }`}>{review.rating}</p>
                                    <p className="text-[10px] text-slate-500 font-bold">Rating</p>
                                  </div>
                                  <div className={`px-2 py-1 rounded-lg ${
                                    review.period === 'monthly' ? 'bg-blue-100 text-blue-700' :
                                    review.period === 'quarterly' ? 'bg-purple-100 text-purple-700' :
                                    'bg-orange-100 text-orange-700'
                                  } text-[10px] font-black uppercase tracking-widest`}>
                                    {review.period === 'monthly' ? 'Monthly' : review.period === 'quarterly' ? 'Quarterly' : 'Yearly'}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        {reviewHistory.filter(review => {
                          const matchesSearch = review.employeeName.toLowerCase().includes(searchReview.toLowerCase()) ||
                            review.employeeId.toLowerCase().includes(searchReview.toLowerCase());
                          const matchesPeriod = reviewHistoryPeriodFilter === 'all' || review.period === reviewHistoryPeriodFilter;
                          return matchesSearch && matchesPeriod;
                        }).length === 0 && (
                          <div className="text-center py-8">
                            <Icon name="FileQuestion" className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No reviews found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Details Modal */}
                {showReviewModal && selectedReview && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                    <div className="relative max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center justify-between sticky top-0 z-10">
                        <div>
                          <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <Icon name="FileText" className="w-6 h-6" />
                            Review Details
                          </h2>
                          <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mt-1">{selectedReview.periodLabel}</p>
                        </div>
                        <button
                          onClick={() => setShowReviewModal(false)}
                          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                          <Icon name="X" className="w-6 h-6 text-white" />
                        </button>
                      </div>
                      <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
                        {/* Employee Info */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Employee Name</p>
                            <p className="text-base font-black text-black">{selectedReview.employeeName}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Employee ID</p>
                            <p className="text-base font-black text-black">{selectedReview.employeeId}</p>
                          </div>
                        </div>

                        {/* Rating and Period */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className={`p-4 rounded-2xl ${
                            selectedReview.rating >= 4.5 ? 'bg-emerald-50 border border-emerald-200' :
                            selectedReview.rating >= 3.5 ? 'bg-blue-50 border border-blue-200' :
                            'bg-amber-50 border border-amber-200'
                          }`}>
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Rating</p>
                            <p className={`text-3xl font-black ${
                              selectedReview.rating >= 4.5 ? 'text-emerald-600' :
                              selectedReview.rating >= 3.5 ? 'text-blue-600' :
                              'text-amber-600'
                            }`}>{selectedReview.rating}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Period</p>
                            <p className="text-base font-black text-black">{selectedReview.periodLabel}</p>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Submitted</p>
                            <p className="text-sm font-bold text-black">{selectedReview.submittedDate}</p>
                          </div>
                        </div>

                        {/* Feedback */}
                        <div>
                          <label className="text-xs font-black text-slate-700 uppercase tracking-widest mb-2 block">Feedback</label>
                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <p className="text-sm text-black leading-relaxed">{selectedReview.feedback}</p>
                          </div>
                        </div>

                        {/* Strengths */}
                        {selectedReview.strengths && (
                          <div>
                            <label className="text-xs font-black text-emerald-700 uppercase tracking-widest mb-2 block">Strengths</label>
                            <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                              <p className="text-sm text-emerald-900 leading-relaxed">{selectedReview.strengths}</p>
                            </div>
                          </div>
                        )}

                        {/* Improvements */}
                        {selectedReview.improvements && (
                          <div>
                            <label className="text-xs font-black text-amber-700 uppercase tracking-widest mb-2 block">Areas for Improvement</label>
                            <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
                              <p className="text-sm text-amber-900 leading-relaxed">{selectedReview.improvements}</p>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="border-t border-slate-200 pt-4">
                          <p className="text-xs text-slate-500 text-center font-medium">Submitted by: {selectedReview.submittedBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
