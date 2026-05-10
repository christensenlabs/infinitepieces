import React from "react";
import I from './Icon';
import Button from './Button';

export default function EmptyState({ role, onDraft, onDatabase }) {
  return (
    <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white p-10 text-center shadow-sm md:p-14 animate-in fade-in">
      <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-[2rem] bg-indigo-50 text-5xl">
        <I name="library" className="text-indigo-500" />
      </div>
      <h3 className="heading-card text-brand-navy">Blank Slate Ready</h3>
      <p className="mx-auto mt-3 max-w-2xl text-sm font-medium leading-6 text-slate-500">
        No programs match this view yet. BCBAs can build custom treatment targets or import pre-built evidence-based templates from the ACE Curriculum Database.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {role === "BCBA" ? (
          <>
            <Button variant="green" onClick={onDatabase}>
              <I name="database" /> Open Curriculum DB
            </Button>
            <Button variant="gold" onClick={onDraft}>
              <I name="sparkles" /> Draft Custom Target
            </Button>
          </>
        ) : null}
      </div>
    </div>
  );
}
