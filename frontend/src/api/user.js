import { api } from './client';

export function fetchCurrentUser() {
  return api.get('/user/me');
}
