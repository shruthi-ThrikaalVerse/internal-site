# Single-App HRMS Platform

A unified Human Resource Management System that integrates both Admin and Employee modules into a single React application with role-based access control.

## Project Structure

```
user_panel/
├── src/
│   ├── api/                 # Unified API layer
│   │   ├── auth.ts
│   │   ├── admin.ts
│   │   ├── employee.ts
│   │   ├── audit.ts
│   │   └── apiClient.ts
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout/      # Shared layout components
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── LayoutWrapper.tsx
│   │   │   │   └── Navbar.tsx
│   │   │   └── UI/          # Landing page components
│   │   │       ├── Icon.tsx
│   │   │       ├── GlobalSearch.tsx
│   │   │       ├── NotificationToast.tsx
│   │   │       ├── Hero3D.tsx
│   │   │       ├── About.tsx
│   │   │       ├── Projects.tsx
│   │   │       ├── Team.tsx
│   │   │       ├── Media.tsx
│   │   │       ├── Contact.tsx
│   │   │       ├── career.tsx
│   │   │       └── ScrollToTop.tsx
│   │   ├── admin/           # Admin-specific components
│   │   │   ├── LayoutWrapper.tsx
│   │   │   ├── RouteGuards.tsx
│   │   │   └── ... (admin headers, sidebars)
│   │   └── employee/        # Employee-specific components
│   │       ├── Layout.tsx
│   │       └── ... (employee headers, sidebars)
│   ├── context/             # Unified context providers
│   │   ├── AuthContext.tsx       # Authentication (admin/manager/auditor)
│   │   ├── HRMSContext.tsx       # Admin HRMS data management
│   │   ├── LeaveContext.tsx      # Employee leave management
│   │   └── ThemeContext.tsx      # Theme switching (light/dark)
│   ├── pages/
│   │   ├── admin/           # Admin pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── EmployeeHub.tsx
│   │   │   ├── AttendanceMonitor.tsx
│   │   │   ├── LeaveCenter.tsx
│   │   │   ├── PayrollProcessing.tsx
│   │   │   ├── PerformanceManagement.tsx
│   │   │   ├── EventsAdmin.tsx
│   │   │   ├── NotificationsAdmin.tsx
│   │   │   ├── PayslipsAdmin.tsx
│   │   │   ├── DocumentManagement.tsx
│   │   │   ├── AuditLogs.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── employee/        # Employee pages
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Attendance.tsx
│   │   │   ├── Leave.tsx
│   │   │   ├── Payroll.tsx
│   │   │   ├── Performance.tsx
│   │   │   ├── Documents.tsx
│   │   │   ├── Events.tsx
│   │   │   ├── Notifications.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── Tasks.tsx
│   │   │   ├── Calendar.tsx
│   │   │   ├── Requests.tsx
│   │   │   └── Login.tsx
│   │   ├── public/          # Public landing pages
│   │   │   └── HomePage.tsx (rendered as landing page)
│   │   └── shared/          # Shared pages
│   │       ├── Settings.tsx
│   │       └── NotFound.tsx
│   ├── routes/              # Route configuration
│   │   ├── index.tsx
│   │   ├── ProtectedRoutes.tsx
│   │   ├── AdminRoutes.tsx
│   │   ├── EmployeeRoutes.tsx
│   │   └── RouteGuards.tsx
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useRole.ts
│   │   └── usePermissions.ts
│   ├── utils/               # Utility functions
│   │   ├── storage.ts
│   │   ├── validators.ts
│   │   └── helpers.ts
│   ├── types.ts             # Consolidated TypeScript types
│   ├── constants.ts         # Application constants
│   ├── mockData.ts          # Mock data for development
│   ├── App.tsx              # Main App component with routing
│   ├── index.tsx            # Entry point with HashRouter
│   ├── index.css            # Tailwind CSS and global styles
│   └── vite-env.d.ts        # Vite environment types
├── public/
│   ├── company_logo.png
│   ├── 3D_logo.png
│   ├── profile_icon.jpg
│   ├── favicon.ico
│   ├── metadata.json
│   └── videos/
│       └── thrikaal_video.mp4
├── server/
│   └── index.js             # Optional backend server
├── package.json             # Unified dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind CSS config
├── postcss.config.js        # PostCSS config
├── tsconfig.json            # TypeScript config
├── index.html               # Main HTML file
└── README.md                # This file
```

## Key Features

### Authentication & Authorization
- **Dual Login System**: Separate login paths for Admin and Employee roles
- **Role-Based Access Control**: Protected routes based on user role (admin, manager, auditor, employee)
- **Session Management**: LocalStorage-based authentication with automatic logout
- **Auth Contexts**: `AuthContext` for login/logout, `HRMSContext` for admin data

### Admin Module
- **Dashboard**: Overview of key metrics and statistics
- **Employee Hub**: Manage employees, view profiles, onboarding
- **Attendance Monitoring**: Track attendance, generate reports
- **Leave Center**: Approve/reject leave requests
- **Payroll Processing**: Manage payroll cycles and salaries
- **Performance Management**: Performance cycles and evaluations
- **Event Management**: Create and manage company events
- **Audit Logs**: Track all system activities
- **Document Management**: Manage employee documents
- **Notifications**: System-wide notifications

### Employee Module
- **Dashboard**: Personal overview and quick stats
- **Attendance**: View attendance records and mark attendance
- **Leave Management**: Apply for leave, check balance
- **Calendar**: View company calendar and events
- **Payroll**: View payslips and salary information
- **Performance**: View performance reviews and goals
- **Tasks**: Manage assigned tasks
- **Documents**: Access personal documents
- **Notifications**: Receive notifications
- **Events**: RSVP to company events

### Landing Page
- **Responsive Design**: Mobile-friendly landing page
- **3D Hero Section**: Animated hero with Three.js
- **About Section**: Company information
- **Projects Showcase**: Portfolio display
- **Team Section**: Team member profiles
- **Media Gallery**: Image and video gallery
- **Career Section**: Job opportunities
- **Contact Form**: Email contact (via EmailJS)

## Technology Stack

### Frontend
- **React 19.2.3**: UI framework
- **TypeScript 5.8**: Type-safe JavaScript
- **Vite 6.2**: Fast build tool
- **React Router 7.12**: Client-side routing
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Framer Motion 10.18**: Animation library
- **Three.js 0.162**: 3D graphics
- **Lucide React 0.562**: Icon library
- **Recharts 3.7**: Charts and data visualization
- **React Toastify 11.0.5**: Toast notifications
- **React ChartJS 2 5.3.1**: Chart.js integration

### Backend (Optional)
- **Express.js 4.18.2**: Web server
- **CORS 2.8.5**: Handle cross-origin requests
- **Helmet 7.0.0**: Security headers
- **Rate Limiting**: Protect against abuse
- **UUID 9.0.0**: Generate unique IDs

### Development Tools
- **ESLint**: Code linting
- **TypeScript**: Type checking
- **Autoprefixer**: CSS vendor prefixes
- **PostCSS**: CSS processing

## Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user_panel
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:5173`

4. **Build for production**
   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## Usage

### Landing Page
- Visit `http://localhost:5173/` (when not authenticated)
- Navigate through sections: Home, About, Projects, Team, Media, Career, Contact
- Click "Login as Employee" or "Login as Admin" to access the dashboard

### Admin Login
- Navigate to `http://localhost:5173/#/admin/login`
- **Test credentials**: 
  - Email: `admin@hrms.com`
  - Password: `admin123`
- Access to: Dashboard, Employees, Attendance, Leave, Payroll, Performance, Events, Audit Logs

### Employee Login
- Navigate to `http://localhost:5173/#/employee/login`
- Access to: Dashboard, Attendance, Leave, Calendar, Documents, Tasks, Events, Performance, Notifications

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_URL=http://localhost:8085
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

## Configuration Files

### vite.config.ts
- Configured for React with Fast Refresh
- CSS modules enabled
- Tailwind CSS support

### tailwind.config.js
- CSS variables for theming
- Dark mode support
- Extended color palette
- Custom animations

### tsconfig.json
- Target: ES2020
- Module resolution: bundler
- Lib: ES2020, DOM, DOM.Iterable
- JSX: react-jsx

## Routing Architecture

The app uses **HashRouter** for client-side routing:

```
/                          → Landing page (public)
/admin/login               → Admin login
/admin/register            → Admin registration
/admin/dashboard           → Admin dashboard (protected)
/admin/employees           → Employee management
/admin/attendance          → Attendance monitoring
/admin/leave               → Leave management
/admin/payroll             → Payroll processing
/admin/performance         → Performance management
/admin/events              → Event management
/admin/audit-logs          → Audit logs
/admin/profile             → Admin profile

/employee/login            → Employee login
/employee/dashboard        → Employee dashboard (protected)
/employee/attendance       → Attendance view
/employee/leave            → Leave requests
/employee/calendar         → Calendar view
/employee/documents        → Personal documents
/employee/tasks            → Task list
/employee/events           → Events
/employee/profile          → Profile
```

## Context Providers

### AuthContext
Manages user authentication and session

```typescript
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name, email, role, password) => Promise<void>;
  logout: () => void;
  updateAvatar: (avatarUrl: string) => void;
}
```

### HRMSContext
Manages admin HRMS data (employees, leaves, payroll, etc.)

### LeaveContext
Manages employee leave requests and balance

### ThemeContext
Manages light/dark theme switching

## Type Definitions

All types are consolidated in `src/types.ts`:
- User, Employee, Dashboard statistics
- Leave, Attendance, Tasks, Events
- Payroll, Performance, Goals
- Audit logs, Notifications

## API Integration

API endpoints are configured in `src/api/`:
- `apiClient.ts`: Base API client setup
- `auth.ts`: Authentication endpoints
- `admin.ts`: Admin HRMS endpoints
- `employee.ts`: Employee portal endpoints
- `audit.ts`: Audit log endpoints

## Development Notes

- **Mock Data**: Development uses `mockData.ts` for demo purposes
- **LocalStorage**: Authentication state persists across sessions
- **Responsive**: Designed for desktop and tablet views
- **Dark Mode**: Toggle theme from navbar
- **Real-time**: WebSocket support can be added for notifications

## Performance Optimizations

- Code splitting with React.lazy()
- Memoization with React.memo
- Lazy loading images
- Optimized bundle size
- CSS-in-JS with Tailwind (tree-shaking)

## Browser Support

- Chrome/Edge: Latest
- Firefox: Latest
- Safari: Latest 12+
- Mobile browsers: iOS Safari, Chrome Mobile

## Troubleshooting

### Port 5173 already in use
```bash
npm run dev --port 3000
```

### Clear cache
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm run typecheck
```

## Contributing

1. Create a feature branch
2. Make changes
3. Test thoroughly
4. Submit pull request

## License

ISC

---

**Created**: February 2026  
**Version**: 1.0.0  
**Maintainer**: Thrikaal Team
