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
    case 'staff_callout': return 'bg-red-50 border-red-300 border-l-4 border-l-red-500 hover:bg-red-100';
    case 'parent_cancel': return 'bg-orange-50 border-orange-300 border-l-4 border-l-orange-500 hover:bg-orange-100';
    case 'completed': return 'bg-slate-100 border-slate-200 border-l-4 border-l-slate-400 opacity-60';
    default: return 'bg-white border-slate-200 border-l-4 border-l-blue-500 hover:bg-slate-50';
  }
};
