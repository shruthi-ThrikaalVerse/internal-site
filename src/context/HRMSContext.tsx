import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import {
  EmployeeSummary,
  LeaveRequest,
  LeaveStatus,
  RecentActivity,
  DashboardStats,
  PayrollRun,
  GoalTracking,
  AuditLog,
  Notification,
  AttendanceRecord,
  PerformanceCycle,
  PayslipData,
  SalaryStructure,
  Task,
  CustomTeam,
  AdminNotification,
  AppEvent,
  ParticipationStatus
} from '../types.ts';
import {
  mockEmployees as initialEmployees,
  mockLeaveRequests as initialLeaves,
  mockActivities as initialActivities,
  mockDashboardStats as initialStats,
  mockPayrollRuns as initialPayroll,
  mockGoals as initialGoals,
  mockAuditLogs as initialLogs,
  mockAttendanceRecords as initialAttendance,
  mockPerformanceCycles as initialPerformanceCycles
} from '../mockData.ts';

// Add ProfilePhoto interface
interface ProfilePhoto {
  userId: string;
  photoUrl: string;
  uploadedAt: string;
}

interface HRMSContextType {
  employees: EmployeeSummary[];
  leaves: LeaveRequest[];
  activities: RecentActivity[];
  attendance: AttendanceRecord[];
  stats: DashboardStats;
  payroll: PayrollRun[];
  goals: GoalTracking[];
  performanceCycles: PerformanceCycle[];
  logs: AuditLog[];
  payslips: PayslipData[];
  tasks: Task[];
  taskReviews: any[];
  customTeams: CustomTeam[];
  adminNotifications: AdminNotification[];
  events: AppEvent[];
  notifications: Notification[];
  profilePhotos: ProfilePhoto[];
  globalSearchTerm: string;
  setGlobalSearchTerm: (val: string) => void;
  addEmployee: (emp: Partial<EmployeeSummary>) => void;
  updateEmployee: (id: string, updates: Partial<EmployeeSummary>) => void;
  deleteEmployee: (id: string) => void;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected' | 'pending') => void;
  runPayroll: (month: string, year: number) => void;
  updateSalaryStructure: (id: string, structure: SalaryStructure) => void;
  addPerformanceCycle: (cycle: Partial<PerformanceCycle>) => void;
  addTask: (task: Partial<Task>) => void;
  addTaskReview: (review: any) => void;
  updateTaskStatus: (id: string, status: Task['status']) => void;
  deleteTask: (id: string) => void;
  addCustomTeam: (team: Partial<CustomTeam>) => void;
  updateCustomTeam: (id: string, updates: Partial<CustomTeam>) => void;
  deleteCustomTeam: (id: string) => void;
  addAdminNotification: (notif: Partial<AdminNotification>) => void;
  updateAdminNotification: (id: string, updates: Partial<AdminNotification>) => void;
  deleteAdminNotification: (id: string) => void;
  markNotificationAsRead: (id: string, userEmail: string) => void;
  addEvent: (event: Partial<AppEvent>) => void;
  updateEvent: (id: string, updates: Partial<AppEvent>) => void;
  deleteEvent: (id: string) => void;
  toggleEventParticipation: (eventId: string, email: string, status: ParticipationStatus) => void;
  addPayslip: (ps: Partial<PayslipData>) => void;
  updatePayslip: (id: string, updates: Partial<PayslipData>) => void;
  deletePayslip: (id: string) => void;
  addLog: (action: string, module: string, details: string) => void;
  notify: (message: string, type?: 'info' | 'success' | 'warning' | 'error') => void;
  dismissNotification: (id: string) => void;
  updateProfilePhoto: (userId: string, photoUrl: string) => void;
  removeProfilePhoto: (userId: string) => void;
  getProfilePhoto: (userId: string) => string | null;
}

const HRMSContext = createContext<HRMSContextType | undefined>(undefined);

const STORAGE_KEY = 'HRMS_PRO_DATA_V2';

export const HRMSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const loadData = () => {
    const defaults = {
      employees: initialEmployees || [],
      leaves: initialLeaves || [],
      activities: initialActivities || [],
      attendance: initialAttendance || [],
      stats: initialStats,
      payroll: initialPayroll || [],
      goals: initialGoals || [],
      performanceCycles: initialPerformanceCycles || [],
      logs: initialLogs || [],
      payslips: [
        {
          id: 'ps-1',
          employeeId: 'EMP-001',
          name: 'Rajesh Kumar',
          month: 'April',
          year: 2024,
          basic: 45000,
          allowances: 18000,
          deductions: 5000,
          netPay: 58000,
          grossSalary: 63000,
          lop: 0,
          status: 'sent',
          remarks: 'Regular payroll',
          attendanceSummary: { present: 22, absent: 0, totalDays: 22 }
        }
      ],
      tasks: [],
      customTeams: [],
      adminNotifications: [],
      events: [],
      profilePhotos: []
    };

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          employees: Array.isArray(parsed.employees) ? parsed.employees : defaults.employees,
          leaves: Array.isArray(parsed.leaves) ? parsed.leaves : defaults.leaves,
          activities: Array.isArray(parsed.activities) ? parsed.activities : defaults.activities,
          attendance: Array.isArray(parsed.attendance) ? parsed.attendance : defaults.attendance,
          stats: parsed.stats || defaults.stats,
          payroll: Array.isArray(parsed.payroll) ? parsed.payroll : defaults.payroll,
          goals: Array.isArray(parsed.goals) ? parsed.goals : defaults.goals,
          performanceCycles: Array.isArray(parsed.performanceCycles) ? parsed.performanceCycles : defaults.performanceCycles,
          logs: Array.isArray(parsed.logs) ? parsed.logs : defaults.logs,
          payslips: Array.isArray(parsed.payslips) ? parsed.payslips : defaults.payslips,
          tasks: Array.isArray(parsed.tasks) ? parsed.tasks : defaults.tasks,
          customTeams: Array.isArray(parsed.customTeams) ? parsed.customTeams : defaults.customTeams,
          adminNotifications: Array.isArray(parsed.adminNotifications) ? parsed.adminNotifications : defaults.adminNotifications,
          events: Array.isArray(parsed.events) ? parsed.events : defaults.events,
          profilePhotos: Array.isArray(parsed.profilePhotos) ? parsed.profilePhotos : defaults.profilePhotos,
        };
      } catch (e) {
        console.error("Error parsing HRMS data from localStorage", e);
        return defaults;
      }
    }
    return defaults;
  };

  const [initialData] = useState(() => loadData());

  const [employees, setEmployees] = useState<EmployeeSummary[]>(initialData.employees);
  const [leaves, setLeaves] = useState<LeaveRequest[]>(initialData.leaves);
  const [activities, setActivities] = useState<RecentActivity[]>(initialData.activities);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(initialData.attendance);
  const [stats, setStats] = useState<DashboardStats>(initialData.stats);
  const [payroll, setPayroll] = useState<PayrollRun[]>(initialData.payroll);
  const [goals, setGoals] = useState<GoalTracking[]>(initialData.goals);
  const [performanceCycles, setPerformanceCycles] = useState<PerformanceCycle[]>(initialData.performanceCycles);
  const [logs, setLogs] = useState<AuditLog[]>(initialData.logs);
  const [payslips, setPayslips] = useState<PayslipData[]>(initialData.payslips);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);
  const [taskReviews, setTaskReviews] = useState<any[]>([]);
  const [customTeams, setCustomTeams] = useState<CustomTeam[]>(initialData.customTeams);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>(initialData.adminNotifications);
  const [events, setEvents] = useState<AppEvent[]>(initialData.events);
  const [profilePhotos, setProfilePhotos] = useState<ProfilePhoto[]>(initialData.profilePhotos);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      employees, leaves, activities, attendance, stats, payroll, goals,
      performanceCycles, logs, payslips, tasks, customTeams,
      adminNotifications, events, profilePhotos
    }));
  }, [employees, leaves, activities, attendance, stats, payroll, goals,
    performanceCycles, logs, payslips, tasks, customTeams,
    adminNotifications, events, profilePhotos]);

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'success') => {
    const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    const newNotify: Notification = {
      id,
      type,
      message,
      timestamp: new Date().toLocaleTimeString()
    };

    setNotifications(prev => {
      const next = [newNotify, ...prev];
      return next.slice(0, 5);
    });

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  }, []);

  const addLog = useCallback((action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      user: 'Super Admin',
      action,
      module,
      details,
      ipAddress: '192.168.1.1'
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  // Profile Photo Functions
  const updateProfilePhoto = useCallback((userId: string, photoUrl: string) => {
    setProfilePhotos(prev => {
      // Remove existing photo for this user
      const filtered = prev.filter(photo => photo.userId !== userId);
      // Add new photo
      const newPhoto: ProfilePhoto = {
        userId,
        photoUrl,
        uploadedAt: new Date().toISOString()
      };
      return [newPhoto, ...filtered];
    });
    notify('Profile photo updated successfully', 'success');
    addLog('Update', 'Profile', 'Uploaded new profile photo');
  }, [addLog, notify]);

  const removeProfilePhoto = useCallback((userId: string) => {
    setProfilePhotos(prev => prev.filter(photo => photo.userId !== userId));
    notify('Profile photo removed', 'info');
    addLog('Update', 'Profile', 'Removed profile photo');
  }, [addLog, notify]);

  const getProfilePhoto = useCallback((userId: string): string | null => {
    const photo = profilePhotos.find(photo => photo.userId === userId);
    return photo ? photo.photoUrl : null;
  }, [profilePhotos]);

  const addEmployee = (emp: Partial<EmployeeSummary>) => {
    const maxIdNum = employees.reduce((max, e) => {
      const parts = e.employeeId.split('-');
      if (parts.length === 2) {
        const num = parseInt(parts[1], 10);
        return !isNaN(num) && num > max ? num : max;
      }
      return max;
    }, 0);

    const nextIdNum = maxIdNum + 1;
    const formattedId = `EMP-${nextIdNum.toString().padStart(3, '0')}`;

    const newEmp: EmployeeSummary = {
      id: `emp-${Date.now()}`,
      employeeId: formattedId,
      fullName: emp.fullName || 'New Employee',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=emp-${Date.now()}`,
      designation: emp.designation || 'Software Engineer',
      department: emp.department || 'Engineering',
      email: emp.email || 'new@company.com',
      status: 'active',
      dateOfJoining: new Date().toISOString().split('T')[0],
      reportingManager: 'Rajesh Kumar',
      location: emp.location || 'Bangalore',
      tags: [],
      leaveBalance: 15,
      salaryStructure: {
        basic: 40000,
        hra: 16000,
        da: 4000,
        specialAllowance: 6000,
        pf: 1800,
        esi: 500,
        professionalTax: 200,
        tds: 0
      },
      bankDetails: {
        bankName: 'HDFC Bank',
        accountNumber: '50100' + Math.floor(10000000 + Math.random() * 90000000),
        ifsc: 'HDFC0001234'
      },
      ...emp
    };

    setEmployees(prev => [newEmp, ...prev]);
    addLog('Create', 'Employee', `Registered employee ${newEmp.fullName} with ID ${newEmp.employeeId}`);
    notify(`Employee ${newEmp.fullName} added successfully!`);
  };

  const updateEmployee = (id: string, updates: Partial<EmployeeSummary>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    notify(`Employee record updated.`);
    addLog('Update', 'Employee', `Modified details for record ${id}`);
  };

  const deleteEmployee = (id: string) => {
    const emp = employees.find(e => e.id === id);
    if (emp) {
      setEmployees(prev => prev.filter(e => e.id !== id));
      addLog('Delete', 'Employee', `Terminated record for ${emp.fullName}`);
      notify(`Employee ${emp.fullName} removed.`, 'warning');
    }
  };

  const updateLeaveStatus = (id: string, status: LeaveStatus) => {
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    notify(`Leave ${status}.`);
  };

  const runPayroll = (month: string, year: number) => {
    const generatedPayslips: PayslipData[] = employees.map(emp => {
      const basic = emp.salaryStructure?.basic || 45000;
      const hra = emp.salaryStructure?.hra || 18000;
      const da = emp.salaryStructure?.da || 4500;
      const special = emp.salaryStructure?.specialAllowance || 7500;
      const pf = emp.salaryStructure?.pf || 1800;
      const esi = emp.salaryStructure?.esi || 550;
      const pt = emp.salaryStructure?.professionalTax || 200;
      const tds = emp.salaryStructure?.tds || 1500;
      const gross = basic + hra + da + special;
      const totalDeductions = pf + esi + pt + tds;
      const net = gross - totalDeductions;

      return {
        id: `ps-${emp.id}-${Date.now()}`,
        employeeId: emp.employeeId,
        name: emp.fullName,
        month,
        year,
        basic,
        allowances: hra + da + special,
        deductions: totalDeductions,
        netPay: net,
        status: 'pending',
        grossSalary: gross,
        lop: 0,
        attendanceSummary: { present: 22, absent: 0, totalDays: 22 }
      };
    });

    setPayslips(prev => [...generatedPayslips, ...prev]);
    const newRun: PayrollRun = {
      id: `p-${Date.now()}`,
      month,
      year,
      status: 'completed',
      totalEmployees: employees.length,
      totalAmount: generatedPayslips.reduce((sum, p) => sum + p.netPay, 0),
      processedDate: new Date().toISOString().split('T')[0]
    };
    setPayroll(prev => [newRun, ...prev]);
    notify(`Payroll cycle for ${month} processed successfully!`);
  };

  const updateSalaryStructure = (id: string, structure: SalaryStructure) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, salaryStructure: structure } : e));
    notify(`Salary updated.`);
  };

  const addPerformanceCycle = (cycle: Partial<PerformanceCycle>) => {
    const newCycle: PerformanceCycle = {
      id: `pc-${Date.now()}`,
      name: cycle.name || 'New Cycle',
      period: cycle.period || 'Qx 2024',
      status: cycle.status || 'draft',
      participants: cycle.participants || 0,
      completed: cycle.completed || 0
    };
    setPerformanceCycles(prev => [newCycle, ...prev]);
    notify(`Performance cycle created.`);
  };

  const addTask = (task: Partial<Task>) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      title: task.title || 'Untitled Task',
      description: task.description || '',
      assignedTo: task.assignedTo || '',
      assigneeName: task.assigneeName || '',
      assigneeType: task.assigneeType || 'employee',
      priority: task.priority || 'medium',
      status: 'pending',
      dueDate: task.dueDate || new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      ...task
    };
    setTasks(prev => [newTask, ...prev]);
    notify(`Task assigned to ${newTask.assigneeName}.`);
  };

  const addTaskReview = (review: any) => {
    const newReview = {
      id: `trev-${Date.now()}`,
      ...review
    };
    setTaskReviews(prev => [newReview, ...prev]);
    notify('Review added.', 'success');
  };

  const updateTaskStatus = (id: string, status: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status } : t));
    notify(`Task status updated.`);
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    notify(`Task deleted.`, 'warning');
  };

  const addCustomTeam = (team: Partial<CustomTeam>) => {
    const newTeam: CustomTeam = {
      id: `team-${Date.now()}`,
      name: team.name || 'Unnamed Team',
      memberIds: team.memberIds || [],
      memberNames: team.memberNames || [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setCustomTeams(prev => [...prev, newTeam]);
    notify(`Prepared team created.`);
  };

  const updateCustomTeam = (id: string, updates: Partial<CustomTeam>) => {
    setCustomTeams(prev => prev.map(t => t.id === id ? { ...t, ...updates } as CustomTeam : t));
    notify(`Team updated.`);
  };

  const deleteCustomTeam = (id: string) => {
    setCustomTeams(prev => prev.filter(t => t.id !== id));
    notify(`Team removed.`, 'warning');
  };

  const addAdminNotification = (notif: Partial<AdminNotification>) => {
    const newNotif: AdminNotification = {
      id: `admin-notif-${Date.now()}`,
      title: notif.title || 'Notification',
      message: notif.message || '',
      type: notif.type || 'global',
      targetEmployeeIds: notif.targetEmployeeIds || [],
      priority: notif.priority || 'normal',
      dateTime: notif.dateTime || new Date().toLocaleString(),
      status: notif.status || 'active',
      readBy: []
    };
    setAdminNotifications(prev => [newNotif, ...prev]);
    notify(`Broadcast posted successfully.`);
  };

  const updateAdminNotification = (id: string, updates: Partial<AdminNotification>) => {
    setAdminNotifications(prev => prev.map(n => n.id === id ? { ...n, ...updates } : n));
    notify(`Broadcast updated.`);
  };

  const deleteAdminNotification = (id: string) => {
    setAdminNotifications(prev => prev.filter(n => n.id !== id));
    notify(`Broadcast removed.`, 'warning');
  };

  const markNotificationAsRead = (id: string, userEmail: string) => {
    setAdminNotifications(prev => prev.map(n => {
      if (n.id === id && !n.readBy.includes(userEmail)) {
        return { ...n, readBy: [...n.readBy, userEmail] };
      }
      return n;
    }));
  };

  const addPayslip = (ps: Partial<PayslipData>) => {
    const newPs: PayslipData = {
      id: `ps-${Date.now()}`,
      employeeId: ps.employeeId || '',
      name: ps.name || '',
      month: ps.month || 'January',
      year: ps.year || new Date().getFullYear(),
      basic: ps.basic || 0,
      allowances: ps.allowances || 0,
      deductions: ps.deductions || 0,
      netPay: ps.netPay || 0,
      status: ps.status || 'pending',
      remarks: ps.remarks || '',
      fileName: ps.fileName || '',
      fileUrl: ps.fileUrl || '',
      grossSalary: ps.grossSalary ?? ((ps.basic || 0) + (ps.allowances || 0)),
      lop: ps.lop || 0,
      attendanceSummary: ps.attendanceSummary || { present: 0, absent: 0, totalDays: 30 }
    };
    setPayslips(prev => [newPs, ...prev]);
    addLog('Create', 'Payslip', `Generated payslip for ${newPs.name} - ${newPs.month} ${newPs.year}`);

    if (newPs.status === 'sent') {
      addAdminNotification({
        title: 'New Payslip Available',
        message: `Your payslip for ${newPs.month} ${newPs.year} has been uploaded and sent to your portal.`,
        type: 'selected',
        targetEmployeeIds: [ps.employeeId || ''],
        priority: 'normal'
      });
    }
  };

  const updatePayslip = (id: string, updates: Partial<PayslipData>) => {
    setPayslips(prev => prev.map(ps => {
      if (ps.id === id) {
        const next = { ...ps, ...updates };
        if (ps.status === 'pending' && updates.status === 'sent') {
          addAdminNotification({
            title: 'New Payslip Available',
            message: `Your payslip for ${next.month} ${next.year} has been uploaded and sent to your portal.`,
            type: 'selected',
            targetEmployeeIds: [next.employeeId],
            priority: 'normal'
          });
        }
        return next;
      }
      return ps;
    }));
    notify('Payslip record updated.');
  };

  const deletePayslip = (id: string) => {
    setPayslips(prev => prev.filter(ps => ps.id !== id));
    notify('Payslip removed.', 'warning');
    addLog('Delete', 'Payslip', `Removed payslip record ${id}`);
  };

  // --- EVENTS ---
  const addEvent = (event: Partial<AppEvent>) => {
    const newEvent: AppEvent = {
      id: `evt-${Date.now()}`,
      title: event.title || 'New Event',
      description: event.description || '',
      type: event.type || 'company',
      startDate: event.startDate || new Date().toISOString().split('T')[0],
      endDate: event.endDate || new Date().toISOString().split('T')[0],
      startTime: event.startTime || '09:00 AM',
      endTime: event.endTime || '10:00 AM',
      isOnline: event.isOnline || false,
      location: event.location || '',
      audience: event.audience || 'all',
      targetEmployeeIds: event.targetEmployeeIds || [],
      targetDepartment: event.targetDepartment,
      status: event.status || 'upcoming',
      priority: event.priority || 'normal',
      isPublished: event.isPublished !== undefined ? event.isPublished : true,
      attachments: event.attachments || [],
      participations: [],
      createdAt: new Date().toISOString().split('T')[0]
    };
    setEvents(prev => [newEvent, ...prev]);
    addLog('Create', 'Events', `Scheduled event: ${newEvent.title}`);
    notify(`Event "${newEvent.title}" scheduled successfully.`);
  };

  const updateEvent = (id: string, updates: Partial<AppEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    notify(`Event data updated.`);
  };

  const deleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    notify(`Event removed from calendar.`, 'warning');
  };

  const toggleEventParticipation = (eventId: string, email: string, status: ParticipationStatus) => {
    setEvents(prev => prev.map(evt => {
      if (evt.id === eventId) {
        const existing = evt.participations.find(p => p.employeeEmail === email);
        if (existing) {
          if (existing.status === status) {
            // Un-toggle if same status
            return { ...evt, participations: evt.participations.filter(p => p.employeeEmail !== email) };
          } else {
            // Update status if different
            return { ...evt, participations: evt.participations.map(p => p.employeeEmail === email ? { ...p, status } : p) };
          }
        } else {
          // Add new participation
          return { ...evt, participations: [...evt.participations, { employeeEmail: email, status }] };
        }
      }
      return evt;
    }));
  };

  return (
    <HRMSContext.Provider value={{
      employees: employees || [],
      leaves: leaves || [],
      activities: activities || [],
      attendance: attendance || [],
      stats: stats,
      payroll: payroll || [],
      goals: goals || [],
      performanceCycles: performanceCycles || [],
      logs: logs || [],
      payslips: payslips || [],
      tasks: tasks || [],
      taskReviews: taskReviews || [],
      addTaskReview,
      customTeams: customTeams || [],
      adminNotifications: adminNotifications || [],
      events: events || [],
      notifications: notifications || [],
      profilePhotos: profilePhotos || [],
      globalSearchTerm,
      setGlobalSearchTerm,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      updateLeaveStatus,
      runPayroll,
      updateSalaryStructure,
      addPerformanceCycle,
      addTask,
      updateTaskStatus,
      deleteTask,
      addCustomTeam,
      updateCustomTeam,
      deleteCustomTeam,
      addAdminNotification,
      updateAdminNotification,
      deleteAdminNotification,
      markNotificationAsRead,
      addEvent,
      updateEvent,
      deleteEvent,
      toggleEventParticipation,
      addPayslip,
      updatePayslip,
      deletePayslip,
      addLog,
      notify,
      dismissNotification,
      updateProfilePhoto,
      removeProfilePhoto,
      getProfilePhoto
    }}>
      {children}
    </HRMSContext.Provider>
  );
};

export const useHRMS = () => {
  const context = useContext(HRMSContext);
  if (!context) throw new Error('useHRMS must be used within HRMSProvider');
  return context;
};