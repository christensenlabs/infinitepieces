import React from 'react';
import { Lock, X } from 'lucide-react';

export default function AdminLoginModal({ adminPin, setAdminPin, adminError, onSubmit, onCancel }) {
  return (
    <div className="fixed inset-0 bg-slate-900/80 flex items-center justify-center z-[100] p-4 backdrop-blur-md fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden zoom-in-95">
        <div className="bg-[#0b132b] p-6 text-center text-white relative">
          <Lock className="w-10 h-10 mx-auto text-yellow-400 mb-3" />
          <h2 className="text-xl font-bold">Admin Verification</h2>
          <p className="text-xs text-slate-300 mt-1">Enter your operations PIN to access this feature.</p>
          <button onClick={onCancel} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider text-center">Secure PIN</label>
            <input
              type="password"
              autoFocus
              maxLength={6}
              value={adminPin}
              onChange={(e) => setAdminPin(e.target.value)}
              className="w-full text-center text-2xl tracking-[0.5em] border border-slate-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0b132b] font-mono"
              placeholder="••••••"
            />
          </div>
          {adminError && <p className="text-red-500 text-xs text-center font-bold mb-4 bg-red-50 p-2 rounded">{adminError}</p>}
          <button type="submit" className="w-full bg-[#0b132b] text-white font-bold py-3 rounded-xl hover:bg-[#152243] transition-all shadow-md">
            Unlock Operations
          </button>
        </form>
      </div>
    </div>
  );
}
