import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  GitPullRequest, Check, X, Eye,
  Calendar, User, FileText, Info,
  AlertCircle, ShieldAlert, UserPlus, Trash2, Clock, Loader2
} from 'lucide-react';
import { AdminRequest, User as UserType } from '../../types.tsx';
import { Badge, SectionHeader } from './UI.tsx';
import { Modal } from '../../components/super_admin/Modal.tsx';
import { useApp } from '../../context/AppContext.tsx';
import { FormInput, FormSelect, FormTextArea } from '../../components/super_admin/FormFields.tsx';
import { getPendingResignations, approveResignation, rejectResignation } from '../../api/resignations.js';

interface PendingEmployee {
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  userType: string;
  department: string;
  createdByEmail: string;
  createdByName: string;
  createdAt: string;
}

interface LeaveRequest {
  leaveId: number;
  employeeId: string;
  firstName: string;
  lastName: string;
  department: string;
  profileImage: string | null;
  category: string;
  startDate: string;
  endDate: string;
  duration: string;
  reason: string;
  status: string;
  appliedDate: string;
}

interface TerminationRequest {
  requestId: number;
  employeeId: string;
  employeeName: string;
  reason: string;
  status: string;
  createdAt: string;
  requestedBy: string;
  requestedByName: string;
}

interface ResignationRequest {
  id: number;
  employeeId: string;
  resignationDate: string;
  lastWorkingDate: string;
  approvedBy: string;
  approvedByName: string;
  approvedByEmail: string;
  noticePeriod: string;
  reason: string;
  detailedReason: string;
  contactEmail: string;
  contactPhone: string;
  status: string;
  createdAt: string;
}

export const AdminRequests = () => {
  const { requests, processRequest, currentUser, addEmployee, employees } = useApp();
  const [activeSection, setActiveSection] = useState<'leave' | 'employee' | 'termination' | 'resignation'>('leave');
  const [viewingRequest, setViewingRequest] = useState<AdminRequest | null>(null);
  const [viewingPendingEmployee, setViewingPendingEmployee] = useState<PendingEmployee | null>(null);
  const [viewingLeaveRequest, setViewingLeaveRequest] = useState<LeaveRequest | null>(null);
  const [viewingTerminationRequest, setViewingTerminationRequest] = useState<TerminationRequest | null>(null);
  const [viewingResignationRequest, setViewingResignationRequest] = useState<ResignationRequest | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingEmployees, setPendingEmployees] = useState<PendingEmployee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [terminationRequests, setTerminationRequests] = useState<TerminationRequest[]>([]);
  const [resignationRequests, setResignationRequests] = useState<ResignationRequest[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isLoadingLeave, setIsLoadingLeave] = useState(false);
  const [isLoadingTermination, setIsLoadingTermination] = useState(false);
  const [isLoadingResignation, setIsLoadingResignation] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    designation: ''
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // Handler for leave request approval/rejection
  const handleLeaveRequestAction = async (leave: LeaveRequest, status: 'Approved' | 'Rejected') => {
    try {
      const statusParam = status === 'Approved' ? 'APPROVED' : 'REJECTED';
      const response = await fetch(
        `http://localhost:8085/leave-requests/update-status/${leave.leaveId}?status=${statusParam}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );

      if (response.ok) {
        setLeaveRequests((prev) => prev.filter((req) => req.leaveId !== leave.leaveId));
        setViewingLeaveRequest(null);
        alert(`Leave request ${status === 'Approved' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert('Failed to update leave request status');
      }
    } catch (err) {
      console.error('Error updating leave request:', err);
      alert('Error updating leave request status');
    }
  };

  // Handler for termination request approval/rejection
  const handleTerminationRequestAction = async (termination: TerminationRequest, status: 'Approved' | 'Rejected') => {
    try {
      const endpoint = status === 'Approved'
        ? `http://localhost:8085/api/admin-hub/approve/${termination.requestId}`
        : `http://localhost:8085/api/admin-hub/reject/${termination.requestId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        setTerminationRequests((prev) => prev.filter((req) => req.requestId !== termination.requestId));
        setViewingTerminationRequest(null);
        alert(`Termination request ${status === 'Approved' ? 'approved' : 'rejected'} successfully!`);
      } else {
        alert('Failed to update termination request status');
      }
    } catch (err) {
      console.error('Error updating termination request:', err);
      alert('Error updating termination request status');
    }
  };

  // Handler for resignation request approval/rejection
  const handleResignationRequestAction = async (resignation: ResignationRequest, status: 'Approved' | 'Rejected') => {
    try {
      if (status === 'Approved') {
        await approveResignation(resignation.id);
      } else {
        await rejectResignation(resignation.id);
      }
      setResignationRequests((prev) => prev.filter((req) => req.id !== resignation.id));
      setViewingResignationRequest(null);
      alert(`Resignation request ${status === 'Approved' ? 'approved' : 'rejected'} successfully!`);
    } catch (err) {
      console.error('Error updating resignation request:', err);
      alert('Error updating resignation request status');
    }
  };

  // Fetch termination requests from backend
  useEffect(() => {
    const fetchTerminationRequests = async () => {
      setIsLoadingTermination(true);
      try {
        const response = await fetch('http://localhost:8085/api/admin-hub/termination-requests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();
        console.log('Termination Requests Response:', data);

        if (response.ok) {
          let fetchedRequests: TerminationRequest[] = [];
          if (Array.isArray(data)) {
            fetchedRequests = data;
          } else if (data && typeof data === 'object') {
            fetchedRequests = [data];
          }
          setTerminationRequests(fetchedRequests);
        } else {
          console.error('Failed to fetch termination requests:', data);
          setTerminationRequests([]);
        }
      } catch (err) {
        console.error('Error fetching termination requests:', err);
        setTerminationRequests([]);
      } finally {
        setIsLoadingTermination(false);
      }
    };

    if (isSuperAdmin) {
      fetchTerminationRequests();
    }
  }, [isSuperAdmin]);

  // Fetch pending employee requests from backend
  useEffect(() => {
    const fetchPendingEmployees = async () => {
      setIsLoadingPending(true);
      try {
        const response = await fetch('http://localhost:8085/api/users/super_admin/pending', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const data = await response.json();
        console.log('Pending Employees Response:', data);

        if (response.ok) {
          // Handle both single object and array responses
          let employees: PendingEmployee[] = [];
          if (Array.isArray(data)) {
            employees = data;
          } else if (data && typeof data === 'object') {
            employees = [data];
          }

          // Remove duplicates by employeeId
          const uniqueEmployees = Array.from(
            new Map(employees.map(emp => [emp.employeeId, emp])).values()
          );

          setPendingEmployees(uniqueEmployees);
        } else {
          console.error('Failed to fetch pending employees:', data);
          setPendingEmployees([]);
        }
      } catch (err) {
        console.error('Error fetching pending employees:', err);
        setPendingEmployees([]);
      } finally {
        setIsLoadingPending(false);
      }
    };

    if (isSuperAdmin) {
      fetchPendingEmployees();
      // Load once on mount only
    }
  }, [isSuperAdmin]);

  // Fetch resignation requests for Super Admin
  useEffect(() => {
    const fetchSuperAdminResignations = async () => {
      setIsLoadingResignation(true);
      try {
        const response = await getPendingResignations();
        console.log('Super Admin Resignation Requests:', response);
        setResignationRequests(response);
      } catch (err) {
        console.error('Error fetching super admin resignation requests:', err);
        setResignationRequests([]);
      } finally {
        setIsLoadingResignation(false);
      }
    };

    if (isSuperAdmin) {
      fetchSuperAdminResignations();
    }
  }, [isSuperAdmin]);

  // Fetch leave requests from backend
  useEffect(() => {
    const fetchLeaveRequests = async () => {
      setIsLoadingLeave(true);
      try {
        const response = await fetch('http://localhost:8085/leave-requests/pending', {
          method: 'GET',
          credentials: 'include',
        });

        if (!response.ok) {
          console.error(`Failed to fetch leave requests: ${response.status} ${response.statusText}`);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Leave Requests Data:', data);

        if (Array.isArray(data)) {
          setLeaveRequests(data);
        } else if (data && typeof data === 'object') {
          setLeaveRequests([data]);
        } else {
          console.error('Unexpected response shape:', data);
          setLeaveRequests([]);
        }
      } catch (err) {
        console.error('Error fetching leave requests:', err);
        setLeaveRequests([]);
      } finally {
        setIsLoadingLeave(false);
      }
    };

    if (isSuperAdmin) {
      fetchLeaveRequests();
    }
  }, [isSuperAdmin]);

  const handleApprovePendingEmployee = async (employee: PendingEmployee) => {
    setIsApproving(true);
    try {
      const approveData = {
        employeeId: employee.employeeId,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        username: (employee.firstName + employee.lastName).toUpperCase(),
        userType: employee.userType,
        designation: '',
        department: employee.department,
        role: employee.role,
        dateOfJoining: new Date().toISOString().split('T')[0],
        phoneNumber: '',
        address: '',
        createdByEmployeeId: currentUser?.employeeId || '',
        createdByRole: currentUser?.role || '',
        createdByName: currentUser?.name || '',
        hrEmployeeId: null,
        profileImage: null
      };

      const response = await fetch(`http://localhost:8085/api/users/super_admin/approve/${employee.employeeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(approveData),
      });

      const result = await response.json();
      console.log('Approve Employee Response:', result);

      if (response.ok) {
        console.log('Employee approved successfully:', result);
        // Remove approved employee from pending list
        setPendingEmployees(prev => prev.filter(e => e.employeeId !== employee.employeeId));
        setViewingPendingEmployee(null);
        alert(`${employee.firstName} ${employee.lastName} has been approved!`);
      } else {
        console.error('Failed to approve employee:', result);
        alert(result.message || 'Failed to approve employee');
      }
    } catch (err) {
      console.error('Error approving employee:', err);
      alert('An error occurred while approving the employee');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRejectPendingEmployee = async (employee: PendingEmployee) => {
    setIsApproving(true);
    try {
      const reason = prompt('Please provide a reason for rejection (optional):');

      const response = await fetch(
        `http://localhost:8085/api/users/super_admin/reject/${employee.employeeId}?reason=${encodeURIComponent(reason || '')}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      const result = await response.json();
      console.log('Reject Employee Response:', result);

      if (response.ok) {
        console.log('Employee rejected successfully:', result);
        // Remove rejected employee from pending list
        setPendingEmployees(prev => prev.filter(e => e.employeeId !== employee.employeeId));
        setViewingPendingEmployee(null);
        alert(`${employee.firstName} ${employee.lastName} has been rejected successfully.`);
      } else {
        console.error('Failed to reject employee:', result);
        alert(result.message || 'Failed to reject employee');
      }
    } catch (err) {
      console.error('Error rejecting employee:', err);
      alert('An error occurred while rejecting the employee');
    } finally {
      setIsApproving(false);
    }
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

      {/* Section Tabs */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-md">
        <div className="flex flex-wrap border-b border-gray-200">
          <button
            onClick={() => setActiveSection('leave')}
            className={`flex-1 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeSection === 'leave'
                ? 'bg-blue-600 text-white border-b-2 border-blue-600'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Calendar size={16} />
            Leave Approval ({leaveRequests.length})
          </button>
          <button
            onClick={() => setActiveSection('employee')}
            className={`flex-1 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeSection === 'employee'
                ? 'bg-amber-600 text-white border-b-2 border-amber-600'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UserPlus size={16} />
            Approve Employee ({pendingEmployees.length})
          </button>
          <button
            onClick={() => setActiveSection('termination')}
            className={`flex-1 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeSection === 'termination'
                ? 'bg-rose-600 text-white border-b-2 border-rose-600'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Trash2 size={16} />
            Terminate Employee ({terminationRequests.length})
          </button>
          <button
            onClick={() => setActiveSection('resignation')}
            className={`flex-1 px-6 py-4 text-sm font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              activeSection === 'resignation'
                ? 'bg-purple-600 text-white border-b-2 border-purple-600'
                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FileText size={16} />
            Resignation Request ({resignationRequests.length})
          </button>
        </div>

        {/* Section Content */}
        <div className="p-6">
          {/* Leave Approval Section */}
          {activeSection === 'leave' && (
            <div className="space-y-4">
              {isLoadingLeave ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
                  <p className="text-gray-600 mt-2">Loading leave requests...</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar size={32} className="mx-auto opacity-50 mb-2" />
                  <p>No pending leave requests</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {leaveRequests.map((leave) => (
                    <div
                      key={leave.leaveId}
                      onClick={() => setViewingLeaveRequest(leave)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">{leave.firstName} {leave.lastName}</h3>
                            <Badge color="blue">{leave.department}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">ID: {leave.employeeId} • {leave.category}</p>
                          <p className="text-xs text-gray-500">{leave.startDate} to {leave.endDate} ({leave.duration})</p>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-1">Reason: {leave.reason}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge color={leave.status === 'Pending' ? 'yellow' : leave.status === 'Approved' ? 'green' : 'red'}>
                            {leave.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Employee Approval Section */}
          {activeSection === 'employee' && (
            <div className="space-y-4">
              {isLoadingPending ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-600" />
                  <p className="text-gray-600 mt-2">Loading employee requests...</p>
                </div>
              ) : pendingEmployees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <UserPlus size={32} className="mx-auto opacity-50 mb-2" />
                  <p>No pending employee approvals</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {pendingEmployees.map((employee) => (
                    <div
                      key={employee.employeeId}
                      onClick={() => setViewingPendingEmployee(employee)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-amber-400 hover:bg-amber-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">{employee.firstName} {employee.lastName}</h3>
                            <Badge color="amber">{employee.department}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">ID: {employee.employeeId} • {employee.role}</p>
                          <p className="text-xs text-gray-500">Email: {employee.email}</p>
                          <p className="text-xs text-gray-500 mt-1">Created by: {employee.createdByName}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge color="yellow">PENDING</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Termination Request Section */}
          {activeSection === 'termination' && (
            <div className="space-y-4">
              {isLoadingTermination ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-600" />
                  <p className="text-gray-600 mt-2">Loading termination requests...</p>
                </div>
              ) : terminationRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Trash2 size={32} className="mx-auto opacity-50 mb-2" />
                  <p>No pending termination requests</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {terminationRequests.map((termination) => (
                    <div
                      key={termination.requestId}
                      onClick={() => setViewingTerminationRequest(termination)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-rose-400 hover:bg-rose-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">{termination.employeeName}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">ID: {termination.employeeId} • Requested by: {termination.requestedByName}</p>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">Reason: {termination.reason}</p>
                          <p className="text-xs text-gray-500 mt-2">Date: {new Date(termination.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge color={termination.status === 'PENDING' ? 'yellow' : termination.status === 'APPROVED' ? 'green' : 'red'}>
                            {termination.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Resignation Request Section */}
          {activeSection === 'resignation' && (
            <div className="space-y-4">
              {isLoadingResignation ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
                  <p className="text-gray-600 mt-2">Loading resignation requests...</p>
                </div>
              ) : resignationRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={32} className="mx-auto opacity-50 mb-2" />
                  <p>No pending resignation requests</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {resignationRequests.map((resignation) => (
                    <div
                      key={resignation.id}
                      onClick={() => setViewingResignationRequest(resignation)}
                      className="p-4 border border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 cursor-pointer transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-gray-900">Employee ID: {resignation.employeeId}</h3>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Resignation Date: {resignation.resignationDate} • Last Working: {resignation.lastWorkingDate}</p>
                          <p className="text-sm text-gray-700 mt-1 line-clamp-2">Reason: {resignation.reason}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge color="blue">{resignation.noticePeriod}</Badge>
                            <Badge color="blue">{resignation.contactEmail}</Badge>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <Badge color={resignation.status === 'PENDING_SUPER_ADMIN' ? 'yellow' : resignation.status === 'APPROVED' ? 'green' : 'red'}>
                            {resignation.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Leave Request Details Modal */}
      {viewingLeaveRequest && (
        <Modal
          isOpen={!!viewingLeaveRequest}
          onClose={() => setViewingLeaveRequest(null)}
          title={`Leave Request - ${viewingLeaveRequest.firstName} ${viewingLeaveRequest.lastName}`}
          onSave={() => setViewingLeaveRequest(null)}
        >
          <div className="space-y-6 pb-4">
            <div className="p-6 rounded-2xl bg-blue-50 border border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Employee Name</p>
                  <p className="text-lg font-black text-gray-900">{viewingLeaveRequest.firstName} {viewingLeaveRequest.lastName}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Employee ID</p>
                  <p className="text-lg font-black text-gray-900 font-mono">{viewingLeaveRequest.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Department</p>
                  <p className="text-lg font-bold text-gray-900">{viewingLeaveRequest.department}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Status</p>
                  <Badge color={viewingLeaveRequest.status === 'Pending' ? 'yellow' : viewingLeaveRequest.status === 'Approved' ? 'green' : 'red'}>
                    {viewingLeaveRequest.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4">
              <div>
                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Leave Category</p>
                <p className="text-base font-bold text-gray-900">{viewingLeaveRequest.category}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Start Date</p>
                  <p className="text-base font-bold text-gray-900">{viewingLeaveRequest.startDate}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">End Date</p>
                  <p className="text-base font-bold text-gray-900">{viewingLeaveRequest.endDate}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Duration</p>
                <p className="text-base font-bold text-gray-900">{viewingLeaveRequest.duration}</p>
              </div>
              <div>
                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Reason</p>
                <p className="text-sm text-gray-700 leading-relaxed">{viewingLeaveRequest.reason}</p>
              </div>
              <div>
                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Applied Date</p>
                <p className="text-sm text-gray-700">{new Date(viewingLeaveRequest.appliedDate).toLocaleDateString()} {new Date(viewingLeaveRequest.appliedDate).toLocaleTimeString()}</p>
              </div>
            </div>

            {isSuperAdmin && viewingLeaveRequest.status === 'Pending' && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleLeaveRequestAction(viewingLeaveRequest, 'Approved')}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
                >
                  <Check size={18} className="inline mr-2" />
                  Approve Leave
                </button>
                <button
                  onClick={() => handleLeaveRequestAction(viewingLeaveRequest, 'Rejected')}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all"
                >
                  <X size={18} className="inline mr-2" />
                  Reject Leave
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Termination Request Details Modal */}
      {viewingTerminationRequest && (
        <Modal
          isOpen={!!viewingTerminationRequest}
          onClose={() => setViewingTerminationRequest(null)}
          title={`Termination Request - ${viewingTerminationRequest.employeeName}`}
          onSave={() => setViewingTerminationRequest(null)}
        >
          <div className="space-y-6 pb-4">
            <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Employee Name</p>
                  <p className="text-lg font-black text-gray-900">{viewingTerminationRequest.employeeName}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Employee ID</p>
                  <p className="text-lg font-black text-gray-900 font-mono">{viewingTerminationRequest.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Requested By</p>
                  <p className="text-lg font-bold text-gray-900">{viewingTerminationRequest.requestedByName}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Status</p>
                  <Badge color={viewingTerminationRequest.status === 'PENDING' ? 'yellow' : viewingTerminationRequest.status === 'APPROVED' ? 'green' : 'red'}>
                    {viewingTerminationRequest.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200 space-y-4">
              <div>
                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Termination Reason</p>
                <p className="text-sm text-gray-700 leading-relaxed">{viewingTerminationRequest.reason}</p>
              </div>
              <div>
                <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Request Date</p>
                <p className="text-sm text-gray-700">{new Date(viewingTerminationRequest.createdAt).toLocaleDateString()} {new Date(viewingTerminationRequest.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>

            {isSuperAdmin && viewingTerminationRequest.status === 'PENDING' && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleTerminationRequestAction(viewingTerminationRequest, 'Approved')}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
                >
                  <Check size={18} className="inline mr-2" />
                  Approve Termination
                </button>
                <button
                  onClick={() => handleTerminationRequestAction(viewingTerminationRequest, 'Rejected')}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all"
                >
                  <X size={18} className="inline mr-2" />
                  Reject Termination
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Resignation Request Details Modal */}
      {viewingResignationRequest && (
        <Modal
          isOpen={!!viewingResignationRequest}
          onClose={() => setViewingResignationRequest(null)}
          title={`Resignation Request - Employee ${viewingResignationRequest.employeeId}`}
          onSave={() => setViewingResignationRequest(null)}
        >
          <div className="space-y-6 pb-4">
            <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Employee ID</p>
                  <p className="text-lg font-black text-gray-900 font-mono">{viewingResignationRequest.employeeId}</p>
                </div>
                <div>
                  <p className="text-xs font-black text-gray-700 uppercase tracking-widest mb-1">Status</p>
                  <Badge color={viewingResignationRequest.status === 'PENDING_SUPER_ADMIN' ? 'yellow' : viewingResignationRequest.status === 'APPROVED' ? 'green' : 'red'}>
                    {viewingResignationRequest.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4">Resignation Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Resignation Date</p>
                    <p className="text-base font-bold text-gray-900">{viewingResignationRequest.resignationDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Last Working Date</p>
                    <p className="text-base font-bold text-gray-900">{viewingResignationRequest.lastWorkingDate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Notice Period</p>
                    <p className="text-base font-bold text-gray-900">{viewingResignationRequest.noticePeriod}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Application Date</p>
                    <p className="text-base font-bold text-gray-900">{new Date(viewingResignationRequest.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4">Resignation Reason</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Primary Reason</p>
                    <p className="text-sm text-gray-700">{viewingResignationRequest.reason}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Detailed Reason</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{viewingResignationRequest.detailedReason}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4">Contact Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Email</p>
                    <p className="text-sm text-gray-700 break-all">{viewingResignationRequest.contactEmail}</p>
                  </div>
                  <div>
                    <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Phone</p>
                    <p className="text-sm text-gray-700">{viewingResignationRequest.contactPhone}</p>
                  </div>
                </div>
              </div>

              {viewingResignationRequest.approvedBy && (
                <div className="p-6 rounded-2xl bg-white border border-gray-200">
                  <h4 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-4">Approval Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Approved By Name</p>
                      <p className="text-sm text-gray-700">{viewingResignationRequest.approvedByName}</p>
                    </div>
                    <div>
                      <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-1">Approved By Email</p>
                      <p className="text-sm text-gray-700 break-all">{viewingResignationRequest.approvedByEmail}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {isSuperAdmin && viewingResignationRequest.status === 'PENDING_SUPER_ADMIN' && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleResignationRequestAction(viewingResignationRequest, 'Approved')}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all"
                >
                  <Check size={18} className="inline mr-2" />
                  Approve Resignation
                </button>
                <button
                  onClick={() => handleResignationRequestAction(viewingResignationRequest, 'Rejected')}
                  className="flex-1 py-4 bg-rose-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-600 transition-all"
                >
                  <X size={18} className="inline mr-2" />
                  Reject Resignation
                </button>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Pending Employee Details Modal */}
      {viewingPendingEmployee && (
        <Modal
          isOpen={!!viewingPendingEmployee}
          onClose={() => setViewingPendingEmployee(null)}
          title={`Employee Approval: ${viewingPendingEmployee.firstName} ${viewingPendingEmployee.lastName}`}
          onSave={() => setViewingPendingEmployee(null)}
          isLoading={isApproving}
        >
          <div className="space-y-8 pb-4">
            <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-200 overflow-hidden relative shadow-2xl">
              <div className="flex items-start gap-6">
                <div className="p-5 rounded-2xl bg-amber-500/10 text-amber-600">
                  <UserPlus size={32} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{viewingPendingEmployee.firstName} {viewingPendingEmployee.lastName}</h3>
                  <p className="text-[10px] text-gray-900 font-black uppercase tracking-widest mt-1">Status: Pending Approval</p>
                  <div className="flex gap-2 mt-4">
                    <Badge color="yellow">PENDING</Badge>
                    <Badge color="blue">{viewingPendingEmployee.role}</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-blue-600" /> Employee Details
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">First Name</span>
                    <span className="text-gray-900 font-bold">{viewingPendingEmployee.firstName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Name</span>
                    <span className="text-gray-900 font-bold">{viewingPendingEmployee.lastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Employee ID</span>
                    <span className="text-gray-900 font-mono font-bold">{viewingPendingEmployee.employeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Email</span>
                    <span className="text-gray-900 font-semibold">{viewingPendingEmployee.email}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-blue-600" /> Assignment Details
                </h4>
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department</span>
                    <span className="text-gray-900 font-bold">{viewingPendingEmployee.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Role</span>
                    <span className="text-gray-900 font-bold">{viewingPendingEmployee.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Employment Type</span>
                    <span className="text-gray-900 font-bold">{viewingPendingEmployee.userType}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200">
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                <FileText size={14} className="text-blue-600" /> Creation Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 mb-1">Created By</p>
                  <p className="text-gray-900 font-semibold">{viewingPendingEmployee.createdByName}</p>
                  <p className="text-gray-500 text-[10px]">{viewingPendingEmployee.createdByEmail}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Created At</p>
                  <p className="text-gray-900 font-semibold">{new Date(viewingPendingEmployee.createdAt).toLocaleDateString()}</p>
                  <p className="text-gray-500 text-[10px]">{new Date(viewingPendingEmployee.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => handleApprovePendingEmployee(viewingPendingEmployee)}
                disabled={isApproving}
                className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isApproving ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                {isApproving ? 'Approving...' : 'Approve Employee'}
              </button>
              <button
                onClick={() => handleRejectPendingEmployee(viewingPendingEmployee)}
                disabled={isApproving}
                className="flex-1 py-4 bg-[#1f2937] text-rose-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 active:scale-95 transition-all disabled:opacity-50"
              >
                Reject
              </button>
            </div>
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
          <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl flex gap-4 items-center">
            <UserPlus size={24} className="text-emerald-500" />
            <p className="text-xs text-gray-900 font-medium leading-relaxed">
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