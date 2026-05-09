import React, { useState } from "react";
import { callGemini } from '@/lib/gemini';
import I from '../components/Icon';
import Button from '../components/Button';
import Field from '../components/Field';
import TextInput from '../components/TextInput';
import TextArea from '../components/TextArea';
import ModalComponent from '../components/ModalComponent';

export default function BaselineModal({ program, apiKey, onClose, onSubmit, showToast }) {
  const [data, setData] = useState("");
  const [notes, setNotes] = useState("");
  const [analyzing, setAnalyzing] = useState(false);

  const analyzeData = async () => {
    if (!apiKey) {
      showToast("Please add your Gemini API Key in Settings to use AI analysis.");
      return;
    }
    if (!data) {
      showToast("Please enter a baseline score first.");
      return;
    }
    setAnalyzing(true);
    try {
      const prompt = `I am an RBT taking baseline data for the target: "${program.target}". The raw data score is: "${data}". Write a 2-sentence clinical qualitative note describing this baseline performance to the BCBA. Return ONLY the plain text.`;
      const res = await callGemini(prompt, apiKey, "You are a highly observant RBT writing a concise clinical note.");
      if (res) {
        setNotes(res.trim());
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to analyze data.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ModalComponent title="Log Baseline Data" subtitle={`Target: ${program.target}`} onClose={onClose} width="max-w-lg" icon={<I name="chart" className="text-blue-500" />}>
      <div className="space-y-4">
        <Field label="Score / Data" hint="Examples: 0/5 independent, 15%, 2 prompts across 8 opportunities">
          <TextInput value={data} onChange={(e) => setData(e.target.value)} autoFocus />
        </Field>

        <div className="relative">
          <Field label="Qualitative Notes">
            <TextArea rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe prompts needed, barriers, motivation, behavior, or context." />
          </Field>
          <button
            onClick={analyzeData}
            disabled={analyzing || !data}
            className="absolute top-0 right-0 text-[10px] font-bold bg-amber-100 text-amber-800 hover:bg-amber-200 disabled:opacity-50 disabled:cursor-not-allowed px-2 py-1 rounded transition flex items-center gap-1"
          >
            {analyzing ? "Analyzing..." : "Auto-Draft Note"}
          </button>
        </div>

        <Button variant="primary" className="w-full py-4 mt-4" onClick={() => onSubmit(program.id, data, notes)}>
          <I name="chart" /> Submit Baseline to BCBA
        </Button>
      </div>
    </ModalComponent>
  );
}
