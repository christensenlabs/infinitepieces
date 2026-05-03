import { api } from './client';

export function fetchMetrics() {
  return api.get('/metrics');
}
