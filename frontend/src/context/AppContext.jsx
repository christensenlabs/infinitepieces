import { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useApiData } from '../hooks/useApiData';
import { fetchCurrentUser } from '../api/user';
import { fetchNotifications } from '../api/notifications';
import { onAuthChange, signOut } from '../lib/firebase';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [apiKey, setApiKey] = useLocalStorage('infinity_api_key');
  const [showSettings, setShowSettings] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    return onAuthChange(async (user) => {
      setFirebaseUser(user);
      setAuthLoading(false);
      if (user) {
        const token = await user.getIdToken();
        document.cookie = `SESSION=${token}; path=/; max-age=3600; SameSite=Strict`;
      } else {
        document.cookie = 'SESSION=; path=/; max-age=0';
      }
    });
  }, []);

  const { data: user } = useApiData(fetchCurrentUser);
  const { data: notifications } = useApiData(fetchNotifications);

  const openSettings = useCallback(() => setShowSettings(true), []);
  const closeSettings = useCallback(() => setShowSettings(false), []);

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        user,
        firebaseUser,
        authLoading,
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
