import { useState } from 'react';
import { Users } from 'lucide-react';
import { dfpStyles } from '../styles';

export default function ClientsView({ clients, setClients, activeClient, setActiveClient, isBCBA, showToast }) {
  const [newClient, setNewClient] = useState({ name: '', age: '', profile: '' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newClient.name.trim()) return;
    const client = { id: Date.now(), name: newClient.name.trim(), age: Number(newClient.age) || "", profile: newClient.profile.trim() };
    setClients(prev => [...prev, client]);
    if (!activeClient) setActiveClient(client);
    setNewClient({ name: '', age: '', profile: '' });
    showToast("Client profile initialized.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className={dfpStyles.sectionBorder}>
        <Users size={28} className="text-cyan-400" />
        <h2 className="text-3xl font-black text-white tracking-tight">Client Roster</h2>
      </div>

      {isBCBA && (
        <div className="bg-dfp-light/80 p-8 rounded-[2rem] border border-dfp-border shadow-lg">
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400 mb-6">Initialize New Profile</h3>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input className="bg-dfp border border-dfp-border text-white p-4 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm font-medium" placeholder="Subject Name" value={newClient.name} onChange={e => setNewClient({...newClient, name: e.target.value})}/>
            <input className="bg-dfp border border-dfp-border text-white p-4 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm font-medium" type="number" placeholder="Age" value={newClient.age} onChange={e => setNewClient({...newClient, age: e.target.value})}/>
            <input className="bg-dfp border border-dfp-border text-white p-4 rounded-xl outline-none focus:border-cyan-400 transition-all text-sm font-medium md:col-span-2" placeholder="Clinical Brief" value={newClient.profile} onChange={e => setNewClient({...newClient, profile: e.target.value})}/>
            <button type="submit" className="md:col-start-4 bg-cyan-500 text-dfp p-4 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-white transition-all shadow-[0_0_15px_rgba(0,229,255,0.3)]">Add Subject</button>
          </form>
        </div>
      )}

      {clients.length === 0 ? (
        <div className="text-center py-20 border border-dfp-border rounded-[2.5rem] border-dashed text-slate-500 italic">No clients assigned yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {clients.map(c => (
            <div key={c.id} className={`p-8 rounded-[2rem] border-2 text-left flex flex-col transition-all ${activeClient?.id === c.id ? dfpStyles.cardActive : dfpStyles.cardInactive}`}>
              <div className="flex justify-between items-start w-full mb-4">
                <div>
                  <h4 className="font-black text-2xl text-white tracking-tight">{String(c.name)} <span className="text-xs text-cyan-400 font-mono ml-2 font-bold bg-dfp px-2 py-1 rounded border border-dfp-border">AGE {c.age}</span></h4>
                  <p className="text-sm text-slate-400 mt-3 leading-relaxed font-medium">{String(c.profile)}</p>
                </div>
              </div>
              <button onClick={() => setActiveClient(c)} disabled={activeClient?.id === c.id} className={`mt-auto text-xs font-bold px-4 py-3 rounded-xl transition-all ${activeClient?.id === c.id ? "bg-cyan-500 text-dfp shadow-[0_0_15px_rgba(0,229,255,0.4)]" : "bg-dfp text-slate-400 border border-dfp-border hover:text-white hover:bg-slate-800"}`}>
                {activeClient?.id === c.id ? "Active View" : "Set Active"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
