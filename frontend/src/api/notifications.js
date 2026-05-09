import { api } from './client';

export function fetchNotifications() {
  return api.get('/notifications');
}
