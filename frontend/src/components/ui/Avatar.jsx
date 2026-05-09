import React from 'react';

const SIZE_CLASSES = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
};

export default function Avatar({
  initials,
  size = 'md',
  bgClass = 'bg-slate-700',
  textClass = 'text-white',
}) {
  return (
    <div
      className={`${SIZE_CLASSES[size] ?? SIZE_CLASSES.md} ${bgClass} ${textClass} rounded-full flex items-center justify-center font-bold`}
    >
      {initials}
    </div>
  );
}
