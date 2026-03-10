import React, { useEffect, useState } from 'react';
import { SectionHeader } from './UI.tsx';
import { FormInput } from '../../components/super_admin/FormFields.tsx';
import { User, Shield, Key, Bell, Globe, Camera, Loader, X } from 'lucide-react';
import { apiClient } from '../../utils/apiClient.js';
import { useApp } from '../../context/AppContext.tsx';

interface UserProfile {
  employeeId: string;
  email: string;
  firstName: string;
  lastName: string;
  username: string;
  userType: string;
  designation: string;
  department: string;
  role: string;
  dateOfJoining: string;
  phoneNumber: string | null;
  address: string | null;
  createdByEmployeeId: string | null;
  createdByRole: string | null;
  createdByName: string | null;
  hrEmployeeId: string | null;
  profileImage: string | null;
}

export const ProfileView = () => {
  const { refreshCurrentUser } = useApp();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Helper function to format base64 image data
  const formatBase64Image = (imageData: string | null | undefined): string => {
    if (!imageData) return '';

    // If it's already a proper data URL, return as is
    if (imageData.startsWith('data:image')) {
      return imageData;
    }

    // If it's raw base64 without the prefix, add the JPEG prefix
    if (imageData.length > 0) {
      return `data:image/jpeg;base64,${imageData}`;
    }

    return '';
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await apiClient.get<UserProfile>('/api/users/me');
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Error loading profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      console.log('Uploading profile image...', { fileName: file.name, fileSize: file.size });

      const response = await fetch('http://localhost:8085/api/users/admin/profile-image', {
        method: 'PUT',
        credentials: 'include', // Include HttpOnly cookies
        body: formData, // FormData - don't set Content-Type header
      });

      const responseData = await response.json().catch(() => null);
      console.log('Upload response:', { status: response.status, data: responseData });

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, profileImage: responseData?.profileImage } : null);
        await refreshCurrentUser();
        alert('Profile image updated successfully!');
      } else {
        const errorMessage = responseData?.message || `Failed to upload image (Status: ${response.status})`;
        console.error('Upload failed:', errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error('Error uploading image:', err);
      alert(`Error uploading image: ${err?.message || 'Unknown error'}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) return;

    setDeletingImage(true);
    try {
      console.log('Deleting profile image...');

      const response = await fetch('http://localhost:8085/api/users/admin/profile-image', {
        method: 'DELETE',
        credentials: 'include', // Include HttpOnly cookies
      });

      const responseData = await response.json().catch(() => null);
      console.log('Delete response:', { status: response.status, data: responseData });

      if (response.ok) {
        setProfile(prev => prev ? { ...prev, profileImage: null } : null);
        await refreshCurrentUser();
        alert('Profile image removed successfully!');
      } else {
        const errorMessage = responseData?.message || `Failed to delete image (Status: ${response.status})`;
        console.error('Delete failed:', errorMessage);
        alert(`Error: ${errorMessage}`);
      }
    } catch (err: any) {
      console.error('Error deleting image:', err);
      alert(`Error deleting image: ${err?.message || 'Unknown error'}`);
    } finally {
      setDeletingImage(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleEditClick = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName,
        lastName: profile.lastName,
        phoneNumber: profile.phoneNumber || '',
        address: profile.address || '',
      });
      setIsEditing(true);
    }
  };

  const handleSaveProfile = async () => {
    if (!editForm || !profile) return;

    setIsSaving(true);
    try {
      const updatedProfile = await apiClient.put<UserProfile>('/api/users/super-admin/update-profile', {
        firstName: editForm.firstName,
        lastName: editForm.lastName,
        phoneNumber: editForm.phoneNumber,
        address: editForm.address,
      });
      setProfile(prev => prev ? { ...prev, ...updatedProfile } : null);
      await refreshCurrentUser();
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Error updating profile:', err);
      alert('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm(null);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-4xl">
        <SectionHeader title="Profile Settings" description="Update your administrative identity and security preferences." />
        <div className="bg-white rounded-2xl border border-gray-200 p-12 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader size={32} className="text-blue-600 animate-spin" />
            <p className="text-gray-500 font-medium">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="space-y-6 max-w-4xl">
        <SectionHeader title="Profile Settings" description="Update your administrative identity and security preferences." />
        <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
          <p className="text-red-600 font-semibold">{error || 'Failed to load profile'}</p>
        </div>
      </div>
    );
  }

  const fullName = `${profile.firstName} ${profile.lastName}`;
  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="space-y-6 max-w-4xl">
      <SectionHeader title="Profile Settings" description="Update your administrative identity and security preferences." />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
            <div className="relative inline-block mb-4">
              <div className="w-24 h-24 rounded-2xl border-2 border-gray-200 bg-blue-100 overflow-hidden mx-auto flex items-center justify-center">
                {profile.profileImage ? (
                  <img src={formatBase64Image(profile.profileImage)} alt={fullName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-blue-600">{initials}</span>
                )}
              </div>
              <div className="flex items-center gap-1 absolute -bottom-2 -right-2">
                <button
                  onClick={handleCameraClick}
                  disabled={uploadingImage || deletingImage}
                  title="Change avatar"
                  className="p-2 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploadingImage ? (
                    <Loader size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
                {profile.profileImage && (
                  <button
                    onClick={handleDeleteImage}
                    disabled={deletingImage || uploadingImage}
                    title="Delete profile image"
                    className="p-2 bg-rose-600 text-white rounded-lg shadow-lg hover:bg-rose-700 transition-all focus:ring-4 focus:ring-rose-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingImage ? (
                      <Loader size={14} className="animate-spin" />
                    ) : (
                      <X size={14} />
                    )}
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
            <h3 className="font-bold text-lg text-gray-900">{fullName}</h3>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">{profile.role}</p>
            <div className="mt-2 text-xs text-gray-600">
              <p>{profile.designation}</p>
              <p className="text-gray-500">{profile.department}</p>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-center gap-2">
              <Shield size={14} className="text-emerald-500" />
              <span className="text-xs font-bold text-emerald-500 uppercase">Tier 1 Access</span>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-4 space-y-1">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold text-sm focus:ring-4 focus:ring-blue-500/50">
              <User size={18} /> Personal Info
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all font-medium text-sm">
              <Key size={18} /> Password & Security
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all font-medium text-sm">
              <Bell size={18} /> Notification Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-all font-medium text-sm">
              <Globe size={18} /> Localization
            </button>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
            <h4 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User size={18} className="text-blue-600" /> Account Details
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">First Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm?.firstName || ''}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                    {profile.firstName}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Last Name</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm?.lastName || ''}
                    onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                    className="w-full px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                    {profile.lastName}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Email Address</label>
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                  {profile.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Phone Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm?.phoneNumber || ''}
                    onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                    className="w-full px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                    {profile.phoneNumber || '-'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Job Title</label>
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                  {profile.designation}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Department</label>
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                  {profile.department}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Employee ID</label>
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium font-mono">
                  {profile.employeeId}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">User Type</label>
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                  {profile.userType}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Role</label>
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                  {profile.role}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Date of Joining</label>
                <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                  {new Date(profile.dateOfJoining).toLocaleDateString()}
                </div>
              </div>
            </div>

            {profile.address !== null && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Address</label>
                {isEditing ? (
                  <textarea
                    value={editForm?.address || ''}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full px-3 py-2.5 bg-blue-50 border border-blue-200 rounded-lg text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                  />
                ) : (
                  <div className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-medium">
                    {profile.address || '-'}
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl mb-6">
              <p className="text-xs text-amber-500 leading-relaxed font-medium">
                Job Title, Employee ID, User Type, Role, and Date of Joining cannot be modified. Please contact your HR administrator for changes.
              </p>
            </div>

            <div className="flex justify-end gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="px-6 py-2 border border-gray-300 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-700 transition-all focus:ring-4 focus:ring-green-500/50 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSaving ? (
                      <>
                        <Loader size={16} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEditClick}
                  className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all focus:ring-4 focus:ring-blue-500/50"
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="bg-rose-500/5 border border-rose-500/10 rounded-2xl p-6">
            <h4 className="font-bold text-rose-500 mb-2">Danger Zone</h4>
            <p className="text-xs text-gray-500 mb-4">Deleting your administrator account is permanent and will revoke all access instantly.</p>
            <button className="px-6 py-2 border border-rose-500/30 text-rose-500 rounded-lg text-xs font-bold hover:bg-rose-500/10 transition-all">
              Request Account Deletion
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
