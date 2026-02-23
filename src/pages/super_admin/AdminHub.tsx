
import React, { useState, useMemo, useRef } from 'react';
import {
    ShieldCheck, UserPlus, Mail, Shield,
    RotateCcw, ShieldAlert, TrendingDown,
    ShieldQuestion, Fingerprint, Calendar,
    MoreVertical, CheckCircle2, ChevronRight,
    Smartphone, MapPin, Camera, Upload, Trash2
} from 'lucide-react';
import { User } from '../../types.tsx';
import { Badge, SectionHeader } from '../../components/super_admin/UI.tsx';
import { Modal } from '../../components/super_admin/Modal.tsx';
import { FormInput, FormSelect } from '../../components/super_admin/FormFields.tsx';
import { useApp } from '../../context/AppContext.tsx';

const EMPLOYMENT_TYPES = ['FULL_TIME', 'PART_TIME', 'CONTRACT'];

const EMPTY_ADMIN_STATE = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'ADMIN',
    employmentType: 'FULL_TIME',
    dateOfJoining: new Date().toISOString().split('T')[0],
};

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

    // Identity Dossier State
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    // Confirmation Modals State
    const [confirmDemoteId, setConfirmDemoteId] = useState<string | null>(null);
    const [confirmTerminateId, setConfirmTerminateId] = useState<string | null>(null);

    const statuses = ['All Statuses', 'active', 'inactive', 'pending'];
    const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

    const handleResetFilters = () => {
        setSelectedStatus('All Statuses');
    };

    const filteredAdmins = useMemo(() => {
        return admins.filter(a => {
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
        setFormState({
            firstName: admin.firstName || admin.name.split(' ')[0] || '',
            lastName: admin.lastName || admin.name.split(' ').slice(1).join(' ') || '',
            email: admin.email || '',
            password: '',
            role: admin.role || 'ADMIN',
            employmentType: (admin.employmentType as any) || 'FULL_TIME',
            dateOfJoining: admin.dateOfJoining || new Date().toISOString().split('T')[0],
        });
        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setFormState(EMPTY_ADMIN_STATE);
        setIsNew(true);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (isNew) {
            const newAdmin: User = {
                id: `adm-${Date.now()}`,
                name: `${formState.firstName} ${formState.lastName}`.trim(),
                firstName: formState.firstName,
                lastName: formState.lastName,
                email: formState.email,
                role: 'ADMIN',
                status: 'active',
                department: 'IT',
                avatar: `https://picsum.photos/seed/${formState.email || Date.now()}/200`,
                employmentType: formState.employmentType as any,
                dateOfJoining: formState.dateOfJoining,
                employeeId: (Math.floor(100000 + Math.random() * 900000)).toString(),
            };
            setAdmins(prev => [newAdmin, ...prev]);
        } else {
            setAdmins(prev => prev.map(a => a.id === editingId ? {
                ...a,
                firstName: formState.firstName,
                lastName: formState.lastName,
                name: `${formState.firstName} ${formState.lastName}`.trim(),
                email: formState.email,
                employmentType: formState.employmentType as any,
                dateOfJoining: formState.dateOfJoining,
            } : a));
        }
        setIsModalOpen(false);
    };

    const updateField = (field: keyof typeof EMPTY_ADMIN_STATE, value: any) => {
        setFormState(prev => ({ ...prev, [field]: value }));
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

    return (
        <div className="space-y-6">
            <SectionHeader
                title="Admin Hub"
                description="Manage system access, security tiers, and administrative privileges."
                actions={
                    <button
                        onClick={handleAddNew}
                        className="flex items-center justify-center gap-2 bg-[#f37321] px-5 py-3 rounded-xl text-sm font-bold shadow-2xl shadow-[#f37321]/20 hover:bg-[#e06410] transition-all transform hover:scale-[1.05] active:scale-[0.95] w-full sm:w-auto text-white"
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
                            <h3 className="text-lg font-black text-[#e6eef8] tracking-tight">Admin Privilege Termination</h3>
                            <p className="text-xs text-[#9aa8bd] font-medium uppercase tracking-widest">Only accessible by Super Admin Tier</p>
                        </div>
                    </div>
                    <p className="text-sm text-[#9aa8bd] mb-6 max-w-2xl leading-relaxed">
                        Directly deactivate administrator accounts to revoke all system-wide access instantly. This action is tracked in the audit logs and requires secondary verification.
                    </p>
                </div>
            )}

            {/* Filter Bar */}
            <div className="bg-[#0b1220]/50 p-4 rounded-2xl border border-[#1f2937] backdrop-blur-sm mb-6 flex flex-col sm:flex-row items-center gap-4">
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
                        className="h-[44px] px-4 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-all border border-rose-500/20 self-end mb-1"
                    >
                        <RotateCcw size={16} />
                    </button>
                )}
            </div>

            {/* Admins Table */}
            <div className="bg-[#0b1220] rounded-3xl border border-[#1f2937] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead className="bg-[#0f172a]/80 backdrop-blur-md border-b border-[#1f2937]">
                            <tr>
                                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Administrator Identity</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Security Tier</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Status</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Email Address</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Joining Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1f2937]">
                            {filteredAdmins.map((a) => (
                                <tr key={a.id} className={`hover:bg-[#0f172a] transition-all group border-l-2 border-transparent hover:border-emerald-500 ${a.status === 'inactive' ? 'opacity-50 grayscale' : ''}`}>
                                    <td className="px-8 py-5 cursor-pointer" onClick={() => setViewingUser(a)}>
                                        <div className="flex items-center gap-4">
                                            <div className="relative shrink-0">
                                                <img src={a.avatar} alt={a.name} className="w-12 h-12 rounded-xl border border-[#1f2937] shadow-xl group-hover:scale-105 transition-transform object-cover" />
                                                <Shield className={`absolute -bottom-1 -right-1 w-4 h-4 p-0.5 rounded-full border border-[#0b1220] ${a.role.includes('SUPER') ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'}`} />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-bold text-[#e6eef8] group-hover:text-[#f37321] transition-colors truncate">
                                                    {a.firstName ? `${a.firstName} ${a.lastName}` : a.name}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] text-[#9aa8bd] font-mono opacity-70">UID: {a.employeeId || a.id.toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge color={a.role.includes('SUPER') ? 'red' : 'green'}>{a.role.toUpperCase()}</Badge>
                                    </td>
                                    <td className="px-8 py-5">
                                        <Badge color={a.status === 'active' ? 'green' : a.status === 'pending' ? 'yellow' : 'red'}>{a.status.toUpperCase()}</Badge>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[11px] text-[#9aa8bd] font-mono bg-[#1f2937]/30 px-3 py-1.5 rounded-lg border border-[#1f2937]/50 w-fit group-hover:text-[#e6eef8] group-hover:border-[#f37321]/30 transition-all">
                                            <Mail size={12} className="text-[#f37321]" /> {a.email}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[11px] text-[#9aa8bd] font-bold">
                                            <Calendar size={12} className="text-[#f37321]" />
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
                                                        className="p-2.5 bg-[#f37321]/10 hover:bg-[#f37321] text-[#f37321] hover:text-white rounded-xl transition-all active:scale-90"
                                                    >
                                                        <TrendingDown size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmTerminateId(a.id)}
                                                        title="Directly Terminate Admin Access"
                                                        className="p-2.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-xl transition-all active:scale-90"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                            <button
                                                onClick={() => handleEdit(a)}
                                                title="Manage Security Tiers"
                                                className="p-2.5 bg-[#1f2937] hover:bg-emerald-500 text-[#9aa8bd] hover:text-white rounded-xl transition-all active:scale-90"
                                            >
                                                <ShieldCheck size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredAdmins.length === 0 && (
                        <div className="p-24 text-center flex flex-col items-center gap-4 bg-[#0b1220]">
                            <ShieldQuestion size={64} className="text-[#374151] animate-pulse" />
                            <div className="space-y-1">
                                <h4 className="text-[#e6eef8] font-bold text-lg">No Admins Found</h4>
                                <p className="text-[#9aa8bd] text-sm max-w-xs">Verify your search criteria or check the system logs.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Identity Dossier (Profile Page) */}
            {viewingUser && (
                <Modal
                    isOpen={!!viewingUser}
                    onClose={() => setViewingUser(null)}
                    title="Admin Identity Dossier"
                    onSave={() => setViewingUser(null)}
                >
                    <div className="space-y-8">
                        <div className="relative p-8 rounded-[2rem] bg-gradient-to-br from-[#1f2937] to-[#0b1220] border border-emerald-500/20 overflow-hidden shadow-2xl">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
                            <div className="flex flex-col items-center text-center">
                                <div className="relative mb-6">
                                    <img src={viewingUser.avatar} className="w-32 h-32 rounded-[2.5rem] border-4 border-[#0b1220] shadow-2xl object-cover" alt={viewingUser.name} />
                                    <div className={`absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl flex items-center justify-center border-4 border-[#0b1220] bg-emerald-500 shadow-lg`}>
                                        <Shield size={20} className="text-white" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-black text-[#e6eef8] tracking-tight">{viewingUser.name}</h3>
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
                                <div className="p-6 rounded-[1.5rem] bg-[#f37321]/5 border border-[#f37321]/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-[#f37321]/10 rounded-xl text-[#f37321]">
                                            <TrendingDown size={24} />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black text-[#e6eef8] tracking-tight">Access Demotion</h4>
                                            <p className="text-[10px] text-[#9aa8bd] font-medium uppercase tracking-widest">Target tier: Admin → Employee</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDemoteFromModal(viewingUser.id)}
                                        className="w-full sm:w-auto px-6 py-3 bg-[#f37321] text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-[#e06410] transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#f37321]/20 active:scale-95"
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
                                            <h4 className="text-sm font-black text-[#e6eef8] tracking-tight">Account Deactivation</h4>
                                            <p className="text-[10px] text-[#9aa8bd] font-medium uppercase tracking-widest">Terminate all administrative keys</p>
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
                            <div className="space-y-4 p-6 rounded-2xl bg-[#0f172a]/50 border border-[#1f2937]">
                                <h4 className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Smartphone size={14} className="text-emerald-500" /> Communication Channels
                                </h4>
                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#9aa8bd]">Admin Email</span>
                                        <span className="text-[#e6eef8] font-semibold">{viewingUser.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#9aa8bd]">Operational Location</span>
                                        <span className="text-[#e6eef8] font-medium">{viewingUser.location || 'Central Command Hub'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 p-6 rounded-2xl bg-[#0f172a]/50 border border-[#1f2937]">
                                <h4 className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-widest mb-2 flex items-center gap-2">
                                    <Fingerprint size={14} className="text-emerald-500" /> Security Context
                                </h4>
                                <div className="space-y-3 text-xs">
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#9aa8bd]">Security UID</span>
                                        <span className="text-emerald-400 font-mono font-bold tracking-tighter">{viewingUser.employeeId || viewingUser.id}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-[#9aa8bd]">Elevation Date</span>
                                        <span className="text-[#e6eef8] font-semibold">{viewingUser.dateOfJoining}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Confirmation Demote Modal */}
            {confirmDemoteId && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-[#020617]/95 backdrop-blur-md" onClick={() => setConfirmDemoteId(null)} />
                    <div className="relative bg-[#0b1220] border border-[#f37321]/20 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-[#f37321]/10 text-[#f37321] rounded-3xl flex items-center justify-center mx-auto mb-6 border border-[#f37321]/20">
                            <TrendingDown size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Revoke Admin Tiers?</h3>
                        <p className="text-[#9aa8bd] text-sm leading-relaxed mb-8">
                            You are about to demote this administrator to a standard Employee tier. They will lose all system-wide management privileges instantly and be moved to the Employee Hub.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmDemoteId(null)} className="flex-1 py-4 bg-[#1f2937] text-[#9aa8bd] rounded-2xl font-bold hover:text-white transition-all active:scale-95">Cancel</button>
                            <button
                                onClick={() => { demoteToEmployee(confirmDemoteId); setConfirmDemoteId(null); }}
                                className="flex-1 py-4 bg-[#f37321] text-white rounded-2xl font-bold hover:bg-[#e06410] transition-all shadow-xl shadow-[#f37321]/20 active:scale-95"
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
                    <div className="relative bg-[#0b1220] border border-rose-500/20 p-8 rounded-[2.5rem] max-w-md w-full text-center shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="w-20 h-20 bg-rose-500/10 text-rose-500 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
                            <Trash2 size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Deactivate Administrator?</h3>
                        <p className="text-[#9aa8bd] text-sm leading-relaxed mb-8">
                            This action will permanently terminate this administrator's system access. Their account status will be set to 'Terminated' (Inactive). This action is irreversible.
                        </p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmTerminateId(null)} className="flex-1 py-4 bg-[#1f2937] text-[#9aa8bd] rounded-2xl font-bold hover:text-white transition-all active:scale-95">Cancel</button>
                            <button
                                onClick={() => { terminateAdmin(confirmTerminateId); setConfirmTerminateId(null); }}
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
            >
                <div className="space-y-10 pb-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-gradient-to-br from-[#0f172a] to-[#0b1220] rounded-[2rem] border border-[#1f2937] relative shadow-2xl">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-2xl border-2 border-[#1f2937] flex items-center justify-center bg-[#0f172a] shadow-2xl overflow-hidden">
                                <img src={`https://picsum.photos/seed/${formState.email || 'admin'}/200`} className="w-full h-full object-cover" alt="Admin Avatar" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-2 bg-emerald-500 text-white rounded-lg shadow-lg border-2 border-[#0b1220]">
                                <Fingerprint size={16} />
                            </div>
                        </div>
                        <div className="flex-1 text-center sm:text-left">
                            <h4 className="text-2xl font-black text-[#e6eef8] tracking-tight mb-1">{formState.firstName || 'New'} {formState.lastName || 'Identity'}</h4>
                            <p className="text-[#9aa8bd] text-xs font-bold uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                                <ShieldCheck size={12} className="text-[#f37321]" /> Access Level: {formState.role}
                            </p>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-4">
                                <Badge color="blue">ADMINISTRATIVE PROTOCOL</Badge>
                                <Badge color="slate">{formState.employmentType}</Badge>
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
                        <FormInput label="First Name" value={formState.firstName} onChange={(val) => updateField('firstName', val)} placeholder="e.g. Shruthi" />
                        <FormInput label="Last Name" value={formState.lastName} onChange={(val) => updateField('lastName', val)} placeholder="e.g. Nandigama" />

                        <div className="md:col-span-2 mt-4">
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-px bg-emerald-500/30"></span>
                                Deployment Details
                            </h5>
                        </div>
                        <FormSelect label="Employment Model" value={formState.employmentType} onChange={(val) => updateField('employmentType', val)} options={EMPLOYMENT_TYPES} />
                        <FormInput label="Joining Date" type="date" value={formState.dateOfJoining} onChange={(val) => updateField('dateOfJoining', val)} />

                        <div className="md:col-span-2 mt-4">
                            <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-3">
                                <span className="w-8 h-px bg-emerald-500/30"></span>
                                Authentication Credentials
                            </h5>
                        </div>
                        <FormInput label="System Email" value={formState.email} onChange={(val) => updateField('email', val)} placeholder="shruthi@example.com" />
                        <FormInput label="Access Key (Password)" type="password" value={formState.password} onChange={(val) => updateField('password', val)} placeholder="••••••••••••" />
                    </div>

                    <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 items-start">
                        <ShieldAlert size={24} className="text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                            <h5 className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.1em] mb-1">Administrative Protocols</h5>
                            <p className="text-[10px] text-[#9aa8bd] leading-relaxed font-semibold">
                                Provisioning or modifying administrative access requires multi-factor authorization. Security authorization for this module is fixed to "ADMIN" by system policy.
                            </p>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};
