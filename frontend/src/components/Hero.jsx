import React from 'react';

const Hero = () => (
  <section className="pt-32 pb-20 px-6 relative bg-brand-dark">
    <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-blue-900/20 blur-[120px] rounded-full pointer-events-none" />

    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10 pt-10">
      <div className="flex-1">
        <div className="inline-block bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs font-bold text-accent uppercase tracking-widest mb-6">
          2026 Behavioral Health Benchmarks
        </div>
        <h1 className="text-6xl lg:text-7xl font-black mb-6 leading-[1.1] tracking-tight text-white">
          Recovered{' '}
          <span className="bg-gradient-to-r from-white to-indigo-300 bg-clip-text text-transparent">
            Hours.
          </span>
          <br />
          Retained <span className="text-accent-gold">Talent.</span>
          <br />
          Automated ABA.
        </h1>
        <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
          Infinite Pieces AI provides the exact pieces you need to be whole. We intercept
          cancellations, automate make-up sessions, and provide real-time field support for
          RBTs&mdash;stopping revenue leakage and staff burnout before they start.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="#roi"
            className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold hover:bg-blue-500 transition shadow-[0_0_20px_rgba(37,99,235,0.4)] flex items-center gap-2"
          >
            Calculate Your ROI
          </a>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;
