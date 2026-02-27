
import React from 'react';

interface FormInputProps {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
}

export const FormInput = ({ label, value, onChange, type = "text", placeholder, min, max, step }: FormInputProps) => (
  <div className="space-y-2 group w-full">
    {label && (
      <div className="flex justify-between items-center">
        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">{label}</label>
        {type === 'range' && <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">{value}%</span>}
      </div>
    )}
    <input
      type={type}
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      step={step}
      className={`w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-300 outline-none transition-all placeholder-gray-400 font-medium ${type === 'range' ? 'accent-blue-600 h-2 cursor-pointer p-0 border-none' : ''} ${type === 'file' ? 'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-blue-100 file:text-blue-600 hover:file:bg-blue-200 cursor-pointer' : ''}`}
    />
  </div>
);

interface FormTextAreaProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  rows?: number;
}

export const FormTextArea = ({ label, value, onChange, placeholder, rows = 4 }: FormTextAreaProps) => (
  <div className="space-y-2 group w-full">
    {label && <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">{label}</label>}
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-300 outline-none transition-all placeholder-gray-400 font-medium resize-none"
    />
  </div>
);

interface FormSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: string[];
}

export const FormSelect = ({ label, value, onChange, options }: FormSelectProps) => (
  <div className="space-y-2 group w-full">
    {label && <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider group-focus-within:text-blue-600 transition-colors">{label}</label>}
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:ring-4 focus:ring-blue-500/50 focus:border-blue-300 outline-none transition-all appearance-none font-medium cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt} className="bg-white">{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
    </select>
  </div>
);
