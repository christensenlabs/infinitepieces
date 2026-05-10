import React from 'react';
import { Icons } from '../Icons';
import NavLink from '../ui/NavLink';
import Avatar from '../ui/Avatar';

const NAV_ITEMS = [
  { icon: Icons.Analytics, label: 'Analytics' },
  { icon: Icons.Apps, label: 'Apps' },
  { icon: Icons.Calendar, label: 'Scheduling' },
  { icon: Icons.Users, label: 'People' },
  { icon: Icons.Shield, label: 'Compliance' },
  { icon: Icons.Billing, label: 'Billing' },
];

export default function Sidebar({ user, notificationCount, onNavigateHub, onOpenSettings, onOpenApp }) {
  return (
    <aside className="w-64 bg-brand-deep flex flex-col h-full shrink-0 relative z-20 shadow-2xl">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-amber-400 flex items-center justify-center text-brand-deep font-black text-xs shadow-lg">
            &infin;
          </div>
          <div>
            <h1 className="font-black text-white tracking-widest text-sm leading-none">
              INFINITE SUITE
            </h1>
            <p className="text-[8px] text-blue-400 tracking-[0.2em] uppercase font-bold">
              By Infinite Pieces AI
            </p>
          </div>
        </div>

        {/* Org selector */}
        <div className="mt-8 bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center justify-between cursor-pointer">
          <div>
            <p className="text-xs font-bold text-white">{user?.role ?? 'Enterprise Admin'}</p>
            <p className="text-[10px] text-slate-500">{user?.scope ?? 'All locations'}</p>
          </div>
          <Icons.ChevronDown className="w-3 h-3 text-slate-500" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        <NavLink icon={Icons.Hub} label="Hub" active onClick={onNavigateHub} />
        {NAV_ITEMS.map(({ icon, label }) => (
          <NavLink key={label} icon={icon} label={label} onClick={() => onOpenApp(label)} />
        ))}
        <NavLink icon={Icons.Message} label="Messages" badge={notificationCount} onClick={() => onOpenApp('Messages')} />
        <NavLink icon={Icons.Settings} label="Settings" onClick={onOpenSettings} />
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 mb-4 px-2">
          <div className="w-6 h-6 bg-blue-500/20 text-blue-400 rounded flex items-center justify-center">
            <Icons.Shield className="w-3 h-3" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white">HIPAA Compliant</p>
            <p className="text-[8px] text-slate-500 uppercase tracking-wider">
              Zero-Trust Architecture
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between px-2 cursor-pointer hover:bg-white/5 p-2 rounded-lg transition-colors">
          <div className="flex items-center gap-3">
            <Avatar initials={user?.initials ?? 'AM'} />
            <div>
              <p className="text-xs font-bold text-white">{user?.name ?? 'Loading...'}</p>
              <p className="text-[10px] text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />{' '}
                {user?.status === 'online' ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <Icons.Logout className="w-4 h-4 text-slate-500" />
        </div>
      </div>
    </aside>
  );
}
