
import React from 'react';
import { TrendingUp, TrendingDown, Activity, Star } from 'lucide-react';

export const StatCard = ({ title, value, icon, trend, trendValue }: { 
  title: string; value: string; icon: React.ReactNode; trend?: 'up' | 'down' | 'stable'; trendValue?: string 
}) => (
  <div className="bg-[#0b1220] p-4 sm:p-6 rounded-xl shadow-lg border border-[#1f2937] flex items-start justify-between transition-all hover:border-[#f37321]/30 hover:shadow-[#f37321]/5">
    <div>
      <p className="text-[#9aa8bd] text-xs sm:text-sm font-medium">{title}</p>
      <h3 className="text-xl sm:text-2xl font-bold mt-1 text-[#e6eef8]">{value}</h3>
      {trend && (
        <div className={`flex items-center mt-2 text-[10px] sm:text-xs font-semibold ${trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-rose-400' : 'text-amber-400'}`}>
          {trend === 'up' ? <TrendingUp size={14} className="mr-1" /> : trend === 'down' ? <TrendingDown size={14} className="mr-1" /> : <Activity size={14} className="mr-1" />}
          {trendValue}
        </div>
      )}
    </div>
    <div className="p-2 sm:p-3 bg-[#0f172a] rounded-lg text-[#f37321] shrink-0 border border-[#1f2937]">
      {icon}
    </div>
  </div>
);

export const SectionHeader = ({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 gap-4">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-[#e6eef8]">{title}</h2>
      <p className="text-[#9aa8bd] text-xs sm:text-sm">{description}</p>
    </div>
    <div className="flex items-center gap-2 sm:gap-3 w-full lg:w-auto">
      {actions}
    </div>
  </div>
);

export const Badge = ({ children, color = 'blue' }: { children?: React.ReactNode; color?: string }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    yellow: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold border whitespace-nowrap ${colors[color] || colors.slate}`}>
      {children}
    </span>
  );
};

export const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star 
          key={s} 
          size={12} 
          className={s <= rating ? "fill-amber-400 text-amber-400" : "text-[#1f2937] fill-[#1f2937]"} 
        />
      ))}
    </div>
  );
};
