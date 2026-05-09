import React from "react";
import { cn } from '../utils';

export default function Metric({ label, value, tone }) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-100",
    blue: "bg-blue-50 text-blue-800 border-blue-100",
    purple: "bg-purple-50 text-purple-800 border-purple-100",
    amber: "bg-amber-50 text-amber-800 border-amber-100",
  };
  return (
    <div className={cn("rounded-2xl border p-4 transition-all hover:shadow-sm", tones[tone] || tones.blue)}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{label}</p>
    </div>
  );
}
