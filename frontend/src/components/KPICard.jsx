import React from 'react';
import { Icons } from './Icons';

const FlatSparkline = () => (
  <div className="h-10 w-full mt-4 relative">
    <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 20">
      <polyline
        points="0,15 100,15"
        fill="none"
        stroke="#cbd5e1"
        strokeWidth="2"
        strokeDasharray="4 4"
      />
      <circle cx="100" cy="15" r="3" fill="#cbd5e1" />
    </svg>
  </div>
);

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {Object|null} props.metric - { value, delta, period } from API, or null while loading
 * @param {string} props.iconColor - Tailwind text color class
 * @param {string} props.iconBg - Tailwind bg color class
 */
export default function KPICard({ title, metric, iconColor, iconBg }) {
  const value = metric?.value ?? '—';
  const delta = metric?.delta ?? '0%';
  const period = metric?.period ?? 'vs last 7 days';
  const isPositive = delta.startsWith('+');

  return (
    <div className="bg-white rounded-2xl p-5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-slate-100 flex flex-col">
      <div className="flex items-start gap-4">
        <div
          className={`w-12 h-12 rounded-full ${iconBg} ${iconColor} flex items-center justify-center shrink-0`}
        >
          <Icons.Analytics className="w-6 h-6" />
        </div>
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</p>
          <div className="flex items-end gap-2 mt-1">
            <h3 className="text-3xl font-black text-[#0B132B] leading-none">{value}</h3>
          </div>
          <p className="text-[10px] font-bold mt-1">
            <span className={isPositive ? 'text-emerald-500' : 'text-slate-400'}>{delta}</span>
            <span className="text-slate-400"> {period}</span>
          </p>
        </div>
      </div>
      <FlatSparkline />
    </div>
  );
}
