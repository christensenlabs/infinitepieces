import React, { useState } from 'react';
import { Icons } from '../Icons';
import Modal from '../ui/Modal';

const COPILOT_SYSTEM_TEXT =
  "You are the central AI Assistant for Infinite Suite OS, an enterprise ABA clinic management platform. Answer the clinic administrator's query professionally, concisely, and accurately.";

const QUICK_PROMPTS = [
  {
    label: 'Parent Cancel Policy',
    prompt: 'Write a polite email to a parent reminding them of the 24-hour cancellation policy.',
  },
  {
    label: 'Closing Checklist',
    prompt: 'Create a 4-step checklist for closing down the clinic at the end of the day.',
  },
  {
    label: 'Staff Motivation',
    prompt:
      'Write a brief motivational message to send to the RBT staff to boost morale on a Friday.',
  },
];

/**
 * @param {Object} props
 * @param {Object} props.copilot - useGeminiAction hook instance
 */
export default function CopilotModal({ copilot, onClose }) {
  const [query, setQuery] = useState('');

  const submit = (promptText) => {
    const text = promptText ?? query;
    if (!text.trim()) return;
    setQuery(text);
    copilot.execute(text, COPILOT_SYSTEM_TEXT);
  };

  return (
    <Modal onClose={onClose} position="top" maxWidth="max-w-2xl">
      <div className="flex flex-col max-h-[80vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand to-blue-900 p-6 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <Icons.Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-black">Global AI Copilot</h3>
              <p className="text-xs text-blue-200 font-medium">
                Ask operations, clinical, or scheduling questions.
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white">
            <Icons.Hub className="w-6 h-6 rotate-45" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 overflow-y-auto bg-slate-50">
          {copilot.result ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-widest text-cyan-600 mb-3 flex items-center gap-2">
                <Icons.Sparkles className="w-3 h-3" /> Copilot Response
              </p>
              <p className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                {copilot.result}
              </p>
            </div>
          ) : (
            <EmptyState onQuickPrompt={submit} />
          )}
        </div>

        {/* Input */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              placeholder="e.g., Draft a memo to parents about the new cancellation policy..."
              className="flex-1 bg-slate-100 border border-slate-200 text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => submit()}
              disabled={copilot.loading || !query}
              className="bg-brand text-white px-6 py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-900 transition-colors"
            >
              {copilot.loading ? 'Thinking...' : 'Ask'}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function EmptyState({ onQuickPrompt }) {
  return (
    <div className="text-center opacity-60 py-10">
      <Icons.Robot className="w-16 h-16 mx-auto mb-4 text-slate-300" />
      <p className="text-sm font-bold text-slate-600">I am connected to your entire suite.</p>
      <p className="text-xs text-slate-500 mt-1">
        Try asking me to draft an email, summarize KPIs, or suggest policies.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {QUICK_PROMPTS.map((qp) => (
          <button
            key={qp.label}
            onClick={() => onQuickPrompt(qp.prompt)}
            className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors shadow-sm"
          >
            {qp.label}
          </button>
        ))}
      </div>
    </div>
  );
}
