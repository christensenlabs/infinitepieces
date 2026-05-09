import React from 'react';

export default function QuickChip({ emoji, text, onSelect }) {
  return (
    <button
      onClick={() => onSelect(text)}
      className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white rounded-full transition-all shadow-sm flex items-center gap-1.5"
    >
      <span>{emoji}</span> {text}
    </button>
  );
}
