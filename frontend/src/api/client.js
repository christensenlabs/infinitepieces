import { handlers } from './mock/handlers';

const DEFAULT_MOCK_DELAY_MS = 300;

/**
 * Lightweight API client.
 * In mock mode (the default), requests are routed to in-memory handlers
 * with a simulated network delay so loading states are exercisable.
 *
 * When mock mode is disabled, real fetch calls go to baseUrl.
 */
export function createApiClient(baseUrl, options = {}) {
  const { mock = true, delayMs = DEFAULT_MOCK_DELAY_MS } = options;

  async function request(method, path, body) {
    if (mock) {
      return mockRequest(method, path, delayMs);
    }
    return realRequest(method, `${baseUrl}${path}`, body);
  }

  return {
    get: (path) => request('GET', path),
    post: (path, body) => request('POST', path, body),
    put: (path, body) => request('PUT', path, body),
    delete: (path) => request('DELETE', path),
  };
}

async function mockRequest(method, path, delayMs) {
  await new Promise((r) => setTimeout(r, delayMs));

  const key = `${method}:${path}`;
  const handler = handlers[key];

  if (!handler) {
    return { data: null, error: `No mock handler for ${key}` };
  }

  try {
    const data = handler();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

async function realRequest(method, url, body) {
  try {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      return { data: null, error: `HTTP ${res.status}`, status: res.status };
    }

    const data = await res.json();
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message };
  }
}

export const api = createApiClient('/api');
