import React from 'react';

function BoyClassroomScene({ zone, fidgetPos, isBlinking }) {
  const state = zone.characterState;
  const isRed = zone.id === 'red';
  const isBlue = zone.id === 'blue';
  const isGreen = zone.id === 'green';
  const isYellow = zone.id === 'yellow';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end overflow-hidden pointer-events-none">
      <div className="absolute bottom-[15%] md:bottom-[18%] left-1/2 -translate-x-1/2 w-32 md:w-40 h-40 md:h-48 z-10 pointer-events-none opacity-95">
        <div className="absolute top-0 w-full h-20 md:h-24 flex flex-col items-center">
          <div className="w-full h-4 bg-amber-800 rounded-t-sm border-b border-amber-950 shadow-sm" />
          <div className="flex justify-around w-[70%] h-full">
            <div className="w-1.5 h-full bg-amber-800" />
            <div className="w-1.5 h-full bg-amber-800" />
          </div>
        </div>
        <div className="absolute top-20 md:top-24 w-full h-5 bg-amber-800 shadow-md" />
        <div className="absolute bottom-0 left-4 w-2 h-10 bg-amber-900" />
        <div className="absolute bottom-0 right-4 w-2 h-10 bg-amber-900" />
      </div>

      <div
        className="relative w-full max-w-[260px] md:max-w-[300px] aspect-[4/5] flex flex-col items-center justify-end transition-all duration-700 mx-auto z-30 pointer-events-auto"
        style={{ transform: `translate(${fidgetPos.x}px, ${fidgetPos.y}px) ${isBlue ? 'translate-y-8 scale-95' : ''}` }}
      >
        {isBlue && (
          <div className="absolute -top-12 left-1/2 text-blue-500 font-black text-xl z-50">
            <div className="absolute opacity-0 animate-zzz-1">Z</div>
            <div className="absolute opacity-0 animate-zzz-2 text-2xl">Z</div>
            <div className="absolute opacity-0 animate-zzz-3 text-lg">z</div>
          </div>
        )}

        {isRed && (
          <>
            <div className="absolute top-10 -left-8 w-10 h-10 bg-gray-200 rounded-full opacity-0 animate-steam blur-sm z-50" />
            <div className="absolute top-10 -right-8 w-10 h-10 bg-gray-200 rounded-full opacity-0 animate-steam-delay blur-sm z-50" />
          </>
        )}

        <div className={`relative w-40 h-40 md:w-44 md:h-44 rounded-[45%] border-b-4 border-black/10 transition-all duration-500 z-20 overflow-hidden
          ${isRed ? 'bg-red-200 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'}
          ${isBlue ? 'rotate-12 translate-y-6' : ''}`}
        >
          <div className="absolute top-0 w-full h-14 bg-[#4a332a] z-10 pointer-events-none">
            <div className="absolute -bottom-3 left-1 w-14 h-10 bg-[#4a332a] rounded-full rotate-[-15deg]" />
            <div className="absolute -bottom-4 left-10 w-20 h-12 bg-[#5d4037] rounded-full" />
            <div className="absolute -bottom-3 right-1 w-14 h-10 bg-[#4a332a] rounded-full rotate-[15deg]" />
          </div>

          <div className={`absolute bottom-4 -left-2 w-16 h-16 rounded-full opacity-40 transition-colors ${isRed ? 'bg-red-500 blur-md' : 'bg-pink-300 blur-md'}`} />
          <div className={`absolute bottom-4 -right-2 w-16 h-16 rounded-full opacity-40 transition-colors ${isRed ? 'bg-red-500 blur-md' : 'bg-pink-300 blur-md'}`} />

          <div className={`flex justify-around w-full mt-14 md:mt-16 px-6 transition-all duration-500 ${isBlue ? 'translate-y-8' : ''}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center relative overflow-hidden transition-all ${isBlue ? 'h-2 bg-transparent border-t-4 border-slate-700 rounded-none mt-4' : ''}`}>
              {!isBlinking && !isBlue ? (
                <div className={`w-4 h-4 md:w-5 md:h-5 bg-black rounded-full transition-all duration-300 ${state === 'angry' ? 'scale-y-125 -translate-y-1' : ''} ${state === 'focused' ? 'translate-x-1 translate-y-1' : ''}`}></div>
              ) : !isBlue && (
                <div className="w-full h-1 bg-gray-400"></div>
              )}
            </div>
            <div className={`w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center relative overflow-hidden transition-all ${isBlue ? 'h-2 bg-transparent border-t-4 border-slate-700 rounded-none mt-4' : ''}`}>
              {!isBlinking && !isBlue ? (
                <div className={`w-4 h-4 md:w-5 md:h-5 bg-black rounded-full transition-all duration-300 ${state === 'angry' ? 'scale-y-125 -translate-y-1' : ''} ${state === 'focused' ? '-translate-x-1 translate-y-1' : ''}`}></div>
              ) : !isBlue && (
                <div className="w-full h-1 bg-gray-400"></div>
              )}
            </div>
          </div>

          <div className={`flex justify-center mt-6 transition-all ${isBlue ? 'translate-y-6 opacity-60' : ''}`}>
            {state === 'focused' && <div className="w-10 h-5 border-b-[4px] border-black/70 rounded-full"></div>}
            {state === 'lethargic' && <div className="w-6 h-6 md:w-8 md:h-8 bg-black/20 rounded-full"></div>}
            {state === 'fidgety' && <div className="w-12 h-8 border-4 border-black/80 rounded-full"></div>}
            {state === 'angry' && (
              <div className="w-16 h-6 md:w-20 md:h-8 bg-black rounded-xl flex flex-col justify-between overflow-hidden border-2 border-black">
                 <div className="w-full h-[40%] bg-white border-b border-black/30 grid grid-cols-4 divide-x divide-black/30"><div/><div/><div/><div/></div>
                 <div className="w-full h-[40%] bg-white border-t border-black/30 grid grid-cols-4 divide-x divide-black/30"><div/><div/><div/><div/></div>
              </div>
            )}
          </div>
        </div>

        <div className={`relative w-48 h-36 -mt-6 rounded-t-[45%] transition-colors duration-500 border-x-8 border-t-[6px] border-black/5 z-10 ${zone.color}`}>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-6 bg-white/20 rounded-full" />

          {/* Left Arm */}
          <div className={`absolute -left-4 md:-left-6 top-10 w-12 md:w-16 h-24 md:h-32 rounded-full origin-top transition-all duration-500 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l-[6px] border-black/10 z-[60] ${zone.color}
            ${isYellow ? 'animate-flail-left' : isBlue ? 'rotate-[70deg] translate-y-6 translate-x-4' : 'rotate-[25deg]'}`}>
            <div className={`absolute bottom-[-8px] md:bottom-[-12px] left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 ${isRed ? 'bg-red-200' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'} rounded-full shadow-md z-[80] flex items-center justify-center transition-colors duration-500`}>
              <div className={`absolute w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-full shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.4)] z-[81] transition-transform duration-300 ${isRed ? 'scale-x-110 scale-y-75' : ''}`} />
              <div className="absolute top-[40%] z-[82] flex gap-[2px] md:gap-1">
                 <div className={`w-2.5 md:w-3 h-5 md:h-6 ${isRed ? 'bg-red-200' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'} rounded-full origin-top rotate-[45deg] translate-x-[-2px] border-b border-black/10 shadow-sm ${isYellow ? 'animate-wiggle-1' : ''}`} />
                 {[1, 2, 3].map(i => (
                   <div key={`l-finger-${i}`} className={`w-2 md:w-2.5 h-6 md:h-7 ${isRed ? 'bg-red-200' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'} rounded-full origin-top transition-colors duration-500 border-b border-black/10 shadow-sm ${isYellow ? 'animate-wiggle-' + ((i % 3) + 1) : ''}`} />
                 ))}
              </div>
            </div>
          </div>

          {/* Right Arm */}
          <div className={`absolute -right-4 md:-right-6 top-10 w-12 md:w-16 h-24 md:h-32 rounded-full origin-top transition-all duration-500 shadow-[5px_0_10px_rgba(0,0,0,0.1)] border-r-[6px] border-black/10 z-[70] ${zone.color}
            ${isYellow ? 'animate-flail-right' : isGreen ? 'animate-write' : isRed ? 'animate-fist-shake' : isBlue ? 'rotate-[-70deg] translate-y-6 -translate-x-4' : 'rotate-[-25deg]'}`} >
            <div className={`absolute bottom-[-8px] md:bottom-[-12px] left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 ${isRed ? 'bg-red-200' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'} rounded-full shadow-md z-[80] flex items-center justify-center transition-colors duration-500`}>
              {isGreen && (
                <div className="absolute top-[30%] -left-6 w-16 h-3 bg-yellow-400 rotate-[-40deg] rounded-sm shadow-sm border-b border-yellow-600 flex items-center z-[81]">
                  <div className="w-3 h-3 bg-pink-400 rounded-l-sm" />
                  <div className="absolute -right-3 w-0 h-0 border-y-[4px] border-y-transparent border-l-[12px] border-l-[#eecba3]">
                    <div className="absolute top-[-2px] right-[2px] w-1.5 h-1.5 bg-slate-800 rounded-full" />
                  </div>
                </div>
              )}
              <div className="absolute top-[40%] z-[82] flex gap-[2px] md:gap-1">
                 <div className={`w-2.5 md:w-3 rounded-full origin-top rotate-[45deg] translate-x-[-2px] border-b border-black/10 shadow-sm ${isYellow ? 'animate-wiggle-1' : ''} transition-all duration-300 ${isRed ? 'h-3 md:h-4 bg-red-300 translate-y-1' : isBlue ? 'h-5 md:h-6 bg-blue-50' : 'h-5 md:h-6 bg-[#fdf0e6]'}`} />
                 {[1, 2, 3].map(i => (
                   <div key={`r-finger-${i}`} className={`w-2 md:w-2.5 rounded-full origin-top transition-all duration-300 border-b border-black/10 shadow-sm ${isYellow ? 'animate-wiggle-' + ((i % 3) + 1) : ''} ${isRed ? 'h-3 md:h-4 bg-red-300 translate-y-1' : isBlue ? 'h-6 md:h-7 bg-blue-50' : 'h-6 md:h-7 bg-[#fdf0e6]'}`} />
                 ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 w-full h-24 md:h-32 z-40 pointer-events-none flex flex-col items-center justify-end">
         <div className="desk-surface w-[130%] h-[150%] bg-amber-700 absolute bottom-4 md:bottom-8 border-t-4 border-amber-600 shadow-[inset_0_40px_50px_rgba(0,0,0,0.3)]">
            <div className={`absolute bottom-[20%] left-1/2 -translate-x-1/2 w-36 md:w-48 h-24 md:h-32 bg-white rounded shadow-lg transform rotate-[-1deg] flex flex-col p-3 transition-opacity ${isBlue ? 'opacity-20' : 'opacity-100'}`}>
               <div className="w-full h-2 bg-blue-100/50 mb-2 rounded-sm" />
               <div className="w-3/4 h-2 bg-blue-100/50 mb-2 rounded-sm" />
               {isGreen && <div className="w-1/2 h-2 bg-slate-600 rounded-sm" />}
            </div>
         </div>
         <div className="w-[110%] h-8 bg-amber-900 relative z-50 border-t border-amber-800 shadow-2xl" />
      </div>
    </div>
  );
}

export default BoyClassroomScene;
