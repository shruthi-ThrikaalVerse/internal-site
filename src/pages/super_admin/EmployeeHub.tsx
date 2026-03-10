
import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users, Filter, MoreVertical,
  Mail, Phone, MapPin, Calendar,
  Shield, Clock, Smartphone, Hash, Lock,
  CircleOff, RotateCcw, ShieldAlert, Camera, Upload,
  Trash2, TrendingUp, UserCircle, X, CheckCircle2, ChevronRight,
  FileWarning
} from 'lucide-react';
import { toast } from 'react-toastify';
import { User } from '../../types.tsx';
import { Badge, SectionHeader } from './UI.tsx';
import { Modal } from '../../components/super_admin/Modal.tsx';
import { FormInput, FormSelect, FormTextArea } from '../../components/super_admin/FormFields.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { apiClient } from '../../utils/apiClient.js';
import * as usersApi from '../../api/users.ts';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'People', 'Infrastructure', 'Quality', 'Data'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship'];
const ADMIN_TIERS = ['ADMIN', 'PROJECT_MANAGER', 'HR', 'OPERATIONAL_MANAGER', 'SECURITY_ADMIN'];

export const EmployeeHub = () => {
  const { globalSearch, employees, setEmployees, updateEmployee, removeEmployee, promoteToAdmin, currentUser, requestEmployeeTermination } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get token from localStorage
  const token = localStorage.getItem('token');
  const [localEmployees, setLocalEmployees] = useState<User[]>([]);

  // Filter States
  const [selectedDept, setSelectedDept] = useState('All Departments');
  const [selectedStatus, setSelectedStatus] = useState('All Statuses');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedType, setSelectedType] = useState('All Types');
  const [locationQuery, setLocationQuery] = useState('');

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formState, setFormState] = useState<any>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Profile Detail State
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Confirmation Modals State
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmPromoteId, setConfirmPromoteId] = useState<string | null>(null);
  const [confirmRequestId, setConfirmRequestId] = useState<string | null>(null);
  const [terminationReason, setTerminationReason] = useState('');
  const [selectedAdminRole, setSelectedAdminRole] = useState<string>('ADMIN');
  const [isPromotingLoading, setIsPromotingLoading] = useState(false);

  // Helper function to format base64 image data
  const formatBase64Image = (imageData: string | null | undefined): string => {
    if (!imageData) return '';

    // If it's already a proper data URL, return as is
    if (imageData.startsWith('data:image')) {
      return imageData;
    }

    // If it's a URL (http/https), return as is
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return imageData;
    }

    // If it's a file path starting with /, return it (could be relative path)
    if (imageData.startsWith('/')) {
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
          // Try to fetch image from backend using this path
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
  const transformEmployeeData = (apiData: any): User => {
    // Format the profile image with proper base64 prefix
    const formattedAvatar = formatBase64Image(apiData.profileImage || apiData.avatar);

    // Use employeeId as the primary unique identifier
    const uniqueId = apiData.employeeId || apiData.id || apiData.userId;

    return {
      id: uniqueId,
      name: apiData.name || `${apiData.firstName || ''} ${apiData.lastName || ''}`.trim(),
      firstName: apiData.firstName || '',
      lastName: apiData.lastName || '',
      email: apiData.email || '',
      role: apiData.role || 'EMPLOYEE',
      status: apiData.status || 'active',
      avatar: formattedAvatar,
      employeeId: apiData.employeeId || apiData.id,
      username: apiData.username || apiData.firstName?.toUpperCase() || '',
      designation: apiData.designation || '',
      department: apiData.department || 'Engineering',
      phoneNumber: apiData.phoneNumber || '',
      phone: apiData.phoneNumber || apiData.phone || '',
      address: apiData.address || '',
      dateOfJoining: apiData.dateOfJoining || apiData.joiningDate || new Date().toISOString().split('T')[0],
      dateOfBirth: apiData.dateOfBirth || '',
      employmentType: apiData.userType || apiData.employmentType || 'Full-time',
      location: apiData.location || '',
      // Additional fields from API
      createdByEmployeeId: apiData.createdByEmployeeId || '',
      createdByRole: apiData.createdByRole || '',
      createdByName: apiData.createdByName || '',
      hrEmployeeId: apiData.hrEmployeeId || '',
      profileImage: apiData.profileImage || '',
    } as any;
  };

  // Fetch employees from API (excluding admin tiers) - removed, handled by second useEffect below

  const statuses = ['All Statuses', 'active', 'inactive', 'pending'];
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Load employees from backend
  React.useEffect(() => {
    const load = async () => {
      try {
        console.log('Loading employees from API...');
        const data = await usersApi.getEmployees();
        console.log('Raw employees API response:', data);

        if (Array.isArray(data)) {
          const mapped: User[] = data
            .map((u: any) => {
              let rawRole: any = u.role;
              if (rawRole && typeof rawRole === 'object') rawRole = rawRole.name;
              const roleValue = String(rawRole || u.userType || 'Employee');
              const statusValue = String(u.status || 'active') as 'active' | 'inactive' | 'probation' | 'resigned';
              const avatarData = String(u.profileImage || u.avatar || '');
              console.log(`Employee: ${u.firstName} ${u.lastName} - Avatar data present: ${!!avatarData}, Length: ${avatarData.length}`);
              return {
                id: String(u.employeeId || u.id || ''),
                email: String(u.email || u.username || ''),
                firstName: String(u.firstName || ''),
                lastName: String(u.lastName || ''),
                name: `${String(u.firstName || '')} ${String(u.lastName || '')}`.trim(),
                department: String(u.department || ''),
                designation: String(u.designation || ''),
                role: roleValue as any,
                status: statusValue,
                dateOfJoining: String(u.dateOfJoining || ''),
                phone: String(u.phoneNumber || ''),
                address: String(u.address || ''),
                avatar: formatBase64Image(avatarData),
                employmentType: String(u.employmentType || 'Full-time'),
                location: String(u.location || ''),
                joiningDate: String(u.dateOfJoining || ''),
                employeeId: String(u.employeeId || u.id || ''),
                profileImage: String(u.profileImage || ''),
              };
            })
            .filter(emp => {
              const r = emp.role.toString().toUpperCase();
              return r === 'EMPLOYEE';
            });

          setLocalEmployees(mapped);
          setEmployees(mapped);
          console.log('Employees loaded and filtered successfully:', mapped);
        }
      } catch (err) {
        console.error('Failed to fetch employees:', err);
        // Show error to user - you can add a toast notification here
      }
    };
    load();
  }, [setEmployees]);
  const isAdminTier = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN';

  const handleResetFilters = () => {
    setSelectedDept('All Departments');
    setSelectedStatus('All Statuses');
    setSelectedType('All Types');
    setLocationQuery('');
  };

  const filteredEmployees = useMemo(() => {
    return localEmployees.filter(e => {
      const matchesSearch = !globalSearch ||
        e.name.toLowerCase().includes(globalSearch.toLowerCase()) ||
        (e.designation?.toLowerCase() || '').includes(globalSearch.toLowerCase()) ||
        e.email.toLowerCase().includes(globalSearch.toLowerCase());

      const matchesDept = selectedDept === 'All Departments' || e.department === selectedDept;
      const matchesStatus = selectedStatus === 'All Statuses' || e.status === selectedStatus;
      const matchesType = selectedType === 'All Types' || e.employmentType === selectedType;
      const matchesLocation = !locationQuery || (e.location?.toLowerCase() || '').includes(locationQuery.toLowerCase());

      return matchesSearch && matchesDept && matchesStatus && matchesType && matchesLocation;
    });
  }, [globalSearch, localEmployees, selectedDept, selectedStatus, selectedType, locationQuery]);

  const [isLoadingSave, setIsLoadingSave] = useState(false);

  const handleEdit = (employee: User) => {
    const nameParts = employee.name.split(' ');
    setEditingId(employee.id);
    setFormState({
      firstName: employee.firstName || nameParts[0] || '',
      lastName: employee.lastName || nameParts.slice(1).join(' ') || '',
      employeeId: employee.employeeId || employee.id || '',
      username: employee.username || '',
      email: employee.email || '',
      phone: employee.phone || employee.phoneNumber || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth || '',
      dateOfJoining: employee.dateOfJoining || '',
      designation: employee.designation || '',
      department: employee.department || '',
      location: employee.location || '',
      employmentType: employee.employmentType || '',
      role: employee.role || '',
      password: employee.password || '',
      avatar: employee.avatar || ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formState || !editingId) return;

    setIsLoadingSave(true);
    try {
      const employeeData = localEmployees.find(e => e.id === editingId);
      const employeeId = employeeData?.employeeId || editingId;

      // Validate required fields
      if (!formState.firstName?.trim() || !formState.lastName?.trim()) {
        alert('Please fill in all required fields: First Name, Last Name');
        setIsLoadingSave(false);
        return;
      }

      console.log('=== EMPLOYEE UPDATE REQUEST ===');
      console.log('Employee ID:', employeeId);
      console.log('Form State:', formState);

      // Prepare the data object - ONLY fields in SuperAdminUpdateProfileDTO
      const updateData = {
        firstName: formState.firstName?.trim(),
        lastName: formState.lastName?.trim(),
        phoneNumber: formState.phone?.trim() || undefined,
        address: formState.address?.trim() || undefined,
        department: formState.department?.trim() || undefined,
        userType: formState.employmentType?.trim() || undefined, // Map employmentType to userType
        designation: formState.designation?.trim() || undefined,
        employeeId: employeeId, // Include employeeId in body
      };

      // Remove undefined values
      Object.keys(updateData).forEach(key =>
        updateData[key as keyof typeof updateData] === undefined && delete updateData[key as keyof typeof updateData]
      );

      console.log('Data to send (matching SuperAdminUpdateProfileDTO):', updateData);

      // Create FormData for multipart upload (required for profileImage)
      const formData = new FormData();

      // Append all fields
      Object.entries(updateData).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, String(value));
          console.log(`  Field - ${key}: ${value}`);
        }
      });

      // Add image if new (profileImage is expected by backend)
      if (formState.avatar && formState.avatar.startsWith('data:image')) {
        try {
          console.log('Converting base64 image to file...');
          const response = await fetch(formState.avatar);
          const blob = await response.blob();
          formData.append('profileImage', blob, `profile-${employeeId}.png`);
          console.log('Image added to FormData, size:', blob.size);
        } catch (imgErr) {
          console.warn('Could not add image:', imgErr);
        }
      }

      console.log('Sending update to:', `/api/users/super_admin/update/${employeeId}`);

      const updateResponse = await fetch(`http://localhost:8085/api/users/super_admin/update/${employeeId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
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
        setLocalEmployees(prev => prev.map(e =>
          e.id === editingId
            ? {
              ...e,
              firstName: formState.firstName,
              lastName: formState.lastName,
              name: `${formState.firstName} ${formState.lastName}`.trim(),
              phoneNumber: formState.phone,
              phone: formState.phone,
              address: formState.address,
              designation: formState.designation,
              department: formState.department,
              employmentType: formState.employmentType,
              avatar: formatBase64Image(formState.avatar), // Ensure avatar is properly formatted
            }
            : e
        ));

        setIsModalOpen(false);
        setEditingId(null);
        setFormState(null);
        alert('Employee details updated successfully!');
      } else {
        console.error('Update failed with status:', updateResponse.status);
        try {
          const error = JSON.parse(responseText);
          console.error('Error details:', error);
          alert(`Error: ${error.message || 'Failed to update employee'}`);
        } catch (e) {
          console.error('Response:', responseText);
          alert(`Failed to update employee: ${updateResponse.status}`);
        }
      }
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Error: ' + (error as Error).message);
    } finally {
      setIsLoadingSave(false);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormState((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('avatar', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePromoteFromModal = (id: string) => {
    setViewingUser(null);
    setConfirmPromoteId(id);
    setSelectedAdminRole('ADMIN');
  };

  const handlePromoteToAdmin = async () => {
    if (!confirmPromoteId) return;

    setIsPromotingLoading(true);
    try {
      const employeeData = localEmployees.find(e => e.id === confirmPromoteId);
      const employeeId = employeeData?.employeeId || confirmPromoteId;

      console.log('Promoting employee:', {
        employeeId,
        selectedRole: selectedAdminRole,
        fullData: employeeData,
      });

      // Try with query parameter first
      let response = await fetch(`http://localhost:8085/api/users/super_admin/promote/${employeeId}?roleName=${selectedAdminRole}`, {
        method: 'POST',
        credentials: 'include', // Send HttpOnly cookie
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roleName: selectedAdminRole,
        }),
      });

      // Log full response for debugging
      const responseText = await response.text();
      console.log('Promotion response status:', response.status);
      console.log('Promotion response body:', responseText);

      if (response.ok || response.status === 200) {
        try {
          const result = JSON.parse(responseText);
          console.log('Employee promoted successfully:', result);
        } catch (e) {
          console.log('Response is not JSON');
        }

        // Update local state - remove from employees, refresh the list
        setLocalEmployees(prev => prev.filter(e => e.id !== confirmPromoteId));
        setConfirmPromoteId(null);
        setSelectedAdminRole('ADMIN');

        // Show success message
        alert(`Employee (ID: ${employeeId}) promoted to ${selectedAdminRole} tier successfully!`);
      } else {
        try {
          const error = JSON.parse(responseText);
          console.error('Promotion failed:', error);
          alert(error.message || `Failed to promote employee: ${response.status}`);
        } catch (e) {
          console.error('Promotion failed with response:', responseText);
          alert(`Failed to promote employee. Server returned: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error promoting employee:', error);
      alert('An error occurred while promoting the employee: ' + (error as Error).message);
    } finally {
      setIsPromotingLoading(false);
    }
  };

  const handleInitiateTermination = (id: string) => {
    if (isSuperAdmin) {
      setConfirmDeleteId(id);
    } else {
      setConfirmRequestId(id);
      setTerminationReason('');
    }
  };

  const submitTerminationRequest = () => {
    if (confirmRequestId && terminationReason.trim()) {
      requestEmployeeTermination(confirmRequestId, terminationReason);
      setConfirmRequestId(null);
      setTerminationReason('');
    }
  };

  const handleDirectTermination = async (employeeId: string) => {
    try {
      const employeeData = localEmployees.find(e => e.id === employeeId);
      const empId = employeeData?.employeeId || employeeId;

      console.log('Terminating employee:', {
        employeeId: empId,
        fullEmployeeData: employeeData,
      });

      const response = await fetch(`http://localhost:8085/api/users/admin/terminate/${empId}`, {
        method: 'PUT',
        credentials: 'include', // Send HttpOnly cookie
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log('Terminate response status:', response.status);
      const responseText = await response.text();
      console.log('Terminate response body:', responseText);

      if (response.ok || response.status === 200) {
        try {
          const result = JSON.parse(responseText);
          console.log('Employee terminated successfully:', result);
        } catch (e) {
          console.log('Response is not JSON');
        }

        // Remove from local state
        setLocalEmployees(prev => prev.filter(e => e.id !== employeeId));
        setConfirmDeleteId(null);
        alert(`Employee (ID: ${empId}) has been terminated successfully.`);
      } else {
        try {
          const error = JSON.parse(responseText);
          console.error('Termination failed:', error);
          alert(error.message || `Failed to terminate employee: ${response.status}`);
        } catch (e) {
          console.error('Termination failed with response:', responseText);
          alert(`Failed to terminate employee. Server returned: ${response.status}`);
        }
      }
    } catch (error) {
      console.error('Error terminating employee:', error);
      alert('An error occurred while terminating the employee: ' + (error as Error).message);
    }
  };

  const activeFilterCount = [
    selectedDept !== 'All Departments',
    selectedStatus !== 'All Statuses',
    selectedType !== 'All Types',
    locationQuery !== ''
  ].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Employee Hub"
        description="Comprehensive workforce directory. Record creation is restricted to System HR."
        actions={null}
      />

      {/* Filter Bar */}
      <div className="bg-white/50 p-4 rounded-2xl border border-gray-200 backdrop-blur-sm mb-6 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-full md:w-auto flex-1 flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <FormSelect
                label="Department"
                value={selectedDept}
                onChange={setSelectedDept}
                options={['All Departments', ...DEPARTMENTS]}
              />
            </div>
            <div className="flex-1">
              <FormSelect
                label="Status"
                value={selectedStatus}
                onChange={setSelectedStatus}
                options={statuses}
              />
            </div>
          </div>
          <div className="w-full md:w-auto pt-2 flex gap-2">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={`flex-1 md:w-auto h-[44px] px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border ${showAdvanced ? 'bg-blue-600 text-white border-transparent' : 'bg-gray-100 text-gray-500 hover:text-blue-600 border-transparent hover:border-blue-300'}`}
            >
              <Filter size={16} />
              Advanced {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
            {activeFilterCount > 0 && (
              <button
                onClick={handleResetFilters}
                className="h-[44px] px-4 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all border border-rose-500/20"
                title="Reset all filters"
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 mt-2 bg-gray-50 rounded-xl border border-gray-200 animate-in slide-in-from-top-4 duration-300">
            <div>
              <FormSelect
                label="Employment Type"
                value={selectedType}
                onChange={setSelectedType}
                options={['All Types', ...EMPLOYMENT_TYPES]}
              />
            </div>
            <div>
              <FormInput
                label="Work Location"
                value={locationQuery}
                onChange={setLocationQuery}
                placeholder="Search city/remote..."
              />
            </div>
          </div>
        )}
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl shadow-black/10">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-gray-50 backdrop-blur-md border-b border-gray-200">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Profile Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Role & Unit</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">System Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Contact Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Deployment</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.map((e) => (
                <tr key={e.id} className="hover:bg-gray-100 transition-all group border-l-2 border-transparent hover:border-blue-200">
                  <td className="px-8 py-5 cursor-pointer" onClick={() => setViewingUser(e)}>
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        {e.avatar ? (
                          <>
                            <img
                              src={formatBase64Image(e.avatar)}
                              alt={e.name}
                              className="w-14 h-14 rounded-2xl border border-gray-200 shadow-xl group-hover:scale-105 transition-transform object-cover"
                              onError={(evt) => {
                                console.error('Image failed to load:', formatBase64Image(e.avatar));
                                const target = evt.target as HTMLImageElement;
                                target.style.display = 'none';
                                // Show fallback circle
                                const parent = target.parentElement;
                                if (parent && !parent.querySelector('.fallback-avatar')) {
                                  const fallback = document.createElement('div');
                                  fallback.className = 'fallback-avatar w-14 h-14 rounded-2xl border border-gray-200 shadow-xl bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center';
                                  fallback.style.position = 'absolute';
                                  fallback.style.top = '0';
                                  fallback.style.left = '0';
                                  fallback.innerHTML = `<span class="text-white font-bold text-xs">${e.name.charAt(0).toUpperCase()}</span>`;
                                  parent.appendChild(fallback);
                                }
                              }}
                              onLoadStart={() => {
                                console.log('Loading image for:', e.name, 'src:', formatBase64Image(e.avatar));
                              }}
                            />
                            <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-white ${e.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></span>
                          </>
                        ) : (
                          <div className="w-14 h-14 rounded-2xl border border-gray-200 shadow-xl bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{e.name.charAt(0).toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate text-base">{e.name}</div>
                        <div className="text-[10px] text-gray-900 font-bold tracking-tight opacity-70 truncate">{e.designation || e.role}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-gray-900 font-mono bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100 tracking-tighter uppercase">ID: {e.employeeId || e.id.padStart(4, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <Badge color="blue">{e.department?.toUpperCase()}</Badge>
                      {e.employmentType && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold bg-gray-100 w-fit px-2 py-1 rounded-lg">
                          <Clock size={12} className="text-blue-600" /> {e.employmentType}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Badge color={e.status === 'active' ? 'green' : 'red'}>
                      {e.status ? e.status.toUpperCase() : ''}
                    </Badge>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-900 hover:text-blue-600 transition-colors cursor-default">
                        <Mail size={14} className="shrink-0 text-blue-600" /> <span className="truncate max-w-[160px] text-gray-900 group-hover:text-blue-600">{e.email || 'N/A'}</span>
                      </div>
                      {e.phone && (
                        <div className="flex items-center gap-2 text-[10px] text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded-lg w-fit">
                          <Smartphone size={12} className="shrink-0 text-blue-600" /> {e.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      {e.location && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-900 font-semibold">
                          <MapPin size={14} className="text-blue-600" /> {e.location}
                        </div>
                      )}
                      {e.dateOfJoining && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-900 font-bold">
                          <Calendar size={12} className="text-blue-600" /> Since {e.dateOfJoining}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isSuperAdmin && (
                        <button
                          onClick={() => setConfirmPromoteId(e.id)}
                          title="Elevate Record to Admin"
                          className="p-3 bg-blue-50 hover:bg-blue-600 text-blue-600 hover:text-white rounded-xl transition-all active:scale-90 focus:ring-4 focus:ring-blue-500/50"
                        >
                          <TrendingUp size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(e)}
                        title="Modify Registry"
                        className="p-3 bg-gray-200 hover:bg-gray-300 text-gray-500 hover:text-gray-900 rounded-xl transition-all active:scale-90"
                      >
                        <Shield size={18} />
                      </button>
                      {isAdminTier && (
                        <button
                          onClick={() => handleInitiateTermination(e.id)}
                          title={isSuperAdmin ? "Directly Revoke Access" : "Request Termination Requisition"}
                          className="p-3 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all active:scale-90"
                        >
                          {isSuperAdmin ? <Trash2 size={18} /> : <FileWarning size={18} />}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Profile Detail View Modal (Dossier) */}
      {viewingUser && (
        <Modal
          isOpen={!!viewingUser}
          onClose={() => setViewingUser(null)}
          title="Identity Dossier"
          onSave={() => setViewingUser(null)}
        >
          <div className="space-y-8">
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-gray-100 to-white border border-blue-100 overflow-hidden shadow-2xl">
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
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.className = 'w-32 h-32 rounded-[2.5rem] border-4 border-gray-200 shadow-2xl bg-gray-200 flex items-center justify-center absolute top-0 left-0';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-[2.5rem] border-4 border-gray-200 shadow-2xl bg-gray-200 flex items-center justify-center">
                      <UserCircle size={64} className="text-gray-400" />
                    </div>
                  )}
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-white ${viewingUser.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 shadow-lg'}`}>
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-gray-900 tracking-tight">{viewingUser.name}</h3>
                <p className="text-blue-600 font-bold uppercase tracking-widest text-sm mt-1 mb-4">{viewingUser.designation}</p>
                <div className="flex gap-2">
                  <Badge color="blue">{viewingUser.department}</Badge>
                  <Badge color="slate">{viewingUser.role}</Badge>
                </div>
              </div>
            </div>

            {/* Promote Action Box (Only for Super Admin) */}
            {isSuperAdmin && viewingUser.role !== 'SUPER_ADMIN' && (
              <div className="p-6 rounded-[1.5rem] bg-blue-50 border border-blue-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 tracking-tight">Administrative Elevation</h4>
                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">Promotion tier: Employee → Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePromoteFromModal(viewingUser.id)}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-200 active:scale-95 focus:ring-4 focus:ring-blue-500/50"
                >
                  Promote Record <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
              <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Smartphone size={14} className="text-blue-600" /> Communication Channels
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Work Email</span>
                    <span className="text-gray-900 font-semibold">{viewingUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Mobile</span>
                    <span className="text-gray-900 font-semibold">{viewingUser.phone || viewingUser.phoneNumber || ''}</span>
                  </div>
                  {(viewingUser.address) && (
                    <div className="pt-2 border-t border-gray-200">
                      <span className="text-gray-500 block mb-1">Address</span>
                      <span className="text-gray-900 font-medium text-[9px] leading-tight">{viewingUser.address}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" /> Deployment Context
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Registry UID</span>
                    <span className="text-blue-600 font-mono font-bold tracking-tighter">{viewingUser.employeeId || viewingUser.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Onboarding Date</span>
                    <span className="text-gray-900 font-semibold">{viewingUser.dateOfJoining}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-500">Tier Classification</span>
                    <span className="text-emerald-400 font-black tracking-tight">{viewingUser.status.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Shield size={14} className="text-blue-600" /> Audit & Origin
                </h4>
                <div className="space-y-3 text-xs">
                  {(viewingUser as any).createdByName && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Created By</span>
                      <span className="text-gray-900 font-semibold">{(viewingUser as any).createdByName}</span>
                    </div>
                  )}
                  {(viewingUser as any).createdByRole && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Creator Role</span>
                      <span className="text-blue-600 font-bold text-[9px]">{(viewingUser as any).createdByRole}</span>
                    </div>
                  )}
                  {(viewingUser as any).createdByEmployeeId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Creator ID</span>
                      <span className="text-gray-900 font-mono text-[9px]">{(viewingUser as any).createdByEmployeeId}</span>
                    </div>
                  )}
                  {(viewingUser as any).hrEmployeeId && (
                    <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                      <span className="text-gray-500">HR Officer</span>
                      <span className="text-gray-900 font-mono text-[9px]">{(viewingUser as any).hrEmployeeId}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Admin Request Modal */}
      {confirmRequestId && (
        <Modal
          isOpen={!!confirmRequestId}
          onClose={() => setConfirmRequestId(null)}
          title="Submit Termination Requisition"
          onSave={submitTerminationRequest}
        >
          <div className="space-y-6">
            <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex gap-3 items-center">
              <ShieldAlert size={18} className="text-amber-500 shrink-0" />
              <p className="text-xs text-gray-500 font-medium leading-tight">
                This request will be forwarded to the Super Admin for authorization.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Target Identity</label>
              <div className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 font-bold">
                {employees.find(e => e.id === confirmRequestId)?.name}
              </div>
            </div>
            <FormTextArea
              label="Justification for Termination"
              value={terminationReason}
              onChange={setTerminationReason}
              placeholder="Provide detailed technical or operational reasoning for this requisition..."
            />
          </div>
        </Modal>
      )}

      {/* Super Admin Direct Revoke Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-white border border-blue-300 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <ShieldAlert size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Direct Access Revocation</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              As Super Admin, you are directly terminating this specialist's system access. This action will deactivate the account instantly.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:text-white transition-all active:scale-95">Cancel</button>
              <button
                onClick={() => { handleDirectTermination(confirmDeleteId); }}
                className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 active:scale-95"
              >
                Confirm Revoke
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promote Modal */}
      {confirmPromoteId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" onClick={() => setConfirmPromoteId(null)} />
          <div className="relative bg-white border border-blue-300 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-blue-300">
              <TrendingUp size={40} />
            </div>
            <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Elevate Tier Status?</h3>
            <p className="text-gray-500 text-sm leading-relaxed mb-6">
              Select the administrative tier to promote this employee to. They will gain system-wide management privileges.
            </p>

            <div className="mb-6 space-y-3">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Select Admin Tier</label>
              <div className="grid grid-cols-1 gap-2">
                {ADMIN_TIERS.map((tier) => (
                  <button
                    key={tier}
                    onClick={() => setSelectedAdminRole(tier)}
                    className={`p-3 rounded-xl text-sm font-bold transition-all border-2 ${selectedAdminRole === tier
                      ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/30'
                      : 'bg-gray-50 text-gray-900 border-gray-200 hover:border-blue-300'
                      }`}
                  >
                    {tier}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-[10px] text-gray-500 font-semibold">
                <strong>Selected:</strong>{selectedAdminRole}
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setConfirmPromoteId(null)}
                className="flex-1 py-4 bg-gray-100 text-gray-900 rounded-2xl font-bold hover:bg-gray-200 transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handlePromoteToAdmin}
                disabled={isPromotingLoading}
                className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPromotingLoading ? 'Promoting...' : 'Confirm Promotion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal (Legacy) */}
      {formState && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Update Registry: ${formState.firstName} ${formState.lastName}`}
          onSave={handleSave}
          isLoading={isLoadingSave}
        >
          <div className="space-y-10 pb-4">
            <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-white rounded-[2rem] border border-gray-200 relative shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-blue-100 rounded-full -mr-24 -mt-24 blur-[80px]"></div>
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-28 h-28 rounded-[2rem] border-4 border-gray-200 flex items-center justify-center bg-white shadow-2xl overflow-hidden group-hover:border-blue-300 transition-all">
                  {formState.avatar ? (
                    <img
                      src={formatBase64Image(formState.avatar)}
                      className="w-full h-full object-cover"
                      alt="Profile"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          const icon = document.querySelector('svg');
                          if (!parent.querySelector('svg')) {
                            parent.innerHTML = '<svg size="48" class="text-gray-300">...</svg>';
                          }
                        }
                      }}
                    />
                  ) : (
                    <UserCircle size={48} className="text-gray-300" />
                  )}
                </div>
                <div className="absolute -bottom-2 -right-2 p-3 bg-blue-600 text-white rounded-2xl shadow-xl border-4 border-white">
                  <Camera size={16} />
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  className="hidden"
                  accept="image/*"
                  aria-label="Upload profile image"
                />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h4 className="text-2xl font-black text-gray-900 tracking-tight truncate max-w-[250px]">{formState.firstName} {formState.lastName}</h4>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 rounded-lg w-fit mx-auto sm:mx-0 mb-4 mt-2">{formState.designation}</p>
                <Badge color="blue">{formState.department?.toUpperCase()}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="md:col-span-2">
                <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-emerald-500/30"></span>
                  Identity Information
                </h5>
              </div>
              <FormInput label="First Name" value={formState.firstName} onChange={(val) => updateField('firstName', val)} />
              <FormInput label="Last Name" value={formState.lastName} onChange={(val) => updateField('lastName', val)} />
              <FormInput label="Username" value={formState.username} onChange={(val) => updateField('username', val)} />
              <FormInput label="Employee ID" value={formState.employeeId} onChange={(val) => updateField('employeeId', val)} />

              <div className="md:col-span-2 mt-4">
                <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-emerald-500/30"></span>
                  Professional Details
                </h5>
              </div>
              <FormInput label="Designation" value={formState.designation} onChange={(val) => updateField('designation', val)} />
              <FormSelect label="Department" value={formState.department} onChange={(val) => updateField('department', val)} options={DEPARTMENTS} />
              <FormSelect label="Employment Type" value={formState.employmentType} onChange={(val) => updateField('employmentType', val)} options={EMPLOYMENT_TYPES} />
              <FormInput label="Date of Joining" type="date" value={formState.dateOfJoining} onChange={(val) => updateField('dateOfJoining', val)} />

              <div className="md:col-span-2 mt-4">
                <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                  <span className="w-8 h-px bg-emerald-500/30"></span>
                  Contact Information
                </h5>
              </div>
              <FormInput label="Email" value={formState.email} onChange={(val) => updateField('email', val)} />
              <FormInput label="Phone Number" value={formState.phone} onChange={(val) => updateField('phone', val)} />
              <FormInput label="Address" value={formState.address} onChange={(val) => updateField('address', val)} placeholder="Full address" />
              <FormInput label="Date of Birth" type="date" value={formState.dateOfBirth} onChange={(val) => updateField('dateOfBirth', val)} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
