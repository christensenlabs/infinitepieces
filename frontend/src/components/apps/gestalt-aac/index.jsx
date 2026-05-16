import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Star, Smile, Sparkles, Users, MapPin, Hand, Shapes, Activity, Home,
  CheckCircle2, Camera, Lock, Unlock, Loader2, Image as ImageIcon, X,
} from 'lucide-react';
import { useApiData } from '@/hooks/useApiData';
import { fetchAacConfig } from '@/api/apps';
import { useApp } from '@/context/AppContext';

// ── Constants ────────────────────────────────────────────────────────────────

const BORDER_STYLES = [
  '60% 40% 30% 70% / 60% 30% 70% 40%',
  '40% 60% 70% 30% / 40% 50% 60% 50%',
  '50% 50% 30% 70% / 50% 70% 30% 60%',
  '70% 30% 50% 50% / 30% 60% 40% 70%',
];

const COLORS = ['#f9d5e5', '#d5e8f9', '#d5f9e8', '#f9f0d5', '#e8d5f9', '#f9e8d5'];

const ICON_MAP = {
  Star, Smile, Sparkles, Users, MapPin, Hand, Shapes, Activity, Home,
};

// ── IndexedDB helpers ─────────────────────────────────────────────────────────

const DB_NAME = 'AacUltimateEngineDB_v2';
const STORE_NAME = 'images';

function initDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'prompt' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getCachedImage(prompt) {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(prompt);
      req.onsuccess = () => resolve(req.result?.data ?? null);
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

async function cacheImagePermanently(prompt, data) {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).put({ prompt, data });
      tx.oncomplete = resolve;
      tx.onerror = resolve;
    });
  } catch {
    // silently ignore
  }
}

// ── Imagen API ────────────────────────────────────────────────────────────────

const RETRY_DELAYS = [1000, 2000, 4000];

async function fetchAiImageWithRetry(prompt, apiKey) {
  const styledPrompt = `child's crayon drawing style, simple and colorful: ${prompt}`;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${encodeURIComponent(apiKey)}`;
  const body = JSON.stringify({
    instances: [{ prompt: styledPrompt }],
    parameters: { sampleCount: 1 },
  });

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      });
      if (!res.ok) throw new Error(`Imagen API error ${res.status}`);
      const json = await res.json();
      const b64 = json?.predictions?.[0]?.bytesBase64Encoded;
      if (!b64) throw new Error('No image data in response');
      return `data:image/png;base64,${b64}`;
    } catch (err) {
      if (attempt === RETRY_DELAYS.length) throw err;
      await new Promise((r) => setTimeout(r, RETRY_DELAYS[attempt]));
    }
  }
}

// ── TTS ───────────────────────────────────────────────────────────────────────

async function speakWithGeminiTts(text, apiKey, voice = 'Puck') {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
      generationConfig: {
        responseModalities: ['AUDIO'],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
      },
    }),
  });
  if (!res.ok) throw new Error(`TTS error ${res.status}`);
  const json = await res.json();
  const b64 = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!b64) throw new Error('No audio data');
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  const ctx = new AudioContext();
  const buffer = await ctx.decodeAudioData(bytes.buffer);
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.connect(ctx.destination);
  return new Promise((resolve) => {
    src.onended = resolve;
    src.start();
  });
}

function speakWithWebSpeech(text) {
  return new Promise((resolve) => {
    const utt = new SpeechSynthesisUtterance(text);
    utt.onend = resolve;
    utt.onerror = resolve;
    speechSynthesis.speak(utt);
  });
}

async function speakPhrase(text, apiKey, voice) {
  try {
    await speakWithGeminiTts(text, apiKey, voice);
  } catch {
    await speakWithWebSpeech(text);
  }
}

// ── Layout helpers ────────────────────────────────────────────────────────────

function getGridCols(width) {
  if (width >= 1024) return 4;
  if (width >= 640) return 3;
  return 2;
}

// ── Particle component ────────────────────────────────────────────────────────

function Particle({ x, y, color, onDone }) {
  const [opacity, setOpacity] = useState(1);
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    let start = null;
    const dur = 600;
    function tick(ts) {
      if (!start) start = ts;
      const pct = (ts - start) / dur;
      if (pct >= 1) {
        onDone();
        return;
      }
      setOpacity(1 - pct);
      setOffsetY(-40 * pct);
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }, [onDone]);

  return (
    <div
      style={{
        position: 'fixed',
        left: x,
        top: y + offsetY,
        width: 12,
        height: 12,
        borderRadius: '50%',
        background: color,
        opacity,
        pointerEvents: 'none',
        zIndex: 9999,
        transform: 'translate(-50%, -50%)',
      }}
    />
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function GestaltAAC() {
  const { apiKey } = useApp();
  const { data: config } = useApiData(fetchAacConfig);

  // ── Core state ──
  const [activeUserId, setActiveUserId] = useState(null);
  const [isTherapistMode, setIsTherapistMode] = useState(false);
  const [activeScene, setActiveScene] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isARMode, setIsARMode] = useState(false);

  // ── Image state ──
  const [images, setImages] = useState({});
  const [imageLoading, setImageLoading] = useState({});
  const [imageErrors, setImageErrors] = useState({});

  // ── Animation state ──
  const [stageActor, setStageActor] = useState(null);
  const [flyingActor, setFlyingActor] = useState(null);
  const [particles, setParticles] = useState([]);

  // ── Layout state ──
  const [containerHeight, setContainerHeight] = useState(window.innerHeight);
  const [gridCols, setGridCols] = useState(getGridCols(window.innerWidth));

  const containerRef = useRef(null);
  const particleIdRef = useRef(0);

  // ── Derived data ──
  const users = config?.users ?? [];
  const scenes = config?.scenes ?? [];
  const phrases = config?.phrases ?? [];

  const currentUserId = activeUserId ?? users[0]?.id ?? null;
  const currentUser = users.find((u) => u.id === currentUserId) ?? null;
  const userScenes = scenes.filter((s) => s.userId === currentUserId);

  const currentSceneId = activeScene ?? userScenes[0]?.id ?? null;
  const currentScene = userScenes.find((s) => s.id === currentSceneId) ?? userScenes[0] ?? null;

  const visiblePhrases = phrases.filter(
    (p) => p.userId === currentUserId && p.sceneId === currentSceneId,
  );

  // ── Init defaults once config loads ──
  useEffect(() => {
    if (config && !activeUserId) {
      const firstUser = config.users?.[0];
      if (!firstUser) return;
      const firstScene = config.scenes?.find((s) => s.userId === firstUser.id);
      setTimeout(() => {
        setActiveUserId(firstUser.id);
        if (firstScene) setActiveScene(firstScene.id);
      }, 0);
    }
  }, [config, activeUserId]);

  // ── Sync scene when user changes ──
  useEffect(() => {
    if (!currentUserId || !scenes.length) return;
    const firstUserScene = scenes.find((s) => s.userId === currentUserId);
    if (!firstUserScene) return;
    setTimeout(() => {
      setActiveScene(firstUserScene.id);
    }, 0);
  }, [currentUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Layout resize ──
  useEffect(() => {
    function onResize() {
      setContainerHeight(window.innerHeight);
      setGridCols(getGridCols(window.innerWidth));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // ── Pre-load images for visible phrases ──
  useEffect(() => {
    if (!apiKey || !visiblePhrases.length) return;
    visiblePhrases.forEach(async (phrase) => {
      if (images[phrase.prompt] || imageLoading[phrase.prompt]) return;
      const cached = await getCachedImage(phrase.prompt);
      if (cached) {
        setImages((prev) => ({ ...prev, [phrase.prompt]: cached }));
        return;
      }
      setImageLoading((prev) => ({ ...prev, [phrase.prompt]: true }));
      try {
        const dataUrl = await fetchAiImageWithRetry(phrase.prompt, apiKey);
        await cacheImagePermanently(phrase.prompt, dataUrl);
        setImages((prev) => ({ ...prev, [phrase.prompt]: dataUrl }));
      } catch {
        setImageErrors((prev) => ({ ...prev, [phrase.prompt]: true }));
      } finally {
        setImageLoading((prev) => ({ ...prev, [phrase.prompt]: false }));
      }
    });
  }, [visiblePhrases, apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Particle burst ──
  const spawnParticles = useCallback((x, y) => {
    const count = 6;
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: ++particleIdRef.current,
      x: x + (Math.random() - 0.5) * 60,
      y: y + (Math.random() - 0.5) * 30,
      color: COLORS[i % COLORS.length],
    }));
    setParticles((prev) => [...prev, ...newParticles]);
  }, []);

  const removeParticle = useCallback((id) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // ── Card tap handler ──
  const handlePhraseCard = useCallback(
    async (phrase, cardEl) => {
      if (isSpeaking) return;

      // Particle burst at card center
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        spawnParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }

      // Flying animation
      const img = images[phrase.prompt] ?? null;
      setFlyingActor({ text: phrase.text, img });
      setTimeout(() => {
        setFlyingActor(null);
        setStageActor({ text: phrase.text, img });
      }, 500);

      // TTS
      setIsSpeaking(true);
      try {
        await speakPhrase(phrase.text, apiKey, currentUser?.voice ?? 'Puck');
      } finally {
        setIsSpeaking(false);
      }
    },
    [isSpeaking, images, apiKey, currentUser, spawnParticles],
  );

  // ── Early return ──
  if (!config) {
    return (
      <div className="p-8 text-center text-slate-400">Loading...</div>
    );
  }

  const slotHeight = 180;
  const stageMobileHeight = Math.round(containerHeight * 0.35);
  const sceneBarBg = currentScene?.bgClass ?? 'scene-home';

  return (
    <>
      {/* Scene background CSS */}
      <style>{`
        .scene-outside {
          background: radial-gradient(ellipse at 50% 110%, #86efac 0%, #bbf7d0 40%, #bae6fd 100%);
        }
        .scene-classroom {
          background: linear-gradient(to bottom, #d2decb, #e1e8dc);
        }
        .scene-home {
          background: #fdf8ee;
        }
        .aac-card-fly {
          animation: aac-fly 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes aac-fly {
          from { transform: scale(1) translateY(0); opacity: 1; }
          to   { transform: scale(0.5) translateY(-120px); opacity: 0; }
        }
      `}</style>

      {/* Particles */}
      {particles.map((p) => (
        <Particle key={p.id} x={p.x} y={p.y} color={p.color} onDone={() => removeParticle(p.id)} />
      ))}

      {/* Flying actor overlay */}
      {flyingActor && (
        <div
          className="aac-card-fly fixed z-50 flex flex-col items-center justify-center rounded-2xl bg-white shadow-2xl"
          style={{ left: '50%', top: '40%', transform: 'translate(-50%,-50%)', width: 120, height: 120, pointerEvents: 'none' }}
        >
          {flyingActor.img
            ? <img src={flyingActor.img} alt="" className="w-16 h-16 object-cover rounded-xl" />
            : <ImageIcon size={40} className="text-slate-300" />}
          <span className="text-xs font-semibold text-slate-700 mt-1 text-center px-1 leading-tight">
            {flyingActor.text}
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        className="flex flex-col h-full overflow-hidden"
        style={{ background: '#FDFBF7', minHeight: 0 }}
      >
        {/* ── Header ── */}
        <header className="flex-none flex items-center gap-2 px-3 py-2 bg-white border-b border-slate-100 shadow-sm">
          {/* Scene tabs */}
          <div className="flex-1 overflow-x-auto flex items-center gap-1 pb-0.5 min-w-0">
            {userScenes.map((scene) => {
              const Icon = ICON_MAP[scene.icon] ?? Star;
              const isActive = scene.id === currentSceneId;
              return (
                <button
                  key={scene.id}
                  onClick={() => setActiveScene(scene.id)}
                  className={`flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? 'bg-violet-600 text-white shadow'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon size={13} />
                  {scene.title}
                </button>
              );
            })}
          </div>

          {/* Profile switcher */}
          <div className="flex-none flex items-center gap-1 ml-1">
            {users.map((u) => (
              <button
                key={u.id}
                onClick={() => setActiveUserId(u.id)}
                title={u.name}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold transition-all border-2 ${
                  u.id === currentUserId
                    ? 'border-violet-500 bg-violet-100 text-violet-700'
                    : 'border-slate-200 bg-slate-100 text-slate-500 hover:border-slate-300'
                }`}
              >
                {u.name.charAt(0)}
              </button>
            ))}
          </div>

          {/* Therapist mode toggle */}
          <button
            onClick={() => setIsTherapistMode((v) => !v)}
            title={isTherapistMode ? 'Lock (user mode)' : 'Unlock (therapist mode)'}
            className={`flex-none ml-1 p-1.5 rounded-full transition-colors ${
              isTherapistMode
                ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
            }`}
          >
            {isTherapistMode ? <Unlock size={15} /> : <Lock size={15} />}
          </button>
        </header>

        {/* ── Body ── */}
        <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">

          {/* ── Left: Exploration Stage ── */}
          <div
            className={`flex-none relative overflow-hidden ${sceneBarBg}`}
            style={{ height: stageMobileHeight, minHeight: stageMobileHeight }}
          >
            {/* AR toggle */}
            <button
              onClick={() => setIsARMode((v) => !v)}
              className="absolute top-2 right-2 z-10 flex items-center gap-1 px-2 py-1 rounded-full bg-black/20 text-white text-xs font-medium hover:bg-black/30 transition-colors"
            >
              <Camera size={12} />
              {isARMode ? 'AR On' : 'AR'}
            </button>

            {/* Stage actor */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
              {stageActor ? (
                <>
                  {stageActor.img ? (
                    <img
                      src={stageActor.img}
                      alt={stageActor.text}
                      className="w-24 h-24 object-cover rounded-2xl shadow-lg mb-2"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl bg-white/60 flex items-center justify-center mb-2 shadow">
                      <ImageIcon size={32} className="text-slate-400" />
                    </div>
                  )}
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full shadow text-sm font-bold text-slate-700 text-center max-w-[160px]">
                    {stageActor.text}
                  </div>
                  {isSpeaking && (
                    <div className="mt-1 flex items-center gap-1 text-violet-600 text-xs font-medium">
                      <Loader2 size={12} className="animate-spin" />
                      Speaking…
                    </div>
                  )}
                  <button
                    onClick={() => setStageActor(null)}
                    className="mt-2 p-1 rounded-full bg-white/60 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center text-center opacity-50">
                  <CheckCircle2 size={36} className="text-slate-400 mb-2" />
                  <p className="text-slate-500 text-xs font-medium">Tap a card to communicate</p>
                </div>
              )}
            </div>
          </div>

          {/* Desktop stage: override to percentage height */}
          <style>{`
            @media (min-width: 1024px) {
              .aac-stage-desktop { width: 45% !important; height: 100% !important; }
            }
          `}</style>

          {/* ── Right: Phrase Grid ── */}
          <div className="flex-1 overflow-y-auto p-3">
            {visiblePhrases.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                <ImageIcon size={28} className="mb-2 opacity-40" />
                No phrases in this scene.
              </div>
            ) : (
              <div
                className="grid gap-3"
                style={{
                  gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
                }}
              >
                {visiblePhrases.map((phrase, idx) => {
                  const borderRadius = BORDER_STYLES[idx % BORDER_STYLES.length];
                  const borderColor = COLORS[idx % COLORS.length];
                  const imgSrc = images[phrase.prompt];
                  const loading = imageLoading[phrase.prompt];
                  const hasError = imageErrors[phrase.prompt];

                  return (
                    <PhraseCard
                      key={phrase.id}
                      phrase={phrase}
                      imgSrc={imgSrc}
                      loading={loading}
                      hasError={hasError}
                      borderRadius={borderRadius}
                      borderColor={borderColor}
                      slotHeight={slotHeight}
                      onTap={handlePhraseCard}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ── PhraseCard ────────────────────────────────────────────────────────────────

function PhraseCard({ phrase, imgSrc, loading, hasError, borderRadius, borderColor, slotHeight, onTap }) {
  const cardRef = useRef(null);

  return (
    <button
      ref={cardRef}
      onClick={() => onTap(phrase, cardRef.current)}
      className="relative flex flex-col items-center justify-end overflow-hidden bg-white focus:outline-none active:scale-95 transition-transform"
      style={{
        height: slotHeight,
        borderRadius,
        border: `3px solid ${borderColor}`,
        boxShadow: `0 4px 12px ${borderColor}88`,
      }}
    >
      {/* Image area */}
      <div className="flex-1 w-full flex items-center justify-center p-2">
        {loading && (
          <Loader2 size={28} className="text-slate-300 animate-spin" />
        )}
        {!loading && imgSrc && (
          <img
            src={imgSrc}
            alt={phrase.text}
            className="w-full h-full object-cover rounded-xl"
            style={{ maxHeight: slotHeight - 44 }}
          />
        )}
        {!loading && !imgSrc && !hasError && (
          <div className="flex flex-col items-center opacity-30">
            <ImageIcon size={28} className="text-slate-400" />
          </div>
        )}
        {hasError && (
          <div className="flex flex-col items-center opacity-40">
            <X size={20} className="text-red-400" />
            <span className="text-[10px] text-slate-400 mt-0.5">No image</span>
          </div>
        )}
      </div>

      {/* Label */}
      <div
        className="w-full px-2 py-1.5 text-center"
        style={{ background: `${borderColor}cc` }}
      >
        <span className="text-xs font-bold text-slate-700 leading-tight line-clamp-2">
          {phrase.text}
        </span>
      </div>
    </button>
  );
}
