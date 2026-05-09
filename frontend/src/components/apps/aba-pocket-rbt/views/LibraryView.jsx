import React from 'react';
import { Library, Copy, Trash2 } from 'lucide-react';

export default function LibraryView({ savedLibrary, copyToClipboard, deleteFromLibrary, setGeneratedResult, setActiveTab }) {
  return (
    <div className="space-y-4">
      {savedLibrary.length === 0 ? <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed text-slate-400"><Library className="mx-auto w-12 h-12 mb-2 opacity-50"/>Vault empty.</div> : savedLibrary.map(item => (
        <div key={item.id} className="p-5 border border-slate-200 rounded-xl flex flex-col sm:flex-row justify-between sm:items-center gap-4 hover:shadow-md transition-all bg-white">
          <div>
            <h4 className="font-bold text-slate-800">{item.title}</h4>
            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.date}</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => copyToClipboard(item.content)} className="p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 rounded-lg"><Copy className="w-4 h-4" /></button>
            <button onClick={() => deleteFromLibrary(item.id)} className="p-2 text-slate-400 hover:text-rose-500 bg-slate-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
            <button onClick={() => { setGeneratedResult(item.content); setActiveTab('result'); }} className="px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-bold rounded-lg ml-2 transition-colors">Open</button>
          </div>
        </div>
      ))}
    </div>
  );
}
