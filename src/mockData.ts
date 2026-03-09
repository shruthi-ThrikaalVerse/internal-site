import {
  EmployeeSummary,
  DashboardStats,
  RecentActivity,
  PendingApproval,
  DepartmentHeadcount,
  AttendanceRecord,
  LeaveRequest,
  PayrollRun,
  GoalTracking,
  AuditLog,
  PerformanceCycle,
  EmployeeDocument
} from './types.js';

export const mockDashboardStats: DashboardStats = {
  totalEmployees: 0,
  activeEmployees: 0,
  presentToday: 0,
  absentToday: 0,
  lateToday: 0,
  onLeaveToday: 0,
  pendingApprovals: 0,
  openPositions: 0,
  payrollDueDate: ''
};

export const mockActivities: RecentActivity[] = [];

export const mockDepartmentHeadcount: DepartmentHeadcount[] = [];

export const mockEmployees: EmployeeSummary[] = [];

export const mockAttendanceRecords: AttendanceRecord[] = [];

export const mockPerformanceCycles: PerformanceCycle[] = [];

export const mockPayrollRuns: PayrollRun[] = [];

export const mockGoals: GoalTracking[] = [];

export const mockAuditLogs: AuditLog[] = [];