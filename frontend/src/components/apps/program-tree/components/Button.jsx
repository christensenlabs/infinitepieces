import React from "react";
import { cn } from '../utils';

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-brand-navy text-white hover:bg-blue-950 shadow-sm shadow-blue-950/20",
    gold: "bg-accent-gold-muted text-white hover:bg-amber-500 shadow-sm shadow-amber-600/20",
    green: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm shadow-emerald-700/20",
    red: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm shadow-rose-700/20",
    purple: "bg-purple-700 text-white hover:bg-purple-800 shadow-sm shadow-purple-800/20",
    light: "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    darkGhost: "bg-white/10 text-white hover:bg-white/20",
  };

  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-black transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}
