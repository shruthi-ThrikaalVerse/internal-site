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
  const [confirmTarget, setConfirmTarget] = useState<{
    id: string | null;
    action: 'approved' | 'rejected' | null;
    subject?: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'inprogress' | 'approved' | 'rejected'>('all');

  // Fetch tickets from API on mount
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const data = await getEmployeeTickets();
        if (Array.isArray(data) && data.length > 0) {
          // Map ticket response to RequestItem format
          const mapTicketStatus = (s: any): RequestItem['status'] => {
            if (!s) return 'inprogress';
            const st = String(s).toLowerCase();
            if (st.includes('pending')) return 'inprogress';
            if (st.includes('approved')) return 'approved';
            if (st.includes('rejected')) return 'rejected';
            return 'inprogress';
          };

          const mapped = data.map((ticket: any) => ({
            id: ticket.ticketId,
            employeeName: ticket.category || `EMP: ${ticket.employeeId}`,
            subject: ticket.subject,
            message: ticket.issueDetails,
            createdAt: ticket.createdAt || new Date().toLocaleString(),
            status: mapTicketStatus(ticket.status),
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

  // Filter requests based on search term and status
  const filteredRequests = React.useMemo(() => {
    return requests.filter((req) => {
      const matchesSearch = req.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [requests, searchTerm, statusFilter]);

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

      {/* Requests Section */}
      {!isLoading && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          {/* Header with Filters */}
          <div className="sticky top-0 z-20 bg-white p-6 border-b border-slate-100 space-y-6">
            {/* Title and Count */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-black">Ticket Queue</h2>
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                  {filteredRequests.length} of {requests.length} requests
                </p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
              {/* Search */}
              <div className="relative flex-1 w-full group">
                <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by subject, message, employee, or ticket ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-3 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-sm text-black placeholder:text-slate-400 transition-all"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 flex-wrap w-full lg:w-auto">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Filter:</span>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'inprogress', 'approved', 'rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${statusFilter === status
                          ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                          : 'bg-slate-50 text-black border border-slate-200 hover:bg-slate-100'
                        }`}
                    >
                      {status === 'all' && 'All'}
                      {status === 'inprogress' && 'In Progress'}
                      {status === 'approved' && 'Approved'}
                      {status === 'rejected' && 'Rejected'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Empty Filtered State */}
          {filteredRequests.length === 0 && requests.length > 0 && (
            <div className="p-16 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                <Icon name="Search" className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-lg font-black text-black mb-2">No Matches Found</h3>
              <p className="text-slate-500 font-medium max-w-sm">
                Try adjusting your search or filters to find what you're looking for.
              </p>
            </div>
          )}

          {/* Requests as Cards Grid */}
          {filteredRequests.length > 0 && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRequests.map((req) => (
                <div
                  key={req.id}
                  className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:border-slate-200 transition-all group flex flex-col h-full"
                >
                  {/* Card Header with Status Indicator */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div
                        className={`w-3 h-3 rounded-full flex-shrink-0 ring-2 ${req.status === 'approved'
                            ? 'bg-emerald-500 ring-emerald-200'
                            : req.status === 'rejected'
                              ? 'bg-rose-500 ring-rose-200'
                              : 'bg-amber-500 ring-amber-200'
                          }`}
                      />
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest truncate">
                        {req.id}
                      </span>
                    </div>
                    <div
                      className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0 ${req.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-600'
                          : req.status === 'rejected'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                    >
                      {req.status === 'inprogress' ? 'Pending' : req.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex-1 mb-4">
                    <div className="text-sm font-black text-black mb-2 line-clamp-2">{req.subject}</div>
                    <div className="text-xs text-slate-600 line-clamp-3 mb-4">{req.message}</div>

                    {/* Category and Timestamp */}
                    <div className="text-xs text-slate-500 space-y-1">
                      <div>
                        <span className="font-black text-indigo-600">{req.employeeName}</span>
                      </div>
                      <div className="font-medium">{req.createdAt}</div>
                    </div>
                  </div>

                  {/* Card Footer with Actions */}
                  {req.status === 'inprogress' ? (
                    <div className="space-y-3 pt-4 border-t border-slate-100">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setConfirmTarget({ id: req.id, action: 'approved', subject: req.subject })}
                          className="flex-1 px-3 py-2.5 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:bg-emerald-700 active:scale-95"
                          title="Approve this ticket"
                        >
                          <Icon name="Check" className="w-3 h-3 inline mr-1" />
                          Approve
                        </button>
                        <button
                          onClick={() => setConfirmTarget({ id: req.id, action: 'rejected', subject: req.subject })}
                          className="flex-1 px-3 py-2.5 bg-rose-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:bg-rose-700 active:scale-95"
                          title="Reject this ticket"
                        >
                          <Icon name="X" className="w-3 h-3 inline mr-1" />
                          Reject
                        </button>
                      </div>
                      <button
                        onClick={() => setStatus(req.id, 'inprogress')}
                        className="w-full px-3 py-2.5 border border-slate-300 text-black rounded-lg text-xs font-black uppercase tracking-widest transition-all hover:bg-slate-100 active:scale-95"
                        title="Mark as In Progress"
                      >
                        <Icon name="Clock" className="w-3 h-3 inline mr-1" />
                        In Progress
                      </button>
                    </div>
                  ) : (
                    <div className="pt-4 border-t border-slate-100 text-center">
                      <p className="text-xs font-medium text-slate-400">
                        {req.status === 'approved' ? 'Approved' : 'Rejected'} · No Further Action
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setConfirmTarget(null)} />
          <div className="relative z-50 bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-lg font-black text-black mb-2">Confirm Action</h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to <span className="font-black text-black">{confirmTarget.action}</span> the request "{confirmTarget.subject}"?
            </p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmTarget(null)} className="px-4 py-2 bg-white border rounded-xl">Cancel</button>
              <button
                onClick={async () => {
                  if (!confirmTarget?.id || !confirmTarget.action) return;
                  await setStatus(confirmTarget.id, confirmTarget.action);
                  setConfirmTarget(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRequestsPage;
