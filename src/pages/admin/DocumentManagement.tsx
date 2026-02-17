import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { EmployeeSummary, EmployeeDocument } from '../../types.ts';
import { uploadDocument, getDocumentsByEmployee, getDocument, downloadDocument, deleteDocument, getStatusForEmployee } from '../../api/documents.js';
import { getAllEmployees, getDepartments } from '../../api/users.js';
import { DEPARTMENTS } from '../../constants.ts';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
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
    'Aadhaar Card': 'AADHAR',
    'PAN Card': 'PAN',
    'Educational Certificate': 'EDUCATION',
    'Offer Letter': 'OFFER',
    'Relieving Letter': 'RELIEVING',
    'Bank Passbook': 'BANK',
    'Resume': 'RESUME'
  };

  const apiToDisplayType = (api: string) => {
    const map: Record<string, string> = Object.fromEntries(Object.entries(displayToApiType).map(([k, v]) => [v, k]));
    return map[api] || api;
  };

  const filteredEmployees = useMemo(() => {
    return employees.filter(emp => {
      const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept = deptFilter === 'All' || emp.department === deptFilter;
      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, deptFilter]);

  const docTypes = ['Aadhaar Card', 'PAN Card', 'Educational Certificate', 'Offer Letter', 'Relieving Letter', 'Bank Passbook', 'Resume'];

  const getDocData = (emp: any, type: string): EmployeeDocument | undefined => {
    return emp.documents?.find((d: any) => d.type === type);
  };

  const getDocStatus = (emp: any, type: string): 'uploaded' | 'pending' | 'verified' => {
    const doc = getDocData(emp, type);
    return doc?.status || 'pending';
  };

  const handleUpdateDocument = (empId: string, type: string, status: 'uploaded' | 'verified' | 'pending', fileName?: string) => {
    const emp = employees.find(e => e.id === empId);
    if (!emp) return;

    const currentDocs = (emp as any).documents || [];
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
    addLog('Update', 'Document', `${status.toUpperCase()} ${type} for ${emp.fullName}`);

    if (selectedEmployee && selectedEmployee.id === empId) {
      setSelectedEmployee({ ...emp, documents: newDocs } as any);
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
      // call upload endpoint
      (async () => {
        try {
          const apiType = displayToApiType[activeUpload.type] || activeUpload.type;
          const resp = await uploadDocument(file, { employeeId: activeUpload.empId, documentType: apiType });
          // refresh docs for employee
          if (selectedEmployee && selectedEmployee.employeeId === activeUpload.empId) {
            const docs = await getDocumentsByEmployee(activeUpload.empId);
            const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({ ...d, type: apiToDisplayType(d.documentType) }));
            setSelectedEmployeeDocs(mapped);
            updateEmployee(selectedEmployee.id, { documents: mapped } as any);
          }
        } catch (err: any) {
          notify(`Upload failed: ${err.message || err}`, 'error');
        } finally {
          setActiveUpload(null);
          e.target.value = '';
        }
      })();
    }
  };

  // fetch all employees and departments (for upload modal / selection)
  useEffect(() => {
    (async () => {
      try {
        const [all, depts] = await Promise.all([getAllEmployees(), getDepartments()]);
        setEmployeesList(Array.isArray(all) ? all : []);
        setDepartmentsList(Array.isArray(depts) ? depts : []);
      } catch (err) {
        // non-blocking
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
      // refresh if viewing same employee
      if (selectedEmployee && selectedEmployee.employeeId === uploadForm.employeeId) {
        const docs = await getDocumentsByEmployee(uploadForm.employeeId);
        const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({ ...d, type: apiToDisplayType(d.documentType) }));
        setSelectedEmployeeDocs(mapped);
        updateEmployee(selectedEmployee.id, { documents: mapped } as any);
      }
      setUploadModalOpen(false);
    } catch (err: any) {
      notify(`Upload failed: ${err.message || err}`, 'error');
    }
  };

  const viewDocument = (doc: any) => {
    // if document has id from API, fetch full content
    (async () => {
      try {
        if (doc.id && selectedEmployee) {
          const full = await getDocument(selectedEmployee.employeeId, doc.id);
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
        const res = await downloadDocument(selectedEmployee.employeeId, doc.id);
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

  // fetch docs when a selectedEmployee is opened
  useEffect(() => {
    if (!selectedEmployee) {
      setSelectedEmployeeDocs([]);
      return;
    }
    (async () => {
      try {
        const docs = await getDocumentsByEmployee(selectedEmployee.employeeId);
        const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({ ...d, type: apiToDisplayType(d.documentType) }));
        setSelectedEmployeeDocs(mapped);
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
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
              : 'bg-white border border-slate-200 text-black hover:bg-slate-50'
              }`}
          >
            <Icon name="FileDown" className="w-4 h-4 text-black" />
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
          </div>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-slate-50 max-h-[60vh] overflow-y-auto invisible-scrollbar">
          <table className="w-full">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-100">
                <th className="py-6 px-8 text-left w-12">
                  <input
                    aria-label="Select all employees"
                    type="checkbox"
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    checked={selectedIds.size === filteredEmployees.length && filteredEmployees.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="text-left py-6 px-2 text-[11px] font-black text-black uppercase tracking-widest">Employee</th>
                <th className="text-center py-6 px-4 text-[11px] font-black text-black uppercase tracking-widest">Aadhaar</th>
                <th className="text-center py-6 px-4 text-[11px] font-black text-black uppercase tracking-widest">PAN</th>
                <th className="text-center py-6 px-4 text-[11px] font-black text-black uppercase tracking-widest">Certificates</th>
                <th className="text-center py-6 px-4 text-[11px] font-black text-black uppercase tracking-widest">Offer</th>
                <th className="text-right py-6 px-8 text-[11px] font-black text-black uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredEmployees.map((emp: any) => (
                <tr key={emp.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.has(emp.id) ? 'bg-indigo-50/20' : ''}`}>
                  <td className="py-6 px-8">
                    <input
                      aria-label={`Select ${emp.fullName}`}
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      checked={selectedIds.has(emp.id)}
                      onChange={() => toggleSelect(emp.id)}
                    />
                  </td>
                  <td className="py-6 px-2">
                    <div className="flex items-center gap-4">
                      <img src={emp.avatar} className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm" alt={`${emp.fullName} avatar`} />
                      <div>
                        <p className="font-black text-black leading-none mb-1 text-sm">{emp.fullName}</p>
                        <p className="text-[10px] font-bold text-black uppercase tracking-widest">{emp.employeeId} • {emp.department}</p>
                      </div>
                    </div>
                  </td>
                  {['Aadhaar Card', 'PAN Card', 'Educational Certificate', 'Offer Letter'].map(type => {
                    const status = getDocStatus(emp, type);
                    return (
                      <td key={type} className="py-6 px-4 text-center">
                        <button
                          aria-label={`Open document repository for ${emp.fullName}`}
                          onClick={() => setSelectedEmployee(emp)}
                          className={`p-2 rounded-xl transition-all ${status === 'verified' ? 'bg-emerald-50 text-emerald-500' :
                            status === 'uploaded' ? 'bg-blue-50 text-blue-500' :
                              'bg-slate-50 text-black'
                            }`}
                        >
                          <Icon name={status === 'verified' ? 'CheckCircle2' : status === 'uploaded' ? 'FileCheck' : 'FileWarning'} className="w-5 h-5" />
                        </button>
                      </td>
                    );
                  })}
                  <td className="py-6 px-8 text-right">
                    <button
                      onClick={() => setSelectedEmployee(emp)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {filteredEmployees.length === 0 && (
                employeesList.length > 0 ? (
                  employeesList.map((emp: any) => (
                    <tr key={emp.employeeId} className={`hover:bg-slate-50/50 transition-colors group`}>
                      <td className="py-6 px-8">
                        <input
                          aria-label={`Select ${emp.fullName}`}
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                          checked={selectedIds.has(emp.id || emp.employeeId)}
                          onChange={() => toggleSelect(emp.id || emp.employeeId)}
                        />
                      </td>
                      <td className="py-6 px-2">
                        <div className="flex items-center gap-4">
                          <img src={emp.avatar} className="w-10 h-10 rounded-xl border border-slate-100 shadow-sm" alt={`${emp.fullName} avatar`} />
                          <div>
                            <p className="font-black text-black leading-none mb-1 text-sm">{emp.fullName}</p>
                            <p className="text-[10px] font-bold text-black uppercase tracking-widest">{emp.employeeId} • {emp.department}</p>
                          </div>
                        </div>
                      </td>
                      {['Aadhaar Card', 'PAN Card', 'Educational Certificate', 'Offer Letter'].map(type => {
                        const status = getDocStatus(emp, type);
                        return (
                          <td key={type} className="py-6 px-4 text-center">
                            <div className={`p-2 rounded-xl transition-all ${status === 'verified' ? 'bg-emerald-50 text-emerald-500' : status === 'uploaded' ? 'bg-blue-50 text-blue-500' : 'bg-slate-50 text-black'}`}>
                              <button onClick={() => triggerFileUpload(emp.employeeId, type)} className="p-1">
                                <Icon name={status === 'verified' ? 'CheckCircle2' : status === 'uploaded' ? 'FileCheck' : 'Upload'} className="w-5 h-5" />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                      <td className="py-6 px-8 text-right">
                        <button
                          onClick={() => setSelectedEmployee(emp)}
                          className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                        >
                          Manage
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon name="SearchX" className="w-8 h-8 text-black" />
                      </div>
                      <p className="text-black font-black uppercase text-xs tracking-widest">No matching personal records found</p>
                    </td>
                  </tr>
                )
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
              <img src={selectedEmployee.avatar} className="w-16 h-16 rounded-2xl border-4 border-white shadow-md" alt={`${selectedEmployee.fullName} avatar`} />
              <div>
                <h3 className="text-xl font-black text-black">{selectedEmployee.fullName}</h3>
                <p className="text-xs font-bold text-black uppercase tracking-widest mt-1">{selectedEmployee.employeeId} • {selectedEmployee.designation}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] ml-2">Statutory & Educational Records</h4>
              <div className="grid grid-cols-1 gap-4">
                {docTypes.map(type => {
                  const doc = getDocData(selectedEmployee, type);
                  const status = doc?.status || 'pending';
                  return (
                    <div key={type} className="bg-white border border-slate-100 p-5 rounded-3xl flex items-center justify-between group hover:shadow-lg hover:shadow-indigo-500/5 transition-all">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-2xl transition-colors ${status === 'verified' ? 'bg-emerald-50 text-emerald-600' :
                          status === 'uploaded' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-black'
                          }`}>
                          <Icon name={type === 'Educational Certificate' ? 'GraduationCap' : 'FileText'} className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-black">{type}</p>
                          {doc?.fileName ? (
                            <p className="text-[9px] font-bold text-indigo-600 truncate max-w-[150px]">{doc.fileName}</p>
                          ) : (
                            <p className={`text-[10px] font-black uppercase tracking-widest mt-1 ${status === 'verified' ? 'text-emerald-600' :
                              status === 'uploaded' ? 'text-blue-600' : 'text-black'
                              }`}>
                              {status.toUpperCase()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {status === 'pending' ? (
                          <button
                            onClick={() => triggerFileUpload(selectedEmployee.employeeId, type)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2"
                          >
                            <Icon name="Upload" className="w-3.5 h-3.5 text-white" />
                            Upload
                          </button>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              aria-label="View document"
                              onClick={() => viewDocument(doc!)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100"
                              title="View Document"
                            >
                              <Icon name="Eye" className="w-4 h-4" />
                            </button>

                            {status === 'uploaded' && (
                              <button
                                onClick={() => handleUpdateDocument(selectedEmployee.id, type, 'verified')}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-emerald-100"
                                title="Mark as Verified"
                              >
                                <Icon name="Check" className="w-5 h-5" />
                              </button>
                            )}

                            <button
                              onClick={() => handleUpdateDocument(selectedEmployee.id, type, 'pending')}
                              className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100"
                              title="Delete/Reject"
                            >
                              <Icon name="Trash2" className="w-5 h-5" />
                            </button>
                          </div>
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
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2"
              >
                <Icon name="Download" className="w-4 h-4 text-white" /> Download Archive
              </button>
              <button
                onClick={() => setSelectedEmployee(null)}
                className="flex-1 py-4 bg-white border border-slate-200 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
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
            <select value={uploadForm.employeeId} onChange={(e) => setUploadForm(prev => ({ ...prev, employeeId: e.target.value }))} className="w-full p-3 border rounded-xl text-black">
              <option value="" className="text-black">Select employee</option>
              {employeesList.map(emp => (
                <option key={emp.employeeId} value={emp.employeeId} className="text-black">{emp.fullName} • {emp.employeeId}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-black">Document Type</label>
            <select value={uploadForm.documentType} onChange={(e) => setUploadForm(prev => ({ ...prev, documentType: e.target.value }))} className="w-full p-3 border rounded-xl text-black">
              {docTypes.map(t => <option key={t} value={t} className="text-black">{t}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-black text-black">File</label>
            <input type="file" onChange={handleUploadFileSelect} className="text-black" />
          </div>

          <div className="flex gap-2 justify-end">
            <button onClick={handleUploadSubmit} className="px-4 py-2 bg-indigo-600 text-white rounded-xl">Upload</button>
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
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Icon name="FileText" className="w-5 h-5 text-indigo-600" />
                <span className="text-sm font-black text-indigo-900">{viewingDoc.fileName || 'document.pdf'}</span>
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Uploaded on {viewingDoc.uploadedDate}</span>
            </div>

            <div className="aspect-[3/4] bg-white rounded-[32px] border-4 border-slate-100 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden shadow-inner">
              {/* Mock document content visualization */}
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
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${viewingDoc.status === 'verified' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                    <Icon name={viewingDoc.status === 'verified' ? 'CheckCircle2' : 'FileCheck'} className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-black uppercase leading-none mb-1">Audit Status</p>
                    <p className={`text-sm font-black uppercase tracking-widest ${viewingDoc.status === 'verified' ? 'text-emerald-600' : 'text-blue-600'}`}>{viewingDoc.status}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => handleDownloadSingle(viewingDoc)}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-xl shadow-indigo-100 active:scale-95"
              >
                <Icon name="Download" className="w-4 h-4 text-white" /> Download Original File
              </button>
              <button
                onClick={() => setViewingDoc(null)}
                className="px-8 py-4 bg-white border border-slate-200 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
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