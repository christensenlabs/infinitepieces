import { api } from './client';

export function fetchShifts() {
  return api.get('/shifts');
}
