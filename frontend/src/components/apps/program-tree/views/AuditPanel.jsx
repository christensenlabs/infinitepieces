import React from "react";
import { formatDate } from '../utils';
import I from '../components/Icon';
import Badge from '../components/Badge';

export default function AuditPanel({ audit }) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm animate-in fade-in duration-300">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-brand-navy">Activity Log</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">Local audit-style history for this prototype workspace.</p>
        </div>
        <Badge className="border-slate-200 bg-slate-100 text-slate-600">{audit.length} Events</Badge>
      </div>
      {audit.length === 0 ? (
        <p className="text-sm font-medium text-slate-500 text-center py-10">No activity yet.</p>
      ) : (
        <div className="space-y-3">
          {audit.map((item) => (
            <div key={item.id} className="flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-4 hover:bg-slate-100 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-lg shadow-sm border border-slate-200 shrink-0 text-slate-500">
                <I name={item.type === "flag" ? "flag" : item.type === "program" ? "target" : item.type === "client" ? "client" : "shield"} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">{item.message}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{formatDate(item.createdAt)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
