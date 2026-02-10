import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { AppEvent, EventType, EventStatus, EventPriority, EventAudience } from '../../types.ts';
import { DEPARTMENTS } from '../../constants.ts';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-white rounded-[32px] w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto flex-1 event-form-modal" style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          <style>{`
            .event-form-modal::-webkit-scrollbar {
              display: none;
            }
          `}</style>
          {children}
        </div>
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
    <div className="relative" ref={datePickerRef}>
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          value={value ? formatDisplayDate(value) : ''}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 cursor-pointer caret-transparent shadow-inner"
          placeholder="Select date"
          required={required}
        />
        <button
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

// Colorful gradient backgrounds for each event type
const EVENT_GRADIENTS = {
  holiday: 'bg-gradient-to-br from-rose-500/20 via-pink-400/15 to-red-400/10 border-rose-200/60 shadow-rose-100/30',
  training: 'bg-gradient-to-br from-indigo-500/20 via-purple-400/15 to-violet-400/10 border-indigo-200/60 shadow-indigo-100/30',
  meeting: 'bg-gradient-to-br from-blue-500/20 via-cyan-400/15 to-teal-400/10 border-blue-200/60 shadow-blue-100/30',
  company: 'bg-gradient-to-br from-emerald-500/20 via-green-400/15 to-lime-400/10 border-emerald-200/60 shadow-emerald-100/30',
  team: 'bg-gradient-to-br from-amber-500/20 via-orange-400/15 to-yellow-400/10 border-amber-200/60 shadow-amber-100/30'
};

// Badge colors for each event type
const EVENT_BADGE_STYLES = {
  holiday: 'bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 text-white border-rose-400/40',
  training: 'bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-500 text-white border-indigo-400/40',
  meeting: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white border-blue-400/40',
  company: 'bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 text-white border-emerald-400/40',
  team: 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white border-amber-400/40'
};

// Time badge colors
const TIME_BADGE_STYLES = {
  holiday: 'bg-gradient-to-r from-rose-500/30 to-pink-400/30 text-rose-800 border-rose-300/60',
  training: 'bg-gradient-to-r from-indigo-500/30 to-purple-400/30 text-indigo-800 border-indigo-300/60',
  meeting: 'bg-gradient-to-r from-blue-500/30 to-cyan-400/30 text-blue-800 border-blue-300/60',
  company: 'bg-gradient-to-r from-emerald-500/30 to-green-400/30 text-emerald-800 border-emerald-300/60',
  team: 'bg-gradient-to-r from-amber-500/30 to-orange-400/30 text-amber-800 border-amber-300/60'
};

// Status colors
const STATUS_COLORS = {
  upcoming: 'bg-gradient-to-r from-emerald-500/20 to-green-400/20 text-emerald-700 border-emerald-400/40',
  ongoing: 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 text-blue-700 border-blue-400/40',
  completed: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 border-slate-400/40',
  cancelled: 'bg-gradient-to-r from-rose-500/20 to-pink-400/20 text-rose-700 border-rose-400/40'
};

// Priority colors
const PRIORITY_BADGE_STYLES = {
  normal: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 border-slate-400/40',
  important: 'bg-gradient-to-r from-amber-500/20 to-orange-400/20 text-amber-700 border-amber-400/40',
  critical: 'bg-gradient-to-r from-rose-500/20 to-red-400/20 text-rose-700 border-rose-400/40'
};

// Emojis for event types
const EVENT_EMOJIS = {
  holiday: '🎉',
  training: '📚',
  meeting: '🤝',
  company: '🏢',
  team: '👥'
};

const EventsAdmin: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, employees, notify } = useHRMS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'board' | 'list'>('board');

  const todayISO = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState<Partial<AppEvent>>({
    title: '',
    description: '',
    type: 'company',
    startDate: todayISO,
    endDate: todayISO,
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    isOnline: false,
    location: '',
    audience: 'all',
    targetEmployeeIds: [],
    targetDepartment: '',
    status: 'upcoming',
    priority: 'normal',
    isPublished: true,
  });

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

  const filteredEvents = useMemo(() => {
    return events.filter(e =>
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      e.fullName.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(empSearch.toLowerCase())
    );
  }, [employees, empSearch]);

  // Handle form submission with validation
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title?.trim()) {
      notify('Event title is required.', 'warning');
      return;
    }

    if (!formData.description?.trim()) {
      notify('Event description is required.', 'warning');
      return;
    }

    // Validate start date
    if (!formData.startDate) {
      notify('Start date is required.', 'warning');
      return;
    }

    const today = new Date();
    const selectedStartDate = new Date(formData.startDate);
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Check if date is valid
    if (isNaN(selectedStartDate.getTime())) {
      notify('Invalid start date selected.', 'warning');
      return;
    }

    // Check if date is in the future (or today)
    if (selectedStartDate < todayStart) {
      notify('Start date cannot be in the past.', 'warning');
      return;
    }

    // Check if date is reasonable (not too far in the future)
    const maxDate = new Date();
    maxDate.setFullYear(today.getFullYear() + 1);
    if (selectedStartDate > maxDate) {
      notify('Start date cannot be more than 1 year in the future.', 'warning');
      return;
    }

    // Validate end date if provided
    if (formData.endDate) {
      const selectedEndDate = new Date(formData.endDate);
      if (isNaN(selectedEndDate.getTime())) {
        notify('Invalid end date selected.', 'warning');
        return;
      }

      if (selectedEndDate < selectedStartDate) {
        notify('End date cannot be before start date.', 'warning');
        return;
      }
    }

    // Validate audience selection
    if (formData.audience === 'selected' && (!formData.targetEmployeeIds || formData.targetEmployeeIds.length === 0)) {
      notify('Please select at least one employee for targeted events.', 'warning');
      return;
    }

    if (formData.audience === 'department' && !formData.targetDepartment) {
      notify('Please select a department for department-based events.', 'warning');
      return;
    }

    if (editingId) {
      updateEvent(editingId, formData);
      notify('Event updated successfully!', 'success');
    } else {
      addEvent({
        ...formData,
        createdAt: new Date().toISOString(),
        participations: [],
        updatedAt: new Date().toISOString()
      } as AppEvent);
      notify('Event created successfully!', 'success');
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      type: 'company',
      startDate: todayISO,
      endDate: todayISO,
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      isOnline: false,
      location: '',
      audience: 'all',
      targetEmployeeIds: [],
      targetDepartment: '',
      status: 'upcoming',
      priority: 'normal',
      isPublished: true,
    });
  };

  const handleEdit = (evt: AppEvent) => {
    setEditingId(evt.id);
    setFormData(evt);
    setIsModalOpen(true);
  };

  const toggleEmployeeSelection = (id: string) => {
    setFormData(prev => {
      const current = prev.targetEmployeeIds || [];
      const next = current.includes(id)
        ? current.filter(cid => cid !== id)
        : [...current, id];
      return { ...prev, targetEmployeeIds: next };
    });
  };

  // Handle start date change
  const handleStartDateChange = (dateStr: string) => {
    setFormData({
      ...formData,
      startDate: dateStr,
      // Auto-set end date to same as start if not set or if it's before new start date
      endDate: !formData.endDate || new Date(formData.endDate) < new Date(dateStr) ? dateStr : formData.endDate
    });
  };

  // Handle end date change
  const handleEndDateChange = (dateStr: string) => {
    setFormData({ ...formData, endDate: dateStr });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Organization Events</h1>
          <p className="text-slate-500 text-sm font-medium">Coordinate corporate milestones, training cycles and team meetups.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gradient-to-r from-indigo-100/50 to-purple-100/50 p-1 rounded-2xl border border-indigo-100/30 shadow-sm mr-2">
            <button
              onClick={() => setViewTab('board')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewTab === 'board' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              📊 Board
            </button>
            <button
              onClick={() => setViewTab('list')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewTab === 'list' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              📅 Upcoming
            </button>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white rounded-2xl hover:opacity-90 hover:shadow-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 transition-all active:scale-95"
          >
            <Icon name="Plus" className="w-5 h-5" /> Schedule Event
          </button>
        </div>
      </div>

      <div className="bg-gradient-to-br from-white via-indigo-50/20 to-purple-50/20 p-6 rounded-[32px] border border-slate-100/50 shadow-sm space-y-6">
        <div className="relative group w-full">
          <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input
            aria-label="Search events"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Lookup by event title or description..."
            className="w-full pl-12 pr-6 py-4 bg-white/50 backdrop-blur-sm border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600 shadow-inner"
          />
        </div>

        {viewTab === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? filteredEvents.map(evt => {
              const eventGradient = EVENT_GRADIENTS[evt.type] || EVENT_GRADIENTS.company;
              const eventBadgeStyle = EVENT_BADGE_STYLES[evt.type] || EVENT_BADGE_STYLES.company;
              const timeBadgeStyle = TIME_BADGE_STYLES[evt.type] || TIME_BADGE_STYLES.company;

              return (
                <div key={evt.id} className={`border rounded-[32px] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm ${eventGradient}`}>
                  {/* Animated pattern overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-current to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-md ${eventBadgeStyle}`}>
                          {EVENT_EMOJIS[evt.type]} {evt.type}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-md ${PRIORITY_BADGE_STYLES[evt.priority || 'normal']}`}>
                          {evt.priority || 'normal'}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <button title={`Edit event ${evt.title}`} aria-label={`Edit event ${evt.title}`} onClick={() => handleEdit(evt)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white/50 transition-all rounded-xl">
                          <Icon name="Edit3" className="w-4 h-4" />
                        </button>
                        <button title={`Delete event ${evt.id}`} aria-label={`Delete event ${evt.id}`} onClick={() => deleteEvent(evt.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white/50 transition-all rounded-xl">
                          <Icon name="Trash2" className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 truncate">{evt.title}</h3>
                    <p className="text-xs text-slate-700 font-medium mb-6 line-clamp-2">{evt.description}</p>

                    <div className="space-y-4 mt-auto">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-sm">
                          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">📅 Schedule</p>
                          <p className="text-[10px] font-black text-slate-800">{formatDisplayDate(evt.startDate)}</p>
                        </div>
                        <div className={`p-3 rounded-2xl border shadow-sm ${timeBadgeStyle}`}>
                          <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">⏰ Time</p>
                          <p className="text-[10px] font-black text-slate-900">{evt.startTime}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl shadow-sm">
                        <Icon name={evt.isOnline ? "Video" : "MapPin"} className={`w-4 h-4 ${evt.isOnline ? 'text-blue-600' : 'text-emerald-600'}`} />
                        <p className="text-[10px] font-bold text-slate-800 truncate">{evt.location}</p>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-white/30">
                        {evt.participations && evt.participations.length > 0 && (
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full border-2 border-white bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-[8px] font-black text-white shadow-md">
                              +{evt.participations.length}
                            </div>
                          </div>
                        )}
                        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${STATUS_COLORS[evt.status] || STATUS_COLORS.upcoming}`}>
                          {evt.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className="col-span-full py-24 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-indigo-100/50 to-purple-100/50 rounded-[32px] flex items-center justify-center mx-auto mb-6">
                  <Icon name="CalendarOff" className="w-12 h-12 text-indigo-300" />
                </div>
                <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Zero scheduled events found.</p>
                <p className="text-slate-300 text-[10px] font-medium mt-2">Try changing your search or schedule a new event</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[24px] border border-slate-100/50 backdrop-blur-sm">
            <table className="w-full text-left">
              <thead className="bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                <tr className="border-b border-slate-100/50">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">🎯 Event</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">👥 Target</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">📊 Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">⚡ Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {filteredEvents.map(evt => {
                  const eventColor = EVENT_BADGE_STYLES[evt.type] || EVENT_BADGE_STYLES.company;

                  return (
                    <tr key={evt.id} className="hover:bg-white/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-md ${eventColor}`}>
                            {EVENT_EMOJIS[evt.type]}
                          </span>
                          <div>
                            <p className="text-sm font-black text-slate-800">{evt.title}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">{formatDisplayDate(evt.startDate)} • {evt.startTime}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${eventColor}`}>
                          {evt.audience}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${STATUS_COLORS[evt.status] || STATUS_COLORS.upcoming}`}>
                          {evt.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button aria-label={`Edit event ${evt.title}`} onClick={() => handleEdit(evt)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all">
                            <Icon name="Settings" className="w-4 h-4" />
                          </button>
                          <button aria-label={`Delete event ${evt.id}`} onClick={() => deleteEvent(evt.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-xl transition-all">
                            <Icon name="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Modify Schedule" : "New Organization Event"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">🎯 Event Title</label>
            <input
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
              placeholder="e.g. Q4 Townhall Meeting"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📝 Description</label>
            <textarea
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 min-h-[100px] shadow-inner"
              placeholder="Details about the agenda, speakers, or objective..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">🏷️ Category</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={formData.type}
                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                title="Select event category"
              >
                <option value="company">🏢 Company Event</option>
                <option value="team">👥 Team Event</option>
                <option value="training">📚 Training Session</option>
                <option value="meeting">🤝 Meeting</option>
                <option value="holiday">🎉 Holiday</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">⚠️ Criticality</label>
              <div className="flex gap-2">
                {(['normal', 'important', 'critical'] as EventPriority[]).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${formData.priority === p ? PRIORITY_BADGE_STYLES[p] : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📅 Start Date</label>
              <DatePicker
                id="startDate"
                label="Select Start Date"
                value={formData.startDate || todayISO}
                onChange={handleStartDateChange}
                minDate={todayISO}
                required={true}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">⏰ Start Time</label>
              <input
                type="text"
                required
                placeholder="09:00 AM"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={formData.startTime}
                onChange={e => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📅 End Date</label>
              <DatePicker
                id="endDate"
                label="Select End Date"
                value={formData.endDate || todayISO}
                onChange={handleEndDateChange}
                minDate={formData.startDate || todayISO}
                required={false}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">⏰ End Time</label>
              <input
                type="text"
                placeholder="10:00 AM"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={formData.endTime}
                onChange={e => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-slate-50 to-indigo-50/30 rounded-[28px] border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">📍 Mode & Location</label>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-slate-500">Virtual Event</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
                  className={`w-10 h-5 rounded-full relative transition-colors shadow-sm ${formData.isOnline ? 'bg-gradient-to-r from-blue-500 to-cyan-500' : 'bg-slate-300'}`}
                  aria-label="Toggle virtual event mode"
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${formData.isOnline ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>
            <input
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700 shadow-inner"
              placeholder={formData.isOnline ? "Meeting Link (Zoom/Google Meet)" : "Physical Address / Room No."}
              value={formData.location}
              onChange={e => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">👥 Audience Scope</label>
            <div className="flex gap-2">
              {(['all', 'selected', 'department'] as EventAudience[]).map(a => (
                <button
                  key={a}
                  type="button"
                  onClick={() => setFormData({ ...formData, audience: a, targetEmployeeIds: [], targetDepartment: '' })}
                  className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${formData.audience === a ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'}`}
                >
                  {a}
                </button>
              ))}
            </div>

            {formData.audience === 'selected' && (
              <div className="space-y-3 animate-in slide-in-from-top-2">
                <div className="relative">
                  <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <input
                    type="text"
                    placeholder="🔍 Filter employees..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none shadow-inner"
                    value={empSearch}
                    onChange={e => setEmpSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-[150px] overflow-y-auto custom-scrollbar divide-y divide-slate-50 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                  {filteredEmployees.map(emp => (
                    <div key={emp.id} onClick={() => toggleEmployeeSelection(emp.id)} className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-white transition-colors group">
                      <span className="text-[10px] font-bold text-slate-700">{emp.fullName} ({emp.employeeId})</span>
                      <div className={`w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center shadow-sm ${formData.targetEmployeeIds?.includes(emp.id) ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'}`}>
                        <Icon name="Check" className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.audience === 'department' && (
              <select
                aria-label="Select target unit"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={formData.targetDepartment}
                onChange={e => setFormData({ ...formData, targetDepartment: e.target.value })}
              >
                <option value="">🎯 Select Target Unit</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
            <button type="submit" className="flex-1 py-4 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-100 hover:opacity-90 transition-all active:scale-95">
              📅 Commit To Calendar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsAdmin;