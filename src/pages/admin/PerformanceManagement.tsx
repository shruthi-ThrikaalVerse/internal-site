import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, TrendingUp, Calendar, AlertTriangle, Search,
  Star, Trophy, Award, Clock, Target, BarChart3,
  PieChart, Download, Filter, MoreVertical, ChevronRight,
  CheckCircle, XCircle, Clock as ClockIcon, UserCheck,
  TrendingDown, Eye, MessageSquare, Bell, Settings,
  ChevronLeft, ChevronRight as ChevronRightIcon, User, Briefcase,
  X, Activity, Zap, Target as TargetIcon, Award as AwardIcon,
  MessageCircle, FileText, TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon, MinusCircle,
  CheckSquare, BarChart2, FolderCheck, Users as UsersIcon
} from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { Task } from '../../types.ts';
import { getTasks as getTasksFromAPI } from '../../api/tasks.ts';
import { getTeams as getTeamsFromAPI } from '../../api/teams.ts';
import { getAllEmployees as getEmployeesFromAPI } from '../../api/users.ts';
interface PerformanceData {
  id: string;
  name: string;
  role: string;
  department: string;
  performanceScore: number;
  kpiScore: number;
  taskCompletion: number;
  qualityScore: number;
  attendance: number;
  lastReview: string;
  status: 'exceeding' | 'meeting' | 'below' | 'needs-improvement';
  trend: 'up' | 'down' | 'stable';
  email: string;
  joinDate: string;
  manager: string;
  projects: number;
  achievements: string[];
  feedback: Array<{ date: string; comment: string; reviewer: string }>;
  goals: Array<{ title: string; progress: number; deadline: string }>;
}

interface DepartmentStats {
  name: string;
  employees: number;
  avgKPIScore: number;
  tasksCompleted: number;
  totalTasks: number;
  attendance: number;
  overallRating: number;
}

const EmployeePerformanceModal: React.FC<{
  employee: PerformanceData;
  onClose: () => void;
  onScheduleReview: (employeeName: string) => void;
}> = ({ employee, onClose, onScheduleReview }) => {
  const renderStars = (rating: number, maxStars = 5) => {
    const safeRating = Math.max(0, Math.min(maxStars, isNaN(rating) ? 0 : rating));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = Math.max(0, maxStars - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex items-center">
        {Array.from({ length: Math.max(0, fullStars) }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute left-0 top-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          </div>
        )}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{safeRating.toFixed(1)}</span>
      </div>
    );
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (score >= 2.5) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="w-4 h-4 text-emerald-500" />;
      case 'down': return <TrendingDownIcon className="w-4 h-4 text-rose-500" />;
      default: return <MinusCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
              {employee.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{employee.name}</h2>
              <p className="text-gray-600">{employee.role} • {employee.department}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-xl transition-colors"
            title="Close dialog"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Performance Score */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Performance Score</h3>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(employee.trend)}
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPerformanceColor(employee.performanceScore)}`}>
                      {employee.status.toUpperCase().replace('-', ' ')}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-center">
                    <div className="relative w-32 h-32 mx-auto">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <span className="text-4xl font-bold text-gray-900">{employee.performanceScore.toFixed(1)}</span>
                          <span className="text-gray-500">/5</span>
                          <div className="mt-2">
                            {renderStars(employee.performanceScore)}
                          </div>
                        </div>
                      </div>
                      <svg className="w-full h-full" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                        <circle
                          cx="50"
                          cy="50"
                          r="45"
                          fill="none"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeDasharray={`${(employee.performanceScore / 5) * 283} 283`}
                          transform="rotate(-90 50 50)"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">KPI Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-emerald-500 h-2 rounded-full [width:var(--width)]`}
                            style={{ '--width': `${employee.kpiScore}%` } as React.CSSProperties}
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-900">{employee.kpiScore}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Task Completion</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-blue-500 h-2 rounded-full [width:var(--width)]`}
                            style={{ '--width': `${employee.taskCompletion}%` } as React.CSSProperties}
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-900">{employee.taskCompletion}%</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Quality Score</p>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className={`bg-amber-500 h-2 rounded-full [width:var(--width)]`}
                            style={{ '--width': `${employee.qualityScore}%` } as React.CSSProperties}
                          />
                        </div>
                        <span className="text-lg font-bold text-gray-900">{employee.qualityScore}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Current Goals</h3>
                  <span className="text-sm text-blue-600 font-medium">{employee.goals.length} Active</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employee.goals.map((goal, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/30 transition-colors">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <TargetIcon className="w-4 h-4 text-blue-600" />
                          <h4 className="font-medium text-gray-900">{goal.title}</h4>
                        </div>
                        <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          Due: {goal.deadline}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold text-gray-900">{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full [width:var(--width)] ${goal.progress >= 70 ? 'bg-emerald-500' : goal.progress >= 40 ? 'bg-blue-500' : 'bg-amber-500'}`}
                            style={{ '--width': `${goal.progress}%` } as React.CSSProperties}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Employee Details */}
            <div className="space-y-6">
              <div className="p-5 border border-gray-200 rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <User className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Employee Details</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</span>
                    <p className="font-medium text-gray-900 truncate">{employee.email}</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Join Date</span>
                    <p className="font-medium text-gray-900">{employee.joinDate}</p>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Manager</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      <p className="font-medium text-gray-900">{employee.manager}</p>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase tracking-wide mb-1">Active Projects</span>
                    <div className="flex items-center gap-2">
                      <FolderCheck className="w-4 h-4 text-blue-600" />
                      <p className="font-medium text-gray-900">{employee.projects} Projects</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance */}
              <div className="p-5 border border-gray-200 rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Attendance</h3>
                </div>
                <div className="text-center">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <span className="text-3xl font-bold text-gray-900">{employee.attendance}%</span>
                        <p className="text-xs text-gray-600 mt-1">Current Month</p>
                      </div>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${employee.attendance * 2.83} 283`}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-600">Present</span>
                    </div>
                    <div className="text-center">
                      <div className="w-2 h-2 bg-gray-300 rounded-full mx-auto mb-1"></div>
                      <span className="text-xs text-gray-600">Absent</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="p-5 border border-gray-200 rounded-xl bg-white">
                <div className="flex items-center gap-2 mb-4">
                  <AwardIcon className="w-5 h-5 text-gray-700" />
                  <h3 className="text-lg font-semibold text-gray-900">Recent Achievements</h3>
                </div>
                <div className="space-y-3">
                  {employee.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-2 bg-gradient-to-r from-amber-50/50 to-transparent rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <AwardIcon className="w-4 h-4 text-amber-600" />
                      </div>
                      <span className="text-sm text-gray-700">{achievement}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onScheduleReview(employee.name);
              onClose();
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow"
          >
            Schedule Review
          </button>
        </div>
      </div>
    </div>
  );
};

const EmployeePerformanceDashboard: React.FC = () => {
  const { employees, attendance, notify, tasks, customTeams, taskReviews, addTaskReview } = useHRMS();
  const [apiTasks, setApiTasks] = useState<any[]>([]);
  const [apiTasksLoading, setApiTasksLoading] = useState<boolean>(false);
  const [apiTeams, setApiTeams] = useState<any[]>([]);
  const [apiTeamsLoading, setApiTeamsLoading] = useState<boolean>(false);
  const [apiEmployees, setApiEmployees] = useState<any[]>([]);
  const [apiEmployeesLoading, setApiEmployeesLoading] = useState<boolean>(false);
  const [performanceDataState, setPerformanceData] = useState<PerformanceData[]>([]);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [deptApiData, setDeptApiData] = useState<any[]>([]);
  const [employeePerfApi, setEmployeePerfApi] = useState<any[]>([]);
  const [topPerformersApi, setTopPerformersApi] = useState<any[]>([]);
  const [lowPerformersApi, setLowPerformersApi] = useState<any[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentDate] = useState<string>(new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }));
  const [selectedEmployee, setSelectedEmployee] = useState<PerformanceData | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState<boolean>(false);
  const [liveUpdates, setLiveUpdates] = useState<Array<{ message: string; time: string }>>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Task review UI state
  const [taskTab, setTaskTab] = useState<'all' | 'team' | 'individual'>('all');
  const [selectedTaskForReview, setSelectedTaskForReview] = useState<Task | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [reviewEmployeeId, setReviewEmployeeId] = useState<string>('');
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('');

  // Task filters
  const [taskFilters, setTaskFilters] = useState<{
    status: string;
    priority: string;
    assigneeType: string;
    department: string;
    assigneeName: string;
  }>({
    status: 'All',
    priority: 'All',
    assigneeType: 'All',
    department: 'All',
    assigneeName: ''
  });

  // Complete list of task statuses
  const taskStatuses = useMemo(() => [
    'All',
    'Pending',
    'In Progress',
    'On Review',
    'Completed',
    'Overdue',
    'Cancelled'
  ], []);

  // Complete list of task priorities
  const taskPriorities = useMemo(() => [
    'All',
    'P1',
    'P2',
    'P3',
    'P4',
    'High',
    'Medium',
    'Low'
  ], []);

  // Convert real employees to performance data
  const loadPerformanceData = () => {
    if (employees.length === 0) return;

    // Map real employees to performance data
    const performanceDataList: PerformanceData[] = employees.map((emp, index) => {
      // Calculate performance score from employee data
      const leaveBalance = emp.leaveBalance || 0;
      const status = emp.status || 'active';

      // Base performance score
      let performanceScore = 4.0;

      // Adjust based on leave balance
      if (leaveBalance >= 15) performanceScore += 0.5;
      else if (leaveBalance <= 5) performanceScore -= 0.5;

      // Adjust based on status
      if (status === 'active') performanceScore += 0.2;
      else if (status === 'inactive') performanceScore -= 0.3;

      // Random variation for demo
      performanceScore += (Math.random() * 0.6) - 0.3;

      // Apply reviews-based adjustment (if any reviews exist for this employee)
      const empReviews = (typeof taskReviews !== 'undefined') ? taskReviews.filter(r => r.employeeId === emp.id) : [];
      const avgRating = empReviews.length > 0 ? (empReviews.reduce((s, r) => s + r.rating, 0) / empReviews.length) : null;
      if (avgRating) {
        // small positive/negative nudge based on average rating (centered at 3)
        performanceScore += (avgRating - 3) * 0.25; // +-0.5 max influence
      }

      performanceScore = Math.max(1, Math.min(5, performanceScore));

      // Determine status
      const performanceStatus: 'exceeding' | 'meeting' | 'below' | 'needs-improvement' =
        performanceScore >= 4.5 ? 'exceeding' :
          performanceScore >= 3.5 ? 'meeting' :
            performanceScore >= 2.5 ? 'below' : 'needs-improvement';

      // Calculate attendance from actual attendance records
      const today = new Date().toISOString().split('T')[0];
      const empAttendance = attendance.filter(a =>
        a.employeeId === emp.employeeId || a.employeeId === emp.id
      );

      const attendanceCount = empAttendance.length;
      const presentCount = empAttendance.filter(a =>
        a.status === 'present' || a.status === 'late'
      ).length;

      const attendanceRate = attendanceCount > 0 ?
        Math.round((presentCount / attendanceCount) * 100) :
        85 + Math.random() * 15;

      return {
        id: emp.id || `emp-${index}`,
        name: emp.fullName,
        role: emp.designation || 'Employee',
        department: emp.department,
        performanceScore: parseFloat(performanceScore.toFixed(1)),
        kpiScore: Math.floor(60 + Math.random() * 40),
        taskCompletion: Math.floor(70 + Math.random() * 30),
        qualityScore: Math.floor(65 + Math.random() * 35),
        attendance: attendanceRate,
        lastReview: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: performanceStatus,
        trend: Math.random() > 0.6 ? 'up' : Math.random() > 0.3 ? 'stable' : 'down',
        email: emp.email,
        joinDate: emp.dateOfJoining || new Date(Date.now() - Math.random() * 5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        manager: emp.reportingManager || 'Not Assigned',
        projects: Math.floor(1 + Math.random() * 10),
        achievements: [
          leaveBalance >= 20 ? 'Perfect Attendance Award' : null,
          performanceScore >= 4.5 ? 'High Performer' : null,
          'Team Contributor'
        ].filter(Boolean) as string[],
        feedback: empReviews.length > 0 ? empReviews.map(r => ({ date: r.date, comment: r.comment, reviewer: r.reviewer })) : [
          { date: '2024-03-15', comment: 'Good team player', reviewer: emp.reportingManager || 'Manager' },
          { date: '2024-02-28', comment: 'Meets expectations', reviewer: 'Supervisor' }
        ],
        goals: [
          { title: 'Complete Training', progress: Math.floor(Math.random() * 100), deadline: '2024-06-30' },
          { title: 'Improve Skills', progress: Math.floor(Math.random() * 100), deadline: '2024-08-15' }
        ]
      };
    });

    // Calculate department stats from real data
    const departments = [...new Set(employees.map(emp => emp.department))];
    const deptStats: DepartmentStats[] = departments.map(dept => {
      const deptEmployees = employees.filter(emp => emp.department === dept);
      const deptPerformance = performanceDataList.filter(p => p.department === dept);

      return {
        name: dept,
        employees: deptEmployees.length,
        avgKPIScore: deptPerformance.length > 0 ?
          Number((deptPerformance.reduce((sum, emp) => sum + emp.kpiScore, 0) / deptPerformance.length).toFixed(1)) : 75,
        tasksCompleted: Math.floor(deptEmployees.length * 45),
        totalTasks: Math.floor(deptEmployees.length * 50),
        attendance: deptPerformance.length > 0 ?
          Number((deptPerformance.reduce((sum, emp) => sum + emp.attendance, 0) / deptPerformance.length).toFixed(1)) : 85,
        overallRating: deptPerformance.length > 0 ?
          Number((deptPerformance.reduce((sum, emp) => sum + (emp.performanceScore / 5 * 100), 0) / deptPerformance.length).toFixed(1)) : 75
      };
    });

    setPerformanceData(performanceDataList);
    setDepartmentStats(deptStats);
    setLastUpdate(new Date());
  };

  // Initialize data
  useEffect(() => {
    loadPerformanceData();

    // Simulate live updates
    const interval = setInterval(() => {
      const updateMessages = [
        { message: 'Performance data updated', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { message: 'Attendance records synced', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) },
        { message: 'New performance reviews submitted', time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ];

      setLiveUpdates(prev => [
        updateMessages[Math.floor(Math.random() * updateMessages.length)],
        ...prev.slice(0, 2)
      ]);
      setLastUpdate(new Date());
    }, 30000);

    return () => clearInterval(interval);
    // Fetch performance-related API data once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees]);

  // Fetch remote performance APIs once on mount
  useEffect(() => {
    const token = localStorage.getItem('token');

    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

    const fetchDept = async () => {
      try {
        const res = await fetch('http://localhost:8085/api/performance/department-wise', { method: 'GET', credentials: 'include', headers });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setDeptApiData(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch department-wise performance', err);
      }
    };

    const fetchEmployeesPerf = async () => {
      try {
        const res = await fetch('http://localhost:8085/api/performance/employees', { method: 'GET', credentials: 'include', headers });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setEmployeePerfApi(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch employee performance list', err);
      }
    };

    const fetchTop = async () => {
      try {
        const res = await fetch('http://localhost:8085/api/tasks/top-performers', { method: 'GET', credentials: 'include', headers });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setTopPerformersApi(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch top performers', err);
      }
    };

    const fetchLow = async () => {
      try {
        const res = await fetch('http://localhost:8085/api/tasks/low-performers', { method: 'GET', credentials: 'include', headers });
        if (res.ok) {
          const data = await res.json().catch(() => []);
          setLowPerformersApi(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to fetch low performers', err);
      }
    };

    fetchDept();
    fetchEmployeesPerf();
    fetchTop();
    fetchLow();
  }, []);

  // Fetch tasks from API
  useEffect(() => {
    const fetchTasksFromAPI = async () => {
      try {
        setApiTasksLoading(true);
        const data = await getTasksFromAPI();

        // Normalize task data to match Task interface
        const normalizedTasks = Array.isArray(data) ? data.map((task: any) => {
          const assigneeType = (task.assigneeType || 'employee').toLowerCase();
          const assignedTo = assigneeType === 'team' ? (task.teamId || task.assignedTo) : (task.assignedTo || task.employeeId);
          return {
            id: task.id || task._id || task.taskId,
            title: task.title,
            description: task.description,
            status: (task.status || 'pending').toLowerCase(),
            priority: (task.priority || 'p2').toLowerCase(),
            assigneeType: assigneeType,
            assignedTo: assignedTo,
            assigneeName: task.assigneeName || task.assigneeName,
            dueDate: task.dueDate || task.deadlineAt,
            createdAt: task.createdAt,
            createdBy: task.createdBy,
            teamId: task.teamId,
            teamName: task.teamName,
            comments: task.comments || [],
            attachments: task.attachments || [],
            tags: task.tags || [],
          };
        }) : [];
        setApiTasks(normalizedTasks);
        console.log('Tasks fetched from API:', normalizedTasks);
      } catch (error) {
        console.error('Failed to fetch tasks from API:', error);
        setApiTasks([]);
      } finally {
        setApiTasksLoading(false);
      }
    };

    fetchTasksFromAPI();
  }, []);

  // Fetch teams from API
  useEffect(() => {
    const fetchTeamsFromAPI = async () => {
      try {
        setApiTeamsLoading(true);
        const data = await getTeamsFromAPI();
        // Normalize team data
        const normalizedTeams = Array.isArray(data) ? data.map((team: any) => {
          const teamId = team.id || team.teamId;
          return {
            id: teamId,
            teamId: teamId,
            name: team.name,
            employeeIds: team.employeeIds || team.memberIds || [],
            memberIds: team.memberIds || team.employeeIds || []
          };
        }) : [];
        setApiTeams(normalizedTeams);
        console.log('Teams fetched from API:', normalizedTeams);
      } catch (error) {
        console.error('Failed to fetch teams from API:', error);
        setApiTeams([]);
      } finally {
        setApiTeamsLoading(false);
      }
    };

    fetchTeamsFromAPI();
  }, []);

  // Fetch employees from API
  useEffect(() => {
    const fetchEmployeesFromAPI = async () => {
      try {
        setApiEmployeesLoading(true);
        const data = await getEmployeesFromAPI();
        // Normalize employee data
        const normalizedEmployees = Array.isArray(data) ? data.map((emp: any) => ({
          id: emp.id || emp.employeeId,
          employeeId: emp.employeeId,
          fullName: emp.fullName,
          email: emp.email,
          department: emp.department,
          designation: emp.designation,
          avatar: emp.avatar,
          leaveBalance: emp.leaveBalance,
          status: emp.status,
          reportingManager: emp.reportingManager,
          dateOfJoining: emp.dateOfJoining
        })) : [];
        setApiEmployees(normalizedEmployees);
        console.log('Employees fetched from API:', normalizedEmployees);
      } catch (error) {
        console.error('Failed to fetch employees from API:', error);
        setApiEmployees([]);
      } finally {
        setApiEmployeesLoading(false);
      }
    };

    fetchEmployeesFromAPI();
  }, []);

  // Calculate overall stats from real data
  const totalEmployees = employees.length;
  const avgPerformance = performanceDataState.length > 0 ?
    parseFloat((performanceDataState.reduce((sum, emp) => sum + emp.performanceScore, 0) / performanceDataState.length).toFixed(1)) : 0;
  const avgAttendance = performanceDataState.length > 0 ?
    parseFloat((performanceDataState.reduce((sum, emp) => sum + emp.attendance, 0) / performanceDataState.length).toFixed(1)) : 0;
  const lowPerformers = performanceDataState.filter(emp => emp.performanceScore < 3).length;

  // Get top performers
  const topPerformers = [...performanceDataState]
    .filter(emp => emp.performanceScore >= 4.5)
    .sort((a, b) => b.performanceScore - a.performanceScore)
    .slice(0, 3);

  // Get low performers
  const lowPerformersList = [...performanceDataState]
    .filter(emp => emp.performanceScore < 3)
    .sort((a, b) => a.performanceScore - b.performanceScore)
    .slice(0, 3);

  // Filter employees by search term
  const filteredPerformanceData = useMemo(() => {
    if (!searchTerm) return performanceDataState;

    return performanceDataState.filter(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [performanceDataState, searchTerm]);

  // Filter by department
  const filteredByDepartment = useMemo(() => {
    if (selectedDepartment === 'All') return filteredPerformanceData;
    return filteredPerformanceData.filter(emp => emp.department === selectedDepartment);
  }, [filteredPerformanceData, selectedDepartment]);

  // Star rendering function
  const renderStars = (rating: number, maxStars = 5) => {
    const safeRating = Math.max(0, Math.min(maxStars, isNaN(rating) ? 0 : rating));
    const fullStars = Math.floor(safeRating);
    const hasHalfStar = safeRating % 1 >= 0.5;
    const emptyStars = Math.max(0, maxStars - fullStars - (hasHalfStar ? 1 : 0));

    return (
      <div className="flex items-center">
        {Array.from({ length: Math.max(0, fullStars) }).map((_, i) => (
          <Star key={`full-${i}`} className="w-4 h-4 text-yellow-500 fill-current" />
        ))}
        {hasHalfStar && (
          <div className="relative">
            <Star className="w-4 h-4 text-gray-300" />
            <div className="absolute left-0 top-0 overflow-hidden w-1/2">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
            </div>
          </div>
        )}
        {Array.from({ length: Math.max(0, emptyStars) }).map((_, i) => (
          <Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />
        ))}
        <span className="ml-2 text-sm font-medium text-gray-700">{safeRating.toFixed(1)}</span>
      </div>
    );
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 4.5) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (score >= 3.5) return 'text-blue-600 bg-blue-50 border-blue-100';
    if (score >= 2.5) return 'text-amber-600 bg-amber-50 border-amber-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUpIcon className="w-4 h-4 text-emerald-500" />;
      case 'down': return <TrendingDownIcon className="w-4 h-4 text-rose-500" />;
      default: return <MinusCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const handleViewEmployee = (employee: PerformanceData) => {
    setSelectedEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsEmployeeModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleScheduleReview = (employeeName: string) => {
  };

  // Function to convert data to CSV format
  const convertToCSV = (data: any) => {
    const headers = [
      'Employee Name',
      'Department',
      'Role',
      'Performance Score',
      'KPI Score',
      'Task Completion',
      'Quality Score',
      'Attendance',
      'Status',
      'Email',
      'Manager',
      'Last Review Date'
    ];

    const rows = performanceDataState.map(emp => [
      `"${emp.name}"`,
      `"${emp.department}"`,
      `"${emp.role}"`,
      emp.performanceScore,
      `${emp.kpiScore}%`,
      `${emp.taskCompletion}%`,
      `${emp.qualityScore}%`,
      `${emp.attendance}%`,
      `"${emp.status}"`,
      `"${emp.email}"`,
      `"${emp.manager}"`,
      `"${emp.lastReview}"`
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  // Download handler function
  const handleDownloadReport = () => {
    try {
      // Create CSV content
      const csvContent = convertToCSV(performanceDataState);

      // Create timestamp for filename
      const timestamp = new Date().toISOString().split('T')[0].replace(/-/g, '');

      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      link.setAttribute('href', url);
      link.setAttribute('download', `performance_report_${timestamp}.csv`);
      link.style.visibility = 'hidden';

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error downloading report:', error);
      notify('Failed to download report. Please try again.', 'error');
    }
  };

  // Task card status styling
  const getTaskStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    switch (statusLower) {
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'in progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'on review': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'overdue': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'cancelled': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  // Task priority styling
  const getTaskPriorityColor = (priority: string) => {
    const priorityLower = priority?.toLowerCase() || '';
    switch (priorityLower) {
      case 'p1':
      case 'high': return 'bg-rose-100 text-rose-800';
      case 'p2':
      case 'medium-high': return 'bg-orange-100 text-orange-800';
      case 'p3':
      case 'medium': return 'bg-amber-100 text-amber-800';
      case 'p4':
      case 'low': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const departmentsList = useMemo(() =>
    Array.from(new Set((employees || []).map(e => e.department || 'Unassigned'))).sort(),
    [employees]
  );

  const openReviewModal = (task: Task) => {
    setSelectedTaskForReview(task);
    if (task.assigneeType === 'employee') setReviewEmployeeId(task.assignedTo);
    else setReviewEmployeeId('');
    setReviewRating(5);
    setReviewComment('');
    setIsReviewModalOpen(true);
  };

  const closeReviewModal = () => {
    setSelectedTaskForReview(null);
    setIsReviewModalOpen(false);
    setReviewEmployeeId('');
    setReviewRating(5);
    setReviewComment('');
  };

  const submitReview = () => {
    if (!selectedTaskForReview) return;
    if (!reviewEmployeeId) {
      notify('Please select an employee to review.', 'warning');
      return;
    }
    // Map numeric rating to enum expected by backend
    const ratingEnum = reviewRating === 5 ? 'FIVE' : reviewRating === 4 ? 'FOUR' : reviewRating === 3 ? 'THREE' : reviewRating === 2 ? 'TWO' : 'ONE';

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };

    (async () => {
      try {
        const res = await fetch(`http://localhost:8085/api/tasks/tasks/${encodeURIComponent(selectedTaskForReview.id)}`, {
          method: 'POST',
          credentials: 'include',
          headers,
          body: JSON.stringify({ employeeId: reviewEmployeeId, rating: ratingEnum, comments: reviewComment })
        });

        if (res.ok) {
          const data = await res.json().catch(() => null);
          addTaskReview({
            taskId: selectedTaskForReview.id,
            employeeId: reviewEmployeeId,
            reviewer: 'Admin',
            rating: reviewRating,
            comment: reviewComment,
            date: new Date().toISOString().split('T')[0]
          });
          loadPerformanceData();
          closeReviewModal();
        } else {
          const err = await res.json().catch(() => ({}));
          notify(err.message || 'Failed to submit review', 'error');
        }
      } catch (err) {
        console.error('Failed to submit review', err);
        notify('Network error while submitting review', 'error');
      }
    })();
  };

  const handleRefreshData = () => {
    loadPerformanceData();
  };
  
  const handleRefreshTasks = async () => {
    try {
      setApiTasksLoading(true);
      const data = await getTasksFromAPI();

      // Normalize task data to match Task interface
      const normalizedTasks = Array.isArray(data) ? data.map((task: any) => {
        const assigneeType = (task.assigneeType || 'employee').toLowerCase();
        const assignedTo = assigneeType === 'team' ? (task.teamId || task.assignedTo) : (task.assignedTo || task.employeeId);
        return {
          id: task.id || task._id || task.taskId,
          title: task.title,
          description: task.description,
          status: (task.status || 'pending').toLowerCase(),
          priority: (task.priority || 'p2').toLowerCase(),
          assigneeType: assigneeType,
          assignedTo: assignedTo,
          assigneeName: task.assigneeName || task.assigneeName,
          dueDate: task.dueDate || task.deadlineAt,
          createdAt: task.createdAt,
          createdBy: task.createdBy,
          teamId: task.teamId,
          teamName: task.teamName,
          comments: task.comments || [],
          attachments: task.attachments || [],
          tags: task.tags || [],
        };
      }) : [];
      setApiTasks(normalizedTasks);
    } catch (error) {
      console.error('Failed to refresh tasks:', error);
      notify('Failed to refresh tasks', 'error');
    } finally {
      setApiTasksLoading(false);
    }
  };

  // Task filter helpers - use API tasks as primary source, fallback to context tasks
  const allTasks = useMemo(() => {
    const tasksList = apiTasks.length > 0 ? apiTasks : (tasks || []);
    return tasksList;
  }, [apiTasks, tasks]);

  const visibleTasks = useMemo(() => {
    return (allTasks || []).filter(t => {
      // tab filter
      if (taskTab === 'team' && t.assigneeType !== 'team') return false;
      if (taskTab === 'individual' && t.assigneeType !== 'employee') return false;

      // status filter
      if (taskFilters.status !== 'All' && (t.status || '').toLowerCase() !== taskFilters.status.toLowerCase()) return false;

      // priority filter
      if (taskFilters.priority !== 'All' && (t.priority || '').toLowerCase() !== taskFilters.priority.toLowerCase()) return false;

      // assignee type filter
      if (taskFilters.assigneeType !== 'All' && t.assigneeType !== taskFilters.assigneeType) return false;

      // department filter
      if (taskFilters.department !== 'All' && t.assignedTo !== taskFilters.department) return false;

      // assignee name filter
      if (taskFilters.assigneeName && !(t.assigneeName || '').toLowerCase().includes(taskFilters.assigneeName.toLowerCase())) return false;

      return true;
    });
  }, [allTasks, taskTab, taskFilters]);

  // Task summaries for Performance view
  const teamTasks = useMemo(() => (allTasks || []).filter(t => (t.assigneeType || '').toLowerCase() === 'team'), [allTasks]);
  const individualTasks = useMemo(() => (allTasks || []).filter(t => (t.assigneeType || '').toLowerCase() === 'employee'), [allTasks]);
  const teamTasksCount = teamTasks.length;
  const individualTasksCount = individualTasks.length;
  const totalTasksCount = (allTasks || []).length;

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 font-sans">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Employee Performance Dashboard</h1>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3">
              <p className="text-sm font-semibold text-gray-600">{currentDate}</p>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 text-xs font-black rounded-full border-2 border-emerald-300 shadow-lg shadow-emerald-100/50">
                <Zap className="w-4 h-4 animate-pulse" />
                <span className="uppercase tracking-widest">Live Data • {performanceDataState.length} Employees • Updated: {lastUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative flex-1 md:flex-none">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-indigo-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-5 py-3 border-2 border-indigo-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white text-sm w-full md:w-72 shadow-lg font-semibold hover:border-indigo-400 transition-colors text-black"
              />
            </div>

            <button
              onClick={handleRefreshData}
              className="p-3 border-2 border-blue-300 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl bg-gradient-to-br from-blue-50 to-blue-100"
              title="Refresh data"
            >
              <Activity className="w-5 h-5 text-blue-600 font-bold" />
            </button>

            <button
              onClick={handleDownloadReport}
              className="p-3 border-2 border-purple-300 rounded-xl hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl bg-gradient-to-br from-purple-50 to-purple-100 flex items-center gap-2"
              title="Download performance report"
            >
              <Download className="w-5 h-5 text-purple-600 font-bold" />
              <span className="hidden md:inline text-sm font-black text-purple-600 uppercase tracking-widest">Download</span>
            </button>
          </div>
        </div>

        {/* Live Updates */}
        {liveUpdates.length > 0 && (
          <div className="mb-6 p-6 bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-300 rounded-2xl shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-lg shadow-cyan-400"></div>
              <span className="text-sm font-black text-cyan-900 uppercase tracking-widest">🔔 Live Activity Feed</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {liveUpdates.map((update, index) => (
                <div key={index} className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-cyan-200 shadow-md hover:shadow-lg transition-all">
                  <Clock className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5 font-bold" />
                  <div className="flex-1">
                    <span className="text-xs font-black text-cyan-600 uppercase tracking-widest block mb-1">{update.time}</span>
                    <span className="text-sm font-semibold text-gray-800">{update.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Tasks Overview & Reviews (moved to top) */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 border-b-2 border-blue-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <BarChart2 className="w-6 h-6 text-white font-bold" />
                  <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight">📊 Tasks Overview</h2>
                </div>
                <p className="text-sm font-semibold text-blue-100">Monitor and review all tasks with comprehensive analytics</p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex bg-white/30 backdrop-blur-sm p-1 rounded-2xl border-2 border-white/40">
                  {['all', 'team', 'individual'].map(tab => (
                    <button
                      key={tab}
                      onClick={() => setTaskTab(tab as any)}
                      className={`px-5 py-3 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${taskTab === tab ? 'bg-white text-blue-700 shadow-lg' : 'text-white hover:bg-white/20'}`}
                    >{tab === 'all' ? '📋 All Tasks' : tab === 'team' ? '👥 Team Tasks' : '👤 Individual Tasks'}</button>
                  ))}
                </div>
                <button
                  onClick={handleRefreshTasks}
                  disabled={apiTasksLoading}
                  className="px-5 py-3 bg-white text-blue-700 border-none rounded-xl text-xs font-black hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                  title={apiTasksLoading ? 'Loading tasks...' : 'Refresh tasks'}
                >
                  {apiTasksLoading ? '⏳ Loading...' : '🔄 Refresh Tasks'}
                </button>
              </div>
            </div>
          </div>

          {/* Summary Cards - Moved inside Tasks Overview section */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
              {/* All Tasks Card */}
              <div
                className="p-6 rounded-2xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center cursor-pointer hover:border-blue-400 hover:shadow-xl transition-all duration-200 shadow-lg"
                onClick={() => setTaskTab('all')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-200 to-cyan-200 flex items-center justify-center shadow-md">
                    <CheckSquare className="w-8 h-8 text-blue-700 font-bold" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 font-black uppercase tracking-widest">All Tasks</p>
                    <p className="text-3xl font-black text-blue-900">{totalTasksCount}</p>
                  </div>
                </div>
              </div>

              {/* Team Tasks Card */}
              <div
                className="p-6 rounded-2xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-green-50 flex items-center cursor-pointer hover:border-emerald-400 hover:shadow-xl transition-all duration-200 shadow-lg"
                onClick={() => setTaskTab('team')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-200 to-green-200 flex items-center justify-center shadow-md">
                    <UsersIcon className="w-8 h-8 text-emerald-700 font-bold" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-600 font-black uppercase tracking-widest">Team Tasks</p>
                    <p className="text-3xl font-black text-emerald-900">{teamTasksCount}</p>
                  </div>
                </div>
              </div>

              {/* Individual Tasks Card */}
              <div
                className="p-6 rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center cursor-pointer hover:border-amber-400 hover:shadow-xl transition-all duration-200 shadow-lg"
                onClick={() => setTaskTab('individual')}
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-200 to-orange-200 flex items-center justify-center shadow-md">
                    <User className="w-8 h-8 text-amber-700 font-bold" />
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 font-black uppercase tracking-widest">Individual Tasks</p>
                    <p className="text-3xl font-black text-amber-900">{individualTasksCount}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Filters */}
          <div className="mb-6 mt-6 bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border-2 border-purple-200 shadow-lg overflow-hidden">
            <div className="p-5 md:p-6 bg-gradient-to-r from-purple-600 to-blue-600 border-b-2 border-purple-700">
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">🎯 Task Filters</h3>
            </div>

            <div className="p-5 md:p-7 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-black text-purple-900 mb-2 uppercase tracking-widest">Status</label>
                  <select
                    title="Filter by task status"
                    value={taskFilters.status}
                    onChange={(e) => setTaskFilters(f => ({ ...f, status: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-white text-sm font-semibold text-gray-800 hover:border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="On Review">On Review</option>
                    <option value="Completed">Completed</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                {/* Priority Filter */}
                <div>
                  <label className="block text-sm font-black text-purple-900 mb-2 uppercase tracking-widest">Priority</label>
                  <select
                    title="Filter by task priority"
                    value={taskFilters.priority}
                    onChange={(e) => setTaskFilters(f => ({ ...f, priority: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-white text-sm font-semibold text-gray-800 hover:border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="All">All Priorities</option>
                    <option value="P1">P1 - Critical</option>
                    <option value="P2">P2 - High</option>
                    <option value="P3">P3 - Medium</option>
                    <option value="P4">P4 - Low</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                {/* Assignee Type Filter */}
                <div>
                  <label className="block text-sm font-black text-purple-900 mb-2 uppercase tracking-widest">Assignee Type</label>
                  <select
                    title="Filter by assignee type"
                    value={taskFilters.assigneeType}
                    onChange={(e) => setTaskFilters(f => ({ ...f, assigneeType: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-white text-sm font-semibold text-gray-800 hover:border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="All">All Assignees</option>
                    <option value="employee">Employee</option>
                    <option value="team">Team</option>
                    <option value="department">Department</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div>
                  <label className="block text-sm font-black text-purple-900 mb-2 uppercase tracking-widest">Department</label>
                  <select
                    title="Filter by department"
                    value={taskFilters.department}
                    onChange={(e) => setTaskFilters(f => ({ ...f, department: e.target.value }))}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-white text-sm font-semibold text-gray-800 hover:border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  >
                    <option value="All">All Departments</option>
                    {departmentsList.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {/* Assignee Name Search */}
                <div>
                  <label className="block text-sm font-black text-purple-900 mb-2 uppercase tracking-widest">Search</label>
                  <input
                    value={taskFilters.assigneeName}
                    onChange={(e) => setTaskFilters(f => ({ ...f, assigneeName: e.target.value }))}
                    placeholder="Assignee name..."
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl bg-white text-sm font-semibold text-gray-800 hover:border-purple-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="flex justify-end pt-2 border-t-2 border-purple-200">
                <button
                  onClick={() => setTaskFilters({ status: 'All', priority: 'All', assigneeType: 'All', department: 'All', assigneeName: '' })}
                  className="px-6 py-3 bg-gradient-to-r from-slate-600 to-gray-600 text-white rounded-xl font-bold hover:from-slate-700 hover:to-gray-700 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  🔄 Reset All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Task list (filtered by selected tab) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6 pt-0">
            {apiTasksLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4 animate-pulse">
                    <CheckSquare className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-gray-600 font-semibold">Loading tasks from API...</p>
                </div>
              </div>
            ) : visibleTasks.length > 0 ? (
              visibleTasks.map(task => (
                <div key={task.id} className="group p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          {task.assigneeType}
                        </span>
                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${getTaskPriorityColor(task.priority)}`}>
                          {task.priority} Priority
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">{task.title}</h3>
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-700">{task.assigneeName}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">Due Date</div>
                      <div className="text-sm font-medium text-gray-900">{task.dueDate}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full border ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <button
                      onClick={() => openReviewModal(task)}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 text-xs font-medium rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 shadow-sm"
                    >
                      Add Review
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-100 mb-4">
                    <CheckSquare className="w-8 h-8 text-amber-600" />
                  </div>
                  <p className="text-gray-600 font-semibold">No tasks found</p>
                  <p className="text-gray-500 text-sm mt-1">Try adjusting your filters</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Total Employees */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Total Employees</h2>
                <p className="text-4xl font-bold text-gray-900 mt-1">{totalEmployees}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Avg Performance</p>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-2xl font-bold text-gray-900">{avgPerformance.toFixed(1)}</span>
                  <span className="text-gray-500">/ 5</span>
                </div>
                <div className="flex justify-center">
                  {renderStars(avgPerformance)}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Attendance</p>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-900">{avgAttendance.toFixed(1)}%</span>
                </div>
                <div className="flex justify-center">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-emerald-500 h-2 rounded-full [width:var(--width)]`}
                      style={{ '--width': `${avgAttendance}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-600 mb-2">Low Performers</p>
                <div className="mb-2">
                  <span className="text-2xl font-bold text-gray-900">{lowPerformers}</span>
                </div>
                <p className="text-xs text-rose-600 font-medium bg-rose-50 px-2 py-1 rounded-full">Needs attention</p>
              </div>
            </div>
          </div>
        </div>

        {/* Department Performance & KPI */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Department Performance */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Department-wise Performance</h2>
              </div>
              <div className="relative">
                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm appearance-none shadow-sm text-black"
                  title="Select department"
                >
                  <option value="All">All Departments</option>
                  {departmentStats.map(dept => (
                    <option key={dept.name} value={dept.name}>{dept.name}</option>
                  ))}
                </select>
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto rounded-lg border border-gray-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Department</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Employees</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Avg KPI</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Tasks</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {departmentStats.map((dept) => (
                    <tr key={dept.name} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${dept.name === 'Sales' ? 'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-600' :
                            dept.name === 'Development' ? 'bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-600' :
                              dept.name === 'Support' ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600' :
                                dept.name === 'Marketing' ? 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600' :
                                  'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600'
                            }`}>
                            <span className="text-sm font-bold">{dept.name.charAt(0)}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">{dept.name}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{dept.employees}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full bg-blue-500 [width:var(--width)]`}
                              style={{ '--width': `${dept.avgKPIScore}%` } as React.CSSProperties}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900 min-w-[40px]">{dept.avgKPIScore}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-900 font-medium">{dept.tasksCompleted}/{dept.totalTasks}</span>
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full bg-emerald-500 [width:var(--width)]`}
                              style={{ '--width': `${(dept.tasksCompleted / Math.max(dept.totalTasks, 1)) * 100}%` } as React.CSSProperties}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{dept.attendance}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        {renderStars(dept.overallRating / 20)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KPI Categories */}
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center gap-2 mb-6">
              <Target className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">KPI Categories</h2>
            </div>
            <div className="space-y-6">
              {[
                { label: 'KPI Score', value: 80, color: 'bg-gradient-to-r from-blue-500 to-blue-600' },
                { label: 'Task Completion', value: 92, color: 'bg-gradient-to-r from-emerald-500 to-emerald-600' },
                { label: 'Quality', value: 88, color: 'bg-gradient-to-r from-amber-500 to-amber-600' },
                { label: 'Attendance', value: 95, color: 'bg-gradient-to-r from-purple-500 to-purple-600' },
                { label: 'Teamwork', value: 85, color: 'bg-gradient-to-r from-pink-500 to-pink-600' }
              ].map((kpi, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{kpi.label}</span>
                    <span className="text-sm font-bold text-gray-900">{kpi.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <div
                      className={`h-2.5 rounded-full ${kpi.color} transition-all duration-500 ease-out [width:var(--width)]`}
                      style={{ '--width': `${kpi.value}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top & Low Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Performers */}
          <div className="bg-gradient-to-br from-white to-emerald-50/30 rounded-xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">Top Performers</h2>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                {topPerformers.length} Employees
              </span>
            </div>

            <div className="space-y-4">
              {topPerformers.map((emp, index) => (
                <div
                  key={emp.id}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-emerald-50 rounded-xl border border-emerald-100 hover:border-emerald-300 hover:shadow-sm cursor-pointer transition-all duration-200"
                  onClick={() => handleViewEmployee(emp)}
                >
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-sm">
                        <span className="text-lg font-bold text-white">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-amber-500 to-amber-600 rounded-full flex items-center justify-center shadow-sm">
                        <span className="text-xs font-bold text-white">#{index + 1}</span>
                      </div>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-gray-600">{emp.role} • {emp.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-xl font-bold text-gray-900">{emp.performanceScore.toFixed(1)}</span>
                      <Star className="w-5 h-5 text-amber-500 fill-current" />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      {getTrendIcon(emp.trend)}
                      <span className="text-xs font-medium text-emerald-700">Exceeding Expectations</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Low Performers */}
          <div className="bg-gradient-to-br from-white to-rose-50/30 rounded-xl border border-gray-200 shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
                <h2 className="text-lg font-semibold text-gray-900">Low Performers</h2>
              </div>
              <span className="text-xs font-medium px-3 py-1 bg-rose-100 text-rose-800 rounded-full">
                {lowPerformersList.length} Employees
              </span>
            </div>

            <div className="space-y-4">
              {lowPerformersList.map((emp) => (
                <div
                  key={emp.id}
                  className="group flex items-center justify-between p-4 bg-gradient-to-r from-white to-rose-50 rounded-xl border border-rose-100 hover:border-rose-300 hover:shadow-sm cursor-pointer transition-all duration-200"
                  onClick={() => handleViewEmployee(emp)}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-sm">
                      <span className="text-lg font-bold text-white">
                        {emp.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                      <p className="text-xs text-gray-600">{emp.role} • {emp.department}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <span className="text-xl font-bold text-gray-900">{emp.performanceScore.toFixed(1)}</span>
                      <Star className="w-5 h-5 text-gray-300" />
                    </div>
                    <div className="flex items-center gap-2 justify-end">
                      {getTrendIcon(emp.trend)}
                      <span className="text-xs font-medium text-rose-700">Needs Improvement</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Employee List Table with Fixed Header and Invisible Scrollbar */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Employee Performance List</h2>
            </div>
            <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-800 rounded-full">
              {filteredByDepartment.length} employees
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-gray-200 relative">
            {/* Fixed Header Container */}
            <div className="sticky top-0 z-10 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <table className="w-full">
                <thead>
                  <tr>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Employee</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Department</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Performance</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">KPI</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Attendance</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Status</th>
                    <th className="text-left p-4 text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* Scrollable Body Container with Invisible Scrollbar */}
            <div className="overflow-y-auto max-h-[500px] [&::-webkit-scrollbar]:w-0 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent [-ms-overflow-style:none] [scrollbar-width:none] hover:[&::-webkit-scrollbar-thumb]:bg-gray-300">
              <table className="w-full">
                <tbody className="divide-y divide-gray-100">
                  {filteredByDepartment.slice(0, 10).map((emp) => (
                    <tr key={emp.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center shadow-sm">
                            <span className="text-sm font-bold text-blue-600">{emp.name.charAt(0)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{emp.name}</p>
                            <p className="text-xs text-gray-600">{emp.role}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="text-sm font-medium text-gray-700">{emp.department}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {renderStars(emp.performanceScore)}
                          <span className="text-xs text-gray-500 font-medium">
                            ({emp.performanceScore.toFixed(1)})
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full [width:var(--width)] ${emp.kpiScore >= 80 ? 'bg-emerald-500' : emp.kpiScore >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                              style={{ '--width': `${emp.kpiScore}%` } as React.CSSProperties}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-900">{emp.kpiScore}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">{emp.attendance}%</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getPerformanceColor(emp.performanceScore)}`}>
                          {emp.status.replace('-', ' ')}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => handleViewEmployee(emp)}
                          className="px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-600 text-sm font-medium rounded-lg hover:from-blue-100 hover:to-blue-200 transition-all duration-200 shadow-sm"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal - Fixed with black text */}
      {isReviewModalOpen && selectedTaskForReview && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white flex-shrink-0">
              <h3 className="text-xl font-bold text-gray-900">Add Review for Task</h3>
              <button
                onClick={closeReviewModal}
                title="Close review modal"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Scrollable Content Area - All text is now black */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm font-semibold text-blue-900 mb-2">Task Details</p>
                <p className="font-bold text-gray-900 text-sm md:text-base">{selectedTaskForReview.title}</p>
                <p className="text-sm text-gray-900 mt-2 line-clamp-2">{selectedTaskForReview.description}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Review For</label>

                {selectedTaskForReview.assigneeType === 'employee' && (
                  <select
                    title="Select employee for review"
                    value={reviewEmployeeId}
                    onChange={(e) => setReviewEmployeeId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-900"
                  >
                    <option value="" className="text-black">Select employee</option>
                    <option value={selectedTaskForReview.assignedTo} className="text-gray-900">{selectedTaskForReview.assigneeName}</option>
                  </select>
                )}
                {selectedTaskForReview.assigneeType === 'team' && (
                  (() => {
                    // Get team member IDs from selected task
                    let memberIds: string[] = [];
                    // Debug info
                    console.log('=== TEAM TASK DEBUG ===');
                    console.log('Task:', selectedTaskForReview);
                    console.log('assignedTo:', selectedTaskForReview.assignedTo);
                    console.log('API Teams count:', apiTeams.length);
                    console.log('Custom Teams count:', customTeams.length);
                    if (!selectedTaskForReview.assignedTo) {
                      console.log('ERROR: assignedTo is null/undefined');
                      return (
                        <select
                          disabled
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-900 opacity-50"
                        >
                          <option className="text-gray-900">Error: No team ID found</option>
                        </select>
                      );
                    }

                    // Search for team in apiTeams
                    const apiTeam = apiTeams.find(t => {
                      const matches = (t.teamId === selectedTaskForReview.assignedTo ||
                        t.id === selectedTaskForReview.assignedTo);
                      console.log(`Checking API team - id: "${t.id}", teamId: "${t.teamId}", matches: ${matches}`);
                      return matches;
                    });

                    if (apiTeam) {
                      memberIds = apiTeam.employeeIds || [];
                      console.log('✓ Found team in API teams:', apiTeam.name, 'Members:', memberIds);
                    } else {
                      // Search in custom teams
                      const customTeam = customTeams.find(t => t.id === selectedTaskForReview.assignedTo);
                      if (customTeam) {
                        memberIds = customTeam.memberIds || [];
                        console.log('✓ Found team in custom teams:', customTeam.name, 'Members:', memberIds);
                      } else {
                        console.log('✗ Team NOT found! Looking for ID:', selectedTaskForReview.assignedTo);
                        console.log('Available API teams:', apiTeams.map(t => ({ id: t.id, teamId: t.teamId, name: t.name })));
                        console.log('Available custom teams:', customTeams.map(t => ({ id: t.id, name: t.name })));
                      }
                    }
                    return (
                      <select
                        title="Select employee for review"
                        value={reviewEmployeeId}
                        onChange={(e) => setReviewEmployeeId(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-900"
                      >
                        <option value="" className="text-gray-900">Select employee</option>
                        {memberIds.length === 0 ? (
                          <>
                            <option disabled className="text-gray-900">Loading team members...</option>
                            <option disabled className="text-gray-900">If this persists, there may be an issue loading the team data</option>
                          </>
                        ) : (
                          memberIds.map((memberId: string) => {
                            // Use API employees first, fallback to context employees
                            const allEmployees = apiEmployees.length > 0 ? apiEmployees : employees;
                            const emp = allEmployees.find(e => e.id === memberId || e.employeeId === memberId);
                            if (emp) {
                              console.log(`✓ Found employee for ${memberId}:`, emp);
                              const empName = emp.fullName || emp.name || Object.values(emp).find(v => typeof v === 'string' && v.length > 2) || 'Unknown';
                              console.log(`  Name resolved to: ${empName}`);
                            } else {
                              console.log(`✗ No employee found for member ID: ${memberId}`);
                            }
                            return emp ? (
                              <option key={memberId} value={emp.id || emp.employeeId} className="text-gray-900">
                                {emp.fullName || emp.name || emp['firstName'] || emp['lastName'] || 'Unknown'}
                              </option>
                            ) : null;
                          })
                        )}
                      </select>
                    );
                  })()
                )}
                {selectedTaskForReview.assigneeType === 'department' && (
                  <select
                    title="Select employee for review"
                    value={reviewEmployeeId}
                    onChange={(e) => setReviewEmployeeId(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-900"
                  >
                    <option value="" className="text-gray-900">Select employee</option>
                    {(apiEmployees.length > 0 ? apiEmployees : employees)
                      .filter(e => e.department === selectedTaskForReview.assignedTo)
                      .map(emp => (
                        <option key={emp.id} value={emp.id || emp.employeeId} className="text-gray-900">
                          {emp.fullName || emp.name || 'Unknown'}
                        </option>
                      ))}
                  </select>
                )}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Rating</label>
                <select
                  title="Select review rating"
                  value={reviewRating}
                  onChange={e => setReviewRating(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-900"
                >
                  {[5, 4, 3, 2, 1].map(n => (
                    <option key={n} value={n} className="text-gray-900">
                      {n} {n === 1 ? 'Star' : 'Stars'} - {n >= 4 ? 'Excellent' : n >= 3 ? 'Good' : n >= 2 ? 'Fair' : 'Poor'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-900 mb-2 block">Comments</label>
                <textarea
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm text-gray-900 resize-none"
                  placeholder="Provide constructive feedback about task execution, quality, and areas for improvement..."
                  rows={4}
                />
              </div>
            </div>

            {/* Fixed Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <button
                onClick={closeReviewModal}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-100 transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-sm hover:shadow text-sm"
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Employee Performance Modal */}
      {isEmployeeModalOpen && selectedEmployee && (
        <EmployeePerformanceModal
          employee={selectedEmployee}
          onClose={handleCloseModal}
          onScheduleReview={handleScheduleReview}
        />
      )}
    </div>
  );
};

export default EmployeePerformanceDashboard;