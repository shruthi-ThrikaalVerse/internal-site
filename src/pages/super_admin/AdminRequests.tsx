
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

export const AdminRequests = () => {
  const { requests, processRequest, currentUser, addEmployee, employees } = useApp();
  const [viewingRequest, setViewingRequest] = useState<AdminRequest | null>(null);
  const [viewingPendingEmployee, setViewingPendingEmployee] = useState<PendingEmployee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [pendingEmployees, setPendingEmployees] = useState<PendingEmployee[]>([]);
  const [isLoadingPending, setIsLoadingPending] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [newEmployeeForm, setNewEmployeeForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: 'Engineering',
    designation: ''
  });

  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';

  // State for backend termination requests
  const [terminationRequests, setTerminationRequests] = useState<AdminRequest[]>([]);
  const [isLoadingTerminationRequests, setIsLoadingTerminationRequests] = useState(false);

  // Fetch termination requests from backend
  useEffect(() => {
    const fetchTerminationRequests = async () => {
      setIsLoadingTerminationRequests(true);
      try {
        const response = await fetch('http://localhost:8085/api/admin-hub/termination-requests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        const data = await response.json();
        console.log('Termination Requests Response:', data);

        if (response.ok) {
          // Handle both single object and array responses
          let fetchedRequests: AdminRequest[] = [];
          if (Array.isArray(data)) {
            fetchedRequests = data.map((req: any) => ({
              id: req.requestId?.toString() || `req-${Date.now()}`,
              type: 'Termination' as const,
              requestedBy: req.requestedByName || `Employee ${req.requestedBy}` || 'System',
              requesterId: req.requestedBy || 'sys',
              targetId: req.employeeId || req.targetId || '',
              date: new Date(req.createdAt).toLocaleDateString() || new Date().toISOString().split('T')[0],
              status: req.status === 'PENDING' ? 'Pending' : req.status === 'APPROVED' ? 'Approved' : 'Rejected',
              details: req.reason || req.details || '',
              dbId: req.requestId // Store the numeric requestId from backend
            }));
          } else if (data && typeof data === 'object') {
            fetchedRequests = [{
              id: data.requestId?.toString() || `req-${Date.now()}`,
              type: 'Termination' as const,
              requestedBy: data.requestedByName || `Employee ${data.requestedBy}` || 'System',
              requesterId: data.requestedBy || 'sys',
              targetId: data.employeeId || data.targetId || '',
              date: new Date(data.createdAt).toLocaleDateString() || new Date().toISOString().split('T')[0],
              status: data.status === 'PENDING' ? 'Pending' : data.status === 'APPROVED' ? 'Approved' : 'Rejected',
              details: data.reason || data.details || '',
              dbId: data.requestId // Store the numeric requestId from backend
            }];
          }

          setTerminationRequests(fetchedRequests);
          console.log('Mapped termination requests:', fetchedRequests);
        } else {
          console.error('Failed to fetch termination requests:', data);
          setTerminationRequests([]);
        }
      } catch (err) {
        console.error('Error fetching termination requests:', err);
        setTerminationRequests([]);
      } finally {
        setIsLoadingTerminationRequests(false);
      }
    };

    if (isSuperAdmin) {
      fetchTerminationRequests();
      // Refresh every 5 seconds to see new requests
      const interval = setInterval(fetchTerminationRequests, 5000);
      return () => clearInterval(interval);
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
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
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
      // Refresh every 10 seconds
      const interval = setInterval(fetchPendingEmployees, 10000);
      return () => clearInterval(interval);
    }
  }, [isSuperAdmin]);

  const filteredRequests = useMemo(() => {
    // Merge backend termination requests with local requests
    const allRequests = [...terminationRequests, ...requests];

    // Remove duplicates by id
    const uniqueRequests = Array.from(
      new Map(allRequests.map(req => [req.id, req])).values()
    );

    return uniqueRequests.sort((a, b) => {
      if (a.status === 'Pending' && b.status !== 'Pending') return -1;
      if (a.status !== 'Pending' && b.status === 'Pending') return 1;
      return 0;
    });
  }, [requests, terminationRequests]);

  const handleAction = async (request: AdminRequest, status: 'Approved' | 'Rejected') => {
    if (request.type === 'Termination') {
      // Handle termination request via backend endpoints
      try {
        // Use numeric dbId from backend, fallback to string id if not available
        const requestId = request.dbId || request.id;

        const endpoint = status === 'Approved'
          ? `http://localhost:8085/api/admin-hub/approve/${requestId}`
          : `http://localhost:8085/api/admin-hub/reject/${requestId}`;

        let url = endpoint;

        // For rejections, optionally prompt for rejection reason
        if (status === 'Rejected') {
          const rejectionReason = prompt('Please provide a reason for rejection (optional):');
          if (rejectionReason) {
            url = `${endpoint}?rejectionReason=${encodeURIComponent(rejectionReason)}`;
          }
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        });

        const result = await response.text();
        console.log('Termination request response:', result);

        if (response.ok) {
          // Update local state via context
          processRequest(request.id, status);
          setViewingRequest(null);
          alert(result);
        } else {
          alert(`Failed to ${status === 'Approved' ? 'approve' : 'reject'} termination request: ${result}`);
        }
      } catch (err) {
        console.error('Error handling termination request:', err);
        alert('An error occurred while processing the termination request');
      }
    } else {
      // For other request types, use the standard behavior
      processRequest(request.id, status);
      setViewingRequest(null);
    }
  };

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
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
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
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
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

      {/* Pending Employee Approvals Section */}
      {isSuperAdmin && pendingEmployees.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Clock size={20} className="text-amber-500" />
            <h3 className="text-lg font-bold text-gray-900 tracking-tight">Pending Employee Approvals</h3>
            <Badge color="yellow">{pendingEmployees.length} Pending</Badge>
          </div>

          <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[1200px]">
                <thead className="bg-amber-50 backdrop-blur-md border-b border-amber-200">
                  <tr>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Employee Name</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Employee ID</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Email</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Department</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Created By</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Created At</th>
                    <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {pendingEmployees.map((employee) => (
                    <tr key={employee.employeeId} className="hover:bg-amber-50 transition-all group border-l-2 border-transparent hover:border-amber-500">
                      <td className="px-8 py-5 cursor-pointer" onClick={() => setViewingPendingEmployee(employee)}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-sm">
                            {employee.firstName.charAt(0)}{employee.lastName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">{employee.firstName} {employee.lastName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded-lg">{employee.employeeId}</span>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm text-gray-900">{employee.email}</span>
                      </td>
                      <td className="px-8 py-5">
                        <Badge color="blue">{employee.department}</Badge>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm text-gray-900 font-medium">{employee.createdByName}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="text-sm text-gray-900">{new Date(employee.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingPendingEmployee(employee)}
                            className="p-2.5 bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition-all"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleApprovePendingEmployee(employee)}
                            disabled={isApproving}
                            className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-90 disabled:opacity-50"
                            title="Approve"
                          >
                            <Check size={18} />
                          </button>
                          <button
                            onClick={() => handleRejectPendingEmployee(employee)}
                            className="p-2.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-all active:scale-90"
                            title="Reject"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Original Admin Requests Section */}
      <div className={pendingEmployees.length > 0 ? 'pt-6 border-t border-gray-200' : ''}>
        {pendingEmployees.length > 0 && (
          <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-6">Administrative Requests</h3>
        )}

        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead className="bg-gray-50 backdrop-blur-md border-b border-gray-200">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Request ID & Type</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Initiated By</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Submission Date</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Target Entity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-gray-900 uppercase tracking-[0.2em] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-all group border-l-2 border-transparent hover:border-blue-300">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl border ${req.type === 'Termination' ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-blue-100 border-blue-200 text-blue-600'}`}>
                          <GitPullRequest size={18} />
                        </div>
                        <div>
                          <div className="font-bold text-gray-900 tracking-tight">{req.type}</div>
                          <div className="text-[10px] font-mono text-gray-500">{req.id.toUpperCase()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-900 font-semibold">
                        <User size={14} className="text-gray-400" /> {req.requestedBy}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 text-sm text-gray-900">
                        <Calendar size={14} /> {req.date}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-medium text-gray-900">
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
                          className="p-2.5 bg-gray-100 text-gray-500 hover:text-gray-900 rounded-xl transition-all"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>

                        {isSuperAdmin && req.status === 'Pending' && (
                          <>
                            <button
                              onClick={() => handleAction(req, 'Approved')}
                              className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl transition-all active:scale-90"
                              title="Approve"
                            >
                              <Check size={18} />
                            </button>
                            <button
                              onClick={() => handleAction(req, 'Rejected')}
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
                            className="px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2"
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
      </div>

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
                <div className={`p-5 rounded-2xl ${viewingRequest.type === 'Termination' ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-600/10 text-gray-900'}`}>
                  {viewingRequest.type === 'Termination' ? <Trash2 size={32} /> : viewingRequest.type === 'Promotion' ? <UserPlus size={32} /> : <Calendar size={32} />}
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight">{viewingRequest.type}</h3>
                  <p className="text-[10px] text-gray-900 font-black uppercase tracking-widest mt-1">Submission Reference: {viewingRequest.id}</p>
                  <div className="flex gap-2 mt-4">
                    <Badge color={viewingRequest.status === 'Approved' ? 'green' : viewingRequest.status === 'Rejected' ? 'red' : 'yellow'}>
                      {viewingRequest.status.toUpperCase()}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <User size={14} className="text-blue-600" /> Initiator Context
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-900">Requested By</span>
                    <span className="text-gray-900 font-bold">{viewingRequest.requestedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-900">Request Date</span>
                    <span className="text-gray-900 font-bold">{viewingRequest.date}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 p-6 rounded-2xl bg-white border border-gray-200">
                <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                  <Info size={14} className="text-blue-600" /> Target Context
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-900">Target Employee</span>
                    <span className="text-gray-900 font-bold">
                      {viewingRequest.targetId ? employees.find(e => e.id === viewingRequest.targetId)?.name || 'N/A' : 'External Vacancy'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-gray-200">
              <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest flex items-center gap-2 mb-4">
                <FileText size={14} className="text-blue-600" /> Justification & Details
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                "{viewingRequest.details}"
              </p>
            </div>

            {isSuperAdmin && viewingRequest.status === 'Pending' && (
              <div className="flex gap-4 pt-4">
                <button
                  onClick={() => handleAction(viewingRequest, 'Approved')}
                  className="flex-1 py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 shadow-xl shadow-emerald-500/20 active:scale-95 transition-all"
                >
                  Authorize Request
                </button>
                <button
                  onClick={() => handleAction(viewingRequest, 'Rejected')}
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
