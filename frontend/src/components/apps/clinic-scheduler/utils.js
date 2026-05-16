// --- HELPER: DATES ---
export const getToday = () => new Date();

export const getStartOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

export const addDays = (date, days) => new Date(new Date(date).setDate(date.getDate() + days));

export const formatDate = (date) => date.toISOString().split('T')[0];

export const getStatusStyles = (status) => {
  switch(status) {
    case 'staff_callout': return 'bg-red-900/20 border border-red-700/50 border-l-4 border-l-red-500 hover:bg-red-900/30';
    case 'parent_cancel': return 'bg-orange-900/20 border border-orange-700/50 border-l-4 border-l-orange-500 hover:bg-orange-900/30';
    case 'completed': return 'bg-sched-bg border border-sched-border border-l-4 border-l-slate-500 opacity-60';
    default: return 'bg-sched-panel border border-sched-border border-l-4 border-l-yellow-500 hover:bg-sched-panel/80';
  }
};
