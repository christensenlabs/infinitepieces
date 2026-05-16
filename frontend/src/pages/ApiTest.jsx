import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/firebase';

export default function ApiTest() {
  const { firebaseUser, authLoading } = useApp();
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function callHello() {
    setLoading(true);
    setResponse(null);
    setError(null);

    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch('/api/hello', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const text = await res.text();
      if (res.ok) {
        try {
          setResponse(JSON.parse(text));
        } catch {
          setResponse(text);
        }
      } else {
        setError({ status: res.status, text });
      }
    } catch (err) {
      setError({ status: 0, text: err.message });
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return null;

  return (
    <div className="h-screen w-full bg-brand-dark flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="relative z-20 w-full max-w-lg p-10 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-cyan-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl">
            <span className="text-2xl font-black">⚡</span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
            API <span className="text-blue-400 font-light">Test</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.3em] mb-8">Firebase Auth Verification</p>

          {firebaseUser ? (
            <div className="w-full space-y-5">
              <div className="px-4 py-3 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Signed in as</p>
                <p className="text-blue-400 text-sm font-semibold">{firebaseUser.email}</p>
              </div>

              <button
                onClick={callHello}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-white text-slate-800 py-4 rounded-2xl font-bold text-sm hover:bg-blue-50 active:scale-95 shadow-xl transition-all disabled:opacity-60"
              >
                {loading ? 'Calling...' : 'GET /api/hello'}
              </button>

              {response && (
                <div className="px-5 py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                  <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">Response</p>
                  <pre className="text-emerald-300 text-sm font-mono">
                    {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
                  </pre>
                </div>
              )}

              {error && error.status === 403 && (
                <div className="px-5 py-6 bg-rose-500/10 rounded-2xl border border-rose-500/20 space-y-1">
                  <p className="text-rose-400 text-lg font-black">403 Forbidden</p>
                  <p className="text-slate-400 text-sm">
                    Your account does not have permission to access this resource.
                  </p>
                </div>
              )}

              {error && error.status !== 403 && (
                <div className="px-5 py-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                  <p className="text-[10px] font-black text-rose-400 uppercase tracking-widest mb-2">Error</p>
                  <pre className="text-rose-300 text-sm font-mono whitespace-pre-wrap">
                    HTTP {error.status}: {error.text}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            <div className="w-full space-y-4">
              <p className="text-slate-400 text-sm">Sign in to test API authentication.</p>
              <a
                href="/login"
                className="block w-full text-center bg-white text-slate-800 py-4 rounded-2xl font-bold text-sm hover:bg-blue-50 active:scale-95 shadow-xl transition-all"
              >
                Go to Login
              </a>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-white/5 w-full">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bearer Token Auth via Firebase</p>
          </div>
        </div>
      </div>
    </div>
  );
}
