// src/pages/Requests.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle, Monitor, Shield, CreditCard, Settings, Plus,
  X, Loader2, Search, Filter, Clock, AlertCircle,
  ChevronRight, Paperclip, MoreVertical, History, User,
  CheckCircle, XCircle, MessageSquare, Download, FileText,
  ArrowLeft, Calendar, Tag, Cpu, Smartphone, Printer,
  Bell, FileUp, Send, DollarSign, Trash2, Eye, CheckCircle2,
  Inbox, Share2, ShieldCheck, LifeBuoy, BookOpen, Check,
  AlertTriangle, Phone, Mail, MapPin, FileCheck, FileCode,
  Receipt, Building, BadgeCheck, Key, Briefcase, Globe,
  Camera, Image
} from 'lucide-react';
import { toast } from 'react-toastify';

interface SupportRequest {
  id: string;
  title: string;
  category: string;
  type: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  updatedAt: string;
  description: string;
  attachments: string[];
}

interface RecordDTO {
  ticketId: string;
  subject: string;
  category: string;
  type: string;
  status: string;
  creationDate: string;
  priority: string;
}

const FAQ_DATA = [
  {
    q: "How do I create a new help request?",
    a: "Click the blue '+ New Request' button. Choose a category that matches your issue, add a title and description, and click submit."
  },
  {
    q: "How long until someone replies?",
    a: "Our help desk team typically reviews and responds to all requests within 2 to 4 business hours."
  },
  {
    q: "Can I add screenshots or files?",
    a: "Yes. Use the 'Attachments' section when creating a request to upload any relevant images or documents."
  },
  {
    q: "How do I save a copy of my request?",
    a: "Click the options menu (three dots) next to your request and select 'Download PDF' to save a local copy."
  }
];

const Requests: React.FC = () => {
  const [view, setView] = useState<'list' | 'faq'>('list');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);

  // Ticket Records fetched from server
  const [records, setRecords] = useState<RecordDTO[]>([]);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);

  // Tickets list fetched from server
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  const [activeActionMenu, setActiveActionMenu] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number, right: number }>({ top: 0, right: 0 });
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [detailRequest, setDetailRequest] = useState<SupportRequest | null>(null);

  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    {
      id: 'it',
      name: 'IT Support',
      description: 'Hardware, software, and login assistance',
      icon: Monitor,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      types: [
        { id: 'hardware', label: 'Hardware Issue', icon: Cpu },
        { id: 'software', label: 'Software Issue', icon: Smartphone },
        { id: 'access', label: 'Access Request', icon: Shield },
        { id: 'network', label: 'Network Issue', icon: Settings },
        { id: 'printer', label: 'Printer Issue', icon: Printer },
        { id: 'document', label: 'Document Request', icon: FileText }
      ]
    },
    {
      id: 'hr',
      name: 'Human Resources',
      description: 'Policies, documents, and general HR queries',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      types: [
        { id: 'policy', label: 'Policy Query', icon: Shield },
        { id: 'leave', label: 'Leave & Attendance', icon: Calendar },
        { id: 'profile', label: 'Profile Edit', icon: User }
      ]
    },
    {
      id: 'finance',
      name: 'Finance & Payroll',
      description: 'Expenses, pay slips, and reimbursements',
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      types: [
        { id: 'expense', label: 'Expense Claim', icon: CreditCard },
        { id: 'reimbursement', label: 'Reimbursement', icon: DollarSign },
        { id: 'salary', label: 'Salary Query', icon: CreditCard },
        { id: 'payslip', label: 'Pay Slip Request', icon: Receipt }
      ]
    },
    {
      id: 'facilities',
      name: 'Office & Desk',
      description: 'Furniture, maintenance, and supplies',
      icon: Settings,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      types: [
        { id: 'equipment', label: 'Furniture Request', icon: Monitor },
        { id: 'maintenance', label: 'Cleaning or Repairs', icon: Settings },
        { id: 'office', label: 'Office Supplies', icon: Printer }
      ]
    }
  ];

  useEffect(() => {
    // On mount: fetch latest tickets and records from backend (no static mock data)
    fetchTickets();
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch ticket records from backend
  const fetchRecords = async () => {
    setIsLoadingRecords(true);
    try {
      const response = await fetch('http://localhost:8085/tickets/get-records', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (!response.ok) {
        const text = await response.text();
        console.error('Failed fetching records:', response.status, text);
        toast.error(`Failed to fetch ticket records (Status: ${response.status})`);
        setIsLoadingRecords(false);
        return;
      }

      const data = await response.json();
      if (!Array.isArray(data)) {
        console.error('Unexpected records response:', data);
        toast.error('Unexpected response fetching ticket records');
        setIsLoadingRecords(false);
        return;
      }

      const mapped: RecordDTO[] = data.map((r: any) => ({
        ticketId: r.ticketId || r.id || '',
        subject: r.subject || '',
        category: r.category || '',
        type: r.type || '',
        status: r.status || '',
        creationDate: r.creationDate || r.creationDateTime || '',
        priority: r.priority || ''
      }));

      setRecords(mapped);

      // Sync local tickets' statuses with the records so UI updates immediately
      setRequests((prev: SupportRequest[]) => {
        // Build a flexible map covering common id forms (exact, with/without TKT- prefix, lowercase)
        const statusMap = new Map<string, SupportRequest['status']>();
        mapped.forEach(m => {
          const id = String(m.ticketId || '').trim();
          if (!id) return;
          const normalized = normalizeStatus(m.status);
          statusMap.set(id, normalized);
          statusMap.set(id.toLowerCase(), normalized);
          if (!id.startsWith('TKT-')) statusMap.set(`TKT-${id}`, normalized);
          else statusMap.set(id.replace(/^TKT-/, ''), normalized);
        });

        return prev.map((req: SupportRequest) => {
          // Try multiple candidate keys to find a matching record
          const candidates = [req.id, req.id.toLowerCase(), req.id.replace(/^TKT-/, '')];
          let newStatus: SupportRequest['status'] | undefined;
          for (const c of candidates) {
            newStatus = statusMap.get(c);
            if (newStatus) break;
          }
          if (!newStatus || newStatus === req.status) return req;
          return { ...req, status: newStatus, updatedAt: new Date().toISOString() };
        });
      });

      // Keep ticket list in sync with the latest records (refresh tickets as authoritative source)
      try {
        await fetchTickets();
      } catch (e) {
        console.warn('Sync fetchTickets failed after records:', e);
      }
    } catch (err) {
      console.error('Error fetching records:', err);
      toast.error('Network error while fetching ticket records');
    } finally {
      setIsLoadingRecords(false);
    }
  };

  // Load records on mount
  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Helper: normalize server status strings into our local union type
  const normalizeStatus = (s: any): SupportRequest['status'] => {
    const v = String(s || 'open').toLowerCase();
    if (v.includes('progress') || v === 'in_progress') return 'in_progress';
    if (v.includes('resolved') || v === 'resolved') return 'resolved';
    if (v.includes('approved') || v === 'approved') return 'resolved'; // treat approved as resolved
    if (v.includes('closed') || v === 'closed') return 'closed';
    if (v.includes('pending') || v === 'pending' || v.includes('open')) return 'open';
    return 'open';
  };

  // Fetch user's tickets from backend and update requests list
  const fetchTickets = async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch('http://localhost:8085/tickets/get-tickets', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });

      if (!res.ok) {
        const text = await res.text();
        console.error('Failed fetching tickets:', res.status, text);
        toast.error(`Failed to fetch tickets (Status: ${res.status})`);
        setIsLoadingRequests(false);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        console.error('Unexpected tickets response:', data);
        toast.error('Unexpected response fetching tickets');
        setIsLoadingRequests(false);
        return;
      }

      const mapped: SupportRequest[] = data.map((t: any) => ({
        id: t.ticketId || t.id || '',
        title: t.subject || t.issueDetails || '',
        category: t.category || '',
        type: t.type || '',
        status: normalizeStatus(t.status),
        priority: ((t.priority || 'medium') as string).toLowerCase() as SupportRequest['priority'],
        createdAt: t.creationDate || t.createdAt || '',
        updatedAt: t.updatedAt || t.creationDate || '',
        description: t.issueDetails || t.description || '',
        attachments: Array.isArray(t.attachments) ? t.attachments : []
      }));

      setRequests(mapped);

    } catch (err) {
      console.error('Error fetching tickets:', err);
      toast.error('Network error while fetching tickets');
    } finally {
      setIsLoadingRequests(false);
    }
  };

  // Fetch a single ticket by id from server and return mapped SupportRequest (or null)
  const fetchTicketById = async (ticketId: string): Promise<SupportRequest | null> => {
    try {
      const res = await fetch('http://localhost:8085/tickets/get-tickets', {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        credentials: 'include'
      });
      if (!res.ok) return null;
      const data = await res.json();
      if (!Array.isArray(data)) return null;
      const found = data.find((t: any) => (t.ticketId || t.id) === ticketId);
      if (!found) return null;
      return {
        id: found.ticketId || found.id || ticketId,
        title: found.subject || found.issueDetails || '',
        category: found.category || '',
        type: found.type || '',
        status: normalizeStatus(found.status),
        priority: ((found.priority || 'medium') as string).toLowerCase() as SupportRequest['priority'],
        createdAt: found.creationDate || found.createdAt || new Date().toISOString(),
        updatedAt: found.updatedAt || found.creationDate || new Date().toISOString(),
        description: found.issueDetails || found.description || '',
        attachments: Array.isArray(found.attachments) ? found.attachments : []
      };
    } catch (e) {
      console.warn('fetchTicketById failed', e);
      return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setActiveActionMenu(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownloadPDF = async (request: SupportRequest) => {
    // Try to get the latest ticket info from server for up-to-date status
    let latest = request;
    try {
      const fresh = await fetchTicketById(request.id);
      if (fresh) {
        latest = fresh;
        // Also refresh the tickets list to keep UI in sync
        fetchTickets().catch(e => console.warn('Failed to refresh tickets after fetching single ticket', e));
      }
    } catch (e) {
      console.warn('Unable to fetch latest ticket for PDF, falling back to local copy', e);
    }

    const report = `
HELP DESK TICKET REPORT
Ticket ID: ${latest.id}
Date: ${new Date(latest.createdAt).toLocaleDateString()}
--------------------------------------------------
Title: ${latest.title}
Category: ${latest.category}
Type: ${latest.type}
Status: ${latest.status.toUpperCase()}
Priority: ${latest.priority.toUpperCase()}

Description:
${latest.description}

Attachments:
${latest.attachments.length > 0 ? latest.attachments.join(', ') : 'None'}
--------------------------------------------------
    `;
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Ticket_${latest.id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setActiveActionMenu(null);
  };

  const handlePurgeRequest = (id: string) => {
    setRequests((prev: SupportRequest[]) => prev.filter((r: SupportRequest) => r.id !== id));
    setActiveActionMenu(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files: File[] = Array.from(e.target.files || []);
    setAttachments((prev: File[]) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev: File[]) => prev.filter((_: File, i: number) => i !== index));
  };

  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('high');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory || !selectedType || !subject || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Check if expense claim requires attachment
    const isExpenseClaim = selectedCategory === 'finance' && selectedType === 'expense';
    if (isExpenseClaim && attachments.length === 0) {
      toast.error("Please attach supporting documents for expense claim");
      return;
    }

    setIsSubmitting(true);

    try {
      const categoryName = categories.find(c => c.id === selectedCategory)?.name || 'General';
      const typeLabel = categories
        .find(c => c.id === selectedCategory)
        ?.types.find(t => t.id === selectedType)?.label || 'General';

      const payload = {
        category: categoryName,
        type: typeLabel,
        subject: subject,
        issueDetails: description,
        priority: priority[0].toUpperCase() + priority.slice(1) // 'High'
      };

      // Build multipart form data (backend expects 'ticket' and 'files')
      const formDataObj = new FormData();
      formDataObj.append('ticket', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      attachments.forEach(file => formDataObj.append('files', file));

      // Helpful debug: list keys (not file contents) to ensure parts are set
      console.log('FormData keys:', Array.from((formDataObj as any).keys()));

      const response = await fetch('http://localhost:8085/tickets/create', {
        method: 'POST',
        body: formDataObj,
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        let msg = 'Failed to create ticket';
        try {
          const errText = await response.text();
          console.error('Server error body:', errText);
          try {
            const errData = JSON.parse(errText);
            msg = errData.message || msg;
          } catch (_) {
            // non-json response
            msg = errText || msg;
          }
        } catch (_) { }

        if (response.status === 401) toast.error('Authentication failed. Please log in again.');
        else if (response.status === 403) toast.error('Permission denied.');
        else toast.error(msg + ` (Status: ${response.status})`);

        setIsSubmitting(false);
        return;
      }

      const ticket = await response.json();
      console.log('Ticket created:', ticket);

      // Refresh tickets from server to reflect authoritative state
      await fetchTickets();
      setShowNewRequestModal(false);

      // Reset form
      setSelectedCategory('');
      setSelectedType('');
      setSubject('');
      setDescription('');
      setAttachments([]);
      setPriority('high');
    } catch (err: any) {
      console.error('Failed to submit ticket', err);
      toast.error('Failed to submit help request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRecords = records.filter(r => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = (r.subject || '').toLowerCase().includes(q) ||
      String(r.ticketId || '').toLowerCase().includes(q);
    const matchesStatus = filterStatus === 'all' || normalizeStatus(r.status) === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusDisplay = (status: SupportRequest['status']) => {
    switch (status) {
      case 'open': return { text: 'Pending', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
      case 'in_progress': return { text: 'In Progress', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'resolved': return { text: 'Finished', color: 'bg-green-100 text-green-800 border-green-200' };
      default: return { text: 'Closed', color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const getPriorityColor = (priority: SupportRequest['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const getTypesForCategory = (categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.types || [];
  };

  const NewRequestModal = () => {
    if (!showNewRequestModal) return null;

    const isExpenseClaim = selectedCategory === 'finance' && selectedType === 'expense';

    return (
      <div className="fixed inset-0 z-[100] overflow-y-auto">
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm" onClick={() => setShowNewRequestModal(false)} />
        <div className="relative min-h-screen flex items-center justify-center p-4">
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300" onClick={e => e.stopPropagation()}>
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create New Request</h2>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1">Fill in the details below</p>
              </div>
              <button
                type="button"
                title="Close modal"
                onClick={() => setShowNewRequestModal(false)}
                className="p-3 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl transition-all active:scale-90"
              >
                <X className="w-6 h-6" aria-hidden="true" />
                <span className="sr-only">Close modal</span>
              </button>
            </div>

            <div className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Field 1: Category Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="request-category" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                    Category *
                  </label>
                  <select
                    id="request-category"
                    value={selectedCategory}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setSelectedCategory(e.target.value);
                      setSelectedType(''); // Reset type when category changes
                    }}
                    required
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 cursor-pointer"
                    aria-label="Request category"
                    title="Request category"
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 2: Type Dropdown */}
                <div className="space-y-2">
                  <label htmlFor="request-type" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                    Type *
                  </label>
                  <select
                    id="request-type"
                    value={selectedType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedType(e.target.value)}
                    required
                    disabled={!selectedCategory}
                    className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 cursor-pointer ${!selectedCategory ? 'opacity-50 cursor-not-allowed' : ''}`}
                    aria-label="Request type"
                    title="Request type"
                  >
                    <option value="">Select a type</option>
                    {getTypesForCategory(selectedCategory).map(type => (
                      <option key={type.id} value={type.id}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field 3: Subject */}
                <div className="space-y-2">
                  <label htmlFor="request-subject" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                    Subject *
                  </label>
                  <input
                    id="request-subject"
                    type="text"
                    value={subject}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSubject(e.target.value)}
                    required
                    placeholder="Brief summary of your request"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700"
                    aria-label="Request subject"
                    title="Request subject"
                  />
                </div>

                {/* Field 3.5: Priority */}
                <div className="space-y-2">
                  <label htmlFor="request-priority" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                    Priority
                  </label>
                  <select
                    id="request-priority"
                    value={priority}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPriority(e.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 cursor-pointer"
                    aria-label="Request priority"
                    title="Request priority"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                {/* Field 4: Description */}
                <div className="space-y-2">
                  <label htmlFor="request-description" className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">
                    Description *
                  </label>
                  <textarea
                    id="request-description"
                    value={description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
                    required
                    rows={4}
                    placeholder="Detailed description of your issue or request..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all font-medium text-gray-700 resize-none"
                    aria-label="Request description"
                    title="Request description"
                  />
                </div>

                {/* Field 5: Upload Files */}
                <div className="space-y-2">
                  <label htmlFor="request-files" className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                    Attachments
                    {isExpenseClaim && (
                      <span className="text-rose-500">*</span>
                    )}
                    <span className="text-gray-400 font-normal">
                      {isExpenseClaim
                        ? ' (Required for expense claims)'
                        : ' (Optional)'}
                    </span>
                  </label>
                  <input
                    id="request-files"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    multiple
                    className="hidden"
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload attachments"
                    title="Upload attachments"
                    className={`border-2 border-dashed rounded-xl p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-all cursor-pointer group ${isExpenseClaim && attachments.length === 0 ? 'border-rose-200 bg-rose-50' : 'border-gray-200'}`}
                  >
                    <FileUp className="w-8 h-8 text-gray-300 mx-auto mb-2 group-hover:text-blue-500 transition-colors" />
                    <span className="text-sm font-medium text-gray-600 block">
                      {attachments.length === 0
                        ? 'Click to upload files (images, documents, etc.)'
                        : `${attachments.length} file(s) selected`}
                    </span>
                    {isExpenseClaim && attachments.length === 0 && (
                      <p className="text-xs text-rose-500 mt-2 font-medium">
                        ⚠️ Supporting documents are required for expense claims
                      </p>
                    )}
                  </div>

                  {/* Display selected files */}
                  {attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {attachments.map((file: File, idx: number) => (
                        <div key={idx} className="flex items-center justify-between bg-blue-50 border border-blue-100 px-3 py-2 rounded-lg">
                          <div className="flex items-center gap-2">
                            <FileText size={14} className="text-blue-600" />
                            <span className="text-xs font-medium text-blue-900 truncate max-w-[200px]">
                              {file.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeAttachment(idx)}
                            className="p-1 hover:bg-rose-100 text-rose-500 rounded transition-colors"
                            aria-label={`Remove attachment ${file.name}`}
                            title={`Remove attachment ${file.name}`}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowNewRequestModal(false)}
                    className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-100 active:scale-95 transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Help Desk</h1>
            <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">Get support for IT, HR, and Office needs.</p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <button
              onClick={() => setView('faq')}
              className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-white border border-gray-200 text-gray-700 rounded-xl md:rounded-2xl hover:bg-gray-50 transition-all font-bold text-xs md:text-sm shadow-sm flex-1 md:flex-none justify-center"
            >
              <BookOpen className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="truncate">View FAQs</span>
            </button>
            <button
              onClick={() => fetchTickets()}
              className="flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 bg-white border border-gray-200 text-gray-700 rounded-xl md:rounded-2xl hover:bg-gray-50 transition-all font-bold text-xs md:text-sm shadow-sm flex-1 md:flex-none justify-center"
            >
              <History className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span className="truncate">Refresh Tickets</span>
            </button>

            <button
              onClick={() => setShowNewRequestModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 md:px-6 md:py-3 bg-blue-600 text-white rounded-xl md:rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 flex-1 md:flex-none justify-center"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
              <span className="font-bold text-xs md:text-sm uppercase tracking-widest truncate">New Request</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4 mt-6 md:mt-8">
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm text-left">
            <div className="text-2xl md:text-3xl font-black text-gray-900 tabular-nums">{requests.length}</div>
            <div className="text-[10px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate">Total Requests</div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm text-left">
            <div className="text-2xl md:text-3xl font-black text-blue-600 tabular-nums">
              {requests.filter(r => r.status === 'open' || r.status === 'in_progress').length}
            </div>
            <div className="text-[10px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate">Active Now</div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm text-left">
            <div className="text-2xl md:text-3xl font-black text-indigo-600 tabular-nums">
              {requests.filter(r => r.status === 'in_progress').length}
            </div>
            <div className="text-[10px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate">In Progress</div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm text-left">
            <div className="text-2xl md:text-3xl font-black text-orange-600 tabular-nums">
              {requests.filter(r => r.priority === 'urgent' || r.priority === 'high').length}
            </div>
            <div className="text-[10px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate">High Priority</div>
          </div>
          <div className="bg-white rounded-xl md:rounded-2xl border border-gray-200 p-4 md:p-5 shadow-sm text-left">
            <div className="text-2xl md:text-3xl font-black text-green-600 tabular-nums">
              {requests.filter(r => r.status === 'resolved' || r.status === 'closed').length}
            </div>
            <div className="text-[10px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1 truncate">Resolved</div>
          </div>
        </div>
      </div>

      {view === 'faq' ? (
        <div className="max-w-3xl mx-auto space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={() => setView('list')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 font-black text-[10px] uppercase tracking-widest transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to List</span>
          </button>

          <div className="bg-white rounded-2xl md:rounded-[2.5rem] border border-gray-200 p-6 md:p-10 shadow-sm text-left">
            <div className="flex items-center gap-4 mb-6 md:mb-10">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                <HelpCircle size={24} className="md:size-28" />
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Frequently Asked Questions</h2>
            </div>

            <div className="space-y-8 md:space-y-10">
              {FAQ_DATA.map((faq, idx) => (
                <div key={idx} className="border-b border-gray-50 pb-6 md:pb-8 last:border-0">
                  <h3 className="text-base md:text-lg font-black text-gray-900 mb-2 md:mb-3">{faq.q}</h3>
                  <p className="text-gray-600 leading-relaxed font-medium text-sm md:text-base">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // List View
        <div className="space-y-6 md:space-y-8">
          {/* Action Menu Dropdown */}
          {activeActionMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setActiveActionMenu(null)}
              />
              <div
                ref={actionMenuRef}
                className="fixed z-50 bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-xl py-1 min-w-[160px] md:min-w-[180px]"
                style={{
                  top: `${menuPosition.top + 8}px`,
                  right: `${menuPosition.right}px`
                }}
              >
                {(() => {
                  const request = requests.find(r => r.id === activeActionMenu);
                  if (!request) return null;

                  return (
                    <>
                      <button
                        onClick={async () => {
                          setActiveActionMenu(null);
                          try {
                            const fresh = await fetchTicketById(request.id);
                            setDetailRequest(fresh || request);
                          } catch (e) {
                            console.warn('Failed to fetch ticket details, showing local copy', e);
                            setDetailRequest(request);
                          }
                        }}
                        className="w-full text-left px-4 md:px-6 py-2.5 md:py-3.5 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 md:gap-3 transition-colors"
                      >
                        <Eye size={16} className="md:size-18" /> View Details
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(request)}
                        className="w-full text-left px-4 md:px-6 py-2.5 md:py-3.5 text-xs font-black text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2 md:gap-3 transition-colors"
                      >
                        <Download size={16} className="md:size-18" /> Download PDF
                      </button>
                      <div className="my-2 md:my-3 border-t border-gray-50"></div>
                      <button
                        onClick={() => handlePurgeRequest(request.id)}
                        className="w-full text-left px-4 md:px-6 py-2.5 md:py-3.5 text-xs font-black text-rose-500 hover:bg-rose-50 flex items-center gap-2 md:gap-3 transition-colors"
                      >
                        <Trash2 size={16} className="md:size-18" /> Delete Request
                      </button>
                    </>
                  );
                })()}
              </div>
            </>
          )}

          {/* Ticket Records - FIXED: Proper Sticky Filters with Scrollable Data */}
          <div className="mt-8 md:mt-10 bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
            {/* The key fix is wrapping everything in a single container that will scroll horizontally */}
            <div className="overflow-auto scrollbar-hidden max-h-[500px]">
              {/* Sticky Header Container - using the same scroll container for both axes so header and content scroll together */}
              <div className="sticky top-0 z-10 bg-white min-w-[900px]">
                <div className="px-4 sm:px-6 lg:px-8 py-4 md:py-6 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div className="min-w-[200px]">
                      <h3 className="text-lg font-black text-gray-900">Ticket Records</h3>
                      <p className="text-xs text-gray-400">Recent ticket activity and history</p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                      <div className="relative group flex-1 min-w-[250px]">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors w-4 h-4" />
                        <input
                          id="records-search"
                          type="text"
                          placeholder="Search records..."
                          value={searchQuery}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all text-sm"
                          aria-label="Search ticket records"
                          title="Search ticket records"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <select
                          id="filter-status"
                          value={filterStatus}
                          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilterStatus(e.target.value)}
                          className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none flex-1 min-w-[150px]"
                          aria-label="Filter by status"
                          title="Filter by status"
                        >
                          <option value="all">All Statuses</option>
                          <option value="open">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Finished</option>
                        </select>

                        <button
                          onClick={fetchRecords}
                          className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-bold hover:bg-blue-100 whitespace-nowrap min-w-[100px]"
                        >
                          Refresh
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Fixed Table Header - placed INSIDE the sticky container with column spacing */}
                <div className="sticky top-[66px] md:top-[82px] z-10 bg-white border-b border-gray-100 min-w-[900px]">
                  <div className="grid grid-cols-12 px-4 sm:px-6 lg:px-8 py-3 bg-white">
                    {/* Help Request - 3 columns */}
                    <div className="col-span-3 px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                      <div className="flex items-center gap-2">
                        <span>Help Request</span>
                      </div>
                    </div>

                    {/* Category - 2 columns */}
                    <div className="col-span-2 px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                      Category
                    </div>

                    {/* Status - 2 columns */}
                    <div className="col-span-2 px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Status
                    </div>

                    {/* Date Created - 2 columns */}
                    <div className="col-span-2 px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-left">
                      Date Created
                    </div>

                    {/* Priority - 1 column */}
                    <div className="col-span-1 px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">
                      Priority
                    </div>

                    {/* Options - 2 columns */}
                    <div className="col-span-2 px-3 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">
                      Options
                    </div>
                  </div>
                </div>
              </div>

              {/* Content rows (now using the outer container for scrolling) */}
              <div>
                {isLoadingRecords ? (
                  <div className="py-12 text-center text-gray-400 min-w-[900px]">Loading records...</div>
                ) : filteredRecords.length === 0 ? (
                  <div className="py-12 text-center text-gray-400 min-w-[900px]">No ticket records found</div>
                ) : (
                  <div className="divide-y divide-gray-50 min-w-[900px]">
                    {filteredRecords.map((r: RecordDTO) => (
                      <div key={r.ticketId} className="hover:bg-slate-50/50 transition-colors group">
                        <div className="grid grid-cols-12 px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                          {/* Help Request - 3 columns */}
                          <div className="col-span-3 px-3 text-left">
                            <div className="font-black text-gray-900 text-sm tracking-tight truncate">{r.subject}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1 truncate">ID: {r.ticketId}</div>
                          </div>

                          {/* Category - 2 columns */}
                          <div className="col-span-2 px-3 text-left">
                            <div className="text-[10px] font-black text-gray-800 uppercase tracking-widest truncate">{r.category}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase mt-1 truncate">{r.type}</div>
                          </div>

                          {/* Status - 2 columns */}
                          <div className="col-span-2 px-3 text-center">
                            <div className="flex justify-center items-center gap-2">
                              {normalizeStatus(r.status) === 'in_progress' && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping hidden md:block"></div>
                              )}
                              <span className={`inline-flex items-center px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[9px] font-black uppercase tracking-widest border shadow-sm ${getStatusDisplay(normalizeStatus(r.status)).color} whitespace-nowrap`}>
                                {getStatusDisplay(normalizeStatus(r.status)).text}
                              </span>
                            </div>
                          </div>

                          {/* Date Created - 2 columns */}
                          <div className="col-span-2 px-3 text-left">
                            <div className="text-[10px] font-black text-gray-800 uppercase tabular-nums">
                              {new Date(r.creationDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase mt-1 tabular-nums">
                              {new Date(r.creationDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>

                          {/* Priority - 1 column */}
                          <div className="col-span-1 px-3 text-center">
                            <span className={`inline-flex items-center px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[9px] font-black uppercase tracking-widest shadow-sm ${getPriorityColor(((r.priority || 'medium') as any))} text-white whitespace-nowrap`}>
                              {r.priority || 'medium'}
                            </span>
                          </div>

                          {/* Options - 2 columns */}
                          <div className="col-span-2 px-3 text-right">
                            <button
                              onClick={async () => {
                                try {
                                  const fresh = await fetchTicketById(String(r.ticketId));
                                  if (fresh) setDetailRequest(fresh);
                                } catch (e) {
                                  console.warn('Failed to fetch ticket for details', e);
                                  toast.error('Unable to load ticket details');
                                }
                              }}
                              className="p-2 md:p-2.5 rounded-lg md:rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                              title="View details"
                            >
                              <Eye size={16} className="md:size-18" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Support Sections - Responsive */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm group hover:border-blue-300 transition-all text-left">
              <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 group-hover:rotate-12 transition-transform">
                  <MessageSquare size={24} className="md:size-10" />
                </div>
                <div>
                  <h3 className="font-black text-lg md:text-xl text-gray-900 tracking-tight">Live Support</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Chat with our team</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6 md:mb-10 leading-relaxed font-medium">Chat with our support team for quick help with any institutional issue.</p>
              <button className="w-full py-3 md:py-4 bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:bg-blue-600 hover:text-white hover:border-blue-600 active:scale-95 transition-all shadow-sm">
                Start Chat
              </button>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm group hover:border-emerald-300 transition-all text-left">
              <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:rotate-12 transition-transform">
                  <Clock size={24} className="md:size-10" />
                </div>
                <div>
                  <h3 className="font-black text-lg md:text-xl text-gray-900 tracking-tight">Response Time</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Standard expectation</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6 md:mb-8 leading-relaxed font-medium">We usually reply within:</p>
              <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl border border-emerald-100 text-center uppercase tracking-[0.1em] shadow-inner">
                2-4 Business Hours
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl md:rounded-[2.5rem] p-6 md:p-10 shadow-sm group hover:border-purple-300 transition-all text-left">
              <div className="flex items-center gap-4 md:gap-5 mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 group-hover:rotate-12 transition-transform">
                  <LifeBuoy size={24} className="md:size-10" />
                </div>
                <div>
                  <h3 className="font-black text-lg md:text-xl text-gray-900 tracking-tight">Help Center</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Find answers</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-6 md:mb-10 leading-relaxed font-medium">Find answers to common questions in our simplified FAQ database.</p>
              <button onClick={() => setView('faq')} className="w-full py-3 md:py-4 bg-white border-2 border-gray-100 rounded-xl md:rounded-2xl text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hover:bg-purple-600 hover:text-white hover:border-purple-600 active:scale-95 transition-all shadow-sm">
                View FAQs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Request Modal */}
      <NewRequestModal />

      {/* Details Modal - Responsive */}
      {detailRequest && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDetailRequest(null)} />
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-2xl md:rounded-[3.5rem] shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-300 text-left" onClick={e => e.stopPropagation()}>
              <div className="px-6 md:px-12 py-6 md:py-10 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="pr-4">
                  <h2 className="text-xl md:text-3xl font-black text-gray-900 tracking-tight">Request Details</h2>
                  <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mt-1 truncate">Ticket: {detailRequest.id}</p>
                </div>
                <button
                  type="button"
                  title="Close details"
                  onClick={() => setDetailRequest(null)}
                  className="p-3 md:p-4 hover:bg-rose-50 text-gray-400 hover:text-rose-500 rounded-xl md:rounded-[1.5rem] transition-all active:scale-90 flex-shrink-0"
                >
                  <X className="w-6 h-6 md:w-8 md:h-8" aria-hidden="true" />
                  <span className="sr-only">Close details</span>
                </button>
              </div>

              <div className="p-6 md:p-12 space-y-8 md:space-y-10">
                {detailRequest.status === 'resolved' && (
                  <div className="bg-emerald-50 border-emerald-100 rounded-2xl md:rounded-[2.5rem] p-6 md:p-8 flex items-center gap-4 md:gap-6 shadow-sm border-2 animate-in slide-in-from-top-4 duration-500">
                    <div className="w-12 h-12 md:w-16 md:h-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-xl shadow-emerald-100 border-4 border-white flex-shrink-0">
                      <Check size={24} className="md:size-32" />
                    </div>
                    <div>
                      <h4 className="text-base md:text-lg font-black text-emerald-900 uppercase tracking-widest">Finished & Verified</h4>
                      <p className="text-sm text-emerald-700 font-medium">This issue has been successfully resolved and confirmed by our team.</p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center gap-6 md:gap-8 p-6 md:p-8 bg-slate-50 border border-slate-100 rounded-2xl md:rounded-[2.5rem]">
                  <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl flex items-center justify-center bg-white border border-slate-200 shadow-sm ${getStatusDisplay(detailRequest.status).color.split(' ')[1]} flex-shrink-0`}>
                    <ShieldCheck size={24} className="md:size-32" />
                  </div>
                  <div className="flex-1 w-full">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Ticket Status</p>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
                      <span className={`px-4 md:px-5 py-2 rounded-xl md:rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusDisplay(detailRequest.status).color} inline-block w-fit`}>
                        {getStatusDisplay(detailRequest.status).text}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPriorityColor(detailRequest.priority)}`}></div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{detailRequest.priority} Priority</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6 md:space-y-8">
                  <div>
                    <h3 className="text-lg md:text-2xl font-black text-gray-900 mb-3">{detailRequest.title}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-gray-500 font-medium">
                      <span className="bg-slate-100 px-3 md:px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest w-fit">{detailRequest.category}</span>
                      <ChevronRight size={16} className="text-slate-300 hidden sm:block" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{detailRequest.type}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl md:rounded-[2rem] p-6 md:p-10 border border-slate-100 italic text-slate-700 leading-relaxed text-sm md:text-base shadow-inner">
                    "{detailRequest.description}"
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 border-t border-gray-50 pt-6 md:pt-8">
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Created On</p>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-3 tabular-nums">
                        <Calendar size={16} className="text-slate-300" /> {new Date(detailRequest.createdAt).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Last Audit</p>
                      <p className="text-sm font-bold text-slate-800 flex items-center gap-3 tabular-nums">
                        <History size={16} className="text-slate-300" /> {new Date(detailRequest.updatedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>

                  {detailRequest.attachments.length > 0 && (
                    <div className="pt-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Attachments</p>
                      <div className="flex flex-wrap gap-3 md:gap-4">
                        {detailRequest.attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-3 md:gap-4 bg-white border border-slate-200 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl shadow-sm hover:border-blue-300 transition-all cursor-pointer group flex-1 min-w-[200px]">
                            <FileText size={18} className="text-blue-600 group-hover:scale-110 transition-transform flex-shrink-0" />
                            <span className="text-xs font-bold text-slate-700 truncate">{file}</span>
                            <Download size={16} className="text-slate-300 ml-auto flex-shrink-0" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-6 md:pt-10 border-t border-gray-100 flex flex-col sm:flex-row gap-3 md:gap-5">
                  <button onClick={() => handleDownloadPDF(detailRequest)} className="flex-1 py-4 md:py-5 bg-slate-900 text-white rounded-xl md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95 shadow-xl shadow-slate-100">
                    <Download size={18} className="md:size-20" /> Download PDF Report
                  </button>
                  <button onClick={() => setDetailRequest(null)} className="px-6 md:px-10 py-4 md:py-5 bg-gray-100 text-gray-500 rounded-xl md:rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-gray-200 transition-all active:scale-95">Close</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scrollbar styles moved to global CSS for accessibility */}
    </div>
  );
};

export default Requests;