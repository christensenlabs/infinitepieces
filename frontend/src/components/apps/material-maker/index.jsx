import React, { useState, useEffect } from 'react';
import {
  BrainCircuit, Sparkles, Loader2,
  AlertCircle, CheckCircle2, LayoutGrid, ListChecks,
  Scissors, Printer, Calendar, Star, Wand2, Image as ImageIcon,
  Target, PlusCircle, Lightbulb, BookOpen
} from 'lucide-react';

import { useApiData } from '@/hooks/useApiData';
import { fetchMaterialMakerConfig } from '@/api/apps';

import VoiceTextArea from '@/components/ui/VoiceTextArea';
import VoiceInput from '@/components/ui/VoiceInput';

import { fetchGeminiWithRetry, fetchImagenWithRetry, playChime } from './utils';

import TokenBoardView from './views/TokenBoardView';
import VisualScheduleView from './views/VisualScheduleView';
import SocialStoryView from './views/SocialStoryView';
import DTTView from './views/DTTView';
import NETView from './views/NETView';
import PRTView from './views/PRTView';
import TAView from './views/TAView';
import ActivityMakerView from './views/ActivityMakerView';
import FlashcardsView from './views/FlashcardsView';

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

        const data = await fetchGeminiWithRetry(apiKey, prompt, "Return valid JSON matching the schema.", schema);

        // Run Imagen calls in parallel for speed
        const [bgUrl, imgUrl, rewardUrl] = await Promise.all([
          fetchImagenWithRetry(apiKey, data.bgPrompt, "16:9"),
          fetchImagenWithRetry(apiKey, data.iconPrompt, "1:1"),
          rewardTheme.trim() ? fetchImagenWithRetry(apiKey, `Clean child-friendly cartoon AAC style flat vector illustration of ${rewardTheme} on a solid white background.`, "1:1") : Promise.resolve(tokenBoardData.rewardImgUrl)
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
      const url = await fetchImagenWithRetry(apiKey, `Clean child-friendly cartoon AAC style flat vector illustration of ${rewardTheme} on a solid white background.`, "1:1");
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

          const url = await fetchImagenWithRetry(apiKey, prompt);
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

      const data = await fetchGeminiWithRetry(apiKey, prompt, "Return valid JSON matching the schema.", schema);

      const pagesWithStatus = (data.pages || []).slice(0, 4).map((p, i) => ({ ...p, id: i, status: 'loading' }));
      setSocialStoryData({ title: data.title, pages: pagesWithStatus });

      for (let i = 0; i < pagesWithStatus.length; i++) {
          try {
              const imgUrl = await fetchImagenWithRetry(apiKey, `Clean child-friendly cartoon illustration: ${pagesWithStatus[i].imagePrompt}. Solid white background, simple, flat colors, highly visible.`);
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
        const data = await fetchGeminiWithRetry(apiKey, prompt, sysPrompt, schema);

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
        const data = await fetchGeminiWithRetry(apiKey, prompt, sysPrompt, schema);

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
        const data = await fetchGeminiWithRetry(apiKey, prompt, sysPrompt, schema);

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
        const data = await fetchGeminiWithRetry(apiKey, prompt, sysPrompt, schema);

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

        const imgUrl = await fetchImagenWithRetry(apiKey, prompt);
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
        const textData = await fetchGeminiWithRetry(apiKey, prompt, "Return valid JSON matching the exact schema.", schema);

        const initialSteps = (textData.steps || []).slice(0,5).map((text, idx) => ({ id: idx, text, status: 'loading' }));
        setActivityData({ type: 'craft', title: textData.title, materials: textData.materials, steps: initialSteps });

        for (let i = 0; i < initialSteps.length; i++) {
            try {
                const imgPrompt = `A simple, clean, child-friendly illustration on a solid white background showing the craft step: "${initialSteps[i].text}". High contrast, flat colors, clear instruction, suitable for kindergarten arts and crafts. Focus purely on the action or objects described.`;
                const imgUrl = await fetchImagenWithRetry(apiKey, imgPrompt);

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

        const imgUrl = await fetchImagenWithRetry(apiKey, prompt);
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
      const result = await fetchGeminiWithRetry(apiKey, prompt, sysPrompt, schema);
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
      const result = await fetchGeminiWithRetry(apiKey, prompt, sysPrompt, schema);
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
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col md:flex-row">
      <style dangerouslySetInnerHTML={{ __html: `
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
      ` }} />

      {/* --- SIDEBAR --- */}
      <aside className="no-print w-full md:w-[360px] bg-slate-900 text-white p-6 shadow-2xl flex flex-col md:fixed h-full left-0 z-40 overflow-y-auto border-r border-slate-800 custom-scrollbar">
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
          <TokenBoardView
            tokens={tokens}
            tokenBoardData={tokenBoardData}
            isGeneratingTokenBoard={isGeneratingTokenBoard}
            isGeneratingReward={isGeneratingReward}
            handleTokenClick={handleTokenClick}
            setTokens={setTokens}
          />
        </div>

        {/* VIEW: SCHEDULE (4-Step Visual Schedule) */}
        <div className={`view-schedule flex-col w-full max-w-4xl ${activeTab === 'schedule' ? 'flex active-print-view' : 'hidden'}`}>
          <VisualScheduleView scheduleItems={scheduleItems} />
        </div>

        {/* VIEW: SOCIAL STORY */}
        <div className={`view-socialstory flex-col items-center w-full max-w-5xl flex-grow ${activeTab === 'socialstory' ? 'flex active-print-view' : 'hidden'}`}>
          <SocialStoryView socialStoryData={socialStoryData} isGeneratingStory={isGeneratingStory} />
        </div>

        {/* VIEW: DTT (DUAL) */}
        <div className={`view-dtt flex-col items-center w-full ${activeTab === 'dtt' ? 'flex active-print-view' : 'hidden'}`}>
          <DTTView />
        </div>

        {/* VIEW: NET (DUAL) */}
        <div className={`view-net flex-col items-center w-full ${activeTab === 'net' ? 'flex active-print-view' : 'hidden'}`}>
          <NETView />
        </div>

        {/* VIEW: PRT (DUAL) */}
        <div className={`view-prt flex-col items-center w-full ${activeTab === 'prt' ? 'flex active-print-view' : 'hidden'}`}>
          <PRTView />
        </div>

        {/* VIEW: TA (DUAL) */}
        <div className={`view-ta flex-col items-center w-full ${activeTab === 'ta' ? 'flex active-print-view' : 'hidden'}`}>
          <TAView />
        </div>

        {/* SHARED FLASHCARDS VIEW (for DTT, NET, TA, PRT) */}
        <FlashcardsView flashcards={flashcards} activeTab={activeTab} />

        {/* VIEW: ACTIVITY MAKER */}
        <div className={`view-activities flex-col items-center w-full ${activeTab === 'activities' ? 'flex active-print-view' : 'hidden'}`}>
          <ActivityMakerView activityData={activityData} />
        </div>

      </main>
    </div>
  );
}
