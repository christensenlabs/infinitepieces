export const mockUser = {
  id: 'usr_001',
  name: 'Alexandra M.',
  initials: 'AM',
  role: 'Enterprise Admin',
  scope: 'All locations',
  avatarUrl: null,
  status: 'online',
};

export const mockMetrics = {
  sessionRecovery: { value: '73%', delta: '+12%', period: 'vs last 7 days' },
  staffUtilization: { value: '81%', delta: '+5%', period: 'vs last 7 days' },
  retentionLift: { value: '18%', delta: '+3%', period: 'vs last 7 days' },
  familyEngagement: { value: '64%', delta: '+8%', period: 'vs last 7 days' },
};

export const mockShifts = {
  openShifts: [
    {
      id: 's1',
      patient: 'Liam S.',
      time: '9:00 AM – 12:00 PM',
      role: 'RBT',
      bounty: 15,
      status: 'open',
    },
    {
      id: 's2',
      patient: 'Emma W.',
      time: '1:00 PM – 4:00 PM',
      role: 'RBT',
      bounty: 20,
      status: 'claimed',
      claimedBy: 'Michael T.',
    },
    {
      id: 's3',
      patient: 'Noah B.',
      time: '10:00 AM – 1:00 PM',
      role: 'RBT',
      bounty: 25,
      status: 'open',
    },
  ],
  surgeActive: true,
  surgeLevel: 'moderate',
};

export const mockNotifications = {
  unread: 3,
};

export const mockWidgets = {
  provider: {
    sessionsCompleted: 12,
    openNotes: 3,
    conflicts: 1,
  },
  bcba: {
    tasks: [
      { label: 'Draft progress note for Liam S.', done: false },
      { label: 'Review behavior plan – Emma W.', done: false },
      { label: 'Create skill acquisition objective', done: false },
    ],
  },
  caregiver: {
    summariesSent: 5,
    newMessages: 2,
    goalsInProgress: 8,
  },
};

export const mockApps = [
  { key: 'roi', title: 'Clinical ROI Numbers', icon: 'Analytics', appName: 'Clinical ROI Numbers' },
  { key: 'scheduling', title: 'Scheduling', icon: 'Calendar', appName: 'Scheduling' },
  { key: 'subpool', title: 'SubPool', icon: 'Bolt', appName: 'SubPool Market' },
  { key: 'provider', title: 'Provider Assistant', icon: 'Robot', appName: 'Provider Assistant' },
  { key: 'bcba', title: 'BCBA Assistant', icon: 'Users', appName: 'BCBA Assistant' },
  { key: 'caregiver', title: 'Caregiver Portal', icon: 'Message', appName: 'Caregiver Portal' },
  { key: 'programs', title: 'Program Hub', icon: 'Apps', appName: 'Program Hub' },
  { key: 'progress', title: 'Progress Hub', icon: 'Analytics', appName: 'Progress Hub' },
  { key: 'session', title: 'Session Maker', icon: 'Calendar', appName: 'Session Maker' },
  { key: 'material', title: 'Material Maker', icon: 'Apps', appName: 'Material Maker' },
];
