import React from "react";
import { formatDate } from '../utils';
import I from '../components/Icon';
import Badge from '../components/Badge';
import Button from '../components/Button';

export default function FlagsPanel({ flags, programs, flagTypes, isBCBA, onResolve, onOpenProgram }) {
  const sorted = [...flags].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      {sorted.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-5xl">
            <I name="flag" className="text-slate-300" />
          </div>
          <h3 className="heading-section text-brand-navy">Feedback queue is empty</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">RBT and caregiver flags will appear here for BCBA review.</p>
        </div>
      ) : (
        sorted.map((f) => {
          const program = programs.find((p) => p.id === f.programId);
          return (
            <div key={f.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge className={f.status === "Resolved" ? "border-slate-200 bg-slate-100 text-slate-600" : "border-amber-200 bg-amber-50 text-amber-800"}>
                      {f.status}
                    </Badge>
                    <Badge className="border-blue-200 bg-blue-50 text-blue-800">{flagTypes[f.type] || f.type}</Badge>
                  </div>
                  <p className="text-lg font-black text-brand-navy">{f.reason}</p>
                  <p className="mt-1 text-xs font-bold text-slate-500">
                    From: {f.requestedBy || "Team"} - {formatDate(f.createdAt)}
                  </p>
                  {program ? <p className="mt-2 text-sm font-black text-blue-700">Program: {program.target}</p> : null}
                </div>
                <div className="flex flex-wrap gap-2">
                  {program ? (
                    <Button variant="light" onClick={() => onOpenProgram(program)}>
                      <I name="edit" /> Open Program
                    </Button>
                  ) : null}
                  {isBCBA && f.status === "Open" ? (
                    <Button variant="green" onClick={() => onResolve(f.id)}>
                      <I name="check" /> Resolve
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
