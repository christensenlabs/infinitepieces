import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { auth } from '../lib/firebase';

export default function Profile() {
  const { user, setUser, signOut, authLoading } = useApp();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  if (authLoading) return null;
  if (!user) {
    navigate('/login');
    return null;
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const token = await auth.currentUser.getIdToken();
      const res = await fetch(`/api/users/${user.userId}/name`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName }),
      });
      if (res.ok) {
        const updated = await res.json();
        setUser(updated);
        setSuccess(true);
      } else {
        const body = await res.text();
        setError(`Failed to save: ${body}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="h-screen w-full bg-brand-dark flex items-center justify-center relative overflow-hidden font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>

      <div className="relative z-20 w-full max-w-md p-10 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-2xl">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-2xl">
            <span className="text-2xl font-black">
              {firstName && lastName ? `${firstName[0]}${lastName[0]}` : '??'}
            </span>
          </div>
          <h1 className="text-3xl font-black text-white tracking-tighter mb-1">
            Edit <span className="text-blue-400 font-light">Profile</span>
          </h1>
          <p className="text-slate-400 text-sm mb-8">{user.email}</p>

          <div className="w-full space-y-4 text-left">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full mt-1 bg-white/5 border border-white/10 text-white text-sm rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full mt-1 bg-white/5 border border-white/10 text-white text-sm rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
              />
            </div>
          </div>

          {error && <p className="mt-4 text-rose-400 text-sm">{error}</p>}
          {success && <p className="mt-4 text-emerald-400 text-sm font-medium">Profile updated!</p>}

          <div className="w-full mt-6 space-y-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-white text-slate-800 py-4 rounded-2xl font-bold text-sm hover:bg-blue-50 active:scale-95 shadow-xl transition-all disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-3 text-slate-400 border border-white/10 rounded-2xl text-sm font-medium hover:text-white hover:border-white/20 transition-all"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-white/5 w-full">
            <button
              onClick={signOut}
              className="w-full py-3 text-slate-500 text-sm hover:text-rose-400 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
