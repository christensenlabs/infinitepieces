import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  RefreshCw, BrainCircuit, Sparkles, Loader2,
  Clock, AlertCircle, CheckCircle2,
  Utensils, Users, BookOpen, ShieldCheck,
  Zap, Map, Menu, X, ArrowRight,
  UserPlus, Globe, Brush, TrendingDown, TrendingUp, Mail, Printer,
  Hammer, Rocket, Volume2, Square, Handshake, Activity, MessageCircle,
  Search, Play
} from 'lucide-react';
import { callGemini } from '../../lib/gemini';
import { useApiData } from '../../hooks/useApiData';
import { fetchSessionStructureConfig } from '../../api/apps';

export default function SessionStructureApp({ apiKey }) {
  // --- Load config from mock API ---
  const { data: config, loading: configLoading } = useApiData(fetchSessionStructureConfig);

  // --- Elite Daycare Master State ---
  const [keywordInput, setKeywordInput] = useState("Community Helpers");
  const [isGenerating, setIsGenerating] = useState(false);
  const [clinicSchedule, setClinicSchedule] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mobile-Optimized Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);
  const [sidebarTab, setSidebarTab] = useState("ai"); // 'ai' or 'protocols'

  const [selectedBlock, setSelectedBlock] = useState(null);
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // LLM Feature States (Per-Block)
  const [activityPivots, setActivityPivots] = useState({});
  const [isGeneratingPivot, setIsGeneratingPivot] = useState(false);
  const [diyHacks, setDiyHacks] = useState({});
  const [isGeneratingDiy, setIsGeneratingDiy] = useState(false);
  const [momentumScripts, setMomentumScripts] = useState({});
  const [isGeneratingMomentum, setIsGeneratingMomentum] = useState(false);
  const [peerConflicts, setPeerConflicts] = useState({});
  const [isGeneratingConflict, setIsGeneratingConflict] = useState(false);
  const [icebreakers, setIcebreakers] = useState({});
  const [isGeneratingIcebreaker, setIsGeneratingIcebreaker] = useState(false);

  // LLM Feature States (Global)
  const [parentHandout, setParentHandout] = useState("");
  const [isGeneratingHandout, setIsGeneratingHandout] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [transitionSong, setTransitionSong] = useState("");
  // eslint-disable-next-line no-unused-vars
  const [isGeneratingSong, setIsGeneratingSong] = useState(false);
  const [socialStory, setSocialStory] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [sensoryDiet, setSensoryDiet] = useState("");
  const [isGeneratingDiet, setIsGeneratingDiet] = useState(false);

  // Audio / TTS States
  const audioRef = useRef(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioLoading, setAudioLoading] = useState(false);

  // Activity Pools (null = use config defaults, non-null = AI-generated overrides)
  const [groupActivitiesOverride, setGroupActivities] = useState(null);
  const [motorActivitiesOverride, setMotorActivities] = useState(null);
  const [fineMotorActivitiesOverride, setFineMotorActivities] = useState(null);
  const [socialPeakActivitiesOverride, setSocialPeakActivities] = useState(null);

  const groupActivities = groupActivitiesOverride || config?.defaultGroupActivities || [];
  const motorActivities = motorActivitiesOverride || config?.defaultMotorActivities || [];
  const fineMotorActivities = fineMotorActivitiesOverride || config?.defaultFineMotorActivities || [];
  const socialPeakActivities = socialPeakActivitiesOverride || config?.defaultSocialPeakActivities || [];

  // Cleanup Audio on Unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    };
  }, []);

  // Handle Resize for Sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show status messages briefly
  useEffect(() => {
    if (statusMsg.text) {
      const timer = setTimeout(() => {
        setStatusMsg({ type: '', text: '' });
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [statusMsg]);

  // --- AI Feature Generators ---
  const safeAiCall = async (setLoading, setOutput, prompt, sysPrompt, id = null, fallback = "AI System unavailable.") => {
    setLoading(true);
    try {
      const result = await callGemini(prompt, apiKey, sysPrompt);
      if (id) {
        setOutput(prev => ({ ...prev, [id]: (result || '').trim() }));
      } else {
        setOutput((result || '').trim());
      }
    } catch {
      if (id) {
        setOutput(prev => ({ ...prev, [id]: fallback }));
      } else {
        setOutput(fallback);
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Infinite Keyword Orchestration ---
  const handleOrchestrateTheme = async (overrideKeyword = null) => {
    const activeKeyword = overrideKeyword || keywordInput;
    if (!activeKeyword.trim()) return;

    if (overrideKeyword) setKeywordInput(overrideKeyword);
    setIsGenerating(true);

    const systemPrompt = "Act as an elite BCBA-D Daycare Director. The user will provide a keyword, mood, or theme. Generate a massive, highly creative curriculum pool (8 items per category). Keep descriptions under 12 words, descriptive, and clinical. Return valid JSON with keys: group, motor, fineMotor, social — each an array of strings.";

    try {
      const raw = await callGemini(`Context Keyword: "${activeKeyword}"`, apiKey, systemPrompt);
      const result = JSON.parse(raw);
      if (result.group?.length) setGroupActivities(result.group);
      if (result.motor?.length) setMotorActivities(result.motor);
      if (result.fineMotor?.length) setFineMotorActivities(result.fineMotor);
      if (result.social?.length) setSocialPeakActivities(result.social);

      generateMasterFlow();
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error("AI Generation Error", err);
      setStatusMsg({ type: 'error', text: 'AI Generation failed. Check network connection or API Key.' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGeneratePivot = (block, direction) => {
    const sysPrompt = "Act as an expert BCBA. Provide a 1-sentence modification to adapt the current activity based on the client's behavioral presentation. Be clinical, actionable, and practical for an RBT.";
    const prompt = `Activity: "${block.title}". Client presenting with ${direction}. How should the RBT immediately adapt this exact activity to regain control and ensure success?`;
    safeAiCall(setIsGeneratingPivot, setActivityPivots, prompt, sysPrompt, block.id, "AI System unavailable. Rely on antecedent modifications and pairing.");
  };

  const handleGenerateHandout = () => {
    const sysPrompt = "Act as a warm, professional ABA Daycare Director writing to parents.";
    const prompt = `Write a short, engaging 3-sentence daily update for parents. Today's clinical focus was "${keywordInput}". Mention functional communication, motor regulation, and peer play. Tone: encouraging and jargon-free.`;
    safeAiCall(setIsGeneratingHandout, setParentHandout, prompt, sysPrompt, null, "AI System unavailable. Write a manual note in the daily log.");
  };

  const handleGenerateDiyHack = (block) => {
    const sysPrompt = "Act as a highly resourceful BCBA/Daycare Teacher.";
    const prompt = `Activity: "${block.title}" (Context: ${keywordInput}). Missing official materials. Suggest a quick, 2-sentence 'DIY Hack' using only basic clinic items (paper, tape, cups, chairs).`;
    safeAiCall(setIsGeneratingDiy, setDiyHacks, prompt, sysPrompt, block.id, "AI System unavailable. Use general toys as substitutes.");
  };

  const handleGenerateMomentum = (block) => {
    const sysPrompt = "Act as an expert BCBA.";
    const prompt = `Client hesitating to start: "${block.title}". Generate a quick "Behavioral Momentum" (High-P to Low-P) sequence. Give 3 fun, extremely easy motor/vocal demands related to "${keywordInput}". Output as a short bulleted list.`;
    safeAiCall(setIsGeneratingMomentum, setMomentumScripts, prompt, sysPrompt, block.id, "AI System unavailable. Give 3 easy mastered demands (e.g., 'Touch nose').");
  };

  // eslint-disable-next-line no-unused-vars
  const handleGenerateSong = () => {
    const sysPrompt = "Act as an energetic early childhood ABA educator.";
    const tunes = config?.transitionTunes || ["Row, Row, Row Your Boat", "Twinkle Twinkle Little Star", "The Wheels on the Bus", "If You're Happy and You Know It"];
    const randomTune = tunes[Math.floor(Math.random() * tunes.length)];
    const prompt = `Write a 4-line rhyming transition chant to the tune of "${randomTune}". Current context: "${keywordInput}". Should help clients cleanly transition activities.`;
    safeAiCall(setIsGeneratingSong, setTransitionSong, prompt, sysPrompt, null, "AI System unavailable. Use standard transition visual timers.");
  };

  const handleGenerateStory = () => {
    const sysPrompt = "Act as a warm early childhood ABA educator.";
    const prompt = `Write an engaging 3-paragraph Social Story about: "${keywordInput}". Focus on what to expect, playing nicely, and functional communication (asking for a break). Sentences short and child-friendly.`;
    safeAiCall(setIsGeneratingStory, setSocialStory, prompt, sysPrompt, null, "AI System unavailable.");
  };

  const handleGenerateConflict = (block) => {
    const sysPrompt = "Act as an expert BCBA.";
    const prompt = `Activity: "${block.title}". Two learners are arguing over materials. Provide a quick, 3-step script to mediate this peer conflict using FCT and shared control. Highly actionable.`;
    safeAiCall(setIsGeneratingConflict, setPeerConflicts, prompt, sysPrompt, block.id, "AI System unavailable. Separate clients and prompt FCT.");
  };

  const handleGenerateDiet = () => {
    const sysPrompt = "Act as a pediatric OT and BCBA.";
    const prompt = `Context: "${keywordInput}". Generate a highly engaging "Sensory Diet" circuit. Exactly 3 steps: 1. Vestibular, 2. Proprioceptive, 3. Tactile. Actionable and under 3 sentences total.`;
    safeAiCall(setIsGeneratingDiet, setSensoryDiet, prompt, sysPrompt, null, "AI System unavailable.");
  };

  const handleGenerateIcebreaker = (block) => {
    const sysPrompt = "Act as an expert BCBA specializing in naturalistic social skills.";
    const prompt = `Activity: "${block.title}" (Context: ${keywordInput}). Generate a quick 2-step script for the RBT to facilitate a peer initiation (asking to join/share). Tell the RBT exactly what to say to prime the client.`;
    safeAiCall(setIsGeneratingIcebreaker, setIcebreakers, prompt, sysPrompt, block.id, "AI System unavailable. Prompt client to say 'Can I play?'");
  };

  // --- GEMINI TEXT TO SPEECH (TTS) ENGINE ---
  const playTTS = async (textToSpeak) => {
    if (audioRef.current) {
        audioRef.current.pause();
        setAudioPlaying(false);
    }
    setAudioLoading(true);

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`;
        const payload = {
            contents: [{ parts: [{ text: textToSpeak }] }],
            generationConfig: {
                responseModalities: ["AUDIO"],
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Aoede" } } }
            }
        };

        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if(!response.ok) throw new Error("TTS failed");
        const data = await response.json();

        const inlineData = data.candidates?.[0]?.content?.parts?.[0]?.inlineData;
        if (!inlineData) throw new Error("No audio data returned");

        const binaryString = window.atob(inlineData.data);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }

        const sampleRate = 24000;
        const pcmData = bytes.buffer;
        const numChannels = 1;
        const bitsPerSample = 16;
        const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
        const blockAlign = numChannels * (bitsPerSample / 8);

        const wavHeader = new ArrayBuffer(44);
        const view = new DataView(wavHeader);

        const writeString = (view, offset, string) => {
          for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
          }
        };

        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + pcmData.byteLength, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, byteRate, true);
        view.setUint16(32, blockAlign, true);
        view.setUint16(34, bitsPerSample, true);
        writeString(view, 36, 'data');
        view.setUint32(40, pcmData.byteLength, true);

        const wavBuffer = new Uint8Array(44 + pcmData.byteLength);
        wavBuffer.set(new Uint8Array(wavHeader), 0);
        wavBuffer.set(new Uint8Array(pcmData), 44);

        const blob = new Blob([wavBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(blob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => setAudioPlaying(false);
        audio.play();
        setAudioPlaying(true);
    } catch (err) {
        console.error("TTS Error", err);
        setStatusMsg({ type: 'error', text: 'Failed to load audio. Please check network connection.' });
    } finally {
        setAudioLoading(false);
    }
  };


  // --- Master Scheduling Logic ---
  const formatTimeStr = (totalMinutes) => {
    const hours24 = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 % 12 || 12;
    return `${hours12}:${mins < 10 ? '0' + mins : mins} ${period}`;
  };

  const generateMasterFlow = useCallback(() => {
    const startMin = config?.scheduleStartMinutes ?? 510;
    const totalBlocks = config?.totalDayBlocks ?? 19;
    const blockDur = config?.blockDuration ?? 30;
    let startMinutes = startMin;
    const newFlow = [];

    const getSafeItem = (arr, index) => arr && arr.length > 0 ? arr[index % arr.length] : "Instructional Activity";

    for (let i = 0; i < totalBlocks; i++) {
      const startMinRaw = startMinutes;
      const startTime = formatTimeStr(startMinutes);
      startMinutes += blockDur;
      const endTime = formatTimeStr(startMinutes);

      let block = { id: i, startTime, endTime, startMinRaw };

      if (i === 0) {
        block = { ...block, cat: 'Arrival', title: 'Arrival & Morning Logistics', note: 'Focus: Shoe/coat removal TA and independent greeting.', type: 'routine' };
      } else if (i === 1) {
        block = { ...block, cat: 'Group', title: 'Morning Circle & Story Time', note: 'Interactive reading, weather song, and peer-check.', type: 'social' };
      } else if (startMinRaw >= 900) { // 3:00 PM onwards
        const socialIdx = Math.floor((startMinRaw - 900) / blockDur);
        if (i === totalBlocks - 1) {
          block = { ...block, cat: 'Routine', title: 'Departure & Caregiver Handover', note: 'Final daily logs and luggage management.', type: 'routine' };
        } else {
          block = { ...block, cat: 'Social', title: getSafeItem(socialPeakActivities, socialIdx), note: 'Social Peak Hour: High-density peer interaction training.', type: 'social' };
        }
      } else {
        const rotation = ['ABA', 'Routine', 'Motor', 'ABA', 'Group', 'Routine', 'ABA', 'Fine Motor', 'Motor', 'ABA', 'Group', 'Routine'];
        const cycleIdx = (i - 2) % rotation.length;
        const cat = rotation[cycleIdx];

        let title = '';
        let note = '';

        switch(cat) {
          case 'ABA':
            title = 'Intensive Instruction Block';
            note = '1:1 RBT pull for skill acquisition (DTT/NET) & naturalistic play.';
            break;
          case 'Routine':
            title = 'Snack / ADL Routine';
            note = 'Functional mands with snack (open, more, chip) & hygiene TA.';
            break;
          case 'Motor':
            title = getSafeItem(motorActivities, i);
            note = 'Gross motor regulation, vestibular input, and sensory needs.';
            break;
          case 'Group':
            title = getSafeItem(groupActivities, i);
            note = 'Social skill targets, pretend play, and structured group settings.';
            break;
          case 'Fine Motor':
            title = getSafeItem(fineMotorActivities, i);
            note = 'Table-top precision, pincer grasp, and visual-motor integration.';
            break;
          default:
            title = 'Instructional Activity';
            note = 'Treatment plan adherence focus.';
        }

        block = { ...block, cat, title, note, type: cat.toLowerCase() };
      }

      newFlow.push(block);
    }
    setClinicSchedule(newFlow);
  }, [config, groupActivities, motorActivities, fineMotorActivities, socialPeakActivities]);

  useEffect(() => {
    if (!configLoading && config) {
      generateMasterFlow();
    }
    const interval = setInterval(() => setCurrentTime(new Date()), 10000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configLoading]);

  // --- Live Timing Logic ---
  const currentBlockId = useMemo(() => {
    const h = currentTime.getHours();
    const m = currentTime.getMinutes();
    const totalNow = h * 60 + m;
    const blockDur = config?.blockDuration ?? 30;
    const block = clinicSchedule.find(b => totalNow >= b.startMinRaw && totalNow < (b.startMinRaw + blockDur));
    return block ? block.id : null;
  }, [currentTime, clinicSchedule, config]);

  // --- Quick Chips from config ---
  const quickChips = config?.quickChips || [];

  // --- UI Components ---
  const QuickChip = ({ emoji, text }) => (
    <button
      onClick={() => handleOrchestrateTheme(text)}
      className="shrink-0 px-3 py-1.5 bg-slate-800 hover:bg-indigo-600 border border-slate-700 text-[10px] font-bold text-slate-300 hover:text-white rounded-full transition-all shadow-sm flex items-center gap-1.5"
    >
      <span>{emoji}</span> {text}
    </button>
  );

  if (configLoading) {
    return (
      <div className="flex h-full items-center justify-center bg-[#0F172A] text-slate-200">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0F172A] overflow-hidden text-slate-200 font-sans print:bg-white print:text-black print:h-auto print:overflow-visible">

      {/* Dynamic Keyframes and Animations injected here to ensure they always load */}
      <style dangerouslySetInnerHTML={{ __html: `
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn95; }
        .slide-in-from-bottom-2 { animation-name: slideInBottom2; }
        .slide-in-from-bottom-4 { animation-name: slideInBottom4; }
        .slide-in-from-top-4 { animation-name: slideInTop4; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInBottom2 { from { opacity: 0; transform: translateY(0.5rem); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInBottom4 { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInTop4 { from { opacity: 0; transform: translateY(-1rem); } to { opacity: 1; transform: translateY(0); } }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        @media (min-width: 768px) { .custom-scrollbar::-webkit-scrollbar { width: 6px; } }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
        @media print {
          body { -webkit-print-color-adjust: exact; background: white; margin: 0; padding: 0; }
          .print\\:hidden { display: none !important; }
        }
      `}} />

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
                       <QuickChip key={idx} emoji={chip.emoji} text={chip.text} />
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

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black print:bg-white print:overflow-visible">

        {/* Header Overlay */}
        <header className="px-5 md:px-8 py-4 md:py-6 flex flex-col sm:flex-row sm:items-center justify-between z-10 border-b border-white/5 backdrop-blur-sm print:hidden gap-4">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-slate-800 rounded-lg transition-colors bg-slate-800/50 border border-slate-700">
                <Menu className="w-5 h-5 text-slate-300" />
              </button>
            )}
            <div>
              <h1 className="text-lg md:text-2xl font-black tracking-tight text-white flex items-center gap-2 md:gap-3 flex-wrap">
                Master Schedule
                {currentTime.getHours() >= 15 ? (
                  <span className="px-2 py-0.5 rounded-md bg-fuchsia-500 text-[10px] uppercase text-fuchsia-950 font-black animate-pulse whitespace-nowrap">Social Peak Active</span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-[10px] uppercase text-emerald-950 font-black whitespace-nowrap">Standard Flow</span>
                )}
              </h1>
              <p className="text-[10px] md:text-xs text-indigo-300 font-bold tracking-wide">Context: {keywordInput || "Default"} &bull; 8:30 AM — 6:00 PM</p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button onClick={generateMasterFlow} className="p-2 hover:bg-slate-800 bg-slate-800/50 rounded-lg transition-colors border border-slate-700 text-slate-400 hover:text-white" title="Shuffle Routine">
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <button onClick={() => window.print()} className="p-2 hover:bg-slate-800 bg-slate-800/50 rounded-lg transition-colors border border-slate-700 text-slate-400 hover:text-white" title="Print Master Schedule">
              <Printer className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <div className="flex flex-col items-end border-l border-slate-700 pl-3 md:pl-4 ml-1">
              <span className="text-xl md:text-3xl font-black text-indigo-400 font-mono tracking-tighter leading-none">
                {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-[9px] md:text-[10px] uppercase font-black text-slate-500 tracking-widest mt-1">Live Pulse</span>
            </div>
          </div>
        </header>

        {/* Status Message Overlay */}
        {statusMsg.text && (
          <div className="absolute top-20 right-8 z-50 animate-in fade-in slide-in-from-top-4">
            <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border ${statusMsg.type === 'error' ? 'bg-rose-900 border-rose-500 text-white' : 'bg-emerald-900 border-emerald-500 text-white'}`}>
               {statusMsg.type === 'error' ? <AlertCircle className="w-5 h-5"/> : <CheckCircle2 className="w-5 h-5"/>}
               <span className="text-sm font-bold">{statusMsg.text}</span>
            </div>
          </div>
        )}

        {/* Print Header (Only visible on paper) */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-slate-900 uppercase">Master Clinic Schedule</h1>
          <p className="text-sm font-bold text-slate-600">Context: {keywordInput} | Hours: 8:30 AM — 6:00 PM</p>
        </div>

        {/* Scrollable Schedule Feed */}
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-32 space-y-3 custom-scrollbar pt-6 print:overflow-visible print:pb-0 print:pt-0 print:space-y-0">
          {clinicSchedule.map((block) => {
            const isCurrent = block.id === currentBlockId;
            const isSocialPeak = block.startMinRaw >= 900;
            return (
              <div
                key={block.id}
                onClick={() => setSelectedBlock(block)}
                className={`group relative flex items-center gap-3 md:gap-6 p-1 rounded-[2rem] transition-all duration-300 cursor-pointer print:rounded-none print:border-b print:border-slate-300 print:py-4 print:gap-4 ${isCurrent ? 'scale-[1.01] md:scale-[1.02] z-10 print:scale-100' : 'hover:bg-slate-800/40 print:hover:bg-transparent'}`}
              >
                {/* Time Indicator */}
                <div className="w-16 md:w-24 flex flex-col items-center justify-center shrink-0 print:w-20">
                  <span className={`text-[10px] md:text-xs font-black transition-colors print:text-black ${isCurrent ? 'text-indigo-400' : 'text-slate-500'}`}>
                    {block.startTime}
                  </span>
                  <div className={`h-8 md:h-12 w-[2px] rounded-full my-1 print:hidden ${isCurrent ? 'bg-gradient-to-b from-indigo-500 to-transparent' : 'bg-slate-800'}`} />
                </div>

                {/* Main Card */}
                <div className={`flex-1 flex flex-row items-center gap-4 md:gap-6 p-4 md:p-6 rounded-3xl border transition-all duration-300 print:border-none print:p-0 print:shadow-none ${
                  isCurrent
                    ? 'bg-slate-800/90 border-indigo-500 shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]'
                    : isSocialPeak
                      ? 'bg-fuchsia-900/5 border-fuchsia-900/20'
                      : 'bg-slate-900/60 border-slate-800/60'
                }`}>
                  <div className={`p-3 md:p-4 rounded-2xl shrink-0 print:hidden ${
                    block.cat === 'ABA' ? 'bg-rose-500/10' :
                    block.cat === 'Group' || block.cat === 'Social' ? 'bg-emerald-500/10' :
                    block.cat === 'Fine Motor' ? 'bg-teal-500/10' :
                    'bg-slate-800'
                  }`}>
                    {block.cat === 'Group' ? <Users className="w-5 h-5 text-emerald-500" /> :
                     block.cat === 'Social' ? <UserPlus className="w-5 h-5 text-fuchsia-500" /> :
                     block.cat === 'ABA' ? <BrainCircuit className="w-5 h-5 text-rose-500" /> :
                     block.cat === 'Motor' ? <Zap className="w-5 h-5 text-orange-500" /> :
                     block.cat === 'Fine Motor' ? <Brush className="w-5 h-5 text-teal-500" /> :
                     block.cat === 'Routine' ? <Utensils className="w-5 h-5 text-amber-500" /> :
                     block.cat === 'Arrival' ? <Map className="w-5 h-5 text-indigo-500" /> :
                     <Clock className="w-5 h-5 text-slate-400" />
                    }
                  </div>

                  <div className="flex-1 text-left print:text-left min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest print:text-slate-500 ${
                        block.cat === 'ABA' ? 'text-rose-400' :
                        block.cat === 'Social' ? 'text-fuchsia-400' :
                        block.cat === 'Group' ? 'text-emerald-400' :
                        block.cat === 'Fine Motor' ? 'text-teal-400' :
                        'text-slate-500'
                      }`}>
                        {block.cat} {isSocialPeak && " (High Density)"}
                      </span>
                      {isCurrent && <span className="flex h-1.5 w-1.5 rounded-full bg-indigo-500 animate-ping print:hidden" />}
                    </div>
                    <h3 className={`text-sm md:text-lg font-bold leading-tight truncate print:text-black print:whitespace-normal ${isCurrent ? 'text-white' : 'text-slate-200'}`}>
                      {block.title}
                    </h3>
                    <p className="text-[10px] md:text-xs text-slate-500 mt-1 md:mt-1.5 font-medium italic print:text-slate-600 line-clamp-1 md:line-clamp-2 print:line-clamp-none">{block.note}</p>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-1.5 shrink-0 print:hidden">
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-700 flex items-center justify-center text-[8px] font-bold ${isSocialPeak ? 'bg-fuchsia-900 text-fuchsia-200 border-fuchsia-950' : 'text-slate-300'}`}>RB</div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Master Action Detail Overlay (Hides on Print) */}
        {selectedBlock && (
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
        )}
      </main>
    </div>
  );
}
