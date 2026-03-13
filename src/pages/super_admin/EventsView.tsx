
import React, { useState, useEffect, useRef } from 'react';
import { SectionHeader, Badge } from './UI.tsx';
import { Calendar as CalendarIcon, Clock, Users, Video, Coffee, PartyPopper, Plus, Trash2, Edit2, X, ChevronLeft, ChevronRight, Check, Search } from 'lucide-react';
import * as eventsApi from '../../api/events.ts';
import { getAllEmployees, getDepartments } from '../../api/users.ts';
import { AppEvent, EventPriority, EventAudience } from '../../types.ts';

interface Event {
  id: number | string;
  title: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  type: string;
  category?: string;
  attendees: number;
  description?: string;
  location?: string;
  isOnline?: boolean;
  meetingType?: string;
}

// ✅ Local date helpers (fix IST/UTC shift issues)
const toLocalISODate = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const parseLocalISODate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Icon Component */
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const iconMap: any = {
    'X': X,
    'ChevronLeft': ChevronLeft,
    'ChevronRight': ChevronRight,
    'Calendar': CalendarIcon,
    'Clock': Clock,
    'Check': Check,
    'Search': Search,
  };
  const IconComponent = iconMap[name];
  return IconComponent ? <IconComponent className={className} /> : null;
};

/** Modal Component */
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white rounded-[32px] w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-black">
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

/** Custom DatePicker */
const DatePicker = ({
  value,
  onChange,
  id,
  label,
  minDate,
  required = false,
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

  const getMaxReasonableDateISO = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return toLocalISODate(date);
  };

  const safeParseDate = (dateString: string) => {
    try {
      if (!dateString) return new Date();
      const date = parseLocalISODate(dateString);
      if (isNaN(date.getTime())) return new Date();
      const currentYear = new Date().getFullYear();
      const year = date.getFullYear();
      if (year < currentYear - 1 || year > currentYear + 1) return new Date();
      return date;
    } catch {
      return new Date();
    }
  };

  const selectedDate = value ? safeParseDate(value) : null;
  const today = new Date();
  const maxReasonableISO = getMaxReasonableDateISO();

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getMonthName = (month: number) => new Date(2000, month, 1).toLocaleString('default', { month: 'long' });

  const getYearRange = () => {
    const currentYear = currentDate.getFullYear();
    const startYear = currentYear - 1;
    return Array.from({ length: 3 }, (_, i) => startYear + i);
  };

  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = new Date(year, month, 1).getDay();

    const days: { date: Date; isCurrentMonth: boolean; isToday: boolean }[] = [];

    const prevMonthDays = getDaysInMonth(year, month - 1);
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push({ date: new Date(year, month - 1, prevMonthDays - i), isCurrentMonth: false, isToday: false });
    }

    const todayISO = toLocalISODate(today);
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateISO = toLocalISODate(date);
      days.push({ date, isCurrentMonth: true, isToday: dateISO === todayISO });
    }

    const totalCells = 42;
    const nextMonthDays = totalCells - days.length;
    for (let day = 1; day <= nextMonthDays; day++) {
      days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false, isToday: false });
    }
    return days;
  };

  const handleDateSelect = (date: Date) => {
    const iso = toLocalISODate(date);
    onChange(iso);
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

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const d = safeParseDate(dateStr);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setView('days');
      }
    };

    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={datePickerRef}>
      <label className="block text-sm font-bold text-slate-700 mb-2">{label}</label>
      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          value={value ? formatDisplayDate(value) : ''}
          onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 bg-amber-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-medium text-slate-700 cursor-pointer caret-transparent shadow-inner"
          placeholder="Select date"
          required={required}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-amber-700 transition-colors"
        >
          <Icon name="Calendar" className="w-4 h-4" />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => {
                if (view === 'days') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
                else if (view === 'months') setCurrentDate(new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1));
                else setCurrentDate(new Date(currentDate.getFullYear() - 3, currentDate.getMonth(), 1));
              }}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Icon name="ChevronLeft" className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                if (view === 'days') setView('months');
                else if (view === 'months') setView('years');
              }}
              className="px-4 py-2 font-black text-sm hover:bg-slate-50 rounded-xl transition-colors"
            >
              {view === 'days' && `${getMonthName(currentDate.getMonth())} ${currentDate.getFullYear()}`}
              {view === 'months' && currentDate.getFullYear()}
              {view === 'years' && `${getYearRange()[0]}-${getYearRange()[2]}`}
            </button>

            <button
              type="button"
              onClick={() => {
                if (view === 'days') setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
                else if (view === 'months') setCurrentDate(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), 1));
                else setCurrentDate(new Date(currentDate.getFullYear() + 3, currentDate.getMonth(), 1));
              }}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Icon name="ChevronRight" className="w-4 h-4" />
            </button>
          </div>

          {view === 'days' && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-xs font-bold text-slate-400 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dayObj, index) => {
                  const dateISO = toLocalISODate(dayObj.date);
                  const isSelected = selectedDate && toLocalISODate(selectedDate) === dateISO;
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateSelect(dayObj.date)}
                      className={`p-2 text-xs font-bold rounded-lg transition-all ${
                        isSelected
                          ? 'bg-amber-700 text-white shadow-lg'
                          : dayObj.isCurrentMonth
                          ? dayObj.isToday
                            ? 'bg-amber-100 text-amber-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                          : 'text-slate-300'
                      }`}
                    >
                      {dayObj.date.getDate()}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex justify-center">
                <button
                  type="button"
                  onClick={() => handleDateSelect(new Date())}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800"
                >
                  Today
                </button>
              </div>
            </>
          )}

          {view === 'months' && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }, (_, i) => i).map((monthIndex) => {
                const monthDate = new Date(currentDate.getFullYear(), monthIndex, 1);
                const isSelected = selectedDate && selectedDate.getFullYear() === monthDate.getFullYear() && selectedDate.getMonth() === monthIndex;

                return (
                  <button
                    key={monthIndex}
                    type="button"
                    onClick={() => handleMonthSelect(monthIndex)}
                    className={`p-3 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-amber-700 text-white shadow-lg'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {getMonthName(monthIndex).slice(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {view === 'years' && (
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {getYearRange().map((year) => {
                const isSelected = selectedDate && selectedDate.getFullYear() === year;
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearSelect(year)}
                    className={`p-3 text-xs font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-amber-700 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
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

const PRIORITY_BADGE_STYLES: any = {
  normal: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 border-slate-400/40',
  important: 'bg-gradient-to-r from-amber-500/20 to-orange-400/20 text-amber-700 border-amber-400/40',
  critical: 'bg-gradient-to-r from-rose-500/20 to-red-400/20 text-rose-700 border-rose-400/40',
};

export const EventsView = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const [employees, setEmployees] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [empSearch, setEmpSearch] = useState('');

  // Form Validation State
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({
    employees: '',
    department: ''
  });

  const todayISO = toLocalISODate(new Date());

  const [formData, setFormData] = useState<Partial<AppEvent>>({
    title: '',
    description: '',
    type: 'meeting',
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

  // Validation functions
  const validateSelectedEmployees = (): boolean => {
    if (formData.audience === 'selected' && (!formData.targetEmployeeIds || (formData.targetEmployeeIds as any[]).length === 0)) {
      setValidationErrors(prev => ({ ...prev, employees: 'Please select at least one employee' }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, employees: '' }));
    return true;
  };

  const validateSelectedDepartment = (): boolean => {
    if (formData.audience === 'department' && !formData.targetDepartment) {
      setValidationErrors(prev => ({ ...prev, department: 'Please select a department' }));
      return false;
    }
    setValidationErrors(prev => ({ ...prev, department: '' }));
    return true;
  };

  const filteredEmployees = employees.filter((e: any) => {
    const n = (e.fullName || '').toLowerCase();
    const id = (e.employeeId || '').toLowerCase();
    const s = empSearch.toLowerCase();
    return n.includes(s) || id.includes(s);
  });

  const formatDisplayDate = (dateString: string) => {
    const d = parseLocalISODate(dateString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const to24Hour = (input?: string) => {
    if (!input) return '';
    const hmsMatch = input.match(/^(\d{1,2}):(\d{2})(:(\d{2}))?(\s?(AM|PM))?$/i);
    if (!hmsMatch) return input;
    let hours = parseInt(hmsMatch[1], 10);
    const mins = hmsMatch[2];
    const secs = hmsMatch[4] || '00';
    const ampm = (hmsMatch[6] || '').toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    const hh = hours.toString().padStart(2, '0');
    return `${hh}:${mins}:${secs}`;
  };

  const normalizeEnum = (val?: string) => (val ? val.toString().toUpperCase() : undefined);

  const buildPayload = () => {
    const isVirtual = formData.isOnline === true;

    const payload: any = {
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate,
      startTime: to24Hour(formData.startTime),
      endDate: formData.endDate,
      endTime: to24Hour(formData.endTime),
      priority: normalizeEnum(formData.priority || 'normal'),
      category: normalizeEnum(formData.type || 'meeting'),
      targetType: normalizeEnum(formData.audience || 'all'),
      meetingType: isVirtual ? 'VIRTUAL' : 'PHYSICAL',
    };

    const selectedIds = ((formData.targetEmployeeIds as any[]) || []).filter(Boolean);
    if (selectedIds.length > 0) payload.employeeIds = selectedIds;
    if (formData.targetDepartment) payload.departments = [formData.targetDepartment];

    if (formData.location?.trim()) {
      payload.meetingLink = formData.location;
    }

    return payload;
  };

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Loading events...');
      const data = await eventsApi.getEvents();
      console.log('Events loaded:', data);
      if (Array.isArray(data)) {
        const transformed: Event[] = data.map((evt: any) => ({
          id: evt.id || evt.eventId || String(Date.now()),
          title: String(evt.title || evt.name || 'Untitled Event'),
          startDate: String(evt.startDate || evt.date || evt.eventDate || new Date().toISOString().split('T')[0]),
          startTime: String(evt.startTime || evt.time || evt.eventTime || '09:00 AM'),
          endDate: String(evt.endDate || evt.startDate || evt.date || new Date().toISOString().split('T')[0]),
          endTime: String(evt.endTime || evt.time || evt.eventTime || '10:00 AM'),
          type: String(evt.category || evt.type || evt.eventType || 'meeting').toLowerCase(),
          attendees: Number(evt.attendees || evt.attendeeCount || 0),
          description: String(evt.description || ''),
          location: String(evt.location || evt.meetingLink || ''),
          isOnline: evt.meetingType === 'VIRTUAL' || evt.isOnline === true,
        }));
        setEvents(transformed);
      }
    } catch (err: any) {
      console.error('Error loading events:', err);
      setError(err?.message || 'Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
    fetchEmployees();
    fetchDepartments();
  }, []);

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch employees:', err);
      setEmployees([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error('Failed to fetch departments:', err);
      setDepartments([]);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setFormData((prev) => {
      const current = (prev.targetEmployeeIds as any[]) || [];
      const next = current.includes(employeeId) ? current.filter((cid) => cid !== employeeId) : [...current, employeeId];
      return { ...prev, targetEmployeeIds: next };
    });
    // Clear error when employee is selected/deselected
    if (validationErrors.employees) {
      setValidationErrors(prev => ({ ...prev, employees: '' }));
    }
  };

  const handleAddNew = () => {
    setIsNew(true);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'meeting',
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
    setEmpSearch('');
    setValidationErrors({ employees: '', department: '' });
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    setIsNew(false);
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      type: event.type as any,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location || '',
      isOnline: event.isOnline || false,
      audience: 'all',
      targetEmployeeIds: [],
      targetDepartment: '',
      status: 'upcoming',
      priority: 'normal',
      isPublished: true,
    });
    setEmpSearch('');
    setValidationErrors({ employees: '', department: '' });
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setIsNew(true);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      type: 'meeting',
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
    setEmpSearch('');
    setValidationErrors({ employees: '', department: '' });
  };

  const handleStartDateChange = (dateStr: string) => {
    setFormData((prev) => ({
      ...prev,
      startDate: dateStr,
      endDate: !prev.endDate || parseLocalISODate(prev.endDate) < parseLocalISODate(dateStr) ? dateStr : prev.endDate,
    }));
  };

  const handleEndDateChange = (dateStr: string) => {
    setFormData((prev) => ({ ...prev, endDate: dateStr }));
  };

  const handleSave = async () => {
    try {
      if (!formData.title?.trim()) {
        setError('Event title is required.');
        return;
      }
      if (!formData.description?.trim()) {
        setError('Event description is required.');
        return;
      }

      const selectedStartDate = parseLocalISODate(formData.startDate as string);
      if (isNaN(selectedStartDate.getTime())) {
        setError('Invalid start date selected.');
        return;
      }

      const todayStart = startOfDay(new Date());
      if (startOfDay(selectedStartDate) < todayStart) {
        setError('Start date cannot be in the past.');
        return;
      }

      if (formData.endDate) {
        const selectedEndDate = parseLocalISODate(formData.endDate as string);
        if (isNaN(selectedEndDate.getTime())) {
          setError('Invalid end date selected.');
          return;
        }
        if (startOfDay(selectedEndDate) < startOfDay(selectedStartDate)) {
          setError('End date cannot be before start date.');
          return;
        }
      }

      if (!formData.isOnline && !formData.location?.trim()) {
        setError('Location is required for physical events.');
        return;
      }

      if (formData.audience === 'selected' && (!formData.targetEmployeeIds || (formData.targetEmployeeIds as any[]).length === 0)) {
        setValidationErrors(prev => ({ ...prev, employees: 'Please select at least one employee for targeted events.' }));
        setError('Please select at least one employee for targeted events.');
        return;
      }

      if (formData.audience === 'department' && !formData.targetDepartment) {
        setValidationErrors(prev => ({ ...prev, department: 'Please select a department for department-based events.' }));
        setError('Please select a department for department-based events.');
        return;
      }

      setLoading(true);
      const payload = buildPayload();
      console.log('Creating/updating event with payload:', payload);

      if (isNew) {
        const result = await eventsApi.createEvent(payload);
        console.log('Event created:', result);
      } else if (selectedEvent) {
        const result = await eventsApi.updateEvent(selectedEvent.id, payload);
        console.log('Event updated:', result);
      }

      setIsModalOpen(false);
      setError(null);
      resetForm();
      await loadEvents();
    } catch (err: any) {
      console.error('Error saving event:', err);
      setError(err?.message || 'Failed to save event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: number | string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      const result = await eventsApi.deleteEvent(eventId);
      console.log('Event deleted:', result);
      await loadEvents();
      setError(null);
    } catch (err: any) {
      console.error('Error deleting event:', err);
      setError(err?.message || 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'meeting': return <Video size={18} className="text-amber-700" />;
      case 'holiday': return <PartyPopper size={18} className="text-rose-400" />;
      case 'training': return <Coffee size={18} className="text-amber-400" />;
      default: return <CalendarIcon size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader 
        title="Company Events" 
        description="Upcoming meetings, workshops, and organizational milestones."
        actions={
          <button
            onClick={handleAddNew}
            className="flex items-center justify-center gap-2 bg-amber-700 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl shadow-amber-200 hover:bg-amber-800 transition-all transform hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto text-white"
          >
            <Plus size={18} />
            <span>New Event</span>
          </button>
        }
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-700 font-medium">⚠️ {error}</p>
        </div>
      )}

      {loading && !events.length ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
          <p className="text-gray-500 mt-2">Loading events...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:border-amber-200 transition-all shadow-xl group">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gray-100 border border-gray-200 group-hover:bg-amber-50 group-hover:border-amber-100 transition-all`}>
                  {getIcon(event.type)}
                </div>
                <Badge color={event.type === 'holiday' ? 'red' : event.type === 'training' ? 'yellow' : 'amber'}>
                  {event.type.toUpperCase()}
                </Badge>
              </div>

              <h3 className="font-bold text-lg text-gray-900 mb-2">{event.title}</h3>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CalendarIcon size={14} className="text-amber-700" />
                  {formatDisplayDate(event.startDate)}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Clock size={14} className="text-amber-700" />
                  {event.startTime}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <Users size={14} className="text-amber-700" />
                  {event.attendees} Registered Attendees
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(event)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-900 hover:bg-amber-50 hover:border-amber-200 transition-all uppercase tracking-wider focus:ring-4 focus:ring-amber-600/50 flex items-center justify-center gap-1"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(event.id)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-200 transition-all uppercase tracking-wider focus:ring-4 focus:ring-red-500/50 flex items-center justify-center gap-1"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Updated Modal with Admin UI */}
      <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); setError(null); }} title={isNew ? 'New Organization Event' : 'Modify Schedule'}>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">🎯 Event Title</label>
            <input
              required
              className="w-full px-6 py-4 bg-amber-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-600 outline-none font-medium text-slate-700 shadow-inner"
              placeholder="e.g. Q4 Townhall Meeting"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📝 Description</label>
            <textarea
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-600 outline-none font-medium text-slate-700 min-h-[100px] shadow-inner"
              placeholder="Details about the agenda, speakers, or objective..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">🏷️ Category</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-amber-600 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={formData.type as any}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
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
                {(['normal', 'important', 'critical'] as (EventPriority | 'critical')[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p as EventPriority })}
                    className={`flex-1 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                      formData.priority === p ? PRIORITY_BADGE_STYLES[p] : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                    }`}
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
              <DatePicker id="startDate" label="" value={(formData.startDate as any) || todayISO} onChange={handleStartDateChange} minDate={todayISO} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">⏰ Start Time</label>
              <input
                type="text"
                required
                placeholder="09:00 AM"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-amber-600 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={(formData.startTime as any) || ''}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📅 End Date</label>
              <DatePicker
                id="endDate"
                label=""
                value={(formData.endDate as any) || todayISO}
                onChange={handleEndDateChange}
                minDate={(formData.startDate as any) || todayISO}
                required={false}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">⏰ End Time</label>
              <input
                type="text"
                placeholder="10:00 AM"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-amber-600 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={(formData.endTime as any) || ''}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="p-6 bg-gradient-to-br from-slate-50 to-amber-50/30 rounded-[28px] border border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest ml-1">📍 Mode & Location</label>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase text-slate-500">Virtual Event</span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, isOnline: !formData.isOnline })}
                  className={`w-10 h-5 rounded-full relative transition-colors shadow-sm ${formData.isOnline ? 'bg-gradient-to-r from-amber-700 to-orange-600' : 'bg-slate-300'}`}
                  aria-label="Toggle virtual event mode"
                >
                  <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all shadow-sm ${formData.isOnline ? 'left-6' : 'left-1'}`}></div>
                </button>
              </div>
            </div>

            <input
              required
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-600 outline-none text-xs font-bold text-slate-700 shadow-inner"
              placeholder={formData.isOnline ? 'Meeting Link (Zoom/Google Meet)' : 'Physical Address / Room No.'}
              value={(formData.location as any) || ''}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">👥 Audience Scope</label>
            <div className="flex gap-2">
              {(['all', 'selected', 'department'] as EventAudience[]).map((a) => (
                <button
                  key={a}
                  type="button"
                  onClick={() => {
                    setFormData({ ...formData, audience: a, targetEmployeeIds: [], targetDepartment: '' });
                    setValidationErrors({ employees: '', department: '' });
                  }}
                  className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    formData.audience === a ? 'bg-gradient-to-r from-amber-700 to-orange-600 border-transparent text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
                  }`}
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
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none shadow-inner text-black"
                    value={empSearch}
                    onChange={(e) => setEmpSearch(e.target.value)}
                  />
                </div>

                <div className="max-h-[150px] overflow-y-auto custom-scrollbar divide-y divide-slate-50 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
                  {filteredEmployees.map((emp: any) => (
                    <div
                      key={emp.employeeId}
                      onClick={() => toggleEmployeeSelection(emp.employeeId)}
                      className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-white transition-colors group"
                    >
                      <span className="text-[10px] font-bold text-slate-700">
                        {emp.fullName} ({emp.employeeId})
                      </span>
                      <div
                        className={`w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center shadow-sm ${
                          (formData.targetEmployeeIds as any[])?.includes(emp.employeeId)
                            ? 'bg-gradient-to-r from-amber-700 to-orange-600 border-transparent text-white'
                            : 'bg-white border-slate-200 text-transparent group-hover:border-amber-200'
                        }`}
                      >
                        <Icon name="Check" className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  ))}
                </div>

                {validationErrors.employees && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 p-2 bg-red-50 rounded-lg border border-red-200">
                    <span>⚠️</span> {validationErrors.employees}
                  </p>
                )}
              </div>
            )}

            {formData.audience === 'department' && (
              <div className="space-y-3">
                <select
                  aria-label="Select target department"
                  className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                  value={(formData.targetDepartment as any) || ''}
                  onChange={(e) => {
                    setFormData({ ...formData, targetDepartment: e.target.value });
                    if (validationErrors.department) {
                      setValidationErrors(prev => ({ ...prev, department: '' }));
                    }
                  }}
                >
                  <option value="">🎯 Select Target Department</option>
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                {validationErrors.department && (
                  <p className="text-xs text-red-600 font-semibold flex items-center gap-1 p-2 bg-red-50 rounded-lg border border-red-200">
                    <span>⚠️</span> {validationErrors.department}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-100 hover:opacity-90 transition-all active:scale-95"
            >
              📅 Commit To Calendar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

