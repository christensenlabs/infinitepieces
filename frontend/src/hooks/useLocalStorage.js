import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue = '') {
  const [value, setValue] = useState(() => {
    try {
      return localStorage.getItem(key) ?? initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // localStorage unavailable (e.g. private browsing quota exceeded)
    }
  }, [key, value]);

  return [value, setValue];
}
