import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useHRMS } from '../../context/HRMSContext.tsx';
import { NAV_ITEMS } from '../../constants.ts';
import { useNavigate } from 'react-router-dom';
import Icon from './Icon';

const GlobalSearch: React.FC = () => {
  const { globalSearchTerm, setGlobalSearchTerm, employees, activities } = useHRMS();
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // trim and normalize search term so suggestions appear after the first meaningful character
  const term = (globalSearchTerm || '').trim();

  const filteredEmployees = term.length > 0
    ? (employees || []).filter(e =>
      e.fullName.toLowerCase().includes(term.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(term.toLowerCase())
    ).slice(0, 4)
    : [];

  const filteredModules = term.length > 0
    ? (NAV_ITEMS || []).filter(item => item.label.toLowerCase().includes(term.toLowerCase()))
    : [];

  const filteredActivities = term.length > 0
    ? (activities || []).filter(act => act.details.toLowerCase().includes(term.toLowerCase())).slice(0, 3)
    : [];

  const hasResults = filteredEmployees.length > 0 || filteredModules.length > 0 || filteredActivities.length > 0;

  return (
    <div className="relative max-w-md hidden md:block flex-1" ref={searchRef}>
      <div className="relative group">
        <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          aria-label="Global search"
          type="text"
          value={globalSearchTerm || ''}
          onFocus={() => setShowResults(true)}
          onChange={(e) => {
            setGlobalSearchTerm(e.target.value);
            setShowResults(true);
          }}
          placeholder="Search employees, modules, activity..."
          className="w-full pl-10 pr-4 py-2 bg-gray-50 border-gray-100 rounded-2xl text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none border"
        />
      </div>

      {showResults && term.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-200 rounded-3xl shadow-2xl shadow-gray-400/20 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            {hasResults ? (
              <>
                {filteredModules.length > 0 && (
                  <div className="p-2">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Modules</p>
                    {filteredModules.map(module => (
                      <button
                        key={module.id}
                        onClick={() => {
                          navigate(`/${module.id}`);
                          setShowResults(false);
                          setGlobalSearchTerm('');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 rounded-xl transition-colors text-left group"
                      >
                        <div className="p-2 bg-white rounded-lg border border-gray-50 text-indigo-500 shadow-sm group-hover:scale-110 transition-transform">
                          <Icon name={module.icon} className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{module.label}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredEmployees.length > 0 && (
                  <div className="p-2 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Employees</p>
                    {filteredEmployees.map(emp => (
                      <button
                        key={emp.id}
                        onClick={() => {
                          navigate('/employees');
                          setShowResults(false);
                          setGlobalSearchTerm('');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 rounded-xl transition-colors text-left group"
                      >
                        <img src={emp.avatar} className="w-8 h-8 rounded-lg border border-gray-100" alt={`${emp.fullName} avatar`} />
                        <div>
                          <p className="text-sm font-bold text-gray-800 leading-none">{emp.fullName}</p>
                          <p className="text-[10px] text-gray-400 font-medium mt-1 uppercase tracking-tight">{emp.employeeId} • {emp.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {filteredActivities.length > 0 && (
                  <div className="p-2 border-t border-gray-50">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Recent Logs</p>
                    {filteredActivities.map(act => (
                      <button
                        key={act.id}
                        onClick={() => {
                          navigate('/dashboard');
                          setShowResults(false);
                          setGlobalSearchTerm('');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 rounded-xl transition-colors text-left group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
                          <Icon name="Activity" className="w-4 h-4" />
                        </div>
                        <div className="flex-1 truncate">
                          <p className="text-xs font-bold text-gray-700 truncate">{act.details}</p>
                          <p className="text-[9px] text-gray-400 font-bold uppercase">{act.employeeName}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="p-8 text-center">
                <Icon name="SearchX" className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No matching records</p>
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">HRMS Global Index v2.1</span>
            <button
              onClick={() => setGlobalSearchTerm('')}
              className="text-[10px] text-indigo-600 font-black uppercase hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
