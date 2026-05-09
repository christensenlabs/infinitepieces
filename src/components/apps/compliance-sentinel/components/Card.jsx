import React from 'react';
import { cn } from '../utils';

export default function Card({ children, className = "" }) {
  return <div className={cn("bg-white border border-slate-200 rounded-[2rem] p-6 shadow-sm", className)}>{children}</div>;
}
