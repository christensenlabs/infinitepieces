import React from 'react';
import {
  BarChart2, Calendar, MessageSquare,
  ChevronRight, X, Lock
} from 'lucide-react';

export default function Sidebar({
  activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen,
  isAdminAuthenticated, setIsAdminAuthenticated, requireAdmin, shifts
}) {
  const navItems = [
    { id: 'schedule', icon: Calendar, label: 'Master Schedule', requiresAdmin: false },
    { id: 'dispatches', icon: MessageSquare, label: 'Dispatches', requiresAdmin: true, badge: shifts.filter(s => s.status === 'uncovered' || s.status === 'parent_cancel').length || null },
    { id: 'dashboard', icon: BarChart2, label: 'Ops Dashboard', requiresAdmin: true },
  ];

  return (
    <>
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && <div className="fixed inset-0 bg-slate-900/50 z-20 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}

      <div className={`fixed inset-y-0 left-0 w-[260px] bg-brand text-slate-300 flex flex-col shadow-2xl z-30 transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <button className="flex-1 flex items-center justify-between text-sm bg-white/5 border border-white/10 px-4 py-3 rounded-lg text-white hover:bg-white/10 transition-colors mr-2">
            <div className="flex flex-col text-left">
              <span className="font-bold">Enterprise Admin</span>
              <span className="text-xs text-slate-400 mt-0.5">Primary Clinic</span>
            </div>
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white"><X size={24} /></button>
        </div>

        <nav className="flex-1 space-y-2 px-3 py-6 overflow-y-auto custom-scrollbar">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                if (item.requiresAdmin) {
                  requireAdmin(() => { setActiveTab(item.id); setIsSidebarOpen(false); });
                } else {
                  setActiveTab(item.id); setIsSidebarOpen(false);
                }
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all text-sm font-medium ${
                activeTab === item.id
                ? 'bg-brand-navy text-yellow-400 border-l-4 border-yellow-400 shadow-md'
                : 'text-slate-300 hover:bg-white/5 hover:text-white border-l-4 border-transparent'
              }`}
            >
              <div className="flex items-center space-x-4">
                <item.icon size={20} />
                <span className={activeTab === item.id ? 'font-bold' : ''}>
                  {item.label}
                  {item.requiresAdmin && !isAdminAuthenticated && <Lock size={12} className="inline ml-2 opacity-50 mb-1"/>}
                </span>
              </div>
              {item.badge && <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 bg-brand-dark flex items-center space-x-3 shrink-0">
          <div className="w-10 h-10 rounded-full bg-slate-600 overflow-hidden flex-shrink-0 border-2 border-slate-700">
             <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-indigo-600">
               {isAdminAuthenticated ? 'AD' : 'UI'}
             </div>
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-bold text-white truncate">{isAdminAuthenticated ? 'Operations Admin' : 'Viewer Mode'}</p>
            <p className="text-[10px] text-green-400 flex items-center"><span className="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span> {isAdminAuthenticated ? 'Unlocked' : 'Read-Only'}</p>
          </div>
          {isAdminAuthenticated && (
             <button onClick={() => {setIsAdminAuthenticated(false); setActiveTab('schedule');}} className="text-slate-500 hover:text-red-400" title="Lock Session">
               <Lock size={16} />
             </button>
          )}
        </div>
      </div>
    </>
  );
}
