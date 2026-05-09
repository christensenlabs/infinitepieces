import { useState, useCallback } from 'react';

/**
 * Manages a list of temporary toast notifications.
 * Each toast auto-removes after 3 seconds.
 *
 * @returns {{ toasts: Array<{id, message, type}>, showToast: (message: string, type?: string) => void }}
 */
export function useToasts() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3000);
  }, []);

  return { toasts, showToast };
}
