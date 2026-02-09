// src/context/LeaveContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LeaveRequest, LeaveBalance } from '../types.ts';

interface LeaveContextType {
  leaveBalance: LeaveBalance;
  leaveRequests: LeaveRequest[];
  upcomingLeaves: LeaveRequest[];
  onLeaveCount: number;
  setLeaveBalance: React.Dispatch<React.SetStateAction<LeaveBalance>>;
  setLeaveRequests: (requests: LeaveRequest[]) => void;
  addLeaveRequest: (request: LeaveRequest) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  deleteLeaveRequest: (id: string) => void;
}

const LeaveContext = createContext<LeaveContextType | undefined>(undefined);

export const LeaveProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initial leave balance
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance>({
    total: 24,
    used: 8,
    available: 16,
    lossOfPay: 0
  });

  // Initial leave requests
  const [leaveRequests, setLeaveRequestsState] = useState<LeaveRequest[]>([
    {
      id: '1',
      type: 'Casual Leave',
      startDate: '2024-03-12',
      endDate: '2024-03-14',
      days: 3,
      status: 'approved',
      reason: 'Family event',
      appliedDate: '2024-03-01',
      applicant: 'Alex Johnson'
    },
    {
      id: '2',
      type: 'Sick Leave',
      startDate: '2024-02-05',
      endDate: '2024-02-05',
      days: 1,
      status: 'rejected',
      reason: 'Medical appointment',
      appliedDate: '2024-02-04',
      applicant: 'Alex Johnson'
    },
    {
      id: '3',
      type: 'Annual Leave',
      startDate: '2024-04-01',
      endDate: '2024-04-05',
      days: 5,
      status: 'pending',
      reason: 'Vacation',
      appliedDate: '2024-03-15',
      applicant: 'Alex Johnson'
    }
  ]);

  // Calculate upcoming leaves
  const upcomingLeaves = leaveRequests.filter(
    r => r.status === 'approved' && new Date(r.startDate) > new Date()
  ).slice(0, 3);

  // Calculate on leave count (people currently on leave)
  const onLeaveCount = leaveRequests.filter(r => {
    const today = new Date();
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    return r.status === 'approved' && start <= today && end >= today;
  }).length;

  // Note: expose `setLeaveBalance` (state setter) directly to support functional updates

  // Update leave requests
  const setLeaveRequests = (requests: LeaveRequest[]) => {
    setLeaveRequestsState(requests);
  };

  // Add new leave request
  const addLeaveRequest = (request: LeaveRequest) => {
    const newRequests = [request, ...leaveRequests];
    setLeaveRequestsState(newRequests);
    
    // If it's a pending request, update leave balance
    if (request.status === 'pending') {
      setLeaveBalance(prev => ({
        ...prev,
        used: prev.used + request.days,
        available: prev.available - request.days
      }));
    }
  };

  // Update existing leave request
  const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
    const updatedRequests = leaveRequests.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    setLeaveRequestsState(updatedRequests);
  };

  // Delete leave request
  const deleteLeaveRequest = (id: string) => {
    const requestToDelete = leaveRequests.find(r => r.id === id);
    const updatedRequests = leaveRequests.filter(r => r.id !== id);
    
    setLeaveRequestsState(updatedRequests);
    
    // If deleting a pending request, restore leave balance
    if (requestToDelete && requestToDelete.status === 'pending') {
      setLeaveBalance(prev => ({
        ...prev,
        used: prev.used - requestToDelete.days,
        available: prev.available + requestToDelete.days
      }));
    }
  };

  return (
    <LeaveContext.Provider value={{
      leaveBalance,
      leaveRequests,
      upcomingLeaves,
      onLeaveCount,
      setLeaveBalance,
      setLeaveRequests,
      addLeaveRequest,
      updateLeaveRequest,
      deleteLeaveRequest
    }}>
      {children}
    </LeaveContext.Provider>
  );
};

export const useLeave = () => {
  const context = useContext(LeaveContext);
  if (!context) {
    throw new Error('useLeave must be used within a LeaveProvider');
  }
  return context;
};