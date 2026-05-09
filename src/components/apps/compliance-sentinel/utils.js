export function cn(...classes) { return classes.filter(Boolean).join(" "); }
export function uid() { return Math.random().toString(36).substr(2, 9); }
export function nowStamp() { return new Date().toLocaleString(); }
