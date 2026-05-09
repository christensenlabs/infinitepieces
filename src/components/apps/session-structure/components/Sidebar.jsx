import React from 'react';
import {
  Sparkles, Loader2, X, ShieldCheck, Globe, AlertCircle,
  Search, Play, Mail, Activity, BookOpen, Volume2, Square,
} from 'lucide-react';
import QuickChip from './QuickChip';

export default function Sidebar({
  isSidebarOpen,
  setIsSidebarOpen,
  sidebarTab,
  setSidebarTab,
  keywordInput,
  setKeywordInput,
  isGenerating,
  handleOrchestrateTheme,
  quickChips,
  // Global generator props
  handleGenerateHandout,
  isGeneratingHandout,
  handleGenerateDiet,
  isGeneratingDiet,
  handleGenerateStory,
  isGeneratingStory,
  // Global output props
  parentHandout,
  setParentHandout,
  sensoryDiet,
  setSensoryDiet,
  socialStory,
  setSocialStory,
  // Audio props
  audioPlaying,
  audioLoading,
  audioRef,
  setAudioPlaying,
  playTTS,
}) {
  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-40 md:hidden transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar: Infinite Context Engine & Tabs */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 h-full shrink-0 transition-transform duration-300 ease-in-out border-r border-slate-800 bg-slate-900/95 md:bg-slate-900/50 backdrop-blur-2xl flex flex-col print:hidden shadow-2xl md:shadow-none ${isSidebarOpen ? 'translate-x-0 w-[85vw] sm:w-80 md:w-96' : '-translate-x-full md:translate-x-0 w-[85vw] sm:w-80 md:w-0 overflow-hidden md:opacity-0 md:pointer-events-none md:border-none'}`}>
        <div className="p-5 md:p-6 flex flex-col flex-1 overflow-y-auto custom-scrollbar">

          {/* Header & Mobile Close */}
          <div className="flex items-center justify-between mb-6 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight leading-tight text-white">DAYCARE AI</h2>
                <p className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Context Engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="md:hidden p-2 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar Tabs */}
          <div className="flex bg-slate-800/60 p-1 rounded-xl mb-6 shrink-0 border border-slate-700/50">
            <button
              onClick={() => setSidebarTab('ai')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${sidebarTab === 'ai' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            >
              <Sparkles className="w-3 h-3" /> AI Hub
            </button>
            <button
              onClick={() => setSidebarTab('protocols')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${sidebarTab === 'protocols' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
            >
              <Globe className="w-3 h-3" /> Protocols
            </button>
          </div>

          <div className="flex-1">
            {sidebarTab === 'ai' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* Infinite Context Input */}
                <div className="bg-slate-800/80 rounded-2xl p-5 border border-indigo-500/30 shadow-lg relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10" />
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Search className="w-3 h-3 text-indigo-400" />
                    Context Orchestrator
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">
                    Type any keyword, mood, or toy. The AI will instantly generate 32 new clinical activities tailored perfectly to that context.
                  </p>
                  <div className="relative mb-3">
                    <input
                      type="text"
                      value={keywordInput}
                      onChange={(e) => setKeywordInput(e.target.value)}
                      placeholder="e.g. Rainy day, Lethargic, Dinosaurs..."
                      className="w-full bg-slate-900/80 border border-slate-600 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm transition-all text-white placeholder-slate-500"
                    />
                    <button
                      onClick={() => handleOrchestrateTheme()}
                      disabled={isGenerating || !keywordInput.trim()}
                      className="absolute right-1.5 top-1.5 p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors disabled:bg-slate-700 text-white shadow-md active:scale-95"
                      title="Orchestrate Entire Schedule"
                    >
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                    </button>
                  </div>

                  {/* 1-Click Quick Chips */}
                  <div className="flex flex-nowrap overflow-x-auto custom-scrollbar pb-2 gap-2 mt-4 -mx-1 px-1">
                     {quickChips.map((chip, idx) => (
                       <QuickChip key={idx} emoji={chip.emoji} text={chip.text} onSelect={handleOrchestrateTheme} />
                     ))}
                  </div>
                </div>

                {/* Global Generators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Parent Comm Engine */}
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 shadow-inner flex flex-col justify-between">
                    <h3 className="text-[10px] font-black text-fuchsia-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Parent Note
                    </h3>
                    <button
                      onClick={handleGenerateHandout}
                      disabled={isGeneratingHandout}
                      className="w-full py-2.5 bg-fuchsia-900/30 hover:bg-fuchsia-800/40 text-fuchsia-200 border border-fuchsia-500/20 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingHandout ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Draft</>}
                    </button>
                  </div>

                  {/* Sensory Diet Chef */}
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 shadow-inner flex flex-col justify-between">
                    <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Activity className="w-3 h-3" /> Sensory Diet
                    </h3>
                    <button
                      onClick={handleGenerateDiet}
                      disabled={isGeneratingDiet}
                      className="w-full py-2.5 bg-emerald-900/30 hover:bg-emerald-800/40 text-emerald-200 border border-emerald-500/20 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingDiet ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Generate</>}
                    </button>
                  </div>

                  {/* Social Story Architect */}
                  <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700 shadow-inner flex flex-col justify-between sm:col-span-2">
                    <h3 className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3" /> Social Story & Voice
                    </h3>
                    <button
                      onClick={handleGenerateStory}
                      disabled={isGeneratingStory}
                      className="w-full py-2.5 bg-teal-900/30 hover:bg-teal-800/40 text-teal-200 border border-teal-500/20 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isGeneratingStory ? <Loader2 className="w-3 h-3 animate-spin" /> : <>Build Contextual Story</>}
                    </button>
                  </div>
                </div>

                {/* Global Outputs Area */}
                <div className="space-y-3">
                  {parentHandout && (
                    <div className="p-3 bg-fuchsia-900/10 rounded-xl text-[11px] text-fuchsia-100 leading-relaxed border border-fuchsia-500/30 animate-in fade-in zoom-in-95 relative group">
                      <button onClick={() => setParentHandout("")} className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-fuchsia-300"/></button>
                      <span className="font-bold text-fuchsia-300 block mb-1">Parent Note:</span>
                      {parentHandout}
                    </div>
                  )}
                  {sensoryDiet && (
                    <div className="p-3 bg-emerald-900/10 rounded-xl text-[11px] text-emerald-100 leading-relaxed border border-emerald-500/30 whitespace-pre-wrap animate-in fade-in zoom-in-95 relative group">
                      <button onClick={() => setSensoryDiet("")} className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-emerald-300"/></button>
                      <span className="font-bold text-emerald-300 block mb-1">Sensory Circuit:</span>
                      {sensoryDiet}
                    </div>
                  )}
                  {socialStory && (
                    <div className="flex flex-col gap-2 animate-in fade-in zoom-in-95 relative group">
                        <div className="p-3 bg-teal-900/10 rounded-xl text-[11px] text-teal-100 leading-relaxed border border-teal-500/30 whitespace-pre-wrap relative">
                          <button onClick={() => setSocialStory("")} className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-teal-300"/></button>
                          <span className="font-bold text-teal-300 block mb-1">Social Story:</span>
                          {socialStory}
                        </div>
                        <button
                            onClick={() => {
                                if (audioPlaying) {
                                    audioRef.current?.pause();
                                    setAudioPlaying(false);
                                } else {
                                    playTTS(`Listen to this story. ` + socialStory);
                                }
                            }}
                            disabled={audioLoading}
                            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 active:scale-95"
                        >
                            {audioLoading ? <Loader2 className="w-4 h-4 animate-spin" /> :
                             audioPlaying ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                            {audioPlaying ? "Stop Reading" : "Read Story Aloud"}
                        </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {sidebarTab === 'protocols' && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                {/* System Mandates */}
                <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Globe className="w-4 h-4" /> Global Mandates
                  </h3>
                  <ul className="text-[11px] space-y-3 opacity-80 text-slate-300 leading-relaxed">
                    <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" /> Target Mands explicitly during Snack/Routine blocks.</li>
                    <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" /> Use Cocoon/Round swings for proactive sensory regulation.</li>
                    <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-slate-500 mt-1.5 shrink-0" /> Embed Deep Pressure + Intraverbals during motor rotations.</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 rounded-2xl p-5 border border-slate-700/50">
                  <h3 className="text-xs font-black text-rose-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Safety Limits
                  </h3>
                  <ul className="text-[11px] space-y-3 opacity-80 text-slate-300 leading-relaxed">
                    <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" /> Never block access to AAC or primary communication.</li>
                    <li className="flex gap-2 items-start"><div className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" /> Maintain 1:1 line of sight during transitions.</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
