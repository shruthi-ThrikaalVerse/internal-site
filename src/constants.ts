export const LOCATIONS = [
  'Bangalore',
  'Mumbai',
  'Hyderabad',
  'Delhi-NCR',
  'Pune',
  'Chennai'
];
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
  'Chennai'
];

export const NAV_ITEMS = [
  { id: 'admin/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  { id: 'admin/adminattendance', label: 'Admin Attendance', icon: 'Clock' },
  { id: 'admin/calendar', label: 'Admin Calendar', icon: 'Calendar' },
  { id: 'admin/employees', label: 'Employee Hub', icon: 'Users' },
  { id: 'admin/documents', label: 'Documents', icon: 'FileText' },
  { id: 'admin/attendance', label: 'Attendance', icon: 'CalendarCheck' },
  { id: 'admin/leave', label: 'Apply Leave', icon: 'PlaneTakeoff' },
  { id: 'admin/leave-requests', label: 'Leave Requests', icon: 'ClipboardList' },
  { id: 'admin/projects', label: 'Projects', icon: 'FolderKanban' },
  { id: 'admin/requests', label: 'Support', icon: 'MessageCircle' },
  { id: 'admin/tasks', label: 'Task Assignment', icon: 'CheckSquare' },
  { id: 'admin/events', label: 'Events Hub', icon: 'CalendarDays' },
  { id: 'admin/notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'admin/payroll', label: 'Payroll Central', icon: 'IndianRupee' },
  { id: 'admin/payslips', label: 'Payslips Module', icon: 'ReceiptText' },
  // { id: 'admin/performance', label: 'Reviews Rating', icon: 'Star' },
  // { id: 'admin/performance-reviews', label: 'Admin Performance', icon: 'CheckCircle2' },
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
  { id: AppSection.AttendanceMonitor, label: 'Attendance Monitor', iconName: 'Calendar' }, // Moved below Requests
  { id: AppSection.AuditLogs, label: 'Audit Logs', iconName: 'AlertCircle' },
  { id: AppSection.Payroll, label: 'Payroll', iconName: 'DollarSign' },
  { id: AppSection.Projects, label: 'Projects', iconName: 'GitBranch' },
  { id: AppSection.Reviews, label: 'Reviews', iconName: 'Star' },
  { id: AppSection.Events, label: 'Events', iconName: 'Calendar' },
  { id: AppSection.PaymentUpdates, label: 'Payments', iconName: 'TrendingUp' },
  { id: AppSection.Notifications, label: 'Notifications', iconName: 'Bell' },
  { id: AppSection.SystemMaintenance, label: 'System', iconName: 'Wrench' },
  { id: AppSection.Documents, label: 'Documents', iconName: 'FileText' },
  { id: AppSection.Profile, label: 'Profile', iconName: 'Users' },
];

export const MOCK_LOGS = [];

export const MOCK_PROJECTS: Project[] = [];

export const MOCK_PERFORMANCE_METRICS = [];

export const MOCK_EMPLOYEES = [];

export const MOCK_ADMINS = [];

export const MOCK_REQUESTS: any[] = [];

export const MOCK_REVIEWS = [];

export const MOCK_PAYMENT_UPDATES = [];

export const MOCK_EVENTS = [];

export const MOCK_NOTIFICATIONS = [];

export const MOCK_PAYROLL = [];