import React, { useState, useEffect } from 'react';
import { getEmployeeTickets, updateTicketStatus as apiUpdateTicketStatus } from '../../api/tickets.ts';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

type RequestItem = {
  id: string;
  employeeName: string;
  subject: string;
  message: string; // request description
  createdAt: string;
  status: 'approved' | 'rejected' | 'inprogress';
};

const AdminRequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch tickets from API on mount
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getEmployeeTickets();
        if (Array.isArray(data) && data.length > 0) {
          // Map ticket response to RequestItem format
          const mapped = data.map((ticket: any) => ({
            id: ticket.ticketId,
            employeeName: ticket.category || `EMP: ${ticket.employeeId}`,
            subject: ticket.subject,
            message: ticket.issueDetails,
            createdAt: new Date().toLocaleString(),
            status: 'inprogress' as const,
          }));
          setRequests(mapped);
        } else {
          // API returned empty list - show no requests
          setRequests([]);
        }
      } catch (err) {
        console.warn('Failed to fetch tickets from API.', err);
        // Show empty state on error instead of fallback data
        setRequests([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const setStatus = async (id: string, status: RequestItem['status']) => {
    // Update local state
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
    
    // Call API to update ticket status
    try {
      await apiUpdateTicketStatus(id, status);
    } catch (err: any) {
      console.error('Failed to update ticket status:', err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-black tracking-tight">Employee Requests</h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Manage and respond to employee tickets and requests.</p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, idx) => (
            <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm animate-pulse">
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-slate-200 rounded w-32"></div>
                  <div className="h-5 bg-slate-200 rounded w-48"></div>
                  <div className="h-4 bg-slate-200 rounded w-full"></div>
                </div>
                <div className="space-y-3 ml-4">
                  <div className="h-4 bg-slate-200 rounded w-24"></div>
                  <div className="h-6 bg-slate-200 rounded-full w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && requests.length === 0 && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-16 flex flex-col items-center justify-center text-center">
          
          <h3 className="text-xl font-black text-black mb-2">No Requests Yet</h3>
          <p className="text-slate-500 font-medium max-w-sm">
            When employees submit requests or tickets, they will appear here. Everything is quiet for now.
          </p>
        </div>
      )}

      {/* Requests List */}
      {!isLoading && requests.length > 0 && (
        <div className="space-y-4">
          {requests.map((req) => (
            <div
              key={req.id}
              className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2">
                    From: {req.employeeName}
                  </div>
                  <div className="text-lg font-black text-black mb-2 line-clamp-1">{req.subject}</div>
                  <div className="text-sm text-slate-600 line-clamp-2">{req.message}</div>
                </div>
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  <div className="text-xs font-medium text-slate-400 whitespace-nowrap">
                    {req.createdAt}
                  </div>
                  <div
                    className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest whitespace-nowrap ${
                      req.status === 'approved'
                        ? 'bg-emerald-50 text-emerald-600'
                        : req.status === 'rejected'
                        ? 'bg-rose-50 text-rose-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {req.status === 'inprogress' ? 'In Progress' : req.status.toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 flex gap-2 flex-wrap border-t border-slate-100 pt-6">
                <button
                  onClick={() => setStatus(req.id, 'approved')}
                  disabled={req.status === 'approved'}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    req.status === 'approved'
                      ? 'bg-emerald-50 text-emerald-600 cursor-default'
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
                  }`}
                >
                  <Icon name="Check" className="w-3.5 h-3.5 inline mr-1.5" />
                  Approve
                </button>
                <button
                  onClick={() => setStatus(req.id, 'rejected')}
                  disabled={req.status === 'rejected'}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    req.status === 'rejected'
                      ? 'bg-rose-50 text-rose-600 cursor-default'
                      : 'bg-rose-600 text-white hover:bg-rose-700 active:scale-95'
                  }`}
                >
                  <Icon name="X" className="w-3.5 h-3.5 inline mr-1.5" />
                  Reject
                </button>
                <button
                  onClick={() => setStatus(req.id, 'inprogress')}
                  disabled={req.status === 'inprogress'}
                  className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                    req.status === 'inprogress'
                      ? 'bg-slate-100 text-slate-400 cursor-default'
                      : 'border border-slate-200 text-black hover:bg-slate-50 active:scale-95'
                  }`}
                >
                  <Icon name="Clock" className="w-3.5 h-3.5 inline mr-1.5" />
                  In Progress
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;
