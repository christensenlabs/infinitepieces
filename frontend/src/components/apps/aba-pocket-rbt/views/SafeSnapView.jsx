import React from 'react';
import {
  ShieldCheck, ShieldAlert, Camera, Globe, CheckCircle2,
  Image as ImageIcon, ScanFace, UserCircle
} from 'lucide-react';

export default function SafeSnapView({ cameraStep, setCameraStep, onSimulateCapture, onSimulateBlur, onSimulatePost }) {
  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl overflow-hidden shadow-inner relative flex flex-col">
        {/* Header */}
        <div className="bg-slate-950 p-3 flex justify-between items-center text-slate-400 text-xs font-mono">
          <span className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-500"/> HIPAA FIREWALL ACTIVE</span>
          <span>v2.1 EDGE-AI</span>
        </div>

        {/* Viewfinder Simulation Area */}
        <div className="h-64 sm:h-96 w-full bg-slate-800 relative flex items-center justify-center overflow-hidden">

          {cameraStep === 'idle' && (
            <div className="text-center p-6">
              <ImageIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 font-medium">Ready to capture.</p>
              <p className="text-slate-500 text-sm mt-1">Faces will be scanned instantly on-device.</p>
            </div>
          )}

          {cameraStep === 'scanning' && (
            <div className="text-center z-10">
              <ScanFace className="w-16 h-16 text-indigo-400 mx-auto mb-4 animate-pulse" />
              <p className="text-indigo-300 font-bold tracking-widest uppercase">Scanning Faces...</p>
            </div>
          )}

          {(cameraStep === 'flagged' || cameraStep === 'safe' || cameraStep === 'posted') && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-700">
              {/* Mock Photo Representation */}
              <div className="w-3/4 h-3/4 bg-slate-600 rounded-lg relative flex items-center justify-around p-4 shadow-2xl">

                {/* Child 1 (Authorized) */}
                <div className="relative w-1/3 h-2/3 border-2 border-emerald-500 bg-slate-500 rounded flex items-center justify-center">
                  <span className="absolute -top-6 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">ID: #402 (Consent)</span>
                  <UserCircle className="w-12 h-12 text-slate-300" />
                </div>

                {/* Child 2 (Unauthorized) */}
                <div className={`relative w-1/3 h-2/3 border-2 transition-all duration-500 bg-slate-500 rounded flex items-center justify-center ${cameraStep === 'flagged' ? 'border-rose-500' : 'border-emerald-500 blur-sm overflow-hidden'}`}>
                  {cameraStep === 'flagged' && <span className="absolute -top-6 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg animate-bounce">ID: #881 (NO CONSENT)</span>}
                  {cameraStep !== 'flagged' && <span className="absolute -top-6 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded z-20">BLURRED</span>}
                  <UserCircle className="w-12 h-12 text-slate-300" />
                  {cameraStep !== 'flagged' && <div className="absolute inset-0 backdrop-blur-md bg-slate-400/50"></div>}
                </div>

              </div>

              {/* Red Flag Overlay Overlay */}
              {cameraStep === 'flagged' && (
                <div className="absolute inset-0 bg-rose-900/80 flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                  <ShieldAlert className="w-16 h-16 text-rose-300 mb-4" />
                  <h3 className="text-white font-bold text-xl uppercase tracking-wider">Privacy Risk Detected</h3>
                  <p className="text-rose-200 mt-2 max-w-sm">We detected Liam S. in this photo. He does not have Tier 2 Media Consent. You cannot post this raw image.</p>
                  <button onClick={onSimulateBlur} className="mt-6 bg-white text-rose-900 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                    Auto-Blur Peers
                  </button>
                </div>
              )}

              {/* Success Overlay */}
              {cameraStep === 'posted' && (
                <div className="absolute inset-0 bg-emerald-900/90 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in-95">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mb-4" />
                  <h3 className="text-white font-bold text-xl uppercase tracking-wider">Posted Safely</h3>
                  <p className="text-emerald-200 mt-2">Log: Prevention ID #992 generated.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Controls Footer */}
        <div className="bg-slate-950 p-6 flex justify-center gap-4">
          {cameraStep === 'idle' && (
            <button onClick={onSimulateCapture} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-slate-200 transition-colors">
              <Camera className="w-5 h-5" /> Simulate Camera Capture
            </button>
          )}
          {cameraStep === 'safe' && (
            <button onClick={onSimulatePost} className="bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-colors animate-in slide-in-from-bottom-4">
              <Globe className="w-5 h-5" /> Post to Community Feed
            </button>
          )}
          {cameraStep === 'posted' && (
            <button onClick={() => setCameraStep('idle')} className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-full font-bold transition-colors">
              Take Another
            </button>
          )}
        </div>
      </div>

      {/* Educational Pitch Context */}
      <div className="bg-indigo-50 text-indigo-900 p-5 rounded-xl border border-indigo-100 text-sm">
        <h4 className="font-bold mb-2 text-indigo-800 flex items-center gap-2"><ShieldCheck className="w-5 h-5"/> The &ldquo;Liability Shield&rdquo; in Action</h4>
        <p className="mb-2">This is the Safe-Snap protocol. If an RBT tries to capture an unauthorized peer, the on-device AI intercepts it before the photo is even saved to memory. </p>
        <p>By forcing automatic anonymization, you retain parents with a Community Social Feed, without exposing the clinic to HIPAA violations.</p>
      </div>
    </div>
  );
}
