
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
        <label className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-wider group-focus-within:text-[#f37321] transition-colors">{label}</label>
        {type === 'range' && <span className="text-[10px] font-bold text-[#f37321] bg-[#f37321]/10 px-2 py-0.5 rounded">{value}%</span>}
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
      className={`w-full px-4 py-3 bg-[#0f172a] border border-[#1f2937] rounded-xl text-sm text-[#e6eef8] focus:ring-4 focus:ring-[#f37321]/5 focus:border-[#f37321] outline-none transition-all placeholder-[#9aa8bd]/20 font-medium ${type === 'range' ? 'accent-[#f37321] h-2 cursor-pointer p-0 border-none' : ''} ${type === 'file' ? 'file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-[#f37321]/10 file:text-[#f37321] hover:file:bg-[#f37321]/20 cursor-pointer' : ''}`}
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
    {label && <label className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-wider group-focus-within:text-[#f37321] transition-colors">{label}</label>}
    <textarea 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-4 py-3 bg-[#0f172a] border border-[#1f2937] rounded-xl text-sm text-[#e6eef8] focus:ring-4 focus:ring-[#f37321]/5 focus:border-[#f37321] outline-none transition-all placeholder-[#9aa8bd]/20 font-medium resize-none"
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
    {label && <label className="text-[10px] font-black text-[#9aa8bd] uppercase tracking-wider group-focus-within:text-[#f37321] transition-colors">{label}</label>}
    <select 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 bg-[#0f172a] border border-[#1f2937] rounded-xl text-sm text-[#e6eef8] focus:ring-4 focus:ring-[#f37321]/5 focus:border-[#f37321] outline-none transition-all appearance-none font-medium cursor-pointer"
    >
      {options.map(opt => <option key={opt} value={opt} className="bg-[#0b1220]">{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)}
    </select>
  </div>
);
