import React from 'react';

export default function NavLink({
  icon: Icon,
  label,
  active = false,
  badge,
  onClick,
}) {
  if (active) {
    return (
      <button
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 bg-[#1A233A] text-white rounded-xl border-l-4 border-amber-500 font-bold text-sm shadow-inner transition-all"
      >
        <Icon className="w-4 h-4 text-amber-500" /> {label}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-3 text-slate-400 hover:text-white hover:bg-white/5 rounded-xl font-medium text-sm transition-colors border-l-4 border-transparent"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4" /> {label}
      </div>
      {badge != null && badge > 0 && (
        <span className="bg-amber-500 text-[#060B19] text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}
