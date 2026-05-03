import { useState, useCallback } from 'react';
import { callGemini } from '../lib/gemini';

/**
 * Encapsulates the repeated pattern of: check API key → set loading → call Gemini → set result.
 * Returns { result, loading, execute, clear, setResult }.
 */
export function useGeminiAction(apiKey, { onMissingKey } = {}) {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const execute = useCallback(
    async (prompt, systemText = '') => {
      if (!apiKey) {
        onMissingKey?.();
        return;
      }
      setLoading(true);
      setResult('');
      try {
        const res = await callGemini(prompt, apiKey, systemText);
        if (res) setResult(res);
      } catch {
        setResult('Request failed. Please check your API key in Settings.');
      } finally {
        setLoading(false);
      }
    },
    [apiKey, onMissingKey],
  );

  const clear = useCallback(() => setResult(''), []);

  return { result, loading, execute, clear, setResult };
}
