import React, { useState, useEffect } from 'react';
import {
  Wallet, CreditCard, Download, FileText, PieChart, TrendingUp,
  DollarSign, ExternalLink, Eye, X, CheckCircle, Info, Printer,
  ShieldCheck, ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';

interface Payslip {
  id: string;
  month: string;
  date: string;
  amount: string;
  status: 'Paid' | 'Processing';
  breakdown: {
    basic: string;
    hra: string;
    allowance: string;
    deductions: string;
    tax: string;
  };
}

const Payroll: React.FC = () => {
  const [selectedSlip, setSelectedSlip] = useState<Payslip | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const payslips: Payslip[] = [
    {
      id: '1',
      month: 'March 2024',
      date: 'Mar 31, 2024',
      amount: '$4,200',
      status: 'Paid',
      breakdown: { basic: '$3,200', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
    {
      id: '2',
      month: 'February 2024',
      date: 'Feb 29, 2024',
      amount: '$4,200',
      status: 'Paid',
      breakdown: { basic: '$3,200', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
    {
      id: '3',
      month: 'January 2024',
      date: 'Jan 31, 2024',
      amount: '$4,150',
      status: 'Paid',
      breakdown: { basic: '$3,150', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
    // Add more items to test scrolling
    {
      id: '4',
      month: 'December 2023',
      date: 'Dec 31, 2023',
      amount: '$4,100',
      status: 'Paid',
      breakdown: { basic: '$3,100', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
    {
      id: '4',
      month: 'December 2023',
      date: 'Dec 31, 2023',
      amount: '$4,100',
      status: 'Paid',
      breakdown: { basic: '$3,100', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
    {
      id: '4',
      month: 'December 2023',
      date: 'Dec 31, 2023',
      amount: '$4,100',
      status: 'Paid',
      breakdown: { basic: '$3,100', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
    {
      id: '5',
      month: 'November 2023',
      date: 'Nov 30, 2023',
      amount: '$4,100',
      status: 'Paid',
      breakdown: { basic: '$3,100', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
    {
      id: '6',
      month: 'October 2023',
      date: 'Oct 31, 2023',
      amount: '$4,000',
      status: 'Paid',
      breakdown: { basic: '$3,000', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
    {
      id: '7',
      month: 'September 2023',
      date: 'Sep 30, 2023',
      amount: '$4,000',
      status: 'Paid',
      breakdown: { basic: '$3,000', hra: '$600', allowance: '$800', deductions: '$250', tax: '$150' }
    },
  ];

  const handlePreview = (slip: Payslip) => {
    setSelectedSlip(slip);
    setIsPreviewOpen(true);
  };

  const handleDownload = (slip: Payslip) => {
    // Simulate File Download
    const content = `PAYSLIP - ${slip.month}\nDate: ${slip.date}\nTotal Net Payable: ${slip.amount}\nStatus: ${slip.status}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Payslip_${slip.month.replace(' ', '_')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Payroll & Benefits</h1>
          <p className="text-slate-500 text-sm font-medium">Review your compensation, tax summaries, and secure payslips.</p>
        </div>
      </div>

      {/* Responsive Grid for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] text-white shadow-xl md:shadow-2xl shadow-slate-200 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet size={isMobile ? 80 : 120} />
          </div>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1">Monthly Take Home</p>
          <h3 className="text-3xl md:text-4xl font-black tabular-nums tracking-tighter">$4,200.00</h3>
          <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-white/10 flex items-center justify-between">
            <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
              Next Payout: <span className="text-emerald-400 ml-1">Apr 30, 2024</span>
            </div>
            <TrendingUp size={20} className="text-emerald-400" />
          </div>
        </div>

        <div className="md:col-span-2 bg-white p-6 md:p-8 rounded-3xl md:rounded-[2.5rem] border border-slate-200 shadow-sm relative overflow-hidden">
          <h3 className="text-sm font-black text-slate-800 mb-4 md:mb-6 flex items-center gap-3 uppercase tracking-widest">
            <PieChart size={18} className="text-blue-500" />
            Salary Breakdown
          </h3>
          <div className="space-y-4 md:space-y-5">
            {[
              { label: 'Basic Salary', amount: '$3,200', perc: '76%', color: 'bg-blue-600' },
              { label: 'HRA / Housing', amount: '$600', perc: '14%', color: 'bg-indigo-500' },
              { label: 'PF & Benefits', amount: '$400', perc: '10%', color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1 md:mb-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-sm font-black text-slate-800 tabular-nums">{item.amount}</span>
                  </div>
                  <div className="w-full h-1.5 md:h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000`}
                      style={{ width: item.perc }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Table Container */}
      <div className="bg-white rounded-3xl md:rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 md:p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
          <h3 className="font-black text-slate-800 text-xs uppercase tracking-[0.2em]">Recent Payslips Repository</h3>
          <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Historical Data</button>
        </div>
        
        {/* Mobile Card View */}
        {isMobile ? (
          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {payslips.map((slip) => (
              <div key={slip.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
                      <FileText size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-800">{slip.month}</p>
                      <p className="text-xs text-slate-500">{slip.date}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200">
                    {slip.status}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</p>
                    <p className="text-lg font-black text-slate-800">{slip.amount}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handlePreview(slip)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl"
                    >
                      <Eye size={18} />
                    </button>
                    <button
                      onClick={() => handleDownload(slip)}
                      className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl"
                    >
                      <Download size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Desktop Table View */
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                {/* Sticky Header */}
                <div className="sticky top-0 z-10 bg-slate-50 border-b border-slate-100">
                  <div className="grid grid-cols-12 px-8 py-5">
                    <div className="col-span-3">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month Period</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Issue Date</span>
                    </div>
                    <div className="col-span-3 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Payable</span>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</span>
                    </div>
                  </div>
                </div>

                {/* Scrollable Body - No Scrollbar */}
                <div className="max-h-[400px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] hover:[&::-webkit-scrollbar]:block">
                  {payslips.map((slip) => (
                    <div key={slip.id} className="grid grid-cols-12 px-8 py-6 hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-b-0 group">
                      <div className="col-span-3 flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100 group-hover:scale-110 transition-transform">
                          <FileText size={18} />
                        </div>
                        <span className="text-sm font-black text-slate-800 tracking-tight">{slip.month}</span>
                      </div>
                      <div className="col-span-2 flex items-center">
                        <span className="text-sm text-slate-500 font-medium">{slip.date}</span>
                      </div>
                      <div className="col-span-3 flex items-center justify-center">
                        <span className="text-sm font-black text-slate-800 tabular-nums">{slip.amount}</span>
                      </div>
                      <div className="col-span-2 flex items-center justify-center">
                        <span className="px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm">
                          {slip.status}
                        </span>
                      </div>
                      <div className="col-span-2 flex items-center justify-end gap-3">
                        <button
                          onClick={() => handlePreview(slip)}
                          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all active:scale-90"
                          title="Quick Preview"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDownload(slip)}
                          className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all active:scale-90"
                          title="Download PDF"
                        >
                          <Download size={18} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {isPreviewOpen && selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl md:rounded-[3rem] shadow-2xl border-2 border-slate-100 overflow-hidden relative max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden">
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="absolute top-4 md:top-8 right-4 md:right-8 p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-colors z-10"
              title="Close modal"
            >
              <X size={20} className="md:size-6" />
            </button>

            <div className="p-6 md:p-10">
              <div className="flex items-center gap-4 mb-6 md:mb-10">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center text-white shadow-xl shadow-blue-100">
                  <Wallet size={isMobile ? 24 : 32} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{selectedSlip.month}</h2>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Confidential Payslip Document</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-6 md:mb-10">
                <div className="p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-[2rem] border border-slate-100">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 md:mb-4">Earnings Breakdown</p>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Basic Pay</span>
                      <span className="font-bold text-slate-900">{selectedSlip.breakdown.basic}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">HRA Allowance</span>
                      <span className="font-bold text-slate-900">{selectedSlip.breakdown.hra}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Other Benefits</span>
                      <span className="font-bold text-slate-900">{selectedSlip.breakdown.allowance}</span>
                    </div>
                  </div>
                </div>
                <div className="p-4 md:p-6 bg-rose-50 rounded-2xl md:rounded-[2rem] border border-rose-100">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-3 md:mb-4">Deductions</p>
                  <div className="space-y-2 md:space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-rose-500">PF Contribution</span>
                      <span className="font-bold text-rose-900">{selectedSlip.breakdown.deductions}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-rose-500">Income Tax (TDS)</span>
                      <span className="font-bold text-rose-900">{selectedSlip.breakdown.tax}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] mb-6 md:mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl md:shadow-2xl shadow-slate-200">
                <div>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Net Disbursement</p>
                  <h4 className="text-3xl md:text-4xl font-black tracking-tighter tabular-nums">{selectedSlip.amount}</h4>
                </div>
                <div className="bg-white/10 p-3 md:p-4 rounded-2xl flex items-center gap-3">
                  <ShieldCheck size={20} className="text-emerald-400 md:w-6 md:h-6" />
                  <div className="text-left">
                    <p className="text-[9px] font-black text-white uppercase tracking-widest">Verification Status</p>
                    <p className="text-[11px] font-bold text-emerald-400">Institutional Validated</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                <button
                  onClick={() => handleDownload(selectedSlip)}
                  className="flex-1 py-3 md:py-4 bg-blue-600 text-white rounded-xl md:rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3 hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95"
                >
                  <Download size={16} className="md:size-[18px]" /> Download Secured PDF
                </button>
                <button
                  className="px-6 md:px-8 py-3 md:py-4 bg-slate-100 text-slate-600 rounded-xl md:rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-200 transition-all flex items-center justify-center gap-2 md:gap-3 active:scale-95"
                  onClick={() => window.print()}
                >
                  <Printer size={16} className="md:size-[18px]" /> Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;