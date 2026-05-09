import React from 'react';
import { Star, Loader2 } from 'lucide-react';

export default function TokenBoardView({
  tokens,
  tokenBoardData,
  isGeneratingTokenBoard,
  isGeneratingReward,
  handleTokenClick,
  setTokens
}) {
  return (
    <>
      {!tokenBoardData.bgUrl && !isGeneratingTokenBoard && (
        <div className="flex flex-col items-center justify-center h-[50vh] opacity-30 text-center no-print">
          <Star className="w-24 h-24 mb-4 text-slate-900" />
          <p className="text-2xl font-bold uppercase tracking-widest text-slate-900">Token Board Generator</p>
          <p className="text-lg font-medium text-slate-600 max-w-md mt-2">Enter a theme to generate a print-ready, full-bleed artistic board with custom 3D tokens.</p>
        </div>
      )}

      {isGeneratingTokenBoard && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-center no-print">
          <Loader2 className="w-20 h-20 mb-4 text-indigo-600 animate-spin" />
          <p className="text-2xl font-bold uppercase tracking-widest text-indigo-900">Engineering Board...</p>
          <p className="text-lg font-medium text-slate-500 animate-pulse max-w-md mt-2">Running dual-pipeline AI to generate scenic background and matching 3D token icons.</p>
        </div>
      )}

      {tokenBoardData.bgUrl && !isGeneratingTokenBoard && (
        <div className="print-landscape-container relative bg-white shadow-2xl rounded-3xl overflow-hidden transition-all animate-in zoom-in-95"
             style={{
               backgroundImage: `url(${tokenBoardData.bgUrl})`,
               backgroundSize: 'cover',
               backgroundPosition: 'center'
             }}>

            {/* Darker overlay for contrast if needed, keeping it light for vivid prints */}
            <div className="absolute inset-0 bg-white/30 backdrop-blur-sm print:bg-white/40"></div>

            <div className="relative z-10 flex flex-col h-full w-full p-8 print:p-0">
              <div className="bg-white/80 backdrop-blur-md border-4 border-white/50 shadow-xl rounded-2xl p-4 mb-8 print:border-black print:bg-white/90">
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 uppercase tracking-widest flex justify-center items-center w-full" contentEditable suppressContentEditableWarning>
                  {tokenBoardData.title}
                </h2>
              </div>

              {/* Working For Box */}
              <div className="flex flex-col sm:flex-row w-full justify-between items-center gap-8 mb-auto">
                  <div className="flex-1 text-left flex items-center gap-4 bg-white/80 backdrop-blur-md p-6 rounded-2xl border-4 border-white/50 shadow-xl w-full print:border-black print:bg-white/90">
                      <span className="text-2xl font-black uppercase text-slate-800 shrink-0">I am working for:</span>
                      <div className="flex-grow border-b-4 border-slate-400 outline-none text-3xl font-extrabold text-slate-900 pb-1 print:border-black" contentEditable suppressContentEditableWarning></div>
                  </div>
                  <div className="w-40 h-40 border-4 border-white/50 bg-white/60 backdrop-blur-md rounded-2xl shadow-xl shrink-0 flex items-center justify-center print:border-black print:bg-white/80 relative overflow-hidden">
                      {tokenBoardData.rewardImgUrl ? (
                          <img src={tokenBoardData.rewardImgUrl} className="w-full h-full object-contain p-2 relative z-10" alt="Reward" />
                      ) : (
                          <span className="text-slate-600 font-black uppercase text-sm text-center px-4 relative z-10">Place Reward Here</span>
                      )}
                      {isGeneratingReward && (
                          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                          </div>
                      )}
                  </div>
              </div>

              {/* 10 Token Grid */}
              <div className="grid grid-cols-5 gap-6 sm:gap-8 w-full max-w-4xl mx-auto mt-12 items-center">
                {tokens.map((isFilled, idx) => (
                   <button
                      key={idx}
                      onClick={() => handleTokenClick(idx)}
                      className="focus:outline-none transition-all duration-300 transform hover:scale-105 active:scale-95 aspect-square w-full relative flex items-center justify-center cursor-pointer"
                   >
                      {/* Empty State / Drop Zone */}
                      <div className={`absolute inset-0 rounded-full border-4 border-white/60 bg-white/40 backdrop-blur-md shadow-inner print:border-black print:bg-white/70 ${isFilled ? 'opacity-0 print:opacity-100' : 'opacity-100'} transition-opacity duration-300`}></div>

                      {/* Token Content */}
                      <div style={{
                          opacity: isFilled ? 1 : 0,
                          transform: isFilled ? 'scale(1.15)' : 'scale(0.5)',
                          transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                      }} className="w-full h-full p-1 relative z-10 print:opacity-0 print:hidden">
                          {tokenBoardData.imgUrl ? (
                              <img src={tokenBoardData.imgUrl} alt="Token" className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.3)] filter" />
                          ) : (
                              <span className="text-6xl drop-shadow-xl flex items-center justify-center w-full h-full">*</span>
                          )}
                      </div>
                   </button>
                ))}
              </div>

              <button
                  onClick={() => setTokens(Array(10).fill(false))}
                  className="mt-8 mx-auto text-sm font-black uppercase tracking-wider text-slate-800 bg-white/80 hover:bg-white backdrop-blur-md border-2 border-white/50 px-8 py-3 rounded-full transition-all shadow-lg print:hidden max-w-[200px]"
              >
                  Reset Board
              </button>
            </div>
        </div>
      )}
    </>
  );
}
