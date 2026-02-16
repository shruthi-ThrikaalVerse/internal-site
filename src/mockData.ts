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
} from './types.ts';

const INDIAN_NAMES = [
  "Rajesh Kumar", "Priya Sharma", "Amit Patel", "Sneha Reddy", "Vikram Singh",
  "Ananya Iyer", "Siddharth Verma", "Kavita Nair", "Arjun Gupta", "Deepika Padukone",
  "Rohan Joshi", "Shweta Tiwari", "Rahul Malhotra", "Meera Deshmukh", "Suresh Prabhu",
  "Pooja Hegde", "Manoj Bajpayee", "Nisha Aggarwal", "Sanjay Dutt", "Ritu Karidhal"
];

export const mockDashboardStats: DashboardStats = {
  totalEmployees: 450,
  activeEmployees: 432,
  presentToday: 398,
  absentToday: 12,
  lateToday: 8,
  onLeaveToday: 14,
  pendingApprovals: 24,
  openPositions: 8,
  payrollDueDate: '2024-05-31'
};

export const mockActivities: RecentActivity[] = [
  { id: '1', type: 'checkin', employeeName: 'Rajesh Kumar', time: '09:05 AM', details: 'Checked in via Mobile App' },
  { id: '2', type: 'leave', employeeName: 'Priya Sharma', time: '10:15 AM', details: 'Applied for Sick Leave' },
  { id: '3', type: 'document', employeeName: 'Amit Patel', time: '11:30 AM', details: 'Uploaded PAN Card for verification' },
  { id: '4', type: 'update', employeeName: 'Sneha Reddy', time: '01:45 PM', details: 'Updated bank account details' },
  { id: '5', type: 'checkout', employeeName: 'Vikram Singh', time: '05:30 PM', details: 'Checked out from Office' },
];

export const mockPendingApprovals: PendingApproval[] = [
  { id: 'ap1', type: 'leave', employeeName: 'Ananya Iyer', details: 'Casual Leave (2 days)', date: '2024-05-15', status: 'pending' },
  { id: 'ap2', type: 'expense', employeeName: 'Siddharth Verma', details: 'Client Dinner Reimbursment (₹2,500)', date: '2024-05-14', status: 'pending' },
  { id: 'ap3', type: 'overtime', employeeName: 'Kavita Nair', details: 'Night Shift Bonus (4 hrs)', date: '2024-05-13', status: 'pending' },
];

export const mockDepartmentHeadcount: DepartmentHeadcount[] = [
  { department: 'Engineering', count: 120, color: '#3b82f6' },
  { department: 'Sales', count: 85, color: '#22c55e' },
  { department: 'Marketing', count: 60, color: '#f59e0b' },
  { department: 'Finance', count: 40, color: '#ef4444' },
  { department: 'Operations', count: 145, color: '#8b5cf6' },
];

export const mockEmployees: EmployeeSummary[] = INDIAN_NAMES.map((name, index) => {
  const departments = ['Engineering', 'Finance', 'Sales', 'Marketing', 'Human Resources'];
  const locations = ['Bangalore', 'Mumbai', 'Hyderabad', 'Pune'];
  const designations = ['Software Engineer', 'Senior Manager', 'Sales Representative', 'HR Specialist', 'Financial Analyst'];
  
  const documents: EmployeeDocument[] = [
    { type: 'Aadhaar Card', status: index % 2 === 0 ? 'verified' : 'uploaded', fileName: `aadhaar_${index + 1}.pdf`, uploadedDate: '2024-01-10' },
    { type: 'PAN Card', status: index % 3 === 0 ? 'verified' : 'uploaded', fileName: `pan_card_${index + 1}.pdf`, uploadedDate: '2024-01-12' },
  ];

  if (index % 4 === 0) {
    documents.push({ type: 'Educational Certificate', status: 'verified', fileName: 'degree_certificate.pdf', uploadedDate: '2024-01-15' });
  }
  
  if (index % 5 === 0) {
    documents.push({ type: 'Offer Letter', status: 'verified', fileName: 'offer_letter_signed.pdf', uploadedDate: '2024-01-05' });
  }

  return {
    id: `emp-${index + 1}`,
    employeeId: `EMP-${(index + 1).toString().padStart(3, '0')}`,
    fullName: name,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`,
    designation: designations[index % designations.length],
    department: departments[index % departments.length],
    email: `${name.toLowerCase().replace(' ', '.')}@company.com`,
    password: `Pass@${(index + 1).toString().padStart(3, '0')}`,
    phone: `+91 ${Math.floor(7000000000 + Math.random() * 2999999999)}`,
    status: index === 19 ? 'probation' : 'active',
    dateOfJoining: `202${Math.floor(Math.random() * 4)}-0${Math.floor(Math.random() * 9 + 1)}-15`,
    reportingManager: INDIAN_NAMES[(index + 5) % INDIAN_NAMES.length],
    location: locations[index % locations.length],
    tags: index % 3 === 0 ? ['High Potential'] : index % 4 === 0 ? ['Remote'] : [],
    leaveBalance: Math.floor(Math.random() * 15) + 5,
    documents,
    salaryStructure: {
      basic: 45000 + (index * 1500),
      hra: 18000,
      da: 4500,
      specialAllowance: 7500,
      pf: 1800,
      esi: 550,
      professionalTax: 200,
      tds: 1500
    },
    bankDetails: {
      bankName: 'HDFC Bank',
      accountNumber: `50100${Math.floor(10000000 + Math.random() * 90000000)}`,
      ifsc: 'HDFC0001234'
    }
  };
});

export const mockAttendanceRecords: AttendanceRecord[] = mockEmployees.slice(0, 15).map((emp, idx) => ({
  employeeId: emp.employeeId,
  name: emp.fullName,
  date: '2024-05-15',
  checkIn: idx % 3 === 0 ? '09:45 AM' : '09:15 AM',
  checkOut: '06:30 PM',
  totalHours: '09:15',
  status: idx % 3 === 0 ? 'late' : 'present',
  location: emp.location
}));

export const mockLeaveRequests: LeaveRequest[] = [
  {
    id: 'lr1',
    employeeId: 'emp-6',
    employeeName: 'Ananya Iyer',
    leaveType: 'casual',
    startDate: '2024-05-15',
    endDate: '2024-05-16',
    days: 2,
    reason: 'Family function in hometown',
    status: 'approved',
    appliedDate: '2024-05-15'
  },
  {
    id: 'lr2',
    employeeId: 'emp-8',
    employeeName: 'Kavita Nair',
    leaveType: 'sick',
    startDate: '2024-05-14',
    endDate: '2024-05-15',
    days: 1,
    reason: 'Viral fever',
    status: 'approved',
    appliedDate: '2024-05-13'
  },
  {
    id: 'lr3',
    employeeId: 'emp-10',
    employeeName: 'Rohan Joshi',
    leaveType: 'annual',
    startDate: '2024-06-01',
    endDate: '2024-06-10',
    days: 10,
    reason: 'Summer vacation with family',
    status: 'pending',
    appliedDate: '2024-05-12'
  }
];

export const mockPerformanceCycles: PerformanceCycle[] = [
  { 
    id: 'pc-1', 
    name: 'Annual Review 2024', 
    period: 'Jan - Dec 2024', 
    status: 'active', 
    participants: 20, 
    completed: 12 
  },
  { 
    id: 'pc-2', 
    name: 'Mid-Year Sync 2023', 
    period: 'Jan - Jun 2023', 
    status: 'completed', 
    participants: 18, 
    completed: 18 
  }
];

export const mockPayrollRuns: PayrollRun[] = [
  { id: 'p1', month: 'April', year: 2024, status: 'completed', totalEmployees: 450, totalAmount: 32500000, processedDate: '2024-04-30' },
  { id: 'p2', month: 'March', year: 2024, status: 'completed', totalEmployees: 445, totalAmount: 31800000, processedDate: '2024-03-31' },
  { id: 'p3', month: 'February', year: 2024, status: 'completed', totalEmployees: 440, totalAmount: 31200000, processedDate: '2024-02-28' },
];

export const mockGoals: GoalTracking[] = mockEmployees.slice(0, 5).map(emp => ({
  employeeId: emp.employeeId,
  name: emp.fullName,
  goal: 'Implement new microservice for payroll',
  progress: 75,
  deadline: '2024-06-30',
  status: 'on-track'
}));

export const mockAuditLogs: AuditLog[] = [
  { id: 'log1', timestamp: '2024-05-15 10:30:00', level: 'INFO', user: 'Admin User', action: 'Update', message: 'Updated employee salary', module: 'Employee', entity: 'Employee', details: 'Updated salary for EMP-001', ipAddress: '192.168.1.1' },
  { id: 'log2', timestamp: '2024-05-15 11:15:00', level: 'INFO', user: 'Admin User', action: 'Create', message: 'Created payroll run', module: 'Payroll', entity: 'Payroll', details: 'Started May 2024 payroll run', ipAddress: '192.168.1.1' },
];