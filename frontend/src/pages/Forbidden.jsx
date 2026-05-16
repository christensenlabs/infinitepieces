import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Forbidden() {
  const { firebaseUser, signOut } = useApp();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <div className="h-screen w-full bg-brand-dark flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-900/20 via-transparent to-transparent"></div>

      <div className="relative z-20 w-full max-w-md p-10 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-rose-500/20 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-rose-400 to-red-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl">
            <span className="text-4xl font-black">!</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-2">
            Access <span className="text-rose-400 font-light">Denied</span>
          </h1>
          <p className="text-slate-400 text-sm mb-2">
            Signed in as <span className="text-white font-medium">{firebaseUser?.email}</span>
          </p>
          <p className="text-slate-500 text-sm mb-8">
            Your account has not been provisioned for this application. Contact your administrator to request access.
          </p>

          <button
            onClick={handleSignOut}
            className="w-full bg-white text-slate-800 py-4 rounded-2xl font-bold text-sm hover:bg-rose-50 active:scale-95 shadow-xl transition-all"
          >
            Sign Out
          </button>

          <div className="mt-8 pt-6 border-t border-white/5 w-full">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">403 Forbidden</p>
          </div>
        </div>
      </div>
    </div>
  );
}
