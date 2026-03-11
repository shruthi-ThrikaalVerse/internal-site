import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
    ShieldCheck, UserPlus, Mail, Shield,
    RotateCcw, ShieldAlert, TrendingDown,
    ShieldQuestion, Fingerprint, Calendar,
    MoreVertical, CheckCircle2, ChevronRight,
    Smartphone, MapPin, Camera, Upload, Trash2,
    BarChart3, TrendingUp, AlertCircle, Star,
    CheckCircle, CheckSquare, Edit3, Send, History
} from 'lucide-react';
import { User } from '../../types.tsx';
import { Badge, SectionHeader } from './UI.tsx';
import { Modal } from '../../components/super_admin/Modal.tsx';
import { FormInput, FormSelect } from '../../components/super_admin/FormFields.tsx';
import { useApp } from '../../context/AppContext.tsx';
import * as usersApi from '../../api/users.js';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT'];
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Operations', 'Sales', 'Marketing'];
const ADMIN_TIERS = ['ADMIN', 'PROJECT_MANAGER', 'HR', 'OPERATIONAL_MANAGER', 'SECURITY_ADMIN'];

const EMPTY_ADMIN_STATE = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ADMIN',
    employeeId: '',
    userType: 'FULL_TIME',
    username: '',
    designation: '',
    department: 'IT',
    phoneNumber: '',
    address: '',
    dateOfJoining: new Date().toISOString().split('T')[0],
    dateOfBirth: '',
};

// Performance Review Type
interface PerformanceReview {
    id: string;
    adminName: string;
    adminId: string;
    period: 'monthly' | 'quarterly' | 'yearly';
    periodLabel: string;
    rating: number;
    feedback: string;
    strengths: string;
    improvements: string;
    submittedDate: string;
    submittedBy: string;
}

export const AdminHub = () => {
    const { globalSearch, admins, setAdmins, currentUser, demoteToEmployee, terminateAdmin } = useApp();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Filter States
    const [selectedStatus, setSelectedStatus] = useState('All Statuses');

    // Modal States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isNew, setIsNew] = useState(false);
    const [formState, setFormState] = useState(EMPTY_ADMIN_STATE);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    // Identity Dossier State
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    // File upload and Loading States
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    // Confirmation Modals State
    const [confirmDemoteId, setConfirmDemoteId] = useState<string | null>(null);
    const [confirmTerminateId, setConfirmTerminateId] = useState<string | null>(null);

    // Performance Metrics State
    const [viewingUserWithPerformance, setViewingUserWithPerformance] = useState<User | null>(null);
    const [showPerformanceModal, setShowPerformanceModal] = useState(false);
    const [reviewHistory, setReviewHistory] = useState<PerformanceReview[]>([]);
    const [searchReview, setSearchReview] = useState('');
    const [reviewHistoryPeriodFilter, setReviewHistoryPeriodFilter] = useState<'all' | 'monthly' | 'quarterly' | 'yearly'>('all');
    const [performanceViewPeriod, setPerformanceViewPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [performanceViewFilter, setPerformanceViewFilter] = useState('');
    const [performanceViewYear, setPerformanceViewYear] = useState<number>(new Date().getFullYear());
    const [performanceFormPeriod, setPerformanceFormPeriod] = useState<'monthly' | 'quarterly' | 'yearly'>('monthly');
    const [performanceFormFilter, setPerformanceFormFilter] = useState('');
    const [performanceFormData, setPerformanceFormData] = useState({
        rating: '',
        feedback: '',
        strengths: '',
        improvements: ''
    });
    const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'personal' | 'performance'>('personal');

    // Helper function to format base64 image data
    const formatBase64Image = (imageData: string | null | undefined): string => {
        if (!imageData) return '';

        // If it's already a proper data URL, return as is
        if (imageData.startsWith('data:image')) {
            return imageData;
        }

        // If it's a regular HTTP/HTTPS URL, return as is
        if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
            return imageData;
        }

        // Try to decode base64 to check if it's a file path or actual image data
        if (imageData.match(/^[A-Za-z0-9+/=]+$/)) {
            try {
                const decoded = atob(imageData); // Decode base64
                console.log(`Decoded base64: "${decoded}"`);

                // Check if decoded string looks like a file path
                if (decoded.includes('/') || decoded.includes('\\') || decoded.includes('.')) {
                    // It's likely a file path - this means backend returned encoded path, not encoded image
                    console.log('Detected file path in base64, would need backend endpoint to serve it');
                    return ''; // Return empty to show fallback
                }

                // If it looks like raw binary/image data, treat as base64 image
                return `data:image/jpeg;base64,${imageData}`;
            } catch (e) {
                console.warn('Failed to decode base64:', e);
                return '';
            }
        }

        return '';
    };

    // Transform API response to match User type
    const transformAdminData = (apiData: any): User => {
        // Format the profile image with proper base64 prefix
        const formattedAvatar = formatBase64Image(apiData.profileImage || apiData.avatar);

        return {
            id: apiData.id || apiData.employeeId || apiData.userId || `adm-${Date.now()}`,
            name: apiData.name || `${apiData.firstName || ''} ${apiData.lastName || ''}`.trim(),
            firstName: apiData.firstName || '',
            lastName: apiData.lastName || '',
            email: apiData.email || '',
            role: apiData.role || 'ADMIN',
            status: apiData.status || 'active',
            avatar: formattedAvatar,
            employeeId: apiData.employeeId || apiData.id,
            username: apiData.username || apiData.firstName?.toUpperCase() || '',
            designation: apiData.designation || '',
            department: apiData.department || 'IT',
            phoneNumber: apiData.phoneNumber || '',
            address: apiData.address || '',
            dateOfJoining: apiData.dateOfJoining || apiData.joiningDate || new Date().toISOString().split('T')[0],
            dateOfBirth: apiData.dateOfBirth || '',
            employmentType: apiData.employmentType || apiData.userType || 'FULL_TIME',
            location: apiData.location || 'Central Command Hub',
            profileImage: apiData.profileImage, // Store raw for debugging if needed
            createdByEmployeeId: apiData.createdByEmployeeId || '',
            createdByRole: apiData.createdByRole || '',
            createdByName: apiData.createdByName || '',
            hrEmployeeId: apiData.hrEmployeeId || '',
        };
    };

    // Fetch admin employees from API - removed, handled by second useEffect below

    const statuses = ['All Statuses', 'active', 'inactive', 'pending'];
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    // Load admin employees on component mount
    useEffect(() => {
        const loadAdminEmployees = async () => {
            try {
                console.log('Loading admin employees...');
                const employees = await usersApi.getAdminEmployees();
                console.log('Admin employees loaded:', employees);

                // Transform API response to User objects and set state
                if (Array.isArray(employees)) {
                    const formattedAdmins: User[] = employees
                        .filter((emp: any) => {
                            const roleVal = String(emp.role || emp.userType || '').toUpperCase();
                            return ADMIN_TIERS.includes(roleVal);
                        })
                        .map((emp: any) => {
                            const roleVal = String(emp.role || emp.userType || 'ADMIN').toUpperCase();
                            const statusValue = String(emp.status || 'active') as 'active' | 'inactive' | 'probation' | 'resigned';
                            return {
                                id: String(emp.employeeId || emp.id || `adm-${Date.now()}`),
                                name: `${String(emp.firstName || '')} ${String(emp.lastName || '')}`.trim(),
                                firstName: String(emp.firstName || ''),
                                lastName: String(emp.lastName || ''),
                                email: String(emp.email || ''),
                                role: (ADMIN_TIERS.includes(roleVal) ? roleVal : 'ADMIN') as any,
                                status: statusValue,
                                department: String(emp.department || 'IT'),
                                avatar: formatBase64Image(String(emp.profileImage || emp.avatar || '')),
                                employmentType: String(emp.userType || 'FULL_TIME'),
                                dateOfJoining: String(emp.dateOfJoining || new Date().toISOString().split('T')[0]),
                                employeeId: String(emp.employeeId || ''),
                                designation: String(emp.designation || 'Admin'),
                            };
                        });
                    setAdmins(formattedAdmins);
                }
            } catch (err) {
                console.error('Failed to load admin employees:', err);
            }
        };
        loadAdminEmployees();
    }, [setAdmins]);

    const handleResetFilters = () => {
        setSelectedStatus('All Statuses');
    };

    const filteredAdmins = useMemo(() => {
        return admins.filter(a => {
            // Ensure only admin tiers are displayed
            if (!ADMIN_TIERS.includes(String(a.role).toUpperCase())) return false;

            const fullName = `${a.firstName || ''} ${a.lastName || a.name || ''}`.toLowerCase();
            const matchesSearch = !globalSearch ||
                fullName.includes(globalSearch.toLowerCase()) ||
                a.email.toLowerCase().includes(globalSearch.toLowerCase());

            const matchesStatus = selectedStatus === 'All Statuses' || a.status === selectedStatus;

            return matchesSearch && matchesStatus;
        });
    }, [admins, globalSearch, selectedStatus]);

    const handleEdit = (admin: User) => {
        setIsNew(false);
        setEditingId(admin.id);
        console.log('Editing admin with ID:', admin.id);
        console.log('Admin object:', admin);
        setFormState({
            firstName: admin.firstName || admin.name.split(' ')[0] || '',
            lastName: admin.lastName || admin.name.split(' ').slice(1).join(' ') || '',
            email: admin.email || '',
            password: '',
            role: admin.role || 'ADMIN',
            employeeId: admin.employeeId || '',
            userType: (admin.employmentType || 'FULL_TIME') as any,
            username: (admin.username || admin.firstName?.toUpperCase()) || '',
            designation: (admin.designation || '') as any,
            department: (admin.department || 'IT') as any,
            phoneNumber: (admin.phoneNumber || '') as any,
            address: (admin.address || '') as any,
            dateOfJoining: admin.dateOfJoining || new Date().toISOString().split('T')[0],
            dateOfBirth: (admin.dateOfBirth || '') as any,
        });
        // Handle base64 image for preview
        setImagePreview(formatBase64Image(admin.profileImage || admin.avatar) || '');
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setFormState(EMPTY_ADMIN_STATE);
        setIsNew(true);
        setEditingId(null);
        setSelectedImage(null);
        setImagePreview('');
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem('accessToken');

            if (isNew) {
                // CREATE NEW ADMIN - POST to register endpoint
                const formData = new FormData();

                const data = {
                    firstName: formState.firstName,
                    lastName: formState.lastName,
                    email: formState.email,
                    password: formState.password,
                    role: formState.role,
                    employeeId: formState.employeeId,
                    userType: formState.userType,
                    username: formState.username,
                    designation: formState.designation,
                    department: formState.department,
                    phoneNumber: formState.phoneNumber,
                    address: formState.address,
                    dateOfJoining: formState.dateOfJoining,
                    dateOfBirth: formState.dateOfBirth,
                };

                formData.append('data', JSON.stringify(data));

                if (selectedImage) {
                    formData.append('image', selectedImage);
                }

                const response = await fetch('http://localhost:8085/api/users/register', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: formData,
                });

                const result = await response.json();
                console.log('Admin Registration Response:', result);

                if (response.ok) {
                    console.log('Admin registered successfully:', result);

                    // Extract real ID from backend response
                    const realAdminId = result.id || result.userId || result.employeeId;
                    console.log('Real admin ID from backend:', realAdminId);

                    // Wait to ensure backend has persisted the data
                    await new Promise(resolve => setTimeout(resolve, 500));

                    // Refetch admins to get the real ID and all backend-generated data
                    try {
                        const refetchResponse = await fetch('http://localhost:8085/api/users/admin/employees', {
                            method: 'GET',
                            headers: {
                                'Authorization': `Bearer ${token}`,
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                        });

                        if (refetchResponse.ok) {
                            const refetchData = await refetchResponse.json();
                            const rawAdminsData = Array.isArray(refetchData) ? refetchData : refetchData.data || [];

                            console.log('Raw admins from refetch:', rawAdminsData);

                            const seenEmails = new Set<string>();
                            const filteredAdmins = rawAdminsData
                                .filter((admin: any) => ADMIN_TIERS.includes(admin.role))
                                .filter((admin: any) => {
                                    if (seenEmails.has(admin.email)) {
                                        return false;
                                    }
                                    seenEmails.add(admin.email);
                                    return true;
                                })
                                .map(transformAdminData);

                            console.log('Filtered admin list after creation:', filteredAdmins);
                            setAdmins(filteredAdmins);

                            // Find the newly created admin to log its real ID
                            const newAdmin = filteredAdmins.find((a: User) => a.email === formState.email);
                            if (newAdmin) {
                                console.log('Newly created admin ID:', newAdmin.id);
                            }
                        } else {
                            console.warn('Refetch response status:', refetchResponse.status);
                        }
                    } catch (refetchErr) {
                        console.warn('Failed to refetch admins:', refetchErr);
                    }

                    setIsModalOpen(false);
                    setSelectedImage(null);
                    setImagePreview('');
                    setFormState(EMPTY_ADMIN_STATE);
                    alert('Admin created successfully!');
                } else {
                    console.error('Admin registration failed:', result);
                    alert(result.message || 'Failed to register admin');
                }
            } else {
                // UPDATE EXISTING ADMIN - PUT to super_admin/update endpoint
                const adminId = editingId;
                console.log('Attempting to update admin with ID:', adminId);
                const formData = new FormData();
                const updateData = {
                    firstName: formState.firstName,
                    lastName: formState.lastName,
                    phoneNumber: formState.phoneNumber,
                    address: formState.address,
                    department: formState.department,
                    employeeId: formState.employeeId,
                    userType: formState.userType,
                    designation: formState.designation,
                };

                console.log('Updating admin with data:', updateData);
                Object.entries(updateData).forEach(([key, value]) => {
                    if (value !== undefined && value !== null && value !== '') {
                        formData.append(key, String(value));
                        console.log(`  Field - ${key}: ${value}`);
                    }
                });

                // Add image if new
                if (selectedImage) {
                    try {
                        console.log('Adding selected image to FormData...');
                        formData.append('profileImage', selectedImage, `profile-${adminId}.png`);
                        console.log('Image added to FormData');
                    } catch (imgErr) {
                        console.warn('Could not add image:', imgErr);
                    }
                }

                console.log('Sending update to:', `/api/users/super_admin/update/${adminId}`);

                const updateResponse = await fetch(`http://localhost:8085/api/users/super_admin/update/${adminId}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: formData,
                });

                console.log('Update response status:', updateResponse.status);

                const responseText = await updateResponse.text();
                console.log('Response body:', responseText);

                if (updateResponse.ok || updateResponse.status === 200) {
                    try {
                        const result = JSON.parse(responseText);
                        console.log('Success response:', result);
                    } catch (e) {
                        console.log('Response is valid but not JSON');
                    }

                    // Update local state
                    setAdmins(prev => prev.map(a =>
                        a.id === adminId
                            ? {
                                ...a,
                                firstName: formState.firstName,
                                lastName: formState.lastName,
                                name: `${formState.firstName} ${formState.lastName}`.trim(),
                                phoneNumber: formState.phoneNumber,
                                address: formState.address,
                                designation: formState.designation,
                                department: formState.department,
                                employmentType: formState.userType,
                                avatar: selectedImage ? formatBase64Image(imagePreview) : a.avatar,
                            }
                            : a
                    ));

                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormState(EMPTY_ADMIN_STATE);
                    setSelectedImage(null);
                    setImagePreview('');
                    alert('Admin details updated successfully!');
                } else {
                    console.error('Update failed with status:', updateResponse.status);
                    console.error('Update failed for admin ID:', adminId);
                    console.error('Full response:', responseText);
                    try {
                        const error = JSON.parse(responseText);
                        console.error('Error details:', error);
                        alert(`Error: ${error.message || 'Failed to update admin'}`);
                    } catch (e) {
                        console.error('Could not parse error response:', responseText);

                        // If using a temporary ID, suggest refreshing
                        if (adminId && adminId.startsWith('adm-') && adminId.length > 10) {
                            alert(`Failed to update admin.\n\nThe admin ID appears to be temporary. Please refresh the page and try editing the admin again from the updated list.`);
                        } else {
                            alert(`Failed to update admin (${updateResponse.status}): ${responseText}`);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error saving admin:', error);
            alert('Error: ' + (error as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDirectTerminateAdmin = async (adminId: string) => {
        try {
            const token = localStorage.getItem('accessToken');
            const adminData = admins.find(a => a.id === adminId);
            const empId = adminData?.employeeId || adminId;

            console.log('Terminating admin:', {
                adminId: empId,
                fullAdminData: adminData,
            });

            const response = await fetch(`http://localhost:8085/api/users/admin/terminate/${empId}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });

            console.log('Terminate response status:', response.status);
            const responseText = await response.text();
            console.log('Terminate response body:', responseText);

            if (response.ok || response.status === 200) {
                try {
                    const result = JSON.parse(responseText);
                    console.log('Admin terminated successfully:', result);
                } catch (e) {
                    console.log('Response is not JSON');
                }

                // Remove from local state
                setAdmins(prev => prev.filter(a => a.id !== adminId));
                setConfirmTerminateId(null);
                alert(`Admin (ID: ${empId}) has been terminated successfully.`);
            } else {
                try {
                    const error = JSON.parse(responseText);
                    console.error('Termination failed:', error);
                    alert(error.message || `Failed to terminate admin: ${response.status}`);
                } catch (e) {
                    console.error('Termination failed with response:', responseText);
                    alert(`Failed to terminate admin. Server returned: ${response.status}`);
                }
            }
        } catch (error) {
            console.error('Error terminating admin:', error);
            alert('An error occurred while terminating the admin: ' + (error as Error).message);
        }
    };

    const updateField = (field: keyof typeof EMPTY_ADMIN_STATE, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
    };

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (5MB limit)
            const maxSize = 5 * 1024 * 1024; // 5MB
            if (file.size > maxSize) {
                alert(`File size exceeds 5MB. Please select a smaller image. (Current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
                return;
            }

            // Check file type
            if (!file.type.startsWith('image/')) {
                alert('Please select a valid image file.');
                return;
            }

            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDemoteFromModal = (id: string) => {
        setViewingUser(null);
        setConfirmDemoteId(id);
    };

    const handleTerminateFromModal = (id: string) => {
        setViewingUser(null);
        setConfirmTerminateId(id);
    };

    const activeFilterCount = selectedStatus !== 'All Statuses' ? 1 : 0;

    // Performance Metrics Helpers
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const availablePeriods = useMemo(() => {
        if (performanceViewPeriod === 'monthly') {
            return monthNames.map((m, i) => ({ label: m, value: (i + 1).toString() }));
        }
        if (performanceViewPeriod === 'quarterly') {
            return [
                { label: 'Q1', value: '1' },
                { label: 'Q2', value: '2' },
                { label: 'Q3', value: '3' },
                { label: 'Q4', value: '4' }
            ];
        }
        return [performanceViewYear - 1, performanceViewYear].map(y => ({ label: y.toString(), value: y.toString() }));
    }, [performanceViewPeriod, performanceViewYear]);

    const availableFormPeriods = useMemo(() => {
        if (performanceFormPeriod === 'monthly') {
            return monthNames.map((m, i) => ({ label: m, value: (i + 1).toString() }));
        }
        if (performanceFormPeriod === 'quarterly') {
            return [
                { label: 'Q1', value: '1' },
                { label: 'Q2', value: '2' },
                { label: 'Q3', value: '3' },
                { label: 'Q4', value: '4' }
            ];
        }
        return [performanceViewYear - 1, performanceViewYear].map(y => ({ label: y.toString(), value: y.toString() }));
    }, [performanceFormPeriod, performanceViewYear]);

    // Set default filter when periods change
    useEffect(() => {
        if (availablePeriods.length === 0) return;
        const now = new Date();
        if (performanceViewPeriod === 'monthly') {
            setPerformanceViewFilter((now.getMonth() + 1).toString());
        } else if (performanceViewPeriod === 'quarterly') {
            const q = Math.floor(now.getMonth() / 3) + 1;
            setPerformanceViewFilter(q.toString());
        } else {
            setPerformanceViewFilter(performanceViewYear.toString());
        }
    }, [availablePeriods, performanceViewPeriod, performanceViewYear]);

    useEffect(() => {
        if (availableFormPeriods.length === 0) return;
        const now = new Date();
        if (performanceFormPeriod === 'monthly') {
            setPerformanceFormFilter((now.getMonth() + 1).toString());
        } else if (performanceFormPeriod === 'quarterly') {
            const q = Math.floor(now.getMonth() / 3) + 1;
            setPerformanceFormFilter(q.toString());
        } else {
            setPerformanceFormFilter(performanceViewYear.toString());
        }
    }, [availableFormPeriods, performanceFormPeriod, performanceViewYear]);

    // Generate raw performance data with pie chart info
    const generatePerformanceData = () => {
        // Generate random but consistent raw data
        const seed = viewingUser?.id || 'default';
        const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

        // Attendance data
        const presentDays = 18 + (hash % 5);
        const absentDays = 2 + (hash % 3);

        // Leave data
        const leavesTaken = 2 + (hash % 6);
        const workingDays = 25;

        // Projects data
        const completedProjects = 5 + (hash % 5);
        const pendingProjects = 2 + (hash % 3);

        return {
            attendance: [
                { name: 'Present', value: presentDays, fill: '#3b82f6' },
                { name: 'Absent', value: absentDays, fill: '#fbbf24' }
            ],
            leave: [
                { name: 'Leaves Taken', value: leavesTaken, fill: '#ef4444' },
                { name: 'Working Days', value: workingDays - leavesTaken, fill: '#10b981' }
            ],
            projects: [
                { name: 'Completed', value: completedProjects, fill: '#10b981' },
                { name: 'Pending', value: pendingProjects, fill: '#ef4444' }
            ]
        };
    };

    const pieChartData = useMemo(() => {
        return generatePerformanceData();
    }, [viewingUser?.id]);

    // Load dummy review history
    useEffect(() => {
        if (!viewingUser || activeTab !== 'performance') {
            setReviewHistory([]);
            return;
        }

        const dummyReviews: PerformanceReview[] = [
            {
                id: '1',
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: 'monthly',
                periodLabel: 'March 2026',
                rating: 4.8,
                feedback: 'Outstanding performance in Q1. Exceptional management of security protocols and quick incident response.',
                strengths: 'Proactive security measures, excellent team collaboration, strong leadership',
                improvements: 'Minor: Document edge cases more thoroughly',
                submittedDate: '2026-04-02',
                submittedBy: 'Super Admin'
            },
            {
                id: '2',
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: 'monthly',
                periodLabel: 'February 2026',
                rating: 4.5,
                feedback: 'Excellent performance managing administrative access and security protocols. Consistently maintains system integrity.',
                strengths: 'Strong security awareness, proactive problem solving, excellent documentation',
                improvements: 'Could improve response time during high-load periods',
                submittedDate: '2026-03-01',
                submittedBy: 'Super Admin'
            },
            {
                id: '3',
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: 'monthly',
                periodLabel: 'January 2026',
                rating: 4.2,
                feedback: 'Good performance overall. Handles routine administrative tasks effectively with minimal errors.',
                strengths: 'Detail-oriented, reliable, good communication skills',
                improvements: 'Work on faster troubleshooting and optimization techniques',
                submittedDate: '2026-02-01',
                submittedBy: 'Super Admin'
            },
            {
                id: '4',
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: 'quarterly',
                periodLabel: 'Q4 2025',
                rating: 4.3,
                feedback: 'Good overall performance. Shows improvement in user privilege management and access controls. Met all quarterly targets.',
                strengths: 'Reliable, good documentation practices, team player, consistent performer',
                improvements: 'Needs to improve audit log review frequency and stakeholder reporting',
                submittedDate: '2026-01-15',
                submittedBy: 'Super Admin'
            },
            {
                id: '5',
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: 'quarterly',
                periodLabel: 'Q3 2025',
                rating: 3.9,
                feedback: 'Satisfactory performance in Q3. Completed assigned tasks but could improve efficiency and initiative.',
                strengths: 'Follows procedures well, good attendance, cooperative attitude',
                improvements: 'Need to show more initiative, take on challenging projects, improve response times',
                submittedDate: '2025-10-20',
                submittedBy: 'Super Admin'
            },
            {
                id: '6',
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: 'quarterly',
                periodLabel: 'Q2 2025',
                rating: 4.1,
                feedback: 'Good quarterly performance with steady progress in key responsibilities. Demonstrates strong technical foundation.',
                strengths: 'Technical skills, problem-solving ability, willing to learn',
                improvements: 'Improve communication with team members, document processes better',
                submittedDate: '2025-07-15',
                submittedBy: 'Super Admin'
            },
            {
                id: '7',
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: 'yearly',
                periodLabel: 'Year 2025',
                rating: 4.1,
                feedback: 'Good annual performance. Demonstrated consistent growth throughout 2025 with solid contributions to system administration.',
                strengths: 'Reliable performer, good technical skills, team cooperation, continuous learning',
                improvements: 'Work on leadership skills development, improve documentation practices, faster incident response',
                submittedDate: '2025-12-20',
                submittedBy: 'Super Admin'
            },
            {
                id: '8',
                adminName: viewingUser.name,
                adminId: viewingUser.employeeId,
                period: 'yearly',
                periodLabel: 'Year 2024',
                rating: 3.8,
                feedback: 'Satisfactory annual performance. Met core job requirements with some areas needing improvement for career progression.',
                strengths: 'Follows guidelines, stable attendance, basic technical competency',
                improvements: 'Show more initiative, improve problem-solving skills, enhance communication',
                submittedDate: '2024-12-22',
                submittedBy: 'Super Admin'
            }
        ];
        setReviewHistory(dummyReviews);
    }, [viewingUser, activeTab]);

    const handlePerformanceReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!performanceFormData.rating || !performanceFormData.feedback) {
            alert('Please fill in rating and feedback');
            return;
        }

        try {
            const periodString = performanceFormPeriod === 'monthly'
                ? monthNames[parseInt(performanceFormFilter) - 1] + ' ' + performanceViewYear
                : performanceFormPeriod === 'quarterly'
                    ? `Q${performanceFormFilter} ${performanceViewYear}`
                    : `Year ${performanceFormFilter}`;

            const newReview: PerformanceReview = {
                id: String(reviewHistory.length + 1),
                adminName: viewingUserWithPerformance?.name || 'Unknown',
                adminId: viewingUserWithPerformance?.employeeId || 'N/A',
                period: performanceFormPeriod,
                periodLabel: periodString,
                rating: parseFloat(performanceFormData.rating),
                feedback: performanceFormData.feedback,
                strengths: performanceFormData.strengths,
                improvements: performanceFormData.improvements,
                submittedDate: new Date().toISOString().split('T')[0],
                submittedBy: 'Admin Review'
            };

            setReviewHistory([newReview, ...reviewHistory]);

            // Reset form
            setPerformanceFormData({
                rating: '',
                feedback: '',
                strengths: '',
                improvements: ''
            });

            alert('Performance review submitted successfully!');
        } catch (error) {
            console.error('Error submitting review:', error);
            alert('Failed to submit review. Please try again.');
        }
    };

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Admin Hub"
                description="Manage system access, security tiers, and administrative privileges."
                actions={
                    <button
                        onClick={handleAddNew}
                        className="flex items-center justify-center gap-2 bg-blue-600 px-5 py-3 rounded-xl text-sm font-bold shadow-2xl shadow-blue-200 hover:bg-blue-700 transition-all transform hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto text-white"
                    >
                        <UserPlus size={18} />
                        <span>New Admin</span>
                    </button>
                }
            />

            {/* Admin Direct Termination Section (Only for Super Admin) */}
            {isSuperAdmin && (
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-3xl p-6 mb-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                            <ShieldAlert size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-gray-900 tracking-tight">Admin Privilege Termination</h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">Only accessible by Super Admin Tier</p>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500 mb-6 max-w-2xl leading-relaxed">
                        Directly deactivate administrator accounts to revoke all system-wide access instantly. This action is tracked in the audit logs and requires secondary verification.
                    </p>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-white/50 p-4 rounded-2xl border border-gray-200 backdrop-blur-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
                <div className="flex-1 flex gap-3 w-full">
                    <div className="flex-1 max-w-xs">
                        <FormSelect
                            label="Account Status"
                            value={selectedStatus}
                            onChange={setSelectedStatus}
                            options={statuses}
                        />
                    </div>
                </div>
                {activeFilterCount > 0 && (
                    <button
                        onClick={handleResetFilters}
                        title="Reset filters"
                        className="h-[44px] px-4 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all border border-gray-200 self-end mb-1"
                    >
                        <RotateCcw size={16} />
                    </button>
                )}
            </div>

            {/* Admins Table */}
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead className="bg-gray-50 backdrop-blur-md border-b border-gray-200">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Administrator Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Security Tier</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Email Address</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Joining Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredAdmins.map((a) => (
                                <tr key={a.id} className={`hover:bg-gray-50 transition-all group border-l-2 border-transparent hover:border-blue-500 ${a.status === 'inactive' ? 'opacity-50 grayscale' : ''}`}>
                                    <td className="px-8 py-5 cursor-pointer" onClick={() => setViewingUser(a)}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative shrink-0">
                                                {/* Image with error handling for base64 images */}
                                                {a.avatar && (
                                                    <>
                                                        <img
                                                            src={formatBase64Image(a.avatar)}
                                                            alt={a.name}
                                                            className="w-12 h-12 rounded-xl border border-gray-200 shadow-xl group-hover:scale-105 transition-transform object-cover"
                                                            onError={(e) => {
                                                                // Hide image if it fails to load
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                            }}
                                                        />
                                                        <Shield className={`absolute -bottom-1 -right-1 w-4 h-4 p-0.5 rounded-full border border-white ${a.role.includes('SUPER') ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`} />
                                                    </>
                                                )}
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                                    {a.firstName ? `${a.firstName} ${a.lastName}` : a.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-gray-500 font-mono opacity-70">UID: {a.employeeId || a.id.toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge color={a.role.includes('SUPER') ? 'red' : 'green'}>{a.role.toUpperCase()}</Badge>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge color={a.status === 'active' ? 'green' : 'red'}>{a.status.toUpperCase()}</Badge>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[11px] text-gray-900 font-mono bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 w-fit group-hover:text-blue-600 group-hover:border-blue-300 transition-all">
                                            <Mail size={12} className="text-blue-600" /> {a.email}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[11px] text-gray-900 font-bold">
                                            <Calendar size={12} className="text-blue-600" />
                                            {a.dateOfJoining || a.joiningDate || '2024-01-01'}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {isSuperAdmin && a.id !== currentUser?.id && a.status === 'active' && (
                                                <>
                                                    <button
                                                        onClick={() => setConfirmDemoteId(a.id)}
                                                        title="Demote to Employee Tier"
                                                        className="p-2.5 bg-blue-600/10 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                    >
                                                        <TrendingDown size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmTerminateId(a.id)}
                                                        title="Directly Terminate Admin Access"
                                                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleEdit(a)}
                                                title="Manage Security Tiers"
                                                className="p-2.5 bg-gray-100 hover:bg-blue-600 text-gray-500 hover:text-white rounded-xl transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                            >
                                                <ShieldCheck size={18} />
                                            </button>
                                            <button
                                                onClick={() => { setViewingUser(a); setActiveTab('performance'); setViewingUserWithPerformance(a); }}
                                                title="View Performance Metrics"
                                                className="p-2.5 bg-emerald-100 hover:bg-emerald-600 text-emerald-600 hover:text-white rounded-xl transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                                            >
                                                <BarChart3 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredAdmins.length === 0 && (
                        <div className="p-24 text-center flex flex-col items-center gap-4 bg-white">
                            <ShieldQuestion size={64} className="text-gray-300 animate-pulse" />
                            <div className="space-y-1">
                                <h4 className="text-gray-900 font-bold text-lg">No Admins Found</h4>
                                <p className="text-gray-500 text-sm max-w-xs">Verify your search criteria or check the system logs.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Identity Dossier (Profile Page) with Tabs */}
            {viewingUser && (
                <Modal
                    isOpen={!!viewingUser}
                    onClose={() => { setViewingUser(null); setActiveTab('personal'); }}
                    title="Admin Identity Dossier"
                    onSave={() => { setViewingUser(null); setActiveTab('personal'); }}
                    isLoading={false}
                    maxWidth="max-w-6xl"
                    showFooter={false}
                >
                    {/* Tab Buttons */}
                    <div className="flex mb-6 border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('personal')}
                            className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'personal'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <UserPlus size={16} />
                            Personal Details
                        </button>
                        <button
                            onClick={() => setActiveTab('performance')}
                            className={`flex-1 px-6 py-4 font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'performance'
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <BarChart3 size={16} />
                            Performance Metrics
                        </button>
                    </div>

                    {/* Content Area */}
                    <div className="space-y-8">
                        {/* Personal Details Tab */}
                        {activeTab === 'personal' && (
                            <div className="space-y-8">
                                <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-gray-100 to-white border border-gray-200 overflow-hidden shadow-2xl">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                                    <div className="flex flex-col items-center text-center">
                                        <div className="relative mb-6">
                                            {viewingUser.avatar ? (
                                                <img
                                                    src={formatBase64Image(viewingUser.avatar)}
                                                    className="w-32 h-32 rounded-[2.5rem] border-4 border-gray-200 shadow-2xl object-cover"
                                                    alt={viewingUser.name}
                                                    onError={(e) => {
                                                        const target = e.target as HTMLImageElement;
                                                        target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <div className="w-32 h-32 rounded-[2.5rem] border-4 border-gray-200 shadow-2xl bg-gray-200 flex items-center justify-center">
                                                    <UserPlus size={50} className="text-gray-400" />
                                                </div>
                                            )}
                                            <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white bg-emerald-500 shadow-lg`}>
                                                <Shield size={20} className="text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">{viewingUser.name}</h3>
                                        <p className="text-emerald-400 font-bold uppercase tracking-widest text-sm mt-1 mb-4">{viewingUser.role}</p>
                                        <div className="flex gap-2">
                                            <Badge color="green">ADMINISTRATIVE ACCESS</Badge>
                                            <Badge color={viewingUser.status === 'active' ? 'slate' : 'red'}>{viewingUser.status.toUpperCase()}</Badge>
                                        </div>
                                    </div>
                                </div>

                                {/* Demote & Terminate Action Boxes (Only for Super Admin, cannot target self) */}
                                {isSuperAdmin && viewingUser.id !== currentUser?.id && viewingUser.status === 'active' && (
                                    <div className="space-y-4">
                                        <div className="p-6 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                                                    <TrendingDown size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-gray-900 tracking-tight">Access Demotion</h4>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Target tier: Admin → Employee</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDemoteFromModal(viewingUser.id)}
                                                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95"
                                            >
                                                Demote <ChevronRight size={14} />
                                            </button>
                                        </div>

                                        <div className="p-6 rounded-[1.5rem] bg-rose-500/5 border border-rose-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-rose-500/10 rounded-xl text-rose-500">
                                                    <Trash2 size={24} />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-black text-gray-900 tracking-tight">Account Deactivation</h4>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Terminate all administrative keys</p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleTerminateFromModal(viewingUser.id)}
                                                className="w-full sm:w-auto px-6 py-3 bg-rose-500 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-rose-600 transition-all flex items-center justify-center gap-2 shadow-xl shadow-rose-500/20 active:scale-95"
                                            >
                                                Terminate <ChevronRight size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Smartphone size={14} className="text-emerald-500" /> Communication Channels
                                        </h4>
                                        <div className="space-y-3 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Admin Email</span>
                                                <span className="text-gray-900 font-semibold">{viewingUser.email}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Phone Number</span>
                                                <span className="text-gray-900 font-medium">{viewingUser.phoneNumber || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Operational Location</span>
                                                <span className="text-gray-900 font-medium">{viewingUser.location || 'Central Command Hub'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Fingerprint size={14} className="text-emerald-500" /> Security Context
                                        </h4>
                                        <div className="space-y-3 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Security UID</span>
                                                <span className="text-emerald-400 font-mono font-bold tracking-tighter">{viewingUser.employeeId || viewingUser.id}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">HR Employee ID</span>
                                                <span className="text-gray-900 font-mono">{(viewingUser as any).hrEmployeeId || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Elevation Date</span>
                                                <span className="text-gray-900 font-semibold">{viewingUser.dateOfJoining}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4 p-6 rounded-2xl bg-blue-50 border border-blue-100">
                                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <UserPlus size={14} className="text-blue-600" /> Created By Information
                                        </h4>
                                        <div className="space-y-3 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Creator Name</span>
                                                <span className="text-gray-900 font-semibold">{(viewingUser as any).createdByName || 'System'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Creator Role</span>
                                                <span className="text-blue-600 font-bold">{(viewingUser as any).createdByRole || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Creator ID</span>
                                                <span className="text-gray-900 font-mono">{(viewingUser as any).createdByEmployeeId || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                                        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                            <Calendar size={14} className="text-emerald-500" /> Professional Details
                                        </h4>
                                        <div className="space-y-3 text-xs">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Designation</span>
                                                <span className="text-gray-900 font-semibold">{viewingUser.designation || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Department</span>
                                                <span className="text-gray-900 font-semibold">{viewingUser.department || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Address</span>
                                                <span className="text-gray-900 font-semibold">{viewingUser.address || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Performance Metrics Tab */}
                        {activeTab === 'performance' && viewingUser && (
                            <div className="flex flex-col h-full gap-6">
                                <div>
                                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 mb-2 flex items-center gap-3">
                                        <div className="p-3 bg-indigo-100 rounded-2xl">
                                            <BarChart3 className="w-7 h-7 text-indigo-600" />
                                        </div>
                                        Performance Metrics & Review
                                    </h2>
                                    <p className="text-slate-600 text-sm">Monitor admin performance across attendance, leave, and project metrics</p>
                                </div>

                                {/* Filter Controls */}
                                <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                                    <div className="flex flex-wrap items-end gap-6">
                                        <div>
                                            <label className="text-xs font-black text-black uppercase tracking-widest mb-2 block">Period Type</label>
                                            <div className="flex gap-2 bg-slate-50 p-1 rounded-xl">
                                                {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                                                    <button
                                                        key={period}
                                                        onClick={() => setPerformanceViewPeriod(period)}
                                                        className={`px-4 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${performanceViewPeriod === period
                                                                ? 'bg-indigo-600 text-white shadow-lg'
                                                                : 'bg-transparent text-slate-600 hover:text-black'
                                                            }`}
                                                    >
                                                        {period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Yearly'}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-xs font-black text-black uppercase tracking-widest mb-1 block">Year</label>
                                            <input
                                                type="number"
                                                title="Select performance review year"
                                                value={performanceViewYear}
                                                onChange={(e) => setPerformanceViewYear(parseInt(e.target.value, 10))}
                                                className="w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            />
                                        </div>

                                        <div className="flex-1 max-w-xs">
                                            <label className="text-xs font-black text-black uppercase tracking-widest mb-1 block">Select Period</label>
                                            <select
                                                title="Select performance review period"
                                                value={performanceViewFilter}
                                                onChange={(e) => setPerformanceViewFilter(e.target.value)}
                                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                                            >
                                                {availablePeriods.map((p) => (
                                                    <option key={p.value} value={p.value}>
                                                        {p.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Charts and Form in 2-Column Layout */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
                                    {/* 3 Charts Section - Stacked Vertically */}
                                    <div className="col-span-1 space-y-8">
                                        {/* Attendance Chart */}
                                        <div className="bg-white rounded-3xl shadow-md border border-blue-200 overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 border-b border-blue-200">
                                                <h3 className="text-lg font-black text-black flex items-center gap-3">
                                                    <div className="p-2 bg-blue-100 rounded-xl">
                                                        <CheckCircle className="w-6 h-6 text-blue-600" />
                                                    </div>
                                                    Attendance Record
                                                </h3>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200 text-center">
                                                        <p className="text-2xl font-black text-blue-600">{pieChartData.attendance[0]?.value || 0}</p>
                                                        <p className="text-xs font-bold text-blue-700 uppercase tracking-widest mt-2">Present</p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 border border-yellow-200 text-center">
                                                        <p className="text-2xl font-black text-yellow-600">{pieChartData.attendance[1]?.value || 0}</p>
                                                        <p className="text-xs font-bold text-yellow-700 uppercase tracking-widest mt-2">Absent</p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 text-center">
                                                        <p className="text-2xl font-black text-green-600">{Math.round((pieChartData.attendance[0]?.value || 0) / ((pieChartData.attendance[0]?.value || 0) + (pieChartData.attendance[1]?.value || 1)) * 100)}%</p>
                                                        <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-2">Rate</p>
                                                    </div>
                                                </div>
                                                <div className="h-96">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={pieChartData.attendance}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, value }) => `${name}: ${value}`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {pieChartData.attendance.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `${value} days`} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Leave Chart */}
                                        <div className="bg-white rounded-3xl shadow-md border border-red-200 overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-red-200">
                                                <h3 className="text-lg font-black text-black flex items-center gap-3">
                                                    <div className="p-2 bg-red-100 rounded-xl">
                                                        <Calendar className="w-6 h-6 text-red-600" />
                                                    </div>
                                                    Leave Balance
                                                </h3>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-4 border border-red-200">
                                                        <p className="text-2xl font-black text-red-600">{pieChartData.leave[1]?.value || 0}</p>
                                                        <p className="text-xs font-bold text-red-700 uppercase tracking-widest mt-2">Leaves Taken</p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
                                                        <p className="text-2xl font-black text-green-600">{(pieChartData.leave[0]?.value || 0) + (pieChartData.leave[1]?.value || 1)}</p>
                                                        <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-2">Working Days</p>
                                                    </div>
                                                </div>
                                                <div className="h-96">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={pieChartData.leave}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, value }) => `${name}: ${value}`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {pieChartData.leave.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `${value} days`} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Projects Chart */}
                                        <div className="bg-white rounded-3xl shadow-md border border-purple-200 overflow-hidden hover:shadow-lg transition-shadow">
                                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-200">
                                                <h3 className="text-lg font-black text-black flex items-center gap-3">
                                                    <div className="p-2 bg-purple-100 rounded-xl">
                                                        <CheckSquare className="w-6 h-6 text-purple-600" />
                                                    </div>
                                                    Project Status
                                                </h3>
                                            </div>
                                            <div className="p-6 space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200 text-center">
                                                        <p className="text-2xl font-black text-purple-600">{pieChartData.projects[0]?.value || 0}</p>
                                                        <p className="text-xs font-bold text-purple-00 uppercase tracking-widest mt-2 break-words">Completed</p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200 text-center">
                                                        <p className="text-2xl font-black text-orange-600">{pieChartData.projects[1]?.value || 0}</p>
                                                        <p className="text-xs font-bold text-orange-700 uppercase tracking-widest mt-2 break-words">Pending</p>
                                                    </div>
                                                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200 text-center">
                                                        <p className="text-2xl font-black text-green-600">{Math.round(((pieChartData.projects[0]?.value || 0) / ((pieChartData.projects[0]?.value || 0) + (pieChartData.projects[1]?.value || 1))) * 100)}%</p>
                                                        <p className="text-xs font-bold text-green-700 uppercase tracking-widest mt-2 break-words">Rate</p>
                                                    </div>
                                                </div>
                                                <div className="h-96">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <PieChart>
                                                            <Pie
                                                                data={pieChartData.projects}
                                                                cx="50%"
                                                                cy="50%"
                                                                labelLine={false}
                                                                label={({ name, value }) => `${name}: ${value}`}
                                                                outerRadius={80}
                                                                fill="#8884d8"
                                                                dataKey="value"
                                                            >
                                                                {pieChartData.projects.map((entry, index) => (
                                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                                ))}
                                                            </Pie>
                                                            <Tooltip formatter={(value) => `${value} projects`} />
                                                            <Legend />
                                                        </PieChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Form Section */}
                                    <div className="col-span-1 flex flex-col h-full">
                                        {/* Performance Review Form - Top Section */}
                                        <div className="flex-shrink-0 mb-6">
                                            <h3 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                                <div className="p-3 bg-indigo-100 rounded-2xl">
                                                    <Edit3 className="w-6 h-6 text-indigo-600" />
                                                </div>
                                                Add Performance Review
                                            </h3>

                                            <form onSubmit={handlePerformanceReviewSubmit} className="space-y-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-md">
                                                <div>
                                                    <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Period Type</label>
                                                    <div className="flex gap-2 bg-slate-100 p-2 rounded-xl">
                                                        {(['monthly', 'quarterly', 'yearly'] as const).map((period) => (
                                                            <button
                                                                key={period}
                                                                type="button"
                                                                onClick={() => setPerformanceFormPeriod(period)}
                                                                className={`flex-1 px-3 py-2 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${performanceFormPeriod === period
                                                                        ? 'bg-indigo-600 text-white shadow-lg'
                                                                        : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
                                                                    }`}
                                                            >
                                                                {period === 'monthly' ? 'Monthly' : period === 'quarterly' ? 'Quarterly' : 'Yearly'}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Select Period</label>
                                                    <select
                                                        title="Select performance review period"
                                                        value={performanceFormFilter}
                                                        onChange={(e) => setPerformanceFormFilter(e.target.value)}
                                                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-semibold text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    >
                                                        {availableFormPeriods.map((p) => (
                                                            <option key={p.value} value={p.value}>
                                                                {p.label}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Rating</label>
                                                    <select
                                                        title="Select performance rating"
                                                        value={performanceFormData.rating}
                                                        onChange={(e) => setPerformanceFormData({ ...performanceFormData, rating: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                    >
                                                        <option value="">Select a rating</option>
                                                        <option value="one">One</option>
                                                        <option value="two">Two</option>
                                                        <option value="three">Three</option>
                                                        <option value="four">Four</option>
                                                        <option value="five">Five</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Feedback</label>
                                                    <textarea
                                                        value={performanceFormData.feedback}
                                                        onChange={(e) => setPerformanceFormData({ ...performanceFormData, feedback: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                                                        placeholder="Enter feedback..."
                                                        rows={2}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Strengths</label>
                                                    <textarea
                                                        value={performanceFormData.strengths}
                                                        onChange={(e) => setPerformanceFormData({ ...performanceFormData, strengths: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                                                        placeholder="List strengths..."
                                                        rows={2}
                                                    />
                                                </div>

                                                <div>
                                                    <label className="text-xs font-black text-black uppercase tracking-widest mb-3 block">Areas for Improvement</label>
                                                    <textarea
                                                        value={performanceFormData.improvements}
                                                        onChange={(e) => setPerformanceFormData({ ...performanceFormData, improvements: e.target.value })}
                                                        className="w-full px-4 py-3 bg-white border-2 border-slate-300 rounded-xl font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all"
                                                        placeholder="List improvements..."
                                                        rows={2}
                                                    />
                                                </div>

                                                <button
                                                    type="submit"
                                                    className="w-full py-4 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-black text-xs uppercase tracking-widest rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-200"
                                                >
                                                    <Send className="w-4 h-4 inline mr-2" />
                                                    Submit Review
                                                </button>
                                            </form>
                                        </div>

                                        {/* Review History Section - Bottom Section with Scroll */}
                                        <div className="flex-1 flex flex-col min-h-0 border-t border-slate-200 pt-6 overflow-hidden">
                                            <h3 className="text-2xl font-black text-black mb-4 flex items-center gap-3 flex-shrink-0">
                                                <div className="p-3 bg-purple-100 rounded-2xl">
                                                    <History className="w-6 h-6 text-purple-600" />
                                                </div>
                                                Review History
                                            </h3>
                                            {reviewHistory.length > 0 && (
                                                <div className="space-y-4 overflow-y-auto custom-scrollbar">
                                                    {/* Summary Stats */}
                                                    <div className="grid grid-cols-2 gap-3 bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-xl border border-purple-100 flex-shrink-0">
                                                        <div className="text-center">
                                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Total Reviews</p>
                                                            <p className="text-2xl font-black text-purple-600 mt-1">{reviewHistory.length}</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Rating</p>
                                                            <p className="text-2xl font-black text-blue-600 mt-1">{(reviewHistory.reduce((acc, r) => acc + r.rating, 0) / reviewHistory.length).toFixed(1)}</p>
                                                        </div>
                                                    </div>

                                                    {/* Search Input */}
                                                    <div className="relative flex-shrink-0">
                                                        <input
                                                            type="text"
                                                            placeholder="Search reviews..."
                                                            value={searchReview}
                                                            onChange={(e) => setSearchReview(e.target.value)}
                                                            className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg font-medium text-sm text-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                                        />
                                                    </div>

                                                    {/* Period Filter Buttons */}
                                                    <div className="space-y-2 flex-shrink-0">
                                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Filter by Period</p>
                                                        <div className="flex gap-2 flex-wrap">
                                                            <button
                                                                onClick={() => setReviewHistoryPeriodFilter('all')}
                                                                className={`px-2 py-1 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${reviewHistoryPeriodFilter === 'all'
                                                                        ? 'bg-indigo-600 text-white shadow-lg'
                                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                    }`}
                                                            >
                                                                All
                                                            </button>
                                                            <button
                                                                onClick={() => setReviewHistoryPeriodFilter('monthly')}
                                                                className={`px-2 py-1 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${reviewHistoryPeriodFilter === 'monthly'
                                                                        ? 'bg-blue-600 text-white shadow-lg'
                                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                    }`}
                                                            >
                                                                Monthly
                                                            </button>
                                                            <button
                                                                onClick={() => setReviewHistoryPeriodFilter('quarterly')}
                                                                className={`px-2 py-1 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${reviewHistoryPeriodFilter === 'quarterly'
                                                                        ? 'bg-purple-600 text-white shadow-lg'
                                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                    }`}
                                                            >
                                                                Quarterly
                                                            </button>
                                                            <button
                                                                onClick={() => setReviewHistoryPeriodFilter('yearly')}
                                                                className={`px-2 py-1 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${reviewHistoryPeriodFilter === 'yearly'
                                                                        ? 'bg-green-600 text-white shadow-lg'
                                                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                                                    }`}
                                                            >
                                                                Yearly
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Reviews List */}
                                                    <div className="space-y-2">
                                                        {reviewHistory
                                                            .filter((review) => {
                                                                const matchesSearch = review.periodLabel.toLowerCase().includes(searchReview.toLowerCase()) ||
                                                                    review.feedback.toLowerCase().includes(searchReview.toLowerCase());
                                                                const matchesPeriod = reviewHistoryPeriodFilter === 'all' || review.period === reviewHistoryPeriodFilter;
                                                                return matchesSearch && matchesPeriod;
                                                            })
                                                            .sort((a, b) => new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime())
                                                            .map((review) => (
                                                                <div
                                                                    key={review.id}
                                                                    onClick={() => { setSelectedReview(review); setShowReviewModal(true); }}
                                                                    className="p-3 bg-white rounded-lg border border-slate-200 hover:border-indigo-300 cursor-pointer transition-all hover:shadow-md group text-sm"
                                                                >
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className="font-black text-black text-xs">{review.periodLabel}</span>
                                                                        <span className="font-black text-yellow-500 text-xs px-1.5 py-0.5 bg-yellow-50 rounded">{review.rating}</span>
                                                                    </div>
                                                                    <p className="text-xs text-slate-600 line-clamp-2">{review.feedback}</p>
                                                                </div>
                                                            ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Modal>
            )}

            {/* Review Details Modal */}
            {showReviewModal && selectedReview && (
                <Modal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    title="Review Details"
                    onSave={() => setShowReviewModal(false)}
                    isLoading={false}
                    maxWidth="max-w-2xl"
                    showFooter={false}
                >
                    <div className="space-y-6">
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-white border border-yellow-100">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-black text-gray-900">{selectedReview.periodLabel}</h4>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={18}
                                            className={i < Math.floor(selectedReview.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">{selectedReview.feedback}</p>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="font-bold text-gray-700 mb-2">Strengths</p>
                                    <p className="text-gray-600">{selectedReview.strengths}</p>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-700 mb-2">Areas of Improvement</p>
                                    <p className="text-gray-600">{selectedReview.improvements}</p>
                                </div>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-500 space-y-1">
                            <p><strong>Submitted By:</strong> {selectedReview.submittedBy}</p>
                            <p><strong>Date:</strong> {selectedReview.submittedDate}</p>
                        </div>
                    </div>
                </Modal>
            )}


            {confirmDemoteId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" onClick={() => setConfirmDemoteId(null)} />
                    <div className="relative bg-white border border-blue-100 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-100">
                            <TrendingDown size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Revoke Admin Tiers?</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            You are about to demote this administrator to a standard Employee tier. They will lose all system-wide management privileges instantly and be moved to the Employee Hub.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDemoteId(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:text-white transition-all active:scale-95">Cancel</button>
                            <button
                                onClick={() => { demoteToEmployee(confirmDemoteId); setConfirmDemoteId(null); }}
                                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95"
                            >
                                Confirm Demote
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Terminate Modal */}
            {confirmTerminateId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" onClick={() => setConfirmTerminateId(null)} />
                    <div className="relative bg-white border border-rose-100 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Deactivate Administrator?</h3>
                        <p className="text-gray-500 text-sm leading-relaxed mb-8">
                            This action will permanently terminate this administrator's system access. Their account status will be set to 'Terminated' (Inactive). This action is irreversible.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmTerminateId(null)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-bold hover:text-white transition-all active:scale-95">Cancel</button>
                            <button
                                onClick={() => { handleDirectTerminateAdmin(confirmTerminateId); }}
                                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
                            >
                                Confirm Deactivation
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Management Modal (Edit/Add) */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={isNew ? "Provision Administrative Access" : `Privilege Control: ${formState.firstName} ${formState.lastName}`}
                onSave={handleSave}
                isLoading={isLoading}
                maxWidth="max-w-3xl"
            >
                <div className="space-y-10 pb-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-gray-100 to-white rounded-[2rem] border border-gray-200 relative shadow-2xl">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl border-2 border-gray-200 flex items-center justify-center bg-white shadow-2xl overflow-hidden">
                                {imagePreview ? (
                                    <img
                                        src={formatBase64Image(imagePreview)}
                                        className="w-full h-full object-cover"
                                        alt="Admin Avatar"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                        }}
                                    />
                                ) : (
                                    <UserPlus size={40} className="text-gray-300" />
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                className="absolute -bottom-2 -right-2 p-2 bg-blue-600 text-white rounded-lg shadow-lg border-2 border-white hover:bg-blue-700 transition-all"
                                title="Change profile image"
                            >
                                <Camera size={16} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                title="Upload profile image"
                                onChange={handleImageSelect}
                                className="hidden"
                            />
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-2xl font-black text-gray-900 tracking-tight mb-1">{formState.firstName || 'New'} {formState.lastName || 'Identity'}</h4>
                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                                <ShieldCheck size={12} className="text-blue-600" /> Access Level: {formState.role}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                                <Badge color="blue">ADMINISTRATIVE PROTOCOL</Badge>
                                <Badge color="slate">{formState.userType}</Badge>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="md:col-span-2">
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-px bg-emerald-500/30"></span>
                                Identity Context
                            </h5>
                        </div>
                        <FormInput label="First Name" value={formState.firstName} onChange={(val) => updateField('firstName', val)} placeholder="e.g. Tarak" />
                        <FormInput label="Last Name" value={formState.lastName} onChange={(val) => updateField('lastName', val)} placeholder="e.g. RATNA" />
                        <FormInput label="Username" value={formState.username} onChange={(val) => updateField('username', val)} placeholder="e.g. TARAK" />
                        <FormInput label="Email Address" value={formState.email} onChange={(val) => updateField('email', val)} placeholder="tarakjr@example.com" />

                        <div className="md:col-span-2 mt-4">
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-px bg-emerald-500/30"></span>
                                Professional Details
                            </h5>
                        </div>
                        <FormInput label="Employee ID" value={formState.employeeId} onChange={(val) => updateField('employeeId', val)} placeholder="202501" />
                        <FormInput label="Designation" value={formState.designation} onChange={(val) => updateField('designation', val)} placeholder="SOFTWARE ENGINEER" />
                        <FormSelect label="Department" value={formState.department} onChange={(val) => updateField('department', val)} options={DEPARTMENTS} />
                        <FormSelect label="Employment Type" value={formState.userType} onChange={(val) => updateField('userType', val)} options={EMPLOYMENT_TYPES} />

                        <div className="md:col-span-2 mt-4">
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-px bg-emerald-500/30"></span>
                                Contact Information
                            </h5>
                        </div>
                        <FormInput label="Phone Number" value={formState.phoneNumber} onChange={(val) => updateField('phoneNumber', val)} placeholder="9876543210" />
                        <FormInput label="Address" value={formState.address} onChange={(val) => updateField('address', val)} placeholder="guntur" />

                        <div className="md:col-span-2 mt-4">
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-px bg-emerald-500/30"></span>
                                Dates & Credentials
                            </h5>
                        </div>
                        <FormInput label="Date of Birth" type="date" value={formState.dateOfBirth} onChange={(val) => updateField('dateOfBirth', val)} />
                        <FormInput label="Date of Joining" type="date" value={formState.dateOfJoining} onChange={(val) => updateField('dateOfJoining', val)} />
                        <FormInput label="Password" type="password" value={formState.password} onChange={(val) => updateField('password', val)} placeholder="••••••••••••" />
                    </div>

                    {isNew && (
                        <div className="md:col-span-2 mt-4">
                            <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-px bg-blue-200"></span>
                                Profile Photo (Optional)
                            </h5>
                            <div
                                className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <Camera size={32} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 font-medium">
                                    {selectedFile ? selectedFile.name : 'Click to upload profile photo'}
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    title="Upload profile photo"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setSelectedImage(file);
                                            setSelectedFile(file);
                                            // Create preview
                                            const reader = new FileReader();
                                            reader.onloadend = () => {
                                                setImagePreview(reader.result as string);
                                            };
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    )}

                    {saveError && (
                        <div className="md:col-span-2 p-4 bg-red-50 border border-red-200 rounded-xl">
                            <p className="text-sm text-red-700 font-medium">⚠️ {saveError}</p>
                        </div>
                    )}

                    {isSaving && (
                        <div className="md:col-span-2 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                            <p className="text-sm text-blue-700 font-medium">⏳ Registering admin...</p>
                        </div>
                    )}

                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 items-start">
                        <ShieldAlert size={24} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.1em] mb-1">Administrative Protocols</h5>
                            <p className="text-gray-500 text-[10px] leading-relaxed font-semibold">
                                Provisioning or modifying administrative access requires multi-factor authorization. Security authorization for this module is fixed to "ADMIN" by system policy.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};