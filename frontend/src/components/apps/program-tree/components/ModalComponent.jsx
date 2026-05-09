import React from "react";
import { cn } from '../utils';
import I from './Icon';

export default function ModalComponent({ title, subtitle, children, onClose, width = "max-w-2xl", icon = null }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className={cn("my-8 w-full overflow-hidden rounded-[2rem] bg-white shadow-2xl animate-in zoom-in-95 duration-300", width)}>
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 px-6 py-5 md:px-8">
          <div className="flex items-center gap-3">
            {icon && <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200 text-xl">{icon}</div>}
            <div>
              <h3 className="text-2xl font-black text-[#12214A]">{title}</h3>
              {subtitle ? <p className="mt-1 text-sm font-semibold text-slate-500">{subtitle}</p> : null}
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-slate-200 p-2 text-slate-600 transition hover:bg-slate-300"
            aria-label="Close modal"
          >
            <I name="x" />
          </button>
        </div>
        <div className="max-h-[75vh] overflow-y-auto p-6 md:p-8 custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}
