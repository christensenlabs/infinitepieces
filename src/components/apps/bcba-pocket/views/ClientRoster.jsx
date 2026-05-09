import { Plus } from 'lucide-react';

export default function ClientRoster({ clients, onSelect }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Active Caseload</h2>
          <p className="text-slate-400 text-sm mt-1">Manage auths and trigger workflows.</p>
        </div>
        <button className="flex items-center space-x-2 bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors">
          <Plus size={16} /><span>Add Client</span>
        </button>
      </div>
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-slate-950/50 border-b border-slate-800 text-slate-400">
              <th className="p-4 pl-6">Client</th>
              <th className="p-4">Auth Expiry</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right pr-6">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {clients.map(client => (
              <tr key={client.id} className="hover:bg-slate-800/30 transition-colors group">
                <td className="p-4 pl-6 font-medium text-slate-200">
                  {client.initials} <span className="text-xs text-slate-500 block">{client.diagnosis}</span>
                </td>
                <td className="p-4 text-slate-300">{client.authExpiry}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${client.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                    {client.status}
                  </span>
                </td>
                <td className="p-4 text-right pr-6">
                  <button onClick={() => onSelect(client.id)} className="bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/40 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    Draft Plan
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
