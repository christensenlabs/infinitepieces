function classNames(...items) { return items.filter(Boolean).join(" "); }

export default function NavButton({ id, icon: IconCmp, label, view, onNav }) {
  return (
    <button
      onClick={() => onNav(id)}
      className={classNames(
        "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all text-sm",
        view === id
          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_15px_rgba(0,229,255,0.1)]"
          : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
      )}
    >
      <IconCmp size={20} />
      {label}
    </button>
  );
}
