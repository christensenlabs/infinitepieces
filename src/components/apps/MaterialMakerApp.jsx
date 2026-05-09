import React, { useState, useEffect, useRef } from 'react';
import {
  BrainCircuit, Sparkles, Loader2,
  AlertCircle, CheckCircle2, LayoutGrid, ListChecks,
  Scissors, Printer, Calendar, Star, Wand2, Image as ImageIcon,
  Target, PlusCircle, Lightbulb, BookOpen, Mic
} from 'lucide-react';
// callGemini not used directly; this app uses fetchGeminiWithRetry instead

import { useApiData } from '../../hooks/useApiData';
import { fetchMaterialMakerConfig } from '../../api/apps';

// --- Core Voice Hook (Prevents crashing and state resets) ---
function useVoiceRecognition(value, onChange) {
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);

  // Keep refs updated without triggering re-renders of the recognition object
  useEffect(() => { valueRef.current = value; }, [value]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          const currentVal = valueRef.current || '';
          const space = (currentVal && !currentVal.endsWith(' ')) ? ' ' : '';
          // Safely update parent state
          onChangeRef.current({ target: { value: currentVal + space + finalTranscript.trim() } });
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      if (!recognitionRef.current) {
        setVoiceError('Voice dictation is not supported in this browser.');
        setTimeout(() => setVoiceError(''), 3000);
        return;
      }
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch(e) {
        console.error(e);
      }
    }
  };

  return { isRecording, toggleRecording, voiceError };
}

// --- Reusable Voice-Enabled Text Area ---
function VoiceTextArea({ value, onChange, placeholder, rows = 2, className = "" }) {
  const { isRecording, toggleRecording, voiceError } = useVoiceRecognition(value, onChange);
  return (
    <div className="relative w-full flex items-center">
      {voiceError && (
        <div className="absolute -top-8 right-0 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-md animate-in fade-in z-10">
          {voiceError}
        </div>
      )}
      <textarea
        value={value}
        onChange={onChange}
        className={className || "w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white shadow-sm font-medium text-slate-800 pr-14 transition-all resize-none custom-scrollbar"}
        rows={rows}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={toggleRecording}
        className={`absolute right-3 bottom-3 p-2 rounded-lg transition-colors shadow-sm ${isRecording ? 'bg-rose-100 text-rose-600 animate-pulse border border-rose-200' : 'bg-slate-100 text-slate-400 hover:bg-indigo-100 hover:text-indigo-600 border border-slate-200'}`}
        title={isRecording ? "Tap to Stop" : "Tap to Speak"}
      >
        <Mic size={18} />
      </button>
    </div>
  );
}

// --- Reusable Voice-Enabled Input ---
function VoiceInput({ value, onChange, placeholder, className = "" }) {
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

export default function MaterialMakerApp({ apiKey }) {
  // --- Load config from mock API ---
  const { data: config } = useApiData(fetchMaterialMakerConfig);

  // --- App State ---
  const [activeTab, setActiveTab] = useState('tokenboard');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  // --- Schedule State ---
  const [scheduleInputs, setScheduleInputs] = useState(['', '', '', '']);
  const [scheduleStyle, setScheduleStyle] = useState('cartoon');
  const [scheduleItems, setScheduleItems] = useState([]);
  const [isGeneratingSchedule, setIsGeneratingSchedule] = useState(false);

  // --- Token Board State (Upgraded for Backgrounds & Rewards) ---
  const [tokens, setTokens] = useState(Array(10).fill(false));
  const [tokenTheme, setTokenTheme] = useState('');
  const [rewardTheme, setRewardTheme] = useState('');
  const [isGeneratingTokenBoard, setIsGeneratingTokenBoard] = useState(false);
  const [isGeneratingReward, setIsGeneratingReward] = useState(false);
  const [tokenBoardData, setTokenBoardData] = useState({
      title: 'My Token Board',
      imgUrl: null,
      bgUrl: null,
      rewardImgUrl: null
  });

  // --- Social Story State ---
  const [storyTopic, setStoryTopic] = useState('');
  const [storyName, setStoryName] = useState('');
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [socialStoryData, setSocialStoryData] = useState(null);

  // --- Material Maker State (DTT, NET, TA, PRT) ---
  const [materialInput, setMaterialInput] = useState("");
  const [isDraftingPlan, setIsDraftingPlan] = useState(false);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
  const [flashcards, setFlashcards] = useState([]);

  // --- Activity Maker State ---
  const [activityType, setActivityType] = useState('coloring');
  const [activityTheme, setActivityTheme] = useState('');
  const [isGeneratingActivity, setIsGeneratingActivity] = useState(false);
  const [activityData, setActivityData] = useState(null);

  // --- Gemini Assistant States ---
  const [childInterest, setChildInterest] = useState("");
  const [isGeneratingPlay, setIsGeneratingPlay] = useState(false);
  const [dttDomain, setDttDomain] = useState("");
  const [isGeneratingDttAssistant, setIsGeneratingDttAssistant] = useState(false);
  const [generatedDttTargets, setGeneratedDttTargets] = useState([]);

  // --- Activity Pools (seeded from config) ---
  const [netPool, setNetPool] = useState([]);
  const [grossMotorPool, setGrossMotorPool] = useState([]);

  // Seed pools from config once loaded
  const configNetPool = config?.defaultNetPool;
  const configGrossMotorPool = config?.defaultGrossMotorPool;
  const configTokenBoard = config?.defaultTokenBoard;
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect -- one-time seed from async config */
    if (configNetPool) setNetPool(configNetPool);
    if (configGrossMotorPool) setGrossMotorPool(configGrossMotorPool);
    if (configTokenBoard) setTokenBoardData(configTokenBoard);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [configNetPool, configGrossMotorPool, configTokenBoard]);

  // --- Gemini & Imagen API Utilities ---
  const fetchGeminiWithRetry = async (prompt, systemInstruction, schema) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
      systemInstruction: { parts: [{ text: systemInstruction }] },
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: "application/json", responseSchema: schema }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < delays.length + 1; i++) {
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!textResponse) throw new Error("Invalid response structure.");
        return JSON.parse(textResponse);
      } catch (error) {
        if (i === delays.length) throw error;
        await new Promise(res => setTimeout(res, delays[i]));
      }
    }
  };

  const fetchImagenWithRetry = async (prompt, aspectRatio = "1:1") => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${apiKey}`;
    const payload = {
      instances: [{ prompt: prompt }],
      parameters: { sampleCount: 1, aspectRatio }
    };

    const delays = [1000, 2000, 4000, 8000, 16000];
    for (let i = 0; i < delays.length + 1; i++) {
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
          return `data:image/png;base64,${data.predictions[0].bytesBase64Encoded}`;
        }
        throw new Error("Invalid image response");
      } catch (error) {
        if (i === delays.length) throw error;
        await new Promise(res => setTimeout(res, delays[i]));
      }
    }
  };

  // --- Sound Synthesis (Magical Token Chime) ---
  const playChime = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);

      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio synthesis failed", e);
    }
  };

  const handleTokenClick = (index) => {
    const newTokens = [...tokens];
    newTokens[index] = !newTokens[index];
    setTokens(newTokens);
    if (newTokens[index]) {
      playChime();
    }
  };

  // --- Upgraded Token Board Generator (Dual Pipeline) ---
  const handleGenerateTokenBoard = async () => {
    if(!tokenTheme.trim()) { setStatusMsg({type:'error', text:'Enter a token theme first.'}); return; }
    setIsGeneratingTokenBoard(true);
    setStatusMsg({type:'', text:''});

    try {
        const prompt = `The user wants an ABA token board themed around "${tokenTheme}". Provide a catchy title. Then, provide two separate image prompts for an AI generator:
        1. "bgPrompt": A prompt for a beautiful, artistic, highly-detailed scenic background wallpaper without any text or central subjects blocking the view (e.g., "A beautiful magical enchanted forest background, digital art, vibrant colors, cinematic lighting").
        2. "iconPrompt": A prompt for a single premium 3D-style cartoon icon representing the theme on a pure white background (e.g., "A shiny 3D cartoon rocket ship on a solid white background, high quality").`;

        const schema = {
          type: "OBJECT",
          properties: {
            title: {type: "STRING"},
            bgPrompt: {type: "STRING"},
            iconPrompt: {type: "STRING"}
          },
          required: ["title", "bgPrompt", "iconPrompt"]
        };

        const data = await fetchGeminiWithRetry(prompt, "Return valid JSON matching the schema.", schema);

        // Run Imagen calls in parallel for speed
        const [bgUrl, imgUrl, rewardUrl] = await Promise.all([
          fetchImagenWithRetry(data.bgPrompt, "16:9"),
          fetchImagenWithRetry(data.iconPrompt, "1:1"),
          rewardTheme.trim() ? fetchImagenWithRetry(`Clean child-friendly cartoon AAC style flat vector illustration of ${rewardTheme} on a solid white background.`, "1:1") : Promise.resolve(tokenBoardData.rewardImgUrl)
        ]);

        setTokenBoardData({ title: data.title, imgUrl, bgUrl, rewardImgUrl: rewardUrl });
        setTokens(Array(10).fill(false)); // Reset tokens
        setStatusMsg({type:'success', text:'Artistic premium token board generated!'});
    } catch {
        setStatusMsg({type:'error', text:'Failed to generate token board.'});
    } finally {
        setIsGeneratingTokenBoard(false);
    }
  };

  const handleGenerateReward = async () => {
    if (!rewardTheme.trim()) return;
    setIsGeneratingReward(true);
    setStatusMsg({type:'', text:''});
    try {
      const url = await fetchImagenWithRetry(`Clean child-friendly cartoon AAC style flat vector illustration of ${rewardTheme} on a solid white background.`, "1:1");
      setTokenBoardData(prev => ({ ...prev, rewardImgUrl: url }));
      setStatusMsg({type:'success', text:'Reward visual generated!'});
    } catch {
      setStatusMsg({type:'error', text:'Failed to generate reward image.'});
    } finally {
      setIsGeneratingReward(false);
    }
  };

  // --- 4-Step Visual Schedule Generator ---
  const handleGenerateCustomSchedule = async () => {
    if (scheduleInputs.every(i => !i.trim())) {
       setStatusMsg({ type: 'error', text: 'Enter at least one activity.' });
       return;
    }
    setIsGeneratingSchedule(true);
    setStatusMsg({ type: '', text: '' });

    const newItems = scheduleInputs.map((text, index) => ({
        id: index, text, status: text.trim() ? 'loading' : 'empty', url: null
    }));
    setScheduleItems(newItems);

    for (let i = 0; i < 4; i++) {
       if (!scheduleInputs[i].trim()) continue;
       try {
          const stylePrompt = scheduleStyle === 'realistic' ? 'A realistic, high-quality photograph' : 'A child-friendly, clean cartoon illustration on a white background';
          const prompt = `${stylePrompt} of a child performing the activity: "${scheduleInputs[i]}". Clear, highly visible, suitable for a special education visual schedule.`;

          const url = await fetchImagenWithRetry(prompt);
          setScheduleItems(prev => prev.map(item => item.id === i ? { ...item, status: 'success', url } : item));
       } catch {
          setScheduleItems(prev => prev.map(item => item.id === i ? { ...item, status: 'error' } : item));
       }
    }
    setIsGeneratingSchedule(false);
    setStatusMsg({ type: 'success', text: '4-Step visual schedule generated!' });
  };

  // --- Social Story Generator (LLM + Imagen) ---
  const handleGenerateSocialStory = async () => {
    if (!storyTopic.trim()) {
      setStatusMsg({ type: 'error', text: 'Enter a topic for the social story.' });
      return;
    }
    setIsGeneratingStory(true);
    setStatusMsg({ type: '', text: '' });
    setSocialStoryData(null);

    try {
      const prompt = `Act as an expert BCBA and special educator. Write a 4-page Social Story for a child${storyName ? ` named ${storyName}` : ''} about "${storyTopic}".
      Keep sentences short, positive, and written in the first person ('I will...', 'I can...'). Focus on positive replacement behaviors and coping strategies.
      For each page, provide the 'text' and a highly descriptive 'imagePrompt' for an AI image generator to create a simple, clean, flat-color child-friendly cartoon illustration matching the text on a solid white background.`;

      const schema = {
          type: "OBJECT",
          properties: {
              title: { type: "STRING" },
              pages: {
                  type: "ARRAY",
                  items: {
                      type: "OBJECT",
                      properties: {
                          text: { type: "STRING" },
                          imagePrompt: { type: "STRING" }
                      }
                  }
              }
          },
          required: ["title", "pages"]
      };

      const data = await fetchGeminiWithRetry(prompt, "Return valid JSON matching the schema.", schema);

      const pagesWithStatus = (data.pages || []).slice(0, 4).map((p, i) => ({ ...p, id: i, status: 'loading' }));
      setSocialStoryData({ title: data.title, pages: pagesWithStatus });

      for (let i = 0; i < pagesWithStatus.length; i++) {
          try {
              const imgUrl = await fetchImagenWithRetry(`Clean child-friendly cartoon illustration: ${pagesWithStatus[i].imagePrompt}. Solid white background, simple, flat colors, highly visible.`);
              setSocialStoryData(prev => ({
                  ...prev,
                  pages: prev.pages.map(p => p.id === i ? { ...p, status: 'success', imgUrl } : p)
              }));
          } catch {
              setSocialStoryData(prev => ({
                  ...prev,
                  pages: prev.pages.map(p => p.id === i ? { ...p, status: 'error' } : p)
              }));
          }
      }
      setStatusMsg({ type: 'success', text: "Social Story generated!" });
    } catch {
      setStatusMsg({ type: 'error', text: "Failed to generate social story." });
    } finally {
      setIsGeneratingStory(false);
    }
  };

  // --- Material Maker Handlers (DTT, NET, TA, PRT) ---
  const handleDraftClinicalPlan = async () => {
    if (!materialInput.trim()) {
      setStatusMsg({ type: 'error', text: "Please enter a skill or domain first." });
      return;
    }
    setIsDraftingPlan(true);
    setStatusMsg({ type: '', text: '' });

    try {
      if (activeTab === 'dtt') {
        const prompt = `Act as a BCBA. Draft 2 DTT programs for: "${materialInput}". Provide 2 distinct programs. Each needs: skill name, measurable goal, EXACTLY 10 specific discriminative stimuli (SDs), mastery criteria, and 2-3 reinforcers.`;
        const sysPrompt = "Return valid JSON. Schema: {programs: [{skill, goal, sds:[str], mastery, reinforcers}]} Ensure 2 programs, 10 SDs each. Keep strings concise.";
        const schema = { type: "OBJECT", properties: { programs: { type: "ARRAY", items: { type: "OBJECT", properties: { skill: {type:"STRING"}, goal: {type:"STRING"}, sds: { type: "ARRAY", items: { type: "STRING" } }, mastery: {type:"STRING"}, reinforcers: {type:"STRING"} } } } }, required: ["programs"] };
        const data = await fetchGeminiWithRetry(prompt, sysPrompt, schema);

        (data.programs || []).forEach((prog, pIdx) => {
          const p = pIdx + 1;
          if (p > 2) return;
          if (document.getElementById(`dtt-skill-${p}`)) document.getElementById(`dtt-skill-${p}`).textContent = prog.skill || "";
          if (document.getElementById(`dtt-goal-${p}`)) document.getElementById(`dtt-goal-${p}`).textContent = prog.goal || "";
          if (document.getElementById(`dtt-mastery-${p}`)) document.getElementById(`dtt-mastery-${p}`).textContent = prog.mastery || "";
          if (document.getElementById(`dtt-reinforcer-${p}`)) document.getElementById(`dtt-reinforcer-${p}`).textContent = prog.reinforcers || "";
          (prog.sds || []).forEach((sd, tIdx) => {
            if (tIdx < 10 && document.getElementById(`dtt-sd-${p}-${tIdx+1}`)) {
              document.getElementById(`dtt-sd-${p}-${tIdx+1}`).textContent = sd || "";
            }
          });
        });

      } else if (activeTab === 'net') {
        const prompt = `Act as a BCBA. Draft a 2-program NET data sheet for domain: "${materialInput}". Provide 2 distinct sub-programs. Each needs: skill name, goal, EXACTLY 10 opportunities (target response + natural context), motivators, and a generalization strategy.`;
        const sysPrompt = "Return valid JSON. Schema: {programs: [{skill, goal, opportunities:[{target, context}], motivators, generalization}]} Ensure 2 programs, 10 opps each. Keep strings concise.";
        const schema = { type: "OBJECT", properties: { programs: { type: "ARRAY", items: { type: "OBJECT", properties: { skill: {type:"STRING"}, goal: {type:"STRING"}, motivators: {type:"STRING"}, generalization: {type:"STRING"}, opportunities: { type: "ARRAY", items: { type: "OBJECT", properties: { target: {type:"STRING"}, context: {type:"STRING"} } } } } } } }, required: ["programs"] };
        const data = await fetchGeminiWithRetry(prompt, sysPrompt, schema);

        (data.programs || []).forEach((prog, pIdx) => {
          const p = pIdx + 1;
          if (p > 2) return;
          if (document.getElementById(`net-skill-${p}`)) document.getElementById(`net-skill-${p}`).textContent = prog.skill || "";
          if (document.getElementById(`net-goal-${p}`)) document.getElementById(`net-goal-${p}`).textContent = prog.goal || "";
          if (document.getElementById(`net-motivators-${p}`)) document.getElementById(`net-motivators-${p}`).textContent = prog.motivators || "";
          if (document.getElementById(`net-generalization-${p}`)) document.getElementById(`net-generalization-${p}`).textContent = prog.generalization || "";
          (prog.opportunities || []).forEach((opp, tIdx) => {
            if (tIdx < 10) {
              if (document.getElementById(`net-target-${p}-${tIdx+1}`)) document.getElementById(`net-target-${p}-${tIdx+1}`).textContent = opp.target || "";
              if (document.getElementById(`net-context-${p}-${tIdx+1}`)) document.getElementById(`net-context-${p}-${tIdx+1}`).textContent = opp.context || "";
            }
          });
        });

      } else if (activeTab === 'prt') {
        const prompt = `Act as a BCBA specializing in Pivotal Response Treatment (PRT). Draft 2 PRT programs for: "${materialInput}". Provide 2 distinct programs focusing on natural motivation. Each needs: skill name, goal, 10 PRT trials (child's choice/materials + target behavior), a natural consequence, and mastery criteria.`;
        const sysPrompt = "Return valid JSON. Schema: {programs: [{skill, goal, trials:[{choice, target}], consequence, mastery}]} Ensure 2 programs, 10 trials each. Keep strings concise.";
        const schema = { type: "OBJECT", properties: { programs: { type: "ARRAY", items: { type: "OBJECT", properties: { skill: {type:"STRING"}, goal: {type:"STRING"}, consequence: {type:"STRING"}, mastery: {type:"STRING"}, trials: { type: "ARRAY", items: { type: "OBJECT", properties: { choice: {type:"STRING"}, target: {type:"STRING"} } } } } } } }, required: ["programs"] };
        const data = await fetchGeminiWithRetry(prompt, sysPrompt, schema);

        (data.programs || []).forEach((prog, pIdx) => {
          const p = pIdx + 1;
          if (p > 2) return;
          if (document.getElementById(`prt-skill-${p}`)) document.getElementById(`prt-skill-${p}`).textContent = prog.skill || "";
          if (document.getElementById(`prt-goal-${p}`)) document.getElementById(`prt-goal-${p}`).textContent = prog.goal || "";
          if (document.getElementById(`prt-consequence-${p}`)) document.getElementById(`prt-consequence-${p}`).textContent = prog.consequence || "";
          if (document.getElementById(`prt-mastery-${p}`)) document.getElementById(`prt-mastery-${p}`).textContent = prog.mastery || "";
          (prog.trials || []).forEach((trial, tIdx) => {
            if (tIdx < 10) {
              if (document.getElementById(`prt-choice-${p}-${tIdx+1}`)) document.getElementById(`prt-choice-${p}-${tIdx+1}`).textContent = trial.choice || "";
              if (document.getElementById(`prt-target-${p}-${tIdx+1}`)) document.getElementById(`prt-target-${p}-${tIdx+1}`).textContent = trial.target || "";
            }
          });
        });

      } else if (activeTab === 'ta') {
        const prompt = `Act as a BCBA. Draft 2 Task Analyses (TA) for: "${materialInput}". Provide 2 distinct programs. Each needs: skill name, SD, chaining procedure, mastery criteria, and EXACTLY 10 sequential behavioral steps.`;
        const sysPrompt = "Return valid JSON. Schema: {programs: [{skill, sd, chaining, mastery, steps:[str]}]} Ensure 2 programs, 10 steps each.";
        const schema = { type: "OBJECT", properties: { programs: { type: "ARRAY", items: { type: "OBJECT", properties: { skill: {type:"STRING"}, sd: {type:"STRING"}, chaining: {type:"STRING"}, mastery: {type:"STRING"}, steps: { type: "ARRAY", items: { type: "STRING" } } } } } }, required: ["programs"] };
        const data = await fetchGeminiWithRetry(prompt, sysPrompt, schema);

        (data.programs || []).forEach((prog, pIdx) => {
          const p = pIdx + 1;
          if (p > 2) return;
          if (document.getElementById(`ta-skill-${p}`)) document.getElementById(`ta-skill-${p}`).textContent = prog.skill || "";
          if (document.getElementById(`ta-sd-${p}`)) document.getElementById(`ta-sd-${p}`).textContent = prog.sd || "";
          if (document.getElementById(`ta-chaining-${p}`)) document.getElementById(`ta-chaining-${p}`).textContent = prog.chaining || "";
          if (document.getElementById(`ta-mastery-${p}`)) document.getElementById(`ta-mastery-${p}`).textContent = prog.mastery || "";
          (prog.steps || []).forEach((step, tIdx) => {
            if (tIdx < 10 && document.getElementById(`ta-step-${p}-${tIdx+1}`)) {
              document.getElementById(`ta-step-${p}-${tIdx+1}`).textContent = step || "";
            }
          });
        });
      }
      setStatusMsg({ type: 'success', text: "Clinical Plan drafted successfully!" });
    } catch {
      setStatusMsg({ type: 'error', text: "Failed to draft plan. Check connection." });
    } finally {
      setIsDraftingPlan(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    let newCues = [];

    if (activeTab === 'dtt') {
      for (let p = 1; p <= 2; p++) {
        const skillName = document.getElementById(`dtt-skill-${p}`)?.textContent?.trim() || `Program ${p}`;
        for (let i = 1; i <= 10; i++) {
          const text = document.getElementById(`dtt-sd-${p}-${i}`)?.textContent?.trim();
          if (text) newCues.push({ primary: text, secondary: skillName, id: `dtt-${p}-${i}` });
        }
      }
    } else if (activeTab === 'net') {
      for (let p = 1; p <= 2; p++) {
        for (let t = 1; t <= 10; t++) {
          const target = document.getElementById(`net-target-${p}-${t}`)?.textContent?.trim();
          const context = document.getElementById(`net-context-${p}-${t}`)?.textContent?.trim();
          if (target) newCues.push({ primary: target, secondary: context, id: `net-${p}-${t}` });
        }
      }
    } else if (activeTab === 'prt') {
      for (let p = 1; p <= 2; p++) {
        for (let t = 1; t <= 10; t++) {
          const target = document.getElementById(`prt-target-${p}-${t}`)?.textContent?.trim();
          const choice = document.getElementById(`prt-choice-${p}-${t}`)?.textContent?.trim();
          if (target) newCues.push({ primary: target, secondary: choice, id: `prt-${p}-${t}` });
        }
      }
    } else if (activeTab === 'ta') {
      for (let p = 1; p <= 2; p++) {
        const skillName = document.getElementById(`ta-skill-${p}`)?.textContent?.trim() || `Program ${p}`;
        for (let t = 1; t <= 10; t++) {
          const step = document.getElementById(`ta-step-${p}-${t}`)?.textContent?.trim();
          if (step) newCues.push({ primary: step, secondary: skillName, label: t, id: `ta-${p}-${t}` });
        }
      }
    }

    if (newCues.length === 0) {
      setStatusMsg({ type: 'error', text: "No targets found. Fill out the table first." });
      return;
    }

    setIsGeneratingFlashcards(true);
    setStatusMsg({ type: '', text: '' });

    const initialFlashcards = newCues.map(c => ({ ...c, status: 'loading' }));
    setFlashcards(initialFlashcards);

    setTimeout(() => { document.getElementById('flashcards-container')?.scrollIntoView({ behavior: 'smooth' }); }, 100);

    for (let i = 0; i < newCues.length; i++) {
      const cue = newCues[i];
      try {
        let prompt = `A simple, clean, child-friendly illustration on a solid white background representing: "${cue.primary}". `;
        if (activeTab === 'net' || activeTab === 'prt') prompt += `Context/Material: "${cue.secondary}". `;
        if (activeTab === 'ta') prompt += `This is step ${cue.label} of "${cue.secondary}". `;
        prompt += "High contrast, flat colors, suitable for early childhood education visual prompting.";

        const imgUrl = await fetchImagenWithRetry(prompt);
        setFlashcards(prev => prev.map(f => f.id === cue.id ? { ...f, status: 'success', imgUrl } : f));
      } catch {
        setFlashcards(prev => prev.map(f => f.id === cue.id ? { ...f, status: 'error' } : f));
      }
    }

    setIsGeneratingFlashcards(false);
  };

  // --- Activity Maker Handlers ---
  const handleGenerateActivity = async () => {
    if (!activityTheme.trim()) {
      setStatusMsg({ type: 'error', text: "Please enter a theme or subject." });
      return;
    }

    setIsGeneratingActivity(true);
    setStatusMsg({ type: '', text: '' });
    setActivityData(null);

    try {
      if (activityType === 'craft') {
        const prompt = `Act as an early childhood educator. Create a simple arts and crafts activity about "${activityTheme}". Provide a fun title, exactly 3-4 basic materials, and EXACTLY 5 simple steps.`;
        const schema = {
            type: "OBJECT",
            properties: {
                title: { type: "STRING" },
                materials: { type: "ARRAY", items: { type: "STRING" } },
                steps: { type: "ARRAY", items: { type: "STRING" } }
            },
            required: ["title", "materials", "steps"]
        };
        const textData = await fetchGeminiWithRetry(prompt, "Return valid JSON matching the exact schema.", schema);

        const initialSteps = (textData.steps || []).slice(0,5).map((text, idx) => ({ id: idx, text, status: 'loading' }));
        setActivityData({ type: 'craft', title: textData.title, materials: textData.materials, steps: initialSteps });

        for (let i = 0; i < initialSteps.length; i++) {
            try {
                const imgPrompt = `A simple, clean, child-friendly illustration on a solid white background showing the craft step: "${initialSteps[i].text}". High contrast, flat colors, clear instruction, suitable for kindergarten arts and crafts. Focus purely on the action or objects described.`;
                const imgUrl = await fetchImagenWithRetry(imgPrompt);

                setActivityData(prev => {
                  const newSteps = [...prev.steps];
                  newSteps[i] = { ...newSteps[i], status: 'success', imgUrl };
                  return { ...prev, steps: newSteps };
                });
            } catch {
                setActivityData(prev => {
                  const newSteps = [...prev.steps];
                  newSteps[i] = { ...newSteps[i], status: 'error' };
                  return { ...prev, steps: newSteps };
                });
            }
        }
        setStatusMsg({ type: 'success', text: "5-Step Craft activity generated!" });

      } else {
        let prompt = `A black and white line art `;
        if (activityType === 'coloring') prompt += `coloring page for kindergarteners about: "${activityTheme}". `;
        if (activityType === 'maze') prompt += `children's maze puzzle featuring: "${activityTheme}". `;
        if (activityType === 'dots') prompt += `connect-the-dots puzzle for kids featuring: "${activityTheme}". `;
        if (activityType === 'cutout') prompt += `cut-and-paste paper activity sheet featuring: "${activityTheme}". It should have a background scene at the top, and dashed cut-out elements at the bottom. `;
        prompt += `Clean, simple, bold outlines, no shading, plain white background, child friendly.`;

        const imgUrl = await fetchImagenWithRetry(prompt);
        setActivityData({ type: 'worksheet', theme: activityTheme, url: imgUrl });
        setStatusMsg({ type: 'success', text: "Worksheet generated successfully!" });
      }
    } catch {
      setStatusMsg({ type: 'error', text: "Failed to generate activity. Check connection." });
    } finally {
      setIsGeneratingActivity(false);
    }
  };

  // --- Assistant Handlers ---
  const handleGeneratePlayIdeas = async () => {
    if (!childInterest.trim()) return;
    setIsGeneratingPlay(true);
    setStatusMsg({ type: '', text: '' });

    const prompt = `The child's current interest is: "${childInterest}". Generate 3 Natural Environment Teaching (NET) play activities and 2 Gross Motor activities incorporating this theme.`;
    const sysPrompt = "Act as a BCBA. Activities must be brief, safe for an indoor clinic, and highly engaging. Focus on Manding and Joint Attention.";
    const schema = { type: "OBJECT", properties: { net: { type: "ARRAY", items: { type: "STRING" } }, gross: { type: "ARRAY", items: { type: "STRING" } } }, required: ["net", "gross"] };

    try {
      const result = await fetchGeminiWithRetry(prompt, sysPrompt, schema);
      setNetPool(prev => [...result.net, ...prev]);
      setGrossMotorPool(prev => [...result.gross, ...prev]);
      setStatusMsg({ type: 'success', text: `Added 5 new "${childInterest}" activities!` });
      setChildInterest("");
    } catch {
      setStatusMsg({ type: 'error', text: "AI generation failed. Check connection." });
    } finally {
      setIsGeneratingPlay(false);
    }
  };

  const handleGenerateDttAssistant = async () => {
    if (!dttDomain.trim()) return;
    setIsGeneratingDttAssistant(true);
    setStatusMsg({ type: '', text: '' });

    const prompt = `Generate 6 specific, actionable Discrete Trial Training (DTT) targets for the skill domain: "${dttDomain}".`;
    const sysPrompt = "Act as a BCBA. Generate concise DTT targets (e.g., 'Touch the red car', 'What flies in the sky?').";
    const schema = { type: "OBJECT", properties: { targets: { type: "ARRAY", items: { type: "STRING" } } }, required: ["targets"] };

    try {
      const result = await fetchGeminiWithRetry(prompt, sysPrompt, schema);
      setGeneratedDttTargets(result.targets);
    } catch {
      setStatusMsg({ type: 'error', text: "Failed to generate targets." });
    } finally {
      setIsGeneratingDttAssistant(false);
    }
  };

  const triggerPrint = () => {
    setTimeout(() => { window.print(); }, 300);
  };

  // Quick-pick labels from config
  const dttQuickPicks = config?.dttQuickPicks || ['Colors', 'Body Parts', 'Manding'];
  const schedulePlaceholders = config?.schedulePlaceholders || ['Hang up coat', 'Wash Hands', 'Eat Snack', 'Play with Blocks'];

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 font-sans flex flex-col md:flex-row">
      <style>{`
        .animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-in { animation-name: fadeIn; }
        .zoom-in-95 { animation-name: zoomIn95; }
        .slide-in-from-bottom-4 { animation-name: slideInBottom4; }

        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInBottom4 { from { opacity: 0; transform: translateY(1rem); } to { opacity: 1; transform: translateY(0); } }

        /* Dynamic @page assignment based on activeTab */
        @page {
            size: ${activeTab === 'tokenboard' ? 'letter landscape' : 'letter portrait'};
            margin: ${activeTab === 'tokenboard' ? '0in' : '0.5in'};
        }

        @media print {
            body { background-color: #ffffff !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }

            /* Letter Standard Dimensions */
            .a4-container { display: block !important; box-shadow: none !important; margin: 0 auto !important; padding: 0 !important; width: 100% !important; border: none !important; border-radius: 0 !important; }

            /* Token Board specific forced landscape dimensions (11 x 8.5) */
            .print-landscape-container {
                width: 11in !important;
                height: 8.5in !important;
                max-width: 11in !important;
                max-height: 8.5in !important;
                padding: 0.5in !important;
                overflow: hidden !important;
                page-break-after: always;
                display: flex !important;
                flex-direction: column !important;
            }

            .ta-program-block, .net-program-block, .prt-program-block { height: 135mm !important; page-break-inside: avoid; }
            .flashcards-page { page-break-before: always; height: auto !important; min-height: auto !important; }
            .flashcard, .craft-step-row, .social-story-page { page-break-inside: avoid; }
            [contenteditable]:empty::before { content: ""; }

            /* Hide inactive views during print */
            .view-schedule, .view-dtt, .view-net, .view-ta, .view-prt, .view-activities, .view-tokenboard, .view-socialstory { display: none !important; }
            .active-print-view { display: flex !important; }
        }
        .fill-line { border-bottom: 1px solid #000000; flex-grow: 1; margin-left: 0.25rem; min-height: 1.25rem; outline: none; padding: 0 0.25rem; word-break: break-word; }
        [contenteditable="true"]:hover { background-color: rgba(0, 0, 0, 0.04); }
        [contenteditable="true"]:focus { background-color: rgba(0, 0, 0, 0.08); }
        [contenteditable]:empty::before { content: attr(data-placeholder); color: #9ca3af; font-style: italic; font-size: 0.85em; }

        /* Vamp Up Styles */
        .glass-panel { background: rgba(30, 41, 59, 0.7); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); }
        .neon-shadow-indigo { box-shadow: 0 0 15px rgba(79, 70, 229, 0.4); }
        .neon-shadow-teal { box-shadow: 0 0 15px rgba(13, 148, 136, 0.4); }
        .gradient-text { background-clip: text; -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>

      {/* --- SIDEBAR --- */}
      <aside className="no-print w-full md:w-[360px] bg-[#0F172A] text-white p-6 shadow-2xl flex flex-col md:fixed h-full left-0 z-40 overflow-y-auto border-r border-slate-800 custom-scrollbar">
        <h2 className="text-2xl font-black mb-1 flex items-center gap-2">
            <BrainCircuit className="w-7 h-7 text-indigo-400"/>
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 gradient-text">ABA Master</span>
        </h2>
        <p className="text-slate-400 text-xs mb-8 font-medium tracking-wide uppercase">AI-Powered Clinical Suite</p>

        {/* Modular Tabs Grid */}
        <div className="flex flex-col gap-3 mb-8 border-b border-slate-800 pb-8">
            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Visual Tools</span>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveTab('tokenboard')} className={`p-3 text-xs font-bold rounded-xl transition-all duration-300 ${activeTab === 'tokenboard' ? 'bg-indigo-600 text-white neon-shadow-indigo border-transparent' : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Star className={`w-5 h-5 mx-auto mb-1.5 ${activeTab === 'tokenboard' ? 'text-white' : 'text-indigo-400'}`}/> Token Board
                </button>
                <button onClick={() => setActiveTab('schedule')} className={`p-3 text-xs font-bold rounded-xl transition-all duration-300 ${activeTab === 'schedule' ? 'bg-indigo-600 text-white neon-shadow-indigo border-transparent' : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Calendar className={`w-5 h-5 mx-auto mb-1.5 ${activeTab === 'schedule' ? 'text-white' : 'text-indigo-400'}`}/> Schedule
                </button>
                <button onClick={() => setActiveTab('socialstory')} className={`col-span-2 p-3 text-xs font-bold rounded-xl transition-all duration-300 ${activeTab === 'socialstory' ? 'bg-indigo-600 text-white neon-shadow-indigo border-transparent' : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <BookOpen className={`w-5 h-5 mx-auto mb-1.5 ${activeTab === 'socialstory' ? 'text-white' : 'text-indigo-400'}`}/> Social Story Generator
                </button>
                <button onClick={() => setActiveTab('activities')} className={`col-span-2 p-3 text-xs font-bold rounded-xl transition-all duration-300 ${activeTab === 'activities' ? 'bg-teal-600 text-white neon-shadow-teal border-transparent' : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800'}`}>
                    <Scissors className={`w-5 h-5 mx-auto mb-1.5 ${activeTab === 'activities' ? 'text-white' : 'text-teal-400'}`}/> Activity Maker
                </button>
            </div>

            <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider mt-4">Clinical Data Sheets</span>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setActiveTab('dtt')} className={`p-3 text-[11px] font-bold rounded-xl transition-all duration-300 ${activeTab === 'dtt' ? 'bg-indigo-600 text-white neon-shadow-indigo border-transparent' : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800'}`}><LayoutGrid className={`w-4 h-4 mx-auto mb-1 ${activeTab === 'dtt' ? 'text-white' : 'text-slate-500'}`}/> DTT (Dual)</button>
                <button onClick={() => setActiveTab('net')} className={`p-3 text-[11px] font-bold rounded-xl transition-all duration-300 ${activeTab === 'net' ? 'bg-indigo-600 text-white neon-shadow-indigo border-transparent' : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800'}`}><Sparkles className={`w-4 h-4 mx-auto mb-1 ${activeTab === 'net' ? 'text-white' : 'text-slate-500'}`}/> NET (Dual)</button>
                <button onClick={() => setActiveTab('ta')} className={`p-3 text-[11px] font-bold rounded-xl transition-all duration-300 ${activeTab === 'ta' ? 'bg-indigo-600 text-white neon-shadow-indigo border-transparent' : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800'}`}><ListChecks className={`w-4 h-4 mx-auto mb-1 ${activeTab === 'ta' ? 'text-white' : 'text-slate-500'}`}/> Task Analysis</button>
                <button onClick={() => setActiveTab('prt')} className={`p-3 text-[11px] font-bold rounded-xl transition-all duration-300 ${activeTab === 'prt' ? 'bg-indigo-600 text-white neon-shadow-indigo border-transparent' : 'glass-panel text-slate-400 hover:text-white hover:bg-slate-800'}`}><Target className={`w-4 h-4 mx-auto mb-1 ${activeTab === 'prt' ? 'text-white' : 'text-slate-500'}`}/> PRT (Dual)</button>
            </div>
        </div>

        {/* Status Message */}
        {statusMsg.text && (
          <div className={`flex items-start gap-3 p-4 rounded-xl border mb-6 text-sm shadow-lg animate-in fade-in slide-in-from-bottom-4 ${statusMsg.type === 'success' ? 'bg-emerald-900/40 border-emerald-800/50 text-emerald-300' : 'bg-rose-900/40 border-rose-800/50 text-rose-300'}`}>
            {statusMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <p className="leading-snug font-medium">{statusMsg.text}</p>
          </div>
        )}

        <div className="space-y-4 mb-6 flex-grow animate-in fade-in duration-500">

          {/* Token Board Tool */}
          {activeTab === 'tokenboard' && (
            <div className="glass-panel rounded-2xl p-5 space-y-5 border border-indigo-500/30">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-indigo-400" /> Print-Ready Artistic Board
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">Generates a stunning, full-bleed scenic background and matching tokens designed perfectly for US Letter Landscape printing.</p>
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Child&apos;s Interest / Theme</label>
                <VoiceInput
                  value={tokenTheme}
                  onChange={(e) => setTokenTheme(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="e.g., Deep Space, Dinosaurs..."
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Target Reward (Optional)</label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <VoiceInput
                      value={rewardTheme}
                      onChange={(e) => setRewardTheme(e.target.value)}
                      className="bg-slate-900/50 border-slate-700 text-white"
                      placeholder="e.g., iPad, Piggy back ride..."
                    />
                  </div>
                  <button
                    onClick={handleGenerateReward}
                    disabled={isGeneratingReward || !rewardTheme.trim()}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/25 flex items-center justify-center disabled:opacity-50 h-[54px] shrink-0"
                    title="Generate Reward Visual"
                  >
                    {isGeneratingReward ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button onClick={handleGenerateTokenBoard} disabled={isGeneratingTokenBoard} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                {isGeneratingTokenBoard ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Engineer Token Board'}
              </button>
            </div>
          )}

          {/* Social Story Generator Tool */}
          {activeTab === 'socialstory' && (
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                 <BookOpen className="w-4 h-4 text-indigo-400"/> Social Story Generator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">Use AI to generate a 4-page visual social story focusing on positive replacement behaviors.</p>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Child&apos;s Name (Optional)</label>
                <VoiceInput
                  value={storyName}
                  onChange={(e) => setStoryName(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="e.g., Jimmy"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Topic / Challenge</label>
                <VoiceTextArea
                  value={storyTopic}
                  onChange={(e) => setStoryTopic(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder="e.g., Going to the dentist, Sharing toys..."
                />
              </div>

              <button onClick={handleGenerateSocialStory} disabled={isGeneratingStory} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                {isGeneratingStory ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Social Story'}
              </button>
            </div>
          )}

          {/* 4-Step Visual Schedule Tool */}
          {activeTab === 'schedule' && (
            <div className="glass-panel rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                 <ImageIcon className="w-4 h-4 text-indigo-400"/> 4-Step Visual Schedule
              </h3>

              {[0, 1, 2, 3].map((i) => (
                <div key={i}>
                  <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Activity {i + 1}</label>
                  <VoiceInput
                    value={scheduleInputs[i]}
                    onChange={(e) => {
                      const newInputs = [...scheduleInputs];
                      newInputs[i] = e.target.value;
                      setScheduleInputs(newInputs);
                    }}
                    className="bg-slate-900/50 border-slate-700 text-white"
                    placeholder={`e.g., ${schedulePlaceholders[i]}`}
                  />
                </div>
              ))}

              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <label className="block text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wide">Image Style</label>
                <select
                  value={scheduleStyle}
                  onChange={(e) => setScheduleStyle(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                >
                  <option value="cartoon">Cartoon / Illustration</option>
                  <option value="realistic">Realistic Photography</option>
                </select>
              </div>

              <button onClick={handleGenerateCustomSchedule} disabled={isGeneratingSchedule} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-4">
                {isGeneratingSchedule ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Visuals'}
              </button>
            </div>
          )}

          {/* Activity Maker specific tools */}
          {activeTab === 'activities' && (
            <div className="glass-panel rounded-2xl p-5 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Activity Type</label>
                <select
                  value={activityType}
                  onChange={(e) => setActivityType(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900/50 border border-slate-700 text-white text-sm focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                >
                  <option value="coloring">Coloring Page / Line Art</option>
                  <option value="maze">Simple Maze</option>
                  <option value="dots">Connect the Dots</option>
                  <option value="cutout">Cut-and-Paste Scene</option>
                  <option value="craft">5-Step Craft (w/ Visuals)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Theme / Subject</label>
                <VoiceInput
                  value={activityTheme}
                  onChange={(e) => setActivityTheme(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder={activityType === 'craft' ? 'e.g., Paper Plate Apple' : 'e.g., Under the Sea, Dinosaurs'}
                />
              </div>

              <button onClick={handleGenerateActivity} disabled={isGeneratingActivity || !activityTheme} className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-teal-500/25 flex items-center justify-center gap-2 disabled:opacity-50 mt-2">
                {isGeneratingActivity ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Generate Activity'}
              </button>
            </div>
          )}

          {/* Clinical Planner specific tools */}
          {['dtt', 'net', 'ta', 'prt'].includes(activeTab) && (
            <div className="glass-panel rounded-2xl p-5 space-y-5">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 mb-2 uppercase tracking-wide">
                  {activeTab === 'dtt' ? 'Target Skills (Input 2)' : activeTab === 'net' ? 'Broad Skill Domain' : activeTab === 'prt' ? 'PRT Themes (Input 2)' : 'Complex Skills (Input 2)'}
                </label>
                <VoiceInput
                  value={materialInput}
                  onChange={(e) => setMaterialInput(e.target.value)}
                  className="bg-slate-900/50 border-slate-700 text-white"
                  placeholder={activeTab === 'dtt' ? 'e.g., Colors & Shapes' : activeTab === 'net' ? 'e.g., Early Communication' : activeTab === 'prt' ? 'e.g., Cars & Blocks' : 'e.g., Wash Hands & Bed Making'}
                />
              </div>

              <button onClick={handleDraftClinicalPlan} disabled={isDraftingPlan || !materialInput} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 flex items-center justify-center gap-2 disabled:opacity-50">
                {isDraftingPlan ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Auto-Draft Forms'}
              </button>

              <button onClick={handleGenerateFlashcards} disabled={isGeneratingFlashcards} className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-bold py-3.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                {isGeneratingFlashcards ? <Loader2 className="w-5 h-5 animate-spin" /> : activeTab === 'ta' ? 'Visual Schedule Cards' : 'Generate Flashcards'}
              </button>
            </div>
          )}

          {/* Engagement Booster / Target Ideas Tools (for specific tabs) */}
          {['dtt', 'schedule'].includes(activeTab) && (
             <div className="glass-panel rounded-2xl p-5 space-y-4 border border-indigo-500/30 mt-4">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs mb-1 flex items-center gap-2">
                   {activeTab === 'schedule' ? <><Sparkles className="w-4 h-4 text-amber-400"/> Engagement Booster</> : <><Lightbulb className="w-4 h-4 text-amber-400"/> DTT Target Ideas</>}
                </h3>
                {activeTab === 'schedule' ? (
                   <>
                     <VoiceInput
                       value={childInterest}
                       onChange={(e) => setChildInterest(e.target.value)}
                       className="bg-slate-900/50 border-slate-700 text-white"
                       placeholder="e.g., Bluey, Excavators..."
                     />
                     <button onClick={handleGeneratePlayIdeas} disabled={isGeneratingPlay || !childInterest} className="w-full flex justify-center items-center gap-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-50 transition-all">
                        {isGeneratingPlay ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />} Add to Pool
                     </button>
                     {(netPool.length > 6 || grossMotorPool.length > 5) && <p className="text-xs text-emerald-400 font-medium">Added to randomizer pools!</p>}
                   </>
                ) : (
                   <>
                     <div className="flex gap-1.5 flex-wrap mb-2">
                        {dttQuickPicks.map(d => (
                           <button key={d} onClick={() => {setDttDomain(d); handleGenerateDttAssistant();}} className="px-2 py-1 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold hover:bg-slate-700 transition-colors border border-slate-700">{d}</button>
                        ))}
                     </div>
                     <VoiceInput
                       value={dttDomain}
                       onChange={(e) => setDttDomain(e.target.value)}
                       className="bg-slate-900/50 border-slate-700 text-white"
                       placeholder="Custom Domain..."
                     />
                     <button onClick={handleGenerateDttAssistant} disabled={isGeneratingDttAssistant || !dttDomain} className="w-full flex justify-center items-center gap-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold disabled:opacity-50 transition-all">
                        {isGeneratingDttAssistant ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Get Ideas'}
                     </button>
                     {generatedDttTargets.length > 0 && (
                        <ul className="space-y-1.5 mt-2 bg-slate-900/80 p-3 rounded-xl border border-slate-700">
                           {generatedDttTargets.map((t, i) => <li key={i} className="text-xs text-indigo-300 flex items-start gap-1"><span className="text-indigo-500">-</span> <span className="leading-tight">{t}</span></li>)}
                        </ul>
                     )}
                   </>
                )}
             </div>
          )}

        </div>

        {/* Global Print Button */}
        <button onClick={triggerPrint} className="mt-auto w-full bg-white text-slate-900 font-extrabold py-3.5 px-4 rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
          <Printer className="w-5 h-5" /> Print Current View
        </button>
      </aside>

      {/* --- MAIN CONTENT CANVAS --- */}
      <main className="flex-grow flex flex-col items-center py-6 md:py-10 md:pl-[360px] px-4 w-full h-full overflow-y-auto custom-scrollbar">

        {/* VIEW: TOKEN BOARD (10-Piece Interactive & Printable) */}
        <div className={`view-tokenboard flex-col items-center justify-center w-full max-w-5xl flex-grow ${activeTab === 'tokenboard' ? 'flex active-print-view' : 'hidden'}`}>
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
        </div>

        {/* VIEW: SCHEDULE (4-Step Visual Schedule) */}
        <div className={`view-schedule flex-col w-full max-w-4xl ${activeTab === 'schedule' ? 'flex active-print-view' : 'hidden'}`}>
          <div className="a4-container p-10 bg-white shadow-xl rounded-3xl print:shadow-none print:rounded-none transition-all">
             <h1 className="text-4xl font-extrabold uppercase tracking-widest text-center border-b-8 border-black pb-6 mb-8 text-slate-800">My Schedule</h1>

             <div className="flex flex-col gap-6 flex-grow">
               {scheduleItems.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full opacity-30 text-center no-print">
                    <Calendar className="w-24 h-24 mb-4 text-black" />
                    <p className="text-2xl font-bold uppercase tracking-widest">No Schedule Generated</p>
                    <p className="text-lg font-medium">Use the sidebar to create your 4-step visual schedule.</p>
                 </div>
               ) : (
                 scheduleItems.map((item, idx) => (
                   <div key={idx} className="flex items-center gap-6 border-8 border-black p-4 rounded-3xl bg-white shadow-sm flex-1 hover:bg-slate-50 transition-colors">
                     <div className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center text-3xl font-extrabold shrink-0 border-4 border-black print:bg-white print:text-black">
                        {idx + 1}
                     </div>

                     <div className="w-36 h-36 border-4 border-dashed border-slate-300 rounded-2xl flex items-center justify-center overflow-hidden shrink-0 bg-slate-50 print:border-black">
                        {item.status === 'loading' && <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />}
                        {item.status === 'success' && <img src={item.url} alt={item.text} className="w-full h-full object-cover" />}
                        {item.status === 'error' && <span className="font-bold text-slate-400 uppercase text-xs">Error</span>}
                        {item.status === 'empty' && <span className="font-bold text-slate-300 uppercase text-xs">Blank</span>}
                     </div>

                     <div className="text-3xl md:text-4xl font-extrabold uppercase text-slate-800 leading-tight flex-grow" contentEditable suppressContentEditableWarning>
                        {item.text || '_________________'}
                     </div>
                   </div>
                 ))
               )}
             </div>
          </div>
        </div>

        {/* VIEW: SOCIAL STORY */}
        <div className={`view-socialstory flex-col items-center w-full max-w-5xl flex-grow ${activeTab === 'socialstory' ? 'flex active-print-view' : 'hidden'}`}>
            {!socialStoryData && !isGeneratingStory && (
                <div className="flex flex-col items-center justify-center h-[50vh] opacity-30 text-center no-print">
                   <BookOpen className="w-24 h-24 mb-4 text-black" />
                   <p className="text-2xl font-bold uppercase tracking-widest">No Story Generated</p>
                   <p className="text-lg font-medium">Use the sidebar to auto-generate a personalized social story.</p>
                </div>
            )}

            {isGeneratingStory && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center no-print">
                   <Loader2 className="w-20 h-20 mb-4 text-indigo-600 animate-spin" />
                   <p className="text-2xl font-bold uppercase tracking-widest text-indigo-900">Crafting Story & Illustrations...</p>
                   <p className="text-lg font-medium text-slate-500 animate-pulse">Consulting clinical core and rendering visuals via Imagen.</p>
                </div>
            )}

            {socialStoryData && !isGeneratingStory && (
                <div className="a4-container bg-white shadow-xl rounded-2xl print:shadow-none print:rounded-none flex flex-col p-8 print:p-0 transition-all animate-in zoom-in-95 duration-500">
                    <h1 className="text-3xl font-black text-center mb-6 border-b-4 border-slate-800 pb-4" contentEditable suppressContentEditableWarning>{socialStoryData.title}</h1>
                    <div className="grid grid-cols-2 gap-6 flex-grow">
                        {socialStoryData.pages.map(page => (
                            <div key={page.id} className="social-story-page border-4 border-slate-800 rounded-2xl p-4 flex flex-col h-full text-center hover:bg-slate-50 transition-colors">
                                <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-xl mb-4 border-2 border-dashed border-slate-300 overflow-hidden relative">
                                    {page.status === 'loading' && <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />}
                                    {page.status === 'success' && <img src={page.imgUrl} className="object-cover w-full h-full" alt="Story Illustration" />}
                                    {page.status === 'error' && <span className="text-slate-400 font-bold uppercase text-xs">Image Generation Failed</span>}
                                </div>
                                <p className="text-xl font-bold text-slate-800 leading-snug" contentEditable suppressContentEditableWarning>{page.text}</p>
                                <span className="text-slate-400 font-bold mt-2 uppercase tracking-widest text-[10px]">Page {page.id + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* VIEW: DTT (DUAL) */}
        <div className={`view-dtt flex-col items-center w-full ${activeTab === 'dtt' ? 'flex active-print-view' : 'hidden'}`}>
          <div className="a4-container p-6 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
            <header className="mb-2 flex justify-between items-end border-b-4 border-slate-800 pb-2">
                <h1 className="text-2xl font-black uppercase tracking-widest whitespace-nowrap text-slate-900">Discrete Trial Training</h1>
                <div className="flex gap-4 w-1/2">
                    <div className="flex items-end flex-grow"><span className="font-bold uppercase text-[10px] text-slate-500">Child:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                    <div className="flex items-end w-1/3"><span className="font-bold uppercase text-[10px] text-slate-500">Date:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                </div>
            </header>
            <div className="flex-grow flex flex-col justify-between">
              {[1, 2].map(p => (
                <React.Fragment key={p}>
                  {p === 2 && <div className="w-full border-t-4 border-dashed border-slate-300 my-4 no-print"></div>}
                  <div className="ta-program-block p-1 relative flex flex-col flex-grow w-full box-border">
                      <div className="grid grid-cols-12 gap-x-3 gap-y-1 mb-2">
                          <div className="col-span-12 flex items-end"><span className="font-extrabold text-xs uppercase whitespace-nowrap text-indigo-900 mr-2">Skill Area:</span><div id={`dtt-skill-${p}`} className="fill-line text-sm font-bold border-b-2 text-slate-800" contentEditable suppressContentEditableWarning data-placeholder="e.g. Color Identification"></div></div>
                          <div className="col-span-12 flex items-end mt-1"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Target Goal:</span><div id={`dtt-goal-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="Measurable goal..."></div></div>
                      </div>
                      <table className="w-full flex-grow mb-1">
                          <thead>
                              <tr className="bg-slate-100 print:bg-transparent">
                                  <th rowSpan="2" className="p-1 w-8 text-center text-[10px] font-black uppercase border-b-2 border-slate-800 align-bottom">Trial</th>
                                  <th rowSpan="2" className="p-1 w-[40%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Instruction (S<sup>D</sup>)</th>
                                  <th colSpan="3" className="p-1 text-center text-[10px] font-black uppercase border-b border-slate-800">Child Response</th>
                                  <th rowSpan="2" className="p-1 w-[20%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Notes</th>
                              </tr>
                              <tr className="bg-slate-100 print:bg-transparent">
                                  <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Ind</th>
                                  <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Prm</th>
                                  <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Err</th>
                              </tr>
                          </thead>
                          <tbody>
                              {[1,2,3,4,5,6,7,8,9,10].map(i => (
                                <tr key={i} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-1 text-center font-bold text-[11px] text-slate-400">{i}</td>
                                    <td className="p-1"><div id={`dtt-sd-${p}-${i}`} contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[12px] leading-tight font-medium text-slate-800"></div></td>
                                    <td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                                    <td className="p-1"><div contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[11px]"></div></td>
                                </tr>
                              ))}
                          </tbody>
                          <tfoot className="border-t-2 border-slate-800 bg-slate-50 print:bg-transparent">
                              <tr>
                                  <td colSpan="2" className="p-1 pr-2 text-right font-bold uppercase text-[10px] tracking-wide align-middle text-slate-600">Session Totals</td>
                                  <td colSpan="3" className="p-1">
                                      <div className="flex justify-around items-center">
                                          <div className="flex items-end gap-1"><div contentEditable suppressContentEditableWarning className="border-b border-slate-800 w-6 text-center text-[10px] font-bold min-h-[14px] outline-none bg-white print:bg-transparent"></div><span className="font-bold text-[9px] text-slate-500">/ 10</span></div>
                                          <div className="flex items-end gap-1"><div contentEditable suppressContentEditableWarning className="border-b border-slate-800 w-8 text-center text-[10px] font-bold min-h-[14px] outline-none bg-white print:bg-transparent"></div><span className="font-bold text-[9px] text-slate-500">%</span></div>
                                      </div>
                                  </td>
                                  <td></td>
                              </tr>
                          </tfoot>
                      </table>
                      <div className="grid grid-cols-2 gap-4 mt-auto pt-1 border-t border-dashed border-slate-300">
                          <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Mastery:</span><div id={`dtt-mastery-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                          <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Reinforcers:</span><div id={`dtt-reinforcer-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                      </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* VIEW: NET (DUAL) */}
        <div className={`view-net flex-col items-center w-full ${activeTab === 'net' ? 'flex active-print-view' : 'hidden'}`}>
          <div className="a4-container p-6 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
            <header className="mb-2 flex justify-between items-end border-b-4 border-slate-800 pb-2">
                <h1 className="text-2xl font-black uppercase tracking-widest whitespace-nowrap text-slate-900">NET Data Sheet</h1>
                <div className="flex gap-4 w-1/2">
                    <div className="flex items-end flex-grow"><span className="font-bold uppercase text-[10px] text-slate-500">Child:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                    <div className="flex items-end w-1/3"><span className="font-bold uppercase text-[10px] text-slate-500">Date:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                </div>
            </header>
            <div className="flex-grow flex flex-col justify-between">
              {[1, 2].map(p => (
                <React.Fragment key={p}>
                  {p === 2 && <div className="w-full border-t-4 border-dashed border-slate-300 my-4 no-print"></div>}
                  <div className="net-program-block p-1 relative flex flex-col flex-grow w-full box-border">
                      <div className="grid grid-cols-12 gap-x-3 gap-y-1 mb-2">
                          <div className="col-span-12 flex items-end"><span className="font-extrabold text-xs uppercase whitespace-nowrap text-indigo-900 mr-2">Skill Area:</span><div id={`net-skill-${p}`} className="fill-line text-sm font-bold border-b-2 text-slate-800" contentEditable suppressContentEditableWarning data-placeholder="e.g. Manding"></div></div>
                          <div className="col-span-12 flex items-end mt-1"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Target Goal:</span><div id={`net-goal-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="Measurable goal..."></div></div>
                      </div>
                      <table className="w-full flex-grow mb-1">
                          <thead>
                              <tr className="bg-slate-100 print:bg-transparent">
                                  <th className="p-1 w-6 text-center text-[9px] font-black uppercase border-b-2 border-slate-800 align-bottom">#</th>
                                  <th className="p-1 w-[35%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Target Response</th>
                                  <th className="p-1 w-[40%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Activity / Context</th>
                                  <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Ind</th>
                                  <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Prm</th>
                                  <th className="p-1 w-8 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Err</th>
                              </tr>
                          </thead>
                          <tbody>
                              {[1,2,3,4,5,6,7,8,9,10].map(t => (
                                <tr key={t} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-1 text-center font-bold text-[11px] text-slate-400">{t}</td>
                                    <td className="p-1"><div id={`net-target-${p}-${t}`} contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[12px] leading-tight font-medium text-slate-800"></div></td>
                                    <td className="p-1"><div id={`net-context-${p}-${t}`} contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[11px] leading-tight text-slate-600"></div></td>
                                    <td className="p-1"></td><td className="p-1"></td><td className="p-1"></td>
                                </tr>
                              ))}
                          </tbody>
                      </table>
                      <div className="grid grid-cols-2 gap-4 mt-auto pt-1 border-t border-dashed border-slate-300">
                          <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Motivators:</span><div id={`net-motivators-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                          <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Generalization:</span><div id={`net-generalization-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                      </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* VIEW: PRT (DUAL) */}
        <div className={`view-prt flex-col items-center w-full ${activeTab === 'prt' ? 'flex active-print-view' : 'hidden'}`}>
          <div className="a4-container p-6 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
            <header className="mb-2 flex justify-between items-end border-b-4 border-slate-800 pb-2">
                <h1 className="text-2xl font-black uppercase tracking-widest whitespace-nowrap text-slate-900">Pivotal Response (PRT)</h1>
                <div className="flex gap-4 w-1/2">
                    <div className="flex items-end flex-grow"><span className="font-bold uppercase text-[10px] text-slate-500">Child:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                    <div className="flex items-end w-1/3"><span className="font-bold uppercase text-[10px] text-slate-500">Date:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                </div>
            </header>
            <div className="flex-grow flex flex-col justify-between">
              {[1, 2].map(p => (
                <React.Fragment key={p}>
                  {p === 2 && <div className="w-full border-t-4 border-dashed border-slate-300 my-4 no-print"></div>}
                  <div className="prt-program-block p-1 relative flex flex-col flex-grow w-full box-border">
                      <div className="grid grid-cols-12 gap-x-3 gap-y-1 mb-2">
                          <div className="col-span-12 flex items-end"><span className="font-extrabold text-xs uppercase whitespace-nowrap text-indigo-900 mr-2">Target Skill:</span><div id={`prt-skill-${p}`} className="fill-line text-sm font-bold border-b-2 text-slate-800" contentEditable suppressContentEditableWarning data-placeholder="e.g. Social Initiations"></div></div>
                          <div className="col-span-12 flex items-end mt-1"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Target Goal:</span><div id={`prt-goal-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="Measurable goal..."></div></div>
                      </div>
                      <table className="w-full flex-grow mb-1">
                          <thead>
                              <tr className="bg-slate-100 print:bg-transparent">
                                  <th rowSpan="2" className="p-1 w-6 text-center text-[10px] font-black uppercase border-b-2 border-slate-800 align-bottom">#</th>
                                  <th rowSpan="2" className="p-1 w-[30%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Child&apos;s Choice (Item)</th>
                                  <th rowSpan="2" className="p-1 w-[35%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 align-bottom">Target Behavior</th>
                                  <th colSpan="2" className="p-1 text-center text-[10px] font-black uppercase border-b border-slate-800">Response (+/-)</th>
                              </tr>
                              <tr className="bg-slate-100 print:bg-transparent">
                                  <th className="p-1 w-10 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Attmpt</th>
                                  <th className="p-1 w-10 text-center text-[9px] font-bold uppercase border-b-2 border-slate-800">Succss</th>
                              </tr>
                          </thead>
                          <tbody>
                              {[1,2,3,4,5,6,7,8,9,10].map(t => (
                                <tr key={t} className="hover:bg-slate-50 transition-colors">
                                    <td className="p-1 text-center font-bold text-[11px] text-slate-400">{t}</td>
                                    <td className="p-1"><div id={`prt-choice-${p}-${t}`} contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[12px] leading-tight font-medium text-slate-600"></div></td>
                                    <td className="p-1"><div id={`prt-target-${p}-${t}`} contentEditable suppressContentEditableWarning className="w-full min-h-[14px] text-[12px] leading-tight font-medium text-slate-800"></div></td>
                                    <td className="p-1"></td><td className="p-1"></td>
                                </tr>
                              ))}
                          </tbody>
                      </table>
                      <div className="grid grid-cols-2 gap-4 mt-auto pt-1 border-t border-dashed border-slate-300">
                          <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Natural Consequece:</span><div id={`prt-consequence-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                          <div className="flex items-end"><span className="font-bold text-[9px] uppercase whitespace-nowrap text-slate-500 mr-1">Mastery Criteria:</span><div id={`prt-mastery-${p}`} className="fill-line text-[10px] font-medium text-slate-700" contentEditable suppressContentEditableWarning></div></div>
                      </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* VIEW: TA (DUAL) */}
        <div className={`view-ta flex-col items-center w-full ${activeTab === 'ta' ? 'flex active-print-view' : 'hidden'}`}>
          <div className="a4-container p-6 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
            <header className="mb-2 flex justify-between items-end border-b-4 border-slate-800 pb-2">
                <h1 className="text-2xl font-black uppercase tracking-widest whitespace-nowrap text-slate-900">Task Analysis (TA)</h1>
                <div className="flex gap-4 w-1/2">
                    <div className="flex items-end flex-grow"><span className="font-bold uppercase text-[10px] text-slate-500">Child:</span><div className="fill-line" contentEditable suppressContentEditableWarning></div></div>
                </div>
            </header>
            <div className="flex-grow flex flex-col justify-between">
              {[1, 2].map(p => (
                <React.Fragment key={p}>
                  {p === 2 && <div className="w-full border-t-4 border-dashed border-slate-300 my-4 no-print"></div>}
                  <div className="ta-program-block p-1 relative flex flex-col w-full box-border">
                      <div className="grid grid-cols-12 gap-x-3 gap-y-1 mb-2">
                          <div className="col-span-12 flex items-end"><span className="font-extrabold text-xs uppercase whitespace-nowrap text-indigo-900 mr-2">Target Skill:</span><div id={`ta-skill-${p}`} className="fill-line text-sm font-bold border-b-2 text-slate-800" contentEditable suppressContentEditableWarning data-placeholder="e.g. Hand Washing"></div></div>
                          <div className="col-span-5 flex items-end"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Instruction (S<sup>D</sup>):</span><div id={`ta-sd-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder='"Wash your hands"'></div></div>
                          <div className="col-span-4 flex items-end"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Chaining:</span><div id={`ta-chaining-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="Total Task"></div></div>
                          <div className="col-span-3 flex items-end"><span className="font-bold text-[10px] uppercase whitespace-nowrap text-slate-500">Mastery:</span><div id={`ta-mastery-${p}`} className="fill-line text-[11px] font-medium text-slate-700" contentEditable suppressContentEditableWarning data-placeholder="100% Ind x 3"></div></div>
                      </div>
                      <div className="w-full text-center mb-1 text-[9px] font-bold tracking-wide border border-slate-800 py-0.5 bg-slate-100 text-slate-600 print:bg-transparent">
                          PROMPT KEY: [I]=Independent | [G]=Gestural | [V]=Verbal | [M]=Model | [P]=Physical | [-]=Error
                      </div>
                      <table className="w-full flex-grow">
                          <thead>
                              <tr className="bg-slate-100 print:bg-transparent">
                                  <th rowSpan="2" className="p-1 w-6 text-center text-[10px] font-black uppercase border-b-2 border-slate-800 border-r-2 align-bottom">#</th>
                                  <th rowSpan="2" className="p-1 w-[46%] text-left text-[11px] font-black uppercase border-b-2 border-slate-800 border-r-2 align-bottom">Task Step (Behavioral Chain)</th>
                                  <th colSpan="5" className="p-1 text-center text-[10px] font-black uppercase border-b border-slate-800 tracking-wide">Prompt Level Recorded</th>
                              </tr>
                              <tr className="bg-slate-100 print:bg-transparent">
                                  {[1,2,3,4,5].map(i => (
                                      <th key={i} className={`p-1 w-[9%] text-center border-b-2 border-slate-800 ${i<5?'border-r border-slate-300':''}`}>
                                          <div className="text-[8px] text-slate-400 font-bold leading-tight mb-0.5">DATE:</div>
                                          <div contentEditable suppressContentEditableWarning className="border-b border-slate-400 w-full min-h-[12px] outline-none bg-white print:bg-transparent"></div>
                                      </th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody>
                              {[1,2,3,4,5,6,7,8,9,10].map(t => (
                                  <tr key={t} className="hover:bg-slate-50 transition-colors">
                                      <td className="p-1 text-center font-bold text-[11px] text-slate-400 border-r-2 border-slate-800">{t}</td>
                                      <td className="p-1 border-r-2 border-slate-800"><div id={`ta-step-${p}-${t}`} contentEditable suppressContentEditableWarning className="w-full min-h-[16px] text-[12px] leading-tight font-medium text-slate-800"></div></td>
                                      {[1,2,3,4,5].map(i => (
                                          <td key={i} className={`p-1 ${i<5?'border-r border-slate-300':''} font-bold text-center align-middle`}><div contentEditable suppressContentEditableWarning className="w-full h-full text-center text-[11px] outline-none text-slate-700"></div></td>
                                      ))}
                                  </tr>
                              ))}
                          </tbody>
                          <tfoot className="border-t-2 border-slate-800 bg-slate-50 print:bg-transparent">
                              <tr>
                                  <td colSpan="2" className="p-1 pr-2 text-right font-bold uppercase text-[10px] tracking-wide align-middle border-r-2 border-slate-800 text-slate-600">Total Independent (%)</td>
                                  {[1,2,3,4,5].map(i => (
                                      <td key={i} className={`p-1 ${i<5?'border-r border-slate-300':''}`}><div contentEditable suppressContentEditableWarning className="w-full text-center text-[11px] font-bold outline-none text-slate-700"></div></td>
                                  ))}
                              </tr>
                          </tfoot>
                      </table>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* SHARED FLASHCARDS VIEW (for DTT, NET, TA, PRT) */}
        <div id="flashcards-container" className={`a4-container p-8 flashcards-page mt-10 shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white ${flashcards.length > 0 && ['dtt', 'net', 'ta', 'prt'].includes(activeTab) ? 'active-print-view block' : 'hidden no-print'}`}>
            <header className="mb-6 flex justify-between items-end border-b-4 border-slate-800 pb-4">
                <h1 className="text-3xl font-black uppercase tracking-widest text-slate-900">{activeTab === 'ta' ? 'Visual Schedule' : 'Visual Cues'}</h1>
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Cut into 4x6 cards</span>
            </header>
            <div className="grid grid-cols-2 gap-6 w-full auto-rows-fr">
                {flashcards.map(cue => (
                    <div key={cue.id} className="flashcard border-4 border-slate-800 flex flex-col items-center justify-between p-4 bg-white relative rounded-2xl shadow-sm print:rounded-none print:shadow-none" style={{ aspectRatio: '6/4' }}>
                        {cue.label && <div className="absolute top-3 left-3 bg-slate-900 text-white px-3 py-1.5 font-black text-sm rounded-full shadow-md z-10">{cue.label}</div>}

                        {cue.status === 'loading' && <div className="loader !border-t-indigo-600 my-auto" style={{ display:'block', width:'30px', height:'30px' }}></div>}

                        {cue.status === 'success' && <img src={cue.imgUrl} alt={cue.primary} className="max-h-[70%] max-w-full object-contain mb-auto pt-2" />}

                        {cue.status === 'error' && (
                          <div className="flex-grow flex flex-col items-center justify-center text-slate-400 w-full mb-2 mt-6">
                            <AlertCircle className="w-8 h-8 mb-1 opacity-50" />
                            <span className="text-xs font-bold uppercase">Image Failed</span>
                          </div>
                        )}

                        <div className="w-full text-center mt-auto border-t-2 border-dashed border-slate-300 pt-3">
                            <p className="font-extrabold text-xl leading-tight uppercase text-slate-800">{cue.primary}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 hidden print:block">{cue.secondary}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        {/* VIEW: ACTIVITY MAKER */}
        <div className={`view-activities flex-col items-center w-full ${activeTab === 'activities' ? 'flex active-print-view' : 'hidden'}`}>
          {!activityData && (
             <div className="flex flex-col items-center justify-center h-[50vh] opacity-30 no-print text-center">
               <Scissors className="w-20 h-20 mb-4 text-slate-900" />
               <p className="text-2xl font-black uppercase tracking-widest text-slate-900">Activity Maker</p>
               <p className="text-lg font-medium text-slate-600">Select an activity type and theme in the sidebar to generate printables.</p>
             </div>
          )}

          {activityData?.type === 'worksheet' && (
            <div className="a4-container p-8 flex flex-col relative shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
              <header className="mb-6 flex justify-between items-end border-b-4 border-slate-800 pb-4">
                  <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900">{activityData.theme}</h1>
                  <span className="text-sm font-bold uppercase tracking-widest text-slate-500">Name: ______________________</span>
              </header>
              <div className="flex-grow flex items-center justify-center">
                  <img src={activityData.url} alt="Worksheet" className="max-w-full max-h-full object-contain" style={{ maxHeight: '240mm' }} />
              </div>
            </div>
          )}

          {activityData?.type === 'craft' && (
            <div className="a4-container p-8 flex flex-col relative shadow-xl rounded-2xl print:shadow-none print:rounded-none bg-white">
              <header className="mb-4 border-b-8 border-slate-800 pb-6 text-center">
                  <h1 className="text-4xl font-black uppercase tracking-widest text-slate-900" contentEditable suppressContentEditableWarning>{activityData.title}</h1>
              </header>

              <div className="mb-6 bg-slate-50 p-6 border-4 border-slate-800 rounded-2xl print:bg-transparent print:rounded-none">
                  <h3 className="font-black text-xl uppercase tracking-wider mb-3 border-b-2 border-slate-800 inline-block text-slate-900">Materials Needed:</h3>
                  <ul className="list-disc pl-6 text-base font-bold text-slate-700 space-y-1">
                      {activityData.materials.map((mat, i) => (
                          <li key={i} contentEditable suppressContentEditableWarning>{mat}</li>
                      ))}
                  </ul>
              </div>

              <div className="flex-grow flex flex-col justify-between">
                  {activityData.steps.map((step, i) => (
                      <div key={i} className="craft-step-row flex items-center gap-6 border-b-2 border-dashed border-slate-300 py-4 flex-1 last:border-b-0 hover:bg-slate-50 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-3xl shrink-0 print:border-4 print:border-black print:bg-white print:text-black shadow-md print:shadow-none">{i + 1}</div>

                          <div className="w-1/2 pr-4 text-xl font-bold leading-snug text-slate-800" contentEditable suppressContentEditableWarning>
                              {step.text}
                          </div>

                          <div className="w-1/2 h-36 flex justify-center items-center border-4 border-slate-800 rounded-2xl bg-white p-3 shadow-sm print:rounded-none print:shadow-none">
                              {step.status === 'loading' && <Loader2 className="animate-spin text-indigo-500 w-10 h-10"/>}
                              {step.status === 'success' && <img src={step.imgUrl} alt={`Step ${i+1}`} className="max-h-full max-w-full object-contain drop-shadow-md print:drop-shadow-none" />}
                              {step.status === 'error' && <span className="text-slate-400 font-black uppercase text-sm">Image Failed</span>}
                          </div>
                      </div>
                  ))}
              </div>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
