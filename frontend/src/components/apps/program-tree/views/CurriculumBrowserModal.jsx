import React, { useState } from "react";
import { cn } from '../utils';
import I from '../components/Icon';
import Badge from '../components/Badge';
import Button from '../components/Button';
import ModalComponent from '../components/ModalComponent';

export default function CurriculumBrowserModal({ domains, curriculum, onClose, onSelectProgram }) {
  const [activeDomain, setActiveDomain] = useState(domains[0]);

  const filteredPrograms = curriculum.filter(p => p.domain === activeDomain || (activeDomain === "All" && p));

  return (
    <ModalComponent title="ACE Curriculum Database" subtitle="Browse and import evidence-based treatment templates." onClose={onClose} width="max-w-5xl" icon={<I name="database" className="text-indigo-500" />}>
      <div className="flex flex-col md:flex-row gap-6 h-full min-h-[50vh]">
        {/* Sidebar Categories */}
        <div className="w-full md:w-64 bg-slate-50 rounded-2xl border border-slate-200 p-4 shrink-0 overflow-y-auto custom-scrollbar">
          <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest mb-3 px-2">Skill Domains</h4>
          <div className="space-y-1">
            <button
              onClick={() => setActiveDomain("All")}
              className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors", activeDomain === "All" ? "bg-indigo-100 text-indigo-800" : "text-slate-600 hover:bg-slate-200")}
            >
              All Domains
            </button>
            {domains.map(d => (
              <button
                key={d}
                onClick={() => setActiveDomain(d)}
                className={cn("w-full text-left px-3 py-2 rounded-xl text-sm font-bold transition-colors", activeDomain === d ? "bg-indigo-100 text-indigo-800" : "text-slate-600 hover:bg-slate-200")}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Program List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
          {filteredPrograms.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <I name="target" className="text-4xl mb-2 opacity-50" />
              <p className="font-bold">No templates found for this domain.</p>
            </div>
          ) : (
            filteredPrograms.map((prog, i) => (
              <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
                <div>
                  <Badge className="bg-blue-50 text-blue-800 border-blue-200 mb-2">{prog.method}</Badge>
                  <h4 className="text-lg font-black text-slate-800">{prog.title}</h4>
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{prog.desc}</p>
                </div>
                <Button variant="primary" className="shrink-0" onClick={() => onSelectProgram(prog)}>
                  <I name="plus" /> Import Draft
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </ModalComponent>
  );
}
