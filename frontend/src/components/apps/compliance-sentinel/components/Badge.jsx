import React from 'react';
import { cn } from '../utils';
import Icon from './Icon';

export default function Badge({ children, tone = "slate", icon }) {
  const tones = {
    slate: "bg-slate-100 text-slate-700 border-slate-200",
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    red: "bg-rose-50 text-rose-800 border-rose-200",
    gold: "bg-amber-50 text-amber-800 border-amber-200",
    blue: "bg-blue-50 text-blue-800 border-blue-200",
    purple: "bg-purple-50 text-purple-800 border-purple-200",
    dark: "bg-brand-navy text-white border-brand-navy",
  };
  return (
    <span className={cn("badge", tones[tone])}>
      {icon && <Icon name={icon} />}
      {children}
    </span>
  );
}
