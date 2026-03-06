import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { AppEvent, EventPriority, EventAudience } from '../../types.ts';
import {
  getEvents,
  createEvent as apiCreateEvent,
  updateEvent as apiUpdateEvent,
  deleteEvent as apiDeleteEvent,
} from '../../api/events.js';
import { getAllEmployees, getDepartments } from '../../api/users.ts';
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
      <div
        className={`bg-white rounded-[32px] w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}
      >
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

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDangerous = false,
  isLoading = false,
}: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white rounded-[24px] w-full max-w-md relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isDangerous ? 'bg-rose-100' : 'bg-indigo-100'}`}>
              <Icon name={isDangerous ? 'AlertTriangle' : 'HelpCircle'} className={`w-6 h-6 ${isDangerous ? 'text-rose-600' : 'text-indigo-600'}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-black text-slate-900">{title}</h3>
              <p className="text-sm text-slate-600 mt-1">{message}</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 flex gap-3 justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-slate-600 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-xl transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg disabled:opacity-60 ${
              isDangerous
                ? 'bg-gradient-to-r from-rose-600 to-red-500 hover:opacity-90 shadow-rose-200'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 shadow-indigo-200'
            }`}
          >
            {isLoading ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

/** ✅ Local date helpers (fix IST/UTC shift issues) */
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
      // parse local yyyy-mm-dd
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
              {view === 'days' && (
                <>
                  {getMonthName(currentDate.getMonth())} {currentDate.getFullYear()}
                </>
              )}
              {view === 'months' && <>{currentDate.getFullYear()}</>}
              {view === 'years' && (
                <>
                  {getYearRange()[0]} - {getYearRange()[2]}
                </>
              )}
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
                  const dayISO = toLocalISODate(dayObj.date);

                  const min = minDate ? startOfDay(parseLocalISODate(minDate)) : startOfDay(new Date());
                  const max = startOfDay(parseLocalISODate(maxReasonableISO));

                  const isSelected = selectedDate ? toLocalISODate(selectedDate) === dayISO : false;
                  const isValidDate = startOfDay(dayObj.date) >= min && startOfDay(dayObj.date) <= max;

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
                  onClick={() => handleDateSelect(new Date())}
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
                const isSelected = selectedDate && selectedDate.getFullYear() === monthDate.getFullYear() && selectedDate.getMonth() === monthIndex;

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

const EVENT_GRADIENTS: any = {
  holiday: 'bg-gradient-to-br from-rose-500/20 via-pink-400/15 to-red-400/10 border-rose-200/60 shadow-rose-100/30',
  training: 'bg-gradient-to-br from-indigo-500/20 via-purple-400/15 to-violet-400/10 border-indigo-200/60 shadow-indigo-100/30',
  meeting: 'bg-gradient-to-br from-blue-500/20 via-cyan-400/15 to-teal-400/10 border-blue-200/60 shadow-blue-100/30',
  company: 'bg-gradient-to-br from-emerald-500/20 via-green-400/15 to-lime-400/10 border-emerald-200/60 shadow-emerald-100/30',
  team: 'bg-gradient-to-br from-amber-500/20 via-orange-400/15 to-yellow-400/10 border-amber-200/60 shadow-amber-100/30',
};

const EVENT_BADGE_STYLES: any = {
  holiday: 'bg-gradient-to-r from-rose-600 via-pink-500 to-rose-500 text-white border-rose-400/40',
  training: 'bg-gradient-to-r from-indigo-600 via-purple-500 to-indigo-500 text-white border-indigo-400/40',
  meeting: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 text-white border-blue-400/40',
  company: 'bg-gradient-to-r from-emerald-600 via-green-500 to-emerald-500 text-white border-emerald-400/40',
  team: 'bg-gradient-to-r from-amber-600 via-orange-500 to-amber-500 text-white border-amber-400/40',
};

const TIME_BADGE_STYLES: any = {
  holiday: 'bg-gradient-to-r from-rose-500/30 to-pink-400/30 text-rose-800 border-rose-300/60',
  training: 'bg-gradient-to-r from-indigo-500/30 to-purple-400/30 text-indigo-800 border-indigo-300/60',
  meeting: 'bg-gradient-to-r from-blue-500/30 to-cyan-400/30 text-blue-800 border-blue-300/60',
  company: 'bg-gradient-to-r from-emerald-500/30 to-green-400/30 text-emerald-800 border-emerald-300/60',
  team: 'bg-gradient-to-r from-amber-500/30 to-orange-400/30 text-amber-800 border-amber-300/60',
};

const STATUS_COLORS: any = {
  upcoming: 'bg-gradient-to-r from-emerald-500/20 to-green-400/20 text-emerald-700 border-emerald-400/40',
  ongoing: 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 text-blue-700 border-blue-400/40',
  completed: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 border-slate-400/40',
  cancelled: 'bg-gradient-to-r from-rose-500/20 to-pink-400/20 text-rose-700 border-rose-400/40',
};

const PRIORITY_BADGE_STYLES: any = {
  normal: 'bg-gradient-to-r from-slate-500/20 to-slate-400/20 text-slate-700 border-slate-400/40',
  important: 'bg-gradient-to-r from-amber-500/20 to-orange-400/20 text-amber-700 border-amber-400/40',
  critical: 'bg-gradient-to-r from-rose-500/20 to-red-400/20 text-rose-700 border-rose-400/40',
};

const EVENT_EMOJIS: any = {
  holiday: '🎉',
  training: '📚',
  meeting: '🤝',
  company: '🏢',
  team: '👥',
};

const EventsAdmin: React.FC = () => {
  const { notify } = useHRMS();

  const [employees, setEmployees] = useState<any[]>([]);
  const [eventsLocal, setEventsLocal] = useState<AppEvent[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [empSearch, setEmpSearch] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'board' | 'list'>('board');

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  const todayISO = toLocalISODate(new Date());

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

  const formatDisplayDate = (dateString: string) => {
    const d = parseLocalISODate(dateString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const filteredEvents = useMemo(() => {
    return eventsLocal.filter((e: any) => {
      const t = (e.title || '').toLowerCase();
      const d = (e.description || '').toLowerCase();
      const s = searchTerm.toLowerCase();
      return t.includes(s) || d.includes(s);
    });
  }, [eventsLocal, searchTerm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((e: any) => {
      const n = (e.fullName || '').toLowerCase();
      const id = (e.employeeId || '').toLowerCase();
      const s = empSearch.toLowerCase();
      return n.includes(s) || id.includes(s);
    });
  }, [employees, empSearch]);

  const fetchEvents = async () => {
    try {
      const data = await getEvents();
      setEventsLocal(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notify(err?.message || 'Failed to fetch events', 'error');
      setEventsLocal([]);
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      // if your API already returns array -> set it. if not -> empty
      setEmployees(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notify(err?.message || 'Failed to fetch employees', 'error');
      setEmployees([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getDepartments();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      notify(err?.message || 'Failed to fetch departments', 'error');
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchEvents();
    fetchEmployees();
    fetchDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    setEditingId((evt as any).id);
    setFormData(evt);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setEventToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setEventToDelete(null);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      await apiDeleteEvent(eventToDelete); // ✅ DELETE /api/events/{eventId}
      setDeleteConfirmOpen(false);
      setEventToDelete(null);
      await fetchEvents(); // ✅ refresh immediately
    } catch (err: any) {
      notify(err?.message || 'Failed to delete event. Please try again.', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleEmployeeSelection = (employeeId: string) => {
    setFormData((prev) => {
      const current = (prev.targetEmployeeIds as any[]) || [];
      const next = current.includes(employeeId) ? current.filter((cid) => cid !== employeeId) : [...current, employeeId];
      return { ...prev, targetEmployeeIds: next };
    });
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
    // ✅ Explicit: if isOnline is true → VIRTUAL, otherwise → PHYSICAL
    const isVirtual = formData.isOnline === true;

    const payload: any = {
      title: formData.title,
      description: formData.description,
      startDate: formData.startDate, // yyyy-mm-dd
      startTime: to24Hour(formData.startTime),
      endDate: formData.endDate,
      endTime: to24Hour(formData.endTime),
      priority: normalizeEnum(formData.priority || 'normal'),
      category: normalizeEnum(formData.type || 'company'),
      targetType: normalizeEnum(formData.audience || 'all'),
      meetingType: isVirtual ? 'VIRTUAL' : 'PHYSICAL',
    };

    // ✅ targetEmployeeIds already contains employeeIds, no mapping needed
    const selectedIds = ((formData.targetEmployeeIds as any[]) || [])
      .filter(Boolean);

    if (selectedIds.length > 0) payload.employeeIds = selectedIds;
    if (formData.targetDepartment) payload.departments = [formData.targetDepartment];

    // ✅ Always use meetingLink for both VIRTUAL and PHYSICAL
    // For VIRTUAL: meetingLink = meeting URL
    // For PHYSICAL: meetingLink = physical location/address
    if (formData.location?.trim()) {
      payload.meetingLink = formData.location;
    }

    return payload;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) return notify('Event title is required.', 'warning');
    if (!formData.description?.trim()) return notify('Event description is required.', 'warning');
    if (!formData.startDate) return notify('Start date is required.', 'warning');

    // ✅ local-date validations
    const selectedStartDate = parseLocalISODate(formData.startDate);
    if (isNaN(selectedStartDate.getTime())) return notify('Invalid start date selected.', 'warning');

    const todayStart = startOfDay(new Date());
    if (startOfDay(selectedStartDate) < todayStart) return notify('Start date cannot be in the past.', 'warning');

    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    if (startOfDay(selectedStartDate) > startOfDay(maxDate)) return notify('Start date cannot be more than 1 year in the future.', 'warning');

    if (formData.endDate) {
      const selectedEndDate = parseLocalISODate(formData.endDate);
      if (isNaN(selectedEndDate.getTime())) return notify('Invalid end date selected.', 'warning');
      if (startOfDay(selectedEndDate) < startOfDay(selectedStartDate)) return notify('End date cannot be before start date.', 'warning');
    }

    if (formData.audience === 'selected' && (!formData.targetEmployeeIds || (formData.targetEmployeeIds as any[]).length === 0))
      return notify('Please select at least one employee for targeted events.', 'warning');

    if (formData.audience === 'department' && !formData.targetDepartment)
      return notify('Please select a department for department-based events.', 'warning');

    // ✅ if isOnline is disabled (physical event), location is required
    const hasLocation = !!formData.location?.trim();
    if (!formData.isOnline && !hasLocation) 
      return notify('Location is required for physical events.', 'warning');

    (async () => {
      try {
        const payload = buildPayload();
        console.log('Creating/updating event with payload:', payload);

        if (editingId) {
          await apiUpdateEvent(editingId, payload);
        } else {
          await apiCreateEvent(payload);
        }

        // ✅ close overlay + refresh events hub
        setIsModalOpen(false);
        resetForm();
        await fetchEvents();
      } catch (err: any) {
        notify(err?.message || 'Failed to save event', 'error');
      }
    })();
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
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                viewTab === 'board' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              📊 Board
            </button>
            <button
              onClick={() => setViewTab('list')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                viewTab === 'list' ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-indigo-600'
              }`}
            >
              📅 Upcoming
            </button>
          </div>

          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
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
            {filteredEvents.length > 0 ? (
              filteredEvents.map((evt: any) => {
                // normalize fields coming from API
                const typeKey = (evt.type || evt.category || 'company').toString().toLowerCase();
                const priorityKey = (evt.priority || 'normal').toString().toLowerCase();
                const isOnline = evt.isOnline === true || (evt.meetingType && evt.meetingType.toString().toUpperCase() === 'VIRTUAL');
                // meetingLink from API can be either virtual link or physical location
                const locationText = (evt.location && evt.location.toString().trim()) || (evt.meetingLink && evt.meetingLink.toString().trim()) || '';
                const isMeetingUrl = (() => {
                  try {
                    if (!locationText) return false;
                    const u = new URL(locationText);
                    return u.protocol === 'http:' || u.protocol === 'https:';
                  } catch (e) {
                    return false;
                  }
                })();

                const eventGradient = EVENT_GRADIENTS[typeKey] || EVENT_GRADIENTS.company;
                const eventBadgeStyle = EVENT_BADGE_STYLES[typeKey] || EVENT_BADGE_STYLES.company;
                const timeBadgeStyle = TIME_BADGE_STYLES[typeKey] || TIME_BADGE_STYLES.company;

                const displayType = typeKey; // e.g. 'company'
                const displayPriority = priorityKey; // e.g. 'normal'

                return (
                  <div
                    key={evt.id}
                    className={`border rounded-[32px] p-6 hover:shadow-2xl hover:scale-[1.02] transition-all group flex flex-col justify-between relative overflow-hidden backdrop-blur-sm ${eventGradient}`}
                  >
                    {/* ✅ FIX: overlay must NOT block clicks */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-current to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                    </div>

                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                         
                          <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border shadow-md ${PRIORITY_BADGE_STYLES[displayPriority]}`}>
                            {displayPriority}
                          </span>
                        </div>

                        <div className="flex gap-1">
                          <button
                            title={`Edit event ${evt.title}`}
                            aria-label={`Edit event ${evt.title}`}
                            onClick={() => handleEdit(evt)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white/50 transition-all rounded-xl"
                          >
                            <Icon name="Edit3" className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            title={`Delete event ${evt.id}`}
                            aria-label={`Delete event ${evt.id}`}
                            onClick={() => handleDeleteClick(evt.id)}
                            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-white/50 transition-all rounded-xl"
                          >
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
                          <Icon name={isMeetingUrl ? 'ExternalLink' : 'MapPin'} className={`w-4 h-4 ${isMeetingUrl ? 'text-blue-600' : 'text-emerald-600'}`} />
                          {isMeetingUrl ? (
                            <a href={locationText} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-800 underline truncate">
                              {locationText}
                            </a>
                          ) : (
                            <p className="text-[10px] font-bold text-slate-800 truncate">{locationText || 'Location TBD'}</p>
                          )}
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
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
                  <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest">👥 Target</th>                  <th className="px-8 py-5 text-[10px] font-black text-slate-600 uppercase tracking-widest text-right">⚡ Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-50/50">
                {filteredEvents.map((evt: any) => {
                  const typeKey = (evt.type || evt.category || 'company').toString().toLowerCase();
                  const priorityKey = (evt.priority || 'normal').toString().toLowerCase();
                  const isOnline = evt.isOnline === true || (evt.meetingType && evt.meetingType.toString().toUpperCase() === 'VIRTUAL');
                  const locationText = (evt.location && evt.location.toString().trim()) || (evt.meetingLink && evt.meetingLink.toString().trim()) || '';
                  const isMeetingUrl = (() => {
                    try {
                      if (!locationText) return false;
                      const u = new URL(locationText);
                      return u.protocol === 'http:' || u.protocol === 'https:';
                    } catch (e) {
                      return false;
                    }
                  })();
                  const eventColor = EVENT_BADGE_STYLES[typeKey] || EVENT_BADGE_STYLES.company;
                  // audience may come from API under different key (targetType) or uppercase
                  let audienceLabel = (
                    evt.audience ||
                    (evt.targetType && evt.targetType.toString().toLowerCase()) ||
                    'all'
                  ).toString().toLowerCase();
                  // API sometimes doesn't return audience/targetType at all, just employeeIds or departments array.
                  if (
                    (!evt.audience && !evt.targetType) &&
                    Array.isArray(evt.employeeIds) &&
                    evt.employeeIds.length > 0
                  ) {
                    audienceLabel = 'selected';
                  }
                  if (
                    (!evt.audience && !evt.targetType) &&
                    Array.isArray(evt.departments) &&
                    evt.departments.length > 0
                  ) {
                    audienceLabel = 'department';
                  }

                  // derive display string for badge
                  let targetDisplay = audienceLabel;
                  if (audienceLabel === 'selected') {
                    // prefer the explicit targetEmployeeIds field (our local form) if present
                    const count = Array.isArray(evt.targetEmployeeIds)
                      ? evt.targetEmployeeIds.length
                      : Array.isArray(evt.employeeIds)
                      ? evt.employeeIds.length
                      : 0;
                    targetDisplay = count ? `${count} selected` : 'selected';
                  } else if (audienceLabel === 'department') {
                    targetDisplay = evt.targetDepartment
                      ? evt.targetDepartment
                      : Array.isArray(evt.departments) && evt.departments.length
                      ? evt.departments[0]
                      : 'department';
                  }

                  return (
                    <tr key={evt.id} className="hover:bg-white/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-md ${eventColor}`}>{EVENT_EMOJIS[typeKey] || EVENT_EMOJIS.company}</span>
                          <div>
                            <p className="text-sm font-black text-slate-800">{evt.title}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase">
                              {formatDisplayDate(evt.startDate)} • {evt.startTime}
                            </p>
                            <div className="mt-1 flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${eventColor}`}>{typeKey}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm ${PRIORITY_BADGE_STYLES[priorityKey]}`}>{priorityKey}</span>
                              {isMeetingUrl ? (
                                <a href={locationText} target="_blank" rel="noopener noreferrer" className="text-[10px] text-slate-500 underline">
                                  {locationText}
                                </a>
                              ) : (
                                <span className="text-[10px] text-slate-500">{locationText || ''}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6">
                        <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${eventColor}`}>{targetDisplay}</span>
                      </td>

                      

                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button aria-label={`Edit event ${evt.title}`} onClick={() => handleEdit(evt)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-xl transition-all">
                            <Icon name="Settings" className="w-4 h-4" />
                          </button>
                          <button type="button" aria-label={`Delete event ${evt.id}`} onClick={() => handleDeleteClick(evt.id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50/50 rounded-xl transition-all">
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Modify Schedule' : 'New Organization Event'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">🎯 Event Title</label>
            <input
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
              placeholder="e.g. Q4 Townhall Meeting"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">📝 Description</label>
            <textarea
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 min-h-[100px] shadow-inner"
              placeholder="Details about the agenda, speakers, or objective..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">🏷️ Category</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
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
                {(['normal', 'important', 'critical'] as EventPriority[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
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
              <DatePicker id="startDate" label="Select Start Date" value={(formData.startDate as any) || todayISO} onChange={handleStartDateChange} minDate={todayISO} required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">⏰ Start Time</label>
              <input
                type="text"
                required
                placeholder="09:00 AM"
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
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
                label="Select End Date"
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
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={(formData.endTime as any) || ''}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
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
                  onClick={() => setFormData({ ...formData, audience: a, targetEmployeeIds: [], targetDepartment: '' })}
                  className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all shadow-sm ${
                    formData.audience === a ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100 hover:bg-slate-50'
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
                            ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-transparent text-white'
                            : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'
                        }`}
                      >
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
                value={(formData.targetDepartment as any) || ''}
                onChange={(e) => setFormData({ ...formData, targetDepartment: e.target.value })}
              >
                <option value="">🎯 Select Target Unit</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">
              Discard
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-purple-100 hover:opacity-90 transition-all active:scale-95"
            >
              📅 Commit To Calendar
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action will send cancellation notices to all participants and cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDangerous={true}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default EventsAdmin;
