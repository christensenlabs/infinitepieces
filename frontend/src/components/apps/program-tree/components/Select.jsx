import React from "react";
import { cn } from '../utils';

export default function Select(props) {
  return (
    <select
      {...props}
      className={cn(
        "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-black outline-none transition focus:border-brand-navy focus:ring-4 focus:ring-blue-100",
        props.className
      )}
    />
  );
}
