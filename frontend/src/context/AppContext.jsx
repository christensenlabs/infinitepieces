import { createContext, useContext, useCallback, useState } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useApiData } from '../hooks/useApiData';
import { fetchCurrentUser } from '../api/user';
import { fetchNotifications } from '../api/notifications';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [apiKey, setApiKey] = useLocalStorage('infinity_api_key');
  const [showSettings, setShowSettings] = useState(false);

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
