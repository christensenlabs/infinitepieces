import React from "react";

export default function InfoBlock({ title, text }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm h-full">
      <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-indigo-500">{title}</span>
      <p className="whitespace-pre-line text-sm font-medium leading-relaxed text-slate-700">{text}</p>
    </div>
  );
}
