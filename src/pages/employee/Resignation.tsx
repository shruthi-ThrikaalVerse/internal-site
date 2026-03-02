import React, { useState, useEffect } from 'react';
import { ChevronDown, Upload, AlertCircle, CheckCircle, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

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

const Resignation: React.FC = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

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

    const noticePeriodOptions = [
        '30 Days',
        '60 Days',
        '90 Days'
    ];

    // Fetch user data
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await axios.get('http://localhost:8085/api/users/me', {
                    withCredentials: true
                });
                const apiUser = response.data;

                // Enrich user data with fallbacks
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
                toast.error('Failed to load employee information');
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    // Calculate notice period
    const calculateNoticePeriod = () => {
        if (formData.lastWorkingDate && formData.resignationDate) {
            const last = new Date(formData.lastWorkingDate);
            const resign = new Date(formData.resignationDate);
            const daysNotice = Math.ceil((last.getTime() - resign.getTime()) / (1000 * 60 * 60 * 24));
            return daysNotice > 0 ? daysNotice : 0;
        }
        return 0;
    };

    // Validate form
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.resignationDate) newErrors.resignationDate = 'Resignation date is required';
        if (!formData.lastWorkingDate) newErrors.lastWorkingDate = 'Last working date is required';
        if (!formData.noticePeriod) newErrors.noticePeriod = 'Please select a notice period';
        if (!formData.reason) newErrors.reason = 'Please select a reason';
        if (!formData.detailedReason.trim()) newErrors.detailedReason = 'Please provide detailed reason';
        if (!formData.personalEmail.trim()) newErrors.personalEmail = 'Personal email is required';
        if (!formData.contactNumber.trim()) newErrors.contactNumber = 'Contact number is required';
        if (!formData.declarationAccepted) newErrors.declaration = 'You must accept the declaration';

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.personalEmail && !emailRegex.test(formData.personalEmail)) {
            newErrors.personalEmail = 'Please enter a valid email';
        }

        // Validate last working date is after resignation date
        if (formData.resignationDate && formData.lastWorkingDate) {
            if (new Date(formData.lastWorkingDate) < new Date(formData.resignationDate)) {
                newErrors.lastWorkingDate = 'Last working date must be after resignation date';
            }
        }

        // Validate contact number (basic)
        if (formData.contactNumber && !/^\d{10,}$/.test(formData.contactNumber.replace(/\D/g, ''))) {
            newErrors.contactNumber = 'Please enter a valid contact number';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size should not exceed 5MB');
                return;
            }
            // Validate file type
            const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Only PDF and Word documents are allowed');
                return;
            }
            setFormData(prev => ({
                ...prev,
                document: file
            }));
        }
    };

    const handleDeclarationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            declarationAccepted: e.target.checked
        }));
        if (errors.declaration) {
            setErrors(prev => ({
                ...prev,
                declaration: ''
            }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            setShowConfirmModal(true);
        }
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
            if (formData.document) {
                formDataToSend.append('document', formData.document);
            }

            const response = await axios.post('http://localhost:8085/api/resignation', formDataToSend, {
                withCredentials: true,
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200 || response.status === 201) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    navigate('/employee/dashboard');
                }, 3000);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to submit resignation');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            navigate('/employee/dashboard');
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
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black">Employee Self Resignation</h1>
                    <p className="text-black mt-2">Please fill in all the required information carefully</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Employee Information Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-lg font-semibold text-black">Employee Information</h2>
                            <p className="text-sm text-black mt-1">Read-only employee details</p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Employee ID */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Employee ID</label>
                                    <input
                                        type="text"
                                        value={user?.employeeId || '--'}
                                        disabled
                                        title="Employee ID"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed"
                                    />
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={user?.name || '--'}
                                        disabled
                                        title="Name"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed"
                                    />
                                </div>

                                {/* Department */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Department</label>
                                    <input
                                        type="text"
                                        value={user?.department || '--'}
                                        disabled
                                        title="Department"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed"
                                    />
                                </div>

                                {/* Designation */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Designation</label>
                                    <input
                                        type="text"
                                        value={user?.designation || '--'}
                                        disabled
                                        title="Designation"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed"
                                    />
                                </div>

                                {/* Manager Name */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Manager Name</label>
                                    <input
                                        type="text"
                                        value={user?.manager || '--'}
                                        disabled
                                        title="Manager Name"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed"
                                    />
                                </div>

                                {/* Date of Joining */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Date of Joining</label>
                                    <input
                                        type="text"
                                        value={
                                            user?.dateOfJoining && user.dateOfJoining !== 'N/A'
                                                ? new Date(user.dateOfJoining).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                                : '--'
                                        }
                                        disabled
                                        title="Date of Joining"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed"
                                    />
                                </div>

                                {/* Work Location */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Work Location</label>
                                    <input
                                        type="text"
                                        value={user?.location || '--'}
                                        disabled
                                        title="Work Location"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed"
                                    />
                                </div>

                                {/* Official Email */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">Official Email</label>
                                    <input
                                        type="email"
                                        value={user?.email || '--'}
                                        disabled
                                        title="Official Email"
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-black text-sm font-medium cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Resignation Details Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-lg font-semibold text-black">Resignation Details</h2>
                            <p className="text-sm text-black mt-1">Please provide your resignation information</p>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Resignation Date */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Resignation Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="resignationDate"
                                        value={formData.resignationDate}
                                        onChange={handleInputChange}
                                        min={new Date().toISOString().split('T')[0]}
                                        title="Resignation Date"
                                        className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.resignationDate ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.resignationDate && (
                                        <p className="text-red-500 text-xs mt-1">{errors.resignationDate}</p>
                                    )}
                                </div>

                                {/* Last Working Date */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Last Working Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        name="lastWorkingDate"
                                        value={formData.lastWorkingDate}
                                        onChange={handleInputChange}
                                        min={formData.resignationDate || new Date().toISOString().split('T')[0]}
                                        title="Last Working Date"
                                        className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.lastWorkingDate ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.lastWorkingDate && (
                                        <p className="text-red-500 text-xs mt-1">{errors.lastWorkingDate}</p>
                                    )}
                                </div>
                            </div>

                            {/* Notice Period */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Notice Period <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="noticePeriod"
                                        value={formData.noticePeriod}
                                        onChange={handleInputChange}
                                        title="Notice Period"
                                        className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${errors.noticePeriod ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select notice period</option>
                                        {noticePeriodOptions.map(option => (
                                            <option key={option} value={option}>{option}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-600 pointer-events-none" />
                                </div>
                                {errors.noticePeriod && (
                                    <p className="text-red-500 text-xs mt-1">{errors.noticePeriod}</p>
                                )}
                            </div>

                            {/* Reason for Resignation */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Reason for Resignation <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        name="reason"
                                        value={formData.reason}
                                        onChange={handleInputChange}
                                        title="Reason for Resignation"
                                        className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${errors.reason ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="">Select a reason</option>
                                        {resignationReasons.map(reason => (
                                            <option key={reason} value={reason}>{reason}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="w-4 h-4 absolute right-3 top-3 text-gray-600 pointer-events-none" />
                                </div>
                                {errors.reason && (
                                    <p className="text-red-500 text-xs mt-1">{errors.reason}</p>
                                )}
                            </div>

                            {/* Detailed Reason */}
                            <div>
                                <label className="block text-sm font-medium text-black mb-2">
                                    Detailed Reason <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    name="detailedReason"
                                    value={formData.detailedReason}
                                    onChange={handleInputChange}
                                    placeholder="Please provide detailed information about your reason for resignation..."
                                    rows={4}
                                    className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.detailedReason ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.detailedReason && (
                                    <p className="text-red-500 text-xs mt-1">{errors.detailedReason}</p>
                                )}
                                <p className="text-xs text-black mt-1">{formData.detailedReason.length}/500 characters</p>
                            </div>
                        </div>
                    </div>

                    {/* Contact Information Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-lg font-semibold text-black">Contact Information</h2>
                            <p className="text-sm text-black mt-1">Where we can reach you post-employment</p>
                        </div>

                        <div className="p-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                {/* Personal Email */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Personal Email <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        name="personalEmail"
                                        value={formData.personalEmail}
                                        onChange={handleInputChange}
                                        placeholder="your.email@example.com"
                                        title="Personal Email"
                                        className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.personalEmail ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.personalEmail && (
                                        <p className="text-red-500 text-xs mt-1">{errors.personalEmail}</p>
                                    )}
                                </div>

                                {/* Contact Number */}
                                <div>
                                    <label className="block text-sm font-medium text-black mb-2">
                                        Contact Number <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleInputChange}
                                        placeholder="+1 (555) 000-0000"
                                        title="Contact Number"
                                        className={`w-full px-4 py-2 border rounded-lg text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'
                                            }`}
                                    />
                                    {errors.contactNumber && (
                                        <p className="text-red-500 text-xs mt-1">{errors.contactNumber}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Document Upload Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-lg font-semibold text-black">Supporting Documents</h2>
                            <p className="text-sm text-black mt-1">Optional - Upload any supporting documents (PDF or Word)</p>
                        </div>

                        <div className="p-6">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition cursor-pointer">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx"
                                    className="hidden"
                                    id="fileInput"
                                />
                                <label htmlFor="fileInput" className="cursor-pointer flex flex-col items-center gap-2">
                                    <Upload className="w-8 h-8 text-gray-400" />
                                    <span className="text-sm font-medium text-black">Click to upload or drag and drop</span>
                                    <span className="text-xs text-black">PDF or Word documents (max 5MB)</span>
                                    {formData.document && (
                                        <span className="text-sm text-green-600 font-medium mt-2">✓ {formData.document.name}</span>
                                    )}
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Declaration Section */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                            <h2 className="text-lg font-semibold text-black">Declaration</h2>
                        </div>

                        <div className="p-6">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="declaration"
                                    name="declaration"
                                    checked={formData.declarationAccepted}
                                    onChange={handleDeclarationChange}
                                    className="w-5 h-5 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <label htmlFor="declaration" className="text-sm font-medium text-black cursor-pointer">
                                        I confirm that the above information is correct and I understand company policies.
                                    </label>
                                    <p className="text-xs text-black mt-2">
                                        By submitting this resignation, you acknowledge that you have read and understood the company's exit policy and all applicable terms and conditions.
                                    </p>
                                </div>
                            </div>
                            {errors.declaration && (
                                <p className="text-red-500 text-xs mt-2">{errors.declaration}</p>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col-reverse sm:flex-row gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="px-6 py-2.5 border border-gray-300 text-black font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                'Submit Resignation'
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-xl">
                        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-black">Confirm Resignation Submission</h3>
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="Close"
                            >
                                <X className="w-5 h-5 text-gray-600" />
                            </button>
                        </div>

                        <div className="p-6">
                            <p className="text-sm text-black mb-4">
                                Are you sure you want to submit your resignation? This action will notify your manager and HR department. You can track the status on your dashboard.
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-yellow-800">
                                    <strong>Last Working Date:</strong> {new Date(formData.lastWorkingDate).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end p-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowConfirmModal(false)}
                                className="px-4 py-2 border border-gray-300 text-black rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm disabled:bg-blue-400"
                            >
                                Confirm & Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl max-w-sm w-full overflow-hidden shadow-xl">
                        <div className="p-6 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-black mb-2">Resignation Submitted</h3>
                            <p className="text-sm text-black mb-6">
                                Your resignation has been successfully submitted. Your manager and HR team have been notified. You will be redirected to your dashboard.
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-1">
                                <div className="bg-green-600 h-1 rounded-full animate-pulse w-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resignation;
