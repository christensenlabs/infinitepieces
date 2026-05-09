const DELAYS = [1000, 2000, 4000];

export async function callGemini(prompt, apiKey, systemText = '') {
  if (!apiKey) throw new Error('API Key required');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${encodeURIComponent(apiKey)}`;
  const payload = { contents: [{ parts: [{ text: prompt }] }] };

  if (systemText) {
    payload.systemInstruction = { parts: [{ text: systemText }] };
  }

  for (let i = 0; i < DELAYS.length + 1; i++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Gemini API error ${res.status}`);
      const data = await res.json();
      return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
    } catch (error) {
      if (i === DELAYS.length) throw error;
      await new Promise((resolve) => setTimeout(resolve, DELAYS[i]));
    }
  }
}
