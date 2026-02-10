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
  { id: 'admin/tasks', label: 'Task Assignment', icon: 'CheckSquare' },
  { id: 'admin/events', label: 'Events Hub', icon: 'CalendarDays' },
  { id: 'admin/notifications', label: 'Notifications', icon: 'Bell' },
  { id: 'admin/payroll', label: 'Payroll Central', icon: 'IndianRupee' },
  { id: 'admin/payslips', label: 'Payslips Module', icon: 'ReceiptText' },
  { id: 'admin/performance', label: 'Reviews Rating', icon: 'Star' },
  { id: 'admin/audit-logs', label: 'Audit Logs', icon: 'Activity' },
  { id: 'admin/profile', label: 'My Profile', icon: 'UserCircle' },
];

// Backwards-compat aliases used by some components
export const PROJECTS = [
  {
    id: 1,
    title: "AI-Powered Analytics Platform",
    category: "Technology",
    description: "Advanced analytics system leveraging machine learning to provide real-time insights and predictive modeling for enterprise clients.",
    image: "https://images.unsplash.com/photo-1676582711019-d63e16e39259?w=800&h=600&fit=crop"
  },
  {
    id: 2,
    title: "Green Energy Grid Integration",
    category: "Sustainability",
    description: "Innovative renewable energy distribution network connecting solar and wind farms with smart grid technology.",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800&h=600&fit=crop"
  },
  {
    id: 3,
    title: "Cloud Infrastructure Suite",
    category: "Infrastructure",
    description: "Comprehensive cloud management platform providing seamless deployment and monitoring across multiple data centers.",
    image: "https://images.unsplash.com/photo-1667185753392-8f5fbaa243de?w=800&h=600&fit=crop"
  },
  {
    id: 4,
    title: "Blockchain Supply Chain",
    category: "Enterprise",
    description: "Decentralized supply chain management system using blockchain technology for complete transparency and traceability.",
    image: "https://images.unsplash.com/photo-1639762681033-cb37b36a1dd1?w=800&h=600&fit=crop"
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
    location: "Bangalore"
  },
  {
    id: 3,
    title: "DevOps Engineer",
    department: "FULL STACK DEVELOPER",
    type: "Full-time",
    description: "Build and maintain scalable infrastructure. Experience with Kubernetes, Docker, and AWS essential.",
    location: "Mumbai"
  },
  {
    id: 4,
    title: "ML/AI Specialist",
    department: "RESEARCH AND DEVELOPMENT",
    type: "Full-time",
    description: "Develop cutting-edge machine learning models for predictive analytics and automation systems.",
    location: "Bangalore"
  }
];
