import React from 'react';

export default function TAView() {
  return (
      <div className="a4-container p-6 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
        <header className="mb-2 flex justify-between items-end border-b-4 border-slate-800 pb-2">
            <h1 className="text-2xl font-black uppercase tracking-widest whitespace-nowrap text-slate-900">Task Analysis (TA)</h1>
            <div className="flex gap-4 w-1/2">
                <div className="flex items-end flex-grow"><span className="font-bold uppercase text-[10px] text-slate-500">Child:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
            </div>
        </header>
        <div className="flex-grow flex flex-col justify-between">
          {[1, 2].map(p => (
            <React.Fragment key={p}>
              {p === 2 && <div className="w-full border-t-4 border-dashed border-slate-300 my-4 no-print"></div>}
              <div className="ta-program-block p-1 relative flex flex-col w-full box-border">
                  <div className="grid grid-cols-12 gap-x-3 gap-y-1 mb-2">
                      <div className="col-span-12 flex items-end"><span className="font-extrabold text-xs uppercase whitespace-nowrap text-indigo-900 mr-2">Target Skill:</span><div id={`ta-skill-${p}`} className="fill-line text-sm font-bold border-b-2 text-slate-800" contentEditable suppressContentEditableWarning data-placeholder="e.g. Hand Washing"></div></div>
                      <div className="col-span-5 flex items-end"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Instruction (S<sup>D</sup>):</span><div id={`ta-sd-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder='"Wash your hands"'></div></div>
                      <div className="col-span-4 flex items-end"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Chaining:</span><div id={`ta-chaining-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="Total Task"></div></div>
                      <div className="col-span-3 flex items-end"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Mastery:</span><div id={`ta-mastery-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="100% Ind x 3"></div></div>
                  </div>
                  <div className="w-full text-center mb-1 text-[9px] font-bold tracking-wide border border-slate-800 py-0.5 bg-slate-100 text-slate-600 print:bg-transparent">
                      PROMPT KEY: [I]=Independent | [G]=Gestural | [V]=Verbal | [M]=Model | [P]=Physical | [-]=Error
                  </div>
                  <table className="w-full flex-grow">
                      <thead>
                          <tr className="bg-slate-100 print:bg-transparent">
                              <th rowSpan="2" className="p-1 w-6 text-center text-[10px] font-black uppercase border-b-2 border-slate-800 border-r-2 align-bottom">#</th>
                              <th rowSpan="2" className="p-1 w-[46%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 border-r-2 align-bottom">Task Step (Behavioral Chain)</th>
                              <th colSpan="5" className="p-1 text-center text-[10px] font-black uppercase border-b border-slate-800 tracking-wide">Prompt Level Recorded</th>
                          </tr>
                          <tr className="bg-slate-100 print:bg-transparent">
                              {[1,2,3,4,5].map(i => (
                                  <th key={i} className={`p-1 w-[9%] text-center border-b-2 border-slate-800 ${i<5?'border-r border-slate-300':''}`}>
                                      <div className="text-[8px] text-slate-400 font-bold leading-tight mb-0.5">DATE:</div>
                                      <div contentEditable suppressContentEditableWarning className="border-b border-slate-400 w-full min-h-[12px] outline-none bg-white print:bg-transparent"></div>
                                  </th>
                              ))}
                          </tr>
                      </thead>
                      <tbody>
                          {[1,2,3,4,5,6,7,8,9,10].map(t => (
                              <tr key={t} className="hover:bg-slate-50 transition-colors">
                                  <td className="p-1 text-center font-bold text-[11px] text-slate-400 border-r-2 border-slate-800">{t}</td>
                                  <td className="p-1 border-r-2 border-slate-800"><div id={`ta-step-${p}-${t}`} contentEditable suppressContentEditableWarning className="w-full min-h-[16px] text-[12px] leading-tight font-medium text-slate-800"></div></td>
                                  {[1,2,3,4,5].map(i => (
                                      <td key={i} className={`p-1 ${i<5?'border-r border-slate-300':''} font-bold text-center align-middle`}><div contentEditable suppressContentEditableWarning className="w-full h-full text-center text-[11px] outline-none text-slate-700"></div></td>
                                  ))}
                              </tr>
                          ))}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-800 bg-slate-50 print:bg-transparent">
                          <tr>
                              <td colSpan="2" className="p-1 pr-2 text-right font-bold uppercase text-[10px] tracking-wide align-middle border-r-2 border-slate-800 text-slate-600">Total Independent (%)</td>
                              {[1,2,3,4,5].map(i => (
                                  <td key={i} className={`p-1 ${i<5?'border-r border-slate-300':''}`}><div contentEditable suppressContentEditableWarning className="w-full text-center text-[11px] font-bold outline-none text-slate-700"></div></td>
                              ))}
                          </tr>
                      </tfoot>
                  </table>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
  );
}
