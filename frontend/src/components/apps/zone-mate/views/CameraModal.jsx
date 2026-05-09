import React from 'react';
import { X } from 'lucide-react';

function CameraModal({ videoRef, canvasRef, streamRef, onTakePhoto, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex flex-col items-center justify-center p-4 lg:p-8 animate-in fade-in">
      <button onClick={onClose} className="absolute top-6 right-6 p-3 bg-white/20 hover:bg-white/30 rounded-full text-white transition-colors z-50">
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
            onClick={onTakePhoto}
            className="w-16 h-16 bg-white/40 border-4 border-white rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 bg-white rounded-full"></div>
          </button>
        </div>
      </div>
      <p className="text-white mt-6 font-bold text-center animate-pulse">Position the reward in the frame and snap!</p>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}

export default CameraModal;
