import React from 'react';

export default function NavItem({ id, Icon, label, activeTab, onTabChange }) {
  return (
    <li>
      <button onClick={() => onTabChange(id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-medium text-left ${activeTab === id ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 text-slate-300 hover:text-white'}`}>
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="truncate">{label}</span>
      </button>
    </li>
  );
}
