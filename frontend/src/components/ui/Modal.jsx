import React from 'react';

/**
 * Reusable modal overlay.
 * @param {string} position - 'center' (default) or 'top'
 * @param {string} maxWidth - Tailwind max-w class, e.g. 'max-w-md', 'max-w-2xl'
 */
export default function Modal({
  children,
  onClose,
  position = 'center',
  maxWidth = 'max-w-md',
}) {
  const alignment =
    position === 'top'
      ? 'items-start pt-20'
      : 'items-center';

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center ${alignment} bg-slate-900/50 backdrop-blur-sm p-4`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      <div className={`bg-white rounded-[2rem] w-full ${maxWidth} shadow-2xl overflow-hidden`}>
        {children}
      </div>
    </div>
  );
}
