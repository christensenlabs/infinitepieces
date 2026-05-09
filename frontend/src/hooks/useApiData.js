import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Generic data-fetching hook.
 * @param {Function} fetchFn - async function that returns { data, error }
 * @param {Object} options
 * @param {boolean} options.immediate - fetch on mount (default true)
 */
export function useApiData(fetchFn, { immediate = true } = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const mountedRef = useRef(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchFn();
      setData(result.data);
      if (result.error) setError(result.error);
    } catch (err) {
      setError(err.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    if (immediate && !mountedRef.current) {
      mountedRef.current = true;
      load();
    }
  });

  return { data, loading, error, reload: load };
}
