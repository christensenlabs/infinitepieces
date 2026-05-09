import { FileCheck } from 'lucide-react';

export default function InsuranceHubView() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 animate-in fade-in">
      <FileCheck size={64} className="mb-4 opacity-20 text-emerald-400" />
      <h2 className="text-2xl font-black text-white mb-2 tracking-widest uppercase">Insurance & Approvals</h2>
      <p className="font-medium text-sm">Pending BCBA sign-offs for clearinghouse transmission.</p>
    </div>
  );
}
