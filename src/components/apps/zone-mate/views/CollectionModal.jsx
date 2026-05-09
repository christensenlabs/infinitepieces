import React from 'react';
import { X, Package } from 'lucide-react';

function CollectionModal({ legoCatalog, activeSetId, onSelectSet, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-slate-800 w-full max-w-md rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl animate-in zoom-in-95">
        <div className="p-6 bg-slate-700 flex justify-between items-center">
          <h2 className="text-white font-black uppercase flex items-center gap-2">
            <Package size={20} className="text-blue-400" /> Select New Goal
          </h2>
          <button onClick={onClose} className="text-slate-300 hover:text-white transition-colors"><X /></button>
        </div>
        <div className="p-6 grid grid-cols-1 gap-3">
          {legoCatalog.map((set) => (
            <button
              key={set.id}
              onClick={() => onSelectSet(set.id)}
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${activeSetId === set.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'}`}
            >
              <div className={`p-3 rounded-xl text-white ${set.color} group-hover:scale-110 transition-transform`}>{set.icon}</div>
              <div className="text-left"><div className="text-white font-black uppercase text-sm">{set.name}</div></div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CollectionModal;
