import React from "react";
import { cn } from '../utils';

export default function TextArea(props) {
  return (
    <textarea
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium outline-none transition focus:border-[#12214A] focus:ring-4 focus:ring-blue-100 custom-scrollbar",
        props.className
      )}
    />
  );
}
