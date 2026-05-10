import React, { useState } from "react";
import I from '../components/Icon';
import Button from '../components/Button';
import Field from '../components/Field';
import TextArea from '../components/TextArea';
import Select from '../components/Select';
import ModalComponent from '../components/ModalComponent';

export default function FeedbackModal({ data, program, flagTypes, onClose, onSubmit }) {
  const [type, setType] = useState(data.type || "question");
  const [reason, setReason] = useState("");
  return (
    <ModalComponent title="Submit Feedback" subtitle="Send a flag to the BCBA queue." onClose={onClose} width="max-w-md" icon={<I name="flag" className="text-amber-500" />}>
      <div className="space-y-5">
        {program ? (
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-label uppercase tracking-widest text-blue-500">Program</p>
            <p className="mt-1 font-black text-brand-navy">{program.target}</p>
          </div>
        ) : null}
        <Field label="Flag Type">
          <Select value={type} onChange={(e) => setType(e.target.value)}>
            {Object.entries(flagTypes).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Reason / Details">
          <TextArea rows={5} value={reason} onChange={(e) => setReason(e.target.value)} autoFocus placeholder="Describe what happened, what worked, what was confusing, or what support is needed." />
        </Field>
        <Button variant="primary" className="w-full py-4" onClick={() => onSubmit({ ...data, type, reason })}>
          <I name="flag" /> Submit Feedback
        </Button>
      </div>
    </ModalComponent>
  );
}
