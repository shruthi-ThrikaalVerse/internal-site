
import React, { useState, useMemo, useRef } from 'react';
import {
  Users, Filter, MoreVertical,
  Mail, Phone, MapPin, Calendar,
  Shield, Clock, Smartphone, Hash, Lock,
  CircleOff, RotateCcw, ShieldAlert, Camera, Upload,
  Trash2, TrendingUp, UserCircle, X, CheckCircle2, ChevronRight,
  FileWarning
} from 'lucide-react';
import { User } from '../../types.tsx';
import { Badge, SectionHeader } from '../../components/super_admin/UI.tsx';
import { Modal } from '../../components/super_admin/Modal.tsx';
import { FormInput, FormSelect, FormTextArea } from '../../components/super_admin/FormFields.tsx';
import { useApp } from '../../context/AppContext.tsx';

const DEPARTMENTS = ['Engineering', 'Design', 'Marketing', 'People', 'Infrastructure', 'Quality', 'Data'];
const EMPLOYMENT_TYPES = ['Full-time', 'Part-time', 'Internship'];

export const EmployeeHub = () => {
  const { globalSearch, employees, updateEmployee, removeEmployee, promoteToAdmin, currentUser, requestEmployeeTermination } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const statuses = ['All Statuses', 'active', 'inactive', 'pending'];
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAdminTier = currentUser?.role === 'SUPER_ADMIN' || currentUser?.role === 'ADMIN' || currentUser?.role === 'SYSTEM_ADMIN' || currentUser?.role === 'SECURITY_ADMIN';

  const handleResetFilters = () => {
    setSelectedDept('All Departments');
    setSelectedStatus('All Statuses');
    setSelectedType('All Types');
    setLocationQuery('');
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
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
  }, [globalSearch, employees, selectedDept, selectedStatus, selectedType, locationQuery]);

  const handleEdit = (employee: User) => {
    const nameParts = employee.name.split(' ');
    setEditingId(employee.id);
    setFormState({
      firstName: employee.firstName || nameParts[0] || '',
      lastName: employee.lastName || nameParts.slice(1).join(' ') || '',
      employeeId: employee.employeeId || employee.id || '',
      email: employee.email || '',
      phone: employee.phone || '',
      address: employee.address || '',
      dateOfBirth: employee.dateOfBirth || '',
      dateOfJoining: employee.dateOfJoining || '',
      designation: employee.designation || '',
      department: employee.department || DEPARTMENTS[0],
      location: employee.location || '',
      employmentType: employee.employmentType || EMPLOYMENT_TYPES[0],
      role: employee.role || 'Employee',
      password: employee.password || '',
      avatar: employee.avatar || 'https://picsum.photos/seed/default/200'
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formState) return;
    const finalData: User = {
      ...formState,
      employmentType: formState.employmentType as User['employmentType'],
      id: editingId!,
      name: `${formState.firstName} ${formState.lastName}`.trim(),
      avatar: formState.avatar,
      joiningDate: formState.dateOfJoining
    };

    updateEmployee(finalData);
    setIsModalOpen(false);
    setEditingId(null);
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
      <div className="bg-[#0b1220]/50 p-4 rounded-2xl border border-[#1f2937] backdrop-blur-sm mb-6 flex flex-col gap-4">
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
              className={`flex-1 md:w-auto h-[44px] px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest border ${showAdvanced ? 'bg-[#f37321] text-white border-transparent' : 'bg-[#1f2937] text-[#9aa8bd] hover:text-[#e6eef8] border-transparent hover:border-[#f37321]/20'}`}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 mt-2 bg-[#0f172a]/50 rounded-xl border border-[#1f2937] animate-in slide-in-from-top-4 duration-300">
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
      <div className="bg-[#0b1220] rounded-3xl border border-[#1f2937] overflow-hidden shadow-2xl shadow-black/40">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead className="bg-[#0f172a]/80 backdrop-blur-md border-b border-[#1f2937]">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Profile Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Role & Unit</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">System Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Contact Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Deployment</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {filteredEmployees.map((e) => (
                <tr key={e.id} className="hover:bg-[#0f172a] transition-all group border-l-2 border-transparent hover:border-[#f37321]">
                  <td className="px-8 py-5 cursor-pointer" onClick={() => setViewingUser(e)}>
                    <div className="flex items-center gap-4">
                      <div className="relative shrink-0">
                        <img src={e.avatar} alt={e.name} className="w-14 h-14 rounded-2xl border border-[#1f2937] shadow-xl group-hover:scale-105 transition-transform object-cover" />
                        <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[3px] border-[#0b1220] ${e.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : e.status === 'pending' ? 'bg-amber-500 shadow-[0_0_8px_#f59e0b]' : 'bg-rose-500 shadow-[0_0_8px_#f43f5e]'}`}></span>
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-[#e6eef8] group-hover:text-[#f37321] transition-colors truncate text-base">{e.name}</div>
                        <div className="text-[10px] text-[#9aa8bd] font-bold tracking-tight opacity-70 truncate">{e.designation || e.role}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] text-[#f37321] font-mono bg-[#f37321]/10 px-1.5 py-0.5 rounded border border-[#f37321]/20 tracking-tighter uppercase">ID: {e.employeeId || e.id.padStart(4, '0')}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <Badge color="blue">{e.department?.toUpperCase()}</Badge>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#9aa8bd] font-bold bg-[#1f2937]/50 w-fit px-2 py-1 rounded-lg">
                        <Clock size={12} className="text-[#f37321]" /> {e.employmentType || 'Full-time'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Badge color={e.status === 'active' ? 'green' : e.status === 'pending' ? 'yellow' : 'red'}>
                      {e.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-[#9aa8bd] hover:text-[#f37321] transition-colors cursor-default">
                        <Mail size={14} className="shrink-0 text-[#f37321]" /> <span className="truncate max-w-[160px]">{e.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-[#9aa8bd] font-mono bg-[#1f2937]/30 px-2 py-1 rounded-lg w-fit">
                        <Smartphone size={12} className="shrink-0 text-[#f37321]" /> {e.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs text-[#e6eef8] font-semibold">
                        <MapPin size={14} className="text-[#f37321]" /> {e.location || 'Global Remote'}
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#9aa8bd] font-bold">
                        <Calendar size={12} className="text-[#f37321]" /> Since {e.dateOfJoining || e.joiningDate || '2023-01-01'}
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isSuperAdmin && (
                        <button
                          onClick={() => setConfirmPromoteId(e.id)}
                          title="Elevate Record to Admin"
                          className="p-3 bg-[#f37321]/10 hover:bg-[#f37321] text-[#f37321] hover:text-white rounded-xl transition-all active:scale-90"
                        >
                          <TrendingUp size={18} />
                        </button>
                      )}
                      <button
                        onClick={() => handleEdit(e)}
                        title="Modify Registry"
                        className="p-3 bg-[#1f2937] hover:bg-[#1f2937]/80 text-[#9aa8bd] hover:text-[#e6eef8] rounded-xl transition-all active:scale-90"
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
            <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-[#1f2937] to-[#0b1220] border border-[#f37321]/20 overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#f37321]/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <img src={viewingUser.avatar} className="w-32 h-32 rounded-[2.5rem] border-4 border-[#0b1220] shadow-2xl object-cover" alt={viewingUser.name} />
                  <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-[#0b1220] ${viewingUser.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500 shadow-lg'}`}>
                    <CheckCircle2 size={20} className="text-white" />
                  </div>
                </div>
                <h3 className="text-3xl font-black text-[#e6eef8] tracking-tight">{viewingUser.name}</h3>
                <p className="text-[#f37321] font-bold uppercase tracking-widest text-sm mt-1 mb-4">{viewingUser.designation}</p>
                <div className="flex gap-2">
                  <Badge color="blue">{viewingUser.department}</Badge>
                  <Badge color="slate">{viewingUser.role}</Badge>
                </div>
              </div>
            </div>

            {/* Promote Action Box (Only for Super Admin) */}
            {isSuperAdmin && viewingUser.role !== 'SUPER_ADMIN' && (
              <div className="p-6 rounded-[1.5rem] bg-[#f37321]/5 border border-[#f37321]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#f37321]/10 rounded-xl text-[#f37321]">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-[#e6eef8] tracking-tight">Administrative Elevation</h4>
                    <p className="text-[10px] text-[#9aa8bd] font-medium uppercase tracking-widest">Promotion tier: Employee → Admin</p>
                  </div>
                </div>
                <button
                  onClick={() => handlePromoteFromModal(viewingUser.id)}
                  className="w-full sm:w-auto px-6 py-3 bg-[#f37321] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#e06410] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#f37321]/20 active:scale-95"
                >
                  Promote Record <ChevronRight size={14} />
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 rounded-2xl bg-[#0f172a]/50 border border-[#1f2937]">
                <h4 className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Smartphone size={14} className="text-[#f37321]" /> Communication Channels
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9aa8bd]">Work Email</span>
                    <span className="text-[#e6eef8] font-semibold">{viewingUser.email}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9aa8bd]">Mobile</span>
                    <span className="text-[#e6eef8] font-semibold">{viewingUser.phone || 'N/A'}</span>
                  </div>
                  <div className="pt-2 border-t border-[#1f2937]">
                    <span className="text-[#9aa8bd] block mb-1">Operational Location</span>
                    <span className="text-[#e6eef8] font-medium">{viewingUser.location || 'Global Hub'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-[#0f172a]/50 border border-[#1f2937]">
                <h4 className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Calendar size={14} className="text-[#f37321]" /> Deployment Context
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-[#9aa8bd]">Registry UID</span>
                    <span className="text-[#f37321] font-mono font-bold tracking-tighter">{viewingUser.employeeId || viewingUser.id}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9aa8bd]">Onboarding Date</span>
                    <span className="text-[#e6eef8] font-semibold">{viewingUser.dateOfJoining}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#9aa8bd]">Tier Classification</span>
                    <span className="text-emerald-400 font-black tracking-tight">{viewingUser.status.toUpperCase()}</span>
                  </div>
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
              <p className="text-xs text-[#9aa8bd] font-medium leading-tight">
                This request will be forwarded to the Super Admin for authorization.
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-wider">Target Identity</label>
              <div className="px-4 py-3 bg-[#0f172a] border border-[#1f2937] rounded-xl text-sm text-[#e6eef8] font-bold">
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
          <div className="relative bg-[#0b1220] border border-rose-500/20 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
              <ShieldAlert size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Direct Access Revocation</h3>
            <p className="text-[#9aa8bd] text-sm leading-relaxed mb-8">
              As Super Admin, you are directly terminating this specialist's system access. This action will deactivate the account instantly.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteId(null)} className="flex-1 py-4 bg-[#1f2937] text-[#9aa8bd] rounded-2xl font-bold hover:text-white transition-all active:scale-95">Cancel</button>
              <button
                onClick={() => { removeEmployee(confirmDeleteId); setConfirmDeleteId(null); }}
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
          <div className="relative bg-[#0b1220] border border-[#f37321]/20 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="w-20 h-20 bg-[#f37321]/10 text-[#f37321] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#f37321]/20">
              <TrendingUp size={40} />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Elevate Tier Status?</h3>
            <p className="text-[#9aa8bd] text-sm leading-relaxed mb-8">
              Promoting this record to Administrative Tier will grant system-wide management privileges. The portal will redirect to the Admin Registry.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmPromoteId(null)} className="flex-1 py-4 bg-[#1f2937] text-[#9aa8bd] rounded-2xl font-bold hover:text-white transition-all active:scale-95">Cancel</button>
              <button
                onClick={() => { promoteToAdmin(confirmPromoteId); setConfirmPromoteId(null); }}
                className="flex-1 py-4 bg-[#f37321] text-white rounded-2xl font-bold hover:bg-[#e06410] transition-all shadow-xl shadow-[#f37321]/20 active:scale-95"
              >
                Promote to Admin
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
        >
          <div className="space-y-10 pb-4">
            <div className="flex flex-col sm:flex-row items-center gap-8 p-8 bg-gradient-to-br from-[#0f172a] to-[#0b1220] rounded-[2rem] border border-[#1f2937] relative shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#f37321]/10 rounded-full -mr-24 -mt-24 blur-[80px]"></div>
              <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <div className="w-28 h-28 rounded-[2rem] border-4 border-[#1f2937] flex items-center justify-center bg-[#0f172a] shadow-2xl overflow-hidden group-hover:border-[#f37321]/50 transition-all">
                  <img src={formState.avatar} className="w-full h-full object-cover" alt="Profile" />
                </div>
                <div className="absolute -bottom-2 -right-2 p-3 bg-[#f37321] text-white rounded-2xl shadow-xl border-4 border-[#0b1220]">
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
                <h4 className="text-2xl font-black text-[#e6eef8] tracking-tight truncate max-w-[250px]">{formState.firstName} {formState.lastName}</h4>
                <p className="text-[#9aa8bd] text-sm font-bold uppercase tracking-widest bg-[#1f2937]/50 px-3 py-1 rounded-lg w-fit mx-auto sm:mx-0 mb-4 mt-2">{formState.designation}</p>
                <Badge color="blue">{formState.department?.toUpperCase()}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <FormInput label="First Name" value={formState.firstName} onChange={(val) => updateField('firstName', val)} />
              <FormInput label="Last Name" value={formState.lastName} onChange={(val) => updateField('lastName', val)} />
              <FormInput label="Employee ID" value={formState.employeeId} onChange={(val) => updateField('employeeId', val)} />
              <FormInput label="Designation" value={formState.designation} onChange={(val) => updateField('designation', val)} />
              <FormSelect label="Department" value={formState.department} onChange={(val) => updateField('department', val)} options={DEPARTMENTS} />
              <FormSelect label="Employment Model" value={formState.employmentType} onChange={(val) => updateField('employmentType', val)} options={EMPLOYMENT_TYPES} />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
