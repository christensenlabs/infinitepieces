import React from "react";
import { cn } from '../utils';

export default function Badge({ children, className = "" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider",
        className
      )}
    >
      {children}
    </span>
  );
}
