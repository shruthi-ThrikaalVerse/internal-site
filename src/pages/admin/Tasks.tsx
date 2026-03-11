import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { Task, AssigneeType, TaskPriority, CustomTeam } from '../../types.ts';
import { DEPARTMENTS } from '../../constants.ts';
import { createTask as apiCreateTask, getTasks as apiGetTasks, getTask as apiGetTask, updateTask as apiUpdateTask, deleteTask as apiDeleteTask } from '../../api/tasks.js';
import { createTeam as apiCreateTeam, getTeams as apiGetTeams, getTeam as apiGetTeam, updateTeam as apiUpdateTeam, deleteTeam as apiDeleteTeam } from '../../api/teams.js';
import { getAllEmployees } from '../../api/users.js';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-white rounded-[32px] w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-black">
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};

// Custom DatePicker Component
const DatePicker = ({
  value,
  onChange,
  id,
  label,
  minDate,
  required = false
}: {
  value: string;
  onChange: (value: string) => void;
  id: string;
  label: string;
  minDate?: string;
  required?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Get current date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Get max reasonable date (current year + 1 year)
  const getMaxReasonableDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().split('T')[0];
  };

  // Safe date parsing
  const safeParseDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return new Date();
      }

      // Check if year is reasonable (between current year -1 and current year + 1)
      const currentYear = new Date().getFullYear();
      const year = date.getFullYear();
      if (year < currentYear - 1 || year > currentYear + 1) {
        return new Date();
      }

      return date;
    } catch {
      return new Date();
    }
  };

  const selectedDate = value ? safeParseDate(value) : null;
  const today = new Date();
  const maxReasonable = getMaxReasonableDate();

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Get month name
  const getMonthName = (month: number) => {
    return new Date(2000, month, 1).toLocaleString('default', { month: 'long' });
  };

  // Get years for year view
  const getYearRange = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 1;
    return Array.from({ length: 3 }, (_, i) => startYear + i);
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];

    // Previous month days
    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Current month days
    const todayStr = today.toISOString().split('T')[0];
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateStr = date.toISOString().split('T')[0];
      days.push({
        date,
        isCurrentMonth: true,
        isToday: dateStr === todayStr
      });
    }

    // Next month days
    const totalCells = 42; // 6 weeks
    const nextMonthDays = totalCells - days.length;
    for (let day = 1; day <= nextMonthDays; day++) {
      days.push({
        date: new Date(year, month + 1, day),
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  };

  const handleDateSelect = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    onChange(dateStr);
    setIsOpen(false);
    setView('days');
  };

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1));
    setView('days');
  };

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1));
    setView('months');
  };

  // Format date for display
  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const date = safeParseDate(dateStr);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return '';
    }
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView('days');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2 relative" ref={datePickerRef}>
      <label htmlFor={id} className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
        {label} {required && '*'}
      </label>

      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          value={value ? formatDisplayDate(value) : ''}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-black cursor-pointer caret-transparent shadow-inner"
          placeholder="Select deadline"
          required={required}
        />
        <button
          title="Toggle calendar picker"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
        >
          <Icon name="Calendar" className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in zoom-in-95 duration-200">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              title="Go to previous month"
              type="button"
              onClick={() => {
                if (view === 'days') {
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
                } else if (view === 'months') {
                  setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
                } else {
                  setCurrentDate(new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), 1));
                }
              }}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Icon name="ChevronLeft" className="w-4 h-4" />
            </button>

            <button
              title="Change calendar view"
              type="button"
              onClick={() => {
                if (view === 'days') {
                  setView('months');
                } else if (view === 'months') {
                  setView('years');
                }
              }}
              className="px-4 py-2 font-black text-sm hover:bg-slate-50 rounded-xl transition-colors"
            >
              {view === 'days' && (
                <>
                  {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
                </>
              )}
              {view === 'months' && (
                <>{currentDate.getFullYear()}</>
              )}
              {view === 'years' && (
                <>{getYearRange()[0]} - {getYearRange()[2]}</>
              )}
            </button>

            <button
              title="Go to next month"
              type="button"
              onClick={() => {
                if (view === 'days') {
                  setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
                } else if (view === 'months') {
                  setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
                } else {
                  setCurrentDate(new Date(currentDate.getFullYear() + 3, currentDate.getMonth(), 1));
                }
              }}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Icon name="ChevronRight" className="w-4 h-4" />
            </button>
          </div>

          {/* Days View */}
          {view === 'days' && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dayObj, index) => {
                  const dayStr = dayObj.date.toISOString().split('T')[0];
                  const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dayStr;
                  const isPastDate = dayObj.date < today;
                  const isValidDate = !isPastDate && dayObj.date <= new Date(maxReasonable);

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => isValidDate && handleDateSelect(dayObj.date)}
                      disabled={!isValidDate}
                      className={`
                        p-2 rounded-xl text-sm font-medium transition-all
                        ${dayObj.isCurrentMonth ? 'text-slate-700' : 'text-slate-300'}
                        ${dayObj.isToday ? 'bg-indigo-50 text-indigo-600 font-black' : ''}
                        ${isSelected ? 'bg-indigo-600 text-white font-black' : ''}
                        ${!isSelected && !dayObj.isToday ? 'hover:bg-slate-50' : ''}
                        ${!dayObj.isCurrentMonth || !isValidDate ? 'cursor-default opacity-50' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      {dayObj.date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleDateSelect(today)}
                  className="px-4 py-2 bg-slate-50 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Today
                </button>
              </div>
            </>
          )}

          {/* Months View */}
          {view === 'months' && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => i).map((monthIndex) => {
                const monthDate = new Date(currentDate.getFullYear(), monthIndex, 1);
                const isSelected = selectedDate &&
                  selectedDate.getFullYear() === monthDate.getFullYear() &&
                  selectedDate.getMonth() === monthIndex;

                return (
                  <button
                    key={monthIndex}
                    type="button"
                    onClick={() => handleMonthSelect(monthIndex)}
                    className={`
                      p-3 rounded-xl text-sm font-medium text-center transition-all
                      ${isSelected ? 'bg-indigo-600 text-white font-black' : 'text-slate-700 hover:bg-slate-50'}
                    `}
                  >
                    {getMonthName(monthIndex).slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Years View */}
          {view === 'years' && (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto invisible-scrollbar">
              {getYearRange().map((year) => {
                const yearDate = new Date(year, 0, 1);
                const isSelected = selectedDate && selectedDate.getFullYear() === year;

                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`
                      p-3 rounded-xl text-sm font-medium text-center transition-all
                      ${isSelected ? 'bg-indigo-600 text-white font-black' : 'text-slate-700 hover:bg-slate-50'}
                      ${year === today.getFullYear() ? 'ring-2 ring-indigo-200' : ''}
                    `}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// SLA configuration based on priority
const SLA_CONFIG = {
  p1: { days: 1, label: '24 Hours', priority: 'high' },
  p2: { days: 3, label: '3 Days', priority: 'medium' },
  p3: { days: 5, label: '5 Days', priority: 'medium' },
  p4: { days: 7, label: '7 Days', priority: 'low' }
};

// Colorful gradient backgrounds for each priority - MORE VIBRANT!
const PRIORITY_GRADIENTS = {
  p1: 'bg-gradient-to-br from-rose-500/20 via-pink-400/15 to-red-400/10 border-rose-200/60 shadow-rose-100/30',
  p2: 'bg-gradient-to-br from-amber-500/20 via-orange-400/15 to-yellow-400/10 border-amber-200/60 shadow-amber-100/30',
  p3: 'bg-gradient-to-br from-blue-500/20 via-cyan-400/15 to-teal-400/10 border-blue-200/60 shadow-blue-100/30',
  p4: 'bg-gradient-to-br from-indigo-500/20 via-purple-400/15 to-violet-400/10 border-indigo-200/60 shadow-indigo-100/30'
};

// Badge colors for each priority - MORE VIBRANT!
const PRIORITY_BADGE_STYLES = {
  p1: 'bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 text-white border-rose-400/40 shadow-sm',
  p2: 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white border-amber-400/40 shadow-sm',
  p3: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white border-blue-400/40 shadow-sm',
  p4: 'bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-500 text-white border-indigo-400/40 shadow-sm'
};

// SLA badge colors - MORE VIBRANT!
const SLA_BADGE_STYLES = {
  p1: 'bg-gradient-to-r from-rose-500/30 to-pink-400/30 text-rose-800 border-rose-300/60',
  p2: 'bg-gradient-to-r from-amber-500/30 to-orange-400/30 text-amber-800 border-amber-300/60',
  p3: 'bg-gradient-to-r from-blue-500/30 to-cyan-400/30 text-blue-800 border-blue-300/60',
  p4: 'bg-gradient-to-r from-indigo-500/30 to-purple-400/30 text-indigo-800 border-indigo-300/60'
};

// Team card gradient colors - MORE VIBRANT!
const TEAM_GRADIENTS = [
  'bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-cyan-300/10 border-emerald-200/50',
  'bg-gradient-to-br from-violet-400/20 via-purple-300/15 to-fuchsia-300/10 border-violet-200/50',
  'bg-gradient-to-br from-orange-400/20 via-amber-300/15 to-yellow-300/10 border-orange-200/50',
  'bg-gradient-to-br from-cyan-400/20 via-blue-300/15 to-indigo-300/10 border-cyan-200/50',
  'bg-gradient-to-br from-pink-400/20 via-rose-300/15 to-red-300/10 border-pink-200/50',
  'bg-gradient-to-br from-lime-400/20 via-green-300/15 to-emerald-300/10 border-lime-200/50'
];

const Tasks: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask, customTeams, addCustomTeam, updateCustomTeam, deleteCustomTeam, employees, notify } = useHRMS();

  // API State
  const [apiTasks, setApiTasks] = useState<any[]>([]);
  const [apiTeams, setApiTeams] = useState<any[]>([]);
  const [apiEmployees, setApiEmployees] = useState<any[]>([]);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'tasks' | 'teams'>('tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  // New/Edit Team Form State
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState<{ name: string, memberIds: string[] }>({
    name: '',
    memberIds: []
  });

  // Delete confirmation overlay state
  const [confirmDelete, setConfirmDelete] = useState<{ kind: 'task' | 'team' | null; id?: string; name?: string }>({ kind: null });

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    assigneeType: 'employee',
    assignedTo: '',
    priority: 'p2',
    dueDate: new Date().toISOString().split('T')[0]
  });

  // Fetch tasks, teams, and employees from API on mount
  useEffect(() => {
    (async () => {
      try {
        const [tasksData, teamsData, employeesData] = await Promise.all([
          apiGetTasks(),
          apiGetTeams(),
          getAllEmployees()
        ]);
        setApiTasks(Array.isArray(tasksData) ? tasksData : []);
        setApiTeams(Array.isArray(teamsData) ? teamsData : []);
        setApiEmployees(Array.isArray(employeesData) ? employeesData : []);
      } catch (err: any) {
        console.error('Failed to fetch API data:', err);
      }
    })();
  }, []);

  // Calculate SLA due date based on priority
  const calculateSLADueDate = (priority: string) => {
    const today = new Date();
    const slaDays = SLA_CONFIG[priority as keyof typeof SLA_CONFIG]?.days || 3;
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + slaDays);
    return dueDate.toISOString().split('T')[0];
  };

  // Calculate days remaining for a task
  const calculateDaysRemaining = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  // Safe date parsing for display
  const safeParseDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return new Date();
      }
      return date;
    } catch {
      return new Date();
    }
  };

  // Format date for display
  const formatDisplayDate = (dateString: string) => {
    const date = safeParseDate(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const filteredTasks = useMemo(() => {
    const displayTasks = apiTasks.length > 0 ? apiTasks : tasks;
    return displayTasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.employeeId || task.title).toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'All' ||
        task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [apiTasks, tasks, searchTerm, filterPriority]);

  // Handle form submission with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!newTask.title?.trim()) {
      notify('Task title is required.', 'warning');
      return;
    }

    if (!newTask.assignedTo) {
      notify('Please select an assignee.', 'warning');
      return;
    }

    // Validate due date
    if (!newTask.dueDate) {
      notify('Due date is required.', 'warning');
      return;
    }

    const today = new Date();
    const selectedDueDate = new Date(newTask.dueDate);

    // Check if date is valid
    if (isNaN(selectedDueDate.getTime())) {
      notify('Invalid due date selected.', 'warning');
      return;
    }

    // Check if date is in the future
    if (selectedDueDate < today) {
      notify('Please select today or a future date for the deadline.', 'warning');
      return;
    }

    // Check if date is reasonable (not too far in the future)
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);
    if (selectedDueDate > maxDate) {
      notify('Due date cannot be more than 1 year in the future.', 'warning');
      return;
    }

    // Build API payload
    const payload: any = {
      title: newTask.title,
      description: newTask.description || '',
      assigneeType: newTask.assigneeType?.toUpperCase() || 'EMPLOYEE',
      priority: (newTask.priority || 'P1').toUpperCase().replace('P', 'P'),  // P1, P2, P3
      deadlineAt: new Date(newTask.dueDate).toISOString()
    };

    // Add assignee based on type
    if (newTask.assigneeType === 'employee') {
      payload.employeeId = newTask.assignedTo;
    } else if (newTask.assigneeType === 'team') {
      payload.teamId = newTask.assignedTo;
    } else {
      payload.department = newTask.assignedTo;
    }

    // Call API to create or update task
    (async () => {
      try {
        if (editingTaskId) {
          await apiUpdateTask(editingTaskId, payload);
          setEditingTaskId(null);
        } else {
          await apiCreateTask(payload);
        }

        // Refresh tasks list
        const refreshed = await apiGetTasks();
        setApiTasks(Array.isArray(refreshed) ? refreshed : []);

        setIsModalOpen(false);
        setNewTask({
          title: '',
          description: '',
          assigneeType: 'employee',
          assignedTo: '',
          priority: 'p2',
          dueDate: calculateSLADueDate('p2')
        });
      } catch (err: any) {
        notify(`Failed to save task: ${err.message || err}`, 'error');
      }
    })();
  };

  const handleCreateOrUpdateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name.trim()) {
      notify('Team name is required.', 'warning');
      return;
    }

    if (newTeam.memberIds.length === 0) {
      notify('Please select at least one team member.', 'warning');
      return;
    }

    // Call API to create or update team
    (async () => {
      try {
        if (editingTeamId) {
          await apiUpdateTeam(editingTeamId, {
            name: newTeam.name,
            employeeIds: newTeam.memberIds
          });
        } else {
          await apiCreateTeam({
            name: newTeam.name,
            employeeIds: newTeam.memberIds
          });
        }

        // Refresh teams list
        const refreshed = await apiGetTeams();
        setApiTeams(Array.isArray(refreshed) ? refreshed : []);

        setIsTeamModalOpen(false);
        setEditingTeamId(null);
        setNewTeam({ name: '', memberIds: [] });
      } catch (err: any) {
        notify(`Failed to save team: ${err.message || err}`, 'error');
      }
    })();
  };

  const handleEditTask = (task: any) => {
    setEditingTaskId(task.id ?? task.taskId ?? task._id);
    setNewTask({
      title: task.title,
      description: task.description,
      assigneeType: (task.assigneeType?.toLowerCase() || 'employee') as 'employee' | 'team' | 'department',
      assignedTo: task.employeeId || task.teamId || task.department || '',
      priority: (task.priority?.toLowerCase() || 'p2') as TaskPriority,
      dueDate: task.dueDate || calculateSLADueDate(task.priority?.toLowerCase() || 'p2')
    });
    setIsModalOpen(true);
  };

  const handleEditTeam = (team: any) => {
    setEditingTeamId(team.id || team.teamId);
    setNewTeam({
      name: team.name,
      memberIds: team.employeeIds || team.memberIds || []
    });
    setIsTeamModalOpen(true);
  };

  const handleOpenTeamModal = () => {
    setEditingTeamId(null);
    setNewTeam({ name: '', memberIds: [] });
    setIsTeamModalOpen(true);
  };

  const handleDeleteTask = async (taskId?: string) => {
    if (!taskId) {
      notify('Unable to delete task: missing id', 'error');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await apiDeleteTask(taskId);
      const refreshed = await apiGetTasks();
      setApiTasks(Array.isArray(refreshed) ? refreshed : []);
    } catch (err: any) {
      notify(`Failed to delete task: ${err.message || err}`, 'error');
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    try {
      await apiDeleteTeam(teamId);
      const refreshed = await apiGetTeams();
      setApiTeams(Array.isArray(refreshed) ? refreshed : []);
    } catch (err: any) {
      notify(`Failed to delete team: ${err.message || err}`, 'error');
    }
  };

  // Handle priority change
  const handlePriorityChange = (priority: string) => {
    const slaDueDate = calculateSLADueDate(priority);
    setNewTask({
      ...newTask,
      priority: priority as TaskPriority,
      dueDate: slaDueDate
    });
  };

  // Handle due date change
  const handleDueDateChange = (dateStr: string) => {
    setNewTask({
      ...newTask,
      dueDate: dateStr
    });
  };

  // Get random team gradient
  const getTeamGradient = (index: number) => {
    return TEAM_GRADIENTS[index % TEAM_GRADIENTS.length];
  };

  // Get team avatar gradient
  const getTeamAvatarGradient = (index: number) => {
    const avatarGradients = [
      'bg-gradient-to-br from-emerald-500 to-teal-400',
      'bg-gradient-to-br from-violet-500 to-purple-400',
      'bg-gradient-to-br from-orange-500 to-amber-400',
      'bg-gradient-to-br from-cyan-500 to-blue-400',
      'bg-gradient-to-br from-pink-500 to-rose-400',
      'bg-gradient-to-br from-lime-500 to-green-400'
    ];
    return avatarGradients[index % avatarGradients.length];
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Task Assignment</h1>
          <p className="text-slate-500 text-sm font-medium">Delegate operational objectives to Personnel, teams and units.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gradient-to-r from-indigo-100/50 to-purple-100/50 p-1 rounded-2xl border border-indigo-100/30 shadow-sm mr-2">
            {['tasks', 'teams'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'
                  }`}
              >
                {tab === 'tasks' ? 'Objectives' : 'Team Builder'}
              </button>
            ))}
          </div>
          {activeTab === 'tasks' ? (
            <button
              onClick={() => {
                setEditingTaskId(null);
                setNewTask({
                  title: '',
                  description: '',
                  assigneeType: 'employee',
                  assignedTo: '',
                  priority: 'p2',
                  dueDate: calculateSLADueDate('p2')
                });
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white rounded-2xl hover:opacity-90 hover:shadow-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 transition-all active:scale-95"
            >
              <Icon name="Plus" className="w-5 h-5" /> Create Task
            </button>
          ) : (
            <button
              onClick={handleOpenTeamModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl hover:opacity-90 hover:shadow-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-200 transition-all active:scale-95"
            >
              <Icon name="Users" className="w-5 h-5" /> New Team
            </button>
          )}
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 p-6 rounded-[32px] border border-slate-100/50 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 group w-full">
              <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input aria-label="Search tasks" type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter tasks by title or assignee..."
                className="w-full pl-12 pr-6 py-4 bg-white/50 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600 shadow-inner"
              />
            </div>
            <select
              aria-label="Filter by priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-6 py-4 bg-white/50 backdrop-blur-sm border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xs uppercase tracking-widest text-slate-500 shadow-inner"
            >
              <option value="All">All Priorities</option>
              <option value="p1">🔥 P1 - High (24h)</option>
              <option value="p2">⚡ P2 - Medium (3d)</option>
              <option value="p3">🚀 P3 - Medium (5d)</option>
              <option value="p4">✨ P4 - Low (7d)</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.length > 0 ? filteredTasks.map((task, idx) => {
              const priorityGradient = PRIORITY_GRADIENTS[task.priority as keyof typeof PRIORITY_GRADIENTS] || PRIORITY_GRADIENTS.p2;
              const priorityBadgeStyle = PRIORITY_BADGE_STYLES[task.priority as keyof typeof PRIORITY_BADGE_STYLES] || PRIORITY_BADGE_STYLES.p2;
              const slaBadgeStyle = SLA_BADGE_STYLES[task.priority as keyof typeof SLA_BADGE_STYLES] || SLA_BADGE_STYLES.p2;
              const daysRemaining = calculateDaysRemaining(task.dueDate);
              const isOverdue = daysRemaining < 0;

              return (
                <div key={task.id ?? task.taskId ?? `task-${idx}`} className={`border rounded-[32px] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm ${priorityGradient}`}>
                  {/* Animated gradient overlay */}
                  <div className="absolute inset-0 opacity-20 animate-gradient">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-20 translate-x-20"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-current to-transparent rounded-full translate-y-16 -translate-x-16"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap与外">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-md ${priorityBadgeStyle}`}>
                          {task.priority.toUpperCase()} Priority
                        </span>
                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-md ${slaBadgeStyle}`}>
                          ⏱️ {SLA_CONFIG[task.priority as keyof typeof SLA_CONFIG]?.label || '3 Days'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button
                          title={`Edit task ${task.title}`}
                          aria-label={`Edit task ${task.title}`}
                          type="button"
                          onClick={() => handleEditTask(task)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white/50 transition-all rounded-xl"
                        >
                          <Icon name="Edit3" className="w-4 h-4" />
                        </button>
                        <button
                          title={`Delete task ${task.title}`}
                          aria-label={`Delete task ${task.title}`}
                          type="button"
                          onClick={() => setConfirmDelete({ kind: 'task', id: task.id ?? task.taskId ?? task._id, name: task.title })}
                          className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white/50 transition-all rounded-xl"
                        >
                          <Icon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">{task.title}</h3>
                    <p className="text-sm text-slate-700 font-medium mb-6 line-clamp-2">{task.description}</p>
                  </div>

                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                      <div className={`p-2 rounded-xl bg-gradient-to-br from-white to-slate-50 shadow-sm ${task.assigneeType === 'employee' ? 'text-indigo-600' : task.assigneeType === 'team' ? 'text-blue-600' : 'text-emerald-600'}`}>
                        <Icon name={task.assigneeType === 'employee' ? 'User' : 'Users'} className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">{task.assigneeType}</p>
                        <p className="text-sm font-bold text-slate-800 truncate">{task.assigneeName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-xl shadow-sm ${isOverdue ? 'bg-gradient-to-br from-rose-100 to-pink-100 text-rose-600' : 'bg-gradient-to-br from-white to-slate-50 text-slate-600'}`}>
                          <Icon name="Calendar" className="w-4 h-4" />
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${isOverdue ? 'text-rose-600' : 'text-slate-700'}`}>
                          {isOverdue ? `⚠️ OVERDUE ${Math.abs(daysRemaining)}d` : `📅 Due: ${formatDisplayDate(task.dueDate)} (${daysRemaining}d)`}
                        </span>
                      </div>
                      <select
                        aria-label={`Change status for ${task.title}`}
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                        className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border backdrop-blur-sm transition-all shadow-sm ${task.status === 'completed' ? 'bg-gradient-to-r from-emerald-500/30 to-green-400/30 text-emerald-800 border-emerald-400/40' :
                          task.status === 'in-progress' ? 'bg-gradient-to-r from-blue-500/30 to-cyan-400/30 text-blue-800 border-blue-400/40' :
                            'bg-white/60 text-slate-600 border-slate-300/50'
                          }`}>
                        <option value="pending">⏳ Pending</option>
                        <option value="in-progress">🚧 In Progress</option>
                        <option value="completed">✅ Completed</option>
                      </select>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-24 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckSquare" className="w-12 h-12 text-indigo-300" />
                </div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No matching tasks found.</p>
                <p className="text-slate-300 text-[10px] font-medium mt-2">Try changing your search or filter</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(apiTeams.length > 0 ? apiTeams : customTeams).length > 0 ? (apiTeams.length > 0 ? apiTeams : customTeams).map((team, index) => {
            const teamGradient = getTeamGradient(index);
            const avatarGradient = getTeamAvatarGradient(index);

            return (
              <div key={team.id ?? team.teamId ?? `team-${index}`} className={`border rounded-[32px] p-8 hover:shadow-2xl hover:scale-[1.02] transition-all group flex flex-col relative overflow-hidden backdrop-blur-sm ${teamGradient}`}>
                {/* Team card pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-16 h-16 bg-current rounded-full -translate-x-8 -translate-y-8"></div>
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-current rounded-full translate-x-10 translate-y-10"></div>
                </div>

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className={`w-16 h-16 ${avatarGradient} text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg border border-white/30`}>
                      {team.name.charAt(0)}
                    </div>
                    <div className="flex gap-1">
                      <button aria-label={`Edit team ${team.name}`} onClick={() => handleEditTeam(team)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white/50 transition-all rounded-xl">
                        <Icon name="Edit3" className="w-5 h-5" />
                      </button>
                      <button aria-label={`Delete team ${team.id || team.teamId}`} onClick={() => setConfirmDelete({ kind: 'team', id: team.id ?? team.teamId ?? team._id, name: team.name })} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white/50 transition-all rounded-xl">
                        <Icon name="Trash2" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">{team.name}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6">👥 {(team.employeeIds || team.memberIds || []).length} members</p>

                  <div className="space-y-3 flex-1 mb-6">
                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">🌟 Team Members:</p>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                      {((team.employeeIds || team.memberIds || []).map((empId: string) => {
                        const emp = (apiEmployees.length > 0 ? apiEmployees : employees).find(e => e.employeeId === empId || e.id === empId);
                        return emp?.fullName || empId;
                      }) || team.memberNames || []).map((name, i) => (
                        <div key={`${name}-${i}`} className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30">
                          <div className="w-8 h-8 bg-gradient-to-br from-slate-100 to-slate-50 rounded-lg flex items-center justify-center text-xs font-black text-slate-600 shadow-sm">
                            {name.charAt(0)}
                          </div>
                          <span className="text-sm font-bold text-slate-800 truncate">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveTab('tasks');
                      setIsModalOpen(true);
                      setNewTask({ ...newTask, assigneeType: 'team', assignedTo: team.id });
                    }}
                    className="w-full py-3.5 bg-gradient-to-r from-white/70 to-white/40 text-slate-800 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:from-white hover:to-white hover:text-indigo-700 hover:shadow-lg transition-all border border-white/50 backdrop-blur-sm group-hover:bg-gradient-to-r group-hover:from-indigo-500/20 group-hover:to-purple-500/20"
                  >
                    🚀 Assign Task to Team
                  </button>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-100/50 to-teal-100/50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                <Icon name="Users" className="w-12 h-12 text-emerald-300" />
              </div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">No prepared teams created yet.</p>
              <p className="text-slate-300 text-[10px] font-medium mt-2">Start by creating your first team!</p>
              <button
                onClick={handleOpenTeamModal}
                className="mt-6 px-8 py-3.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:opacity-90 hover:shadow-xl transition-all shadow-lg shadow-teal-200"
              >
                🛠️ Build First Team
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE/EDIT TASK MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => {
        setIsModalOpen(false);
        setEditingTaskId(null);
      }} title={editingTaskId ? "Edit Assignment" : "Create Assignment"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Task Title</label>
            <input
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
              placeholder="Brief summary of the objective"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-black  uppercase tracking-widest ml-1">Objective Description</label>
            <textarea
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 min-h-[100px] shadow-inner"
              placeholder="Provide specific details, success criteria, and context..."
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-black  uppercase tracking-widest ml-1">Assignee Selection</label>
            <div className="flex gap-2">
              {(['employee', 'team', 'department'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewTask({ ...newTask, assigneeType: type, assignedTo: '' })}
                  className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${newTask.assigneeType === type ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-black  uppercase tracking-widest ml-1">Target Entity</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={newTask.assignedTo}
                onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                title="Select target entity"
              >
                <option value="">Select {newTask.assigneeType}</option>
                {newTask.assigneeType === 'employee' && (
                  (apiEmployees.length > 0 ? apiEmployees : employees).map(emp => <option key={emp.id || emp.employeeId} value={emp.id || emp.employeeId}>{emp.fullName} ({emp.employeeId})</option>)
                )}
                {newTask.assigneeType === 'team' && (
                  (apiTeams.length > 0 ? apiTeams : customTeams).map(team => <option key={team.id || team.teamId} value={team.id || team.teamId}>{team.name} ({(team.employeeIds || team.memberIds || []).length} members)</option>)
                )}
                {newTask.assigneeType === 'department' && (
                  DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Priority & SLA Level</label>
              <div className="grid grid-cols-2 gap-2">
                {(['p1', 'p2', 'p3', 'p4'] as const).map(p => {
                  const isSelected = newTask.priority === p;
                  const gradientStyle = isSelected
                    ? PRIORITY_BADGE_STYLES[p as keyof typeof PRIORITY_BADGE_STYLES]
                    : 'bg-white border-slate-100 text-black hover:bg-slate-50 shadow-sm';

                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handlePriorityChange(p)}
                      className={`py-4 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center ${gradientStyle}`}
                    >
                      <span className="text-sm">{p.toUpperCase()}</span>
                      <span className="text-[8px] opacity-75 mt-1">{SLA_CONFIG[p].label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Deadline</label>
              <div className="space-y-2">
                <DatePicker
                  id="taskDueDate"
                  label="Select Deadline"
                  value={newTask.dueDate || calculateSLADueDate(newTask.priority || 'p2')}
                  onChange={handleDueDateChange}
                  minDate={new Date().toISOString().split('T')[0]}
                  required={true}
                />
                {newTask.priority && (
                  <p className="text-[9px] font-medium text-slate-400 px-1">
                    ⏱️ SLA: {SLA_CONFIG[newTask.priority as keyof typeof SLA_CONFIG]?.label}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => {
              setIsModalOpen(false);
              setEditingTaskId(null);
            }} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all text-black">Discard</button>
            <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-100 hover:opacity-90 transition-all active:scale-95">
              {editingTaskId ? "✏️ Update Assignment" : "🎯 Confirm Assignment"}
            </button>
          </div>
        </form>
      </Modal>

      {/* TEAM BUILDER MODAL */}
      <Modal isOpen={isTeamModalOpen} onClose={() => { setIsTeamModalOpen(false); setEditingTeamId(null); }} title={editingTeamId ? "Update Prepared Team" : "Assemble New Team"}>
        <form onSubmit={handleCreateOrUpdateTeam} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Identity Name</label>
            <input
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
              placeholder="e.g. Q4 Cloud Migration Squad"
              value={newTeam.name}
              onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Persons</label>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{newTeam.memberIds.length} Selected</span>
            </div>
            <div className="bg-slate-50 rounded-[28px] border border-slate-100 overflow-hidden shadow-inner">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {(apiEmployees.length > 0 ? apiEmployees : employees).map(emp => {
                  const empId = emp.id || emp.employeeId;
                  const isSelected = newTeam.memberIds.includes(empId);
                  return (
                    <div
                      key={empId}
                      onClick={() => {
                        const current = [...newTeam.memberIds];
                        if (isSelected) {
                          setNewTeam({ ...newTeam, memberIds: current.filter(id => id !== empId) });
                        } else {
                          setNewTeam({ ...newTeam, memberIds: [...current, empId] });
                        }
                      }}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-indigo-50/50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <img src={emp.avatar} className="w-10 h-10 rounded-xl shadow-sm border border-slate-100" alt={`${emp.fullName} avatar`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-black text-slate-800 leading-tight">{emp.fullName}</p>
                            <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">{emp.employeeId || emp.id}</span>
                          </div>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{emp.designation || emp.department}</p>
                        </div>
                      </div>
                      <div className={`p-1.5 rounded-lg border-2 transition-all ${isSelected ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'}`}>
                        <Icon name="Check" className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => { setIsTeamModalOpen(false); setEditingTeamId(null); }} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all text-black">Abort</button>
            <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-teal-100 hover:opacity-90 transition-all active:scale-95">
              {editingTeamId ? "Update Team" : "🚀 Commit Prepared Team"}
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={confirmDelete.kind !== null} onClose={() => setConfirmDelete({ kind: null })} title={confirmDelete.kind === 'task' ? 'Confirm Delete Task' : 'Confirm Delete Team'}>
        <div className="space-y-6">
          <p className="text-slate-600">Are you sure you want to delete the {confirmDelete.kind === 'task' ? 'task' : 'team'} <strong className="font-black">{confirmDelete.name}</strong>? This action cannot be undone.</p>
          <div className="flex gap-4 justify-end">
            <button type="button" onClick={() => setConfirmDelete({ kind: null })} className="py-3 px-6 bg-white text-slate-500 rounded-2xl font-black border border-slate-100 hover:bg-slate-50">Cancel</button>
            <button type="button" onClick={async () => {
              if (!confirmDelete.id || !confirmDelete.kind) {
                notify('Missing id for deletion', 'error');
                setConfirmDelete({ kind: null });
                return;
              }
              const idToDelete = confirmDelete.id;
              const kindToDelete = confirmDelete.kind;
              // optimistic client-side removal
              if (kindToDelete === 'team') {
                setApiTeams(prev => prev.filter(t => (t.id || t.teamId || t._id) !== idToDelete));
              } else {
                setApiTasks(prev => prev.filter(t => (t.id || t.taskId || t._id) !== idToDelete));
              }

              try {
                if (kindToDelete === 'task') {
                  await apiDeleteTask(idToDelete);
                  const refreshed = await apiGetTasks();
                  setApiTasks(Array.isArray(refreshed) ? refreshed : []);
                } else {
                  await apiDeleteTeam(idToDelete);
                  const refreshed = await apiGetTeams();
                  setApiTeams(Array.isArray(refreshed) ? refreshed : []);
                }
              } catch (err: any) {
                notify(`Failed to delete: ${err.message || err}`, 'error');
              } finally {
                setConfirmDelete({ kind: null });
              }
            }} className="py-3 px-6 bg-rose-500 text-white rounded-2xl font-black hover:opacity-90">Delete</button>
          </div>
        </div>
      </Modal>
    </div >
  );
};

export default Tasks;