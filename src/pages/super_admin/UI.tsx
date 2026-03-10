
import React from 'react';
import { TrendingUp, TrendingDown, Activity, Star } from 'lucide-react';

export const StatCard = ({ title, value, icon, trend, trendValue }: {
  title: string; value: string; icon: React.ReactNode; trend?: 'up' | 'down' | 'stable'; trendValue?: string
}) => (
  <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group overflow-hidden relative">
    <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-150 transition-transform">
      {icon}
    </div>
    <div className="flex items-center justify-between mb-4">
      <div className={`p-3 rounded-2xl ${/* keep passed color such as bg-blue-500 */ ''} bg-opacity-10 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      {trend && (
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {trend === 'up' ? '+' : ''}{trend}% this month
        </span>
      )}
    </div>
    <h3 className="text-gray-900 text-[10px] font-black uppercase tracking-widest">{title}</h3>
    <div className="flex items-baseline gap-2 mt-1">
      <p className="text-3xl font-black text-gray-900">{value}</p>
      {trendValue && <span className="text-xs font-bold text-gray-900">{trendValue}</span>}
    </div>
  </div>
);

export const SectionHeader = ({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) => (
  <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 sm:mb-8 gap-4">
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h2>
      <p className="text-gray-500 text-xs sm:text-sm">{description}</p>
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
