# Quick Start Guide - Single-App HRMS

## For Developers

### Initial Setup
```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Open browser
# http://localhost:5173
```

### Common Commands
```bash
# Type check
npm run typecheck

# Build for production
npm run build

# Preview built app
npm run preview

# Start optional backend server
npm run server
```

## Testing Credentials

### Admin Login
- **URL**: `http://localhost:5173/#/admin/login`
- **Email**: `admin@hrms.com`
- **Password**: `admin123`

### Employee Login
- **URL**: `http://localhost:5173/#/employee/login`
- **Note**: Create account from registration or use existing users

## Project Layout Quick Reference

| Folder | Purpose |
|--------|---------|
| `src/api/` | API client and endpoints |
| `src/components/` | React components by role |
| `src/pages/` | Page components by role (admin/employee/public) |
| `src/context/` | React context providers |
| `src/routes/` | Route configuration and guards |
| `src/types.ts` | All TypeScript interfaces |
| `src/hooks/` | Custom React hooks |
| `src/utils/` | Utility functions |
| `public/` | Static assets (images, videos) |

## Key Files

| File | Description |
|------|-------------|
| `src/App.tsx` | Main app component with routing |
| `src/index.tsx` | Entry point with HashRouter |
| `src/types.ts` | Consolidated TypeScript types |
| `src/mockData.ts` | Mock data for tests |
| `src/constants.ts` | App-wide constants |
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Vite build config |
| `tailwind.config.js` | Tailwind CSS config |
| `tsconfig.json` | TypeScript config |

## Routing Overview

```
Landing: /
Admin: /admin/* (auth required, admin/manager/auditor role)
Employee: /employee/* (auth required, employee role)
```

## Adding a New Page

1. Create file in `src/pages/{admin|employee}/NewPage.tsx`
2. Import and add route in `src/App.tsx`
3. Add navigation link in layout component
4. Use contexts for data

Example:
```tsx
// src/pages/admin/NewPage.tsx
import React from 'react';
import { useHRMS } from '../../context/HRMSContext';

const NewPage: React.FC = () => {
  const { employees } = useHRMS();
  return <div>{/* your content */}</div>;
};

export default NewPage;
```

## Using Contexts

### Authentication
```tsx
import { useAuth } from '../context/AuthContext';

const MyComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  // use auth data
};
```

### HRMS Data (Admin)
```tsx
import { useHRMS } from '../context/HRMSContext';

const AdminDash = () => {
  const { employees, leaves, payroll } = useHRMS();
  // use admin data
};
```

### Employee Leave Data
```tsx
import { useLeave } from '../context/LeaveContext';

const LeavePanel = () => {
  const { leaveBalance, leaveRequests } = useLeave();
  // use employee-specific leave data
};
```

### Theme
```tsx
import { useTheme } from '../components/ThemeContext';

const MyComponent = () => {
  const { isDark, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>Toggle</button>;
};
```

## Common Components

### Admin Layout
```tsx
import LayoutWrapper from '../components/admin/LayoutWrapper';

// Wrap admin pages with layout
<LayoutWrapper onLogout={handleLogout}>
  <YourPage />
</LayoutWrapper>
```

### Employee Layout
```tsx
import EmployeeLayout from '../components/employee/Layout';

// Wrap employee pages with layout
<EmployeeLayout onLogout={handleLogout}>
  <YourPage />
</EmployeeLayout>
```

## Styling Guide

### Tailwind CSS with CSS Variables
The app uses Tailwind with CSS variables for theming:

```css
/* Light theme */
--bg-primary: #ffffff
--bg-secondary: #f5f5f5
--text-primary: #000000
--text-secondary: #666666
--border-color: #e0e0e0

/* Dark theme */
--bg-primary: #1a1a1a
--bg-secondary: #2d2d2d
--text-primary: #ffffff
--text-secondary: #b0b0b0
--border-color: #404040
```

Use in components:
```tsx
<div className="bg-[var(--bg-primary)] text-[var(--text-primary)]">
  Content
</div>
```

## API Integration

Configure API endpoints in `src/api/apiClient.ts`:

```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:8085';
```

Add new endpoint:
```typescript
// src/api/newModule.ts
export const getNewData = async () => {
  const response = await apiClient.get('/endpoint');
  return response.data;
};
```

## Debugging Tips

1. **Check user is authenticated**: Open DevTools → Application → LocalStorage → look for `HRMS_AUTH_SESSION_V1`
2. **Monitor contexts**: Use React DevTools browser extension
3. **Network errors**: Check browser Network tab for API calls
4. **Type errors**: Run `npm run typecheck` before build
5. **Dark mode issues**: Check CSS variables in DevTools

## Performance Checklist

- [ ] Images optimized and lazy-loaded
- [ ] Unnecessary re-renders minimized (React.memo)
- [ ] Large lists use virtualization
- [ ] Code splitting implemented
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 90

## Common Issues & Solutions

### "useAuth is not a function"
- Ensure `useAuth()` is called inside a component wrapped with `AuthProvider`

### Routes not working
- Check `src/index.tsx` has `<HashRouter>` wrapping `<App />`
- Routes use `#/` in URL (e.g., `http://localhost:5173/#/admin/dashboard`)

### Styles not applying
- Check Tailwind config includes your file path
- Run `npm install` if new Tailwind classes aren't working
- Verify CSS variable fallbacks are set

### Context data undefined
- Ensure provider wraps consumer component in component tree
- Check mock data is initialized (see `mockData.ts`)

## Next Steps

1. Customize branding (logo, colors, fonts)
2. Connect to real backend API
3. Add authentication tokens/cookies
4. Implement WebSocket for notifications
5. Add e2e tests (Cypress, Playwright)
6. Configure CI/CD pipeline
7. Deploy to production

---

**Need Help?** Check `INTEGRATION_GUIDE.md` for detailed documentation.
