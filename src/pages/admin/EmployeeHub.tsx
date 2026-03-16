import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { EmployeeSummary } from '../../types.ts';
import { DEPARTMENTS, LOCATIONS } from '../../constants.ts';
import { getAllEmployees } from '../../api/users.js';

const Icon = ({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} onClick={onClick} /> : null;
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with proper stacking */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal container */}
      <div className="relative z-50 bg-white rounded-[32px] w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white rounded-t-[32px] z-10">
          <h2 className="text-2xl font-black text-black">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            title="Close"
            className="p-3 hover:bg-slate-50 rounded-2xl transition-colors"
          >
            <Icon name="X" className="w-6 h-6 text-black" />
          </button>
        </div>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto invisible-scrollbar p-8">
          {children}
        </div>
      </div>
    </div>
  );
};

// Custom DatePicker Component with modern UI
const DatePicker = ({
  value,
  onChange,
  id,
  label,
  maxDate,
  minDate,
  required = false
}: {
  value: string;
  onChange: (value: string) => void;
  id: string;
  label: string;
  maxDate?: string;
  minDate?: string;
  required?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'days' | 'months' | 'years'>('days');
  const datePickerRef = useRef<HTMLDivElement>(null);

  // Get current date in YYYY-MM-DD format
  const getTodayDate = () => new Date().toISOString().split('T')[0];

  // Get max reasonable date (current year + 100 years)
  const getMaxReasonableDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 100);
    return date.toISOString().split('T')[0];
  };

  // Get min reasonable date (current year - 100 years)
  const getMinReasonableDate = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date.toISOString().split('T')[0];
  };

  // Safe date parsing
  const safeParseDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      // Check if date is valid and reasonable
      if (isNaN(date.getTime())) {
        return new Date();
      }

      // Check if year is reasonable (between 1900 and current year + 100)
      const currentYear = new Date().getFullYear();
      const year = date.getFullYear();
      if (year < 1900 || year > currentYear + 100) {
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
  const minReasonable = getMinReasonableDate();

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
    const startYear = currentYear - 12;
    return Array.from({ length: 25 }, (_, i) => startYear + i);
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
      <label htmlFor={id} className="text-[10px] font-black text-black uppercase tracking-widest ml-1">
        {label} {required && '*'}
      </label>

      <div className="relative">
        <input
          id={id}
          type="text"
          readOnly
          value={value ? formatDisplayDate(value) : ''}
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-medium text-black cursor-pointer caret-transparent"
          placeholder="Select date"
          required={required}
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-black hover:text-amber-700 transition-colors"
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
                  setCurrentDate(new Date(currentDate.getFullYear() - 25, currentDate.getMonth(), 1));
                }
              }}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Icon name="ChevronLeft" className="w-4 h-4 text-black" />
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
              className="px-4 py-2 font-black text-sm text-black hover:bg-slate-50 rounded-xl transition-colors"
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
                <>{getYearRange()[0]} - {getYearRange()[24]}</>
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
                  setCurrentDate(new Date(currentDate.getFullYear() + 25, currentDate.getMonth(), 1));
                }
              }}
              className="p-2 hover:bg-slate-50 rounded-xl transition-colors"
            >
              <Icon name="ChevronRight" className="w-4 h-4 text-black" />
            </button>
          </div>

          {/* Days View */}
          {view === 'days' && (
            <>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-center text-[10px] font-black text-black uppercase tracking-widest py-1">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {generateCalendarDays().map((dayObj, index) => {
                  const dayStr = dayObj.date.toISOString().split('T')[0];
                  const isSelected = selectedDate && selectedDate.toISOString().split('T')[0] === dayStr;

                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleDateSelect(dayObj.date)}
                      disabled={dayObj.date > new Date(maxReasonable) || dayObj.date < new Date(minReasonable)}
                      className={`
                        p-2 rounded-xl text-sm font-medium transition-all
                        ${dayObj.isCurrentMonth ? 'text-black' : 'text-slate-400'}
                        ${dayObj.isToday ? 'bg-[#f0e6dc] text-black font-black' : ''}
                        ${isSelected ? 'text-white font-black' : ''}
                        ${!isSelected && !dayObj.isToday ? 'hover:bg-slate-50' : ''}
                        ${!dayObj.isCurrentMonth ? 'cursor-default' : ''}
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                      style={{backgroundColor: isSelected ? '#c97a4c' : ''}}
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
                  className="px-4 py-2 bg-slate-50 text-black text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-100 transition-colors"
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
                      ${isSelected ? 'bg-amber-700 text-white font-black' : 'text-black hover:bg-slate-50'}
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
            <div className="grid grid-cols-4 gap-2 max-h-64 overflow-y-auto invisible-scrollbar">
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
                      ${isSelected ? 'bg-amber-700 text-white font-black' : 'text-black hover:bg-slate-50'}
                      ${year === today.getFullYear() ? 'ring-2 ring-amber-200' : ''}
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

const EmployeeHub: React.FC = () => {
  const navigate = useNavigate();
  const { employees, addEmployee, deleteEmployee, updateEmployee, syncEmployees, notify, addLog } = useHRMS();
  const [view, setView] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<EmployeeSummary | null>(null);
  const [terminationReason, setTerminationReason] = useState('');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const initializeRef = useRef(false); // Track if we've already fetched from API

  const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship'];
  const ROLES = ['Employee', 'HR', 'Manager']; // Added ROLES constant

  // Get current date for date of joining
  const getCurrentDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Get max reasonable date for date of birth
  const getMaxDateOfBirth = () => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 16); // Minimum 16 years old
    return date.toISOString().split('T')[0];
  };

  const [newEmp, setNewEmp] = useState({
    firstName: '',
    lastName: '',
    employeeId: '',
    email: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    dateOfJoining: getCurrentDate(),
    designation: '',
    department: DEPARTMENTS[0],
    location: LOCATIONS[0],
    employmentType: EMPLOYMENT_TYPES[0],
    role: ROLES[0], // Added role field with default value
    password: 'defaultPassword123'
  });

  const [formErrors, setFormErrors] = useState({
    email: '',
    employeeId: '',
    phone: ''
  });

  // Fetch employees from backend API (idempotent). Reusable for mount/refresh.
  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      const empList = Array.isArray(data) ? data : data.data || [];

      // Deduplicate the fetched list by ID to prevent duplicates from backend
      const seenIds = new Set<string>();
      const uniqueEmpList = empList.filter((emp: any) => {
        const empId = emp.id || emp._id || emp.employeeId || emp.email;
        if (seenIds.has(empId)) {
          console.warn(`Duplicate employee ID detected: ${empId}, skipping...`);
          return false;
        }
        seenIds.add(empId);
        return true;
      });

      // Map backend response to EmployeeSummary format (runs even for empty arrays)
      const backendEmployees: EmployeeSummary[] = uniqueEmpList.map((emp: any) => {
        // Determine status based on active field or terminatedAt
        let status: 'active' | 'inactive' | 'probation' | 'resigned' = 'active';
        if (emp.terminatedAt || emp.active === false) {
          status = 'resigned';
        } else if (emp.active === false) {
          status = 'inactive';
        }

        return {
          id: emp.id || emp._id || emp.employeeId || emp.email,
          employeeId: emp.employeeId || emp.id || emp._id || emp.email,
          fullName: emp.fullName || emp.name || `${emp.firstName || ''} ${emp.lastName || ''}`.trim() || emp.username || '',
          email: emp.email || '',
          designation: emp.designation || '',
          department: emp.department || '',
          avatar: emp.profileImage || emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.fullName || emp.name || emp.username || emp.email || 'User')}`,
          status,
          dateOfJoining: emp.dateOfJoining || '',
          location: emp.locationName || emp.location || '',
          reportingManager: emp.reportingManager || emp.createdByName || 'Unassigned',
          phone: emp.phone || emp.phoneNumber || '',
          leaveBalance: emp.totalLeaveBalance || emp.leaveBalance || 20,
          tags: [],
          password: emp.password,
          employmentType: emp.userType || emp.employmentType || '',
          role: emp.role || emp.createdByRole || undefined,
          dateOfBirth: emp.dateOfBirth || '',
          username: emp.username || undefined,
          profileImage: emp.profileImage || null,
          locationName: emp.locationName || undefined,
          createdByRole: emp.createdByRole || undefined,
          createdByName: emp.createdByName || undefined,
          totalLeaveBalance: emp.totalLeaveBalance || undefined,
          userType: emp.userType || undefined,
          active: emp.active !== undefined ? emp.active : true,
          terminationReason: emp.terminationReason || null,
          terminatedAt: emp.terminatedAt || null
        } as EmployeeSummary;
      });

      // Direct replacement: overwrite local state with backend data only.
      // Also filter to include only active employees for display.
      syncEmployees(backendEmployees.filter(e => e.active));
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  // Run fetch once on mount
  useEffect(() => {
    if (initializeRef.current) return;
    initializeRef.current = true;
    fetchEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, deptFilter]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        notify('File size should be less than 5MB', 'error');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        notify('Please upload an image file', 'error');
        return;
      }

      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const validateEmployeeData = () => {
    const errors = { email: '', employeeId: '', phone: '' };
    let isValid = true;

    // Validate required fields
    if (!newEmp.firstName.trim() || !newEmp.lastName.trim()) {
      notify('First name and last name are required', 'error');
      isValid = false;
    }

    if (!newEmp.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else {
      // Email validation - check for @ symbol and domain extension
      if (!newEmp.email.includes('@')) {
        errors.email = 'Email must contain @ symbol';
        isValid = false;
      } else if (!newEmp.email.includes('.')) {
        errors.email = 'Email must contain a domain extension';
        isValid = false;
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmp.email)) {
          errors.email = 'Please enter a valid email format';
          isValid = false;
        }
      }
    }

    // Validate Employee ID - exactly 6 numbers if provided
    if (newEmp.employeeId.trim()) {
      const empIdDigits = newEmp.employeeId.replace(/\D/g, '');
      if (empIdDigits.length !== 6) {
        errors.employeeId = 'Employee ID must be exactly 6 numbers';
        isValid = false;
      }
    }

    // Validate phone number - Indian format with exactly 10 digits if provided
    if (newEmp.phone.trim()) {
      const phoneDigits = newEmp.phone.replace(/\D/g, '');
      if (phoneDigits.length !== 10) {
        errors.phone = 'Phone number must be exactly 10 digits';
        isValid = false;
      } else if (!/^[6-9]\d{9}$/.test(phoneDigits)) {
        errors.phone = 'Must start with 6-9 (Indian mobile format)';
        isValid = false;
      }
    }

    // Validate date of birth is not in the future
    if (newEmp.dateOfBirth) {
      const dob = new Date(newEmp.dateOfBirth);
      const today = new Date();
      if (dob > today) {
        notify('Date of birth cannot be in the future', 'error');
        isValid = false;
      } else {
        // Validate age is reasonable (at least 16 years old)
        const minAgeDate = new Date();
        minAgeDate.setFullYear(minAgeDate.getFullYear() - 16);
        if (dob > minAgeDate) {
          notify('Employee must be at least 16 years old', 'error');
          isValid = false;
        }
      }
    }

    // Validate date of joining is not in the future
    if (newEmp.dateOfJoining) {
      const doj = new Date(newEmp.dateOfJoining);
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (doj > tomorrow) {
        notify('Date of joining cannot be in the future', 'error');
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    if (!validateEmployeeData()) {
      return;
    }

    // Combine first and last name
    const fullName = `${newEmp.firstName} ${newEmp.lastName}`.trim();

    // Create avatar URL - use uploaded image or generate from name
    let avatarUrl = '';
    if (profileImagePreview) {
      avatarUrl = profileImagePreview;
    } else {
      // Generate initial avatar as fallback
      const initials = `${newEmp.firstName.charAt(0)}${newEmp.lastName.charAt(0)}`.toUpperCase();
      avatarUrl = `https://ui-avatars.com/api/?name=${initials}&background=random`;
    }

    // Prepare DTO and FormData for backend registration (multipart/form-data)
    const dto: any = {
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      fullName,
      email: newEmp.email,
      password: newEmp.password || generatePassword(),
      role: (newEmp.role || '').toString(),
      employeeId: newEmp.employeeId || undefined,
      designation: newEmp.designation,
      department: newEmp.department,
      location: newEmp.location,
      dateOfJoining: newEmp.dateOfJoining,
      dateOfBirth: newEmp.dateOfBirth,
      employmentType: newEmp.employmentType,
      phoneNumber: newEmp.phone,
      address: newEmp.address || '',
      username: `${newEmp.firstName.toLowerCase()}.${newEmp.lastName.toLowerCase()}`,
      avatar: avatarUrl
    };

    const form = new FormData();
    form.append('data', JSON.stringify(dto));
    if (profileImage) {
      form.append('image', profileImage);
    }

    try {
      const res = await fetch('http://localhost:8085/api/users/register', {
        method: 'POST',
        credentials: 'include',
        body: form // Let browser set Content-Type with boundary
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        notify(err.message || 'Registration failed on server', 'error');
        return;
      }

      const responseData = await res.json().catch(() => ({}));

      // Create the new employee object with the response data
      const newEmployee: EmployeeSummary = {
        id: responseData.id || responseData._id || responseData.employeeId || `temp-${Date.now()}`,
        employeeId: responseData.employeeId || newEmp.employeeId || `EMP${Math.floor(Math.random() * 10000)}`,
        fullName: fullName,
        email: newEmp.email,
        designation: newEmp.designation,
        department: newEmp.department,
        avatar: profileImagePreview || avatarUrl,
        status: 'active',
        dateOfJoining: newEmp.dateOfJoining,
        location: newEmp.location,
        reportingManager: 'Unassigned',
        phone: newEmp.phone,
        leaveBalance: 20,
        tags: [],
        password: newEmp.password || dto.password,
        employmentType: newEmp.employmentType,
        role: newEmp.role,
        dateOfBirth: newEmp.dateOfBirth,
        active: true,
        terminationReason: null,
        terminatedAt: null,
        username: `${newEmp.firstName.toLowerCase()}.${newEmp.lastName.toLowerCase()}`
      };

      // Add the employee to the local state immediately
      addEmployee(newEmployee);

      // Close modal and reset form
      setAddModalOpen(false);
      setNewEmp({
        firstName: '',
        lastName: '',
        employeeId: '',
        email: '',
        phone: '',
        address: '',
        dateOfBirth: '',
        dateOfJoining: getCurrentDate(),
        designation: '',
        department: DEPARTMENTS[0],
        location: LOCATIONS[0],
        employmentType: EMPLOYMENT_TYPES[0],
        role: ROLES[0],
        password: 'defaultPassword123'
      });
      setProfileImage(null);
      setProfileImagePreview(null);

      // Show success notification
      notify(`Employee ${fullName} added successfully!`, 'success');
      addLog('Create', 'Employee', `Registered employee ${fullName}`);

      // Refresh from backend to ensure consistency and get the updated data with generated IDs
      try {
        await fetchEmployees();
      } catch (err) {
        console.error('Background refetch failed:', err);
      }

    } catch (err) {
      console.error('Registration error:', err);
      notify('Network error while registering employee', 'error');
    }
  };

  const generatePassword = () => {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let retVal = "";
    for (let i = 0, n = charset.length; i < 12; ++i) {
      retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    setNewEmp({ ...newEmp, password: retVal });
    return retVal; // Return the generated password
  };

  const confirmDelete = async () => {
    console.log('confirmDelete called', { employeeToDelete, terminationReason });

    if (employeeToDelete) {
      // Validate termination reason
      if (!terminationReason.trim()) {
        console.log('No termination reason provided');
        notify('Please provide a termination reason', 'error');
        return;
      }

      try {
        // Use employeeId in the query parameters

        const targetId = employeeToDelete.employeeId || employeeToDelete.id;
        // Removed localStorage usage, only HTTP-only cookies are used
        const url = `http://localhost:8085/api/admin-hub/termination-request?employeeId=${encodeURIComponent(targetId)}&reason=${encodeURIComponent(terminationReason)}`;
        console.log('Request URL:', url);

        const res = await fetch(url, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Response status:', res.status, res.statusText);

        if (res.ok) {
          const responseText = await res.text();
          console.log('Response:', responseText);
          notify('Termination request submitted to super admin', 'success');
          setEmployeeToDelete(null);
          setTerminationReason('');
          addLog('Request', 'Employee', `Submitted termination request for ${employeeToDelete.fullName} - Reason: ${terminationReason}`);
          // Optionally refetch after submission
          await fetchEmployees();
        } else {
          const errText = await res.text().catch(() => '');
          console.error('Server error response:', errText);
          notify(`Failed to submit termination request (${res.status})`, 'error');
        }
      } catch (err) {
        console.error('Termination request error:', err);
        notify('Network error while submitting termination request', 'error');
      }
    } else {
      console.log('No employee selected');
    }
  };



  // Get the password for the selected employee
  const getEmployeePassword = (emp: EmployeeSummary | null) => {
    if (!emp) return 'No password set';

    // Try to get password from different possible sources
    return emp.password ||
      (emp as any).systemPassword ||
      'defaultPassword123';
  };

  // Export currently filtered employees as CSV
  const exportEmployees = () => {
    try {
      if (filteredEmployees.length === 0) {
        notify('No employee records to export.', 'warning');
        return;
      }

      const headers = ['Employee ID', 'Full Name', 'Email', 'Phone', 'Department', 'Designation', 'Location', 'Employment Type', 'Role', 'Status', 'Onboard Date', 'Leave Balance', 'Avatar'];
      const rows = filteredEmployees.map(emp => ([
        emp.employeeId,
        emp.fullName,
        emp.email || '',
        emp.phone || '',
        emp.department,
        emp.designation,
        emp.location,
        emp.employmentType,
        (emp as any).role || 'Employee', // Added role to export
        emp.status,
        emp.dateOfJoining,
        String(emp.leaveBalance ?? ''),
        emp.avatar || ''
      ]));

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].map(r => r.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')).join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Employees_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      addLog('Export', 'Employee', `Exported ${filteredEmployees.length} employee records.`);
    } catch (e) {
      console.error(e);
      notify('Failed to export employees. See console for details.', 'error');
    }
  };

  // Function to reset the form to initial state
  const resetForm = () => {
    setNewEmp({
      firstName: '',
      lastName: '',
      employeeId: '',
      email: '',
      phone: '',
      address: '',
      dateOfBirth: '',
      dateOfJoining: getCurrentDate(),
      designation: '',
      department: DEPARTMENTS[0],
      location: LOCATIONS[0],
      employmentType: EMPLOYMENT_TYPES[0],
      role: ROLES[0], // Reset role to default
      password: 'defaultPassword123'
    });
    setProfileImage(null);
    setProfileImagePreview(null);
    setFormErrors({ email: '', employeeId: '', phone: '' });
  };

  // Function to handle modal close with form reset
  const handleCloseAddModal = () => {
    setAddModalOpen(false);
    resetForm();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Page Header with Export and Add Employee buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Employee Directory</h1>
          <p className="text-slate-500 text-sm font-medium">Record keeping for {employees.length} verified persons.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={exportEmployees} className="flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 text-black rounded-2xl hover:bg-slate-50 font-black text-xs uppercase tracking-widest shadow-sm transition-all">
            <Icon name="Share2" className="w-4 h-4 text-black" /> Export
          </button>
          <button
            onClick={() => {
              setAddModalOpen(true);
              setFormErrors({ email: '', employeeId: '', phone: '' });
            }}
            className="flex items-center gap-2 px-6 py-3.5 bg-[#c97a4c] text-white rounded-2xl hover:bg-[#a56137] font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-200 transition-all active:scale-95"
          >
            <Icon name="Plus" className="w-5 h-5 text-white" />New Staff Enrollment
          </button>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm">
        {/* Fixed Header Section */}
        <div className="sticky top-0 z-20 bg-white p-6 border-b border-slate-100 rounded-t-[32px] space-y-6">
          {/* View Toggle and Search/Filter Controls */}
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            <div className="flex items-center bg-slate-50 rounded-2xl p-1.5 border border-slate-100">
              <button
                onClick={() => setView('table')}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${view === 'table' ? 'bg-white shadow-md text-amber-700' : 'text-black hover:text-amber-700'}`}>
                <Icon name="List" className="w-4 h-4" /> Table
              </button>
              <button
                onClick={() => setView('grid')}
                className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-widest ${view === 'grid' ? 'bg-white shadow-md text-amber-700' : 'text-black hover:text-amber-700'}`}>
                <Icon name="LayoutGrid" className="w-4 h-4" /> Cards
              </button>
            </div>
            <div className="flex flex-1 items-center gap-4 w-full max-w-3xl">
              <div className="relative flex-1 group">
                <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black group-focus-within:text-amber-600 transition-colors" />
                <input
                  type="text"
                  aria-label="Search employees"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Lookup by name, ID, or keyword..."
                  className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-amber-600 outline-none transition-all font-medium text-black placeholder:text-slate-400"
                />
              </div>
              <select
                aria-label="Filter by department"
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-black text-xs uppercase tracking-widest text-black"
              >
                <option value="All" className="text-black">All Departments</option>
                {DEPARTMENTS.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
              </select>
            </div>
          </div>

          {/* Table Headers (only shown in table view) */}
          {view === 'table' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-6 px-8 text-[11px] font-black text-black uppercase tracking-widest">Employee Profile</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-black uppercase tracking-widest">Type</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-black uppercase tracking-widest">System Status</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-black uppercase tracking-widest">Leave Balance</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-black uppercase tracking-widest">Unit</th>
                    <th className="text-left py-6 px-8 text-[11px] font-black text-black uppercase tracking-widest">Onboard Date</th>
                    <th className="text-right py-6 px-8 text-[11px] font-black text-black uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
              </table>
            </div>
          )}
        </div>

        {/* Scrollable Content Area */}
        <div className={`overflow-y-auto invisible-scrollbar ${view === 'table' ? 'max-h-[calc(100vh-350px)]' : 'max-h-[calc(100vh-280px)]'}`}>
          {view === 'table' ? (
            <div className="overflow-x-auto invisible-scrollbar invisible-scrollbar">
              <table className="w-full">
                <tbody className="divide-y divide-slate-50">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => navigate(`/admin/employee-hub/${emp.id}`)}>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <img src={emp.avatar} className="w-12 h-12 rounded-2xl border-4 border-white shadow-sm transition-transform group-hover:scale-110" alt="" />
                          <div>
                            <p className="font-black text-black leading-none mb-1.5">{emp.fullName}</p>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{emp.employeeId} • {emp.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${emp.employmentType === 'Full-time' ? 'bg-[#f5ede3] text-[#8b5a3c]' : 
                          emp.employmentType === 'Part-time' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                            'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {emp.employmentType}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${emp.status === 'active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                          }`}>
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-black ${emp.leaveBalance < 5 ? 'text-rose-600' : 'text-black'}`}>{emp.leaveBalance}</span>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">Days</span>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <span className="text-xs font-black text-amber-700 bg-amber-50 px-3 py-1 rounded-lg uppercase tracking-widest">{emp.department}</span>
                      </td>
                      <td className="py-6 px-8 text-xs font-bold text-black uppercase tracking-widest">{emp.dateOfJoining}</td>
                      <td className="py-6 px-8 text-right">
                        <div className="flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                          <button onClick={(e) => { e.stopPropagation(); navigate(`/admin/employee-hub/${emp.id}`); }} aria-label="View details" className="p-2 text-black hover:text-amber-700 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-amber-100">
                            <Icon name="Eye" className="w-4 h-4" />
                          </button>
                          <button onClick={(e) => { e.stopPropagation(); setEmployeeToDelete(emp); }} aria-label="Delete employee" className="p-2 text-black hover:text-rose-600 hover:bg-white rounded-xl shadow-sm transition-all border border-transparent hover:border-rose-100">
                            <Icon name="Trash2" className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
              {filteredEmployees.map((emp, idx) => (
                <div
                  key={emp.id}
                  onClick={() => navigate(`/admin/employee-hub/${emp.id}`)}
                  className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-amber-600/10 transition-all group relative cursor-pointer flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="relative">
                      <img src={emp.avatar} className="w-16 h-16 rounded-[20px] object-cover border-4 border-slate-50 shadow-md group-hover:scale-105 transition-transform" alt="" />
                      <div className={`absolute -top-2 -right-2 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm ${emp.leaveBalance < 5 ? 'bg-rose-500 text-white' : 'bg-white text-black border border-slate-100'}`}>
                        {emp.leaveBalance}d Bal
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); setEmployeeToDelete(emp); }}
                      aria-label="Delete employee"
                      className="p-2.5 text-black hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 rounded-xl"
                    >
                      <Icon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-black text-black leading-tight text-lg mb-1 line-clamp-1">{emp.fullName}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">{emp.employeeId}</p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      <span className={`px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${emp.employmentType === 'Full-time' ? 'bg-[#f5ede3] text-[#8b5a3c]' : 
                        emp.employmentType === 'Part-time' ? 'bg-purple-50 text-purple-600' :
                          'bg-amber-50 text-amber-600'
                        }`}>
                        {emp.employmentType}
                      </span>
                      {/* Display role badge if available */}
                      {(emp as any).role && (
                        <span className="px-2 py-1 rounded-full text-[8px] font-black uppercase tracking-widest bg-amber-50 text-amber-700">
                          {(emp as any).role}
                        </span>
                      )}
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-4 mb-4">
                      <p className="text-[9px] font-black text-black uppercase tracking-widest mb-1.5">Assignment</p>
                      <p className="text-sm font-black text-black leading-none line-clamp-1">{emp.designation}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
                    <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-50 px-3 py-1.5 rounded-lg">{emp.department}</span>
                    <span className="text-[9px] font-bold text-black uppercase">{emp.location}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!employeeToDelete}
        onClose={() => {
          setEmployeeToDelete(null);
          setTerminationReason('');
        }}
        title="Termination Request"
      >
        {employeeToDelete && (
          <div className="space-y-6">
            <div className="p-6 bg-rose-50 rounded-[28px] border border-rose-100 flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-rose-600 shadow-sm mb-4 border border-rose-100">
                <Icon name="AlertTriangle" className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-xl font-black text-black leading-tight">Submit Termination Request?</h3>
              <p className="text-sm text-slate-600 font-medium mt-2">
                A termination request for <span className="text-black font-black">{employeeToDelete.fullName}</span> ({employeeToDelete.employeeId}) will be sent to the super admin for review.
              </p>
            </div>

            {/* Termination Reason Input */}
            <div className="space-y-2">
              <label htmlFor="terminationReason" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Reason for Termination *</label>
              <textarea
                id="terminationReason"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-medium text-black placeholder:text-slate-400 min-h-[100px]"
                placeholder="e.g., Violation of company policies, Insubordination, etc."
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
              />
              <p className="text-[10px] text-slate-500 px-1">Provide a detailed reason for the termination request</p>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  console.log('Cancel button clicked');
                  setEmployeeToDelete(null);
                  setTerminationReason('');
                }}
                className="flex-1 py-4 bg-white border-2 border-slate-100 text-black font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={(e) => {
                  console.log('Terminate Employee button clicked', {
                    employeeToDelete,
                    terminationReason,
                    targetId: employeeToDelete?.employeeId || employeeToDelete?.id
                  });
                  e.preventDefault();
                  confirmDelete();
                }}
                disabled={!terminationReason.trim()}
                className="flex-1 py-4 bg-rose-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-rose-100 hover:bg-rose-700 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:bg-rose-400 disabled:cursor-not-allowed"
              >
                <Icon name="AlertTriangle" className="w-4 h-4 text-white" />
                Terminate Employee
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* New Staff Enrollment Modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="New Staff Enrollment">
        <form onSubmit={handleAddSubmit} className="space-y-6">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              <div className="w-32 h-32 rounded-3xl border-4 border-slate-100 overflow-hidden bg-slate-50 flex items-center justify-center">
                {profileImagePreview ? (
                  <img src={profileImagePreview} alt="Profile preview" className="w-full h-full object-cover" />
                ) : (
                  <Icon name="User" className="w-16 h-16 text-black" />
                )}
              </div>
              <button
                type="button"
                onClick={triggerFileInput}
                className="absolute bottom-2 right-2 p-3 bg-amber-700 text-white rounded-full shadow-lg hover:bg-amber-800 transition-colors"
                title="Upload profile image"
              >
                <Icon name="Camera" className="w-5 h-5 text-white" />
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleProfileImageChange}
              title="Upload profile image"
              placeholder="Upload profile image"
              accept="image/*"
              className="hidden"
            />
            <p className="text-[10px] text-black text-center">
              Click the camera icon to upload profile photo<br />
              (Recommended: 400x400px, JPG or PNG, max 5MB)
            </p>
          </div>

          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="newEmpFirstName" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">First Name *</label>
              <input
                id="newEmpFirstName"
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-medium text-black placeholder:text-slate-400"
                placeholder="John"
                value={newEmp.firstName}
                onChange={e => setNewEmp({ ...newEmp, firstName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newEmpLastName" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Last Name *</label>
              <input
                id="newEmpLastName"
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-medium text-black placeholder:text-slate-400"
                placeholder="Doe"
                value={newEmp.lastName}
                onChange={e => setNewEmp({ ...newEmp, lastName: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="newEmpEmployeeId" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Employee ID - 6 Numbers (optional)</label>
            <input
              id="newEmpEmployeeId"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-black placeholder:text-slate-400"
              placeholder="123456"
              maxLength={6}
              inputMode="numeric"
              value={newEmp.employeeId}
              onChange={e => setNewEmp({ ...newEmp, employeeId: e.target.value.replace(/\D/g, '').slice(0, 6) })}
            />
            {formErrors.employeeId && <p className="text-xs text-red-500 font-medium">{formErrors.employeeId}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="newEmpEmail" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Email *</label>
              <input
                id="newEmpEmail"
                required
                type="email"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-medium text-black placeholder:text-slate-400"
                placeholder="john.doe@company.com"
                value={newEmp.email}
                onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
              />
              {formErrors.email && <p className="text-xs text-red-500 font-medium">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <label htmlFor="newEmpPhone" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Phone Number - 10 Digits</label>
              <input
                id="newEmpPhone"
                type="tel"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-black placeholder:text-slate-400"
                placeholder="9876543210"
                maxLength={10}
                inputMode="numeric"
                value={newEmp.phone}
                onChange={e => setNewEmp({ ...newEmp, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
              />
              {formErrors.phone && <p className="text-xs text-red-500 font-medium">{formErrors.phone}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="newEmpAddress" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Address</label>
            <textarea
              id="newEmpAddress"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-medium text-black placeholder:text-slate-400 min-h-[80px]"
              placeholder="Full residential address"
              value={newEmp.address}
              onChange={e => setNewEmp({ ...newEmp, address: e.target.value })}
            />
          </div>

          {/* Date Fields using Custom DatePicker */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DatePicker
              id="newEmpDateOfBirth"
              label="Date of Birth"
              value={newEmp.dateOfBirth}
              onChange={(value) => setNewEmp({ ...newEmp, dateOfBirth: value })}
              maxDate={getMaxDateOfBirth()}
            />

            <DatePicker
              id="newEmpDateOfJoining"
              label="Date of Joining *"
              value={newEmp.dateOfJoining}
              onChange={(value) => setNewEmp({ ...newEmp, dateOfJoining: value })}
              required={true}
              maxDate={getCurrentDate()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="newEmpEmploymentType" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Employment Type *</label>
              <select
                id="newEmpEmploymentType"
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-black text-[10px] uppercase tracking-widest text-black"
                value={newEmp.employmentType}
                onChange={e => setNewEmp({ ...newEmp, employmentType: e.target.value })}
              >
                {EMPLOYMENT_TYPES.map(type => <option key={type} value={type} className="text-black">{type}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="newEmpDesignation" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Designation *</label>
              <input
                id="newEmpDesignation"
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-medium text-black placeholder:text-slate-400"
                placeholder="Software Engineer"
                value={newEmp.designation}
                onChange={e => setNewEmp({ ...newEmp, designation: e.target.value })}
              />
            </div>
          </div>

          {/* Role Field - Added here */}
          <div className="space-y-2">
            <label htmlFor="newEmpRole" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Role *</label>
            <select
              id="newEmpRole"
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-black text-[10px] uppercase tracking-widest text-black"
              value={newEmp.role}
              onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
            >
              {ROLES.map(role => <option key={role} value={role} className="text-black">{role}</option>)}
            </select>
          </div>

          {/* Login Credentials Section */}
          <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 space-y-4">
            <h4 className="text-[10px] font-black text-amber-700 uppercase tracking-widest">Initial Access Configuration</h4>
            <div className="space-y-2">
              <label htmlFor="newEmpPassword" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">System Password *</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <input
                    id="newEmpPassword"
                    required
                    className="w-full pl-6 pr-24 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-black text-sm tracking-widest text-black"
                    value={newEmp.password}
                    onChange={e => setNewEmp({ ...newEmp, password: e.target.value })}
                    placeholder="••••••••"
                    type="password"
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-amber-50 text-amber-700 rounded-xl text-[9px] font-black uppercase tracking-tighter hover:bg-amber-100 transition-colors"
                  >
                    Auto-Generate
                  </button>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    const button = e.currentTarget;
                    const passwordInput = document.getElementById('newEmpPassword') as HTMLInputElement;
                    if (passwordInput) {
                      const isPassword = passwordInput.type === 'password';
                      passwordInput.type = isPassword ? 'text' : 'password';
                      const icon = button.querySelector('svg');
                      if (icon) {
                        icon.className.baseVal = isPassword ? 'w-4 h-4' : 'w-4 h-4';
                        // In a real app, you would change the icon here
                      }
                    }
                  }}
                  aria-label="Toggle password visibility"
                  className="p-4 bg-white border border-slate-200 text-black hover:text-amber-700 rounded-2xl transition-colors"
                >
                  <Icon name="Eye" className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-black italic px-1">Note: Provide these credentials to the employee for their first login.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="newEmpDepartment" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Department *</label>
              <select
                id="newEmpDepartment"
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-black text-[10px] uppercase tracking-widest text-black"
                value={newEmp.department}
                onChange={e => setNewEmp({ ...newEmp, department: e.target.value })}
              >
                {DEPARTMENTS.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label htmlFor="newEmpLocation" className="text-[10px] font-black text-black uppercase tracking-widest ml-1">Location *</label>
              <select
                id="newEmpLocation"
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-amber-600 font-black text-[10px] uppercase tracking-widest text-black"
                value={newEmp.location}
                onChange={e => setNewEmp({ ...newEmp, location: e.target.value })}
              >
                {LOCATIONS.map(l => <option key={l} value={l} className="text-black">{l}</option>)}
              </select>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={handleCloseAddModal} className="flex-1 py-4 text-black font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
            <button type="submit" className="flex-1 py-4 bg-[#c97a4c] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-200 hover:bg-[#a56137] transition-all">Add Employee</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default EmployeeHub;