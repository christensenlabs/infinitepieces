import React from "react";
import I from '../components/Icon';
import Badge from '../components/Badge';
import Button from '../components/Button';
import InfoBlock from '../components/InfoBlock';

export default function CaregiverPanel({ client, programs, onFlag }) {
  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="overflow-hidden rounded-[2rem] bg-gradient-to-r from-blue-700 to-indigo-800 p-8 text-white shadow-lg shadow-blue-950/10">
        <p className="mb-2 text-xs font-black uppercase tracking-widest text-blue-200 flex items-center gap-2">
          <I name="home" /> Caregiver View
        </p>
        <h2 className="text-3xl font-black">Home Practice Library</h2>
        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-blue-100">
          Approved programs for {client?.name || "this learner"} are converted into everyday language so caregivers
          can understand what to practice, what to notice, and what to flag back to the clinical team.
        </p>
      </div>

      {programs.length === 0 ? (
        <div className="rounded-[2rem] border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mb-4 text-5xl">
            <I name="family" className="text-blue-500" />
          </div>
          <h3 className="heading-section text-brand-navy">No approved home programs yet</h3>
          <p className="mt-2 text-sm font-medium text-slate-500">
            Once the BCBA approves a program, it will appear here in caregiver-friendly language.
          </p>
        </div>
      ) : (
        programs.map((p) => (
          <div key={p.id} className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <div className="mb-3 flex flex-wrap gap-2">
                  <Badge className="border-blue-200 bg-blue-50 text-blue-800">{p.domain || "Home Practice"}</Badge>
                  <Badge className="border-emerald-200 bg-emerald-50 text-emerald-800">Approved</Badge>
                </div>
                <h3 className="heading-card text-brand-navy">{p.target}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="light" onClick={() => onFlag(p, "successHome")}>
                  <I name="heart" className="text-rose-500" /> Works at Home
                </Button>
                <Button variant="light" onClick={() => onFlag(p, "barrier")}>
                  <I name="alert" className="text-amber-500" /> Home Barrier
                </Button>
              </div>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <InfoBlock title="How to practice" text={p.caregiverPlainLanguage || "Practice during normal daily routines. Prompt only as much as needed and reinforce success quickly."} />
              <InfoBlock title="What the team is teaching" text={p.objective || "\u2014"} />
              <InfoBlock title="Helpful prompting" text={p.promptPlan || "\u2014"} />
              <InfoBlock title="Reinforcement" text={p.reinforcementPlan || "\u2014"} />
            </div>
          </div>
        ))
      )}
    </div>
  );
}
