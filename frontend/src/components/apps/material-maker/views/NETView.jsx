import React from 'react';

export default function NETView() {
  return (
      <div className="a4-container p-6 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
        <header className="mb-2 flex justify-between items-end border-b-4 border-slate-800 pb-2">
            <h1 className="text-2xl font-black uppercase tracking-widest whitespace-nowrap text-slate-900">NET Data Sheet</h1>
            <div className="flex gap-4 w-1/2">
                <div className="flex items-end flex-grow"><span className="font-bold uppercase text-[10px] text-slate-500">Child:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                <div className="flex items-end w-1/3"><span className="font-bold uppercase text-[10px] text-slate-500">Date:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
            </div>
        </header>
        <div className="flex-grow flex flex-col justify-between">
          {[1, 2].map(p => (
            <React.Fragment key={p}>
              {p === 2 && <div className="w-full border-t-4 border-dashed border-slate-300 my-4 no-print"></div>}
              <div className="net-program-block p-1 relative flex flex-col flex-grow w-full box-border">
                  <div className="grid grid-cols-12 gap-x-3 gap-y-1 mb-2">
                      <div className="col-span-12 flex items-end"><span className="font-extrabold text-xs uppercase whitespace-nowrap text-indigo-900 mr-2">Skill Area:</span><div id={`net-skill-${p}`} className="fill-line text-sm font-bold border-b-2 text-slate-800" contentEditable suppressContentEditableWarning data-placeholder="e.g. Manding"></div></div>
                      <div className="col-span-12 flex items-end mt-1"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Target Goal:</span><div id={`net-goal-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="Measurable goal..."></div></div>
                  </div>
                  <table className="w-full flex-grow mb-1">
                      <thead>
                          <tr className="bg-slate-100 print:bg-transparent">
                              <th className="p-1 w-6 text-center text-[9px] font-black uppercase border-b-2 border-slate-800 align-bottom">#</th>
                              <th className="p-1 w-[35%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Target Response</th>
                              <th className="p-1 w-[40%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Activity / Context</th>
                              <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Ind</th>
                              <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Prm</th>
                              <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Err</th>
                          </tr>
                      </thead>
                      <tbody>
                          {[1,2,3,4,5,6,7,8,9,10].map(t => (
                            <tr key={t} className="hover:bg-slate-50 transition-colors">
                                <td className="p-1 text-center font-bold text-[11px] text-slate-400">{t}</td>
                                <td className="p-1"><div id={`net-target-${p}-${t}`} contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[12px] leading-tight font-medium text-slate-800"></div></td>
                                <td className="p-1"><div id={`net-context-${p}-${t}`} contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[11px] leading-tight text-slate-600"></div></td>
                                <td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                            </tr>
                          ))}
                      </tbody>
                  </table>
                  <div className="grid grid-cols-2 gap-4 mt-auto pt-1 border-t border-dashed border-slate-300">
                      <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Motivators:</span><div id={`net-motivators-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                      <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Generalization:</span><div id={`net-generalization-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                  </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
  );
}
