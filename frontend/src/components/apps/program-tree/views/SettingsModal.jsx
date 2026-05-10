import React from "react";
import I from '../components/Icon';
import Button from '../components/Button';
import ModalComponent from '../components/ModalComponent';

export default function SettingsModal({ onClose, onReset, onExport, onImport }) {
  return (
    <ModalComponent title="Application Settings" subtitle="Local data, exports, and workspace management." onClose={onClose} width="max-w-2xl" icon={<I name="settings" className="text-slate-500" />}>
      <div className="space-y-6">
        <div className="rounded-[2rem] border border-blue-100 bg-blue-50 p-6">
          <h4 className="flex items-center gap-2 text-lg font-black text-brand-navy mb-2">
            <I name="wand" /> AI Intelligence Core
          </h4>
          <p className="text-sm font-medium leading-relaxed text-slate-600 mb-5">
            This app works perfectly using the built-in offline smart generator. The AI key is managed by the parent application and is automatically available when configured.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Button variant="light" onClick={onExport} className="py-4">
            <I name="download" /> Export JSON Backup
          </Button>
          <label className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-black text-slate-700 transition hover:bg-slate-50 shadow-sm active:scale-95">
            <I name="upload" /> Import JSON Backup
            <input type="file" accept="application/json,.json" className="hidden" onChange={(e) => onImport(e.target.files?.[0])} />
          </label>
        </div>

        <div className="rounded-[2rem] border border-amber-100 bg-amber-50 p-6 mt-6">
          <h4 className="flex items-center gap-2 text-lg font-black text-amber-900 mb-2">
            <I name="alert" /> Prototype Safety
          </h4>
          <p className="text-sm font-medium leading-relaxed text-amber-900/80">
            This is a usable local application prototype, not a production HIPAA system. Add authentication, role-based access controls, encrypted backend storage, formal audit logs, BAA-covered vendors, and clinical governance before using real client data.
          </p>
        </div>

        <div className="border-t border-slate-200 pt-6 mt-2">
          <Button variant="red" className="w-full py-4" onClick={onReset}>
            <I name="trash" /> Wipe Local Data & Reset
          </Button>
        </div>
      </div>
    </ModalComponent>
  );
}
