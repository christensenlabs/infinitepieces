import { Icons } from '../Icons';

export const WIDGET_CONFIGS = [
  {
    key: 'provider',
    title: 'Provider Assistant',
    subtitle: 'Operations copilot for your day.',
    badge: { text: 'AI', className: 'bg-blue-100 text-blue-700' },
    theme: {
      topColor: 'bg-blue-500',
      iconBg: 'bg-brand',
      bg: 'bg-white border-slate-200',
      primaryBtn: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
      secondaryBtn: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
    },
    icon: Icons.Robot,
    appName: 'Provider Assistant',
    sectionLabel: "Today's Summary",
    quickPrompt:
      'Summarize 3 common tasks a clinic provider needs to do at the end of the day, and give a short 1-sentence productivity tip.',
    primaryLabel: 'Quick Triage',
    formatItems: (data) => [
      `${data?.sessionsCompleted ?? 0} sessions completed`,
      `${data?.openNotes ?? 0} open notes to finalize`,
      `${data?.conflicts ?? 0} schedule conflicts detected`,
    ],
    itemIcon: Icons.Shield,
    itemIconClass: 'w-4 h-4 text-emerald-500',
  },
  {
    key: 'bcba',
    title: 'BCBA Assistant',
    subtitle: 'Clinical workflows organized.',
    badge: { text: 'AI', className: 'bg-amber-200 text-amber-800' },
    theme: {
      topColor: 'bg-amber-400',
      iconBg: 'bg-amber-500',
      bg: 'bg-amber-50 border-amber-100',
      primaryBtn: 'bg-amber-100/50 text-amber-700 hover:bg-amber-100',
      secondaryBtn: 'bg-amber-200/50 text-amber-800 hover:bg-amber-200',
    },
    icon: Icons.Users,
    appName: 'BCBA Assistant',
    sectionLabel: 'In Progress',
    quickPrompt:
      'Draft a short, 3-bullet point agenda for a BCBA supervision meeting with an RBT.',
    primaryLabel: 'Draft Agenda',
    formatItems: (data) =>
      data?.tasks?.map((t) => t.label) ?? [
        'Draft progress note',
        'Review behavior plan',
        'Create skill objective',
      ],
    itemIcon: null,
    itemIconFallback: '+',
    itemOpacity: true,
  },
  {
    key: 'caregiver',
    title: 'Caregiver Portal',
    subtitle: 'Secure family connection.',
    badge: null,
    theme: {
      topColor: 'bg-orange-400',
      iconBg: 'bg-orange-500',
      bg: 'bg-orange-50 border-orange-100',
      primaryBtn: 'bg-orange-100/50 text-orange-700 hover:bg-orange-100',
      secondaryBtn: 'bg-orange-200/50 text-orange-800 hover:bg-orange-200',
    },
    icon: Icons.Message,
    appName: 'Caregiver Portal',
    sectionLabel: "Today's Updates",
    quickPrompt:
      'Draft a friendly, 3-sentence Friday update message to send to all parents at an ABA clinic about keeping up the great work over the weekend.',
    primaryLabel: 'Draft Update',
    formatItems: (data) => [
      `${data?.summariesSent ?? 0} session summaries sent`,
      `${data?.newMessages ?? 0} new messages`,
      `${data?.goalsInProgress ?? 0} goals in progress`,
    ],
    itemIcon: Icons.ArrowRight,
    itemIconClass: 'w-4 h-4 text-orange-400',
  },
];
