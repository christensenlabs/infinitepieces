import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useApiData } from '../hooks/useApiData';
import { fetchNotifications } from '../api/notifications';
import { onAuthChange, signOut, auth } from '../lib/firebase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [apiKey, setApiKey] = useLocalStorage('infinity_api_key');
  const [showSettings, setShowSettings] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    return onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      setAuthLoading(false);
      setForbidden(false);
      if (fbUser) {
        const token = await fbUser.getIdToken();
        document.cookie = `SESSION=${token}; path=/; max-age=3600; SameSite=Strict`;
        try {
          const res = await fetch('/api/users/self', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            setUser(await res.json());
          } else if (res.status === 403) {
            setUser(null);
            setForbidden(true);
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        document.cookie = 'SESSION=; path=/; max-age=0';
        setUser(null);
      }
    });
  }, []);

  const { data: notifications } = useApiData(fetchNotifications);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        user,
        setUser,
        firebaseUser,
        authLoading,
        forbidden,
        signOut,
        notifications,
        showSettings,
        openSettings,
        closeSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within <AppProvider>');
  return ctx;
}
