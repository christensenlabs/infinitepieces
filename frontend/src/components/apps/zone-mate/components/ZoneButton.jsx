import React from 'react';
import { Smile, Moon, Zap, Flame, Brain } from 'lucide-react';

const ZONE_ICONS = {
  green: Smile,
  blue: Moon,
  yellow: Zap,
  red: Flame,
};

function ZoneButton({ zone, isActive, onPressStart, onPressEnd }) {
  const Icon = ZONE_ICONS[zone.id];

  return (
    <button
      onMouseDown={() => onPressStart(zone)}
      onMouseUp={onPressEnd}
      onMouseLeave={onPressEnd}
      onTouchStart={() => onPressStart(zone)}
      onTouchEnd={onPressEnd}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative h-24 sm:h-28 md:h-32 rounded-3xl overflow-hidden transform active:scale-95 shadow-lg border-4 select-none
        ${isActive ? `${zone.borderColor} scale-105 z-10 ring-4 ring-white` : 'border-slate-700 bg-slate-800'}`}
    >
      <div className={`absolute inset-0 ${zone.color} opacity-80 ${!isActive && 'saturate-50'}`} />
      <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-white">
         {Icon && <Icon size={24} />}
         <div className="font-black text-xs md:text-sm uppercase tracking-wider">{zone.name}</div>
      </div>
      <div className="absolute bottom-1 right-1 bg-black/30 p-1 rounded-full flex items-center gap-1">
        <Brain size={12} className="text-white" />
        <span className="text-[8px] text-white font-bold hidden sm:block uppercase">Hold</span>
      </div>
    </button>
  );
}

export default ZoneButton;
