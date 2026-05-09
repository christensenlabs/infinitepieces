import { Bot, BookOpen, FileText, Database, Users } from 'lucide-react';
import QuickActionButton from '../components/QuickActionButton';

export default function Dashboard({ onNavigate }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-gradient-to-r from-indigo-900 to-slate-950 border border-indigo-500/20 rounded-3xl p-8 relative overflow-hidden shadow-2xl">
        <div className="flex flex-col md:flex-row justify-between items-center relative z-10 gap-8">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center">
              <Bot className="mr-3 text-indigo-400" size={28} /> Welcome to Pocket BCBA
            </h2>
            <p className="text-slate-400 text-sm max-w-md">Your Master Build BCBA Assistant. Powered by a 10,000+ document behavioral library.</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <QuickActionButton icon={<BookOpen size={24} />} label="Expert Library" onClick={() => onNavigate('library')} />
        <QuickActionButton icon={<FileText size={24} />} label="Tx Plans" onClick={() => onNavigate('generator')} />
        <QuickActionButton icon={<Database size={24} />} label="Program Creator" onClick={() => onNavigate('programs')} />
        <QuickActionButton icon={<Users size={24} />} label="Caseload" onClick={() => onNavigate('clients')} />
      </div>
    </div>
  );
}
