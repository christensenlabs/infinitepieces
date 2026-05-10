import { useState } from 'react';
import { Settings, Key } from 'lucide-react';

export default function SettingsView({ systemSettings, setSystemSettings, showToast }) {
  const [bcbaPin, setBcbaPin] = useState(systemSettings?.bcbaPin || '222222');
  const [rbtPin, setRbtPin] = useState(systemSettings?.rbtPin || '333333');

  const handleSave = (e) => {
    e.preventDefault();
    setSystemSettings({ bcbaPin, rbtPin });
    showToast("Security settings updated successfully.");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center gap-4 border-b border-dfp-border pb-4">
        <Settings size={28} className="text-cyan-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">System Settings</h2>
      </div>
      <div className="bg-dfp-light p-8 rounded-[3rem] border border-dfp-border">
        <h3 className="text-lg font-black text-white mb-6 flex items-center gap-2"><Key className="text-cyan-400"/> PIN Authentication (Prototype)</h3>
        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest block mb-2">BCBA Admin PIN</label>
              <input type="password" maxLength={6} required value={bcbaPin} onChange={e=>setBcbaPin(e.target.value.replace(/\D/g,''))} className="w-full bg-dfp border border-dfp-border rounded-xl p-4 text-2xl font-black text-cyan-400 tracking-[0.5em] text-center focus:border-cyan-400 outline-none transition-all" />
           </div>
           <div>
              <label className="text-xs font-black uppercase text-slate-500 tracking-widest block mb-2">RBT Field PIN</label>
              <input type="password" maxLength={6} required value={rbtPin} onChange={e=>setRbtPin(e.target.value.replace(/\D/g,''))} className="w-full bg-dfp border border-dfp-border rounded-xl p-4 text-2xl font-black text-cyan-400 tracking-[0.5em] text-center focus:border-cyan-400 outline-none transition-all" />
           </div>
           <button type="submit" className="md:col-span-2 bg-cyan-500 text-dfp-dark py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg hover:bg-white transition-all">Update Access Codes</button>
        </form>
      </div>
    </div>
  );
}
