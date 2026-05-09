import React from 'react';

export default function DTTView() {
  return (
      <div className="a4-container p-6 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
        <header className="mb-2 flex justify-between items-end border-b-4 border-slate-800 pb-2">
            <h1 className="text-2xl font-black uppercase tracking-widest whitespace-nowrap text-slate-900">Discrete Trial Training</h1>
            <div className="flex gap-4 w-1/2">
                <div className="flex items-end flex-grow"><span className="font-bold uppercase text-[10px] text-slate-500">Child:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                <div className="flex items-end w-1/3"><span className="font-bold uppercase text-[10px] text-slate-500">Date:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
            </div>
        </header>
        <div className="flex-grow flex flex-col justify-between">
          {[1, 2].map(p => (
            <React.Fragment key={p}>
              {p === 2 && <div className="w-full border-t-4 border-dashed border-slate-300 my-4 no-print"></div>}
              <div className="ta-program-block p-1 relative flex flex-col flex-grow w-full box-border">
                  <div className="grid grid-cols-12 gap-x-3 gap-y-1 mb-2">
                      <div className="col-span-12 flex items-end"><span className="font-extrabold text-xs uppercase whitespace-nowrap text-indigo-900 mr-2">Skill Area:</span><div id={`dtt-skill-${p}`} className="fill-line text-sm font-bold border-b-2 text-slate-800" contentEditable suppressContentEditableWarning data-placeholder="e.g. Color Identification"></div></div>
                      <div className="col-span-12 flex items-end mt-1"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Target Goal:</span><div id={`dtt-goal-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="Measurable goal..."></div></div>
                  </div>
                  <table className="w-full flex-grow mb-1">
                      <thead>
                          <tr className="bg-slate-100 print:bg-transparent">
                              <th rowSpan="2" className="p-1 w-8 text-center text-[10px] font-black uppercase border-b-2 border-slate-800 align-bottom">Trial</th>
                              <th rowSpan="2" className="p-1 w-[40%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Instruction (S<sup>D</sup>)</th>
                              <th colSpan="3" className="p-1 text-center text-[10px] font-black uppercase border-b border-slate-800">Child Response</th>
                              <th rowSpan="2" className="p-1 w-[20%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Notes</th>
                          </tr>
                          <tr className="bg-slate-100 print:bg-transparent">
                              <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Ind</th>
                              <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Prm</th>
                              <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Err</th>
                          </tr>
                      </thead>
                      <tbody>
                          {[1,2,3,4,5,6,7,8,9,10].map(i => (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                                <td className="p-1 text-center font-bold text-[11px] text-slate-400">{i}</td>
                                <td className="p-1"><div id={`dtt-sd-${p}-${i}`} contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[12px] leading-tight font-medium text-slate-800"></div></td>
                                <td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                                <td className="p-1"><div contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[11px]"></div></td>
                            </tr>
                          ))}
                      </tbody>
                      <tfoot className="border-t-2 border-slate-800 bg-slate-50 print:bg-transparent">
                          <tr>
                              <td colSpan="2" className="p-1 pr-2 text-right font-bold uppercase text-[10px] tracking-wide align-middle text-slate-600">Session Totals</td>
                              <td colSpan="3" className="p-1">
                                  <div className="flex justify-around items-center">
                                      <div className="flex items-end gap-1"><div contentEditable suppressContentEditableWarning className="border-b border-slate-800 w-6 text-center text-[10px] font-bold min-h-[14px] outline-none bg-white print:bg-transparent"></div><span className="font-bold text-[9px] text-slate-500">/ 10</span></div>
                                      <div className="flex items-end gap-1"><div contentEditable suppressContentEditableWarning className="border-b border-slate-800 w-8 text-center text-[10px] font-bold min-h-[14px] outline-none bg-white print:bg-transparent"></div><span className="font-bold text-[9px] text-slate-500">%</span></div>
                                  </div>
                              </td>
                              <td></td>
                          </tr>
                      </tfoot>
                  </table>
                  <div className="grid grid-cols-2 gap-4 mt-auto pt-1 border-t border-dashed border-slate-300">
                      <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Mastery:</span><div id={`dtt-mastery-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                      <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Reinforcers:</span><div id={`dtt-reinforcer-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                  </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
  );
}
