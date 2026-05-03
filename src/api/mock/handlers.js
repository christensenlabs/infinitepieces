import {
  mockUser,
  mockMetrics,
  mockShifts,
  mockNotifications,
  mockWidgets,
  mockApps,
} from './data';

export const handlers = {
  'GET:/user/me': () => mockUser,
  'GET:/metrics': () => mockMetrics,
  'GET:/shifts': () => mockShifts,
  'GET:/notifications': () => mockNotifications,
  'GET:/widgets': () => mockWidgets,
  'GET:/apps': () => mockApps,
};
