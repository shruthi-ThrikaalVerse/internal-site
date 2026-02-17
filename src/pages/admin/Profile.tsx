import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} onClick={onClick} /> : null;
};
import { useAuth } from '../../context/AuthContext.tsx';
import { useHRMS } from '../../context/HRMSContext.tsx';

// Avatar component with fallback
const Avatar = ({ src, name, size = 'lg', onClick }: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}) => {
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl',
  };

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <div
        className={`${sizes[size]} rounded-2xl overflow-hidden border-2 border-white shadow-lg cursor-pointer relative group`}
        onClick={onClick}
      >
        <img
          src={src}
          alt={name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <LucideIcons.Camera className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${sizes[size]} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={onClick}
    >
      {initials}
    </div>
  );
};

// Profile picture upload modal
const ProfilePictureModal = ({ isOpen, onClose, onUpload, onRemove, currentImage }: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onRemove: () => void;
  currentImage?: string;
}) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = () => {
    if (fileInputRef.current?.files?.[0]) {
      onUpload(fileInputRef.current.files[0]);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Profile Picture</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl"
            title="Close modal"
            aria-label="Close modal"
          >
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>

        <div
          className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-all ${isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
            title="Upload profile picture"
            aria-label="Upload profile picture"
          />

          {preview ? (
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-slate-600">Click to change photo</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <LucideIcons.Camera className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Drop your image here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-slate-400">Supports JPG, PNG, WebP • Max 5MB</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!preview || preview === currentImage}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Upload profile picture"
            aria-label="Upload profile picture"
          >
            Upload Photo
          </button>

          {currentImage && (
            <button
              onClick={() => {
                onRemove();
                onClose();
              }}
              className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100"
              title="Remove profile picture"
              aria-label="Remove profile picture"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const auth = useAuth();
  const { user } = auth;
  const { logs, notify, profilePhotos, updateProfilePhoto, removeProfilePhoto, getProfilePhoto } = useHRMS();
  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'activity'>('details');
  const [isMfaEnabled, setIsMfaEnabled] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fetchedUserData, setFetchedUserData] = useState<any>(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [userDataError, setUserDataError] = useState<string | null>(null);

  // Load profile image from HRMS, localStorage, or Auth user data
  useEffect(() => {
    if (user?.id) {
      const hrmsPhoto = getProfilePhoto ? getProfilePhoto(user.id) : null;
      if (hrmsPhoto) {
        setProfileImage(hrmsPhoto);
        return;
      }
      const savedImage = localStorage.getItem(`profile_image_${user.id}`);
      if (savedImage) {
        setProfileImage(savedImage);
        return;
      }
      if (user.avatar) {
        setProfileImage(user.avatar);
      } else {
        setProfileImage(null);
      }
    }
  }, [user, profilePhotos]);

  // Fetch user details from the API endpoint
  useEffect(() => {
    const fetchUserDetails = async () => {
      // Use email as the check since id might be empty but email is always present
      if (!user?.email) {
        return;
      }

      setIsLoadingUserData(true);
      setUserDataError(null);
      try {
        const token = localStorage.getItem('authToken');

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch('http://localhost:8085/api/users/me', {
          method: 'GET',
          credentials: 'include',
          headers,
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch user details: ${response.statusText}`);
        }

        const data = await response.json();

        // Handle potential nested response structure
        const userData = data.data || data;
        setFetchedUserData(userData);
      } catch (error: any) {
        setUserDataError(error.message);
      } finally {
        setIsLoadingUserData(false);
      }
    };

    fetchUserDetails();
  }, [user?.email]);

  // Profile Photo State
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get profile photo from HRMS context or use default
  const userProfilePhoto = user ? getProfilePhoto(user.id) : null;

  // Filter logs for current user
  const userLogs = useMemo(() => {
    return logs.filter(log => log.user === user?.fullName || log.user === 'Super Admin').slice(0, 10);
  }, [logs, user]);

  // Get current date in correct format
  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).replace(',', '');
  };

  // Get current time in 12-hour format
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get formatted timestamp for "Last Sync"
  const getLastSync = () => {
    const now = new Date();
    const day = now.getDate();
    const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';

    // Format: "Today, 2nd Jan, 09:45 AM"
    return `Today, ${day}${suffix} ${now.toLocaleDateString('en-US', { month: 'short' })}, ${getCurrentTime()}`;
  };

  // Handle profile photo upload
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      notify('Please upload an image file', 'error');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      notify('Image size should be less than 5MB', 'error');
      return;
    }

    setIsUploading(true);

    // Create a FileReader to read the file
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        const imageUrl = e.target.result as string;
        // Store the photo URL in HRMS context and update Auth avatar so header updates
        updateProfilePhoto(user.id, imageUrl);
        auth.updateAvatar?.(imageUrl);
        setProfileImage(imageUrl);
        localStorage.setItem(`profile_image_${user.id}`, imageUrl);
        setIsUploading(false);

        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      notify('Failed to upload image', 'error');
    };
    reader.readAsDataURL(file);
  };

  // Remove profile photo
  const handleRemovePhoto = () => {
    if (user) {
      removeProfilePhoto(user.id);
      setProfileImage(null);
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName || 'admin')}`;
      auth.updateAvatar?.(defaultAvatar);
      localStorage.removeItem(`profile_image_${user.id}`);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
  };

  // Mock implementation for updateProfilePicture
  const handleProfilePictureUpload = async (file: File) => {
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        setTimeout(() => setUploadProgress(i), i * 10);
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setProfileImage(imageUrl);

        if (user?.id) {
          localStorage.setItem(`profile_image_${user.id}`, imageUrl);
          updateProfilePhoto(user.id, imageUrl);
          auth.updateAvatar?.(imageUrl);
        }

        setUploadProgress(0);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      notify('Failed to upload profile picture', 'error');
      setUploadProgress(0);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfileImage(null);
    if (user?.id) {
      removeProfilePhoto(user.id);
      const defaultAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.fullName || 'admin')}`;
      auth.updateAvatar?.(defaultAvatar);
      localStorage.removeItem(`profile_image_${user.id}`);
    }
  };

  // Export profile data function
  const handleExportProfile = () => {
    if (!user) {
      notify('No user data to export', 'error');
      return;
    }

    try {
      // Prepare profile data
      const profileData = {
        user: {
          id: user.id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          avatar: profileImage || user.avatar,
        },
        metadata: {
          joinedDate: getCurrentDate(),
          lastSync: getLastSync(),
          authType: isMfaEnabled ? 'MFA Enforced' : 'Password Only',
          accountType: 'Verified',
        },
        activity: userLogs,
        exportDate: new Date().toISOString(),
      };

      // Convert to JSON
      const jsonData = JSON.stringify(profileData, null, 2);

      // Create a Blob with the JSON data
      const blob = new Blob([jsonData], { type: 'application/json' });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const fileName = `profile_export_${user.fullName?.replace(/\s+/g, '_') || 'user'}_${Date.now()}.json`;

      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();

      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export failed:', error);
      notify('Failed to export profile data', 'error');
    }
  };

  const renderProfileHeader = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      <div className="flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative group">
            <Avatar
              src={profileImage || undefined}
              name={(fetchedUserData?.fullName || fetchedUserData?.name || user?.fullName) || 'Admin'}
              size="lg"
              onClick={() => setShowProfileModal(true)}
            />

            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-indigo-500 border-white/30 rounded-full animate-spin"></div>
              </div>
            )}

            <button
              onClick={() => setShowProfileModal(true)}
              className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors group-hover:scale-110"
              title="Change profile picture"
              aria-label="Change profile picture"
            >
              <LucideIcons.Camera className="w-4 h-4 text-slate-700" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900">
                {isLoadingUserData ? (
                  <span className="text-slate-400">Loading...</span>
                ) : fetchedUserData ? (
                  `${fetchedUserData.firstName || ''} ${fetchedUserData.lastName || ''}`.trim()
                ) : (
                  user?.fullName
                )}
              </h1>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest">
                Verified
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">
              {isLoadingUserData ? (
                <span className="text-slate-400">Loading...</span>
              ) : fetchedUserData?.email ? (
                fetchedUserData.email
              ) : (
                user?.email
              )}
            </p>

            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <LucideIcons.BadgeCheck className="w-4 h-4 text-indigo-500" />
                <span className="font-bold">
                  {isLoadingUserData ? (
                    <span className="text-slate-400">Loading...</span>
                  ) : fetchedUserData?.role ? (
                    `${fetchedUserData.role} Account`
                  ) : (
                    `${user?.role} Account`
                  )}
                </span>
              </div>
              {!isLoadingUserData && fetchedUserData?.department && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <LucideIcons.Briefcase className="w-4 h-4 text-slate-400" />
                  <span>{fetchedUserData.department}</span>
                </div>
              )}
              {!isLoadingUserData && fetchedUserData?.dateOfJoining && (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <LucideIcons.Calendar className="w-4 h-4 text-slate-400" />
                  <span>Member since {new Date(fetchedUserData.dateOfJoining).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {}}
          className="px-6 py-3 bg-white rounded-2xl border border-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
          title="Save profile settings"
          aria-label="Save profile settings"
        >
          <LucideIcons.Save size={14} />
          Save
        </button>
        <button
          onClick={handleExportProfile}
          className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
          title="Export profile data"
          aria-label="Export profile data"
        >
          <LucideIcons.Download size={14} />
          Export
        </button>
      </div>
    </div>
  );

  const renderDetails = () => (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <Icon name="Info" className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Administrative Identity</h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Detailed account metadata and personal records.</p>
        </div>
      </div>

      {/* Profile Photo Upload Section */}
      <div className="flex items-start gap-6 p-6 bg-slate-50 rounded-3xl border border-slate-100">
        <div className="relative">
          <div className="relative w-32 h-32">
            {userProfilePhoto ? (
              <img
                src={userProfilePhoto}
                alt="Profile"
                className="w-full h-full object-cover rounded-2xl border-4 border-white shadow-lg"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                <span className="text-4xl font-black text-white">
                  {user?.fullName?.charAt(0) || 'A'}
                </span>
              </div>
            )}
            {isUploading && (
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-white rounded-full border-4 border-slate-50 flex items-center justify-center shadow-lg">
                <Icon name="Loader2" className="w-5 h-5 text-indigo-600 animate-spin" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-4">
          <div>
            <h3 className="text-sm font-black text-slate-900 mb-1">Profile Photo</h3>
            <p className="text-xs text-slate-500 font-medium">
              Upload a professional headshot. Recommended: 500x500px, JPG or PNG, max 5MB.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              title="Upload profile photo"
              aria-label="Upload profile photo"
            >
              {isUploading ? (
                <>
                  <Icon name="Loader2" className="w-3.5 h-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Icon name="Upload" className="w-3.5 h-3.5" />
                  {userProfilePhoto ? 'Change Photo' : 'Upload Photo'}
                </>
              )}
            </button>

            <button
              onClick={handleRemovePhoto}
              disabled={!userProfilePhoto || isUploading}
              className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
              title="Remove profile photo"
              aria-label="Remove profile photo"
            >
              <Icon name="Trash2" className="w-3.5 h-3.5" />
              Remove
            </button>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
              title="Upload profile photo"
              aria-label="Upload profile photo"
            />
          </div>

          <div className="flex items-center gap-4 pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2">
              <Icon name="ShieldCheck" className="w-4 h-4 text-emerald-500" />
              <span className="text-xs font-medium text-slate-600">Secure upload</span>
            </div>
            <div className="flex items-center gap-2">
              <Icon name="Lock" className="w-4 h-4 text-indigo-500" />
              <span className="text-xs font-medium text-slate-600">Encrypted storage</span>
            </div>
          </div>
        </div>
      </div>

      {/* User Details Section - Now using actual API fields */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
            <p className="text-lg font-black text-slate-800 mt-1">
              {isLoadingUserData ? (
                <span className="text-slate-400">Loading...</span>
              ) : fetchedUserData?.firstName ? (
                fetchedUserData.firstName
              ) : (
                user?.fullName?.split(' ')[0] || 'N/A'
              )}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
            <p className="text-lg font-black text-slate-800 mt-1">
              {isLoadingUserData ? (
                <span className="text-slate-400">Loading...</span>
              ) : fetchedUserData?.lastName ? (
                fetchedUserData.lastName
              ) : (
                user?.fullName?.split(' ').slice(1).join(' ') || 'N/A'
              )}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <p className="text-lg font-black text-slate-800 mt-1">
              {isLoadingUserData ? (
                <span className="text-slate-400">Loading...</span>
              ) : fetchedUserData?.email ? (
                fetchedUserData.email
              ) : (
                user?.email || 'N/A'
              )}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Employee ID</label>
            <p className="text-lg font-black text-indigo-600 mt-1 font-mono">
              {isLoadingUserData ? (
                <span className="text-slate-400">Loading...</span>
              ) : fetchedUserData?.employeeId ? (
                fetchedUserData.employeeId
              ) : (
                'N/A'
              )}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
            <p className="text-lg font-black text-slate-800 mt-1 capitalize">
              {isLoadingUserData ? (
                <span className="text-slate-400">Loading...</span>
              ) : fetchedUserData?.role ? (
                fetchedUserData.role
              ) : (
                user?.role || 'N/A'
              )}
            </p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department</label>
            <p className="text-lg font-black text-slate-800 mt-1">
              {isLoadingUserData ? (
                <span className="text-slate-400">Loading...</span>
              ) : fetchedUserData?.department ? (
                fetchedUserData.department
              ) : (
                'N/A'
              )}
            </p>
          </div>
        </div>

        {userDataError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl">
            <p className="text-xs text-rose-600 font-medium">⚠️ {userDataError}</p>
          </div>
        )}

        {isLoadingUserData === false && fetchedUserData && (
          <div className="pt-8 border-t border-slate-50">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fetchedUserData.designation && (
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Designation</p>
                  <p className="text-sm font-bold text-slate-700">{fetchedUserData.designation}</p>
                </div>
              )}
              {fetchedUserData.userType && (
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">User Type</p>
                  <p className="text-sm font-bold text-slate-700">{fetchedUserData.userType}</p>
                </div>
              )}
              {fetchedUserData.dateOfJoining && (
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Date of Joining</p>
                  <p className="text-sm font-bold text-slate-700">{new Date(fetchedUserData.dateOfJoining).toLocaleDateString()}</p>
                </div>
              )}
              {fetchedUserData.phoneNumber && (
                <div className="p-4 bg-slate-50 rounded-2xl">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Phone Number</p>
                  <p className="text-sm font-bold text-slate-700">{fetchedUserData.phoneNumber}</p>
                </div>
              )}
              {fetchedUserData.address && (
                <div className="p-4 bg-slate-50 rounded-2xl md:col-span-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-sm font-bold text-slate-700">{fetchedUserData.address}</p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="pt-8 border-t border-slate-50">
          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Account Metadata</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
              <p className="text-xs font-black text-slate-700">{getCurrentDate()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
              <p className="text-xs font-black text-slate-700">{getLastSync()}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Auth Type</p>
              <p className="text-xs font-black text-slate-700">{isMfaEnabled ? 'MFA Enforced' : 'Password Only'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <Icon name="ShieldCheck" className="text-indigo-600" />
          Security Hardening
        </h2>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">Manage credentials and administrative access protocols.</p>
      </div>

      <form onSubmit={handlePasswordUpdate} className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Icon name="Key" className="w-3.5 h-3.5" /> Update Access Credentials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="current-password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Current Password
            </label>
            <input
              id="current-password"
              type="password"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              placeholder="Enter your current password"
              title="Enter your current password"
              aria-label="Current password"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="new-password" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
              New Secure Password
            </label>
            <input
              id="new-password"
              type="password"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              placeholder="Enter your new secure password"
              title="Enter your new secure password"
              aria-label="New secure password"
            />
          </div>
        </div>
        <button type="submit" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95" title="Update password" aria-label="Update password">
          Commit Password Change
        </button>
      </form>

      <div className="pt-8 border-t border-slate-50 space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Icon name="Lock" className="w-3.5 h-3.5" /> Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div>
            <p className="text-sm font-black text-slate-900">MFA via Authenticator App</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">High-security protocol for Tier-1 logins.</p>
          </div>
          <button
            onClick={() => {
              setIsMfaEnabled(!isMfaEnabled);
            }}
            className={`w-14 h-8 rounded-full transition-all relative p-1.5 ${isMfaEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
            title={`${isMfaEnabled ? 'Disable' : 'Enable'} two-factor authentication`}
            aria-label={`${isMfaEnabled ? 'Disable' : 'Enable'} two-factor authentication`}
            aria-checked={isMfaEnabled}
            role="switch"
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${isMfaEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <Icon name="History" className="text-indigo-600" />
          Your Audit Timeline
        </h2>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">Chronological history of your administrative operations.</p>
      </div>

      <div className="relative space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {userLogs.length > 0 ? userLogs.map((log, i) => (
          <div key={log.id} className="relative pl-16 group">
            <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-4 ring-slate-50 transition-all group-hover:scale-125 z-10 ${log.action === 'Delete' ? 'bg-rose-500' :
              log.action === 'Update' ? 'bg-amber-500' :
                log.action === 'Create' ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}></div>
            <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group-hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{log.module} Audit</span>
                <span className="text-[10px] font-bold text-slate-400 text-black">{log.timestamp}</span>
              </div>
              <p className="text-sm font-black text-slate-800">{log.action}</p>
              <div className="text-xs text-slate-500 font-medium mt-1 leading-relaxed whitespace-pre-wrap">
                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {}, null, 2)}
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <Icon name="Monitor" className="w-3 h-3 text-slate-300" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.timestamp}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center">
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No recent operations</p>
          </div>
        )}
      </div>
      <button
        onClick={() => setActiveTab('activity')}
        className="w-full mt-8 py-3 text-indigo-600 bg-indigo-50 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all"
        title="View complete audit log"
        aria-label="View complete audit log"
      >
        View Full Audit
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="relative">
              {userProfilePhoto ? (
                <img
                  src={userProfilePhoto}
                  alt="Profile"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-xl font-black text-white">
                    {user?.fullName?.charAt(0) || 'A'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{user?.fullName}</h1>
              <p className="text-xs text-slate-400 font-medium mt-1 text-black">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => {}} className="px-6 py-3 bg-white rounded-2xl border border-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all" title="Save profile settings" aria-label="Save profile settings">Save</button>
          <button onClick={handleExportProfile} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all" title="Export profile data" aria-label="Export profile data">Export</button>
        </div>
      </div>

      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('details')} className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'details' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`} title="View profile details" aria-label="View profile details">Details</button>
            <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'security' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`} title="View security settings" aria-label="View security settings">Security</button>
            <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'activity' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`} title="View activity log" aria-label="View activity log">Activity</button>
          </div>
        </div>

        {activeTab === 'details' && renderDetails()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'activity' && renderActivity()}
      </div>

      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpload={handleProfilePictureUpload}
        onRemove={handleRemoveProfilePicture}
        currentImage={profileImage || userProfilePhoto || undefined}
      />
    </div>
  );
};

export default Profile;