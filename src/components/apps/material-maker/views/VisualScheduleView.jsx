import React from 'react';
import { Calendar, Loader2 } from 'lucide-react';

export default function VisualScheduleView({ scheduleItems }) {
  return (
      <div className="a4-container p-10 bg-white shadow-xl rounded-3xl print:shadow-none print:rounded-none transition-all">
         <h1 className="text-4xl font-extrabold uppercase tracking-widest text-center border-b-8 border-black pb-6 mb-8 text-slate-800">My Schedule</h1>

         <div className="flex flex-col gap-6 flex-grow">
           {scheduleItems.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full opacity-30 text-center no-print">
                <Calendar className="w-24 h-24 mb-4 text-black" />
                <p className="text-2xl font-bold uppercase tracking-widest">No Schedule Generated</p>
                <p className="text-lg font-medium">Use the sidebar to create your 4-step visual schedule.</p>
             </div>
           ) : (
             scheduleItems.map((item, idx) => (
               <div key={idx} className="flex items-center gap-6 border-8 border-black p-4 rounded-3xl bg-white shadow-sm flex-1 hover:bg-slate-50 transition-colors">
                 <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-3xl font-extrabold shrink-0 border-4 border-black print:bg-white print:text-black">
                    {idx + 1}
                 </div>

                 <div className="w-36 h-36 border-4 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 bg-slate-50 print:border-black">
                    {item.status === 'loading' && <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />}
                    {item.status === 'success' && <img src={item.url} alt={item.text} className="w-full h-full object-cover" />}
                    {item.status === 'error' && <span className="font-bold text-slate-400 uppercase text-xs">Error</span>}
                    {item.status === 'empty' && <span className="font-bold text-slate-300 uppercase text-xs">Blank</span>}
                 </div>

                 <div className="text-3xl md:text-4xl font-extrabold uppercase text-slate-800 leading-tight flex-grow" contentEditable suppressContentEditableWarning>
                    {item.text || '_________________'}
                 </div>
               </div>
             ))
           )}
         </div>
      </div>
  );
}
