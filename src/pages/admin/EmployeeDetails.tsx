import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const Icon = ({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} onClick={onClick} /> : null;
};

// Performance data generator
const generatePerformanceData = (employeeId: string) => {
  return {
    monthly: [
      { month: 'Jan 2024', workingDays: 22, leavesTaken: 2, presentDays: 18, absentDays: 2, tasksAssigned: 20, tasksCompleted: 15, tasksPending: 5 },
      { month: 'Feb 2024', workingDays: 20, leavesTaken: 1, presentDays: 17, absentDays: 2, tasksAssigned: 22, tasksCompleted: 18, tasksPending: 4 },
      { month: 'Mar 2024', workingDays: 22, leavesTaken: 0, presentDays: 20, absentDays: 2, tasksAssigned: 25, tasksCompleted: 22, tasksPending: 3 }
    ],
    quarterly: [
      { quarter: 'Q4 2023', workingDays: 63, leavesTaken: 3, presentDays: 56, absentDays: 4, tasksAssigned: 65, tasksCompleted: 55, tasksPending: 10 },
      { quarter: 'Q1 2024', workingDays: 64, leavesTaken: 3, presentDays: 55, absentDays: 6, tasksAssigned: 67, tasksCompleted: 60, tasksPending: 7 }
    ],
    yearly: [
      { year: '2023', workingDays: 252, leavesTaken: 12, presentDays: 225, absentDays: 15, tasksAssigned: 250, tasksCompleted: 210, tasksPending: 40 },
      { year: '2024 (YTD)', workingDays: 64, leavesTaken: 3, presentDays: 55, absentDays: 6, tasksAssigned: 67, tasksCompleted: 60, tasksPending: 7 }
    ]
  };
};

const getPieChartData = (selectedPeriod: string, dataType: 'monthly' | 'quarterly' | 'yearly', allData: any) => {
  let dataPoint = null;

  if (dataType === 'monthly') {
    dataPoint = allData.monthly.find((d: any) => d.month === selectedPeriod);
  } else if (dataType === 'quarterly') {
    dataPoint = allData.quarterly.find((d: any) => d.quarter === selectedPeriod);
  } else {
    dataPoint = allData.yearly.find((d: any) => d.year === selectedPeriod);
  }

  if (!dataPoint) return { leaves: [], attendance: [], tasks: [] };

  return {
    leaves: [
      { name: 'Leaves Taken', value: dataPoint.leavesTaken, fill: '#ef4444' },
      { name: 'Working Days', value: dataPoint.workingDays - dataPoint.leavesTaken, fill: '#10b981' }
    ],
    attendance: [
      { name: 'Present', value: dataPoint.presentDays, fill: '#3b82f6' },
      { name: 'Absent', value: dataPoint.absentDays, fill: '#fbbf24' }
    ],
    tasks: [
      { name: 'Completed', value: dataPoint.tasksCompleted, fill: '#10b981' },
      { name: 'Pending', value: dataPoint.tasksPending, fill: '#ef4444' }
    ]
  };
};

const EmployeeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { employees, updateEmployee } = useHRMS();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [performanceViewPeriod, setPerformanceViewPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [performanceViewFilter, setPerformanceViewFilter] = useState('Mar 2024');
  const [performanceFormPeriod, setPerformanceFormPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
  const [performanceFormFilter, setPerformanceFormFilter] = useState('Mar 2024');
  const [performanceFormData, setPerformanceFormData] = useState({
    rating: '',
    feedback: '',
    strengths: '',
    improvements: ''
  });
  const [activeTab, setActiveTab] = useState<'personal' | 'performance'>('personal');

  // Find the employee
  const selectedEmployee = employees.find(emp => emp.id === id);

  // Get performance data
  const performanceData = useMemo(() => {
    return selectedEmployee ? generatePerformanceData(selectedEmployee.id) : { monthly: [], quarterly: [], yearly: [] };
  }, [selectedEmployee]);

  const pieChartData = useMemo(() => {
    return getPieChartData(performanceViewFilter, performanceViewPeriod, performanceData);
  }, [performanceViewFilter, performanceViewPeriod, performanceData]);

  const availablePeriods = useMemo(() => {
    if (performanceViewPeriod === 'monthly') return performanceData.monthly.map(d => d.month);
    if (performanceViewPeriod === 'quarterly') return performanceData.quarterly.map(d => d.quarter);
    return performanceData.yearly.map(d => d.year);
  }, [performanceViewPeriod, performanceData]);

  const availableFormPeriods = useMemo(() => {
    if (performanceFormPeriod === 'monthly') return performanceData.monthly.map(d => d.month);
    if (performanceFormPeriod === 'quarterly') return performanceData.quarterly.map(d => d.quarter);
    return performanceData.yearly.map(d => d.year);
  }, [performanceFormPeriod, performanceData]);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!selectedEmployee) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Icon name="AlertCircle" className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-black text-black mb-2">Employee Not Found</h1>
        <p className="text-slate-600 mb-6">The employee you're looking for doesn't exist.</p>
        <button
          onClick={() => navigate('/admin/employee-hub')}
          className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-700 transition-colors"
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
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon name="User" className="w-5 h-5" />
              Personal Details
            </button>
            <button
              onClick={() => setActiveTab('performance')}
              className={`flex-1 px-6 py-5 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                activeTab === 'performance'
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
                    src={selectedEmployee.avatar}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-3xl border-4 border-slate-50 shadow-lg mb-4"
                    alt={selectedEmployee.fullName}
                  />
                  <h1 className="text-3xl font-black text-black line-clamp-2">{selectedEmployee.fullName}</h1>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
                    {selectedEmployee.employeeId} • {selectedEmployee.designation}
                  </p>

                  {/* Badges */}
                  <div className="mt-6 flex flex-wrap gap-2 justify-center">
                    <span className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100">
                      {selectedEmployee.department}
                    </span>
                    <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
                      {selectedEmployee.status}
                    </span>
                    <span
                      className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border ${
                        selectedEmployee.employmentType === 'Full-time'
                          ? 'bg-blue-50 text-blue-600 border-blue-100'
                          : selectedEmployee.employmentType === 'Part-time'
                            ? 'bg-purple-50 text-purple-600 border-purple-100'
                            : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}
                    >
                      {selectedEmployee.employmentType}
                    </span>
                    {(selectedEmployee as any).role && (
                      <span className="px-4 py-2 bg-indigo-600 text-white rounded-full text-xs font-black uppercase tracking-widest border border-indigo-600">
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
                <div className="bg-indigo-600 p-6 rounded-[32px] text-white shadow-xl shadow-indigo-100 relative overflow-hidden group">
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
                          onClick={() => {
                            setPerformanceViewPeriod(period);
                            if (period === 'monthly') setPerformanceViewFilter(performanceData.monthly[0]?.month || '');
                            if (period === 'quarterly') setPerformanceViewFilter(performanceData.quarterly[0]?.quarter || '');
                            if (period === 'yearly') setPerformanceViewFilter(performanceData.yearly[0]?.year || '');
                          }}
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

                  <div className="flex-1 max-w-xs">
                    <label className="text-xs font-black text-black uppercase tracking-widest mb-1 block">Select Period</label>
                    <select
                      value={performanceViewFilter}
                      onChange={(e) => setPerformanceViewFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                    >
                      {availablePeriods.map((period) => (
                        <option key={period} value={period}>
                          {period}
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
                          let leaveData = null;
                          if (performanceViewPeriod === 'monthly') {
                            leaveData = performanceData.monthly.find(d => d.month === performanceViewFilter);
                          } else if (performanceViewPeriod === 'quarterly') {
                            leaveData = performanceData.quarterly.find(d => d.quarter === performanceViewFilter);
                          } else {
                            leaveData = performanceData.yearly.find(d => d.year === performanceViewFilter);
                          }
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
                              data={pieChartData.leaves}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {pieChartData.leaves.map((entry, index) => (
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
                          let attendanceData = null;
                          if (performanceViewPeriod === 'monthly') {
                            attendanceData = performanceData.monthly.find(d => d.month === performanceViewFilter);
                          } else if (performanceViewPeriod === 'quarterly') {
                            attendanceData = performanceData.quarterly.find(d => d.quarter === performanceViewFilter);
                          } else {
                            attendanceData = performanceData.yearly.find(d => d.year === performanceViewFilter);
                          }
                          const attendanceRate = attendanceData ? Math.round((attendanceData.presentDays / (attendanceData.presentDays + attendanceData.absentDays)) * 100) : 0;
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
                          let tasksData = null;
                          if (performanceViewPeriod === 'monthly') {
                            tasksData = performanceData.monthly.find(d => d.month === performanceViewFilter);
                          } else if (performanceViewPeriod === 'quarterly') {
                            tasksData = performanceData.quarterly.find(d => d.quarter === performanceViewFilter);
                          } else {
                            tasksData = performanceData.yearly.find(d => d.year === performanceViewFilter);
                          }
                          const completionRate = tasksData ? Math.round((tasksData.tasksCompleted / tasksData.tasksAssigned) * 100) : 0;
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
                              onClick={() => {
                                setPerformanceFormPeriod(period);
                                if (period === 'monthly') setPerformanceFormFilter(performanceData.monthly[0]?.month || '');
                                if (period === 'quarterly') setPerformanceFormFilter(performanceData.quarterly[0]?.quarter || '');
                                if (period === 'yearly') setPerformanceFormFilter(performanceData.yearly[0]?.year || '');
                              }}
                              className={`flex-1 px-3 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
                                performanceFormPeriod === period
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
                          {availableFormPeriods.map((period) => (
                            <option key={period} value={period}>
                              {period}
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

export default EmployeeDetails;
