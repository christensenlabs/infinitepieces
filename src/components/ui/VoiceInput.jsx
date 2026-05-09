import { Mic } from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

export default function VoiceInput({ value, onChange, placeholder, className = "" }) {
  const { isRecording, toggleRecording, voiceError } = useVoiceRecognition(value, onChange);
  return (
    <div className="relative w-full flex items-center">
      {voiceError && (
        <div className="absolute -top-8 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-in fade-in z-10">
          {voiceError}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={onChange}
        className={className || "w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm font-medium text-slate-800 pr-14 transition-all"}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={toggleRecording}
        className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors shadow-sm ${isRecording ? 'bg-rose-100 text-rose-600 animate-pulse border border-rose-200' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 border border-slate-200'}`}
        title={isRecording ? "Tap to Stop" : "Tap to Speak"}
      >
        <Mic size={18} />
      </button>
    </div>
  );
}
