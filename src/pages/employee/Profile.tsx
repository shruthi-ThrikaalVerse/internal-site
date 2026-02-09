import React, { useState, useEffect, useRef } from 'react';
import {
  User, Mail, Phone, MapPin, Calendar, Briefcase,
  Building, Shield, Edit, Save, X, Loader2,
  CreditCard, Globe, ChevronRight, CheckCircle,
  Download, Key, Award, Trash2, ZoomIn, AlertTriangle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile: React.FC = () => {
  const [user, setUser] = useState<any>();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'security'>('personal');
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [showDeactivationModal, setShowDeactivationModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Change Password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    department: '',
    designation: '',
    employeeId: '',
    dateOfJoining: '',
    createdByName: '',
    role: '',
    profileImage: ''
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get('http://localhost:8085/api/users/me', {
          withCredentials: true // Send httpOnly cookie
        });
        const apiUser = response.data;
        // Optionally enrich user data for UI defaults
        const enrichedUser = {
          ...apiUser,
          firstName: apiUser.firstName || apiUser.name?.split(' ')[0] || 'Employee',
          lastName: apiUser.lastName || apiUser.name?.split(' ')[1] || '',
          phoneNumber: apiUser.phoneNumber || '+1 (555) 000-0000',
          address: apiUser.address || 'Corporate Headquarters, Silicon Valley',
          performanceRating: apiUser.performanceRating || '4.9/5.0',
          projectsCompleted: apiUser.projectsCompleted || 12,
          teamSize: apiUser.teamSize || 5,
          lastLogin: apiUser.lastLogin || (new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' Today'),
        };
        setUser(enrichedUser);
        setFormData(enrichedUser);
      } catch (error) {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Update user profile via API
      const response = await axios.put('http://localhost:8085/api/users/me', formData, {
        withCredentials: true
      });
      const updatedUser = response.data;
      setUser(updatedUser);
      setFormData(updatedUser);
      setIsEditing(false);
    } catch (error) {
      // Optionally show error
      alert('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestDeactivation = () => {
    // Here you would typically make an API call to request deactivation
    console.log('Account deactivation requested');

    // Simulate API call
    setTimeout(() => {
      alert('Account deactivation request has been submitted. An administrator will review your request.');
      setShowDeactivationModal(false);
    }, 1000);
  };

  // Change password handler
  const handleChangePassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await axios.post('http://localhost:8085/api/users/change-password', {
        currentPassword: currentPassword,
        newPassword: newPassword
      }, { withCredentials: true });

      toast.success(res.data?.message || 'Password updated successfully');
      setShowChangePasswordModal(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to change password';
      toast.error(msg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield }
  ];

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      <span className="ml-3 text-gray-600">Loading profile...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Image Preview Modal - Responsive */}
      {showImagePreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Profile Picture</h3>
              <button
                type="button"
                onClick={() => setShowImagePreview(false)}
                className="p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Close preview"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="flex flex-col items-center">
                {/* Responsive Image Preview */}
                <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 lg:w-80 lg:h-80 rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-lg sm:shadow-xl mb-6">
                  {user.profileImage ? (
                    <img
                      src={`data:image/jpeg;base64,${user.profileImage}`}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-100">
                      <User className="w-16 h-16 sm:w-20 sm:h-20 lg:w-32 lg:h-32 text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Information about static profile photo */}
                <div className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-center">
                  <p className="text-xs sm:text-sm text-blue-700 font-medium">
                    Profile photo is managed by HR/Administration
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Contact your HR department for photo updates
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deactivation Confirmation Modal - Responsive */}
      {showDeactivationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-4">
            <div className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                </div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">Request Account Deactivation</h3>
              </div>

              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Are you sure you want to request to deactivate your account? This action will need to be approved by an administrator and cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeactivationModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRequestDeactivation}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm sm:text-base"
                >
                  Yes, Request Deactivation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal - Responsive */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-xs sm:max-w-sm md:max-w-md mx-4 overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">Change Password</h3>
              <button type="button" onClick={() => setShowChangePasswordModal(false)} className="p-1 sm:p-2 hover:bg-gray-100 rounded" title="Close">
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
              </button>
            </div>

            <form onSubmit={handleChangePassword} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  title="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 mt-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  title="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 mt-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Re-enter New Password</label>
                <input
                  type="password"
                  title="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 sm:px-4 py-2 mt-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  {isChangingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  <span>Change Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header - Responsive */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage your personal and professional information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Profile Card - Responsive */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-6">
            {/* Profile Photo - Non-editable */}
            <div className="relative mb-4 sm:mb-6">
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-2 sm:border-4 border-white shadow-md sm:shadow-lg bg-gradient-to-br from-blue-100 to-indigo-100 group cursor-pointer">
                {user.profileImage ? (
                  <img
                    src={`data:image/jpeg;base64,${user.profileImage}`}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onClick={() => setShowImagePreview(true)}
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    onClick={() => setShowImagePreview(true)}
                  >
                    <User className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 text-blue-600" />
                  </div>
                )}
                {/* Overlay on hover */}
                <button
                  type="button"
                  className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 border-none bg-transparent p-0 m-0"
                  onClick={() => setShowImagePreview(true)}
                  title="Enlarge profile photo"
                  aria-label="Enlarge profile photo"
                >
                  <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </button>
              </div>

              {/* Remove photo button since profile photo is non-editable */}
              <div className="text-center mt-2 sm:mt-4">
                <p className="text-xs text-gray-500">
                  Profile photo managed by HR
                </p>
              </div>
            </div>

            {/* User Info */}
            <div className="text-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">{user.firstName} {user.lastName}</h2>
              <p className="text-sm sm:text-base text-gray-600">{user.designation || user.role || 'Staff Member'}</p>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">{user.department || 'Corporate'}</p>
            </div>

            {/* Tabs - Responsive */}
            <div className="space-y-1 sm:space-y-2">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    type="button"
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      // Disable editing when switching to non-personal tabs
                      if (tab.id !== 'personal' && isEditing) {
                        setIsEditing(false);
                      }
                    }}
                    className={`w-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2 sm:py-3 rounded-lg transition-colors ${activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">{tab.label}</span>
                    <ChevronRight className={`w-3 h-3 sm:w-4 sm:h-4 ml-auto ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  </button>
                );
              })}
            </div>

            {/* Action Buttons - Responsive */}
            <div className="mt-6 sm:mt-8 space-y-2 sm:space-y-3">
              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setIsEditing(!isEditing)}
              >
                {isEditing ? (
                  <>
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Cancel Edit</span>
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="font-medium text-sm sm:text-base">Edit Profile</span>
                  </>
                )}
              </button>

              <button
                type="button"
                className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="font-medium text-sm sm:text-base">Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Content - Responsive */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Tab Content Header - Responsive */}
            <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 capitalize">
                    {activeTab.replace('_', ' ')} Information
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {activeTab === 'personal' && 'Update your personal details'}
                    {activeTab === 'professional' && 'View and update your professional information'}
                    {activeTab === 'security' && 'Manage your security settings'}
                  </p>
                </div>
                {/* Only show Save Changes button when editing personal info */}
                {isEditing && activeTab === 'personal' && (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm sm:text-base"
                  >
                    {isSaving ? (
                      <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                    )}
                    <span className="font-medium">Save Changes</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab Content - Responsive */}
            <div className="p-4 sm:p-6">
              {activeTab === 'personal' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          placeholder="Enter your first name"
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                      ) : (
                        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-gray-900 text-sm sm:text-base">{user.firstName}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          placeholder="Enter your last name"
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                      ) : (
                        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-gray-900 text-sm sm:text-base">{user.lastName}</div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          placeholder="Enter your email address"
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                      ) : (
                        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                          <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          {user.email}
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          name="phoneNumber"
                          value={(formData as any).phoneNumber}
                          onChange={handleInputChange}
                          placeholder="Enter your phone number"
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                        />
                      ) : (
                        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-gray-900 flex items-center gap-2 text-sm sm:text-base">
                          <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                          {user.phoneNumber}
                        </div>
                      )}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <textarea
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          rows={3}
                          placeholder="Enter your address"
                          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm sm:text-base"
                        />
                      ) : (
                        <div className="px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-50 rounded-lg text-gray-900 flex items-start gap-2 text-sm sm:text-base">
                          <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 mt-1 flex-shrink-0" />
                          {user.address}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3 sm:mb-4">Recent Activity</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          </div>
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">Last Session</div>
                            <div className="text-xs text-gray-500">{user.lastLogin}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'professional' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <InfoCard
                      label="Employee ID"
                      value={user.employeeId}
                      icon={<CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    <InfoCard
                      label="Department"
                      value={user.department || 'Not Assigned'}
                      icon={<Building className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    <InfoCard
                      label="Position"
                      value={user.designation || user.role || 'Staff Member'}
                      icon={<Briefcase className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    <InfoCard
                      label="Date of Joining"
                      value={user.dateOfJoining || 'Jan 01, 2024'}
                      icon={<Calendar className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    <InfoCard
                      label="Manager"
                      value={user.createdByName || 'Corporate Admin'}
                      icon={<User className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                    <InfoCard
                      label="Performance Rating"
                      value={user.performanceRating}
                      icon={<Award className="w-4 h-4 sm:w-5 sm:h-5" />}
                    />
                  </div>

                  {/* Team Information */}
                  <div className="pt-4 sm:pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3 sm:mb-4">Team Information</h4>
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-blue-900">Team Size</div>
                          <div className="text-xl sm:text-2xl font-bold text-blue-700">{user.teamSize} members</div>
                        </div>
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <User className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="space-y-3 sm:space-y-4">
                    <h4 className="font-medium text-gray-900">Account Security</h4>

                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Key className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">Password</div>
                            <div className="text-xs sm:text-sm text-gray-600">Secure Protocol Active</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowChangePasswordModal(true)}
                          className="px-3 sm:px-4 py-1.5 sm:py-2 text-blue-600 hover:bg-blue-50 rounded-lg font-medium text-sm sm:text-base"
                        >
                          Change
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">Two-Factor Authentication</div>
                            <div className="text-xs sm:text-sm text-gray-600">Institutional Security Tier</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm sm:text-base"
                        >
                          Enable
                        </button>
                      </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 text-sm sm:text-base">Connected Devices</div>
                            <div className="text-xs sm:text-sm text-gray-600">Active Audit Logs</div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg font-medium text-sm sm:text-base"
                        >
                          Manage
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 sm:pt-6 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-3 sm:mb-4">Account Actions</h4>
                    <div className="space-y-2 sm:space-y-3">
                      <button
                        type="button"
                        className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-700 font-medium text-sm sm:text-base"
                      >
                        Download Personal Data
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) => (
  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 sm:p-4">
    <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
      <div className="text-gray-400">
        {icon}
      </div>
      <div className="text-xs sm:text-sm font-medium text-gray-600">{label}</div>
    </div>
    <div className="font-medium text-gray-900 text-sm sm:text-base">{value}</div>
  </div>
);

export default Profile;