/* Consolidated Types from Admin & Employee Projects */

// ============= Auth & User Types =============
export interface User {
  id: string;
  name?: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  address?: string;
  emergencyContact?: string;
  employeeId?: string;
  department?: string;
  designation?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  joiningDate?: string;
  manager?: string;
  reportingManager?: string;
  role: 'admin' | 'manager' | 'auditor' | 'employee' | 'hr' | 'Employee' | 'Manager' | 'HR' | 'Admin' | 'SUPER_ADMIN' | 'ADMIN';
  userType?: 'Employee' | 'Manager' | 'HR' | 'Admin';
  avatar?: string;
  profileImage?: string;
  location?: string;
  employmentType?: string;
  tags?: string[];
  leaveBalance?: number;
  salaryStructure?: SalaryStructure;
  bankDetails?: BankDetails;
  documents?: EmployeeDocument[];
  status?: EmployeeStatus;
  password?: string;
  createdByEmployeeId?: string;
  createdByRole?: string;
  createdByName?: string;
  hrEmployeeId?: string | null;
  performance?: {
    projectsCompleted: number;
    averageRating: number;
    attendance: string;
  };
}

// ============= Dashboard & Stats =============
export interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  lateToday: number;
  onLeaveToday: number;
  pendingApprovals: number;
  openPositions: number;
  payrollDueDate: string;
}

// ============= Activity & Notifications =============
export type ActivityType = 'checkin' | 'checkout' | 'leave' | 'document' | 'update';

export interface RecentActivity {
  id: string;
  type: ActivityType;
  employeeName: string;
  time: string;
  details: string;
  avatar?: string;
}

export interface Notification {
  id: string;
  title?: string;
  message?: string;
  msg?: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp?: string;
  time?: string;
  icon?: string;
  color?: string;
  read?: boolean;
}

export type AdminNotificationType = 'global' | 'selected';
export type AdminNotificationPriority = 'normal' | 'high' | 'urgent';
export type AdminNotificationStatus = 'active' | 'inactive';

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: AdminNotificationType;
  targetEmployeeIds: string[];
  priority: AdminNotificationPriority;
  dateTime: string;
  status: AdminNotificationStatus;
  readBy: string[];
}

// ============= Approvals =============
export type ApprovalType = 'leave' | 'overtime' | 'expense' | 'regularization';

export interface PendingApproval {
  id: string;
  type: ApprovalType;
  employeeName: string;
  details: string;
  date: string;
  status: 'pending';
}

// ============= Employee Management =============
export type EmployeeStatus = 'active' | 'inactive' | 'probation' | 'resigned';

export interface EmployeeSummary {
  id: string;
  employeeId: string;
  fullName: string;
  avatar: string;
  designation: string;
  department: string;
  email: string;
  role?: string;
  password?: string;
  phone?: string;
  status: EmployeeStatus;
  dateOfJoining: string;
  dateOfBirth?: string;
  employmentType?: string;
  reportingManager: string;
  location: string;
  tags: string[];
  leaveBalance: number;
  username?: string;
  profileImage?: string | null;
  locationName?: string;
  createdByRole?: string;
  createdByName?: string;
  totalLeaveBalance?: number;
  userType?: string;
  active?: boolean;
  terminationReason?: string | null;
  terminatedAt?: string | null;
  salaryStructure?: SalaryStructure;
  bankDetails?: BankDetails;
  documents?: EmployeeDocument[];
}

// ============= Attendance =============
export interface AttendanceRecord {
  id?: string;
  employeeId?: string;
  name?: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  totalHours?: string;
  timeIn?: string;
  timeOut?: string | null;
  workingHours?: number;
  status: 'present' | 'absent' | 'late' | 'half-day' | 'on-leave' | 'Present' | 'Late' | 'Absent' | 'On Leave' | 'Working Saturday';
  location?: string;
  locationName?: string;
  isLate?: boolean;
}

export interface CalendarAttendanceRecord {
  id: string;
  date: string;
  status: string;
  timeIn: string | null;
  timeOut: string | null;
  workingHours?: number;
  locationName?: string;
  isLate: boolean;
  totalHours?: string;
}

// ============= Leave Management =============
export type LeaveType = 'casual' | 'sick' | 'annual' | 'maternity' | 'Casual Leave' | 'Sick Leave' | 'Annual Leave';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: string;
  employeeId?: string;
  type?: string;
  leaveType?: LeaveType;
  employeeName?: string;
  startDate: string;
  endDate: string;
  days?: number;
  reason: string;
  status: LeaveStatus;
  appliedDate?: string;
  appliedOn?: string;
  applicant?: string;
  documents?: string[];
  medicalCertificate?: string;
}

export interface LeaveBalance {
  total: number;
  used: number;
  available: number;
  lossOfPay: number;
}

// ============= Tasks =============
export type TaskPriority = 'low' | 'medium' | 'high' | 'Low' | 'Medium' | 'High' | 'p1' | 'p2' | 'p3' | 'p4';
export type AssigneeType = 'employee' | 'department' | 'team';

export interface Task {
  id: string;
  title: string;
  description?: string;
  project?: string;
  assignedTo?: string;
  assigneeName?: string;
  assigneeType?: AssigneeType;
  priority: TaskPriority;
  status: 'pending' | 'in-progress' | 'completed' | 'To Do' | 'In Progress' | 'Completed';
  dueDate: string;
  createdAt?: string;
}

// ============= Documents =============
export interface Document {
  id: string;
  name: string;
  type: 'Contract' | 'Certificate' | 'ID Card' | 'Other';
  size: string;
  uploadedAt: string;
}

export interface EmployeeDocument {
  type: string;
  status: 'uploaded' | 'pending' | 'verified';
  uploadedDate?: string;
  fileName?: string;
  verified?: boolean;
}

// ============= Payroll Management =============
export interface SalaryStructure {
  basic: number;
  hra: number;
  da: number;
  specialAllowance?: number;
  pf: number;
  esi: number;
  professionalTax: number;
  tds: number;
}

export interface BankDetails {
  bankName: string;
  accountNumber: string;
  ifsc: string;
}

export interface PayrollRun {
  id: string;
  month: string;
  year: number;
  status: 'draft' | 'processing' | 'completed' | 'locked';
  totalEmployees: number;
  totalAmount: number;
  processedDate?: string;
}

export type PayslipStatus = 'sent' | 'pending' | 'viewed';

export interface PayslipData {
  id: string;
  employeeId: string;
  name: string;
  month: string;
  year: number;
  basic: number;
  allowances: number;
  deductions: number;
  netPay: number;
  status: PayslipStatus;
  remarks?: string;
  fileName?: string;
  fileUrl?: string;
  grossSalary: number;
  lop: number;
  attendanceSummary: {
    present: number;
    absent: number;
    totalDays: number;
  };
}

// ============= Events =============
export type EventType = 'company' | 'team' | 'training' | 'meeting' | 'holiday' | 'workshop' | 'celebration' | 'conference' | 'team_building' | 'party' | 'health_checkup' | 'anniversary' | 'awards' | 'webinar' | 'social';
export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type EventPriority = 'normal' | 'important';
export type EventAudience = 'all' | 'selected' | 'department';
export type ParticipationStatus = 'interested' | 'attending';

export interface EventParticipation {
  employeeEmail: string;
  status: ParticipationStatus;
}

export interface AppEvent {
  id: string;
  title: string;
  description: string;
  type: EventType;
  date?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  isOnline: boolean;
  location: string;
  audience: EventAudience;
  targetEmployeeIds: string[];
  targetDepartment?: string;
  status: EventStatus;
  priority: EventPriority;
  isMandatory?: boolean;
  isPublished: boolean;
  attachments: { name: string; url: string }[];
  participations: EventParticipation[];
  participants?: string[];
  meetingType?: 'VIRTUAL' | 'PHYSICAL' | string;
  meetingLink?: string;
  createdAt: string;
  updatedAt?: string;
  organizer?: string;
}

export interface EventFilters {
  type?: EventType;
  status?: EventStatus;
  month?: number;
  year?: number;
  search?: string;
}

// Backwards-compatible alias: some files expect `Event` name
export type Event = Partial<AppEvent> & { id: string | number };

// ============= Performance & Goals =============
export interface PerformanceCycle {
  id: string;
  name: string;
  period: string;
  status: 'draft' | 'active' | 'completed';
  participants: number;
  completed: number;
}

// --- analytics response types returned by the performance percentage endpoint ---
export interface LeaveAnalyticsResponse {
  workingDays: number;
  leavesTaken: number;
  leavePercentage: number;
  workingPercentage: number;
}

export interface AttendanceAnalyticsResponse {
  presentDays: number;
  absentDays: number;
  attendancePercentage: number;
}

export interface TaskAnalyticsResponse {
  completed: number;
  inProgress: number;
  assigned: number;
  completedPercentage: number;
  inProgressPercentage: number;
  assignedPercentage: number;
}

export interface ProjectAnalyticsResponse {
  completed: number;
  inProgress: number;
  assigned: number;
  planning: number;
  newStatus: number;
  deadline: number;
  completedPercentage: number;
  inProgressPercentage: number;
  assignedPercentage: number;
  planningPercentage: number;
  newPercentage: number;
  deadlinePercentage: number;
}

export interface PerformanceAnalyticsResponse {
  leaveAnalyticsResponse: LeaveAnalyticsResponse;
  attendanceAnayticsResponse: AttendanceAnalyticsResponse;
  taskAnalyticsResponse?: TaskAnalyticsResponse | null;
  projectAnalyticsResponse?: ProjectAnalyticsResponse | null;
}

export interface GoalTracking {
  employeeId: string;
  name: string;
  goal: string;
  progress: number;
  deadline: string;
  status: 'on-track' | 'behind' | 'completed';
}

// ============= Teams =============
export interface CustomTeam {
  id: string;
  name: string;
  memberIds: string[];
  memberNames: string[];
  createdAt: string;
}

export interface DepartmentHeadcount {
  department: string;
  count: number;
  color: string;
}

// ============= Audit & Logging =============
export interface AuditLog {
  id: number | string;
  timestamp: string;
  level: string; // LOGIN, SECURITY, CREATE, UPDATE, DELETE, ERROR, INFO, WARN
  user: string; // employeeId or username
  role?: string;
  action: string; // LOGIN_SUCCESS, CREATE_EMPLOYEE, FETCH_EMPLOYEES, etc.
  message: string; // Human-readable message
  module: string; // USER, LEAVE, ATTENDANCE, EMPLOYEE_HUB, etc.
  entity: string; // Employee, LeaveRequest, AttendanceRecord, etc.
  entityId?: string | null;
  ipAddress?: string | null;
  serviceName?: string; // user-service, employee-hub-service, etc.
  details?: any; // Extra JSON data
}

// ============= Projects =============
export interface Project {
  /**
   * locally we usually use either a generated id or the projectCode returned by
   * the backend.  When interacting with the API we treat the code as the
   * primary key.
   */
  id: string;

  /** original API field name (optional) */
  projectCode?: string;

  name: string;

  /**
   * status values are fairly loose coming from the server so keep the type as
   * a string.  existing components map a few hard‑coded values, but they can
   * also display whatever comes back.
   */
  status: string;

  /** a percentage for our simple progress bar (not provided by the API)
   *  components default to 0 when the field is missing.
   */
  progress: number;

  description?: string;
  team?: string[];
  startDate?: string;
  endDate?: string;
  dueDate?: string;
  manager?: string;
  client?: string;

  // additional metadata used by the API
  clientId?: number;
  priority?: string;
  budget?: number;
  currency?: string;
  createdBy?: number;
  projectManagerId?: number | string;
}

// ============= Super Admin Navigation =============
export enum AppSection {
  Dashboard = 'Dashboard',
  EmployeeHub = 'EmployeeHub',
  AdminHub = 'AdminHub',
  AdminRequests = 'AdminRequests',
  AuditLogs = 'AuditLogs',
  Payroll = 'Payroll',
  Projects = 'Projects',
  Performance = 'Performance',
  Reviews = 'Reviews',
  Events = 'Events',
  PaymentUpdates = 'PaymentUpdates',
  Notifications = 'Notifications',
  SystemMaintenance = 'SystemMaintenance',
  Documents = 'Documents',
  Profile = 'Profile',
  AttendanceMonitor = 'AttendanceMonitor', // Added for super admin attendance
}

export interface AdminRequest {
  id: string;
  type: 'Leave' | 'Termination' | 'Promotion' | 'Resignation' | 'Admin Leave' | 'Other';
  requestedBy: string;
  requesterId: string;
  targetId: string;
  date: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  details: string;
  metadata?: Record<string, any>;
  dbId?: number | string; // Numeric or string ID from backend database
}
