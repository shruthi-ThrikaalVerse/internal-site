import React, { useState, useEffect, useMemo } from 'react';
import { User as UserIcon, Star, Calendar, Loader, TrendingUp, BarChart3, Filter, ChevronDown, ChevronUp, Sparkles, Zap, ArrowUpRight, ArrowDownRight, Clock } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line, ComposedChart } from 'recharts';

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
                    // eslint-disable-next-line
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

// Gradient Background Component
const GradientBg = () => (
    <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
);

// Main Dashboard Component
const EmployeePerformanceDashboard: React.FC = () => {
    const [allReviews, setAllReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>('current');
    const [activeRatingPieIndex, setActiveRatingPieIndex] = useState<number>(0);

    // TODO: Replace with actual API call to fetch employee data
    const [currentEmployee, setCurrentEmployee] = useState({
        id: '',
        firstName: '',
        lastName: '',
        employeeId: '',
        department: '',
        position: '',
        hireDate: ''
    });

    // Get current date info
    const currentInfo = useMemo(() => getCurrentDateInfo(), []);

    // TODO: Replace with actual API call to fetch reviews
    useEffect(() => {
        setIsLoading(true);
        // Fetch reviews from API
        // const reviews = await api.performance.getReviews();
        const sortedReviews: Review[] = [];
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

    // Get rating distribution data dynamically based on filtered reviews
    const getRatingDistributionData = useMemo(() => {
        if (filteredReviews.length === 0) {
            return [];
        }

        // Group reviews by rating
        const ratingGroups: Record<number, { count: number; color: string }> = {};
        filteredReviews.forEach(review => {
            const roundedRating = Math.round(review.rating * 2) / 2; // Round to nearest 0.5
            if (!ratingGroups[roundedRating]) {
                ratingGroups[roundedRating] = { count: 0, color: RATING_COLORS[roundedRating.toFixed(1)] || '#3B82F6' };
            }
            ratingGroups[roundedRating].count += 1;
        });

        // Convert to array and sort by rating descending
        return Object.entries(ratingGroups)
            .map(([rating, data]) => ({
                name: `${rating} ★`,
                value: data.count,
                rating: parseFloat(rating),
                color: data.color
            }))
            .sort((a, b) => b.rating - a.rating);
    }, [filteredReviews]);

    // Get trend chart data dynamically based on selected period
    const getTrendChartData = useMemo(() => {
        if (allReviews.length === 0) {
            return [];
        }

        if (selectedPeriod === 'monthly') {
            // Group by month and calculate averages
            const monthGroups: Record<string, { ratings: number[]; period: string }> = {};
            allReviews.forEach(review => {
                if (!monthGroups[review.month]) {
                    monthGroups[review.month] = { ratings: [], period: review.month };
                }
                monthGroups[review.month].ratings.push(review.rating);
            });

            return Object.values(monthGroups)
                .map(group => ({
                    period: group.period,
                    average: Math.round((group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length) * 10) / 10,
                    count: group.ratings.length
                }))
                .sort((a, b) => new Date(a.period).getTime() - new Date(b.period).getTime());
        } else if (selectedPeriod === 'quarterly') {
            // Group by quarter and calculate averages
            const quarterGroups: Record<string, { ratings: number[]; period: string }> = {};
            allReviews.forEach(review => {
                if (!quarterGroups[review.quarter]) {
                    quarterGroups[review.quarter] = { ratings: [], period: review.quarter };
                }
                quarterGroups[review.quarter].ratings.push(review.rating);
            });

            return Object.values(quarterGroups)
                .map(group => ({
                    period: group.period,
                    average: Math.round((group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length) * 10) / 10,
                    count: group.ratings.length
                }))
                .sort((a, b) => {
                    const yearA = parseInt(a.period.split(' ')[1]);
                    const quarterA = parseInt(a.period.split(' ')[0].replace('Q', ''));
                    const yearB = parseInt(b.period.split(' ')[1]);
                    const quarterB = parseInt(b.period.split(' ')[0].replace('Q', ''));
                    if (yearA !== yearB) return yearA - yearB;
                    return quarterA - quarterB;
                });
        } else {
            // Group by year and calculate averages
            const yearGroups: Record<string, { ratings: number[]; period: string }> = {};
            allReviews.forEach(review => {
                const year = review.year.toString();
                if (!yearGroups[year]) {
                    yearGroups[year] = { ratings: [], period: year };
                }
                yearGroups[year].ratings.push(review.rating);
            });

            return Object.values(yearGroups)
                .map(group => ({
                    period: group.period,
                    average: Math.round((group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length) * 10) / 10,
                    count: group.ratings.length
                }))
                .sort((a, b) => parseInt(a.period) - parseInt(b.period));
        }
    }, [allReviews, selectedPeriod]);

    // Statistics
    const averageRating = useMemo(() => {
        if (filteredReviews.length === 0) {
            return 0;
        }
        const total = filteredReviews.reduce((sum, r) => sum + r.rating, 0);
        return Math.round((total / filteredReviews.length) * 10) / 10;
    }, [filteredReviews, selectedPeriod, selectedTimeRange]);

    const overallAverageRating = useMemo(() => {
        if (allReviews.length === 0) return 0;
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
        return filteredReviews.length;
    }, [filteredReviews]);

    return (
        <div className="min-h-screen bg-slate-50">
            <GradientBg />

            {/* Hero Header */}
            <div className="relative z-10 pt-8 md:pt-12 px-4 md:px-8 pb-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                                    <Sparkles size={24} className="text-white" />
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Performance Hub</h1>
                            </div>
                            <p className="text-gray-600 text-lg md:text-xl">Track your growth and achievements</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-12">
                {/* Control Bar */}
                <div className="mb-8 backdrop-blur-xl bg-white bg-opacity-70 border border-white border-opacity-30 rounded-2xl p-5 md:p-6 shadow-lg">
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <Filter size={20} className="text-blue-600" />
                            <div>
                                <div className="text-sm font-semibold text-gray-900">Filter Reviews</div>
                                <div className="text-xs text-gray-500">Select period to view analytics</div>
                            </div>
                        </div>
                        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
                            <div className="flex bg-gray-100 p-1 rounded-lg">
                                {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                                    <button
                                        key={period}
                                        onClick={() => {
                                            setSelectedPeriod(period);
                                            setSelectedTimeRange('current');
                                        }}
                                        className={`px-3 md:px-4 py-2 text-xs md:text-sm font-medium rounded-md transition-all ${selectedPeriod === period
                                            ? 'bg-white text-blue-600 shadow-md'
                                            : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                    >
                                        {period.charAt(0).toUpperCase() + period.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <select
                                aria-label="Select time range"
                                value={selectedTimeRange}
                                onChange={(e) => setSelectedTimeRange(e.target.value)}
                                className="px-4 py-2 border border-gray-200 rounded-lg text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="current">Current {selectedPeriod === 'yearly' ? 'Year' : selectedPeriod === 'quarterly' ? 'Quarter' : 'Month'}</option>
                                {getAllTimeRanges.map(range => (
                                    <option key={range} value={range}>{range}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Period Rating Card */}
                    <div className="group backdrop-blur-xl bg-gradient-to-br from-white via-blue-50 to-white border border-white border-opacity-30 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl group-hover:scale-110 transition-transform">
                                <Zap size={20} className="text-blue-600" />
                            </div>
                            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">Period</span>
                        </div>
                        <div className="mb-3">
                            <div className="text-4xl font-bold text-gray-900">{averageRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600 mt-1">{getFilterDisplayText()}</div>
                        </div>
                        <div className="mt-4">
                            <StarRating rating={averageRating} size={16} />
                        </div>
                    </div>

                    {/* Overall Rating Card */}
                    <div className="group backdrop-blur-xl bg-gradient-to-br from-white via-emerald-50 to-white border border-white border-opacity-30 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-xl group-hover:scale-110 transition-transform">
                                <Star size={20} className="text-emerald-600" />
                            </div>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">Overall</span>
                        </div>
                        <div className="mb-3">
                            <div className="text-4xl font-bold text-gray-900">{overallAverageRating.toFixed(1)}</div>
                            <div className="text-sm text-gray-600 mt-1">All {totalReviews} reviews</div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-emerald-400"></div>
                                ))}
                            </div>
                            <span className="text-xs text-emerald-600 font-medium">Excellent</span>
                        </div>
                    </div>

                    {/* Latest Review Card */}
                    <div className="group backdrop-blur-xl bg-gradient-to-br from-white via-purple-50 to-white border border-white border-opacity-30 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                                <Clock size={20} className="text-purple-600" />
                            </div>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Latest</span>
                        </div>
                        <div className="mb-3">
                            <div className="text-4xl font-bold text-gray-900">{latestReview ? `${latestReview.rating.toFixed(1)}` : '-'}</div>
                            <div className="text-sm text-gray-600 mt-1">{latestReview ? latestReview.month : 'N/A'}</div>
                        </div>
                        {latestReview && (
                            <div className="mt-4">
                                <StarRating rating={latestReview.rating} size={14} />
                            </div>
                        )}
                    </div>

                    {/* Position Card */}
                    <div className="group backdrop-blur-xl bg-gradient-to-br from-white via-pink-50 to-white border border-white border-opacity-30 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-pink-100 to-pink-50 rounded-xl group-hover:scale-110 transition-transform">
                                <TrendingUp size={20} className="text-pink-600" />
                            </div>
                            <span className="text-xs font-semibold text-pink-600 bg-pink-100 px-2 py-1 rounded-full">Role</span>
                        </div>
                        <div className="mb-2">
                            <div className="text-lg font-bold text-gray-900 line-clamp-1">{currentEmployee.position || 'N/A'}</div>
                            <div className="text-sm text-gray-600 mt-1 line-clamp-1">{currentEmployee.department || 'N/A'}</div>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs text-pink-600">
                            <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                            Active
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                    {/* Rating Distribution */}
                    <div className="backdrop-blur-xl bg-white bg-opacity-70 border border-white border-opacity-30 rounded-2xl p-6 shadow-lg overflow-hidden">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg">
                                    <BarChart3 size={20} className="text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Rating Distribution</h3>
                            </div>
                            <p className="text-sm text-gray-600">{getFilterDisplayText()} • {filteredReviewsCount} reviews</p>
                        </div>
                        <div className="h-72">
                            {getRatingDistributionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={getRatingDistributionData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={50}
                                            outerRadius={90}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {getRatingDistributionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: 'white',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.75rem',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="flex items-center justify-center h-full text-gray-400">
                                    <p>No data available</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Trend Chart */}
                    <div className="backdrop-blur-xl bg-white bg-opacity-70 border border-white border-opacity-30 rounded-2xl p-6 shadow-lg overflow-hidden">
                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-lg">
                                    <TrendingUp size={20} className="text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Performance Trend</h3>
                            </div>
                            <p className="text-sm text-gray-600">Ratings over time</p>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={getTrendChartData} margin={{ top: 20, right: 20, left: 0, bottom: 50 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                                    <XAxis
                                        dataKey="period"
                                        angle={-45}
                                        textAnchor="end"
                                        height={60}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        stroke="#e5e7eb"
                                    />
                                    <YAxis
                                        domain={[0, 5]}
                                        tick={{ fontSize: 12, fill: '#6b7280' }}
                                        stroke="#e5e7eb"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'white',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.75rem',
                                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                        }}
                                        content={({ active, payload }) => {
                                            if (active && payload?.[0]) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="p-3 space-y-1">
                                                        <div className="font-semibold text-gray-900">{data.period}</div>
                                                        <div className="text-sm text-blue-600">Rating: {data.average}/5</div>
                                                        <div className="text-sm text-gray-600">Reviews: {data.count}</div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="average" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Reviews */}
            <div className="mt-8">
                <div className="backdrop-blur-xl bg-white bg-opacity-70 border border-white border-opacity-30 rounded-2xl p-6 shadow-lg overflow-hidden">
                    <div className="mb-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg">
                                    <Star size={20} className="text-yellow-600" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Latest Reviews</h3>
                                    <p className="text-sm text-gray-600">Your most recent performance feedback</p>
                                </div>
                            </div>
                            <div className="text-sm font-semibold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                                {recentReviews.length}
                            </div>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader size={32} className="animate-spin text-blue-500" />
                        </div>
                    ) : recentReviews.length === 0 ? (
                        <div className="text-center py-16">
                            <Star size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="text-gray-600">No reviews yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {recentReviews.map((review) => (
                                <div key={review.id} className="group bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <UserIcon size={18} className="text-white" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm truncate">{review.reviewer}</h4>
                                                <p className="text-xs text-blue-600 truncate">{review.reviewerRole}</p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-2xl font-bold text-blue-600">{review.rating.toFixed(1)}</div>
                                            <div className="text-xs text-gray-500">/5</div>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <StarRating rating={review.rating} size={14} />
                                    </div>

                                    <p className="text-sm text-gray-700 mb-4 line-clamp-2 h-10">
                                        "{review.comment}"
                                    </p>

                                    <div className={`py-2 px-3 rounded-lg text-xs font-medium text-center ${review.rating >= 4.5 ? 'bg-emerald-100 text-emerald-700' :
                                        review.rating >= 4.0 ? 'bg-blue-100 text-blue-700' :
                                            review.rating >= 3.5 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-700'
                                        }`}>
                                        {review.rating >= 4.5 ? '⭐ Excellent' :
                                            review.rating >= 4.0 ? '✓ Good' :
                                                review.rating >= 3.5 ? '~ Average' : '↗ Needs Work'}
                                    </div>

                                    <div className="border-t border-gray-100 mt-4 pt-3 text-xs text-gray-500 flex items-center justify-between">
                                        <span>{new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                        <span className="text-blue-600 font-medium">{review.quarter}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EmployeePerformanceDashboard;