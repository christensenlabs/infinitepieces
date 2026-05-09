import React from 'react';
import { Scissors, Loader2 } from 'lucide-react';

export default function ActivityMakerView({ activityData }) {
  return (
    <>
      {!activityData && (
         <div className="flex flex-col items-center justify-center h-[50vh] opacity-30 no-print text-center">
           <Scissors className="w-20 h-20 mb-4 text-slate-900" />
           <p className="text-2xl font-black uppercase tracking-widest text-slate-900">Activity Maker</p>
           <p className="text-lg font-medium text-slate-600">Select an activity type and theme in the sidebar to generate printables.</p>
         </div>
      )}

      {activityData?.type === 'worksheet' && (
        <div className="a4-container p-8 flex flex-col relative shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
          <header className="mb-6 flex justify-between items-end border-b-4 border-slate-800 pb-4">
              <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900">{activityData.theme}</h1>
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Name: ______________________</span>
          </header>
          <div className="flex-grow flex items-center justify-center">
              <img src={activityData.url} alt="Worksheet" className="max-w-full max-h-full object-contain" style={{ maxHeight: '240mm' }} />
          </div>
        </div>
      )}

      {activityData?.type === 'craft' && (
        <div className="a4-container p-8 flex flex-col relative shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
          <header className="mb-4 border-b-8 border-slate-800 pb-6 text-center">
              <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900" contentEditable suppressContentEditableWarning>{activityData.title}</h1>
          </header>

          <div className="mb-6 bg-slate-50 p-6 border-4 border-slate-800 rounded-2xl print:bg-transparent print:rounded-none">
              <h3 className="font-black text-xl uppercase tracking-wider mb-3 border-b-2 border-slate-800 inline-block text-slate-900">Materials Needed:</h3>
              <ul className="list-disc pl-6 text-base font-bold text-slate-700 space-y-1">
                  {activityData.materials.map((mat, i) => (
                      <li key={i} contentEditable suppressContentEditableWarning>{mat}</li>
                  ))}
              </ul>
          </div>

          <div className="flex-grow flex flex-col justify-between">
              {activityData.steps.map((step, i) => (
                  <div key={i} className="craft-step-row flex items-center gap-6 border-b-2 border-dashed border-slate-300 py-4 flex-1 last:border-b-0 hover:bg-slate-50 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-3xl shrink-0 print:border-4 print:border-black print:bg-white print:text-black shadow-md print:shadow-none">{i + 1}</div>

                      <div className="w-1/2 pr-4 text-xl font-bold leading-snug text-slate-800" contentEditable suppressContentEditableWarning>
                          {step.text}
                      </div>

                      <div className="w-1/2 h-36 flex justify-center items-center border-4 border-slate-800 rounded-2xl bg-white p-3 shadow-sm print:rounded-none print:shadow-none">
                          {step.status === 'loading' && <Loader2 className="animate-spin text-indigo-500 w-10 h-10"/>}
                          {step.status === 'success' && <img src={step.imgUrl} alt={`Step ${i+1}`} className="max-h-full max-w-full object-contain drop-shadow-md print:drop-shadow-none" />}
                          {step.status === 'error' && <span className="text-slate-400 font-black uppercase text-sm">Image Failed</span>}
                      </div>
                  </div>
              ))}
          </div>
        </div>
      )}
    </>
  );
}
