import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Icons } from '../components/Icons';

const ROLE_CODES = {
  BCBA: "222222",
  RBT: "333333",
  CAREGIVER: "111111",
};

export default function RoleGate() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const siteAuth = sessionStorage.getItem('site_authenticated');
  if (!siteAuth) return <Navigate to="/login" replace />;

  const checkPin = (e) => {
    e.preventDefault();
    let role = null;
    if (pin === ROLE_CODES.BCBA) role = 'BCBA';
    else if (pin === ROLE_CODES.RBT) role = 'RBT';
    else if (pin === ROLE_CODES.CAREGIVER) role = 'Caregiver';

    if (role) {
      sessionStorage.setItem('user_role', role);
      navigate('/dashboard');
    } else {
      setError(true);
      setTimeout(() => setError(false), 1000);
      setPin("");
    }
  };

  const handleBack = () => {
    sessionStorage.removeItem('site_authenticated');
    navigate('/login');
  };

  return (
    <div className="h-screen w-full bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <button
          onClick={handleBack}
          className="mb-8 flex items-center gap-2 text-slate-400 hover:text-slate-600 font-bold transition-colors"
        >
          <Icons.ChevronLeft className="w-5 h-5" /> Back to Portal
        </button>

        <div className={[
          "bg-white p-10 rounded-[2.5rem] shadow-2xl border transition-all",
          error ? "border-rose-200" : "border-slate-100"
        ].join(" ")}>
          <h2 className="text-2xl font-black text-brand mb-2">Access Identity</h2>
          <p className="text-slate-500 text-sm font-medium mb-8">
            Enter your 6-digit credential PIN to initialize your specific workspace.
          </p>

          <form onSubmit={checkPin}>
            <input
              type="password"
              autoFocus
              required
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              placeholder="••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-5 text-center text-3xl tracking-[0.5em] font-black text-brand focus:outline-none focus:border-blue-500 transition-all mb-6"
            />
            <button className="w-full bg-brand text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg hover:bg-blue-950 transition-all">
              Initialize Session
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-2">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-center mb-2">
              Internal Clearance Keys
            </p>
            <div className="flex justify-between px-2">
              <span className="text-[10px] font-bold text-slate-400">222... (BCBA)</span>
              <span className="text-[10px] font-bold text-slate-400">333... (RBT)</span>
              <span className="text-[10px] font-bold text-slate-400">111... (CG)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
