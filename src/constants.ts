import { Project } from './types.js';

export const COLORS = {
  primary: '#3b82f6',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  neutral: '#6b7280',
};

export const DEPARTMENTS = [
  'RESEARCH AND DEVELOPMENT',
  'FULL STACK DEVELOPER',
];

export const TEAMS = [
  'Frontend Squad',
  'Backend Squad',
  'Mobile App Team',
  'Quality Assurance',
  'Cloud Infrastructure',
  'Brand Management',
  'Direct Sales',
  'Recruitment Squad',
  'Employee Experience'
];

export const LOCATIONS = [
  'Bangalore',
  'Mumbai',
  'Hyderabad',
  'Delhi-NCR',
  'Pune',
  'Chennai'
];

export const NAV_ITEMS = [
  { id: 'admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'admin/employees', label: 'Employee Hub', icon: 'Users' },
  { id: 'admin/documents', label: 'Documents', icon: 'FileText' },
  { id: 'admin/attendance', label: 'Attendance', icon: 'CalendarCheck' },
  { id: 'admin/leave', label: 'Leave Requests', icon: 'ClipboardList' },
  { id: 'admin/requests', label: 'Support', icon: 'MessageCircle' },
  { id: 'admin/tasks', label: 'Task Assignment', icon: 'CheckSquare' },
  { id: 'admin/events', label: 'Events Hub', icon: 'CalendarDays' },
  { id: 'admin/notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'admin/payroll', label: 'Payroll Central', icon: 'IndianRupee' },
  { id: 'admin/payslips', label: 'Payslips Module', icon: 'ReceiptText' },
  { id: 'admin/performance', label: 'Reviews Rating', icon: 'Star' },
  { id: 'admin/audit-logs', label: 'Audit Logs', icon: 'Activity' },
  { id: 'admin/resignation', label: 'Resignation', icon: 'LogOut' },
  { id: 'admin/profile', label: 'My Profile', icon: 'UserCircle' },

];

// Backwards-compat aliases used by some components
// src/constants.js

export const PROJECTS = [
  {
    id: 1,
    title: "Givget",
    category: "Online Marketplace",
    image:
      "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=1200&auto=format&fit=crop",
    description:
      "An online marketplace platform enabling users to buy, sell, and exchange products seamlessly with secure communication features."
  },

  {
    id: 2,
    title: "Prabhas Cine Universe",
    category: "Cinema & OTT Ecosystem",
    image: "https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?q=80&w=1200&auto=format&fit=crop",

    description:
      "A premium cinematic ecosystem offering film education, OTT services, industry union systems, and movie performance analytics."
  },
  {
    id: 3,
    title: "AI Support Bot",
    category: "Artificial Intelligence",
    image:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=1200&auto=format&fit=crop",
    description:
      "An AI-powered chatbot built using Django and modern APIs to automate customer support with intelligent responses."
  },
  {
    id: 4,
    title: "HRMS Dashboard",
    category: "Enterprise Software",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1200&auto=format&fit=crop",
    description:
      "A complete HR management system with employee tracking, payroll management, and attendance monitoring."
  }
];


export const TEAM = [
  {
    id: 1,
    name: "Vagya Naik Bhukya",
    role: "Founder & Chairperson",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Visionary leader with 20+ years of experience in technology and sustainable innovation."
  },
  {
    id: 2,
    name: "Rajesh Kumar",
    role: "Chief Technology Officer",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Tech architect driving innovation and digital transformation across our organization."
  },
  {
    id: 3,
    name: "Priya Singh",
    role: "VP Operations",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Strategic operations leader ensuring excellence in execution and stakeholder satisfaction."
  },
  {
    id: 4,
    name: "Amit Patel",
    role: "Head of Innovation",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&h=400&auto=format&fit=crop",
    bio: "Innovation champion fostering breakthrough solutions and research initiatives."
  }
];

export const JOBS = [
  {
    id: 1,
    title: "Senior Full Stack Developer",
    department: "FULL STACK DEVELOPER",
    type: "Full-time",
    description: "We're seeking an experienced full-stack developer to lead our technology initiatives. Expertise in React, Node.js, and cloud services required.",
    location: "Hyderabad"
  },
  {
    id: 2,
    title: "Research Scientist",
    department: "RESEARCH AND DEVELOPMENT",
    type: "Full-time",
    description: "Join our R&D team to pioneer next-generation technologies in AI and sustainable computing solutions.",
    location: "Hyderabad"
  },
  {
    id: 3,
    title: "DevOps Engineer",
    department: "FULL STACK DEVELOPER",
    type: "Full-time",
    description: "Build and maintain scalable infrastructure. Experience with Kubernetes, Docker, and AWS essential.",
    location: "Hyderabad"
  },
  {
    id: 4,
    title: "ML/AI Specialist",
    department: "RESEARCH AND DEVELOPMENT",
    type: "Full-time",
    description: "Develop cutting-edge machine learning models for predictive analytics and automation systems.",
    location: "Hyderabad"
  }
];
// ============= Super Admin Constants =============
import { AppSection } from './types.js';

export const NAVIGATION_ITEMS = [
  { id: AppSection.Dashboard, label: 'Dashboard', iconName: 'LayoutDashboard' },
  { id: AppSection.EmployeeHub, label: 'Employees', iconName: 'Users' },
  { id: AppSection.AdminHub, label: 'Admin Hub', iconName: 'Settings' },
  { id: AppSection.AdminRequests, label: 'Requests', iconName: 'FileText' },
  { id: AppSection.AuditLogs, label: 'Audit Logs', iconName: 'AlertCircle' },
  { id: AppSection.Payroll, label: 'Payroll', iconName: 'DollarSign' },
  { id: AppSection.Projects, label: 'Projects', iconName: 'GitBranch' },
  { id: AppSection.Performance, label: 'Performance', iconName: 'BarChart3' },
  { id: AppSection.Reviews, label: 'Reviews', iconName: 'Star' },
  { id: AppSection.Events, label: 'Events', iconName: 'Calendar' },
  { id: AppSection.PaymentUpdates, label: 'Payments', iconName: 'TrendingUp' },
  { id: AppSection.Notifications, label: 'Notifications', iconName: 'Bell' },
  { id: AppSection.SystemMaintenance, label: 'System', iconName: 'Wrench' },
  { id: AppSection.Profile, label: 'Profile', iconName: 'Users' },
];

export const MOCK_LOGS = [
  { id: '1', action: 'LOGIN_SUCCESS', timestamp: '2024-01-15 09:30 AM', user: 'admin@company.com', level: 'LOGIN', message: 'User login successful', module: 'AUTH', entity: 'User' },
  { id: '2', action: 'CREATE_EMPLOYEE', timestamp: '2024-01-15 10:15 AM', user: 'admin@company.com', level: 'CREATE', message: 'New employee record created', module: 'EMPLOYEE_HUB', entity: 'Employee' },
  { id: '3', action: 'UPDATE_LEAVE', timestamp: '2024-01-15 11:00 AM', user: 'manager@company.com', level: 'UPDATE', message: 'Leave request status updated to approved', module: 'LEAVE', entity: 'LeaveRequest' },
  { id: '4', action: 'GENERATE_PAYROLL', timestamp: '2024-01-15 02:30 PM', user: 'payroll@company.com', level: 'CREATE', message: 'Payroll processing completed', module: 'PAYROLL', entity: 'PayrollRun' },
  { id: '5', action: 'EXPORT_REPORT', timestamp: '2024-01-15 03:45 PM', user: 'admin@company.com', level: 'INFO', message: 'System report exported to CSV format', module: 'REPORTS', entity: 'Report' },
];

export const MOCK_PROJECTS: Project[] = [
  { id: '1', name: 'HRMS Platform', status: 'in-progress', progress: 75, client: 'Internal', dueDate: '2024-03-15', team: ['John Doe', 'Jane Smith', 'Bob Wilson', 'Alice Brown', 'Charlie Davis'] },
  { id: '2', name: 'Mobile App Dev', status: 'in-progress', progress: 60, client: 'Tech Corp', dueDate: '2024-02-28', team: ['Jane Smith', 'Bob Wilson', 'Alice Brown'] },
  { id: '3', name: 'Analytics Dashboard', status: 'completed', progress: 100, client: 'Acme Inc', dueDate: '2024-01-10', team: ['John Doe', 'Charlie Davis', 'Alice Brown'] },
  { id: '4', name: 'AI Integration', status: 'delayed', progress: 45, client: 'Innovation Lab', dueDate: '2024-01-31', team: ['Bob Wilson', 'John Doe'] },
  { id: '5', name: 'Security Upgrade', status: 'in-progress', progress: 80, client: 'Internal', dueDate: '2024-02-15', team: ['Jane Smith', 'Alice Brown', 'Charlie Davis', 'Bob Wilson', 'John Doe'] },
];

export const MOCK_PERFORMANCE_METRICS = [
  { name: 'Employee Satisfaction', value: 94, trend: 'up' },
  { name: 'Attendance Rate', value: 96, trend: 'up' },
  { name: 'productivity Index', value: 88, trend: 'stable' },
];

export const MOCK_EMPLOYEES = [
  { id: 'emp-01', name: 'John Doe', email: 'john@company.com', role: 'Employee', avatar: 'https://picsum.photos/seed/emp1/200', status: 'active', designation: 'Senior Developer', department: 'Engineering' },
  { id: 'emp-02', name: 'Jane Smith', email: 'jane@company.com', role: 'Employee', avatar: 'https://picsum.photos/seed/emp2/200', status: 'active', designation: 'Product Manager', department: 'Product' },
  { id: 'emp-03', name: 'Bob Wilson', email: 'bob@company.com', role: 'Employee', avatar: 'https://picsum.photos/seed/emp3/200', status: 'active', designation: 'Designer', department: 'Design' },
  { id: 'emp-04', name: 'Alice Brown', email: 'alice@company.com', role: 'Employee', avatar: 'https://picsum.photos/seed/emp4/200', status: 'active', designation: 'Data Analyst', department: 'Analytics' },
  { id: 'emp-05', name: 'Charlie Davis', email: 'charlie@company.com', role: 'Employee', avatar: 'https://picsum.photos/seed/emp5/200', status: 'inactive', designation: 'QA Engineer', department: 'Quality' },
];

export const MOCK_ADMINS = [
  { id: 'admin-01', name: 'Admin One', firstName: 'Admin', lastName: 'One', email: 'admin1@company.com', role: 'ADMIN', avatar: 'https://picsum.photos/seed/admin1/200', status: 'active' },
  { id: 'admin-02', name: 'Admin Two', firstName: 'Admin', lastName: 'Two', email: 'admin2@company.com', role: 'ADMIN', avatar: 'https://picsum.photos/seed/admin2/200', status: 'active' },
];

export const MOCK_REQUESTS: any[] = [];

export const MOCK_REVIEWS = [
  { id: 'rev-01', employeeName: 'John Doe', rating: 4.5, feedback: 'Excellent performance and leadership', date: '2024-01-10', reviewerName: 'Sarah Manager', status: 'completed', cycle: 'Q4 2023' },
  { id: 'rev-02', employeeName: 'Jane Smith', rating: 4.8, feedback: 'Outstanding contribution to projects', date: '2024-01-12', reviewerName: 'Mike Director', status: 'completed', cycle: 'Q4 2023' },
  { id: 'rev-03', employeeName: 'Bob Wilson', rating: 4.2, feedback: 'Good team collaboration', date: '2024-01-15', reviewerName: 'Sarah Manager', status: 'pending', cycle: 'Q4 2023' },
];

export const MOCK_PAYMENT_UPDATES = [
  { id: 'pay-01', employeeName: 'John Doe', amount: '$5,000', status: 'approved', date: '2024-01-15', updateType: 'salary', details: 'Monthly salary processed successfully' },
  { id: 'pay-02', employeeName: 'Jane Smith', amount: '$4,800', status: 'approved', date: '2024-01-14', updateType: 'bonus', details: 'Q4 performance bonus' },
  { id: 'pay-03', employeeName: 'Bob Wilson', amount: '$4,200', status: 'pending', date: '2024-01-13', updateType: 'salary', details: 'Monthly salary pending verification' },
];

export const MOCK_EVENTS = [
  { id: 'evt-01', title: 'Team Meeting', type: 'meeting', date: '2024-02-20', participants: 25, attendees: 23, time: '10:00 AM' },
  { id: 'evt-02', title: 'Company Retreat', type: 'celebration', date: '2024-03-15', participants: 150, attendees: 142, time: '09:00 AM' },
  { id: 'evt-03', title: 'Training Session', type: 'training', date: '2024-02-25', participants: 40, attendees: 38, time: '02:00 PM' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'ntf-01', title: 'System Update', message: 'New payroll features available', date: '2024-01-15', priority: 'medium', status: 'sent', recipient: 'All Admins' },
  { id: 'ntf-02', title: 'Review Reminder', message: 'Performance reviews due this week', date: '2024-01-14', priority: 'high', status: 'sent', recipient: 'Department Heads' },
  { id: 'ntf-03', title: 'Leave Approval', message: 'Your leave request has been approved', date: '2024-01-13', priority: 'low', status: 'sent', recipient: 'emp-01' },
];

export const MOCK_PAYROLL = [
  { id: 'payroll-rec-01', employeeName: 'John Doe', amount: 5000, date: '2024-01-15', method: 'Bank Transfer', status: 'processed' },
  { id: 'payroll-rec-02', employeeName: 'Jane Smith', amount: 4800, date: '2024-01-15', method: 'Bank Transfer', status: 'processed' },
  { id: 'payroll-rec-03', employeeName: 'Bob Wilson', amount: 4200, date: '2024-01-15', method: 'Bank Transfer', status: 'processed' },
  { id: 'payroll-rec-04', employeeName: 'Alice Brown', amount: 5200, date: '2024-01-15', method: 'Bank Transfer', status: 'processed' },
  { id: 'payroll-rec-05', employeeName: 'Charlie Davis', amount: 3800, date: '2024-01-15', method: 'Bank Transfer', status: 'processed' },
];