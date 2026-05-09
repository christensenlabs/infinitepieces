import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function FlashcardsView({ flashcards, activeTab }) {
  return (
    <div id="flashcards-container" className={`a4-container p-8 flashcards-page mt-10 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white ${flashcards.length > 0 && ['dtt', 'net', 'ta', 'prt'].includes(activeTab) ? 'active-print-view block' : 'hidden no-print'}`}>
        <header className="mb-6 flex justify-between items-end border-b-4 border-slate-800 pb-4">
            <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">{activeTab === 'ta' ? 'Visual Schedule' : 'Visual Cues'}</h1>
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Cut into 4x6 cards</span>
        </header>
        <div className="grid grid-cols-2 gap-6 w-full auto-rows-fr">
            {flashcards.map(cue => (
                <div key={cue.id} className="flashcard border-4 border-slate-800 flex flex-col items-center justify-between p-4 bg-white relative rounded-2xl shadow-sm print:rounded-none print:shadow-none" style={{ aspectRatio: '6/4' }}>
                    {cue.label && <div className="absolute top-3 left-3 bg-slate-900 text-white px-3 py-1.5 font-black text-sm rounded-full shadow-md z-10">{cue.label}</div>}

                    {cue.status === 'loading' && <div className="loader !border-t-indigo-600 my-auto" style={{ display:'block', width:'30px', height:'30px' }}></div>}

                    {cue.status === 'success' && <img src={cue.imgUrl} alt={cue.primary} className="max-h-[70%] max-w-full object-contain mb-auto pt-2" />}

                    {cue.status === 'error' && (
                      <div className="flex-grow flex flex-col items-center justify-center text-slate-400 w-full mb-2 mt-6">
                        <AlertCircle className="w-8 h-8 mb-1 opacity-50" />
                        <span className="text-xs font-bold uppercase">Image Failed</span>
                      </div>
                    )}

                    <div className="w-full text-center mt-auto border-t-2 border-dashed border-slate-300 pt-3">
                        <p className="font-extrabold text-xl leading-tight uppercase text-slate-800">{cue.primary}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 hidden print:block">{cue.secondary}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
  );
}
