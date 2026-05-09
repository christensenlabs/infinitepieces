import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Smile,
  Zap,
  Flame,
  PlusCircle,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Brain,
  X,
  Moon,
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
import { useApiData } from '../../hooks/useApiData';
import { fetchZoneMateCatalog, fetchZoneMateConfig } from '../../api/apps';

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

const DigitalClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timerId = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timerId);
  }, []);

  return (
    <div className="absolute top-6 right-6 md:right-8 bg-slate-900 border-4 border-slate-700 rounded-xl shadow-lg flex items-center justify-center px-3 py-1.5 md:px-4 md:py-2 select-none z-20">
      <div className="text-red-500 font-mono font-black text-sm md:text-xl tracking-widest drop-shadow-[0_0_5px_rgba(239,68,68,0.8)]">
        {time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
      </div>
    </div>
  );
};

function ClassroomBackground({ birdFly, onBirdFly }) {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#e8f0f8]">
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-black/5 mix-blend-multiply" />
      <div
        onClick={onBirdFly}
        className="absolute top-8 md:top-12 left-4 md:left-8 w-24 md:w-36 h-36 md:h-52 bg-sky-300 border-8 md:border-[12px] border-white shadow-[inset_0_10px_20px_rgba(0,0,0,0.2)] rounded-sm overflow-hidden cursor-pointer active:scale-95 transition-transform"
      >
        <div className="absolute top-2 right-2 w-6 h-6 bg-yellow-300 rounded-full animate-pulse" />
        {birdFly && <div className="absolute top-6 left-full animate-bird whitespace-nowrap z-10 text-xl">&#x1F426;</div>}
        <div className="absolute bottom-0 w-full h-[40%] bg-green-500 shadow-[inset_0_5px_10px_rgba(0,0,0,0.2)]" />
      </div>
      <DigitalClock />
      <div className="absolute bottom-0 w-full h-24 md:h-32 bg-amber-100/50 border-t-4 border-amber-200/50 shadow-inner" />
    </div>
  );
}

function BoyClassroomScene({ zone, fidgetPos, isBlinking }) {
  const state = zone.characterState;
  const isRed = zone.id === 'red';
  const isBlue = zone.id === 'blue';
  const isGreen = zone.id === 'green';
  const isYellow = zone.id === 'yellow';

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-end overflow-hidden pointer-events-none">
      <div className="absolute bottom-[15%] md:bottom-[18%] left-1/2 -translate-x-1/2 w-32 md:w-40 h-40 md:h-48 z-10 pointer-events-none opacity-95">
        <div className="absolute top-0 w-full h-20 md:h-24 flex flex-col items-center">
          <div className="w-full h-4 bg-amber-800 rounded-t-sm border-b border-amber-950 shadow-sm" />
          <div className="flex justify-around w-[70%] h-full">
            <div className="w-1.5 h-full bg-amber-800" />
            <div className="w-1.5 h-full bg-amber-800" />
          </div>
        </div>
        <div className="absolute top-20 md:top-24 w-full h-5 bg-amber-800 shadow-md" />
        <div className="absolute bottom-0 left-4 w-2 h-10 bg-amber-900" />
        <div className="absolute bottom-0 right-4 w-2 h-10 bg-amber-900" />
      </div>

      <div
        className="relative w-full max-w-[260px] md:max-w-[300px] aspect-[4/5] flex flex-col items-center justify-end transition-all duration-700 mx-auto z-30 pointer-events-auto"
        style={{ transform: `translate(${fidgetPos.x}px, ${fidgetPos.y}px) ${isBlue ? 'translate-y-8 scale-95' : ''}` }}
      >
        {isBlue && (
          <div className="absolute -top-12 left-1/2 text-blue-500 font-black text-xl z-50">
            <div className="absolute opacity-0 animate-zzz-1">Z</div>
            <div className="absolute opacity-0 animate-zzz-2 text-2xl">Z</div>
            <div className="absolute opacity-0 animate-zzz-3 text-lg">z</div>
          </div>
        )}

        {isRed && (
          <>
            <div className="absolute top-10 -left-8 w-10 h-10 bg-gray-200 rounded-full opacity-0 animate-steam blur-sm z-50" />
            <div className="absolute top-10 -right-8 w-10 h-10 bg-gray-200 rounded-full opacity-0 animate-steam-delay blur-sm z-50" />
          </>
        )}

        <div className={`relative w-40 h-40 md:w-44 md:h-44 rounded-[45%] border-b-4 border-black/10 transition-all duration-500 z-20 overflow-hidden
          ${isRed ? 'bg-red-200 shadow-[0_0_30px_rgba(239,68,68,0.3)]' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'}
          ${isBlue ? 'rotate-12 translate-y-6' : ''}`}
        >
          <div className="absolute top-0 w-full h-14 bg-[#4a332a] z-10 pointer-events-none">
            <div className="absolute -bottom-3 left-1 w-14 h-10 bg-[#4a332a] rounded-full rotate-[-15deg]" />
            <div className="absolute -bottom-4 left-10 w-20 h-12 bg-[#5d4037] rounded-full" />
            <div className="absolute -bottom-3 right-1 w-14 h-10 bg-[#4a332a] rounded-full rotate-[15deg]" />
          </div>

          <div className={`absolute bottom-4 -left-2 w-16 h-16 rounded-full opacity-40 transition-colors ${isRed ? 'bg-red-500 blur-md' : 'bg-pink-300 blur-md'}`} />
          <div className={`absolute bottom-4 -right-2 w-16 h-16 rounded-full opacity-40 transition-colors ${isRed ? 'bg-red-500 blur-md' : 'bg-pink-300 blur-md'}`} />

          <div className={`flex justify-around w-full mt-14 md:mt-16 px-6 transition-all duration-500 ${isBlue ? 'translate-y-8' : ''}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center relative overflow-hidden transition-all ${isBlue ? 'h-2 bg-transparent border-t-4 border-slate-700 rounded-none mt-4' : ''}`}>
              {!isBlinking && !isBlue ? (
                <div className={`w-4 h-4 md:w-5 md:h-5 bg-black rounded-full transition-all duration-300 ${state === 'angry' ? 'scale-y-125 -translate-y-1' : ''} ${state === 'focused' ? 'translate-x-1 translate-y-1' : ''}`}></div>
              ) : !isBlue && (
                <div className="w-full h-1 bg-gray-400"></div>
              )}
            </div>
            <div className={`w-8 h-8 md:w-10 md:h-10 bg-white rounded-full flex items-center justify-center relative overflow-hidden transition-all ${isBlue ? 'h-2 bg-transparent border-t-4 border-slate-700 rounded-none mt-4' : ''}`}>
              {!isBlinking && !isBlue ? (
                <div className={`w-4 h-4 md:w-5 md:h-5 bg-black rounded-full transition-all duration-300 ${state === 'angry' ? 'scale-y-125 -translate-y-1' : ''} ${state === 'focused' ? '-translate-x-1 translate-y-1' : ''}`}></div>
              ) : !isBlue && (
                <div className="w-full h-1 bg-gray-400"></div>
              )}
            </div>
          </div>

          <div className={`flex justify-center mt-6 transition-all ${isBlue ? 'translate-y-6 opacity-60' : ''}`}>
            {state === 'focused' && <div className="w-10 h-5 border-b-[4px] border-black/70 rounded-full"></div>}
            {state === 'lethargic' && <div className="w-6 h-6 md:w-8 md:h-8 bg-black/20 rounded-full"></div>}
            {state === 'fidgety' && <div className="w-12 h-8 border-4 border-black/80 rounded-full"></div>}
            {state === 'angry' && (
              <div className="w-16 h-6 md:w-20 md:h-8 bg-black rounded-xl flex flex-col justify-between overflow-hidden border-2 border-black">
                 <div className="w-full h-[40%] bg-white border-b border-black/30 grid grid-cols-4 divide-x divide-black/30"><div/><div/><div/><div/></div>
                 <div className="w-full h-[40%] bg-white border-t border-black/30 grid grid-cols-4 divide-x divide-black/30"><div/><div/><div/><div/></div>
              </div>
            )}
          </div>
        </div>

        <div className={`relative w-48 h-36 -mt-6 rounded-t-[45%] transition-colors duration-500 border-x-8 border-t-[6px] border-black/5 z-10 ${zone.color}`}>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-14 h-6 bg-white/20 rounded-full" />

          {/* Left Arm */}
          <div className={`absolute -left-4 md:-left-6 top-10 w-12 md:w-16 h-24 md:h-32 rounded-full origin-top transition-all duration-500 shadow-[-5px_0_10px_rgba(0,0,0,0.1)] border-l-[6px] border-black/10 z-[60] ${zone.color}
            ${isYellow ? 'animate-flail-left' : isBlue ? 'rotate-[70deg] translate-y-6 translate-x-4' : 'rotate-[25deg]'}`}>
            <div className={`absolute bottom-[-8px] md:bottom-[-12px] left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 ${isRed ? 'bg-red-200' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'} rounded-full shadow-md z-[80] flex items-center justify-center transition-colors duration-500`}>
              <div className={`absolute w-8 h-8 md:w-10 md:h-10 bg-purple-500 rounded-full shadow-[inset_-3px_-3px_6px_rgba(0,0,0,0.4)] z-[81] transition-transform duration-300 ${isRed ? 'scale-x-110 scale-y-75' : ''}`} />
              <div className="absolute top-[40%] z-[82] flex gap-[2px] md:gap-1">
                 <div className={`w-2.5 md:w-3 h-5 md:h-6 ${isRed ? 'bg-red-200' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'} rounded-full origin-top rotate-[45deg] translate-x-[-2px] border-b border-black/10 shadow-sm ${isYellow ? 'animate-wiggle-1' : ''}`} />
                 {[1, 2, 3].map(i => (
                   <div key={`l-finger-${i}`} className={`w-2 md:w-2.5 h-6 md:h-7 ${isRed ? 'bg-red-200' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'} rounded-full origin-top transition-colors duration-500 border-b border-black/10 shadow-sm ${isYellow ? 'animate-wiggle-' + ((i % 3) + 1) : ''}`} />
                 ))}
              </div>
            </div>
          </div>

          {/* Right Arm */}
          <div className={`absolute -right-4 md:-right-6 top-10 w-12 md:w-16 h-24 md:h-32 rounded-full origin-top transition-all duration-500 shadow-[5px_0_10px_rgba(0,0,0,0.1)] border-r-[6px] border-black/10 z-[70] ${zone.color}
            ${isYellow ? 'animate-flail-right' : isGreen ? 'animate-write' : isRed ? 'animate-fist-shake' : isBlue ? 'rotate-[-70deg] translate-y-6 -translate-x-4' : 'rotate-[-25deg]'}`} >
            <div className={`absolute bottom-[-8px] md:bottom-[-12px] left-1/2 -translate-x-1/2 w-10 h-10 md:w-12 md:h-12 ${isRed ? 'bg-red-200' : isBlue ? 'bg-blue-50' : 'bg-[#fdf0e6]'} rounded-full shadow-md z-[80] flex items-center justify-center transition-colors duration-500`}>
              {isGreen && (
                <div className="absolute top-[30%] -left-6 w-16 h-3 bg-yellow-400 rotate-[-40deg] rounded-sm shadow-sm border-b border-yellow-600 flex items-center z-[81]">
                  <div className="w-3 h-3 bg-pink-400 rounded-l-sm" />
                  <div className="absolute -right-3 w-0 h-0 border-y-[4px] border-y-transparent border-l-[12px] border-l-[#eecba3]">
                    <div className="absolute top-[-2px] right-[2px] w-1.5 h-1.5 bg-slate-800 rounded-full" />
                  </div>
                </div>
              )}
              <div className="absolute top-[40%] z-[82] flex gap-[2px] md:gap-1">
                 <div className={`w-2.5 md:w-3 rounded-full origin-top rotate-[45deg] translate-x-[-2px] border-b border-black/10 shadow-sm ${isYellow ? 'animate-wiggle-1' : ''} transition-all duration-300 ${isRed ? 'h-3 md:h-4 bg-red-300 translate-y-1' : isBlue ? 'h-5 md:h-6 bg-blue-50' : 'h-5 md:h-6 bg-[#fdf0e6]'}`} />
                 {[1, 2, 3].map(i => (
                   <div key={`r-finger-${i}`} className={`w-2 md:w-2.5 rounded-full origin-top transition-all duration-300 border-b border-black/10 shadow-sm ${isYellow ? 'animate-wiggle-' + ((i % 3) + 1) : ''} ${isRed ? 'h-3 md:h-4 bg-red-300 translate-y-1' : isBlue ? 'h-6 md:h-7 bg-blue-50' : 'h-6 md:h-7 bg-[#fdf0e6]'}`} />
                 ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-0 w-full h-24 md:h-32 z-40 pointer-events-none flex flex-col items-center justify-end">
         <div className="desk-surface w-[130%] h-[150%] bg-amber-700 absolute bottom-4 md:bottom-8 border-t-4 border-amber-600 shadow-[inset_0_40px_50px_rgba(0,0,0,0.3)]">
            <div className={`absolute bottom-[20%] left-1/2 -translate-x-1/2 w-36 md:w-48 h-24 md:h-32 bg-white rounded shadow-lg transform rotate-[-1deg] flex flex-col p-3 transition-opacity ${isBlue ? 'opacity-20' : 'opacity-100'}`}>
               <div className="w-full h-2 bg-blue-100/50 mb-2 rounded-sm" />
               <div className="w-3/4 h-2 bg-blue-100/50 mb-2 rounded-sm" />
               {isGreen && <div className="w-1/2 h-2 bg-slate-600 rounded-sm" />}
            </div>
         </div>
         <div className="w-[110%] h-8 bg-amber-900 relative z-50 border-t border-amber-800 shadow-2xl" />
      </div>
    </div>
  );
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex flex-col items-center justify-center p-4 lg:p-8 animate-in fade-in">
          <button onClick={closeCamera} className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors z-50">
            <X size={24} />
          </button>

          <div className="w-full max-w-lg aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl relative border-4 border-slate-700 flex flex-col justify-center animate-in zoom-in-95">
            <video
              ref={(el) => {
                videoRef.current = el;
                if (el && streamRef.current && !el.srcObject) {
                  el.srcObject = streamRef.current;
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Snap Button overlay */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
              <button
                onClick={takePhoto}
                className="w-16 h-16 bg-white/40 border-4 border-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
              >
                <div className="w-12 h-12 bg-white rounded-full"></div>
              </button>
            </div>
          </div>
          <p className="text-white mt-6 font-bold text-center animate-pulse">Position the reward in the frame and snap!</p>
          <canvas ref={canvasRef} className="hidden" />
        </div>
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
              <button
                key={zone.id}
                onMouseDown={() => handlePressStart(zone)}
                onMouseUp={handlePressEnd}
                onMouseLeave={handlePressEnd}
                onTouchStart={() => handlePressStart(zone)}
                onTouchEnd={handlePressEnd}
                onContextMenu={(e) => e.preventDefault()}
                className={`relative h-24 sm:h-28 md:h-32 rounded-3xl overflow-hidden transform active:scale-95 shadow-lg border-4 select-none
                  ${currentZone.id === zone.id ? `${zone.borderColor} scale-105 z-10 ring-4 ring-white` : 'border-slate-700 bg-slate-800'}`}
              >
                <div className={`absolute inset-0 ${zone.color} opacity-80 ${currentZone.id !== zone.id && 'saturate-50'}`} />
                <div className="absolute inset-0 flex flex-col items-center justify-center p-2 text-white">
                   {zone.id === 'green' && <Smile size={24} />}
                   {zone.id === 'blue' && <Moon size={24} />}
                   {zone.id === 'yellow' && <Zap size={24} />}
                   {zone.id === 'red' && <Flame size={24} />}
                   <div className="font-black text-xs md:text-sm uppercase tracking-wider">{zone.name}</div>
                </div>
                <div className="absolute bottom-1 right-1 bg-black/30 p-1 rounded-full flex items-center gap-1">
                  <Brain size={12} className="text-white" />
                  <span className="text-[8px] text-white font-bold hidden sm:block uppercase">Hold</span>
                </div>
              </button>
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in">
          <div className="bg-slate-800 w-full max-w-md rounded-[2.5rem] border border-slate-700 overflow-hidden shadow-2xl animate-in zoom-in-95">
            <div className="p-6 bg-slate-700 flex justify-between items-center">
              <h2 className="text-white font-black uppercase flex items-center gap-2">
                <Package size={20} className="text-blue-400" /> Select New Goal
              </h2>
              <button onClick={() => setShowCollection(false)} className="text-slate-300 hover:text-white transition-colors"><X /></button>
            </div>
            <div className="p-6 grid grid-cols-1 gap-3">
              {LEGO_CATALOG.map((set) => (
                <button
                  key={set.id}
                  onClick={() => {
                    setActiveSetId(set.id);
                    setLegoBricks(0);
                    setShowCollection(false);
                  }}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all group ${activeSetId === set.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-700/50 hover:border-slate-600'}`}
                >
                  <div className={`p-3 rounded-xl text-white ${set.color} group-hover:scale-110 transition-transform`}>{set.icon}</div>
                  <div className="text-left"><div className="text-white font-black uppercase text-sm">{set.name}</div></div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Strategy Modal */}
      {showStrategyModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4 lg:p-8 animate-in fade-in">
          <div className="bg-slate-800 w-full max-w-2xl rounded-[2rem] lg:rounded-[4rem] shadow-2xl overflow-hidden border border-slate-700 animate-in zoom-in-95">
            <div className={`${currentZone.color} p-6 lg:p-12 text-white relative shadow-lg`}>
              <button onClick={() => setShowStrategyModal(false)} className="absolute top-4 right-4 lg:top-8 lg:right-8 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors"><X /></button>
              <div className="flex items-center gap-3 lg:gap-8">
                 <div className="bg-white/20 p-4 rounded-2xl"><Brain size={32} /></div>
                 <div>
                    <h2 className="text-lg lg:text-4xl font-black uppercase">Strategy Box</h2>
                    <p className="text-xs lg:text-xl font-bold opacity-90 italic">Choose a tool to help you!</p>
                 </div>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentZone.strategies.map((strategy, idx) => {
                const IconComponent = strategy.icon;
                return (
                <button key={idx} onClick={() => { setCurrentZone(ZONES.GREEN); setShowStrategyModal(false); }} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-700 hover:bg-slate-600 border border-slate-600 group transition-all text-left">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-black shadow-inner shrink-0 ${currentZone.color}`}>
                    <IconComponent size={20} strokeWidth={2.5} />
                  </div>
                  <span className="text-white font-bold uppercase text-xs">{strategy.text}</span>
                </button>
              )})}
              <button onClick={() => { setCurrentZone(ZONES.GREEN); setShowStrategyModal(false); }} className="md:col-span-2 mt-4 py-6 rounded-[2rem] bg-green-500 hover:bg-green-600 text-white font-black uppercase flex items-center justify-center gap-3 transition-colors">
                <CheckCircle2 /> Back to Green Zone!
              </button>
            </div>
          </div>
        </div>
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
