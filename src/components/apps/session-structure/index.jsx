import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { callGemini } from '../../../lib/gemini';
import { useApiData } from '../../../hooks/useApiData';
import { fetchSessionStructureConfig } from '../../../api/apps';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import StatusMessage from './components/StatusMessage';
import ScheduleFeed from './views/ScheduleFeed';
import BlockDetailOverlay from './views/BlockDetailOverlay';

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

      <Sidebar
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        keywordInput={keywordInput}
        setKeywordInput={setKeywordInput}
        isGenerating={isGenerating}
        handleOrchestrateTheme={handleOrchestrateTheme}
        quickChips={quickChips}
        handleGenerateHandout={handleGenerateHandout}
        isGeneratingHandout={isGeneratingHandout}
        handleGenerateDiet={handleGenerateDiet}
        isGeneratingDiet={isGeneratingDiet}
        handleGenerateStory={handleGenerateStory}
        isGeneratingStory={isGeneratingStory}
        parentHandout={parentHandout}
        setParentHandout={setParentHandout}
        sensoryDiet={sensoryDiet}
        setSensoryDiet={setSensoryDiet}
        socialStory={socialStory}
        setSocialStory={setSocialStory}
        audioPlaying={audioPlaying}
        audioLoading={audioLoading}
        audioRef={audioRef}
        setAudioPlaying={setAudioPlaying}
        playTTS={playTTS}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-900 via-slate-900 to-black print:bg-white print:overflow-visible">

        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          currentTime={currentTime}
          keywordInput={keywordInput}
          generateMasterFlow={generateMasterFlow}
        />

        <StatusMessage statusMsg={statusMsg} />

        {/* Print Header (Only visible on paper) */}
        <div className="hidden print:block mb-8 border-b-2 border-slate-800 pb-4">
          <h1 className="text-3xl font-black text-slate-900 uppercase">Master Clinic Schedule</h1>
          <p className="text-sm font-bold text-slate-600">Context: {keywordInput} | Hours: 8:30 AM — 6:00 PM</p>
        </div>

        <ScheduleFeed
          clinicSchedule={clinicSchedule}
          currentBlockId={currentBlockId}
          setSelectedBlock={setSelectedBlock}
        />

        <BlockDetailOverlay
          selectedBlock={selectedBlock}
          setSelectedBlock={setSelectedBlock}
          handleGeneratePivot={handleGeneratePivot}
          isGeneratingPivot={isGeneratingPivot}
          handleGenerateDiyHack={handleGenerateDiyHack}
          isGeneratingDiy={isGeneratingDiy}
          handleGenerateMomentum={handleGenerateMomentum}
          isGeneratingMomentum={isGeneratingMomentum}
          handleGenerateConflict={handleGenerateConflict}
          isGeneratingConflict={isGeneratingConflict}
          handleGenerateIcebreaker={handleGenerateIcebreaker}
          isGeneratingIcebreaker={isGeneratingIcebreaker}
          activityPivots={activityPivots}
          setActivityPivots={setActivityPivots}
          diyHacks={diyHacks}
          setDiyHacks={setDiyHacks}
          momentumScripts={momentumScripts}
          setMomentumScripts={setMomentumScripts}
          peerConflicts={peerConflicts}
          setPeerConflicts={setPeerConflicts}
          icebreakers={icebreakers}
          setIcebreakers={setIcebreakers}
        />
      </main>
    </div>
  );
}
