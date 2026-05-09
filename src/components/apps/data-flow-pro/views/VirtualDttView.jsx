import { LayoutGrid } from 'lucide-react';

export default function VirtualDttView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in">
      <LayoutGrid size={64} className="mb-4 opacity-20 text-cyan-400" />
      <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Virtual DTT Board</h2>
      <p className="font-medium text-sm">Select a client and start a session to render the virtual stimuli array.</p>
    </div>
  );
}
