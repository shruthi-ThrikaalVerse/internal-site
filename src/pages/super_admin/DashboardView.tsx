
import React from 'react';
import {
  Users, DollarSign, Briefcase, Activity,
  Shield, FileText, SearchCode, ShieldAlert
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { User, AuditLog, Project } from '../../types.tsx';
import { StatCard, SectionHeader, Badge } from './UI.tsx';
import { useApp } from '../../context/AppContext.tsx';

interface DashboardViewProps {
  filteredEmployees: User[];
  filteredAdmins: User[];
  filteredProjects: Project[];
  filteredLogs: AuditLog[];
  totalEmployees: number;
  activeProjects: number;
}

export const DashboardView = ({
  filteredEmployees,
  filteredAdmins,
  filteredProjects,
  filteredLogs,
  totalEmployees,
  activeProjects
}: DashboardViewProps) => {
  const { globalSearch, employees, admins } = useApp();
  const chartData = [
    { name: 'Jan', value: 400 }, { name: 'Feb', value: 300 }, { name: 'Mar', value: 600 },
    { name: 'Apr', value: 800 }, { name: 'May', value: 500 }, { name: 'Jun', value: 900 },
  ];

  if (globalSearch) {
    const hasResults = filteredEmployees.length > 0 || filteredAdmins.length > 0 || filteredProjects.length > 0 || filteredLogs.length > 0;

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <SectionHeader title={`Global Results for "${globalSearch}"`} description="Found across all organizational categories." />
        {!hasResults ? (
          <div className="bg-white p-12 rounded-xl border border-gray-200 text-center">
            <SearchCode size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-gray-900 font-bold text-lg">No matching records</h3>
            <p className="text-gray-500 text-sm mt-1">Try searching for names, roles, or departments.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8">
            {filteredEmployees.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Users size={16} className="text-blue-600" /> Employees ({filteredEmployees.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredEmployees.slice(0, 6).map(e => (
                    <div key={e.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-blue-300 transition-colors group">
                      <img src={e.avatar} alt={e.name} className="w-10 h-10 rounded-full border border-gray-200" />
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">{e.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{e.role} • {e.department}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {filteredAdmins.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2"><Shield size={16} className="text-emerald-400" /> Admins ({filteredAdmins.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAdmins.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-4 hover:border-emerald-500/50 transition-colors group">
                      <img src={a.avatar} alt={a.name} className="w-10 h-10 rounded-full border border-gray-200" />
                      <div className="min-w-0">
                        <div className="font-bold text-gray-900 group-hover:text-emerald-400 transition-colors truncate">{a.name}</div>
                        <div className="text-[10px] text-gray-500 truncate">{a.role}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Dashboard Overview" description="Key performance indicators and quick system stats." />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard title="Total Employees" value={employees.length.toLocaleString()} icon={<Users size={24} />} trend="up" trendValue="+12% from last month" />
        <StatCard title="Administrators" value={admins.length.toString()} icon={<Shield size={24} />} trend="stable" trendValue="Verified" />
        <StatCard title="Active Projects" value={activeProjects.toString()} icon={<Briefcase size={24} />} trend="down" trendValue="-2 this week" />
        <StatCard title="System Uptime" value="99.9%" icon={<Activity size={24} />} trend="up" trendValue="Stable" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-lg">
          <h3 className="font-bold mb-4 text-sm sm:text-base text-gray-900">Employee Growth</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs><linearGradient id="dashGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} /><stop offset="95%" stopColor="#3b82f6" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#dashGrad)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-lg">
          <h3 className="font-bold mb-4 text-sm sm:text-base text-gray-900">Project Status</h3>
          <div className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', color: '#111827', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
