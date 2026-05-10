import { useState } from 'react';
import { ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginScreen({ setRole, setActiveTab, systemSettings }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setTimeout(() => {
      if (pin === (systemSettings?.bcbaPin || '222222')) { setRole('BCBA'); setActiveTab('hub'); }
      else if (pin === (systemSettings?.rbtPin || '333333')) { setRole('RBT'); setActiveTab('hub'); }
      else if (pin === '111111') { setRole('Caregiver'); setActiveTab('hub'); }
      else {
        setError(true);
        setTimeout(() => setError(false), 1000);
        setPin("");
      }
      setIsAuthenticating(false);
    }, 600);
  };

  return (
    <div className="h-screen bg-dfp flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <div className={`bg-dfp-light/80 backdrop-blur-2xl p-10 rounded-[3rem] border border-dfp-border w-full max-w-sm shadow-2xl relative z-10 transition-transform ${error ? 'border-rose-500/50 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : ''}`}>
        <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl mx-auto flex items-center justify-center text-slate-950 mb-8 shadow-[0_0_30px_rgba(0,229,255,0.4)]">
          <ShieldCheck size={40} />
        </div>
        <h1 className="text-3xl font-black text-white text-center tracking-tight mb-2">Data Flow <span className="text-cyan-400">Pro</span></h1>
        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 text-center mb-8">Secure Access Required</p>
        <form onSubmit={handleLogin}>
          <input
            type="password" autoFocus required maxLength={6} placeholder="Enter PIN"
            value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            className="w-full bg-dfp border border-dfp-border rounded-2xl px-6 py-4 text-center text-2xl tracking-[0.5em] font-black text-cyan-400 focus:outline-none focus:border-cyan-500 transition-colors shadow-inner mb-6"
          />
          <button type="submit" disabled={isAuthenticating} className="w-full bg-cyan-500 text-slate-950 py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-white transition-all shadow-[0_0_20px_rgba(0,229,255,0.2)] disabled:opacity-50 flex justify-center items-center h-14">
            {isAuthenticating ? <Loader2 className="animate-spin" size={24} /> : "Authenticate"}
          </button>
        </form>
      </div>
    </div>
  );
}
