export const dfpStyles = {
  // Cards
  card: 'bg-dfp-light/50 border border-dfp-border rounded-[2rem] p-6 shadow-sm',
  cardActive: 'bg-dfp-light border-cyan-400 shadow-[0_0_30px_rgba(0,229,255,0.1)]',
  cardInactive: 'bg-dfp-light/50 border-dfp-border hover:border-cyan-400/50',

  // Inputs
  input: 'w-full bg-dfp border border-dfp-border rounded-xl p-4 text-white text-sm outline-none focus:border-cyan-400 transition-all',
  select: 'bg-dfp border border-dfp-border text-cyan-400 p-4 rounded-xl font-black text-sm outline-none focus:border-cyan-400',

  // Sections
  sectionBorder: 'flex items-center gap-4 border-b border-dfp-border pb-4',
  panel: 'bg-dfp-light/80 p-8 rounded-[2.5rem] border border-dfp-border shadow-lg',

  // Buttons
  btnAction: 'bg-cyan-500 text-dfp-dark font-black text-xs uppercase tracking-widest hover:bg-white transition-colors shadow-lg',

  // Sidebar
  sidebar: 'w-64 bg-dfp-dark flex flex-col z-50 shrink-0 border-r border-dfp-border shadow-2xl',
  header: 'h-16 bg-dfp-dark/80 backdrop-blur-md border-b border-dfp-border px-8 flex items-center justify-between shrink-0 z-40',
};
