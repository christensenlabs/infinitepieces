import React from 'react';

const VARIANTS = {
  default: 'bg-slate-100 text-slate-500 border border-slate-200',
  success: 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  warning: 'bg-amber-50 text-amber-600 border border-amber-100',
  info: 'bg-blue-100 text-blue-700',
  ai: 'bg-blue-100 text-blue-700',
  'ai-amber': 'bg-amber-200 text-amber-800',
};

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span
      className={`text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest ${VARIANTS[variant] ?? VARIANTS.default} ${className}`}
    >
      {children}
    </span>
  );
}
