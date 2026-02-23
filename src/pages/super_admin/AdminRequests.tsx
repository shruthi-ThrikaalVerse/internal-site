
import React, { useState, useMemo, useRef } from 'react';
import {
  GitPullRequest, Check, X, Eye,
  Calendar, User, FileText, Info,
  AlertCircle, ShieldAlert, UserPlus, Trash2, Clock
} from 'lucide-react';
import { AdminRequest, User as UserType } from '../../types.tsx';
import { Badge, SectionHeader } from '../../components/super_admin/UI.tsx';
import { Modal } from '../../components/super_admin/Modal.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { FormInput, FormSelect, FormTextArea } from '../../components/super_admin/FormFields.tsx';

export const AdminRequests = () => {
  const { requests, processRequest, currentUser, addEmployee, employees } = useApp();
  const [viewingRequest, setViewingRequest] = useState<AdminRequest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    designation: ''
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  const filteredRequests = useMemo(() => {
    return requests.sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return 0;
    });
  }, [requests]);

  const handleAction = (id: string, status: 'Approved' | 'Rejected') => {
    processRequest(id, status);
    setViewingRequest(null);
  };

  const handleRecruitmentProcessing = (request: AdminRequest) => {
    setNewEmployeeForm({
      firstName: '',
      lastName: '',
      email: '',
      department: 'Engineering',
      designation: request.details.split('Senior ')[1]?.split(' Engineer')[0] || ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddEmployee = () => {
    const newUser: UserType = {
      id: `emp-${Date.now()}`,
      name: `${newEmployeeForm.firstName} ${newEmployeeForm.lastName}`,
      email: newEmployeeForm.email,
      role: 'Employee',
      avatar: `https://picsum.photos/seed/${newEmployeeForm.email}/200`,
      status: 'active',
      department: newEmployeeForm.department,
      designation: newEmployeeForm.designation,
      dateOfJoining: new Date().toISOString().split('T')[0],
      leaveBalance: 15
    };
    addEmployee(newUser);
    setIsAddModalOpen(false);
    // Mark recruitment request as fulfilled? Could add a custom status but Approved is fine for now
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Admin Requests"
        description="Review and process administrative workflows initiated by department heads."
      />

      <div className="bg-[#0b1220] rounded-3xl border border-[#1f2937] overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-[#0f172a]/80 backdrop-blur-md border-b border-[#1f2937]">
              <tr>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Request ID & Type</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Initiated By</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Submission Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Target Entity</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-[#9aa8bd] uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {filteredRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#0f172a] transition-all group border-l-2 border-transparent hover:border-[#f37321]">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl border ${req.type === 'Termination' ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-[#f37321]/10 border-[#f37321]/20 text-[#f37321]'}`}>
                        <GitPullRequest size={18} />
                      </div>
                      <div>
                        <div className="font-bold text-[#e6eef8] tracking-tight">{req.type}</div>
                        <div className="text-[10px] font-mono text-[#9aa8bd]">{req.id.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-[#e6eef8] font-semibold">
                      <User size={14} className="text-[#9aa8bd]" /> {req.requestedBy}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm text-[#9aa8bd]">
                      <Calendar size={14} /> {req.date}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="text-sm font-medium text-[#e6eef8]">
                      {req.targetId ? employees.find(e => e.id === req.targetId)?.name || 'N/A' : 'New Candidate'}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <Badge color={req.status === 'Approved' ? 'green' : req.status === 'Rejected' ? 'red' : 'yellow'}>
                      {req.status.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewingRequest(req)}
                        className="p-2.5 bg-[#1f2937] text-[#9aa8bd] hover:text-[#e6eef8] rounded-xl transition-all"
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>

                      {isSuperAdmin && req.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => handleAction(req.id, 'Approved')}
                            className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-90"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleAction(req.id, 'Rejected')}
                            className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-90"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </>
                      )}

                      {isSuperAdmin && req.status === 'Approved' && req.type === 'Recruitment' && (
                        <button
                          onClick={() => handleRecruitmentProcessing(req)}
                          className="px-4 py-2 bg-[#f37321] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#e06410] transition-all flex items-center gap-2"
                        >
                          <UserPlus size={14} /> Hire Now
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

      {/* Request Details Modal */}
      {viewingRequest && (
        <Modal
          isOpen={!!viewingRequest}
          onClose={() => setViewingRequest(null)}
          title={`${viewingRequest.type} Request Details`}
          onSave={() => setViewingRequest(null)}
        >
          <div className="space-y-8 pb-4">
            <div className={`p-6 rounded-[2rem] border overflow-hidden relative shadow-2xl ${viewingRequest.type === 'Termination' ? 'bg-rose-500/5 border-rose-500/20' : 'bg-[#f37321]/5 border-[#f37321]/20'}`}>
              <div className="flex items-start gap-6">
                <div className={`p-5 rounded-2xl ${viewingRequest.type === 'Termination' ? 'bg-rose-500/10 text-rose-500' : 'bg-[#f37321]/10 text-[#f37321]'}`}>
                  {viewingRequest.type === 'Termination' ? <Trash2 size={32} /> : viewingRequest.type === 'Promotion' ? <UserPlus size={32} /> : <Calendar size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-[#e6eef8] tracking-tight">{viewingRequest.type}</h3>
                  <p className="text-[10px] text-[#9aa8bd] font-black uppercase tracking-widest mt-1">Submission Reference: {viewingRequest.id}</p>
                  <div className="flex gap-2 mt-4">
                    <Badge color={viewingRequest.status === 'Approved' ? 'green' : viewingRequest.status === 'Rejected' ? 'red' : 'yellow'}>
                      {viewingRequest.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 rounded-2xl bg-[#0f172a]/50 border border-[#1f2937]">
                <h4 className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-[#f37321]" /> Initiator Context
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#9aa8bd]">Requested By</span>
                    <span className="text-[#e6eef8] font-bold">{viewingRequest.requestedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9aa8bd]">Request Date</span>
                    <span className="text-[#e6eef8] font-bold">{viewingRequest.date}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-[#0f172a]/50 border border-[#1f2937]">
                <h4 className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-[#f37321]" /> Target Context
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-[#9aa8bd]">Target Employee</span>
                    <span className="text-[#e6eef8] font-bold">
                      {viewingRequest.targetId ? employees.find(e => e.id === viewingRequest.targetId)?.name || 'N/A' : 'External Vacancy'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#0f172a]/50 border border-[#1f2937]">
              <h4 className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-widest flex items-center gap-2 mb-4">
                <FileText size={14} className="text-[#f37321]" /> Justification & Details
              </h4>
              <p className="text-sm text-[#e6eef8] leading-relaxed italic">
                "{viewingRequest.details}"
              </p>
            </div>

            {isSuperAdmin && viewingRequest.status === 'Pending' && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleAction(viewingRequest.id, 'Approved')}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Authorize Request
                </button>
                <button
                  onClick={() => handleAction(viewingRequest.id, 'Rejected')}
                  className="flex-1 py-4 bg-[#1f2937] text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 active:scale-95 transition-all"
                >
                  Decline
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Recruitment Onboarding Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Provision New Employee Identity"
        onSave={handleAddEmployee}
      >
        <div className="space-y-10 pb-4">
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex gap-4 items-center">
            <UserPlus size={24} className="text-emerald-500" />
            <p className="text-xs text-[#9aa8bd] font-medium leading-relaxed">
              Onboarding authorized based on approved recruitment requisition.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormInput label="First Name" value={newEmployeeForm.firstName} onChange={(val) => setNewEmployeeForm({ ...newEmployeeForm, firstName: val })} />
            <FormInput label="Last Name" value={newEmployeeForm.lastName} onChange={(val) => setNewEmployeeForm({ ...newEmployeeForm, lastName: val })} />
            <FormInput label="Official Email" value={newEmployeeForm.email} onChange={(val) => setNewEmployeeForm({ ...newEmployeeForm, email: val })} />
            <FormInput label="Designation" value={newEmployeeForm.designation} onChange={(val) => setNewEmployeeForm({ ...newEmployeeForm, designation: val })} />
            <FormSelect label="Department" value={newEmployeeForm.department} onChange={(val) => setNewEmployeeForm({ ...newEmployeeForm, department: val })} options={['Engineering', 'Design', 'Marketing', 'People', 'Infrastructure']} />
          </div>
        </div>
      </Modal>
    </div>
  );
};
