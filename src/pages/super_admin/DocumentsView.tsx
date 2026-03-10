import React, { useState, useMemo, useRef, useEffect } from 'react';
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

const DocumentsView: React.FC = () => {
    const { employees, updateEmployee, notify, addLog } = useHRMS();
    const [searchTerm, setSearchTerm] = useState('');
    const [deptFilter, setDeptFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedEmployee, setSelectedEmployee] = useState<EmployeeSummary | null>(null);
    const [viewingDoc, setViewingDoc] = useState<EmployeeDocument | null>(null);

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [activeUpload, setActiveUpload] = useState<{ empId: string, type: string } | null>(null);
    const [selectedEmployeeDocs, setSelectedEmployeeDocs] = useState<any[]>([]);
    const [employeesList, setEmployeesList] = useState<any[]>([]);
    const [departmentsList, setDepartmentsList] = useState<string[]>([]);
    const [uploadModalOpen, setUploadModalOpen] = useState(false);
    const [uploadForm, setUploadForm] = useState<{ employeeId: string; documentType: string; file: File | null }>({ employeeId: '', documentType: 'Aadhaar Card', file: null });

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

    // Filter to show ONLY ADMIN employees
    const adminEmployees = useMemo(() => {
        return employees.filter(emp => {
            const role = (emp as any).role?.toUpperCase() || emp.role?.toUpperCase() || '';
            return role === 'ADMIN' || role === 'PROJECT_MANAGER';
        });
    }, [employees]);

    // Filter admins by search, department, and document status
    const filteredAdmins = useMemo(() => {
        return adminEmployees.filter(emp => {
            const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesDept = deptFilter === 'All' || emp.department === deptFilter;

            let matchesStatus = true;
            if (statusFilter !== 'All') {
                const empDocs = (emp as any).documents || [];
                if (statusFilter === 'Has Documents') {
                    matchesStatus = empDocs.length > 0;
                } else if (statusFilter === 'Verified') {
                    matchesStatus = empDocs.some((doc: any) => doc.status === 'verified');
                } else if (statusFilter === 'Pending') {
                    matchesStatus = empDocs.some((doc: any) => doc.status === 'pending') || empDocs.length === 0;
                } else if (statusFilter === 'Uploaded') {
                    matchesStatus = empDocs.some((doc: any) => doc.status === 'uploaded');
                }
            }

            return matchesSearch && matchesDept && matchesStatus;
        });
    }, [adminEmployees, searchTerm, deptFilter, statusFilter]);

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
        return doc?.status || 'pending';
    };

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

                    if (selectedEmployee && selectedEmployee.employeeId === activeUpload.empId) {
                        const docs = await getDocumentsByEmployee(activeUpload.empId);
                        const mapped = (Array.isArray(docs) ? docs : []).map((d: any) => ({
                            ...d,
                            type: apiToDisplayType(d.documentType),
                            status: d.status || 'uploaded',
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

    const viewDocument = (doc: any) => {
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
        if (selectedIds.size === filteredAdmins.length && filteredAdmins.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredAdmins.map(e => e.id)));
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
        const selectedAdmins = adminEmployees.filter(e => selectedIds.has(e.id));
        if (selectedAdmins.length === 0) {
            notify("Please select at least one admin for bulk export.", "warning");
            return;
        }

        const headers = ["Admin ID", "Full Name", "Department", "Document Type", "Status", "Upload Date", "File Name"];
        const rows: string[][] = [];

        selectedAdmins.forEach(admin => {
            const docs = (admin as any).documents || [];
            if (docs.length === 0) {
                rows.push([admin.employeeId, admin.fullName, admin.department, "N/A", "No Documents", "N/A", "N/A"]);
            } else {
                docs.forEach((doc: any) => {
                    rows.push([
                        admin.employeeId,
                        admin.fullName,
                        admin.department,
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
        link.setAttribute("download", `HRMS_Admin_Documents_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        addLog('Export', 'Document', `Bulk exported admin document data for ${selectedAdmins.length} records`);
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
                    <h1 className="text-3xl font-black text-black tracking-tight">Admin Documents</h1>
                    <p className="text-slate-600 text-sm font-medium">Compliance & verification for {adminEmployees.length} Admin Personnel.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleBulkExport}
                        className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm transition-all ${selectedIds.size > 0
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100'
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
                                aria-label="Search by Admin ID or Name"
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by Admin ID or Name..."
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
                                        aria-label="Select all admins"
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                        checked={selectedIds.size === filteredAdmins.length && filteredAdmins.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="text-left py-6 px-4 text-[11px] font-black text-black uppercase tracking-widest whitespace-nowrap">Admin</th>
                                {docTypes.map((t) => (
                                    <th key={t} className="text-center py-6 px-4 text-[11px] font-black text-black uppercase tracking-widest whitespace-nowrap min-w-[100px]">{t}</th>
                                ))}
                                <th className="text-right py-6 pr-8 pl-4 text-[11px] font-black text-black uppercase tracking-widest whitespace-nowrap">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 bg-white">
                            {filteredAdmins.map((admin: any) => (
                                <tr key={admin.id} className={`hover:bg-slate-50/50 transition-colors group ${selectedIds.has(admin.id) ? 'bg-indigo-50/20' : ''}`}>
                                    <td className="py-6 pl-8 pr-4">
                                        <input
                                            aria-label={`Select ${admin.fullName}`}
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                            checked={selectedIds.has(admin.id)}
                                            onChange={() => toggleSelect(admin.id)}
                                        />
                                    </td>
                                    <td className="py-6 px-4">
                                        <div className="flex items-center gap-4 min-w-[200px]">
                                            <ProfileAvatar employee={admin} />
                                            <div className="min-w-0">
                                                <p className="font-black text-black leading-none mb-1 text-sm truncate">{admin.fullName}</p>
                                                <p className="text-[10px] font-bold text-black uppercase tracking-widest truncate">{admin.employeeId} • {admin.department}</p>
                                            </div>
                                        </div>
                                    </td>
                                    {docTypes.map(type => {
                                        const status = getDocStatus(admin, type);
                                        return (
                                            <td key={type} className="py-6 px-4 text-center">
                                                <button
                                                    aria-label={`Manage ${type} document for ${admin.fullName}`}
                                                    onClick={() => setSelectedEmployee(admin)}
                                                    className={`p-2 rounded-xl transition-all mx-auto ${status === 'verified' ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' :
                                                        status === 'uploaded' ? 'bg-blue-50 text-blue-600 hover:bg-blue-100' :
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
                                            onClick={() => setSelectedEmployee(admin)}
                                            className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm whitespace-nowrap"
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredAdmins.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Icon name="SearchX" className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <p className="text-slate-600 font-black uppercase text-xs tracking-widest">No matching admin records found</p>
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
                                                    status === 'uploaded' ? 'bg-blue-50 text-blue-600' :
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
                                                            status === 'uploaded' ? 'text-blue-600' :
                                                                'text-slate-400'
                                                            }`}>
                                                            {status.toUpperCase()}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                                {status === 'pending' ? (
                                                    <button
                                                        onClick={() => triggerFileUpload(selectedEmployee.employeeId, type)}
                                                        className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 flex items-center gap-2 whitespace-nowrap"
                                                    >
                                                        <Icon name="Upload" className="w-3.5 h-3.5 text-white" />
                                                        Upload
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            aria-label="View document"
                                                            onClick={() => viewDocument(doc!)}
                                                            className="px-3 py-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors border-none flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-md shadow-indigo-100 whitespace-nowrap"
                                                            title="View Document"
                                                        >
                                                            <Icon name="Eye" className="w-4 h-4" />
                                                            View
                                                        </button>

                                                        {status === 'uploaded' && (
                                                            <button
                                                                onClick={() => handleUpdateDocument(selectedEmployee.id, type, 'verified')}
                                                                className="p-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors border-none"
                                                                title="Mark as Verified"
                                                            >
                                                                <Icon name="Check" className="w-5 h-5" />
                                                            </button>
                                                        )}

                                                        {(status === 'uploaded' || status === 'verified') && (
                                                            <button
                                                                onClick={() => handleDeleteDocument(type)}
                                                                className="px-3 py-2 text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors border-none flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-md shadow-rose-100 whitespace-nowrap"
                                                                title="Delete Document"
                                                            >
                                                                <Icon name="Trash2" className="w-4 h-4" />
                                                                Delete
                                                            </button>
                                                        )}
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
                                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 flex items-center justify-center gap-2 whitespace-nowrap"
                            >
                                <Icon name="Download" className="w-4 h-4 text-white" /> Download Archive
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Document Viewer Modal */}
            <Modal isOpen={!!viewingDoc} onClose={() => setViewingDoc(null)} title={`View Document: ${viewingDoc?.type || 'Document'}`} maxWidth="max-w-2xl">
                {viewingDoc && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div>
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">File Name</p>
                                <p className="text-sm font-black text-black mt-1">{viewingDoc.fileName || 'document.pdf'}</p>
                            </div>
                            <button
                                onClick={() => handleDownloadSingle(viewingDoc)}
                                className="flex items-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all"
                            >
                                <Icon name="Download" className="w-4 h-4" />
                                Download
                            </button>
                        </div>
                        <div className="bg-slate-100 rounded-2xl p-8 text-center h-64">
                            <Icon name="FileText" className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                            <p className="text-slate-600 font-bold">Document preview</p>
                            <p className="text-sm text-slate-500 mt-2">Click Download to view the full document on your device</p>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default DocumentsView;
