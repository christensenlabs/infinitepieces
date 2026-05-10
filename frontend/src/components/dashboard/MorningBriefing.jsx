import React from 'react';
import { Icons } from '../Icons';

/**
 * @param {Object} props
 * @param {Object} props.briefing - useGeminiAction hook instance { result, loading, execute }
 */
export default function MorningBriefing({ briefing }) {
  return (
    <div className="bg-gradient-to-br from-brand to-brand-navy rounded-[2rem] p-6 shadow-md border border-slate-800 text-white relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-cyan-500/10 blur-3xl rounded-full pointer-events-none" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-black flex items-center gap-2 mb-2 text-white">
            <Icons.Sparkles className="w-5 h-5 text-cyan-400" /> Morning Operations Briefing
          </h3>
          {briefing.loading ? (
            <p className="text-sm text-cyan-200 animate-pulse">
              Analyzing live clinic metrics...
            </p>
          ) : briefing.result ? (
            <p className="text-sm text-slate-300 leading-relaxed max-w-4xl">{briefing.result}</p>
          ) : (
            <p className="text-sm text-slate-400">Your daily AI operational analysis is ready.</p>
          )}
        </div>

        {!briefing.result && !briefing.loading && (
          <button
            onClick={() =>
              briefing.execute(
                'As the AI Operations Director for Infinite Suite OS, give a 2-sentence morning briefing. The clinic currently has 2 open shifts in the SubPool, 1 schedule conflict, and 73% session recovery. Suggest priorities for today. Sound professional and motivating.',
                'You are a highly efficient, encouraging clinic operations AI.',
              )
            }
            className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-cyan-500/20 transition-colors shrink-0"
          >
            Generate Briefing
          </button>
        )}
      </div>
    </div>
  );
}
