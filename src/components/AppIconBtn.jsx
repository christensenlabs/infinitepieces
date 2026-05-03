import React from 'react';

export default function AppIconBtn({ title, icon, onClick }) {
  return (
    <div onClick={onClick} className="flex flex-col items-center gap-2 cursor-pointer group">
      <div className="w-14 h-14 bg-white border border-slate-200 rounded-2xl shadow-sm flex items-center justify-center text-[#0B132B] group-hover:border-blue-400 group-hover:shadow-md transition-all">
        {icon}
      </div>
      <span className="text-[10px] font-bold text-slate-600 text-center leading-tight max-w-[60px]">
        {title}
      </span>
    </div>
  );
}
