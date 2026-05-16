import { api } from './client';

export function fetchCurrentUser() {
  return api.get('/users/self');
}
