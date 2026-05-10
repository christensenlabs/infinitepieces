import React from 'react';
import { Icons } from '../Icons';
import Modal from '../ui/Modal';

export default function SettingsModal({ apiKey, onApiKeyChange, onClose }) {
  return (
    <Modal onClose={onClose}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="heading-section text-brand">Platform Settings</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <Icons.Hub className="w-5 h-5 rotate-45" />
          </button>
        </div>

        <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-6">
          <p className="text-xs font-bold text-blue-800 flex items-center gap-2 mb-2">
            <Icons.Sparkles className="w-4 h-4" /> Gemini API Integration
          </p>
          <p className="text-xs text-blue-600 mb-3">
            Enter your Gemini API key to enable the Global AI Copilot and dynamic daily
            briefings across the Motherboard.
          </p>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => onApiKeyChange(e.target.value)}
            placeholder="Enter Gemini API Key..."
            className="w-full text-sm p-3 rounded-xl border border-blue-200 outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <button
          onClick={onClose}
          className="btn-primary w-full"
        >
          Save &amp; Close
        </button>
      </div>
    </Modal>
  );
}
