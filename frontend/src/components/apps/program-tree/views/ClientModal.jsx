import React, { useState } from "react";
import I from '../components/Icon';
import Button from '../components/Button';
import Field from '../components/Field';
import TextInput from '../components/TextInput';
import TextArea from '../components/TextArea';
import ModalComponent from '../components/ModalComponent';

export default function ClientModal({ client, onClose, onSave }) {
  const [draft, setDraft] = useState(client);
  return (
    <ModalComponent title={client.id ? "Edit Learner" : "Add Learner"} subtitle="Use placeholders for demos. Avoid real PHI in this local prototype." onClose={onClose} width="max-w-lg" icon={<I name="user" className="text-indigo-500" />}>
      <div className="space-y-5">
        <Field label="Name">
          <TextInput value={draft.name || ""} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Jane Doe" autoFocus />
        </Field>
        <Field label="Age">
          <TextInput value={draft.age || ""} onChange={(e) => setDraft({ ...draft, age: e.target.value })} placeholder="5" />
        </Field>
        <Field label="Clinical Profile / Notes">
          <TextArea rows={6} value={draft.profile || ""} onChange={(e) => setDraft({ ...draft, profile: e.target.value })} placeholder="Strengths, barriers, communication system, reinforcers, caregiver priorities..." />
        </Field>
        <Button variant="primary" className="w-full py-4 mt-2" onClick={() => onSave(draft)}>
          <I name="check" /> Save Learner
        </Button>
      </div>
    </ModalComponent>
  );
}
