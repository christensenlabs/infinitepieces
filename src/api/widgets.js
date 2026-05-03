import { api } from './client';

export function fetchWidgetData() {
  return api.get('/widgets');
}
