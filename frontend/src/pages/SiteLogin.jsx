import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { signInWithGoogle } from '../lib/firebase';

export default function SiteLogin() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { firebaseUser, authLoading } = useApp();

  if (authLoading) return null;
  if (firebaseUser) return <Navigate to="/dashboard" replace />;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Sign-in failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-brand-dark flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-dark via-transparent to-brand-dark z-10"></div>
        <div className="w-full h-full bg-brand"></div>
      </div>

      <div className="relative z-20 w-full max-w-md p-10 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl flex items-center justify-center text-white mb-8 shadow-2xl">
            <span className="text-4xl font-black italic">∞</span>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
            INFINITY <span className="text-blue-400 font-light">SUITE</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.3em] mb-10">Clinical OS Gateway</p>

          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 py-5 rounded-2xl font-bold text-sm hover:bg-blue-50 active:scale-95 shadow-xl transition-all disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? 'Signing in...' : 'Sign in with Google'}
          </button>

          {error && (
            <p className="mt-4 text-rose-400 text-sm font-medium">{error}</p>
          )}

          <div className="mt-8 pt-8 border-t border-white/5 w-full">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Secure Authentication via Google</p>
          </div>
        </div>
      </div>
    </div>
  );
}
