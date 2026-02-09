import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { PayslipData, PayslipStatus, EmployeeSummary } from '../../types.ts';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-white rounded-[32px] w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};

const PayslipsAdmin: React.FC = () => {
  const { payslips, addPayslip, updatePayslip, deletePayslip, employees, notify } = useHRMS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Partial<PayslipData> & { targetEmployeeIds: string[] }>({
    targetEmployeeIds: [],
    month: 'January',
    year: 2026,
    basic: 0,
    allowances: 0,
    deductions: 0,
    remarks: '',
    status: 'pending',
    fileName: ''
  });

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const years = [2024, 2025, 2026];

  const filteredPayslips = useMemo(() => {
    return payslips.filter(p =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.month.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [payslips, searchTerm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e =>
      e.fullName.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(empSearch.toLowerCase())
    );
  }, [employees, empSearch]);

  const calculateNet = (basic: number, allow: number, deduct: number) => basic + allow - deduct;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.targetEmployeeIds.length === 0 && !editingId) {
      notify('Please select at least one employee.', 'warning');
      return;
    }

    const net = calculateNet(formData.basic || 0, formData.allowances || 0, formData.deductions || 0);

    if (editingId) {
      updatePayslip(editingId, { ...formData, netPay: net, grossSalary: (formData.basic || 0) + (formData.allowances || 0) });
    } else {
      // Handle batch creation
      formData.targetEmployeeIds.forEach(id => {
        const emp = employees.find(e => e.id === id || e.employeeId === id);
        if (emp) {
          addPayslip({
            ...formData,
            employeeId: emp.employeeId,
            name: emp.fullName,
            netPay: net,
            grossSalary: (formData.basic || 0) + (formData.allowances || 0),
            attendanceSummary: { present: 22, absent: 0, totalDays: 30 }
          });
        }
      });
      notify(`Payslips processed for ${formData.targetEmployeeIds.length} employees.`, 'success');
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      targetEmployeeIds: [],
      month: 'January',
      year: 2026,
      basic: 0,
      allowances: 0,
      deductions: 0,
      remarks: '',
      status: 'pending',
      fileName: ''
    });
    setEmpSearch('');
  };

  const handleEdit = (ps: PayslipData) => {
    setEditingId(ps.id);
    setFormData({
      ...ps,
      targetEmployeeIds: [ps.employeeId]
    });
    setIsModalOpen(true);
  };

  const toggleEmployeeSelection = (id: string) => {
    setFormData(prev => {
      const current = prev.targetEmployeeIds || [];
      const next = current.includes(id)
        ? current.filter(cid => cid !== id)
        : [...current, id];
      return { ...prev, targetEmployeeIds: next };
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, fileName: file.name });
      notify(`Attached ${file.name}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Payslips Module</h1>
          <p className="text-slate-500 text-sm font-medium">Generate, verify and distribute salary documentation.</p>
        </div>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
        >
          <Icon name="FilePlus" className="w-5 h-5" /> Generate Payslip
        </button>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="relative group w-full">
          <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input
            aria-label="Search payslips"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Employee, ID or Month..."
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600 shadow-inner"
          />
        </div>

        <div className="overflow-x-auto rounded-[24px] border border-slate-50">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Pay</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredPayslips.length > 0 ? filteredPayslips.map(ps => (
                <tr key={ps.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-sm">
                        {ps.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-black text-slate-800 leading-none mb-1">{ps.name}</p>
                        <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{ps.employeeId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-bold text-slate-700">{ps.month} {ps.year}</p>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-indigo-600">₹{ps.netPay.toLocaleString()}</p>
                  </td>
                  <td className="px-8 py-6">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${ps.status === 'sent' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                      {ps.status}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-2">
                      <button aria-label={`Edit payslip for ${ps.name}`} onClick={() => handleEdit(ps)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Icon name="Edit3" className="w-4 h-4" /></button>
                      <button aria-label={`Delete payslip for ${ps.name}`} onClick={() => deletePayslip(ps.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Icon name="Trash2" className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-24 text-center">
                    <Icon name="ReceiptText" className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No payslip records found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Modify Payslip Record" : "Draft New Payslips"}>
        <form onSubmit={handleSubmit} className="space-y-6">
          {!editingId && (
            <div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Audience</label>
                <span className="text-[10px] font-black text-indigo-600 uppercase bg-indigo-50 px-2 py-0.5 rounded-lg">{formData.targetEmployeeIds.length} Selected</span>
              </div>
              <div className="relative group">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  type="text"
                  placeholder="Search personal..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={empSearch}
                  onChange={(e) => setEmpSearch(e.target.value)}
                />
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-100 max-h-[150px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {filteredEmployees.map(emp => {
                  const isSelected = formData.targetEmployeeIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => toggleEmployeeSelection(emp.id)}
                      className="p-3 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <img src={emp.avatar} className="w-8 h-8 rounded-lg shadow-sm border border-white" alt={`${emp.fullName} avatar`} />
                        <div>
                          <p className="text-xs font-black text-slate-800 leading-none">{emp.fullName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mt-1">{emp.employeeId} • {emp.department}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'}`}>
                        <Icon name="Check" className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period Month</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600"
                value={formData.month}
                onChange={e => setFormData({ ...formData, month: e.target.value })}
                title="Select period month"
              >
                {months.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Period Year</label>
              <select
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600"
                value={formData.year}
                onChange={e => setFormData({ ...formData, year: parseInt(e.target.value) })}
                title="Select period year"
              >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Basic Salary</label>
              <input
                type="number" required
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700"
                value={formData.basic}
                placeholder="Basic Salary"
                onChange={e => setFormData({ ...formData, basic: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Allowances</label>
              <input
                type="number" required
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700"
                value={formData.allowances}
                placeholder="Allowances"
                onChange={e => setFormData({ ...formData, allowances: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Deductions</label>
              <input
                type="number" required
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-rose-700"
                value={formData.deductions}
                placeholder="Deductions"
                onChange={e => setFormData({ ...formData, deductions: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Net Payout</p>
              <p className="text-2xl font-black text-indigo-600">₹{calculateNet(formData.basic || 0, formData.allowances || 0, formData.deductions || 0).toLocaleString()}</p>
            </div>
            <Icon name="Calculator" className="w-8 h-8 text-indigo-200" />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Compliance Remarks</label>
            <textarea
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 min-h-[80px]"
              placeholder="Internal audit notes or remarks for employee..."
              value={formData.remarks}
              onChange={e => setFormData({ ...formData, remarks: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Attachment</label>
              <div className="relative">
                <input
                  type="file"
                  id="payslip-upload"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                />
                <label
                  htmlFor="payslip-upload"
                  className="w-full px-4 py-3 bg-white border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-all text-[10px] font-black text-slate-400 uppercase tracking-widest"
                >
                  <Icon name={formData.fileName ? "FileCheck" : "UploadCloud"} className={`w-4 h-4 ${formData.fileName ? 'text-emerald-500' : ''}`} />
                  {formData.fileName ? 'Change File' : 'Upload PDF'}
                </label>
              </div>
              {formData.fileName && <p className="text-[9px] font-bold text-emerald-600 truncate px-2">{formData.fileName}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deployment Status</label>
              <div className="flex gap-2">
                {(['pending', 'sent'] as PayslipStatus[]).map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: s })}
                    className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formData.status === s ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}
                  >{s}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              {editingId ? "Confirm Modifications" : "Commit to Ledgers"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PayslipsAdmin;
