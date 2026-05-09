import React from 'react';
import {
  Loader2, X, ArrowRight, Sparkles,
  Hammer, Rocket, TrendingDown, TrendingUp,
  Handshake, MessageCircle,
  BrainCircuit, Clock, Users, UserPlus, Zap, Brush, Utensils, Map,
} from 'lucide-react';

export default function BlockDetailOverlay({
  selectedBlock,
  setSelectedBlock,
  // Per-block AI generators
  handleGeneratePivot,
  isGeneratingPivot,
  handleGenerateDiyHack,
  isGeneratingDiy,
  handleGenerateMomentum,
  isGeneratingMomentum,
  handleGenerateConflict,
  isGeneratingConflict,
  handleGenerateIcebreaker,
  isGeneratingIcebreaker,
  // Per-block AI outputs
  activityPivots,
  setActivityPivots,
  diyHacks,
  setDiyHacks,
  momentumScripts,
  setMomentumScripts,
  peerConflicts,
  setPeerConflicts,
  icebreakers,
  setIcebreakers,
}) {
  if (!selectedBlock) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in zoom-in-95 print:hidden">
      <div className="bg-slate-900 w-full max-w-5xl max-h-[95vh] overflow-y-auto custom-scrollbar rounded-[2rem] border border-slate-700 shadow-2xl flex flex-col">
        <div className="p-5 md:p-8">

          {/* Header */}
          <div className="flex justify-between items-start mb-6 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-4">
              <div className="p-3 md:p-4 bg-indigo-600 rounded-2xl md:rounded-3xl shadow-lg shadow-indigo-500/20">
                {selectedBlock.cat === 'Group' ? <Users className="w-6 h-6 text-white" /> :
                 selectedBlock.cat === 'Social' ? <UserPlus className="w-6 h-6 text-white" /> :
                 selectedBlock.cat === 'ABA' ? <BrainCircuit className="w-6 h-6 text-white" /> :
                 selectedBlock.cat === 'Motor' ? <Zap className="w-6 h-6 text-white" /> :
                 selectedBlock.cat === 'Fine Motor' ? <Brush className="w-6 h-6 text-white" /> :
                 selectedBlock.cat === 'Routine' ? <Utensils className="w-6 h-6 text-white" /> :
                 selectedBlock.cat === 'Arrival' ? <Map className="w-6 h-6 text-white" /> :
                 <Clock className="w-6 h-6 text-white" />
                }
              </div>
              <div>
                <p className="text-indigo-400 font-black text-xs md:text-sm uppercase tracking-widest mb-1">{selectedBlock.startTime} — {selectedBlock.endTime}</p>
                <h2 className="text-xl md:text-3xl font-black text-white leading-tight">{selectedBlock.title}</h2>
              </div>
            </div>
            <button onClick={() => setSelectedBlock(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors shrink-0 bg-slate-800/50">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">

            {/* Left Col: Protocol & Tools */}
            <div className="space-y-5">
              <div className="bg-slate-800/40 p-5 md:p-6 rounded-3xl border border-slate-700/50">
                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Core Clinical Protocol</h4>
                <ul className="space-y-3.5 text-xs text-slate-300">
                  <li className="flex gap-3">
                    <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="leading-relaxed">Ensure <b>Satiation</b> checks are performed on secondary reinforcers before switching activities.</span>
                  </li>
                  <li className="flex gap-3">
                    <ArrowRight className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="leading-relaxed">Prioritize <b>Naturalistic Mands</b> and cooperative play over rapid trial speed.</span>
                  </li>
                  {selectedBlock.cat === 'Social' && (
                    <li className="flex gap-3">
                    <ArrowRight className="w-4 h-4 text-fuchsia-500 shrink-0" />
                    <span className="leading-relaxed">Monitor <b>Peer-Mediated Reinforcement</b> and shared control during high-density blocks.</span>
                  </li>
                  )}
                </ul>
              </div>

              <div className="bg-indigo-900/10 p-5 md:p-6 rounded-3xl border border-indigo-500/20">
                <h4 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-4">In-Moment Action Tools</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleGenerateDiyHack(selectedBlock)}
                      disabled={isGeneratingDiy}
                      className="py-2.5 bg-indigo-900/30 hover:bg-indigo-800/40 text-indigo-200 border border-indigo-500/30 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingDiy ? <Loader2 className="w-3 h-3 animate-spin" /> : <Hammer className="w-3 h-3" />} DIY Hack
                    </button>
                    <button
                      onClick={() => handleGenerateConflict(selectedBlock)}
                      disabled={isGeneratingConflict}
                      className="py-2.5 bg-rose-900/30 hover:bg-rose-800/40 text-rose-200 border border-rose-500/30 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingConflict ? <Loader2 className="w-3 h-3 animate-spin" /> : <Handshake className="w-3 h-3" />} Mediate Conflict
                    </button>
                    <button
                      onClick={() => handleGenerateIcebreaker(selectedBlock)}
                      disabled={isGeneratingIcebreaker}
                      className="py-2.5 bg-sky-900/30 hover:bg-sky-800/40 text-sky-200 border border-sky-500/30 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 sm:col-span-2"
                    >
                      {isGeneratingIcebreaker ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3" />} Social Icebreaker Script
                    </button>
                </div>

                {/* Tool Outputs */}
                <div className="mt-3 space-y-2">
                  {diyHacks[selectedBlock.id] && (
                    <div className="p-3 bg-indigo-950/50 rounded-xl text-[11px] text-indigo-200 border border-indigo-500/30 italic animate-in fade-in zoom-in-95 relative group pr-8">
                      <button onClick={() => setDiyHacks(prev => ({...prev, [selectedBlock.id]: null}))} className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-indigo-400"/></button>
                      {diyHacks[selectedBlock.id]}
                    </div>
                  )}
                  {peerConflicts[selectedBlock.id] && (
                    <div className="p-3 bg-rose-950/50 rounded-xl text-[11px] text-rose-200 border border-rose-500/30 italic animate-in fade-in zoom-in-95 relative group pr-8">
                      <button onClick={() => setPeerConflicts(prev => ({...prev, [selectedBlock.id]: null}))} className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-rose-400"/></button>
                      {peerConflicts[selectedBlock.id]}
                    </div>
                  )}
                  {icebreakers[selectedBlock.id] && (
                    <div className="p-3 bg-sky-950/50 rounded-xl text-[11px] text-sky-200 border border-sky-500/30 italic animate-in fade-in zoom-in-95 relative group pr-8">
                      <button onClick={() => setIcebreakers(prev => ({...prev, [selectedBlock.id]: null}))} className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-sky-400"/></button>
                      {icebreakers[selectedBlock.id]}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Col: Clinical Pivot Engine */}
            <div className="bg-slate-800/80 p-5 md:p-6 rounded-3xl border border-amber-500/20 shadow-lg flex flex-col">
              <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Clinical Pivot Engine
              </h4>
              <p className="text-xs text-slate-400 mb-5 leading-relaxed">
                If the client struggles with this block, use AI to instantly generate an adaptation or momentum sequence based on current context.
              </p>

              <div className="flex flex-col gap-3 mb-5">
                <button
                  onClick={() => handleGenerateMomentum(selectedBlock)}
                  disabled={isGeneratingMomentum}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-violet-500/30 text-violet-200 text-xs font-bold rounded-xl transition-all flex items-center justify-start gap-3 disabled:opacity-50"
                >
                  <Rocket className="w-4 h-4 text-violet-400 shrink-0" /> Build Momentum (High-P)
                </button>
                <button
                  onClick={() => handleGeneratePivot(selectedBlock, "high escalation, avoidance, and non-compliance (needs demand fading)")}
                  disabled={isGeneratingPivot}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-200 text-xs font-bold rounded-xl transition-all flex items-center justify-start gap-3 disabled:opacity-50"
                >
                  <TrendingDown className="w-4 h-4 text-amber-400 shrink-0" /> Pivot: De-Escalate Demands
                </button>
                <button
                  onClick={() => handleGeneratePivot(selectedBlock, "low energy, lethargy, and lack of motivation (needs behavioral momentum)")}
                  disabled={isGeneratingPivot}
                  className="py-3 px-4 bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-200 text-xs font-bold rounded-xl transition-all flex items-center justify-start gap-3 disabled:opacity-50"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" /> Pivot: Energize Motivation
                </button>
              </div>

              {/* Pivot Outputs */}
              <div className="flex-1">
                {isGeneratingMomentum || isGeneratingPivot ? (
                  <div className="h-full flex items-center justify-center p-6 border border-slate-700/50 border-dashed rounded-2xl">
                     <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                        <span className="text-xs font-bold uppercase tracking-widest animate-pulse">Synthesizing Clinical Strategy...</span>
                     </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {momentumScripts[selectedBlock.id] && (
                      <div className="p-4 bg-violet-950/30 border border-violet-500/30 rounded-2xl text-sm text-violet-100 leading-relaxed whitespace-pre-wrap animate-in fade-in slide-in-from-bottom-2 relative group pr-8">
                        <button onClick={() => setMomentumScripts(prev => ({...prev, [selectedBlock.id]: null}))} className="absolute top-3 right-3 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4 text-violet-400"/></button>
                        <span className="text-[10px] font-black uppercase text-violet-400 block mb-2">Momentum Sequence:</span>
                        {momentumScripts[selectedBlock.id]}
                      </div>
                    )}
                    {activityPivots[selectedBlock.id] && (
                      <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-2xl text-sm text-amber-100 italic leading-relaxed animate-in fade-in slide-in-from-bottom-2 relative group pr-8">
                        <button onClick={() => setActivityPivots(prev => ({...prev, [selectedBlock.id]: null}))} className="absolute top-3 right-3 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-4 h-4 text-amber-400"/></button>
                        <span className="text-[10px] font-black uppercase text-amber-400 block mb-2 not-italic">Clinical Adaptation:</span>
                        &quot;{activityPivots[selectedBlock.id]}&quot;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer Action */}
          <button
            onClick={() => setSelectedBlock(null)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm uppercase tracking-widest rounded-2xl transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.99] mt-2"
          >
            Return to Master Flow
          </button>
        </div>
      </div>
    </div>
  );
}
