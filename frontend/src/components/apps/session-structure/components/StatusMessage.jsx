import React from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

export default function StatusMessage({ statusMsg }) {
  if (!statusMsg.text) return null;

  return (
    <div className="absolute top-20 right-8 z-50 animate-in fade-in slide-in-from-top-4">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${statusMsg.type === 'error' ? 'bg-rose-900 border-rose-500 text-white' : 'bg-emerald-900 border-emerald-500 text-white'}`}>
         {statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
         <span className="text-sm font-bold">{statusMsg.text}</span>
      </div>
    </div>
  );
}
