import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

const MAIN_SITE_ACCESS_CODE = "ABA2026";

export default function SiteLogin() {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === MAIN_SITE_ACCESS_CODE) {
      sessionStorage.setItem('site_authenticated', 'true');
      navigate('/role-select');
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setCode("");
    }
  };

  return (
    <div className="h-screen w-full bg-brand-dark flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-transparent to-brand-dark z-10"></div>
        <div className="w-full h-full bg-brand"></div>
      </div>

      <div className={[
        "relative z-20 w-full max-w-md p-10 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border shadow-2xl transition-all duration-300",
        error ? "border-rose-500/50 animate-shake" : "border-white/10"
      ].join(" ")}>
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl">
            <span className="text-4xl font-black italic">∞</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            INFINITY <span className="text-blue-400 font-light">SUITE</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.3em] mb-10">Clinical OS Gateway</p>

          <form onSubmit={handleSubmit} className="w-full space-y-6">
            <div className="relative">
              <Icons.Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                placeholder="Enter Access Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-white text-xl font-bold tracking-[0.5em] focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600 placeholder:tracking-normal placeholder:text-sm"
              />
            </div>
            <button className="w-full bg-white text-brand-dark py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-blue-50 transition-all active:scale-95 shadow-xl">
              Unlock Motherboard
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 w-full">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Technologist Lead Access</p>
          </div>
        </div>
      </div>
    </div>
  );
}
