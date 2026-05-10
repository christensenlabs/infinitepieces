import React from 'react';
import { Icons } from '../Icons';
import Badge from '../ui/Badge';
import Avatar from '../ui/Avatar';

export default function DashboardHeader({ user, onOpenCopilot }) {
  return (
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 z-10 shadow-sm">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-black text-brand">Infinite Suite OS</h2>
        <Badge>Protected Operations Hub</Badge>
      </div>

      <div className="flex items-center gap-6">
        <button
          onClick={onOpenCopilot}
          className="hidden md:flex items-center gap-2 bg-gradient-to-r from-brand to-blue-900 text-white px-5 py-2.5 rounded-full text-xs font-bold shadow-md hover:shadow-lg hover:scale-105 transition-all"
        >
          <Icons.Sparkles className="w-4 h-4 text-cyan-400" /> Ask AI Copilot
        </button>

        <div className="relative w-64 hidden lg:block">
          <Icons.Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search patients or staff..."
            className="w-full bg-slate-100 border border-slate-200 text-sm rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
          />
        </div>

        <div className="relative cursor-pointer">
          <Icons.Bell className="w-5 h-5 text-slate-500" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full border-2 border-white" />
        </div>

        <div className="flex items-center gap-2 border-l border-slate-200 pl-6 cursor-pointer">
          <Avatar
            initials={user?.initials ?? 'AM'}
            bgClass="bg-blue-100"
            textClass="text-blue-700"
          />
          <span className="text-sm font-bold text-brand hidden sm:block">
            {user?.name ?? 'Loading...'}
          </span>
          <Icons.ChevronDown className="w-3 h-3 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
