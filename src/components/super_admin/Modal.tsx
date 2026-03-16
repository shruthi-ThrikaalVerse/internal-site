
import React from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  onSave: () => void;
  isLoading?: boolean;
  maxWidth?: string;
  showFooter?: boolean;
  saveButtonProps?: {
    className?: string;
    children?: React.ReactNode;
  };
  cancelButtonProps?: {
    className?: string;
    children?: React.ReactNode;
  };
}

export const Modal = ({ isOpen, onClose, title, children, onSave, isLoading, maxWidth = 'max-w-xl', showFooter = true, saveButtonProps, cancelButtonProps }: EditModalProps) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className={`relative bg-white rounded-t-3xl sm:rounded-3xl shadow-lg border border-gray-200 w-full ${maxWidth} flex flex-col max-h-[95vh] sm:max-h-[90vh] overflow-hidden animate-in slide-in-from-bottom-full sm:slide-in-from-bottom-8 duration-500 ease-out`}>

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0 bg-gray-50">
          <h3 className="text-xl font-bold text-gray-900 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-900 transition-all disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>

        {/* Footer Actions */}
        {showFooter && (
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 p-6 bg-white border-t border-gray-200 shrink-0">
            <button
              onClick={onClose}
              disabled={isLoading}
              className={cancelButtonProps?.className || "w-full sm:w-auto px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all focus:ring-4 focus:ring-blue-500/50 disabled:opacity-50"}
            >
              {cancelButtonProps?.children || "Cancel"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
