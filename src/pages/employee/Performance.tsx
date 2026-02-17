import React, { useState, useEffect, useMemo } from 'react';
import { User as UserIcon, Star, Calendar, Loader, Award, TrendingUp, Target, PieChart as PieChartIcon, BarChart3, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Sector } from 'recharts';

// Types
interface Review {
    id: string;
    employeeId: string;
    reviewer: string;
    reviewerRole: string;
    rating: number;
    comment: string;
    date: string;
    quarter: string;
    month: string;
    year: number;
    monthNum: number;
}

// Current logged-in employee
const currentEmployee = {
    id: 'emp-123',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    employeeId: 'EMP-789',
    department: 'Engineering',
    position: 'Senior Developer',
    hireDate: '2022-03-15'
};

// RAW DATA - Complete review data
const RAW_REVIEWS_DATA: Review[] = [
    {
        id: 'r-1',
        employeeId: 'emp-123',
        reviewer: 'Sarah Johnson',
        reviewerRole: 'Engineering Manager',
        rating: 4.5,
        comment: 'Excellent work on the project delivery. Rajesh consistently meets deadlines and produces high-quality code.',
        date: '2024-03-15',
        quarter: 'Q1 2024',
        month: 'March 2024',
        year: 2024,
        monthNum: 3
    },
    {
        id: 'r-2',
        employeeId: 'emp-123',
        reviewer: 'Michael Chen',
        reviewerRole: 'Product Lead',
        rating: 4.0,
        comment: 'Great teamwork and communication skills. Always willing to help team members.',
        date: '2024-02-20',
        quarter: 'Q1 2024',
        month: 'February 2024',
        year: 2024,
        monthNum: 2
    },
    {
        id: 'r-3',
        employeeId: 'emp-123',
        reviewer: 'Priya Sharma',
        reviewerRole: 'Senior Developer',
        rating: 4.8,
        comment: 'Strong technical skills demonstrated in the recent system architecture redesign.',
        date: '2024-01-10',
        quarter: 'Q1 2024',
        month: 'January 2024',
        year: 2024,
        monthNum: 1
    },
    {
        id: 'r-4',
        employeeId: 'emp-123',
        reviewer: 'Robert Williams',
        reviewerRole: 'Director',
        rating: 4.2,
        comment: 'Consistent performer with good initiative. Shows leadership potential.',
        date: '2023-12-05',
        quarter: 'Q4 2023',
        month: 'December 2023',
        year: 2023,
        monthNum: 12
    },
    {
        id: 'r-5',
        employeeId: 'emp-123',
        reviewer: 'David Lee',
        reviewerRole: 'Team Lead',
        rating: 3.8,
        comment: 'Good work but needs to improve documentation. Technical skills are solid.',
        date: '2023-11-15',
        quarter: 'Q4 2023',
        month: 'November 2023',
        year: 2023,
        monthNum: 11
    },
    {
        id: 'r-6',
        employeeId: 'emp-123',
        reviewer: 'Emma Wilson',
        reviewerRole: 'CTO',
        rating: 4.6,
        comment: 'Excellent problem-solving abilities. Handled the production issue exceptionally well.',
        date: '2023-10-22',
        quarter: 'Q4 2023',
        month: 'October 2023',
        year: 2023,
        monthNum: 10
    },
    {
        id: 'r-7',
        employeeId: 'emp-123',
        reviewer: 'Alex Martinez',
        reviewerRole: 'Engineering Manager',
        rating: 4.3,
        comment: 'Great leadership and mentoring skills. Helped onboard 2 new team members successfully.',
        date: '2023-09-30',
        quarter: 'Q3 2023',
        month: 'September 2023',
        year: 2023,
        monthNum: 9
    },
    {
        id: 'r-8',
        employeeId: 'emp-123',
        reviewer: 'Lisa Brown',
        reviewerRole: 'Product Manager',
        rating: 4.1,
        comment: 'Good collaboration with product team. Understands business requirements well.',
        date: '2023-08-15',
        quarter: 'Q3 2023',
        month: 'August 2023',
        year: 2023,
        monthNum: 8
    },
    {
        id: 'r-9',
        employeeId: 'emp-123',
        reviewer: 'James Wilson',
        reviewerRole: 'Senior Developer',
        rating: 4.7,
        comment: 'Outstanding performance in the recent hackathon. Innovative solution for data processing.',
        date: '2023-07-20',
        quarter: 'Q3 2023',
        month: 'July 2023',
        year: 2023,
        monthNum: 7
    },
    {
        id: 'r-10',
        employeeId: 'emp-123',
        reviewer: 'Maria Garcia',
        reviewerRole: 'Director of Engineering',
        rating: 4.4,
        comment: 'Consistently delivers high-quality work. Good team player and communicator.',
        date: '2023-06-10',
        quarter: 'Q2 2023',
        month: 'June 2023',
        year: 2023,
        monthNum: 6
    },
    {
        id: 'r-11',
        employeeId: 'emp-123',
        reviewer: 'Thomas Anderson',
        reviewerRole: 'Tech Lead',
        rating: 3.9,
        comment: 'Solid performance. Could improve on taking more ownership of projects.',
        date: '2023-05-18',
        quarter: 'Q2 2023',
        month: 'May 2023',
        year: 2023,
        monthNum: 5
    },
    {
        id: 'r-12',
        employeeId: 'emp-123',
        reviewer: 'Sophia Chen',
        reviewerRole: 'Engineering Manager',
        rating: 4.5,
        comment: 'Excellent work on the microservices migration project. Met all deadlines.',
        date: '2023-04-05',
        quarter: 'Q2 2023',
        month: 'April 2023',
        year: 2023,
        monthNum: 4
    }
];

// Static Data for Charts
const STATIC_CHART_DATA = {
    // Monthly trend data for 2024
    monthlyTrend2024: [
        { period: 'Jan 2024', average: 4.8, count: 1 },
        { period: 'Feb 2024', average: 4.0, count: 1 },
        { period: 'Mar 2024', average: 4.5, count: 1 }
    ],
    
    // Quarterly trend data
    quarterlyTrend: [
        { period: 'Q1 2024', average: 4.4, count: 3 },
        { period: 'Q4 2023', average: 4.2, count: 3 },
        { period: 'Q3 2023', average: 4.4, count: 3 },
        { period: 'Q2 2023', average: 4.3, count: 3 }
    ],
    
    // Yearly trend data
    yearlyTrend: [
        { period: '2024', average: 4.4, count: 3 },
        { period: '2023', average: 4.3, count: 9 }
    ],
    
    // Rating distribution data for different time periods
    ratingDistributionAll: [
        { name: '4.5 ★', value: 3, rating: 4.5, color: '#34D399' },
        { name: '4.0 ★', value: 3, rating: 4.0, color: '#3B82F6' },
        { name: '4.8 ★', value: 1, rating: 4.8, color: '#10B981' },
        { name: '4.2 ★', value: 1, rating: 4.2, color: '#60A5FA' },
        { name: '3.8 ★', value: 1, rating: 3.8, color: '#F59E0B' },
        { name: '4.6 ★', value: 1, rating: 4.6, color: '#10B981' },
        { name: '4.3 ★', value: 1, rating: 4.3, color: '#3B82F6' },
        { name: '4.1 ★', value: 1, rating: 4.1, color: '#60A5FA' }
    ],
    
    // Current month rating distribution
    ratingDistributionCurrentMonth: [
        { name: '4.5 ★', value: 1, rating: 4.5, color: '#34D399' }
    ],
    
    // Current quarter rating distribution
    ratingDistributionCurrentQuarter: [
        { name: '4.5 ★', value: 1, rating: 4.5, color: '#34D399' },
        { name: '4.0 ★', value: 1, rating: 4.0, color: '#3B82F6' },
        { name: '4.8 ★', value: 1, rating: 4.8, color: '#10B981' }
    ]
};

// Helper functions
const getMonthName = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { month: 'long' });
const getMonthNum = (dateString: string) => new Date(dateString).getMonth() + 1; // 1-12

const getQuarter = (dateString: string) => {
    const month = new Date(dateString).getMonth() + 1; // 1-12
    const year = new Date(dateString).getFullYear();
    if (month <= 3) return `Q1 ${year}`;
    if (month <= 6) return `Q2 ${year}`;
    if (month <= 9) return `Q3 ${year}`;
    return `Q4 ${year}`;
};

// Get current date info
const getCurrentDateInfo = () => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthNum = now.getMonth() + 1;
    const currentMonthName = getMonthName(now.toISOString());
    const currentMonth = `${currentMonthName} ${currentYear}`;

    let currentQuarter = '';
    if (currentMonthNum <= 3) currentQuarter = `Q1 ${currentYear}`;
    else if (currentMonthNum <= 6) currentQuarter = `Q2 ${currentYear}`;
    else if (currentMonthNum <= 9) currentQuarter = `Q3 ${currentYear}`;
    else currentQuarter = `Q4 ${currentYear}`;

    return {
        currentYear,
        currentMonthNum,
        currentMonth,
        currentQuarter,
        currentMonthName
    };
};

// Colors
const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];
const RATING_COLORS: Record<string, string> = {
    '5.0': '#10B981', '4.5': '#34D399', '4.0': '#3B82F6', '3.5': '#60A5FA',
    '3.0': '#F59E0B', '2.5': '#FBBF24', '2.0': '#EF4444', '1.5': '#F87171', '1.0': '#6B7280'
};

// Star Rating Component
const StarRating: React.FC<{ rating: number; size?: number; showNumber?: boolean }> = ({ rating, size = 16, showNumber = false }) => {
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => {
                const fillPercentage = Math.min(Math.max((rating - (star - 1)) * 100, 0), 100);
                return (
                    <div
                        key={star}
                        className="relative"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`
                        }}
                    >
                        {/* Background Star */}
                        <Star
                            size={size}
                            className="text-gray-300 absolute top-0 left-0"
                            fill="#e5e7eb"
                        />
                        {/* Foreground Star with Fill Percentage */}
                        <div
                            className="absolute top-0 left-0 overflow-hidden"
                            style={{
                                width: `${fillPercentage}%`,
                                height: `${size}px`
                            }}
                        >
                            <Star
                                size={size}
                                className="text-yellow-500 absolute top-0 left-0"
                                fill="#fbbf24"
                            />
                        </div>
                    </div>
                );
            })}
            {showNumber && <span className="text-yellow-600 font-semibold ml-2 text-sm">{rating.toFixed(1)}</span>}
        </div>
    );
};

// Custom Active Shape for Pie Chart
const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const { cx, cy, midAngle, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius + 10) * cos;
    const sy = cy + (outerRadius + 10) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 22;
    const ey = my;
    const textAnchor = cos >= 0 ? 'start' : 'end';

    return (
        <g>
            <Sector cx={cx} cy={cy} innerRadius={innerRadius} outerRadius={outerRadius + 10} startAngle={startAngle} endAngle={endAngle} fill={fill} />
            <Sector cx={cx} cy={cy} startAngle={startAngle} endAngle={endAngle} innerRadius={outerRadius + 12} outerRadius={outerRadius + 16} fill={fill} />
            <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
            <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333" className="font-medium">
                {payload.name}
            </text>
            <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey + 15} textAnchor={textAnchor} fill="#666" className="text-sm">
                {value} reviews ({(percent * 100).toFixed(1)}%)
            </text>
        </g>
    );
};

// Main Dashboard Component
const EmployeePerformanceDashboard: React.FC = () => {
    const [allReviews, setAllReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>('current');
    const [activeRatingPieIndex, setActiveRatingPieIndex] = useState<number>(0);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Get current date info
    const currentInfo = useMemo(() => getCurrentDateInfo(), []);

    // Initialize with raw reviews data
    useEffect(() => {
        setIsLoading(true);
        // Sort reviews by date (newest first)
        const sortedReviews = [...RAW_REVIEWS_DATA].sort((a, b) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setAllReviews(sortedReviews);
        setTimeout(() => setIsLoading(false), 300);
    }, []);

    // Get current period value based on selected period
    const getCurrentPeriodValue = () => {
        if (selectedPeriod === 'monthly') return currentInfo.currentMonth;
        if (selectedPeriod === 'quarterly') return currentInfo.currentQuarter;
        return currentInfo.currentYear.toString();
    };

    // Get all available time ranges (current + historical)
    const getAllTimeRanges = useMemo(() => {
        if (selectedPeriod === 'monthly') {
            const allMonths = [...new Set(allReviews.map(r => r.month))];
            return allMonths.sort((a: string, b: string) => {
                const dateA = new Date(a.split(' ')[1] + ' ' + a.split(' ')[0]);
                const dateB = new Date(b.split(' ')[1] + ' ' + b.split(' ')[0]);
                return dateB.getTime() - dateA.getTime();
            });
        } else if (selectedPeriod === 'quarterly') {
            const allQuarters = [...new Set(allReviews.map(r => r.quarter))] as string[];
            return allQuarters.sort((a: string, b: string) => {
                const yearA = parseInt(a.split(' ')[1]);
                const quarterA = parseInt(a.split(' ')[0].replace('Q', ''));
                const yearB = parseInt(b.split(' ')[1]);
                const quarterB = parseInt(b.split(' ')[0].replace('Q', ''));

                if (yearB !== yearA) return yearB - yearA;
                return quarterB - quarterA;
            });
        } else {
            const allYears = [...new Set(allReviews.map(r => r.year.toString()))] as string[];
            return allYears.sort((a, b) => parseInt(b) - parseInt(a));
        }
    }, [allReviews, selectedPeriod]);

    // Get reviews for selected period ONLY
    const filteredReviews = useMemo(() => {
        const selectedValue = selectedTimeRange === 'current'
            ? getCurrentPeriodValue()
            : selectedTimeRange;

        if (selectedPeriod === 'monthly') {
            return allReviews.filter(r => r.month === selectedValue);
        } else if (selectedPeriod === 'quarterly') {
            return allReviews.filter(r => r.quarter === selectedValue);
        } else {
            return allReviews.filter(r => r.year.toString() === selectedValue);
        }
    }, [allReviews, selectedPeriod, selectedTimeRange, currentInfo]);

    // Get recent reviews (all reviews, latest first)
    const recentReviews = useMemo(() => {
        return allReviews.slice(0, 8); // Show 8 most recent reviews
    }, [allReviews]);

    // Get static rating distribution data based on selection
    const getRatingDistributionData = useMemo(() => {
        const selectedValue = selectedTimeRange === 'current' 
            ? getCurrentPeriodValue() 
            : selectedTimeRange;
        
        if (selectedPeriod === 'monthly') {
            if (selectedValue === 'March 2024') {
                return STATIC_CHART_DATA.ratingDistributionCurrentMonth;
            }
        } else if (selectedPeriod === 'quarterly') {
            if (selectedValue === 'Q1 2024') {
                return STATIC_CHART_DATA.ratingDistributionCurrentQuarter;
            }
        }
        
        // Default to all reviews distribution
        return STATIC_CHART_DATA.ratingDistributionAll;
    }, [selectedPeriod, selectedTimeRange, currentInfo]);

    // Get static trend chart data based on selection
    const getTrendChartData = useMemo(() => {
        if (selectedPeriod === 'monthly') {
            return STATIC_CHART_DATA.monthlyTrend2024;
        } else if (selectedPeriod === 'quarterly') {
            return STATIC_CHART_DATA.quarterlyTrend;
        } else {
            return STATIC_CHART_DATA.yearlyTrend;
        }
    }, [selectedPeriod]);

    // Statistics
    const averageRating = useMemo(() => {
        if (filteredReviews.length === 0) {
            // Return default average based on selection
            if (selectedPeriod === 'monthly' && selectedTimeRange === 'current') return 4.5;
            if (selectedPeriod === 'quarterly' && selectedTimeRange === 'current') return 4.4;
            return 4.3;
        }
        const total = filteredReviews.reduce((sum, r) => sum + r.rating, 0);
        return Math.round((total / filteredReviews.length) * 10) / 10;
    }, [filteredReviews, selectedPeriod, selectedTimeRange]);

    const overallAverageRating = useMemo(() => {
        if (allReviews.length === 0) return 4.3;
        const total = allReviews.reduce((sum, r) => sum + r.rating, 0);
        return Math.round((total / allReviews.length) * 10) / 10;
    }, [allReviews]);

    const latestReview = useMemo(() => {
        return allReviews[0] || null;
    }, [allReviews]);

    // Get display text for filter
    const getFilterDisplayText = () => {
        if (selectedTimeRange === 'current') {
            if (selectedPeriod === 'monthly') return currentInfo.currentMonth;
            if (selectedPeriod === 'quarterly') return currentInfo.currentQuarter;
            return currentInfo.currentYear.toString();
        }
        return selectedTimeRange;
    };

    // Get total reviews in ALL periods
    const totalReviews = allReviews.length;

    // Get filtered reviews count
    const filteredReviewsCount = useMemo(() => {
        if (selectedTimeRange === 'current') {
            if (selectedPeriod === 'monthly') return 1; // March 2024
            if (selectedPeriod === 'quarterly') return 3; // Q1 2024
            return 3; // 2024
        }
        return filteredReviews.length;
    }, [filteredReviews, selectedPeriod, selectedTimeRange]);

    // Mobile filters toggle component
    const MobileFiltersToggle = () => (
        <div className="md:hidden w-full">
            <button
                type="button"
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl shadow-sm"
            >
                <div className="flex items-center gap-3">
                    <Filter size={20} className="text-blue-600" />
                    <span className="font-medium text-gray-900">Filter Options</span>
                    {selectedTimeRange !== 'current' || selectedPeriod !== 'monthly' ? (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                            Active
                        </span>
                    ) : null}
                </div>
                {showMobileFilters ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
            {/* Header */}
            <div className="mb-6 md:mb-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">Performance Dashboard</h1>
                        <p className="text-gray-600 mt-1 text-sm md:text-base">Your performance reviews and analytics</p>
                    </div>
                    <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200">
                        <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-50 rounded-lg">
                            <UserIcon size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <div className="text-xs md:text-sm text-gray-500">Signed in as</div>
                            <div className="font-semibold text-gray-900 text-sm md:text-base">{currentEmployee.firstName} {currentEmployee.lastName}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Container */}
            <div className="flex flex-col lg:flex-row gap-6">
                {/* Left Column - Stats and Charts */}
                <div className="lg:w-2/3 space-y-6">
                    {/* Filter Controls */}
                    <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
                        <MobileFiltersToggle />
                        
                        {/* Desktop Filters */}
                        <div className={`${showMobileFilters ? 'block' : 'hidden md:block'}`}>
                            <div className="mb-4">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Filter size={20} className="text-blue-600" />
                                    Filter Reviews by Period
                                </h2>
                                <p className="text-gray-600 text-sm mt-1">Select time period to view ratings</p>
                            </div>

                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Period Tabs */}
                                <div className="flex bg-gray-100 p-1 rounded-lg w-full md:w-auto">
                                    {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                                        <button
                                            key={period}
                                            onClick={() => {
                                                setSelectedPeriod(period);
                                                setSelectedTimeRange('current'); // Reset to current period
                                            }}
                                            className={`flex-1 md:flex-none px-3 md:px-4 py-2 text-sm rounded-md transition-all ${selectedPeriod === period
                                                ? 'bg-white text-blue-600 shadow-sm font-medium'
                                                : 'text-gray-600 hover:text-gray-900'
                                                }`}
                                        >
                                            {period.charAt(0).toUpperCase() + period.slice(1)}
                                        </button>
                                    ))}
                                </div>

                                {/* Time Range Selector */}
                                <div className="relative flex-1">
                                    <select
                                        aria-label="Select time range"
                                        value={selectedTimeRange}
                                        onChange={(e) => setSelectedTimeRange(e.target.value)}
                                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg text-sm bg-white appearance-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                    >
                                        <option value="current">
                                            Current {selectedPeriod === 'monthly' ? 'Month' : selectedPeriod === 'quarterly' ? 'Quarter' : 'Year'}
                                        </option>
                                        {getAllTimeRanges.map(range => (
                                            <option key={range} value={range}>
                                                {range}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 ">
                                        <Calendar size={16} className="text-black mb-2" />
                                    </div>
                                </div>
                            </div>

                            {/* Active Filter Info */}
                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="text-sm font-medium text-blue-700">Active Filter:</div>
                                        <div className="bg-white px-3 py-1 rounded-lg border border-blue-200 text-sm font-semibold text-blue-600">
                                            {getFilterDisplayText()}
                                        </div>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Showing <span className="font-semibold text-blue-600">{filteredReviewsCount}</span> of{' '}
                                        <span className="font-semibold">{totalReviews}</span> total reviews
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                        <div className="bg-gradient-to-br from-white to-blue-50 rounded-xl border border-blue-100 p-4 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs md:text-sm text-gray-500 mb-1">Period Rating</div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                                        {averageRating.toFixed(1)}
                                        <span className="text-sm md:text-lg text-gray-500">/5</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">For {getFilterDisplayText()}</div>
                                </div>
                                
                            </div>
                            <div className="mt-3 md:mt-4">
                                <StarRating rating={averageRating} size={16} />
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-xl border border-emerald-100 p-4 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs md:text-sm text-gray-500 mb-1">Overall Rating</div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                                        {overallAverageRating.toFixed(1)}
                                        <span className="text-sm md:text-lg text-gray-500">/5</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">All {totalReviews} reviews</div>
                                </div>
                                
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-green-50 rounded-xl border border-green-100 p-4 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs md:text-sm text-gray-500 mb-1">Latest Rating</div>
                                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-900">
                                        {latestReview ? `${latestReview.rating.toFixed(1)}` : '4.5'}
                                        <span className="text-sm md:text-lg text-gray-500">/5</span>
                                    </div>
                                </div>
                                
                            </div>
                            <div className="mt-3 md:mt-4">
                                <StarRating rating={latestReview?.rating || 4.5} size={14} />
                                <div className="text-xs md:text-sm text-gray-600 mt-1">
                                    {latestReview ? latestReview.month : 'March 2024'}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-white to-purple-50 rounded-xl border border-purple-100 p-4 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div>
                                    <div className="text-xs md:text-sm text-gray-500 mb-1">Position</div>
                                    <div className="text-sm md:text-lg font-bold text-gray-900 line-clamp-2">{currentEmployee.position}</div>
                                </div>
                                
                            </div>
                            <div className="mt-3 md:mt-4 text-xs md:text-sm text-gray-600 line-clamp-2">
                                {currentEmployee.department}
                            </div>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 md:gap-6">
                        {/* Rating Distribution Pie Chart */}
                        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 shadow-lg">
                            <div className="flex items-center justify-between mb-4 md:mb-6">
                                <div>
                                    <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                                            <PieChartIcon size={16} className="md:size-6 text-blue-600" />
                                        </div>
                                        Rating Distribution
                                    </h2>
                                    <p className="text-gray-600 text-xs md:text-sm mt-1">
                                        {getFilterDisplayText()} • {filteredReviewsCount} reviews
                                    </p>
                                </div>
                            </div>

                            <div className="h-60 md:h-80">
                                {getRatingDistributionData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                {...({ activeIndex: activeRatingPieIndex } as any)}
                                                {...({ activeShape: renderActiveShape } as any)}
                                                data={getRatingDistributionData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={40}
                                                outerRadius={70}
                                                paddingAngle={2}
                                                dataKey="value"
                                                onMouseEnter={(_, index) => setActiveRatingPieIndex(index)}
                                            >
                                                {getRatingDistributionData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => [`${value} reviews`, 'Count']}
                                                contentStyle={{
                                                    backgroundColor: 'white',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '0.5rem'
                                                }}
                                            />
                                            <Legend
                                                verticalAlign="bottom"
                                                height={36}
                                                formatter={(value) => (
                                                    <span className="text-xs md:text-sm text-gray-700">{value}</span>
                                                )}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <PieChartIcon size={48} className="text-gray-300 mb-3" />
                                        <p className="text-gray-500">No rating data available</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Performance Trend Chart */}
                        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-6 shadow-lg">
                            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-6">
                                <div>
                                    <h2 className="text-base md:text-lg lg:text-xl font-bold text-gray-900 flex items-center gap-2">
                                        <div className="p-2 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                                            <BarChart3 size={16} className="md:size-6 text-green-600" />
                                        </div>
                                        Performance Trend
                                    </h2>
                                    <p className="text-gray-600 text-xs md:text-sm mt-1">
                                        {selectedPeriod === 'monthly' ? 'Monthly view' :
                                            selectedPeriod === 'quarterly' ? 'Quarterly view' :
                                                'Yearly view'}
                                    </p>
                                </div>
                            </div>

                            <div className="h-60 md:h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={getTrendChartData}
                                        margin={{ top: 20, right: 20, left: 0, bottom: 60 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                        <XAxis
                                            dataKey="period"
                                            angle={-45}
                                            textAnchor="end"
                                            height={60}
                                            tick={{ fontSize: 10 }}
                                            stroke="#6b7280"
                                        />
                                        <YAxis
                                            domain={[0, 5]}
                                            tick={{ fontSize: 10 }}
                                            stroke="#6b7280"
                                            label={{
                                                value: 'Rating',
                                                angle: -90,
                                                position: 'insideLeft',
                                                offset: -10,
                                                style: { textAnchor: 'middle', fill: '#6b7280', fontSize: 12 }
                                            }}
                                        />
                                        <Tooltip
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className="bg-white p-3 border border-gray-200 rounded-xl shadow-lg">
                                                            <div className="font-semibold text-gray-900 text-sm">{data.period}</div>
                                                            <div className="space-y-1 text-xs mt-2">
                                                                <div className="flex items-center justify-between gap-4">
                                                                    <span className="text-gray-600">Average Rating:</span>
                                                                    <span className="font-medium text-blue-600">{data.average.toFixed(1)}/5</span>
                                                                </div>
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-gray-600">Reviews:</span>
                                                                    <span className="font-medium">{data.count}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            dataKey="average"
                                            name="Average Rating"
                                            radius={[4, 4, 0, 0]}
                                            fill="#3B82F6"
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Sticky Recent Reviews */}
                <div className="lg:w-1/3">
                    <div className="sticky top-6 h-[calc(100vh-150px)] flex flex-col">
                        <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col h-full">
                            {/* Recent Reviews Header */}
                            <div className="p-4 md:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Reviews</h2>
                                        <p className="text-gray-600 text-sm mt-1">
                                            All reviews • Latest first
                                        </p>
                                    </div>
                                    <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                        {recentReviews.length} reviews
                                    </div>
                                </div>
                            </div>

                            {/* Reviews List - Scrollable */}
                            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] p-4 md:p-6">
                                {isLoading ? (
                                    <div className="flex justify-center items-center py-12">
                                        <Loader size={28} className="animate-spin text-blue-500" />
                                    </div>
                                ) : recentReviews.length === 0 ? (
                                    <div className="text-center py-12">
                                        <Star size={40} className="mx-auto mb-4 text-gray-300" />
                                        <p className="text-gray-600">No reviews found</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {recentReviews.map(review => (
                                            <div key={review.id} className="group p-4 border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300 hover:border-blue-100">
                                                <div className="flex flex-col gap-3">
                                                    {/* Review Header */}
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                                    <UserIcon size={14} className="text-blue-600" />
                                                                </div>
                                                                <div>
                                                                    <h3 className="font-semibold text-gray-900 text-sm">{review.reviewer}</h3>
                                                                    <div className="text-xs text-blue-600">
                                                                        {review.reviewerRole}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-lg font-bold text-blue-600">
                                                                {review.rating.toFixed(1)}
                                                                <span className="text-xs text-gray-500">/5</span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Rating */}
                                                    <div className="flex items-center justify-between">
                                                        <StarRating rating={review.rating} size={14} />
                                                        <div className={`px-2 py-1 text-xs font-medium rounded-full ${review.rating >= 4.5 ? 'bg-emerald-100 text-emerald-700' :
                                                            review.rating >= 4.0 ? 'bg-blue-100 text-blue-700' :
                                                                review.rating >= 3.5 ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-gray-100 text-gray-700'
                                                            }`}>
                                                            {review.rating >= 4.5 ? 'Excellent' :
                                                                review.rating >= 4.0 ? 'Good' :
                                                                    review.rating >= 3.5 ? 'Average' : 'Needs Improvement'}
                                                        </div>
                                                    </div>

                                                    {/* Comment */}
                                                    <p className="text-gray-700 text-sm line-clamp-2 mt-2">
                                                        {review.comment}
                                                    </p>

                                                    {/* Footer */}
                                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
                                                        <div className="flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {new Date(review.date).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-blue-600 font-medium">
                                                                {review.quarter}
                                                            </span>
                                                            <span className="text-gray-400">•</span>
                                                            <span className="text-gray-600">
                                                                {review.month}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <div className="text-center">
                                    <div className="text-sm text-gray-600 mb-1">
                                        Showing {recentReviews.length} of {totalReviews} reviews
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                                        <div className="flex items-center gap-1">
                                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                            <span>Overall: {overallAverageRating.toFixed(1)}/5</span>
                                        </div>
                                        <span className="text-gray-300">•</span>
                                        <span>{totalReviews} total reviews</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmployeePerformanceDashboard;