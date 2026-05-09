import { X } from 'lucide-react';
import ABCAnalyzer from './ABCAnalyzer';
import MatchingLawCalc from './MatchingLawCalc';
import FAGrapher from './FAGrapher';
import RFTBuilder from './RFTBuilder';

export default function ToolboxModal({ type, onClose, apiKey }) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col overflow-hidden zoom-in-95">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h2 className="text-xl font-bold text-white">
            {type === 'abc' && 'ABC Data Pattern Analyzer'}
            {type === 'matching' && 'Matching Law Calculator'}
            {type === 'fa' && 'Functional Analysis Synthesizer'}
            {type === 'rft' && 'Relational Frame Theory Builder'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white bg-slate-800 p-2 rounded-full"><X size={20} /></button>
        </div>
        <div className="p-8">
          {type === 'abc' && <ABCAnalyzer apiKey={apiKey} />}
          {type === 'matching' && <MatchingLawCalc />}
          {type === 'fa' && <FAGrapher />}
          {type === 'rft' && <RFTBuilder />}
        </div>
      </div>
    </div>
  );
}
