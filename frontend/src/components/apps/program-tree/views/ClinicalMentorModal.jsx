import React, { useState } from "react";
import { callGemini } from '@/lib/gemini';
import I from '../components/Icon';
import Button from '../components/Button';
import Field from '../components/Field';
import TextArea from '../components/TextArea';
import ModalComponent from '../components/ModalComponent';

export default function ClinicalMentorModal({ apiKey, client, onClose, showToast }) {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const askMentor = async () => {
    if (!apiKey) { showToast("Gemini API key required in Settings."); return; }
    if (!question.trim()) return;

    setLoading(true);
    setResponse("");
    const sysPrompt = "You are a Master BCBA-D mentoring a newer BCBA. The user is asking for programming advice, domain ideas, or troubleshooting help. Provide a highly clinical, evidence-based response using radical behaviorism. Keep it under 200 words, highly scannable with bullets.";
    const userPrompt = `Client Profile: ${client.profile}\n\nQuestion from BCBA: "${question}"`;

    try {
      const res = await callGemini(userPrompt, apiKey, sysPrompt);
      if (res) setResponse(res);
    } catch {
      setResponse("Error connecting to Clinical Core.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalComponent title="Clinical Mentor AI" subtitle="Ask for program ideas, troubleshooting, or methodological advice." onClose={onClose} width="max-w-3xl" icon={<I name="graduation" className="text-purple-600" />}>
      <div className="space-y-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-4">
          <I name="brain" className="text-3xl mt-1 text-indigo-500" />
          <p className="text-sm text-indigo-900 leading-relaxed font-medium">
            I am your BCBA-D Professor. Tell me where you are stuck, or ask for program recommendations based on {client?.name || "this learner"}&apos;s profile.
          </p>
        </div>

        <Field label="Your Question">
          <TextArea
            rows={3}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., 'What are 3 prerequisite programs I should run before teaching intraverbal fill-ins for a 5yo?'"
          />
        </Field>

        <Button variant="primary" className="w-full" onClick={askMentor} disabled={loading || !question}>
          {loading ? "Consulting Literature..." : "Ask Clinical Mentor"}
        </Button>

        {response && (
          <div className="mt-6 bg-slate-900 p-6 rounded-3xl border border-slate-700 text-slate-200 prose prose-invert text-sm max-w-none shadow-inner animate-in slide-in-from-bottom-4">
            <h4 className="text-xs font-black uppercase text-indigo-400 tracking-widest mb-3 border-b border-slate-700 pb-2 flex items-center gap-2">
              <I name="sparkles" /> Mentor Advice
            </h4>
            {response.split('\n').map((line, i) => (
              <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        )}
      </div>
    </ModalComponent>
  );
}
