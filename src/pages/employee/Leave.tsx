import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Calendar, Clock, CheckCircle, XCircle, Send, X,
  Loader2, AlertCircle, FileText, ArrowRight, User, Calculator, Filter, MoreVertical, Download, Edit, Trash2, Eye
} from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useLeave } from '../../context/LeaveContext.tsx';
import { LeaveRequest } from '../../types.ts';

const Leave: React.FC = () => {
  const {
    leaveBalance,
    leaveRequests,
    setLeaveBalance,
    setLeaveRequests,
    addLeaveRequest,
    updateLeaveRequest,
    deleteLeaveRequest
  } = useLeave();

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [dateError, setDateError] = useState('');
  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, right: number }>({ top: 0, right: 0 });
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [viewingRequest, setViewingRequest] = useState<LeaveRequest | null>(null);
  const [editingRequest, setEditingRequest] = useState<LeaveRequest | null>(null);
  const [medicalFile, setMedicalFile] = useState<File | null>(null);
  const [medicalFileName, setMedicalFileName] = useState('');

  const [formData, setFormData] = useState({
    type: 'Casual Leave',
    startDate: '',
    endDate: '',
    reason: ''
  });

  // Handle outside click to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate leave statistics
  const leaveStats = {
    totalLeaves: 18,
    leavesAvailable: leaveBalance.available,
    leavesUsed: leaveBalance.used,
    carryForwardedLeaves: 0,
    totalSickLeaves: 8,
    sickLeavesAvailable: 6,
    sickLeavesUsed: 2,
    lossOfPay: leaveBalance.lossOfPay
  };

  // Stats in the requested order
  const topRowStats = [
    {
      label: 'Total Leaves',
      value: leaveStats.totalLeaves,
      color: 'bg-blue-100 text-blue-600',
      icon: <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      label: 'Leaves Available',
      value: leaveStats.leavesAvailable,
      color: 'bg-green-100 text-green-600',
      icon: <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      label: 'Leaves Used',
      value: leaveStats.leavesUsed,
      color: 'bg-indigo-100 text-indigo-600',
      icon: <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      label: 'Carry Forwarded Leaves',
      value: leaveStats.carryForwardedLeaves,
      color: 'bg-purple-100 text-purple-600',
      icon: <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  ];

  const bottomRowStats = [
    {
      label: 'Total Sick Leaves',
      value: leaveStats.totalSickLeaves,
      color: 'bg-amber-100 text-amber-600',
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      label: 'Sick Leaves Available',
      value: leaveStats.sickLeavesAvailable,
      color: 'bg-cyan-100 text-cyan-600',
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      label: 'Sick Leaves Used',
      value: leaveStats.sickLeavesUsed,
      color: 'bg-orange-100 text-orange-600',
      icon: <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
    },
    {
      label: 'Loss of Pay',
      value: leaveStats.lossOfPay,
      color: 'bg-red-100 text-red-600',
      icon: <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
    }
  ];

  // Calculate days between dates
  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  // Get minimum date for calendar based on leave type
  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // For sick leave, allow dates up to 60 days in the past
    if (formData.type === 'Sick Leave') {
      const pastDate = new Date();
      pastDate.setDate(today.getDate() - 60);
      return pastDate.toISOString().split('T')[0];
    }

    // For other leaves, only allow today or future dates (or editing mode)
    return editingRequest ? undefined : today.toISOString().split('T')[0];
  };

  // Validate dates with different rules for sick leave
  const validateDates = (start: string, end: string): boolean => {
    if (!start || !end) return true;

    const startDate = new Date(start);
    const endDate = new Date(end);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Special rules for sick leave
    if (formData.type === 'Sick Leave') {
      // Allow past dates for sick leave, but not too far in the future
      const maxFutureDate = new Date(today);
      maxFutureDate.setDate(today.getDate() + 30);

      if (startDate > maxFutureDate) {
        setDateError('Sick leave cannot be scheduled more than 30 days in advance');
        return false;
      }

      // Maximum 60 days in the past for sick leave
      const minPastDate = new Date(today);
      minPastDate.setDate(today.getDate() - 60);

      if (startDate < minPastDate) {
        setDateError('Sick leave can only be applied for dates within the last 60 days');
        return false;
      }
    } else {
      // For non-sick leaves, standard validation
      if (!editingRequest && startDate < today) {
        setDateError('Start date cannot be in the past');
        return false;
      }
    }

    // Common validations for all leave types
    if (endDate < startDate) {
      setDateError('End date cannot be earlier than start date');
      return false;
    }

    const maxDays = formData.type === 'Sick Leave' ? 90 : 30;
    const days = calculateDays(start, end);
    if (days > maxDays) {
      setDateError(`${formData.type} cannot exceed ${maxDays} days`);
      return false;
    }

    setDateError('');
    return true;
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    if (newFormData.startDate && newFormData.endDate) {
      validateDates(newFormData.startDate, newFormData.endDate);
    } else {
      setDateError('');
    }
  };

  const handleLeaveTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type,
      startDate: '', // Reset dates when changing type
      endDate: ''
    }));
    setDateError('');
    setMedicalFile(null);
    setMedicalFileName('');
  };

  const handleMedicalFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload PDF, JPEG, or PNG files only');
        return;
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }

      setMedicalFile(file);
      setMedicalFileName(file.name);
    }
  };

  // Fetch user's leave requests from backend and map to local LeaveRequest shape
  const fetchMyLeaves = async (statusParam?: string) => {
    setIsLoadingRequests(true);
    try {
      const params: any = {};

      // ✅ send uppercase to backend (safer)
      if (statusParam && statusParam !== 'all') {
        params.status = statusParam.toUpperCase(); // PENDING / APPROVED / REJECTED
      }

      // ✅ call the real backend URL (same style as apply API)
      const response = await axios.get('http://localhost:8085/leave-requests/my-leaves', {
        params,
        withCredentials: true,
      });

      console.log("my-leaves response:", response.status, response.data);

      const data = response.data;
      if (Array.isArray(data)) {
        const toStatus = (s: any): LeaveRequest['status'] => {
          const v = String(s || 'pending').toLowerCase();
          if (v === 'approved') return 'approved';
          if (v === 'rejected') return 'rejected';
          return 'pending';
        };

        const mapped: LeaveRequest[] = data.map((item: any, idx: number) => ({
          id: item.id || `${Date.now()}-${idx}`,
          type: item.category || item.type || 'Leave',
          startDate: item.startDate,
          endDate: item.endDate,
          days: calculateDays(item.startDate, item.endDate),
          status: toStatus(item.status),
          reason: item.reason || '',
          appliedDate: item.appliedDate
            ? String(item.appliedDate).split('T')[0]
            : new Date().toISOString().split('T')[0],
          applicant: item.applicant || 'You',
          medicalCertificate: item.attachment || item.medicalCertificate || undefined,
        }));
        setLeaveRequests(mapped);
      } else {
        console.error("Unexpected response shape:", data);
        toast.error('Unexpected response from server');
      }
    } catch (err: any) {
      console.error('Failed fetching leave requests', err);

      // ✅ show backend message if present
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to fetch leave requests';

      toast.error(msg);
    } finally {
      setIsLoadingRequests(false);
    }
  };


  // Fetch on mount and whenever filter changes (pass status param when not 'all')
  useEffect(() => {
    fetchMyLeaves(filter !== 'all' ? filter : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const filteredRequests = leaveRequests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const handleDeleteRequest = (id: string) => {
    deleteLeaveRequest(id);
    setActiveActionMenu(null);
  };

  const handleDownloadSummary = (request: LeaveRequest) => {
    const content = `LEAVE SUMMARY REPORT\nID: ${request.id}\nType: ${request.type}\nDuration: ${request.days} Days\nPeriod: ${request.startDate} to ${request.endDate}\nStatus: ${request.status}\nReason: ${request.reason}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Leave_${request.id}_Summary.txt`;
    a.click();
    setActiveActionMenu(null);
  };

  const handleEditRequest = (request: LeaveRequest) => {
    setEditingRequest(request);
    setFormData({
      type: request.type,
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason
    });
    setShowApplyModal(true);
    setActiveActionMenu(null);
  };

  const handleViewDetails = (request: LeaveRequest) => {
    setViewingRequest(request);
    setActiveActionMenu(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateDates(formData.startDate, formData.endDate)) {
      setIsSubmitting(false);
      return;
    }

    const days = calculateDays(formData.startDate, formData.endDate);

    if (!editingRequest && days > leaveBalance.available) {
      setDateError(`Insufficient leave balance. Available: ${leaveBalance.available} days, Required: ${days} days`);
      setIsSubmitting(false);
      return;
    }

    // Special validation for sick leave
    if (formData.type === 'Sick Leave') {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // For sick leave extending into the future
      if (endDate > today && !medicalFile) {
        setDateError('Medical certificate is required for ongoing or future sick leave');
        setIsSubmitting(false);
        return;
      }

      // For sick leave > 3 days in the past
      const daysDifference = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      if (days > 3 && daysDifference > 0 && !medicalFile) {
        setDateError('Medical certificate is required for sick leave exceeding 3 days');
        setIsSubmitting(false);
        return;
      }
    }

    // Prepare (simulated) upload for medical certificate if provided
    let medicalCertificateUrl = '';
    if (medicalFile) {
      // In a real app, you'd upload the file and use the returned URL
      medicalCertificateUrl = `medical_${Date.now()}_${medicalFile.name}`;
    }

    if (editingRequest) {
      updateLeaveRequest(editingRequest.id, {
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        days,
        reason: formData.reason,
        medicalCertificate: medicalCertificateUrl || editingRequest.medicalCertificate
      });
    } else {
      // Call backend API to apply for leave
      try {
        const payload = {
          category: formData.type,
          startDate: formData.startDate,
          endDate: formData.endDate,
          reason: formData.reason,
          attachment: medicalCertificateUrl || null
        };

        console.log('Payload:', payload);
        console.log('Medical file:', medicalFile);

        const formDataObj = new FormData();

        // Attach LeaveRequestDTO JSON as a string (not as Blob)
        // Attach LeaveRequestDTO as JSON Blob (Spring Boot compatible)
        formDataObj.append(
          "leaveRequestDTO",
          new Blob([JSON.stringify(payload)], { type: "application/json" })
        );


        // Attach medical file if exists
        if (medicalFile) {
          formDataObj.append("attachment", medicalFile);
          console.log('Medical file appended to form data');
        }

        console.log('FormData entries:');
        for (let pair of formDataObj.entries()) {
          console.log(pair[0] + ', ' + pair[1]);
        }

        // Using fetch API with cookies (credentials: 'include')
        // IMPORTANT: DO NOT set Content-Type header - let fetch set it automatically
        // with the correct boundary for multipart/form-data
        const response = await fetch('http://localhost:8085/leave-requests/apply', {
          method: 'POST',
          body: formDataObj,
          headers: {
            // Remove any Content-Type header - fetch will set it automatically
            // with boundary for multipart/form-data
            'Accept': 'application/json',
          },
          credentials: 'include', // This will send cookies automatically
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          let errorMessage = 'Failed to submit leave request';

          try {
            const errorData = await response.json();
            console.error('Error response data:', errorData);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.error('Failed to parse error response:', parseError);
          }

          if (response.status === 401) {
            toast.error('Authentication failed. Please log in again.');
          } else if (response.status === 403) {
            toast.error('You do not have permission to perform this action.');
          } else if (response.status === 400) {
            toast.error('Invalid request. Please check your data.');
          } else if (response.status === 500) {
            toast.error('Server error. Please try again later.');
          } else {
            toast.error(`${errorMessage} (Status: ${response.status})`);
          }

          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Response received:', responseData);
      } catch (err: any) {
        console.error('Leave request submission failed', err);

        if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
          toast.error('Network error. Please check your connection or try again.');
        } else if (err.message && !err.message.includes('HTTP error')) {
          toast.error(`Failed to submit leave request: ${err.message}`);
        }

        setIsSubmitting(false);
        return;
      }

      // Update leave balance locally
      if (formData.type !== 'Unpaid Leave') {
        setLeaveBalance(prev => ({
          ...prev,
          available: prev.available - days,
          used: prev.used + days
        }));
      }

      // Refresh list from server
      await fetchMyLeaves(filter !== 'all' ? filter : undefined);
    }

    setIsSubmitting(false);
    setShowApplyModal(false);
    setEditingRequest(null);
    setDateError('');
    setMedicalFile(null);
    setMedicalFileName('');
    setFormData({
      type: 'Casual Leave',
      startDate: '',
      endDate: '',
      reason: ''
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: LeaveRequest['status']) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'rejected': return <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case 'pending': return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      default: return null;
    }
  };

  const leaveTypes = [
    { id: 'casual', label: 'Casual Leave' },
    { id: 'sick', label: 'Sick Leave' },
    { id: 'annual', label: 'Annual Leave' },
    { id: 'maternity', label: 'Maternity Leave' },
    { id: 'paternity', label: 'Paternity Leave' },
    { id: 'unpaid', label: 'Unpaid Leave' }
  ];

  const upcomingLeaves = leaveRequests.filter(
    r => r.status === 'approved' && new Date(r.startDate) > new Date()
  ).slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Leave Management</h1>
            <p className="text-gray-600 text-sm mt-1">Request and track your administrative time-off</p>
          </div>
          <button
            onClick={() => {
              setEditingRequest(null);
              setFormData({ type: 'Casual Leave', startDate: '', endDate: '', reason: '' });
              setShowApplyModal(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Apply for Leave</span>
          </button>
        </div>

        {/* Top Row Stats - The requested 4 sections */}
        <div className="mb-4">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">Leave Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {topRowStats.map((stat, index) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.color.split(' ')[0]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <div className={stat.color.split(' ')[1]}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{stat.label}</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Row Stats - Additional 4 sections */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4 ml-1">Sick Leave Details</h3>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {bottomRowStats.map((stat, index) => (
              <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 ${stat.color.split(' ')[0]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <div className={stat.color.split(' ')[1]}>
                      {stat.icon}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider truncate">{stat.label}</div>
                    <div className="text-xl sm:text-2xl font-bold text-gray-900">{stat.value}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
            <div className="flex flex-wrap gap-1 sm:gap-2 flex-1">
              {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${filter === status
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-100'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-end">
            <button className="p-2 sm:p-2.5 bg-gray-50 text-gray-500 hover:text-blue-600 rounded-lg border border-gray-200 transition-colors" title="Export data" aria-label="Export leave data">
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Leave Requests Table with Fixed Headers */}
      <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Fixed Table Headers */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="grid grid-cols-12 bg-gray-50/50 px-4 sm:px-6 py-3 sm:py-4">
            <div className="col-span-5">
              <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Type & Reason</div>
            </div>
            <div className="col-span-2 text-center">
              <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Duration</div>
            </div>
            <div className="col-span-3">
              <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Date Window</div>
            </div>
            <div className="col-span-1">
              <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</div>
            </div>
            <div className="col-span-1 text-right">
              <div className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Actions</div>
            </div>
          </div>
        </div>

        {/* Scrollable Table Data */}
        <div className="overflow-y-auto max-h-[500px] scrollbar-hide">
          {filteredRequests.map(request => (
            <div
              key={request.id}
              className="grid grid-cols-12 px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50/50 transition-colors border-b border-gray-100 last:border-b-0"
            >
              {/* Type & Reason */}
              <div className="col-span-5">
                <div className="font-bold text-gray-900 text-xs sm:text-sm">{request.type}</div>
                <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <User className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  {request.applicant}
                </div>
                <div className="text-[10px] sm:text-xs text-gray-600 mt-1 sm:mt-2 bg-gray-100 px-2 py-1 rounded inline-block truncate max-w-full">
                  "{request.reason}"
                </div>
                {request.type === 'Sick Leave' && request.medicalCertificate && (
                  <div className="text-[10px] sm:text-xs text-blue-600 mt-1 flex items-center gap-1">
                    <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    Medical certificate attached
                  </div>
                )}
              </div>

              {/* Duration */}
              <div className="col-span-2 flex items-center justify-center">
                <div className="text-xs sm:text-sm font-bold text-gray-900">
                  {request.days} <span className="text-[9px] sm:text-[10px] text-gray-400 uppercase">Days</span>
                </div>
              </div>

              {/* Date Window */}
              <div className="col-span-3">
                <div className="text-[10px] sm:text-xs font-medium text-gray-700">
                  {formatDate(request.startDate)} - {formatDate(request.endDate)}
                </div>
                <div className="text-[8px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mt-0.5">
                  Applied: {formatDate(request.appliedDate)}
                </div>
                {request.type === 'Sick Leave' && new Date(request.startDate) < new Date() && (
                  <div className="text-[8px] sm:text-[9px] text-amber-600 font-bold uppercase tracking-widest mt-0.5">
                    • Retroactive
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="col-span-1 flex items-center">
                <div className={`inline-flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  <span className="hidden sm:inline">
                    {request.status}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="col-span-1 flex items-center justify-end">
                <div className="flex items-center gap-0.5 sm:gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setMenuPosition({
                        top: rect.bottom + window.scrollY,
                        right: window.innerWidth - rect.right
                      });
                      setActiveActionMenu(activeActionMenu === request.id ? null : request.id);
                    }}
                    className={`p-1.5 sm:p-2 rounded-lg transition-all ${activeActionMenu === request.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-500'}`}
                    title="More actions"
                    aria-label="More actions for this leave request"
                  >
                    <MoreVertical className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredRequests.length === 0 && (
            <div className="py-16 sm:py-20 text-center text-gray-400 px-4 sm:px-6">
              <FileText size={32} className="mx-auto opacity-10 mb-3 sm:mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">No matching leave records found</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Menu Dropdown - Fixed position outside table */}
      {activeActionMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActiveActionMenu(null)}
          />

          {/* Dropdown Menu */}
          <div
            ref={actionMenuRef}
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl py-1 min-w-[160px] text-sm"
            style={{
              top: `${menuPosition.top + 8}px`,
              right: `${menuPosition.right}px`
            }}
          >
            {(() => {
              const request = leaveRequests.find(r => r.id === activeActionMenu);
              if (!request) return null;

              return (
                <>
                  <button
                    onClick={() => handleViewDetails(request)}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Eye size={14} /> View Details
                  </button>
                  <button
                    onClick={() => handleDownloadSummary(request)}
                    className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <Download size={14} /> Download
                  </button>
                  {request.status === 'pending' && (
                    <>
                      <div className="border-t my-1"></div>
                      <button
                        onClick={() => handleEditRequest(request)}
                        className="w-full text-left px-4 py-2 text-blue-600 hover:bg-blue-50 flex items-center gap-2"
                      >
                        <Edit size={14} /> Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRequest(request.id)}
                        className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <Trash2 size={14} /> Cancel
                      </button>
                    </>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}

      {/* View Details Modal */}
      {viewingRequest && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setViewingRequest(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">Leave Details</h2>
                <button
                  onClick={() => setViewingRequest(null)}
                  className="p-1.5 sm:p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-lg transition-all"
                  title="Close details"
                  aria-label="Close leave request details"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Request ID</p>
                    <p className="text-sm font-bold text-slate-900">REQ-00{viewingRequest.id}</p>
                  </div>
                  <div className={`px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(viewingRequest.status)}`}>
                    {viewingRequest.status}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl sm:rounded-2xl">
                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Category</p>
                    <p className="text-sm font-bold text-blue-900">{viewingRequest.type}</p>
                  </div>
                  <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-xl sm:rounded-2xl">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Days Consumed</p>
                    <p className="text-sm font-bold text-indigo-900">{viewingRequest.days} Business Days</p>
                  </div>
                </div>
                {viewingRequest.type === 'Sick Leave' && viewingRequest.medicalCertificate && (
                  <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-xl sm:rounded-2xl">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest mb-1">Medical Certificate</p>
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-amber-900">Document attached</p>
                      <button
                        className="text-xs text-amber-600 font-bold hover:text-amber-800"
                      >
                        View
                      </button>
                    </div>
                  </div>
                )}
                <div className="space-y-3 sm:space-y-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Time Window</p>
                    <p className="text-sm font-medium text-slate-700">{formatDate(viewingRequest.startDate)} — {formatDate(viewingRequest.endDate)}</p>
                    {viewingRequest.type === 'Sick Leave' && new Date(viewingRequest.startDate) < new Date() && (
                      <p className="text-xs text-amber-600 font-bold mt-1">• Retroactive application (applied after recovery)</p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Justification</p>
                    <p className="text-sm text-slate-600 leading-relaxed italic">"{viewingRequest.reason}"</p>
                  </div>
                </div>
                <button
                  onClick={() => setViewingRequest(null)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                >
                  Close Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Apply/Edit Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => { setShowApplyModal(false); setEditingRequest(null); }} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div
              className="relative bg-white rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight">{editingRequest ? 'Modify Leave Request' : 'Request Time Off'}</h2>
                <button
                  onClick={() => { setShowApplyModal(false); setEditingRequest(null); setDateError(''); }}
                  className="p-1.5 sm:p-2 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-lg transition-all"
                  title="Close form"
                  aria-label="Close leave request form"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 text-left">
                {/* Leave Type */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 sm:mb-3">
                    Leave Category
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                    {leaveTypes.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => handleLeaveTypeChange(type.label)}
                        className={`text-black px-3 py-2 sm:px-4 sm:py-3 border rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all ${formData.type === type.label
                          ? 'text-black border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300'
                          }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Medical Certificate Upload (for Sick Leave) */}
                {formData.type === 'Sick Leave' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="flex items-start sm:items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                      <div className="text-[10px] sm:text-xs font-bold text-amber-800 uppercase tracking-tight">
                        Medical Certificate Information
                      </div>
                    </div>
                    <div className="text-[10px] sm:text-xs text-amber-700 leading-relaxed mb-3 sm:mb-4">
                      {medicalFile ? (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-2 sm:p-3 rounded-xl border border-amber-100 gap-2">
                          <span className="font-medium truncate text-xs">{medicalFileName}</span>
                          <button
                            type="button"
                            onClick={() => { setMedicalFile(null); setMedicalFileName(''); }}
                            className="text-amber-600 hover:text-amber-800 text-[10px] sm:text-xs font-bold text-right sm:text-left"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <div className="border-2 border-dashed border-amber-300 rounded-xl p-3 sm:p-4 text-center hover:bg-amber-50 transition-colors">
                            <div className="text-amber-600 font-medium mb-1 text-xs">Click to upload medical certificate</div>
                            <div className="text-[10px] sm:text-xs text-amber-500">PDF, JPEG, PNG (Max 5MB)</div>
                            <input
                              type="file"
                              className="hidden"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={handleMedicalFileChange}
                            />
                          </div>
                        </label>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-amber-600 bg-white/50 p-2 rounded-lg">
                      <span className="font-bold">Note:</span> Required for sick leave exceeding 3 days or for ongoing/future sick leave
                    </div>
                  </div>
                )}

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label htmlFor="startDate" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
                      Start Date
                    </label>
                    <input
                      id="startDate"
                      type="date"
                      value={formData.startDate}
                      onChange={e => handleDateChange('startDate', e.target.value)}
                      min={getMinDate()}
                      className="text-black w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                      required
                    />
                    {formData.type === 'Sick Leave' && (
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1">For sick leave, you can select dates up to 60 days in the past</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="endDate" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
                      End Date
                    </label>
                    <input
                      id="endDate"
                      type="date"
                      value={formData.endDate}
                      onChange={e => handleDateChange('endDate', e.target.value)}
                      min={formData.startDate}
                      className="text-black w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-bold text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Date Error Message */}
                {dateError && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 sm:p-4">
                    <div className="flex items-start gap-2 sm:gap-3">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm font-medium text-red-700">
                        {dateError}
                      </div>
                    </div>
                  </div>
                )}

                {/* Days Calculation */}
                {formData.startDate && formData.endDate && !dateError && (
                  <div className="bg-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-white shadow-lg shadow-blue-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md flex-shrink-0">
                        <Calculator className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Duration</div>
                        <div className="text-xl sm:text-2xl font-black tabular-nums">
                          {calculateDays(formData.startDate, formData.endDate)} Days
                        </div>
                        {formData.type === 'Sick Leave' && new Date(formData.startDate) < new Date() && (
                          <div className="text-xs text-blue-200 font-bold mt-1">
                            • Retroactive application allowed for sick leave
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-blue-100 uppercase tracking-widest">Impact</div>
                      <div className="text-sm font-bold opacity-80">
                        {leaveBalance.available} → {Math.max(0, leaveBalance.available - calculateDays(formData.startDate, formData.endDate))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reason */}
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-2">
                    Reason
                  </label>
                  <textarea
                    value={formData.reason}
                    onChange={e => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={3}
                    className="text-black w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-sm resize-none"
                    placeholder="Provide details for your manager..."
                    required
                  />
                  {formData.type === 'Sick Leave' && (
                    <p className="text-[10px] sm:text-xs text-gray-500 mt-1">Please mention symptoms and recovery details if applying for past dates</p>
                  )}
                </div>

                {/* Notes */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 mt-0.5" />
                    <div className="text-[10px] sm:text-[11px] font-bold text-amber-700 leading-relaxed uppercase tracking-tighter">
                      <p className="mb-1 underline">Policy Reminders</p>
                      <ul className="list-disc list-inside space-y-0.5 opacity-80">
                        <li>3-day advance notice required for annual leave</li>
                        <li>Sick leave requires documentation if {'>'} 2 days</li>
                        <li>Sick leave can be applied for up to 60 days in the past</li>
                        <li>Maximum sick leave duration: 90 days per request</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Submit */}
                <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => { setShowApplyModal(false); setEditingRequest(null); setDateError(''); }}
                    className="px-4 py-2.5 sm:px-6 sm:py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 active:scale-95 transition-all"
                  >
                    Discard
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !!dateError}
                    className="px-6 py-2.5 sm:px-8 sm:py-3 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-700 shadow-xl shadow-blue-100 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 sm:w-4 sm:h-4" />
                        {editingRequest ? 'Update Protocol' : 'Submit Request'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Leaves */}
      <div className="mt-8 sm:mt-12">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] mb-4 sm:mb-6 ml-1">Upcoming Authorized Windows</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {upcomingLeaves.map(request => (
            <div
              key={request.id}
              className="bg-white border border-gray-200 rounded-xl sm:rounded-[2rem] p-4 sm:p-6 lg:p-8 hover:border-blue-300 hover:shadow-xl transition-all group relative overflow-hidden text-left"
            >
              <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-blue-50 rounded-full -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 group-hover:scale-110 transition-transform duration-500"></div>
              <div className="flex items-center justify-between mb-4 sm:mb-6 relative z-10">
                <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{request.type}</span>
                <span className="text-[9px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100 uppercase tracking-widest">
                  Approved
                </span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 tabular-nums">{request.days} <span className="text-sm font-bold text-gray-400 uppercase">Days</span></div>
              <div className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
                {formatDate(request.startDate)} — {formatDate(request.endDate)}
              </div>
              <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-50 flex items-center gap-2">
                <ArrowRight size={12} className="text-blue-500" />
                <div className="text-[9px] font-bold text-gray-400 uppercase truncate" title={request.reason}>
                  {request.reason}
                </div>
              </div>
            </div>
          ))}
          {upcomingLeaves.length === 0 && (
            <div className="sm:col-span-2 lg:col-span-3 py-8 sm:py-10 bg-gray-50/50 rounded-xl sm:rounded-[2rem] border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400">
              <Calendar size={24} className="mb-2 opacity-20" />
              <p className="text-[10px] font-black uppercase tracking-widest">No upcoming leave records detected</p>
            </div>
          )}
        </div>
      </div>

      {/* Add CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Leave;