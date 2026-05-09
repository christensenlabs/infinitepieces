import React, { useState, useEffect } from 'react';

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

export default DigitalClock;
