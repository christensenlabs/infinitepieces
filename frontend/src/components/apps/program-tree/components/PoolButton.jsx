import React from "react";
import { cn } from '../utils';

export default function PoolButton({ active, label, count, dot, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-sm font-black transition-all",
        active ? "bg-brand-navy text-white shadow-md scale-[1.02]" : "text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200"
      )}
    >
      <span className="flex items-center gap-2">
        {dot ? <span className={cn("h-2.5 w-2.5 rounded-full shadow-inner", dot)} /> : null}
        {label}
      </span>
      <span className={cn("rounded-full px-2 py-0.5 text-xs", active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500")}>{count}</span>
    </button>
  );
}
