
import React from 'react';
import { X, Save } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  onSave: () => void;
}

export const Modal = ({ isOpen, onClose, title, children, onSave }: EditModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#020617]/90 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      
      {/* Modal Container */}
      <div className="relative bg-[#0b1220] rounded-t-3xl sm:rounded-3xl shadow-[0_0_50px_rgba(243,115,33,0.15)] border border-[#1f2937] w-full max-w-xl flex flex-col max-h-[92vh] sm:max-h-[85vh] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 ease-out">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1f2937] shrink-0 bg-[#0f172a]/50">
          <h3 className="text-xl font-bold text-[#e6eef8] tracking-tight">{title}</h3>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-[#1f2937] rounded-xl text-[#9aa8bd] hover:text-[#e6eef8] transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-6 bg-[#0f172a] border-t border-[#1f2937] shrink-0">
          <button 
            onClick={onClose} 
            className="w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-[#9aa8bd] hover:text-[#e6eef8] hover:bg-[#1f2937] rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3 bg-[#f37321] text-white text-sm font-bold rounded-xl hover:bg-[#e06410] shadow-xl shadow-[#f37321]/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Save size={18} />
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  );
};
