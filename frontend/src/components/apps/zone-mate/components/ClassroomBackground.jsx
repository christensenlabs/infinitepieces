import React from 'react';
import DigitalClock from './DigitalClock';

function ClassroomBackground({ birdFly, onBirdFly }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-surface-blue">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-black/5 mix-blend-multiply" />
      <div
        onClick={onBirdFly}
        className="absolute top-8 md:top-12 left-4 md:left-8 w-24 md:w-36 h-36 md:h-52 bg-sky-300 border-8 md:border-[12px] border-white shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden cursor-pointer active:scale-95 transition-transform"
      >
        <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-300 rounded-full animate-pulse" />
        {birdFly && <div className="absolute top-6 left-full animate-bird whitespace-nowrap z-10 text-xl">&#x1F426;</div>}
        <div className="absolute bottom-0 w-full h-[40%] bg-green-500 shadow-[inset_0_5px_10px_rgba(0,0,0,0.2)]" />
      </div>
      <DigitalClock />
      <div className="absolute bottom-0 w-full h-24 md:h-32 bg-amber-100/50 border-t-4 border-amber-200/50 shadow-inner" />
    </div>
  );
}

export default ClassroomBackground;
