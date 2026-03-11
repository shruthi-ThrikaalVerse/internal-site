import React, { useState, useEffect } from 'react';
import { ChevronDown, Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { getPendingResignations, approveResignation, rejectResignation, submitResignation } from '../../api/resignations.ts';

interface ResignationData {
  resignationDate: string;
  lastWorkingDate: string;
  noticePeriod: string;
  reason: string;
  detailedReason: string;
  personalEmail: string;
  contactNumber: string;
  document: File | null;
  declarationAccepted: boolean;
}

const ResignationAdmin: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState<ResignationData>({
    resignationDate: '',
    lastWorkingDate: '',
    noticePeriod: '',
    reason: '',
    detailedReason: '',
    personalEmail: '',
    contactNumber: '',
    document: null,
    declarationAccepted: false
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const resignationReasons = [
    'Career Growth',
    'Higher Studies',
    'Personal Reasons',
    'Health Issues',
    'Relocation',
    'Other'
  ];

  const noticePeriodOptions = ['30 Days', '60 Days', '90 Days'];

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [pendingLoading, setPendingLoading] = useState(true);
  const [pendingError, setPendingError] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8085/api/users/me', { withCredentials: true });
        const apiUser = response.data;
        const enrichedUser = {
          ...apiUser,
          name: apiUser.name || `${apiUser.firstName || ''} ${apiUser.lastName || ''}`.trim() || 'N/A',
          employeeId: apiUser.employeeId || 'N/A',
          department: apiUser.department || 'N/A',
          designation: apiUser.designation || apiUser.role || 'N/A',
          manager: apiUser.manager || apiUser.reportingManager || 'N/A',
          dateOfJoining: apiUser.dateOfJoining || 'N/A',
          location: apiUser.location || 'N/A',
          email: apiUser.email || 'N/A'
        };
        setUser(enrichedUser);
      } catch (error) {
        toast.error('Failed to load admin information');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchPending = async () => {
      setPendingLoading(true);
      setPendingError("");
      try {
        const data = await getPendingResignations();
        console.log('Raw API Response:', data);
        console.log('Response type:', Array.isArray(data) ? 'Array' : typeof data);

        if (!Array.isArray(data) || data.length === 0) {
          console.log('No data or not an array');
          setPendingRequests([]);
          return;
        }

        // Normalize status - show all resignations for now to debug
        const normalizedData = data.map((req: any, index: number) => {
          console.log(`Processing request ${index}:`, req);
          console.log(`  - status value: "${req.status}"`);
          console.log(`  - Has all expected fields:`, {
            id: !!req.id,
            employeeId: !!req.employeeId,
            employeeName: !!req.employeeName,
            resignationDate: !!req.resignationDate
          });

          // Normalize status - accept any value
          let normalizedStatus = req.status || 'Pending';
          if (req.status === 'APPROVED' || req.status === 'Approved') {
            normalizedStatus = 'Approved';
          } else if (req.status === 'REJECTED' || req.status === 'Rejected') {
            normalizedStatus = 'Rejected';
          }

          return {
            ...req,
            id: req.id || req.requestId || `resign-${Date.now()}`,
            employeeId: req.employeeId || req.employeeName || 'N/A',
            employeeName: req.employeeName || req.approvedByName || req.firstName || 'Employee',
            resignationDate: req.resignationDate || (req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'),
            lastWorkingDate: req.lastWorkingDate || 'N/A',
            reason: req.reason || req.details || 'Not provided',
            status: normalizedStatus
          };
        });

        console.log('Normalized & Filtered Data:', normalizedData);
        setPendingRequests(normalizedData);
      } catch (err: any) {
        console.error('Error fetching:', err);
        setPendingError(err.message || "Failed to load pending requests");
        setPendingRequests([]);
      } finally {
        setPendingLoading(false);
      }
    };

    fetchPending();
    // Only fetch once on component mount - user can manually refresh or submit new resignation to see updates
  }, []);

  const calculateNoticePeriod = () => {
    if (formData.lastWorkingDate && formData.resignationDate) {
      const last = new Date(formData.lastWorkingDate);
      const resign = new Date(formData.resignationDate);
      const daysNotice = Math.ceil((last.getTime() - resign.getTime()) / (1000 * 60 * 60 * 24));
      return daysNotice > 0 ? daysNotice : 0;
    }
    return 0;
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.resignationDate) newErrors.resignationDate = 'Resignation date is required';
    else if (!isValidDate(formData.resignationDate)) newErrors.resignationDate = 'Invalid date format. Use mm/dd/yyyy';

    if (!formData.lastWorkingDate) newErrors.lastWorkingDate = 'Last working date is required';
    else if (!isValidDate(formData.lastWorkingDate)) newErrors.lastWorkingDate = 'Invalid date format. Use mm/dd/yyyy';

    if (!formData.noticePeriod) newErrors.noticePeriod = 'Please select a notice period';
    if (!formData.reason) newErrors.reason = 'Please select a reason';
    if (!formData.detailedReason.trim()) newErrors.detailedReason = 'Please provide detailed reason';
    if (!formData.personalEmail.trim()) newErrors.personalEmail = 'Personal email is required';
    if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
    if (!formData.declarationAccepted) newErrors.declaration = 'You must accept the declaration';

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.personalEmail && !emailRegex.test(formData.personalEmail)) {
      newErrors.personalEmail = 'Please enter a valid email';
    }

    if (formData.resignationDate && formData.lastWorkingDate && isValidDate(formData.resignationDate) && isValidDate(formData.lastWorkingDate)) {
      const [resMonth, resDay, resYear] = formData.resignationDate.split('/').map(Number);
      const [lastMonth, lastDay, lastYear] = formData.lastWorkingDate.split('/').map(Number);
      const resignDate = new Date(resYear, resMonth - 1, resDay);
      const lastDate = new Date(lastYear, lastMonth - 1, lastDay);

      if (lastDate < resignDate) {
        newErrors.lastWorkingDate = 'Last working date must be after resignation date';
      }
    }

    if (formData.contactNumber && !/^\d{10,}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
      newErrors.contactNumber = 'Please enter a valid contact number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatDateInput = (value: string): string => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, '');

    // Format as mm/dd/yyyy
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 4) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2)}`;
    } else {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}/${numbers.slice(4, 8)}`;
    }
  };

  const isValidDate = (dateString: string): boolean => {
    const regex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!regex.test(dateString)) return false;

    const [month, day, year] = dateString.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Format date fields
    if ((name === 'resignationDate' || name === 'lastWorkingDate') && value) {
      const formattedValue = formatDateInput(value);
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should not exceed 5MB');
        return;
      }
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Only PDF and Word documents are allowed');
        return;
      }
      setFormData(prev => ({ ...prev, document: file }));
    }
  };

  const handleDeclarationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, declarationAccepted: e.target.checked }));
    if (errors.declaration) {
      setErrors(prev => ({ ...prev, declaration: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('resignationDate', formData.resignationDate);
      formDataToSend.append('lastWorkingDate', formData.lastWorkingDate);
      formDataToSend.append('reason', formData.reason);
      formDataToSend.append('detailedReason', formData.detailedReason);
      formDataToSend.append('personalEmail', formData.personalEmail);
      formDataToSend.append('contactNumber', formData.contactNumber);
      if (formData.document) formDataToSend.append('file', formData.document);

      // Admin resignation endpoint - uses same /resign apply endpoint, role determined by auth
      const response = await submitResignation(formDataToSend);

      if (response) {
        toast.success('Resignation submitted successfully!');

        // Reset form
        setFormData({
          resignationDate: '',
          lastWorkingDate: '',
          noticePeriod: '',
          reason: '',
          detailedReason: '',
          personalEmail: '',
          contactNumber: '',
          document: null,
          declarationAccepted: false
        });
        setErrors({});
        setShowForm(false);

        // Refresh pending requests immediately to show the new resignation
        try {
          const data = await getPendingResignations();
          console.log('Refreshed pending data:', data);

          if (Array.isArray(data) && data.length > 0) {
            const normalizedData = data.map((req: any) => {
              let normalizedStatus = 'Pending';
              if (req.status === 'APPROVED' || req.status === 'Approved') {
                normalizedStatus = 'Approved';
              } else if (req.status === 'REJECTED' || req.status === 'Rejected') {
                normalizedStatus = 'Rejected';
              } else if (req.status === 'PENDING' || req.status === 'Pending') {
                normalizedStatus = 'Pending';
              }

              return {
                ...req,
                id: req.id || req.requestId || `resign-${Date.now()}`,
                employeeId: req.employeeId || req.employeeName || 'N/A',
                employeeName: req.employeeName || req.approvedByName || req.firstName || 'Employee',
                resignationDate: req.resignationDate || (req.createdAt ? new Date(req.createdAt).toLocaleDateString() : 'N/A'),
                lastWorkingDate: req.lastWorkingDate || 'N/A',
                reason: req.reason || req.details || 'Not provided',
                status: normalizedStatus
              };
            }).filter((req: any) => req.status === 'Pending');

            setPendingRequests(normalizedData);
          } else {
            setPendingRequests([]);
          }
        } catch (err) {
          console.error('Error refreshing pending requests:', err);
        }

        // Show success modal
        setShowSuccessModal(true);
        setTimeout(() => setShowSuccessModal(false), 3000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit resignation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      navigate('/admin/dashboard');
    }
  };

  const handleApprove = async (id: number | string) => {
    try {
      console.log('Approving resignation:', id);
      await approveResignation(Number(id));
      toast.success('Resignation approved');
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    } catch (err: any) {
      console.error('Approval error:', err);
      toast.error(err.message || 'Failed to approve resignation');
    }
  };

  const handleReject = async (id: number | string) => {
    try {
      console.log('Rejecting resignation:', id);
      await rejectResignation(Number(id));
      toast.success('Resignation rejected');
      setPendingRequests(prev => prev.filter(req => req.id !== id));
    } catch (err: any) {
      console.error('Rejection error:', err);
      toast.error(err.message || 'Failed to reject resignation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-end items-center mb-4">
          {!showForm && (
            <button
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-lg font-semibold shadow hover:bg-indigo-700 transition"
              onClick={() => setShowForm(true)}
            >
              Show Resignation Form
            </button>
          )}
        </div>
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-black">Admin Resignation</h1>
          <p className="text-black mt-2">Submit your resignation as an admin user</p>
        </div>

        {/* Pending Employee Requests Section */}
        <div className="mb-10">
          <h2 className="text-xl font-semibold text-black mb-4">Pending Employee Resignation Requests</h2>
          {pendingLoading ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-black">
              ⏳ Loading pending requests...
            </div>
          ) : pendingError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              ❌ Error: {pendingError}
            </div>
          ) : !pendingRequests || pendingRequests.length === 0 ? (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-black">
              ✓ No pending requests found
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req: any) => (
                <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-bold text-black">
                        {req.employeeId} {req.employeeName && `- ${req.employeeName}`}
                      </div>
                      <div className="text-sm text-gray-600 mt-2 space-y-1">
                        <div><span className="text-gray-700">Resignation Date:</span> <span className="text-black">{req.resignationDate || 'N/A'}</span></div>
                        <div><span className="text-gray-700">Last Working Date:</span> <span className="text-black">{req.lastWorkingDate || 'N/A'}</span></div>
                        <div><span className="text-gray-700">Reason:</span> <span className="text-black">{req.reason || 'Not provided'}</span></div>
                        <div><span className="text-gray-700">Status:</span> <span className="font-semibold text-yellow-600">{req.status}</span></div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        onClick={() => handleApprove(req.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                        onClick={() => handleReject(req.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Show form if showForm is true */}
        {showForm && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-lg font-semibold text-black">Admin Information</h2>
                <p className="text-sm text-black mt-1">Read-only admin details</p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Admin ID</label>
                    <input type="text" value={user?.employeeId || '--'} disabled title="Employee ID" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Name</label>
                    <input type="text" value={user?.name || '--'} disabled title="Employee name" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Department</label>
                    <input type="text" value={user?.department || '--'} disabled title="Department" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Designation</label>
                    <input type="text" value={user?.designation || '--'} disabled title="Job designation" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Official Email</label>
                    <input type="email" value={user?.email || '--'} disabled title="Official email address" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Date of Joining</label>
                    <input type="text" value={user?.dateOfJoining || '--'} disabled title="Employee joining date" className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
                <h2 className="text-lg font-semibold text-black">Resignation Details</h2>
                <p className="text-sm text-black mt-1">Please provide resignation information</p>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Resignation Date <span className="text-red-500">*</span></label>
                    <input type="text" name="resignationDate" value={formData.resignationDate} onChange={handleInputChange} placeholder="mm/dd/yyyy" className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.resignationDate ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.resignationDate && <p className="text-red-500 text-xs mt-1">{errors.resignationDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Last Working Date <span className="text-red-500">*</span></label>
                    <input type="text" name="lastWorkingDate" value={formData.lastWorkingDate} onChange={handleInputChange} placeholder="mm/dd/yyyy" className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.lastWorkingDate ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.lastWorkingDate && <p className="text-red-500 text-xs mt-1">{errors.lastWorkingDate}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Notice Period</label>
                  <select name="noticePeriod" value={formData.noticePeriod} onChange={handleInputChange} title="Select notice period" className={`w-full px-4 py-2 border rounded-lg text-black ${errors.noticePeriod ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select notice period</option>
                    {noticePeriodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  {errors.noticePeriod && <p className="text-red-500 text-xs mt-1">{errors.noticePeriod}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Reason</label>
                  <select name="reason" value={formData.reason} onChange={handleInputChange} title="Select resignation reason" className={`w-full px-4 py-2 border rounded-lg text-black ${errors.reason ? 'border-red-500' : 'border-gray-300'}`}>
                    <option value="">Select reason</option>
                    {resignationReasons.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  {errors.reason && <p className="text-red-500 text-xs mt-1">{errors.reason}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Detailed Reason</label>
                  <textarea name="detailedReason" value={formData.detailedReason} onChange={handleInputChange} rows={3} title="Enter detailed reason for resignation" placeholder="Enter your detailed reason here" className={`w-full px-4 py-2 border rounded-lg text-black ${errors.detailedReason ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.detailedReason && <p className="text-red-500 text-xs mt-1">{errors.detailedReason}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Personal Email</label>
                    <input type="email" name="personalEmail" value={formData.personalEmail} onChange={handleInputChange} title="Personal email address" placeholder="your.email@example.com" className={`w-full px-4 py-2 border rounded-lg text-black ${errors.personalEmail ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.personalEmail && <p className="text-red-500 text-xs mt-1">{errors.personalEmail}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">Contact Number</label>
                    <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleInputChange} title="Contact phone number" placeholder="+1 (555) 000-0000" className={`w-full px-4 py-2 border rounded-lg text-black ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'}`} />
                    {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">Attach Document (optional)</label>
                  <input type="file" accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleFileChange} title="Attach supporting document (PDF or Word)" className="text-black" />
                </div>

                <div className="flex items-start gap-3">
                  <input type="checkbox" checked={formData.declarationAccepted} onChange={handleDeclarationChange} title="Declare that information is true and accurate" />
                  <div>
                    <p className="text-sm text-black">I hereby declare that the information provided is true and accurate.</p>
                    {errors.declaration && <p className="text-red-500 text-xs mt-1">{errors.declaration}</p>}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={handleCancel} className="px-4 py-2 bg-white border rounded-lg text-black">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg">Submit Resignation</button>
                </div>
              </div>
            </div>
          </form>
        )}

        {/* Confirm Modal */}
        {showConfirmModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white p-6 rounded-lg max-w-md w-full">
              <h3 className="text-lg font-bold mb-4">Confirm Resignation</h3>
              <p className="mb-4">Are you sure you want to submit this resignation? This action may be reviewed by HR.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border rounded-lg">Back</button>
                <button onClick={handleConfirmSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Yes, Submit</button>
              </div>
            </div>
          </div>
        )}

        {/* Success Modal */}
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/30">
            <div className="bg-white p-6 rounded-lg max-w-md w-full text-center">
              <CheckCircle className="mx-auto mb-2 text-green-600" />
              <h3 className="text-lg font-bold mb-2">Resignation Submitted</h3>
              <p className="mb-4">Your resignation has been submitted successfully.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResignationAdmin;
