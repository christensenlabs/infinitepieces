export const schedulerStyles = {
  // Inputs
  input: 'w-full border border-sched-border focus:border-yellow-500 p-2.5 rounded-lg text-sm outline-none transition-all bg-sched-bg text-white placeholder-slate-500',
  select: 'w-full border border-sched-border focus:border-yellow-500 p-2.5 rounded-lg text-sm outline-none bg-sched-bg text-white',
  pinInput: 'w-full text-center text-2xl tracking-[0.5em] border border-sched-border p-3 rounded-xl outline-none focus:ring-2 focus:ring-yellow-500 font-mono bg-sched-bg text-white',

  // Buttons
  btnPrimary: 'bg-yellow-500 text-sched-bg font-bold rounded-xl hover:bg-yellow-600 transition-all shadow-md',
  btnAction: 'bg-yellow-500 text-sched-bg px-4 py-2 rounded-lg text-xs font-bold flex items-center hover:bg-yellow-600 shadow-md transition-colors',

  // Modal
  overlay: 'fixed inset-0 bg-sched-bg/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm',

  // Header
  modalHeader: 'bg-sched-header text-white px-6 py-5 flex items-center justify-between',
};
