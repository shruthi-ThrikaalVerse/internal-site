import React, { useState, useMemo, useRef, useEffect } from 'react';
import { verifyDocument } from '../../api/verifyDocument.ts';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { EmployeeSummary, EmployeeDocument } from '../../types.ts';
import { uploadDocument, getDocumentsByEmployee, getDocument, downloadDocument, deleteDocument } from '../../api/documents.js';
import { getAllEmployees, getDepartments } from '../../api/users.js';
import { DEPARTMENTS } from '../../constants.ts';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

// Profile Avatar Component with Fallback
const ProfileAvatar = ({ employee }: { employee: any }) => {
  const [imageError, setImageError] = useState(false);

  const getInitials = () => {
    if (!employee.fullName) return '?';
    const names = employee.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
    }
    return employee.fullName[0]?.toUpperCase() || '?';
  };

  // Generate a consistent color based on employee name
  const getAvatarColor = () => {
    const colors = [
      'bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500',
      'bg-orange-500', 'bg-cyan-500', 'bg-amber-500', 'bg-lime-500'
    ];
    if (!employee.fullName) return colors[0];
    const index = employee.fullName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  if (employee.avatar && !imageError) {
    return (
      <img
        src={employee.avatar}
        className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm flex-shrink-0 object-cover"
        alt={`${employee.fullName} avatar`}
        onError={() => setImageError(true)}
      />
    );
  }

  return (
    <div className={`w-10 h-10 rounded-xl ${getAvatarColor()} flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0`}>
      {getInitials()}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-2xl" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-white rounded-[32px] w-full ${maxWidth} relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden`}>
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0">
          <h2 className="text-2xl font-black text-black">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <Icon name="X" className="w-6 h-6 text-black" />
          </button>
        </div>
        <div className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};

const DocumentManagement: React.FC = () => {
  const { employees, updateEmployee, notify, addLog } = useHRMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All'); // New status filter
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummary | null>(null);
  const [viewingDoc, setViewingDoc] = useState<EmployeeDocument | null>(null);

  // Selection state for Bulk Export
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // File upload management
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUpload, setActiveUpload] = useState<{ empId: string, type: string } | null>(null);
  const [selectedEmployeeDocs, setSelectedEmployeeDocs] = useState<any[]>([]);
  const [employeesList, setEmployeesList] = useState<any[]>([]);
  const [departmentsList, setDepartmentsList] = useState<string[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadForm, setUploadForm] = useState<{ employeeId: string; documentType: string; file: File | null }>({ employeeId: '', documentType: 'Aadhaar Card', file: null });

  // map between UI label and API documentType
  const displayToApiType: Record<string, string> = {
    'Aadhaar Card': 'AADHAAR',
    'PAN Card': 'PAN',
    'Educational Certificate': 'CERTIFICATES',
    'Offer Letter': 'OFFER_LETTER',
    'Relieving Letter': 'RELIEVING',
    'Bank Passbook': 'BANK',
    'Resume': 'RESUME'
  };

  const apiToDisplayType = (api: string) => {
    const map: Record<string, string> = Object.fromEntries(Object.entries(displayToApiType).map(([k, v]) => [v, k]));
    return map[api] || api;
  };

  // Filter employees by search, department, and document status
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'All' || emp.department === deptFilter;

      // Status filter logic
      let matchesStatus = true;
      if (statusFilter !== 'All') {
        const empDocs = (emp as any).documents || [];
        if (statusFilter === 'Has Documents') {
          matchesStatus = empDocs.length > 0;
        } else if (statusFilter === 'Verified') {
          matchesStatus = empDocs.some((doc: any) => doc.verified === true);
        } else if (statusFilter === 'Pending') {
          matchesStatus = empDocs.some((doc: any) => doc.status === 'pending') || empDocs.length === 0;
        } else if (statusFilter === 'Uploaded') {
          matchesStatus = empDocs.some((doc: any) => doc.status === 'uploaded');
        }
      }

      return matchesSearch && matchesDept && matchesStatus;
    });
  }, [employees, searchTerm, deptFilter, statusFilter]);

  const docTypes = ['Aadhaar Card', 'PAN Card', 'Educational Certificate', 'Offer Letter', 'Relieving Letter', 'Bank Passbook', 'Resume'];

  const allDocTypesForSelected = useMemo(() => {
    if (!selectedEmployee) return docTypes;
    const existing = (selectedEmployee.documents || []).map((d: any) => d.type as string).filter(Boolean);
    return Array.from(new Set([...docTypes, ...existing]));
  }, [selectedEmployee]);

  const getDocData = (emp: any, type: string): EmployeeDocument | undefined => {
    return emp.documents?.find((d: any) => d.type === type);
  };

  const getDocStatus = (emp: any, type: string): 'uploaded' | 'pending' | 'verified' => {
    const doc = getDocData(emp, type);
    if (doc?.verified === true) return 'verified';
    return doc?.status || 'pending';
  };

  // Get icon based on document status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return 'CheckCircle2';
      case 'uploaded':
        return 'FileCheck';
      default:
        return 'FileWarning';
    }
  };

  const handleUpdateDocument = (empId: string, type: string, status: 'uploaded' | 'verified' | 'pending', fileName?: string) => {
    const sourceEmp = (selectedEmployee && selectedEmployee.id === empId) ? selectedEmployee : employees.find(e => e.id === empId);
    if (!sourceEmp) return;

    const currentDocs = (sourceEmp as any).documents || [];
    const existingDocIndex = currentDocs.findIndex((d: any) => d.type === type);

    let newDocs = [...currentDocs];
    if (existingDocIndex >= 0) {
      newDocs[existingDocIndex] = {
        ...newDocs[existingDocIndex],
        status,
        uploadedDate: new Date().toISOString().split('T')[0],
        fileName: fileName || newDocs[existingDocIndex].fileName
      };
    } else {
      newDocs.push({
        type,
        status,
        uploadedDate: new Date().toISOString().split('T')[0],
        fileName: fileName || 'document.pdf'
      });
    }

    updateEmployee(empId, { documents: newDocs } as any);
    addLog('Update', 'Document', `${status.toUpperCase()} ${type} for ${sourceEmp.fullName}`);

    if (selectedEmployee && selectedEmployee.id === empId) {
      setSelectedEmployee({ ...selectedEmployee, documents: newDocs } as any);
      setSelectedEmployeeDocs(newDocs.map((d: any) => ({
        ...d,
        type: d.type,
        status: d.status || 'uploaded',
        uploadedDate: d.uploadedDate || new Date().toISOString().split('T')[0]
      })));
    }
  };

  const triggerFileUpload = (empId: string, type: string) => {
    setActiveUpload({ empId, type });
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && activeUpload) {
      (async () => {
        try {
          const apiType = displayToApiType[activeUpload.type] || activeUpload.type;
          await uploadDocument(file, { employeeId: activeUpload.empId, documentType: apiType });

          // Always fetch latest docs from backend after upload
          if (selectedEmployee && selectedEmployee.employeeId === activeUpload.empId) {
            const docs = await getDocumentsByEmployee(activeUpload.empId);
            const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({
              ...d,
              type: apiToDisplayType(d.documentType),
              status: d.status || 'uploaded',
              verified: d.verified || false,
              uploadedDate: d.uploadedAt || d.uploadedDate || new Date().toISOString().split('T')[0]
            }));
            setSelectedEmployeeDocs(mapped);
            const updatedEmployee = { ...selectedEmployee, documents: mapped };
            updateEmployee(selectedEmployee.id, { documents: mapped } as any);
            setSelectedEmployee(updatedEmployee as any);
          }
          notify('Document uploaded successfully', 'success');
        } catch (err: any) {
          notify(`Upload failed: ${err.message || err}`, 'error');
        } finally {
          setActiveUpload(null);
          e.target.value = '';
        }
      })();
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const [all, depts] = await Promise.all([getAllEmployees(), getDepartments()]);
        setEmployeesList(Array.isArray(all) ? all : []);
        setDepartmentsList(Array.isArray(depts) ? depts : []);
      } catch (err) {
        console.error('Failed to load employees/departments', err);
      }
    })();
  }, []);

  const openUploadModal = (forEmployeeId?: string) => {
    setUploadForm({ employeeId: forEmployeeId || '', documentType: 'Aadhaar Card', file: null });
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
  };

  const handleUploadFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setUploadForm(prev => ({ ...prev, file: f }));
  };

  const handleUploadSubmit = async () => {
    if (!uploadForm.employeeId || !uploadForm.file) {
      notify('Please select an employee and a file to upload', 'warning');
      return;
    }
    try {
      const apiType = displayToApiType[uploadForm.documentType] || uploadForm.documentType;
      await uploadDocument(uploadForm.file, { employeeId: uploadForm.employeeId, documentType: apiType });

      if (selectedEmployee && selectedEmployee.employeeId === uploadForm.employeeId) {
        const docs = await getDocumentsByEmployee(uploadForm.employeeId);
        const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({
          ...d,
          type: apiToDisplayType(d.documentType),
          status: d.status || 'uploaded', verified: d.verified || false, uploadedDate: d.uploadedAt || d.uploadedDate || new Date().toISOString().split('T')[0]
        }));
        setSelectedEmployeeDocs(mapped);
        const updatedEmployee = { ...selectedEmployee, documents: mapped };
        updateEmployee(selectedEmployee.id, { documents: mapped } as any);
        setSelectedEmployee(updatedEmployee as any);
      }
      notify('Document uploaded successfully', 'success');
      setUploadModalOpen(false);
      setUploadForm({ employeeId: '', documentType: 'Aadhaar Card', file: null });
    } catch (err: any) {
      notify(`Upload failed: ${err.message || err}`, 'error');
    }
  };

  const viewDocument = (doc: any) => {
    (async () => {
      try {
        if (doc.id && selectedEmployee) {
          const full = await getDocument(selectedEmployee.employeeId, doc.id as number);
          if (full && full.fileDataBase64) {
            const byteChars = atob(full.fileDataBase64);
            const byteNumbers = new Array(byteChars.length).fill(0).map((_, i) => byteChars.charCodeAt(i));
            const byteArray = new Uint8Array(byteNumbers);
            const blob = new Blob([byteArray], { type: full.fileType || 'application/octet-stream' });
            setViewingDoc({
              ...doc,
              fileName: full.fileName,
              uploadedDate: full.uploadedAt || doc.uploadedAt,
              fileBlob: blob,
              fileType: full.fileType
            } as any);
            return;
          }
        }
        setViewingDoc(doc);
      } catch (err: any) {
        notify(`Failed to load document: ${err.message || err}`, 'error');
      }
    })();
  };

  const handleDeleteDocument = async (type: string) => {
    if (!selectedEmployee) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete the ${type} document? This action cannot be undone.`);
    if (!confirmDelete) return;

    try {
      const doc = getDocData(selectedEmployee, type) as any;
      if (doc?.id) {
        await deleteDocument(selectedEmployee.employeeId, doc.id as number);
      }

      const docs = await getDocumentsByEmployee(selectedEmployee.employeeId);
      const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({
        ...d,
        type: apiToDisplayType(d.documentType),
        status: d.status || 'uploaded',
        verified: d.verified || false,
        uploadedDate: d.uploadedAt || d.uploadedDate || new Date().toISOString().split('T')[0]
      }));
      setSelectedEmployeeDocs(mapped);
      const updatedEmployee = { ...selectedEmployee, documents: mapped };
      updateEmployee(selectedEmployee.id, { documents: mapped } as any);
      setSelectedEmployee(updatedEmployee as any);

      notify(`${type} document deleted successfully`, 'success');
      addLog('Delete', 'Document', `Deleted ${type} for ${selectedEmployee.fullName}`);
    } catch (err: any) {
      notify(`Failed to delete document: ${err.message || err}`, 'error');
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredEmployees.map(e => e.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDownloadSingle = async (doc: any) => {
    try {
      if (doc.fileBlob) {
        const url = URL.createObjectURL(doc.fileBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = doc.fileName || 'document.bin';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        return;
      }
      if (doc.id && selectedEmployee) {
        const res = await downloadDocument(doc.id as number);
        const url = URL.createObjectURL(res.blob);
        const link = document.createElement('a');
        link.href = url;
        const filenameMatch = res.disposition?.match(/filename\*=UTF-8''(.+)|filename="?([^";]+)"?/i);
        const filename = filenameMatch ? decodeURIComponent(filenameMatch[1] || filenameMatch[2]) : (doc.fileName || 'document.bin');
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      notify(`Download failed: ${err.message || err}`, 'error');
    }
  };

  useEffect(() => {
    if (!selectedEmployee) {
      setSelectedEmployeeDocs([]);
      return;
    }
    (async () => {
      try {
        const docs = await getDocumentsByEmployee(selectedEmployee.employeeId);
        const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({
          ...d,
          type: apiToDisplayType(d.documentType),
          status: d.status || 'uploaded',
          verified: d.verified || false,
          uploadedDate: d.uploadedAt || d.uploadedDate || new Date().toISOString().split('T')[0]
        }));
        setSelectedEmployeeDocs(mapped);
        updateEmployee(selectedEmployee.id, { documents: mapped } as any);
      } catch (err: any) {
        notify(`Failed to load documents: ${err.message || err}`, 'error');
      }
    })();
  }, [selectedEmployee]);

  const handleBulkExport = () => {
    const selectedEmployees = employees.filter(e => selectedIds.has(e.id));
    if (selectedEmployees.length === 0) {
      notify("Please select at least one employee for bulk export.", "warning");
      return;
    }

    const headers = ["Employee ID", "Full Name", "Department", "Document Type", "Status", "Upload Date", "File Name"];
    const rows: string[][] = [];

    selectedEmployees.forEach(emp => {
      const docs = (emp as any).documents || [];
      if (docs.length === 0) {
        rows.push([emp.employeeId, emp.fullName, emp.department, "N/A", "No Documents", "N/A", "N/A"]);
      } else {
        docs.forEach((doc: any) => {
          rows.push([
            emp.employeeId,
            emp.fullName,
            emp.department,
            doc.type,
            doc.status,
            doc.uploadedDate || 'N/A',
            doc.fileName || 'N/A'
          ]);
        });
      }
    });

    const csvContent = "data:text/csv;charset=utf-8,"
      + [headers, ...rows].map(e => e.map(val => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `HRMS_Bulk_Documents_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    addLog('Export', 'Document', `Bulk exported document data for ${selectedEmployees.length} records`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        title="Upload document file"
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-black tracking-tight">Compliance & Documents</h1>
          <p className="text-slate-600 text-sm font-medium">Verify and manage statutory documentation for {employees.length} Personnel.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleBulkExport}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm transition-all ${selectedIds.size > 0
              ? 'text-white'
              : 'bg-white border border-slate-200 text-black hover:bg-slate-50'
              }`}
          >
            <Icon name="FileDown" className="w-4 h-4" />
            Bulk Export {selectedIds.size > 0 ? `(${selectedIds.size})` : ''}
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
          <div className="flex flex-1 items-center gap-4 w-full">
            <div className="relative flex-1 group">
              <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-black group-focus-within:text-indigo-500 transition-colors" />
              <input
                aria-label="Search by Employee ID or Name"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by Employee ID or Name..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-black placeholder:text-slate-400 shadow-inner"
              />
            </div>
            <select
              aria-label="Filter by department"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xs uppercase tracking-widest text-black shadow-inner"
            >
              <option value="All" className="text-black">All Departments</option>
              {DEPARTMENTS.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
            </select>

            {/* New Status Filter */}
            <select
              aria-label="Filter by document status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xs uppercase tracking-widest text-black shadow-inner"
            >
              <option value="All">All Status</option>
              <option value="Has Documents">Has Documents</option>
              <option value="Verified">Verified</option>
              <option value="Uploaded">Uploaded</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-50 max-h-[60vh] overflow-y-auto invisible-scrollbar bg-white">
          <style>{`
            .invisible-scrollbar {
              scrollbar-width: thin;
              scrollbar-color: transparent transparent;
            }
            .invisible-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
              background: transparent;
            }
            .invisible-scrollbar::-webkit-scrollbar-thumb {
              background: transparent;
            }
            .invisible-scrollbar:hover::-webkit-scrollbar-thumb {
              background: #e2e8f0;
              border-radius: 20px;
            }
            .invisible-scrollbar::-webkit-scrollbar-track {
              background: transparent;
            }
          `}</style>
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-white sticky top-0 z-10">
              <tr className="border-b border-slate-100">
                <th className="py-6 pl-8 pr-4 text-left w-12">
                  <input
                    aria-label="Select all employees"
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left py-6 px-4 text-[11px] font-black text-black uppercase tracking-widest whitespace-nowrap">Employee</th>
                {docTypes.map((t) => (
                  <th key={t} className="text-center py-6 px-4 text-[11px] font-black text-black uppercase tracking-widest whitespace-nowrap min-w-[100px]">{t}</th>
                ))}
                <th className="text-right py-6 pr-8 pl-4 text-[11px] font-black text-black uppercase tracking-widest whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {filteredEmployees.map((emp: any) => (
                <tr key={emp.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.has(emp.id) ? 'bg-[#f0e6dc]/20' : ''}`}>
                  <td className="py-6 pl-8 pr-4">
                    <input
                      aria-label={`Select ${emp.fullName}`}
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedIds.has(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                    />
                  </td>
                  <td className="py-6 px-4">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <ProfileAvatar employee={emp} />
                      <div className="min-w-0">
                        <p className="font-black text-black leading-none mb-1 text-sm truncate">{emp.fullName}</p>
                        <p className="text-[10px] font-bold text-black uppercase tracking-widest truncate">{emp.employeeId} • {emp.department}</p>
                      </div>
                    </div>
                  </td>
                  {docTypes.map(type => {
                    const status = getDocStatus(emp, type);
                    return (
                      <td key={type} className="py-6 px-4 text-center">
                        <button
                          aria-label={`Manage ${type} document for ${emp.fullName}`}
                          onClick={() => setSelectedEmployee(emp)}
                          className={`p-2 rounded-xl transition-all mx-auto ${status === 'verified' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' :
                            status === 'uploaded' ? 'bg-[#f5ede3] text-[#8b5a3c]' :
                              'bg-slate-50 text-slate-400 hover:bg-slate-100'
                            }`}
                          title={`${type}: ${status}`}
                        >
                          <Icon name={getStatusIcon(status)} className="w-5 h-5" />
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-6 pr-8 pl-4 text-right">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm whitespace-nowrap" style={{ backgroundColor: '#f5ede3', color: '#8b5a3c' }} onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#c97a4c'; e.currentTarget.style.color = 'white'; }} onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f5ede3'; e.currentTarget.style.color = '#8b5a3c'; }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                <tr>
                  <td colSpan={10} className="py-20 text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Icon name="SearchX" className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-600 font-black uppercase text-xs tracking-widest">No matching employee records found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Repository Modal */}
      <Modal
        isOpen={!!selectedEmployee}
        onClose={() => setSelectedEmployee(null)}
        title={`Document Repository: ${selectedEmployee?.fullName}`}
      >
        {selectedEmployee && (
          <div className="space-y-8">
            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[32px] border border-slate-100">
              <ProfileAvatar employee={selectedEmployee} />
              <div className="min-w-0">
                <h3 className="text-xl font-black text-black truncate">{selectedEmployee.fullName}</h3>
                <p className="text-xs font-bold text-black uppercase tracking-widest mt-1 truncate">{selectedEmployee.employeeId} • {selectedEmployee.designation}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Statutory & Educational Records</h4>
              <div className="grid grid-cols-1 gap-4">
                {allDocTypesForSelected.map(type => {
                  const doc = getDocData(selectedEmployee, type);
                  const status = doc?.status || 'pending';
                  return (
                    <div key={type} className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div className={`p-3 rounded-2xl transition-colors flex-shrink-0 ${status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                          status === 'uploaded' ? 'bg-[#f5ede3] text-[#8b5a3c]' :
                            'bg-slate-50 text-slate-400'
                          }`}>
                          <Icon name={type === 'Educational Certificate' ? 'GraduationCap' : 'FileText'} className="w-6 h-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-black truncate">{type}</p>
                          {doc?.fileName ? (
                            <p className="text-[9px] font-bold text-indigo-600 truncate max-w-[200px]">{doc.fileName}</p>
                          ) : (
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${status === 'verified' ? 'text-emerald-600' :
                              status === 'uploaded' ? 'text-[#8b5a3c]' :
                                'text-slate-400'
                              }`}>
                              {status.toUpperCase()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        {/* Document action buttons logic */}
                        {doc ? (
                          <>
                            <button
                              aria-label="View document"
                              onClick={() => viewDocument(doc!)}
                              className="px-3 py-2 text-white rounded-lg transition-colors border-none flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-md whitespace-nowrap" style={{ backgroundColor: '#c97a4c', boxShadow: '0 10px 15px -3px rgba(201, 122, 76, 0.2)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
                              title="View Document"
                            >
                              <Icon name="Eye" className="w-4 h-4" />
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteDocument(type)}
                              className="px-3 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors border-none flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-md shadow-rose-100 whitespace-nowrap"
                              title="Delete Document"
                            >
                              <Icon name="Trash2" className="w-4 h-4" />
                              Delete
                            </button>
                            {!doc.verified && (
                              <button
                                onClick={async () => {
                                  try {
                                    await verifyDocument(selectedEmployee.employeeId, doc.id as number);
                                    // Fetch latest docs from backend after verification
                                    const docs = await getDocumentsByEmployee(selectedEmployee.employeeId);
                                    const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({
                                      ...d,
                                      type: apiToDisplayType(d.documentType),
                                      status: d.status || 'uploaded',
                                      verified: d.verified || false,
                                      uploadedDate: d.uploadedAt || d.uploadedDate || new Date().toISOString().split('T')[0]
                                    }));
                                    setSelectedEmployeeDocs(mapped);
                                    const updatedEmployee = { ...selectedEmployee, documents: mapped };
                                    updateEmployee(selectedEmployee.id, { documents: mapped } as any);
                                    setSelectedEmployee(updatedEmployee as any);
                                    notify('Document verified successfully', 'success');
                                  } catch (err: any) {
                                    notify(`Verification failed: ${err.message || err}`, 'error');
                                  }
                                }}
                                className="px-3 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors border-none flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-md shadow-emerald-100 whitespace-nowrap"
                                title="Verify Document"
                              >
                                <Icon name="CheckCircle2" className="w-4 h-4" />
                                Verify
                              </button>
                            )}
                          </>
                        ) : (
                          <button
                            onClick={() => triggerFileUpload(selectedEmployee.employeeId, type)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 whitespace-nowrap"
                          >
                            <Icon name="Upload" className="w-3.5 h-3.5 text-white" />
                            Upload
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-50 flex gap-4">
              <button
                onClick={() => {
                  if (!selectedIds.has(selectedEmployee.id)) {
                    toggleSelect(selectedEmployee.id);
                  }
                  handleBulkExport();
                }}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 whitespace-nowrap"
              >
                <Icon name="Download" className="w-4 h-4 text-white" /> Download Archive
              </button>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="flex-1 py-4 bg-white border border-slate-200 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all whitespace-nowrap"
              >
                Close Vault
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Modal (select any employee + file) */}
      <Modal isOpen={uploadModalOpen} onClose={closeUploadModal} title="Upload Document">
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-black">Employee</label>
            <select
              title="Select employee"
              value={uploadForm.employeeId}
              onChange={(e) => setUploadForm(prev => ({ ...prev, employeeId: e.target.value }))}
              className="w-full p-3 border rounded-xl text-black"
            >
              <option value="" className="text-black">Select employee</option>
              {employeesList.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId} className="text-black">{emp.fullName} • {emp.employeeId}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-black">Document Type</label>
            <select
              title="Select document type"
              value={uploadForm.documentType}
              onChange={(e) => setUploadForm(prev => ({ ...prev, documentType: e.target.value }))}
              className="w-full p-3 border rounded-xl text-black"
            >
              {docTypes.map(t => <option key={t} value={t} className="text-black">{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-black">File</label>
            <input
              type="file"
              title="Upload document file"
              onChange={handleUploadFileSelect}
              className="text-black"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={handleUploadSubmit} className="px-4 py-2 text-white rounded-xl" style={{ backgroundColor: '#c97a4c' }}>Upload</button>
            <button onClick={closeUploadModal} className="px-4 py-2 bg-white border rounded-xl text-black">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal
        isOpen={!!viewingDoc}
        onClose={() => setViewingDoc(null)}
        title={`Preview: ${viewingDoc?.type}`}
        maxWidth="max-w-4xl"
      >
        {viewingDoc && (
          <div className="space-y-6">
            <div className="p-4 border rounded-2xl flex items-center justify-between" style={{ backgroundColor: '#f5ede3', borderColor: '#c97a4c', borderWidth: '2px' }}>
              <div className="flex items-center gap-3 min-w-0">
                <Icon name="FileText" className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                <span className="text-sm font-black text-indigo-900 truncate">{viewingDoc.fileName || 'document.pdf'}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 whitespace-nowrap ml-4">Uploaded on {viewingDoc.uploadedDate}</span>
            </div>

            <div className="aspect-[3/4] bg-white rounded-[32px] border-4 border-slate-100 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none overflow-hidden text-[10px] leading-relaxed font-serif p-10 text-left text-black">
                {Array.from({ length: 120 }).map((_, i) => (
                  <p key={i} className="mb-2 text-black">OFFICIAL RECORD: {viewingDoc.type} (Verified ID: {Math.random().toString(36).substring(7).toUpperCase()}) - This document contains sensitive personal information protected under the Organizational Data Privacy Act. System integrity hash: {Date.now()}. Access timestamp: {new Date().toISOString()}. Authorization level: TIER-1 ADMIN.</p>
                ))}
              </div>

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-slate-100">
                  <Icon name={viewingDoc.status === 'verified' ? 'ShieldCheck' : 'FileSearch'} className={`w-12 h-12 ${viewingDoc.status === 'verified' ? 'text-emerald-600' : 'text-indigo-600'}`} />
                </div>
                <h3 className="text-2xl font-black text-black mb-2">{viewingDoc.type}</h3>
                <p className="text-black text-sm max-w-sm font-medium leading-relaxed mb-8">
                  Secure preview of <span className="text-indigo-600 font-bold">{viewingDoc.fileName}</span>.
                  The document is verified as {viewingDoc.status === 'verified' ? 'compliant' : 'authentic'}.
                </p>

                <div className="w-full max-w-md space-y-4">
                  <div className="h-2 bg-slate-50 rounded-full w-full overflow-hidden">
                    <div className="h-full bg-slate-200 w-full animate-pulse"></div>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full w-3/4 overflow-hidden">
                    <div className="h-full bg-slate-200 w-full animate-pulse delay-75"></div>
                  </div>
                  <div className="h-2 bg-slate-50 rounded-full w-5/6 overflow-hidden">
                    <div className="h-full bg-slate-200 w-full animate-pulse delay-150"></div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-10 right-10">
                <div className="p-5 bg-white/90 backdrop-blur-xl rounded-[24px] border border-slate-100 shadow-2xl flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${viewingDoc.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f5ede3] text-[#8b5a3c]'}`}>
                    <Icon name={viewingDoc.status === 'verified' ? 'CheckCircle2' : 'FileCheck'} className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-black uppercase leading-none mb-1">Audit Status</p>
                    <p className={`text-sm font-black uppercase tracking-widest ${viewingDoc.status === 'verified' ? 'text-emerald-600' : 'text-[#8b5a3c]'}`}>{viewingDoc.status}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleDownloadSingle(viewingDoc)}
                className="flex-1 py-4 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 active:scale-95 whitespace-nowrap" style={{ backgroundColor: '#c97a4c', boxShadow: '0 20px 25px -5px rgba(201, 122, 76, 0.2)' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#a56137'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#c97a4c'}
              >
                <Icon name="Download" className="w-4 h-4 text-white" /> Download Original File
              </button>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-8 py-4 bg-white border border-slate-200 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all whitespace-nowrap"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DocumentManagement;