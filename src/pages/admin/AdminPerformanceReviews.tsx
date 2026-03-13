import React, { useState, useEffect, useMemo } from 'react';
import { Star, Calendar, Loader, TrendingUp, BarChart3, Filter, Sparkles, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMyReviews } from '../../api/performance.ts';
import { getUserData } from '../../utils/storage.ts';

// Types
interface Review {
    id: number;
    employeeId: string;
    employeeName: string;
    feedback: string;
    strengths: string;
    areasOfImprovement: string;
    periodType: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
    rating: 'EXCELLENT' | 'GOOD' | 'AVERAGE' | 'NEEDS_IMPROVEMENT' | 'POOR';
    period: string;
    createdAt: string;
    reviewedBy: string;
}

// Helper functions
const getRatingNumber = (rating: string): number => {
    const ratingMap: Record<string, number> = {
        'EXCELLENT': 4.5,
        'GOOD': 4.0,
        'AVERAGE': 3.0,
        'NEEDS_IMPROVEMENT': 2.0,
        'POOR': 1.0,
    };
    return ratingMap[rating] || 3.0;
};

const getRatingColor = (rating: string): string => {
    const colorMap: Record<string, string> = {
        'EXCELLENT': '#10B981',
        'GOOD': '#3B82F6',
        'AVERAGE': '#F59E0B',
        'NEEDS_IMPROVEMENT': '#EF4444',
        'POOR': '#6B7280',
    };
    return colorMap[rating] || '#3B82F6';
};

const getPeriodTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
        'MONTHLY': 'Monthly',
        'QUARTERLY': 'Quarterly',
        'YEARLY': 'Yearly'
    };
    return typeMap[type] || type;
};

const getMonthName = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
        return dateString;
    }
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
                        <Star
                            size={size}
                            className="text-gray-300 absolute top-0 left-0"
                            fill="#e5e7eb"
                        />
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

// Main Component
const AdminPerformanceReviews: React.FC = () => {
    const [allReviews, setAllReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [selectedTimeRange, setSelectedTimeRange] = useState<string>('current');

    const currentInfo = useMemo(() => getCurrentDateInfo(), []);

    // Fetch reviews for current admin user
    useEffect(() => {
        setIsLoading(true);
        
        const fetchReviews = async () => {
            try {
                // Get current admin user
                const userData = getUserData();

                // Fetch reviews for authenticated user using /my endpoint
                const apiReviews = await getMyReviews();

                // Map API reviews to our Review interface
                const mappedReviews: Review[] = apiReviews.map((review: any) => ({
                    id: review.id,
                    employeeId: review.employeeId,
                    employeeName: userData?.name || 'You',
                    feedback: review.feedback,
                    strengths: review.strengths,
                    areasOfImprovement: review.areasOfImprovement || review.improvements,
                    periodType: review.periodType,
                    rating: review.rating,
                    period: review.period,
                    createdAt: review.createdAt,
                    reviewedBy: review.reviewedBy || 'Admin'
                }));

                // Sort by creation date (newest first)
                const sortedReviews = mappedReviews.sort((a: Review, b: Review) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );

                setAllReviews(sortedReviews);
            } catch (error) {
                console.error('Error loading reviews:', error);
                setAllReviews([]);
            } finally {
                setTimeout(() => setIsLoading(false), 300);
            }
        };

        fetchReviews();
    }, []);

    // Get current period value based on selected period
    const getCurrentPeriodValue = () => {
        if (selectedPeriod === 'monthly') return currentInfo.currentMonth;
        if (selectedPeriod === 'quarterly') return currentInfo.currentQuarter;
        return currentInfo.currentYear.toString();
    };

    // Get all available time ranges
    const getAllTimeRanges = useMemo(() => {
        const periods = [...new Set(allReviews.map(r => r.period))] as string[];
        return periods.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    }, [allReviews]);

    // Get filtered reviews
    const filteredReviews = useMemo(() => {
        let reviews = allReviews;

        // Filter by time range
        if (selectedTimeRange === 'current') {
            reviews = allReviews.filter(r => r.periodType === selectedPeriod.toUpperCase());
        } else {
            reviews = allReviews.filter(r => r.period === selectedTimeRange);
        }

        return reviews;
    }, [allReviews, selectedPeriod, selectedTimeRange]);

    // Get recent reviews
    const recentReviews = useMemo(() => {
        return allReviews.slice(0, 8);
    }, [allReviews]);

    // Get rating distribution data
    const getRatingDistributionData = useMemo(() => {
        if (filteredReviews.length === 0) {
            return [];
        }

        const ratingGroups: Record<string, { count: number; color: string; value: number }> = {};
        filteredReviews.forEach(review => {
            if (!ratingGroups[review.rating]) {
                ratingGroups[review.rating] = { count: 0, color: getRatingColor(review.rating), value: getRatingNumber(review.rating) };
            }
            ratingGroups[review.rating].count += 1;
        });

        const ratingOrder = ['EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_IMPROVEMENT', 'POOR'];
        return Object.entries(ratingGroups)
            .map(([rating, data]) => ({
                name: rating,
                value: data.count,
                rating: data.value,
                color: data.color
            }))
            .sort((a, b) => ratingOrder.indexOf(Object.keys(ratingGroups)[0]) - ratingOrder.indexOf(Object.keys(ratingGroups)[1]));
    }, [filteredReviews]);

    // Get trend chart data
    const getTrendChartData = useMemo(() => {
        if (allReviews.length === 0) {
            return [];
        }

        const periodGroups: Record<string, { ratings: number[]; period: string }> = {};
        allReviews.forEach(review => {
            if (!periodGroups[review.period]) {
                periodGroups[review.period] = { ratings: [], period: review.period };
            }
            periodGroups[review.period].ratings.push(getRatingNumber(review.rating));
        });

        return Object.values(periodGroups)
            .map(group => ({
                period: group.period,
                average: Math.round((group.ratings.reduce((a, b) => a + b, 0) / group.ratings.length) * 10) / 10,
                count: group.ratings.length
            }))
            .sort((a, b) => new Date(b.period).getTime() - new Date(a.period).getTime());
    }, [allReviews]);

    // Statistics
    const averageRating = useMemo(() => {
        if (filteredReviews.length === 0) {
            return 0;
        }
        const total = filteredReviews.reduce((sum, r) => sum + getRatingNumber(r.rating), 0);
        return Math.round((total / filteredReviews.length) * 10) / 10;
    }, [filteredReviews]);

    const overallAverageRating = useMemo(() => {
        if (allReviews.length === 0) return 0;
        const total = allReviews.reduce((sum, r) => sum + getRatingNumber(r.rating), 0);
        return Math.round((total / allReviews.length) * 10) / 10;
    }, [allReviews]);

    const getFilterDisplayText = () => {
        if (selectedTimeRange === 'current') {
            if (selectedPeriod === 'monthly') return currentInfo.currentMonth;
            if (selectedPeriod === 'quarterly') return currentInfo.currentQuarter;
            return currentInfo.currentYear.toString();
        }
        return selectedTimeRange;
    };

    const totalReviews = allReviews.length;
    const filteredReviewsCount = filteredReviews.length;

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
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Performance</h1>
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
                                <div className="text-xs text-gray-500">Select period and time range</div>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                    {/* Reviews Count Card */}
                    <div className="group backdrop-blur-xl bg-gradient-to-br from-white via-purple-50 to-white border border-white border-opacity-30 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className="p-3 bg-gradient-to-br from-purple-100 to-purple-50 rounded-xl group-hover:scale-110 transition-transform">
                                <Clock size={20} className="text-purple-600" />
                            </div>
                            <span className="text-xs font-semibold text-purple-600 bg-purple-100 px-2 py-1 rounded-full">Count</span>
                        </div>
                        <div className="mb-3">
                            <div className="text-4xl font-bold text-gray-900">{filteredReviewsCount}</div>
                            <div className="text-sm text-gray-600 mt-1">Reviews this period</div>
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-gray-500">Total: {totalReviews} reviews</p>
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
                                <h3 className="text-lg font-bold text-gray-900">Review Trend</h3>
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
                                                        <div className="text-sm text-blue-600">Average: {data.average}/5</div>
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
            <div className="relative z-10 mt-8 max-w-7xl mx-auto px-4 md:px-8 pb-12">
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
                            {recentReviews.map((review) => {
                                const ratingNum = getRatingNumber(review.rating);
                                const ratingColor = getRatingColor(review.rating);
                                return (
                                    <div key={review.id} className="group bg-gradient-to-br from-white via-gray-50 to-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-200 transition-all duration-300">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex-1">
                                                <h4 className="font-semibold text-gray-900 text-sm">{review.period}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{getPeriodTypeLabel(review.periodType)} Review</p>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-2xl font-bold" style={{ color: ratingColor }}>{ratingNum.toFixed(1)}</div>
                                                <div className="text-xs text-gray-500">/5</div>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <StarRating rating={ratingNum} size={14} />
                                        </div>

                                        <div className="mb-4 space-y-2">
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Feedback</p>
                                                <p className="text-sm text-gray-700 line-clamp-2">{review.feedback}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-semibold text-gray-600 uppercase mb-1">Strengths</p>
                                                <p className="text-sm text-emerald-700 line-clamp-1">{review.strengths}</p>
                                            </div>
                                        </div>

                                        <div className={`py-2 px-3 rounded-lg text-xs font-medium text-center mb-3`} style={{ backgroundColor: ratingColor + '20', color: ratingColor }}>
                                            {review.rating}
                                        </div>

                                        <div className="border-t border-gray-100 pt-3 text-xs text-gray-500 flex items-center justify-between">
                                            <span>{new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                            <span className="font-medium" style={{ color: ratingColor }}>{getPeriodTypeLabel(review.periodType)}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminPerformanceReviews;
