import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  PlusCircle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Camera,
  Car,
  Package,
  Trophy,
  ArrowRight,
  Hand,
  Users,
  Activity,
  Droplet,
  Footprints,
  Heart,
  Wind,
  Settings,
  Circle,
  Home,
  Hash,
  Maximize
} from 'lucide-react';
import { useApiData } from '../../../hooks/useApiData';
import { fetchZoneMateCatalog, fetchZoneMateConfig } from '../../../api/apps';

import ClassroomBackground from './components/ClassroomBackground';
import BoyClassroomScene from './components/BoyClassroomScene';
import ZoneButton from './components/ZoneButton';
import StrategyModal from './views/StrategyModal';
import CollectionModal from './views/CollectionModal';
import CameraModal from './views/CameraModal';

// --- Icon string-to-component map ---
const ICON_MAP = {
  CheckCircle2,
  Hand,
  Users,
  Activity,
  Droplet,
  Footprints,
  Heart,
  Wind,
  Settings,
  Circle,
  Home,
  Hash,
  Maximize,
  Pause,
  ArrowRight,
};

// Build runtime ZONES from config data, mapping icon strings to components
function buildZones(configZones) {
  if (!configZones) return null;

  const ZONE_META = {
    GREEN: { characterState: 'focused', message: 'I am doing my best work!' },
    BLUE: { characterState: 'lethargic', message: 'I feel so sleepy...' },
    YELLOW: { characterState: 'fidgety', message: 'I have too much energy!' },
    RED: { characterState: 'angry', message: 'I need a big break!' },
  };

  const zones = {};
  for (const [key, zone] of Object.entries(configZones)) {
    const meta = ZONE_META[key] || { characterState: 'focused', message: '' };
    zones[key] = {
      id: key.toLowerCase(),
      name: zone.name,
      description: zone.description,
      color: zone.color,
      characterColor: zone.characterColor,
      borderColor: zone.borderColor,
      characterState: meta.characterState,
      message: meta.message,
      strategies: (zone.strategies || []).map(s => ({
        text: s.text,
        icon: ICON_MAP[s.icon] || CheckCircle2,
      })),
    };
  }
  return zones;
}

export default function ZoneMateApp() {
  // --- Load data from mock API ---
  const { data: catalogData, loading: catalogLoading } = useApiData(fetchZoneMateCatalog);
  const { data: configData, loading: configLoading } = useApiData(fetchZoneMateConfig);

  const ZONES = useMemo(() => buildZones(configData?.zones), [configData]);

  const LEGO_CATALOG = useMemo(() => {
    if (!catalogData) return [];
    // Build icon elements from catalog (Camera/Car icons hardcoded as in original)
    const iconMap = { camera: <Camera className="text-blue-500" />, honda: <Car className="text-yellow-500" /> };
    return catalogData.map(item => ({
      ...item,
      icon: iconMap[item.id] || <Package className="text-slate-400" />,
    }));
  }, [catalogData]);

  const defaultTimerSeconds = configData?.defaultTimerSeconds ?? 240;

  const [selectedZoneKey, setSelectedZoneKey] = useState(null);
  const currentZone = (ZONES && selectedZoneKey ? ZONES[selectedZoneKey] : null) || (ZONES ? ZONES.GREEN : null);
  const setCurrentZone = (zone) => {
    if (zone && ZONES) {
      const key = Object.keys(ZONES).find(k => ZONES[k].id === zone.id);
      setSelectedZoneKey(key || 'GREEN');
    }
  };

  const [timerSeconds, setTimerSeconds] = useState(defaultTimerSeconds);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [isEditingTimer, setIsEditingTimer] = useState(false);
  const [timerInputValue, setTimerInputValue] = useState("");

  // Reward State
  const [legoBricks, setLegoBricks] = useState(0);
  const [activeSetId, setActiveSetId] = useState('camera');
  // eslint-disable-next-line no-unused-vars
  const [ownedSets, setOwnedSets] = useState([]);
  const [showCollection, setShowCollection] = useState(false);
  const [rewardImage, setRewardImage] = useState(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const [fidgetPos, setFidgetPos] = useState({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const [showStrategyModal, setShowStrategyModal] = useState(false);

  const [birdFly, setBirdFly] = useState(false);

  const timerRef = useRef(null);
  const pressTimer = useRef(null);

  const activeSet = LEGO_CATALOG.find(s => s.id === activeSetId) || { bricksNeeded: 5 };

  // --- Real-time Camera Logic ---
  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (err) {
      console.error("Camera access denied or unavailable:", err);
      fileInputRef.current?.click();
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraOpen(false);
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageUrl = canvas.toDataURL('image/png');
      setRewardImage(imageUrl);
      closeCamera();
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setRewardImage(imageUrl);
    }
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const customStyles = `
    @keyframes writeMotion {
      0%, 100% { transform: rotate(-55deg) translate(-25px, 30px); }
      50% { transform: rotate(-60deg) translate(-30px, 32px); }
    }
    @keyframes steamRise {
      0% { opacity: 0; transform: translateY(0) scale(0.5); }
      40% { opacity: 0.8; transform: translateY(-20px) scale(1.2); }
      100% { opacity: 0; transform: translateY(-40px) scale(1.5); }
    }
    @keyframes floatZzz {
      0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
      20% { opacity: 1; transform: translate(15px, -15px) scale(1); }
      80% { opacity: 0.8; transform: translate(-10px, -45px) scale(1.5); }
      100% { opacity: 0; transform: translate(5px, -60px) scale(2); }
    }
    @keyframes flyBird {
      0% { transform: translateX(100px) translateY(20px) scale(0.5); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { transform: translateX(-150px) translateY(-20px) scale(0.8); opacity: 0; }
    }
    @keyframes flailLeft {
      0% { transform: rotate(130deg) translateY(-5px); }
      50% { transform: rotate(180deg) translateY(-15px); }
      100% { transform: rotate(230deg) translateY(-5px); }
    }
    @keyframes flailRight {
      0% { transform: rotate(-230deg) translateY(-5px); }
      50% { transform: rotate(-180deg) translateY(-15px); }
      100% { transform: rotate(-130deg) translateY(-5px); }
    }
    @keyframes wiggle1 { 0% { transform: rotate(-20deg); } 100% { transform: rotate(35deg); } }
    @keyframes wiggle2 { 0% { transform: rotate(25deg); } 100% { transform: rotate(-30deg); } }
    @keyframes wiggle3 { 0% { transform: rotate(-35deg); } 100% { transform: rotate(20deg); } }
    @keyframes fistShake {
      0% { transform: rotate(-140deg) translateX(5px); }
      100% { transform: rotate(-160deg) translateX(-5px); }
    }

    .animate-write { animation: writeMotion 0.8s ease-in-out infinite; }
    .animate-steam { animation: steamRise 1.5s ease-out infinite; }
    .animate-steam-delay { animation: steamRise 1.5s ease-out infinite 0.75s; }
    .animate-zzz-1 { animation: floatZzz 3s ease-in-out infinite; }
    .animate-zzz-2 { animation: floatZzz 3s ease-in-out infinite 1s; }
    .animate-zzz-3 { animation: floatZzz 3s ease-in-out infinite 2s; }
    .animate-bird { animation: flyBird 4s linear; }
    .animate-flail-left { animation: flailLeft 0.5s ease-in-out infinite alternate; }
    .animate-flail-right { animation: flailRight 0.55s ease-in-out infinite alternate; }
    .animate-wiggle-1 { animation: wiggle1 0.12s infinite alternate ease-in-out; }
    .animate-wiggle-2 { animation: wiggle2 0.15s infinite alternate ease-in-out; }
    .animate-wiggle-3 { animation: wiggle3 0.1s infinite alternate ease-in-out; }
    .animate-fist-shake { animation: fistShake 0.15s infinite alternate ease-in-out; }

    .desk-surface {
      transform: perspective(800px) rotateX(45deg);
      transform-origin: bottom;
    }

    .animate-in { animation-duration: 300ms; animation-fill-mode: both; animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1); }
    .fade-in { animation-name: fadeIn; }
    .zoom-in-95 { animation-name: zoomIn95; }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes zoomIn95 { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  `;

  useEffect(() => {
    if (!currentZone) return;
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 150);
    }, 3500);

    let fidgetInterval;
    if (currentZone.id === 'yellow') {
      fidgetInterval = setInterval(() => {
        setFidgetPos({
          x: Math.random() * 8 - 4,
          y: Math.random() * 8 - 4
        });
      }, 50);
    } else {
      // Reset position synchronously on zone change — intentional
      setFidgetPos({ x: 0, y: 0 }); // eslint-disable-line react-hooks/set-state-in-effect
    }

    return () => {
      clearInterval(blinkInterval);
      clearInterval(fidgetInterval);
    };
  }, [currentZone]);

  useEffect(() => {
    if (!currentZone) return;
    if (isTimerActive && timerSeconds > 0) {
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerActive) {
      setIsTimerActive(false); // eslint-disable-line react-hooks/set-state-in-effect
      if (currentZone.id === 'green') {
        const newBrickCount = legoBricks + 1;
        if (newBrickCount >= activeSet.bricksNeeded) {
          setOwnedSets(prev => [...prev, activeSet.name]);
          setLegoBricks(0);
        } else {
          setLegoBricks(newBrickCount);
        }
      }
      clearInterval(timerRef.current);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isTimerActive, timerSeconds, currentZone, legoBricks, activeSet]);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handlePressStart = (zone) => {
    setCurrentZone(zone);
    if (zone.id !== 'green') {
      pressTimer.current = setTimeout(() => {
        setShowStrategyModal(true);
      }, 500);
    }
  };

  const handlePressEnd = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
    }
  };

  const handleTimerChangeSubmit = (e) => {
    if (e?.type === 'keydown' && e.key !== 'Enter') return;

    setIsEditingTimer(false);
    let newSeconds = defaultTimerSeconds;
    const val = timerInputValue.trim();
    if (val.includes(':')) {
      const [m, s] = val.split(':');
      newSeconds = (parseInt(m) || 0) * 60 + (parseInt(s) || 0);
    } else if (!isNaN(parseInt(val))) {
      newSeconds = parseInt(val) * 60;
    }
    setTimerSeconds(newSeconds >= 0 ? newSeconds : defaultTimerSeconds);
  };

  const handleSelectStrategy = (zone) => {
    setCurrentZone(zone);
    setShowStrategyModal(false);
  };

  const handleSelectSet = (setId) => {
    setActiveSetId(setId);
    setLegoBricks(0);
    setShowCollection(false);
  };

  // Loading state
  if (catalogLoading || configLoading || !currentZone || !ZONES) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white font-black text-xl animate-pulse">Loading ZoneMate...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 p-2 md:p-6 font-sans flex flex-col items-center overflow-x-hidden">
      <style dangerouslySetInnerHTML={{__html: customStyles}} />

      {/* --- In-App Camera Modal --- */}
      {isCameraOpen && (
        <CameraModal
          videoRef={videoRef}
          canvasRef={canvasRef}
          streamRef={streamRef}
          onTakePhoto={takePhoto}
          onClose={closeCamera}
        />
      )}

      <div className="max-w-4xl w-full text-center mb-3 mt-2">
        <h1 className="text-2xl md:text-4xl font-black text-white uppercase tracking-tight drop-shadow-md">Zone Mate</h1>
      </div>

      <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-6 lg:gap-8 items-start relative z-10">

        {/* Interaction Area */}
        <div className="order-1 lg:order-2 lg:col-span-6 flex flex-col items-center justify-end bg-white rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl border-b-8 border-slate-700 h-[380px] sm:h-[450px] lg:h-[600px] relative overflow-hidden w-full ring-4 ring-white/10">
          <ClassroomBackground birdFly={birdFly} onBirdFly={() => setBirdFly(true)} />
          <div className={`absolute top-4 sm:top-6 lg:top-8 px-6 md:px-10 py-2 md:py-3 rounded-2xl font-black shadow-xl transition-all duration-500 text-sm sm:text-lg lg:text-xl uppercase tracking-wider ${currentZone.color} text-white z-50 text-center max-w-[90%] border-2 border-white/30 backdrop-blur-sm`}>
            {currentZone.message}
          </div>
          <BoyClassroomScene zone={currentZone} fidgetPos={fidgetPos} isBlinking={isBlinking} />
        </div>

        {/* Zones */}
        <div className="order-2 lg:order-1 lg:col-span-3 w-full">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-1 gap-3 md:gap-4">
            {Object.values(ZONES).map((zone) => (
              <ZoneButton
                key={zone.id}
                zone={zone}
                isActive={currentZone.id === zone.id}
                onPressStart={handlePressStart}
                onPressEnd={handlePressEnd}
              />
            ))}
          </div>
        </div>

        <div className="order-3 lg:order-3 lg:col-span-3 w-full flex flex-col gap-4">

          <div className="bg-slate-800 p-5 rounded-[2rem] shadow-xl border-2 border-slate-700 flex flex-col items-center">
            <div className="text-slate-400 text-[10px] font-bold uppercase mb-2">Session Timer</div>
            {isEditingTimer ? (
              <input
                type="text"
                autoFocus
                value={timerInputValue}
                onChange={(e) => setTimerInputValue(e.target.value)}
                onBlur={handleTimerChangeSubmit}
                onKeyDown={handleTimerChangeSubmit}
                className="bg-transparent border-b-2 border-slate-500 w-32 text-center outline-none text-4xl font-black text-white"
              />
            ) : (
              <div
                onDoubleClick={() => {
                  setIsTimerActive(false);
                  setTimerInputValue(formatTime(timerSeconds));
                  setIsEditingTimer(true);
                }}
                title="Double-click to edit time"
                className={`text-4xl font-black cursor-text select-none ${timerSeconds < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                {formatTime(timerSeconds)}
              </div>
            )}
            <div className="flex gap-2 w-full mt-4">
              <button onClick={() => setIsTimerActive(!isTimerActive)} className={`flex-1 py-3 rounded-xl flex justify-center text-white ${isTimerActive ? 'bg-amber-500' : 'bg-green-500'}`}>
                {isTimerActive ? <Pause /> : <Play />}
              </button>
              <button onClick={() => { setIsTimerActive(false); setTimerSeconds(defaultTimerSeconds); }} className="p-3 rounded-xl bg-slate-700 text-slate-300">
                <RotateCcw size={20} />
              </button>
            </div>
          </div>

          <div className="bg-slate-800 p-5 rounded-[2rem] shadow-xl border-2 border-slate-700 flex flex-col items-center">
            <div className="flex justify-between items-center w-full mb-4">
              <div className="text-slate-400 text-[10px] font-bold uppercase flex items-center gap-1">
                <PlusCircle size={14} className="text-blue-400" /> Reward Bin
              </div>
              <div className="flex gap-3 items-center">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleImageUpload}
                />
                <button onClick={openCamera} className="text-emerald-400 text-[10px] font-bold uppercase bg-emerald-500/20 px-2 py-1 rounded hover:bg-emerald-500/30 transition-colors flex items-center gap-1">
                   <Camera size={12} /> Set Photo
                </button>
              </div>
            </div>

            <div className="relative w-full h-36 lg:h-44 bg-slate-800 rounded-xl border-t-8 border-l-8 border-slate-900 shadow-[inset_-10px_-10px_20px_rgba(0,0,0,0.4)] overflow-hidden flex flex-col justify-end p-2 lg:p-3 mt-2">
              {rewardImage ? (
                <img src={rewardImage} alt="Reward" className="absolute inset-0 w-full h-full object-cover opacity-70 mix-blend-luminosity" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 text-white">
                  <Package size={32} className="mb-2" />
                  <span className="text-[10px] uppercase font-bold text-center px-4">Take a photo<br/>of the real reward!</span>
                </div>
              )}

              <div className="grid grid-cols-4 md:grid-cols-5 gap-1.5 lg:gap-2 w-full relative z-10 items-end justify-items-center">
                {[...Array(legoBricks)].map((_, i) => (
                  <div key={i} className={`w-6 h-4 lg:w-10 lg:h-8 rounded-[2px] lg:rounded shadow-[0_2px_4px_rgba(0,0,0,0.5)] animate-bounce flex items-center justify-center border-b-[2px] lg:border-b-4 border-r-[1px] lg:border-r-2 ${i % 3 === 0 ? 'bg-red-500 border-red-700' : i % 3 === 1 ? 'bg-blue-500 border-blue-700' : 'bg-yellow-400 border-yellow-600'}`} style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className="flex gap-0.5 lg:gap-1"><div className="w-[3px] lg:w-1.5 h-[3px] lg:h-1.5 rounded-full bg-white/40" /><div className="w-[3px] lg:w-1.5 h-[3px] lg:h-1.5 rounded-full bg-white/40" /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="w-full flex justify-between items-center font-black border-t border-slate-700 pt-3 lg:pt-4 relative z-10">
              <span className="text-slate-400 text-[10px] lg:text-xs">BRICKS:</span>
              <span className="bg-blue-500 text-white px-3 lg:px-5 py-0.5 lg:py-1 rounded-full text-sm lg:text-xl shadow-[0_0_10px_rgba(59,130,246,0.5)]">{legoBricks} / {activeSet.bricksNeeded}</span>
            </div>
          </div>
        </div>
      </div>

      {showCollection && (
        <CollectionModal
          legoCatalog={LEGO_CATALOG}
          activeSetId={activeSetId}
          onSelectSet={handleSelectSet}
          onClose={() => setShowCollection(false)}
        />
      )}

      {/* Strategy Modal */}
      {showStrategyModal && (
        <StrategyModal
          currentZone={currentZone}
          greenZone={ZONES.GREEN}
          onSelectStrategy={handleSelectStrategy}
          onClose={() => setShowStrategyModal(false)}
        />
      )}

      {/* Completion Toast */}
      {timerSeconds === 0 && !isTimerActive && legoBricks > 0 && (
        <div className="fixed bottom-12 animate-bounce bg-green-500 text-white px-8 py-6 rounded-[3rem] shadow-2xl flex items-center gap-6 z-[200] border-8 border-green-300">
          <div className="bg-white text-green-600 p-3 rounded-full"><Trophy size={32} /></div>
          <div>
            <div className="font-black text-2xl uppercase tracking-tighter">
              Reward Earned!
            </div>
            <div className="text-sm font-bold opacity-90">
              You finished your session and earned your reward!
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
