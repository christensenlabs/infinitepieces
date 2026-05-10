import React, { useState } from "react";
import { formatDate } from '../utils';
import I from '../components/Icon';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Select from '../components/Select';
import InfoBlock from '../components/InfoBlock';

export default function ProgramCard({ program, role, pools, onEdit, onClone, onDelete, onBaseline, onFlag, onStatusChange }) {
  const [expanded, setExpanded] = useState(false);
  const isBCBA = role === "BCBA";
  const isRBT = role === "RBT";
  const pool = pools[program.pool] || pools.candidate;

  return (
    <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md animate-in slide-in-from-bottom-4">
      <div className="border-b border-slate-100 p-5 md:p-6">
        <div className="flex flex-col justify-between gap-4 xl:flex-row">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap gap-2">
              <Badge className={pool.className}>{pool.short}</Badge>
              {program.domain ? <Badge className="border-slate-200 bg-slate-100 text-slate-600">{program.domain}</Badge> : null}
              {program.method ? <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">{program.method}</Badge> : null}
              {program.baselineData ? (
                <Badge className="border-indigo-200 bg-indigo-50 text-indigo-700">BL: {program.baselineData}</Badge>
              ) : null}
            </div>
            <h3 className="text-xl font-black text-brand-navy md:text-2xl">{program.target || "Untitled Target"}</h3>
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-500">
              {program.objective || "No objective set."}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap gap-2 xl:max-w-xs xl:justify-end">
            {isBCBA ? (
              <>
                <Button variant="light" onClick={onEdit}>
                  <I name="edit" /> Edit
                </Button>
                <Button variant="light" onClick={onClone}>
                  <I name="copy" /> Copy
                </Button>
                {program.pool !== "approved" ? (
                  <Button variant="green" onClick={() => onStatusChange("approved")}>
                    <I name="check" /> Approve
                  </Button>
                ) : (
                  <Button variant="light" onClick={() => onStatusChange("archived")}>
                    <I name="archive" /> Archive
                  </Button>
                )}
              </>
            ) : null}

            {isRBT && program.pool === "baseline" ? (
              <Button variant="primary" onClick={onBaseline}>
                <I name="chart" /> Run Baseline
              </Button>
            ) : null}
            {isRBT && program.pool === "approved" ? (
              <Button variant="light" onClick={() => onFlag("successRBT")}>
                <I name="check" className="text-emerald-500" /> Working Well
              </Button>
            ) : null}
            {isRBT ? (
              <>
                <Button variant="light" onClick={() => onFlag("barrier")}>
                  <I name="alert" className="text-rose-500" /> Barrier
                </Button>
                <Button variant="light" onClick={() => onFlag("stagnant")}>
                  <I name="chart" className="text-amber-500" /> Stagnant Data
                </Button>
              </>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 bg-slate-50 p-5 text-sm text-slate-700 md:grid-cols-2 md:p-6">
        <InfoBlock title="Procedure (SD/Setup)" text={program.procedure || "\u2014"} />
        <InfoBlock title="Prompt & Reinforcement" text={`Prompting: ${program.promptPlan || "\u2014"}\n\nReinforcement: ${program.reinforcementPlan || "\u2014"}`} />
        {expanded ? (
          <>
            <InfoBlock title="Error Correction" text={program.errorCorrection || "\u2014"} />
            <InfoBlock title="Data Collection & Mastery" text={`Data: ${program.dataCollection || "\u2014"}\n\nMastery: ${program.masteryCriteria || "\u2014"}`} />
            <InfoBlock title="Generalization" text={program.generalization || "\u2014"} />
            <InfoBlock title="Caregiver Plain Language" text={program.caregiverPlainLanguage || "\u2014"} />
            {program.reviewNotes?.length ? (
              <div className="md:col-span-2">
                <InfoBlock title="Review Notes" text={program.reviewNotes.join("\n")} />
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between md:px-6">
        <p className="text-xs font-bold text-slate-400">Updated {formatDate(program.updatedAt || program.createdAt)}</p>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" className="px-3 py-2" onClick={() => setExpanded((v) => !v)}>
            {expanded ? "Hide Details" : "Show Details"}
          </Button>
          {isBCBA ? (
            <>
              <Select
                value={program.pool}
                onChange={(e) => onStatusChange(e.target.value)}
                className="w-auto min-w-[190px] py-2"
              >
                {Object.entries(pools).map(([k, v]) => (
                  <option key={k} value={k}>
                    Move: {v.label}
                  </option>
                ))}
              </Select>
              <Button variant="ghost" className="px-3 py-2 text-rose-600 hover:bg-rose-50" onClick={onDelete}>
                <I name="trash" /> Delete
              </Button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
