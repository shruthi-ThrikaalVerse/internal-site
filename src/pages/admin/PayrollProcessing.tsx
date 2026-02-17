import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { PayslipData, EmployeeSummary, PayrollRun } from '../../types.ts';

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

const PayrollProcessing: React.FC = () => {
  const { payroll, runPayroll, employees, payslips, updateEmployee, notify, addLog } = useHRMS();
  const [activeTab, setActiveTab] = useState<'runs' | 'process' | 'salary' | 'settings'>('runs');
  const [isRunning, setIsRunning] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<PayslipData | null>(null);
  const [selectedEmpForSalary, setSelectedEmpForSalary] = useState<EmployeeSummary | null>(null);

  // Dynamic Year/Month selection for Active Run
  const currentYear = new Date().getFullYear();

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const currentMonthName = months[new Date().getMonth()];
  const [runMonth, setRunMonth] = useState(currentMonthName);
  const [runYear, setRunYear] = useState(currentYear);

  // Dynamically calculate years for dropdown based on existing data + future
  const years = useMemo(() => {
    const historicalYears = payroll.map(p => p.year);
    const startYear = Math.min(...historicalYears, currentYear - 1);
    return Array.from({ length: currentYear - startYear + 3 }, (_, i) => startYear + i);
  }, [payroll, currentYear]);

  const handleRunPayroll = () => {
    // basic validation
    if (!runMonth || !runYear) {
      notify('Please select payroll month and year before running.', 'warning');
      return;
    }

    setIsRunning(true);

    // Use a delayed simulation but handle failures gracefully
    setTimeout(() => {
      try {
        runPayroll(runMonth, runYear);
        addLog('Process', 'Payroll', `Manually executed payroll run for ${runMonth} ${runYear}`);
        setActiveTab('process');
      } catch (err) {
        console.error('Error executing runPayroll:', err);
        notify('Failed to run payroll. Check console for details.', 'error');
      } finally {
        setIsRunning(false);
      }
    }, 1500);
  };

  const handleUpdateSalaryAndBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmpForSalary) {
      updateEmployee(selectedEmpForSalary.id, {
        salaryStructure: selectedEmpForSalary.salaryStructure,
        bankDetails: selectedEmpForSalary.bankDetails
      });
      setSelectedEmpForSalary(null);
    }
  };

  const handleViewRun = (run: PayrollRun) => {
    setActiveTab('process');
  };

  const handleDownloadRun = (run: PayrollRun) => {
    const headers = ["Month", "Year", "Headcount", "Total Amount", "Processed Date"];
    const row = [run.month, run.year, run.totalEmployees, run.totalAmount, run.processedDate];
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + row.join(",");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Payroll_Run_${run.month}_${run.year}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  };

  const groupedPayroll = useMemo(() => {
    const groups: Record<number, PayrollRun[]> = {};
    payroll.forEach(run => {
      if (!groups[run.year]) groups[run.year] = [];
      groups[run.year].push(run);
    });
    const sortedYears = Object.keys(groups).map(Number).sort((a, b) => b - a);
    return { groups, sortedYears };
  }, [payroll]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Center</h1>
          <p className="text-slate-500 text-sm font-medium">Global payroll management and compliance processing.</p>
        </div>
        <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm">
          {['runs', 'process', 'salary', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'runs' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-[0.05] group-hover:scale-110 transition-transform">
                <Icon name="IndianRupee" className="w-32 h-32" />
              </div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Active Cycle</p>
              <div className="flex items-center gap-2 mb-2">
                <select
                  aria-label="Select payroll month"
                  value={runMonth}
                  onChange={(e) => setRunMonth(e.target.value)}
                  className="bg-slate-50 border-none text-xl font-black text-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {months.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <select
                  aria-label="Select payroll year"
                  value={runYear}
                  onChange={(e) => setRunYear(Number(e.target.value))}
                  className="bg-slate-50 border-none text-xl font-black text-slate-900 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-full text-[9px] font-black uppercase tracking-widest">Awaiting Run</span>
                <button type="button" aria-label="Run payroll now" onClick={handleRunPayroll} disabled={isRunning} className="px-4 py-2 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                  {isRunning ? 'Processing...' : 'Run Now'}
                </button>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Estimated Payout</p>
              <h2 className="text-2xl font-black text-slate-900">₹{(employees.length * 85000 / 100000).toFixed(2)} L</h2>
              <p className="text-[9px] text-emerald-500 font-black uppercase tracking-widest mt-2">Verified for {employees.length} Staff</p>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Tax Compliances</p>
              <h2 className="text-2xl font-black text-slate-900">100%</h2>
              <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-2">PF / ESI Ready</p>
            </div>
          </div>

          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Payroll Run History</h2>
              <button aria-label="Filter runs" className="p-3 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400 text-black"><Icon name="Filter" className="w-5 h-5" /></button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <tr>
                    <th className="px-8 py-5">Billing Cycle</th>
                    <th className="px-8 py-5">Headcount</th>
                    <th className="px-8 py-5">Total Disbursed</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {groupedPayroll.sortedYears.map(year => (
                    <React.Fragment key={year}>
                      <tr className="bg-slate-50/50">
                        <td colSpan={5} className="px-8 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{year} Financial Year</td>
                      </tr>
                      {groupedPayroll.groups[year].map(run => (
                        <tr key={run.id} className="hover:bg-slate-50 transition-colors group">
                          <td className="px-8 py-6 font-black text-slate-800">{run.month} {run.year}</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-500">{run.totalEmployees} Employees</td>
                          <td className="px-8 py-6 text-sm font-black text-slate-900">₹{(run.totalAmount / 100000).toFixed(2)} L</td>
                          <td className="px-8 py-6">
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full text-[9px] font-black uppercase tracking-widest">{run.status}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                            <div className="flex justify-end gap-2">
                              <button aria-label={`Download report for ${run.month} ${run.year}`} onClick={() => handleDownloadRun(run)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent transition-all text-black"><Icon name="Download" className="w-4 h-4" /></button>
                              <button aria-label={`View details for ${run.month} ${run.year}`} onClick={() => handleViewRun(run)} className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-white rounded-xl shadow-sm border border-transparent transition-all text-black"><Icon name="Eye" className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                  {payroll.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-20 text-center text-slate-400 font-black uppercase text-xs tracking-widest">No payroll history found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'process' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-8 border-b flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-xl font-black text-slate-900">Processing Console</h2>
              <p className="text-xs text-slate-400 font-medium">Breakdown & Individual Disbursal</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {}} className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm">Generate Bulk</button>
              <button onClick={() => {}} className="px-5 py-2.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">Disburse All</button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attendance</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Gross</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center text-rose-500">Deductions</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Net Pay</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {payslips.length > 0 ? payslips.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-black text-xs uppercase shadow-sm">{p.name.charAt(0)}</div>
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-none mb-1">{p.name}</p>
                          <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{p.employeeId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <span className="text-[10px] font-black text-slate-700">{p.attendanceSummary.present} / {p.attendanceSummary.totalDays}</span>
                      <p className="text-[8px] text-rose-400 font-black uppercase mt-1">LOP: ₹{p.lop.toFixed(0)}</p>
                    </td>
                    <td className="px-8 py-6 text-center text-sm font-bold text-slate-700">₹{p.grossSalary.toLocaleString()}</td>
                    <td className="px-8 py-6 text-center text-sm font-bold text-rose-500">₹{p.deductions.toLocaleString()}</td>
                    <td className="px-8 py-6 text-center text-sm font-black text-indigo-600">₹{p.netPay.toLocaleString()}</td>
                    <td className="px-8 py-6 text-right">
                      <button aria-label={`Preview payslip for ${p.name}`} onClick={() => setSelectedPayslip(p)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Icon name="FileText" className="w-5 h-5" /></button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-slate-400 font-black uppercase text-xs tracking-[0.2em]">{`Run payroll to generate ${runMonth} slips`}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'salary' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="p-8 border-b bg-slate-50/50 flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900">Salary Architecture</h2>
            <div className="relative group">
              <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input aria-label="Lookup staff salary" type="text" placeholder="Lookup staff salary..." className="pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none text-sm font-medium w-64 focus:ring-2 focus:ring-indigo-500 transition-all shadow-sm" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Employee Profile</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Basic Salary</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Fixed Allowances</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions (Est)</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {employees.map(emp => {
                  const s = emp.salaryStructure;
                  const allowance = (s?.hra || 0) + (s?.da || 0) + (s?.specialAllowance || 0);
                  const deduct = (s?.pf || 0) + (s?.esi || 0) + (s?.professionalTax || 0);
                  return (
                    <tr key={emp.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <img src={emp.avatar} className="w-9 h-9 rounded-xl shadow-sm" alt={`${emp.fullName} avatar`} />
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-none mb-1">{emp.fullName}</p>
                            <p className="text-[9px] text-slate-400 font-black uppercase mt-1 tracking-widest">{emp.designation}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-black text-slate-700">₹{s?.basic.toLocaleString() || '0'}</td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-500">₹{allowance.toLocaleString()}</td>
                      <td className="px-8 py-6 text-sm font-bold text-rose-400">₹{deduct.toLocaleString()}</td>
                      <td className="px-8 py-6 text-right">
                        <button aria-label={`Edit salary for ${emp.fullName}`} onClick={() => setSelectedEmpForSalary(emp)} className="p-3 bg-white border border-slate-200 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all shadow-sm"><Icon name="Edit3" className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-300">
          <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3"><Icon name="Settings" className="text-indigo-600" /> Compliance Rules</h2>
            <div className="space-y-4">
              {[
                { label: 'PF Contribution (%)', val: '12%', desc: 'Employee share based on basic + DA' },
                { label: 'ESI Contribution (%)', val: '0.75%', desc: 'Health insurance standard deduction' },
                { label: 'PT Calculation', val: 'Slab-based', desc: 'State-wise professional tax rules' },
                { label: 'TDS Automation', val: 'Enabled', desc: 'Predictive tax based on annual projection' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <p className="text-xs font-black text-slate-800 uppercase tracking-tight">{item.label}</p>
                    <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase">{item.desc}</p>
                  </div>
                  <span className="text-xs font-black text-indigo-600 px-3 py-1 bg-white rounded-lg shadow-sm border border-slate-100">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-indigo-600 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
              <Icon name="ShieldCheck" className="w-48 h-48" />
            </div>
            <h2 className="text-xl font-black mb-6">Payroll Settings</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <p className="text-sm font-bold">Billing Cycle</p>
                <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">Monthly (30th)</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <p className="text-sm font-bold">Late Penalty</p>
                <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">3 Lates = 0.5 LOP</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <p className="text-sm font-bold">Overtime Multiplier</p>
                <span className="text-xs font-black bg-white/10 px-3 py-1 rounded-lg uppercase tracking-widest">1.5x Hourly</span>
              </div>
              <button onClick={() => notify('Global payroll configurations updated.')} className="w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-lg hover:bg-indigo-50 transition-all active:scale-95 relative z-10">Save Global Config</button>
            </div>
          </div>
        </div>
      )}

      {/* --- PAYSLIP PREVIEW MODAL --- */}
      <Modal isOpen={!!selectedPayslip} onClose={() => setSelectedPayslip(null)} title="Official Payslip Preview">
        {selectedPayslip && (
          <div className="space-y-8 pb-4">
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8">
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-none">AdminSync HRMS</h3>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-2">Corporate HQ • Bangalore</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Payslip Period</p>
                <p className="text-xl font-black text-indigo-600 uppercase">{selectedPayslip.month} {selectedPayslip.year}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-12 text-sm">
              <div className="space-y-3">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Employee Details</p>
                <p className="font-black text-slate-800">{selectedPayslip.name}</p>
                <p className="text-xs font-bold text-slate-400 uppercase">{selectedPayslip.employeeId}</p>
              </div>
              <div className="text-right space-y-3">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Attendance Summary</p>
                <p className="font-black text-slate-800">{selectedPayslip.attendanceSummary.present} Days Present</p>
                <p className="text-xs font-bold text-rose-400 uppercase">{selectedPayslip.attendanceSummary.absent} LOP Days</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-3xl p-8 space-y-4">
              <div className="flex justify-between font-black text-slate-400 uppercase text-[10px] tracking-widest mb-4">
                <span>Earning Component</span>
                <span>Amount</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Gross Salary</span>
                <span>₹{selectedPayslip.grossSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-500">
                <span>Loss of Pay (Attendance)</span>
                <span>- ₹{selectedPayslip.lop.toFixed(0)}</span>
              </div>
              <div className="flex justify-between font-bold text-rose-500">
                <span>Statutory Deductions (PF/ESI)</span>
                <span>- ₹{selectedPayslip.deductions.toLocaleString()}</span>
              </div>
              <div className="pt-6 border-t border-slate-200 flex justify-between items-center">
                <span className="text-lg font-black text-slate-900">Total Net Pay</span>
                <span className="text-2xl font-black text-indigo-600">₹{selectedPayslip.netPay.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => notify('Preparing document for printer...')} className="flex-1 py-4 bg-white border-2 border-slate-100 rounded-2xl text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
                <Icon name="Printer" className="w-4 h-4" /> Print PDF
              </button>
              <button onClick={() => notify('Payslip emailed to ' + selectedPayslip.name)} className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Icon name="Mail" className="w-4 h-4" /> Send Email
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- SALARY & BANK SETUP MODAL --- */}
      <Modal isOpen={!!selectedEmpForSalary} onClose={() => setSelectedEmpForSalary(null)} title="Financial & Bank Setup">
        {selectedEmpForSalary && (
          <form onSubmit={handleUpdateSalaryAndBank} className="space-y-8 pb-4">
            <div className="flex items-center gap-4 p-5 bg-indigo-50 rounded-[28px] border border-indigo-100">
              <img src={selectedEmpForSalary.avatar} className="w-14 h-14 rounded-2xl shadow-sm border-2 border-white" alt={`${selectedEmpForSalary.fullName} avatar`} />
              <div>
                <h4 className="text-lg font-black text-slate-900">{selectedEmpForSalary.fullName}</h4>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{selectedEmpForSalary.employeeId}</p>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salary Architecture</h4>
              <div className="grid grid-cols-2 gap-6">
                {[
                  { label: 'Basic Salary', key: 'basic' },
                  { label: 'HRA Allowance', key: 'hra' },
                  { label: 'DA Allowance', key: 'da' },
                  { label: 'Special Allowance', key: 'specialAllowance' },
                  { label: 'Provident Fund', key: 'pf' },
                  { label: 'ESI Insurance', key: 'esi' },
                ].map(f => (
                  <div key={f.key} className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{f.label}</label>
                    <input
                      type="number"
                      className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-sm text-slate-700"
                      value={(selectedEmpForSalary.salaryStructure as any)?.[f.key] || 0}
                      placeholder={f.label}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        const currentStructure = selectedEmpForSalary.salaryStructure || { basic: 0, hra: 0, da: 0, specialAllowance: 0, pf: 0, esi: 0, professionalTax: 0, tds: 0 };
                        setSelectedEmpForSalary(prev => {
                          if (!prev) return null;
                          return {
                            ...prev,
                            salaryStructure: { ...currentStructure, [f.key]: val }
                          };
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-[32px] border border-slate-100 space-y-4">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Disbursal Data</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bank Name</label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-sm text-slate-700"
                    value={selectedEmpForSalary.bankDetails?.bankName || ''}
                    placeholder="Bank Name"
                    onChange={(e) => {
                      const val = e.target.value;
                      const currentBank = selectedEmpForSalary.bankDetails || { bankName: '', accountNumber: '', ifsc: '' };
                      setSelectedEmpForSalary(prev => prev ? ({ ...prev, bankDetails: { ...currentBank, bankName: val } }) : null);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Account Number</label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-sm text-slate-700 font-mono"
                    value={selectedEmpForSalary.bankDetails?.accountNumber || ''}
                    placeholder="Account Number"
                    onChange={(e) => {
                      const val = e.target.value;
                      const currentBank = selectedEmpForSalary.bankDetails || { bankName: '', accountNumber: '', ifsc: '' };
                      setSelectedEmpForSalary(prev => prev ? ({ ...prev, bankDetails: { ...currentBank, accountNumber: val } }) : null);
                    }}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">IFSC Code</label>
                  <input
                    type="text"
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-sm text-slate-700 font-mono"
                    value={selectedEmpForSalary.bankDetails?.ifsc || ''}
                    placeholder="IFSC Code"
                    onChange={(e) => {
                      const val = e.target.value;
                      const currentBank = selectedEmpForSalary.bankDetails || { bankName: '', accountNumber: '', ifsc: '' };
                      setSelectedEmpForSalary(prev => prev ? ({ ...prev, bankDetails: { ...currentBank, ifsc: val } }) : null);
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex gap-4">
              <button type="button" onClick={() => setSelectedEmpForSalary(null)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Discard</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Commit Financial Record</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default PayrollProcessing;
