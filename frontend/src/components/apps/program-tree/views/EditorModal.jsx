import React, { useState } from "react";
import { nowStamp } from '../utils';
import { callGemini } from '@/lib/gemini';
import I from '../components/Icon';
import Button from '../components/Button';
import Field from '../components/Field';
import TextInput from '../components/TextInput';
import TextArea from '../components/TextArea';
import Select from '../components/Select';
import ModalComponent from '../components/ModalComponent';

export default function EditorModal({ program, client, apiKey, domains, pools, programTemplates, onClose, onSave, showToast }) {
  const [draft, setDraft] = useState(program);
  const [aiTarget, setAiTarget] = useState(program.target || "");
  const [loading, setLoading] = useState(false);
  // eslint-disable-next-line no-unused-vars
const [usedOffline, setUsedOffline] = useState(false);
  const [simplifying, setSimplifying] = useState(false);
  const [generatingIep, setGeneratingIep] = useState(false);
  const [generatingDataSheet, setGeneratingDataSheet] = useState(false);
  const [generatingMaterials, setGeneratingMaterials] = useState(false);

  const update = (key, value) => setDraft((p) => ({ ...p, [key]: value }));

  const applyTemplate = (methodType) => {
    const template = programTemplates[methodType];
    if (!template) return;
    setDraft(p => ({
      ...p,
      method: template.method,
      procedure: template.procedure,
      promptPlan: template.promptPlan,
      reinforcementPlan: template.reinforcementPlan,
      errorCorrection: template.errorCorrection,
      dataCollection: template.dataCollection
    }));
  };

  const simplifyCaregiver = async () => {
    if (!apiKey) { showToast("Please add your Gemini API Key in Settings to use the caregiver translator."); return; }
    if (!draft.procedure && !draft.objective) { showToast("Please fill out the Procedure or Objective first."); return; }
    setSimplifying(true);
    try {
      const prompt = `Translate this clinical ABA program into warm, empathetic, 6th-grade reading level instructions for a parent to practice at home.\nObjective: ${draft.objective}\nProcedure: ${draft.procedure}\nReturn ONLY the plain text instructions.`;
      const res = await callGemini(prompt, apiKey, "You are a warm, supportive BCBA explaining a program to a parent.");
      if (res) update("caregiverPlainLanguage", res.trim());
    } catch { showToast("Failed to simplify text."); }
    finally { setSimplifying(false); }
  };

  const generateIepGoal = async () => {
    if (!apiKey) { showToast("Please add your Gemini API Key in Settings."); return; }
    if (!draft.target) { showToast("Please add a target first."); return; }
    setGeneratingIep(true);
    try {
      const prompt = `Translate this clinical ABA target into a SMART IEP Goal suitable for a public school setting.\nTarget: ${draft.target}\nProcedure: ${draft.procedure || 'N/A'}\nReturn ONLY the plain text IEP Goal.`;
      const res = await callGemini(prompt, apiKey, "You are a special education teacher and BCBA writing an IEP goal.");
      if (res) update("objective", res.trim());
    } catch { showToast("Failed to generate IEP goal."); }
    finally { setGeneratingIep(false); }
  };

  const generateDataSheet = async () => {
    if (!apiKey) { showToast("Please add your Gemini API Key in Settings."); return; }
    if (!draft.target) { showToast("Please add a target first."); return; }
    setGeneratingDataSheet(true);
    try {
      const prompt = `Create a concise data collection protocol (1-2 sentences) for the ABA target: ${draft.target}. Include the metric (frequency, duration, percentage, etc.) and how to score it.`;
      const res = await callGemini(prompt, apiKey, "You are a BCBA writing instructions for RBTs.");
      if (res) update("dataCollection", res.trim());
    } catch { showToast("Failed to generate data sheet instructions."); }
    finally { setGeneratingDataSheet(false); }
  };

  const generateMaterials = async () => {
    if (!apiKey) { showToast("Please add your Gemini API Key in Settings."); return; }
    if (!draft.target) { showToast("Please add a target first."); return; }
    setGeneratingMaterials(true);
    try {
      const prompt = `Suggest a list of 5 specific, engaging toys or materials to use for teaching the ABA target: ${draft.target} to a ${client.age} year old. Return a simple comma-separated list.`;
      const res = await callGemini(prompt, apiKey, "You are a playful pediatric occupational therapist and BCBA.");
      if (res) update("materials", res.trim());
    } catch { showToast("Failed to generate materials."); }
    finally { setGeneratingMaterials(false); }
  };

  // Fallback offline generator for the editor
  const getReadablePlan = (t) => {
    return {
      target: t,
      objective: `Learner will demonstrate ${t} across 3 consecutive sessions.`,
      procedure: "1. Present SD.\n2. Wait 3s.\n3. Score response.",
      promptPlan: "Least-to-Most prompting.",
      reinforcementPlan: "FR-1 for independent responses.",
      errorCorrection: "4-step error correction.",
      masteryCriteria: "80% accuracy over 3 sessions.",
      dataCollection: "Trial by trial percentage.",
    };
  };

  const generate = async () => {
    const target = aiTarget.trim();
    if (!target) { showToast("Enter a target idea first."); return; }

    setLoading(true);
    setUsedOffline(false);
    try {
      let parsed = null;
      if (apiKey) {
        const prompt = `Generate an ABA program as valid JSON only for learner profile: ${client?.profile || "blank"}. Target idea: ${target}. Required keys: domain, target, method, objective, procedure, promptPlan, reinforcementPlan, errorCorrection, masteryCriteria, generalization, caregiverPlainLanguage, materials, dataCollection, clinicalRiskNote.`;
        const res = await callGemini(prompt, apiKey, "Return valid JSON only.");
        if (res) {
          const cleaned = res.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/i, "").trim();
          parsed = JSON.parse(cleaned);
        }
      }
      if (!parsed) {
        parsed = getReadablePlan(target);
        setUsedOffline(true);
      }
      setDraft((p) => ({
        ...p,
        ...parsed,
        target: parsed.target || target,
        domain: parsed.domain || p.domain,
        pool: p.pool || "candidate",
        updatedAt: nowStamp(),
      }));
    } catch {
      const fallback = getReadablePlan(target);
      setDraft((p) => ({ ...p, ...fallback, target: fallback.target || target, updatedAt: nowStamp() }));
      setUsedOffline(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalComponent title="Program Draft Builder" subtitle="Create, edit, approve, or format a program." onClose={onClose} width="max-w-6xl" icon={<I name="edit" className="text-blue-500" />}>
      <div className="mb-8 rounded-[2rem] bg-gradient-to-r from-[#12214A] to-blue-950 p-6 text-white shadow-lg">
        <h4 className="text-xs font-black uppercase tracking-widest text-blue-300 mb-3 flex items-center gap-2"><I name="sparkles" /> AI Auto-Builder</h4>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
          <div className="flex-1">
            <TextInput
              value={aiTarget}
              onChange={(e) => setAiTarget(e.target.value)}
              placeholder="e.g. Manding for break, Tacting colors..."
              className="text-slate-900 border-none shadow-inner"
            />
          </div>
          <Button variant="gold" onClick={generate} disabled={loading} className="py-3 lg:min-w-[180px]">
            {loading ? <><I name="refresh" /> Building...</> : <>Auto-Build</>}
          </Button>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
        <span className="text-[10px] font-black uppercase text-slate-500 w-full mb-1">Load Methodology Template:</span>
        {Object.keys(programTemplates).map(key => (
          <button
            key={key}
            onClick={() => applyTemplate(key)}
            className="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:border-indigo-400 hover:text-indigo-700 transition-colors shadow-sm"
          >
            {key} Template
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Field label="Domain">
          <Select value={draft.domain || ""} onChange={(e) => update("domain", e.target.value)}>
            <option value="">Select domain</option>
            {domains.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Target Name">
          <TextInput value={draft.target || ""} onChange={(e) => update("target", e.target.value)} placeholder="e.g. Tacts 3 colors" />
        </Field>
        <Field label="Teaching Method">
          <TextInput value={draft.method || ""} onChange={(e) => update("method", e.target.value)} placeholder="NET, DTT, FCT, BST, TA, etc." />
        </Field>
        <Field label="Pool Status">
          <Select value={draft.pool || "candidate"} onChange={(e) => update("pool", e.target.value)}>
            {Object.entries(pools).map(([k, v]) => (
              <option key={k} value={k}>
                {v.label}
              </option>
            ))}
          </Select>
        </Field>

        <div className="relative md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <Field label="Objective / IEP Goal">
            <TextArea rows={2} value={draft.objective || ""} onChange={(e) => update("objective", e.target.value)} />
          </Field>
          <button
            onClick={generateIepGoal}
            disabled={generatingIep}
            className="absolute top-4 right-4 text-[10px] font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            {generatingIep ? "Drafting..." : "AI: Draft SMART IEP Goal"}
          </button>
        </div>

        <div className="md:col-span-2">
          <Field label="Procedure (Setup & SD)">
            <TextArea rows={3} value={draft.procedure || ""} onChange={(e) => update("procedure", e.target.value)} />
          </Field>
        </div>
        <Field label="Prompt & Fading Plan">
          <TextArea rows={3} value={draft.promptPlan || ""} onChange={(e) => update("promptPlan", e.target.value)} />
        </Field>
        <Field label="Reinforcement Schedule">
          <TextArea rows={3} value={draft.reinforcementPlan || ""} onChange={(e) => update("reinforcementPlan", e.target.value)} />
        </Field>
        <Field label="Error Correction">
          <TextArea rows={2} value={draft.errorCorrection || ""} onChange={(e) => update("errorCorrection", e.target.value)} />
        </Field>

        <div className="relative md:col-span-2 bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <Field label="Data Collection Protocol">
            <TextArea rows={2} value={draft.dataCollection || ""} onChange={(e) => update("dataCollection", e.target.value)} />
          </Field>
          <button
            onClick={generateDataSheet}
            disabled={generatingDataSheet}
            className="absolute top-4 right-4 text-[10px] font-bold bg-blue-100 text-blue-800 hover:bg-blue-200 px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            {generatingDataSheet ? "Drafting..." : "AI: Generate Protocol"}
          </button>
        </div>

        <Field label="Mastery Criteria">
          <TextArea rows={2} value={draft.masteryCriteria || ""} onChange={(e) => update("masteryCriteria", e.target.value)} />
        </Field>
        <Field label="Generalization">
          <TextArea rows={2} value={draft.generalization || ""} onChange={(e) => update("generalization", e.target.value)} />
        </Field>

        <div className="relative md:col-span-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
          <Field label="Required Materials & Toys">
            <TextArea rows={2} value={draft.materials || ""} onChange={(e) => update("materials", e.target.value)} />
          </Field>
          <button
            onClick={generateMaterials}
            disabled={generatingMaterials}
            className="absolute top-4 right-4 text-[10px] font-bold bg-emerald-200 text-emerald-900 hover:bg-emerald-300 px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            {generatingMaterials ? "Brainstorming..." : "AI: Suggest Materials"}
          </button>
        </div>

        <div className="relative md:col-span-2 bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
          <Field label="Caregiver Plain Language (For Parent App)">
            <TextArea rows={3} value={draft.caregiverPlainLanguage || ""} onChange={(e) => update("caregiverPlainLanguage", e.target.value)} />
          </Field>
          <button
            onClick={simplifyCaregiver}
            disabled={simplifying}
            className="absolute top-4 right-4 text-[10px] font-bold bg-indigo-200 text-indigo-800 hover:bg-indigo-300 px-3 py-1.5 rounded-lg transition shadow-sm flex items-center gap-1"
          >
            {simplifying ? "Translating..." : "AI: Simplify for Parents"}
          </button>
        </div>

        <div className="md:col-span-2">
          <Field label="Clinical Risk / Review Note">
            <TextArea rows={2} value={draft.clinicalRiskNote || ""} onChange={(e) => update("clinicalRiskNote", e.target.value)} />
          </Field>
        </div>
      </div>

      <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-slate-200 pt-6">
        <Button variant="light" onClick={onClose} className="px-8">
          Cancel
        </Button>
        <Button variant="primary" onClick={() => onSave(draft)} className="px-10 py-4 shadow-lg">
          <I name="check" /> Save Program Protocol
        </Button>
      </div>
    </ModalComponent>
  );
}
