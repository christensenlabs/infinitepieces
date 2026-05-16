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
        setError(`HTTP ${res.status}: ${text}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-surface text-secondary">
        Loading auth...
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-surface">
      <div className="w-full max-w-md p-8 space-y-6">
        <h1 className="text-xl font-bold text-white">API Auth Test</h1>

        {firebaseUser ? (
          <div className="space-y-4">
            <p className="text-sm text-secondary">
              Signed in as <span className="text-accent">{firebaseUser.email}</span>
            </p>

            <button
              onClick={callHello}
              disabled={loading}
              className="w-full py-2 bg-accent text-black rounded font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {loading ? 'Calling...' : 'GET /api/hello'}
            </button>

            {response && (
              <pre className="p-4 bg-card rounded text-sm text-green-400 overflow-auto">
                {typeof response === 'string' ? response : JSON.stringify(response, null, 2)}
              </pre>
            )}
            {error && (
              <pre className="p-4 bg-card rounded text-sm text-red-400 overflow-auto whitespace-pre-wrap">
                {error}
              </pre>
            )}
          </div>
        ) : (
          <p className="text-secondary">
            Not signed in. <a href="/login" className="text-accent underline">Log in</a> first.
          </p>
        )}
      </div>
    </div>
  );
}
