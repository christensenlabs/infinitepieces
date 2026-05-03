import React, { useState } from 'react';

const PARENT_EXAMPLES = [
  {
    title: 'Liam S. - Sick Call',
    desc: 'System auto-texted parent. Parent selected Thursday at 4:00 PM for makeup via 1-click link.',
    saved: '$225',
  },
  {
    title: 'Emma W. - No Show',
    desc: 'Parent ignored initial text. Soft Penalty ($75) applied. Parent rebooked instantly to waive fee.',
    saved: '$300',
  },
  {
    title: 'Noah B. - Vacation',
    desc: 'System intercepted 48 hours out. Pushed to available makeup slot on Friday morning.',
    saved: '$150',
  },
];

const STAFF_EXAMPLES = [
  {
    title: 'Sarah M. - Called Out Sick',
    desc: 'Shift dropped to SubPool. Claimed by Michael T. in 4 mins with $15 Surge Bounty.',
    saved: '$135 Margin',
  },
  {
    title: 'Jessica L. - Flat Tire',
    desc: 'Shift dropped to SubPool. Claimed by David C. in 2 mins with $25 Surge Bounty.',
    saved: '$125 Margin',
  },
  {
    title: 'Marco R. - Emergency',
    desc: 'No RBT claim. System automatically pivoted to 97156 Parent Training with BCBA via Telehealth.',
    saved: '$180 Revenue',
  },
];

const REPLACEMENT_COST = 5000;
const HOURLY_RATE = 75;
const BCBA_HOURLY_VALUE = 85;
const BCBA_ADMIN_WASTE_HRS = 5;
const WEEKS_PER_MONTH = 4;
const PLATFORM_FEE = 2500;

const sliderStyle = {
  WebkitAppearance: 'none',
  width: '100%',
  height: '6px',
  background: '#1e3a8a',
  borderRadius: '5px',
  outline: 'none',
};

const ROICalculator = () => {
  const [lostRbts, setLostRbts] = useState(1);
  const [canceledHours, setCanceledHours] = useState(15);
  const [bcbas, setBcbas] = useState(5);
  const [recoveryRate, setRecoveryRate] = useState(75);
  const [parentIndex, setParentIndex] = useState(-1);
  const [staffIndex, setStaffIndex] = useState(-1);

  const turnoverCost = lostRbts * REPLACEMENT_COST;
  const droppedBilling = canceledHours * HOURLY_RATE * WEEKS_PER_MONTH;
  const bcbaWasteCost = bcbas * BCBA_ADMIN_WASTE_HRS * WEEKS_PER_MONTH * BCBA_HOURLY_VALUE;
  const totalMonthlyLeak = turnoverCost + droppedBilling + bcbaWasteCost;

  const retentionSaved = turnoverCost * (recoveryRate / 100);
  const revenueProtected = droppedBilling * (recoveryRate / 100);
  const bcbaTimeSaved = bcbaWasteCost * (recoveryRate / 100);
  const netProfit = retentionSaved + revenueProtected + bcbaTimeSaved - PLATFORM_FEE;

  const reset = () => {
    setLostRbts(1);
    setCanceledHours(15);
    setBcbas(5);
    setRecoveryRate(75);
  };

  return (
    <section id="roi" className="py-20 px-6 bg-[#03060D] text-slate-200">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <span className="bg-emerald-900/40 text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded border border-emerald-500/30">
            Enterprise Sales Weapon
          </span>
          <h2 className="text-4xl font-black text-white mt-3 mb-2">The Leak-Proof Clinic</h2>
          <p className="text-sm text-slate-400 max-w-2xl">
            A command center that proves the owner is losing money using industry benchmarks, then
            shows exactly how Infinite Pieces AI recovers it through parent makeup automation, RBT
            retention support, and BCBA admin reduction.
          </p>
        </div>

        <div className="bg-[#0A1220] border border-cyan-500/30 rounded-3xl p-6 md:p-8 shadow-[0_0_30px_rgba(0,229,255,0.05)]">
          {/* Title bar */}
          <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
            <div className="w-10 h-10 bg-cyan-500/20 text-cyan-400 rounded-lg flex items-center justify-center text-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-black text-white">Live ROI Closer</h3>
              <p className="text-[10px] text-slate-400">
                Ask the owner for their numbers. Let their own operational bleed sell the
                subscription.
              </p>
            </div>
            <div className="ml-auto flex gap-2">
              <button className="bg-cyan-500/10 border border-cyan-500/50 text-cyan-400 text-xs font-bold px-4 py-2 rounded-lg hover:bg-cyan-500/20 transition">
                AI SUMMARY
              </button>
              <button
                onClick={reset}
                className="bg-white/5 border border-white/10 text-slate-300 text-xs font-bold px-4 py-2 rounded-lg hover:bg-white/10 transition"
              >
                RESET
              </button>
            </div>
          </div>

          {/* Section 1: Inputs */}
          <div className="mb-10">
            <h4 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-6">
              1. Input Clinic Leaks
            </h4>
            <div className="space-y-6 pl-4 border-l-2 border-slate-800">
              <SliderInput
                label="Lost RBTs / Month"
                assumption="$5,000 Replacement Cost Each"
                value={lostRbts}
                min={0}
                max={10}
                onChange={setLostRbts}
              />
              <SliderInput
                label="Canceled Hours / Week"
                assumption="$75 Billing Value Per Hour"
                value={canceledHours}
                min={0}
                max={100}
                onChange={setCanceledHours}
              />
              <SliderInput
                label="BCBAs on Staff"
                assumption="5 Hrs/Week Lost to Manual Admin @ $85/Hr Value"
                value={bcbas}
                min={1}
                max={50}
                onChange={setBcbas}
              />
              <SliderInput
                label="Platform Recovery Rate"
                assumption="Conservative Demo Variable for Automated Recovery"
                value={recoveryRate}
                min={0}
                max={100}
                onChange={setRecoveryRate}
                suffix="%"
                className="pt-2"
              />
            </div>
          </div>

          {/* Section 2: Cash Bleed */}
          <div className="mb-6 bg-rose-950/20 border border-rose-900/50 rounded-2xl p-6">
            <h4 className="text-xs font-black text-rose-500 uppercase tracking-widest mb-4">
              2. Current Cash Bleed (Monthly)
            </h4>
            <div className="space-y-2 mb-4 text-sm font-bold text-slate-300">
              <div className="flex justify-between">
                <span>Turnover Costs</span>
                <span>-${turnoverCost.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Dropped Billing</span>
                <span>-${droppedBilling.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-rose-400">
                <span>BCBA Admin Waste</span>
                <span>-${bcbaWasteCost.toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-rose-900/50">
              <p className="text-[10px] uppercase font-bold text-slate-500 mb-1">
                Total Monthly Leak
              </p>
              <p className="text-4xl font-black text-[#FF3366] drop-shadow-[0_0_10px_rgba(255,51,102,0.6)]">
                -${totalMonthlyLeak.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Section 3: Net Value */}
          <div className="mb-8 bg-emerald-950/20 border border-emerald-900/50 rounded-2xl p-6 shadow-[0_0_20px_rgba(0,255,157,0.05)]">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-4">
              3. IAT Net Value
            </h4>
            <div className="space-y-2 mb-4 text-sm font-bold text-slate-300">
              <div className="flex justify-between">
                <span>Retention Saved</span>
                <span className="text-emerald-400">+${retentionSaved.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Revenue Protected</span>
                <span className="text-emerald-400">+${revenueProtected.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>BCBA Time Recovered</span>
                <span className="text-emerald-400">+${bcbaTimeSaved.toLocaleString()}</span>
              </div>
              <div className="flex justify-between opacity-70 pt-2 border-t border-emerald-900/30">
                <span>Platform Fee</span>
                <span>-${PLATFORM_FEE.toLocaleString()}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-emerald-900/50">
              <p className="text-[10px] uppercase font-bold text-emerald-600 mb-1">
                Net Profit After Fee
              </p>
              <p
                className={
                  netProfit >= 0
                    ? 'text-5xl font-black text-[#00FF9D] drop-shadow-[0_0_15px_rgba(0,255,157,0.4)]'
                    : 'text-5xl font-black text-rose-500'
                }
              >
                {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Demo Buttons */}
          <div className="space-y-4 mb-8">
            <ExampleCycler
              title="Parent Cancellation Recovery"
              description="Cycles through 3 parent cancellation examples and shows how each missed session is converted into a makeup."
              buttonLabel="Generate Parent Cancel Example"
              examples={PARENT_EXAMPLES}
              activeIndex={parentIndex}
              onCycle={() => setParentIndex((prev) => (prev + 1) % PARENT_EXAMPLES.length)}
              borderColor="cyan"
            />
            <ExampleCycler
              title="Staff Callout Coverage"
              description="Cycles through a staff cancellation example and assigns qualified coverage from pre-approved availability."
              buttonLabel="Generate Staff Callout Example"
              examples={STAFF_EXAMPLES}
              activeIndex={staffIndex}
              onCycle={() => setStaffIndex((prev) => (prev + 1) % STAFF_EXAMPLES.length)}
              borderColor="amber"
            />
          </div>

          {/* Owner Pitch Script */}
          <div className="bg-[#040811] border border-white/10 rounded-xl p-6">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
              Owner Pitch Script
            </p>
            <p className="text-sm text-slate-300 italic leading-relaxed">
              &ldquo;Your clinic is leaking money in three places: missed sessions that never get
              rebooked, overwhelmed RBTs who leave, and highly-paid BCBAs acting as expensive
              administrators. IAT turns cancellations into makeups, fills dropped slots
              automatically, and uses AI to cut BCBA admin time by 5 hours a week. The platform does
              not sell convenience. It sells recovered revenue and protected staff capacity.&rdquo;
            </p>
          </div>
        </div>
      </div>

    </section>
  );
};

/* ---- Sub-components ---- */

function SliderInput({ label, assumption, value, min, max, onChange, suffix = '', className = '' }) {
  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-1">
        <label className="text-sm font-bold text-white">{label}</label>
        <span className="text-2xl font-black text-cyan-400">
          {value}
          {suffix}
        </span>
      </div>
      <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">
        Assumption: {assumption}
      </p>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={sliderStyle}
        className="slider-thumb"
      />
    </div>
  );
}

const COLOR_VARIANTS = {
  cyan: {
    wrapper: 'border-cyan-500/30 bg-cyan-950/20',
    button: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/30',
    result: 'border-cyan-500/30',
  },
  amber: {
    wrapper: 'border-amber-500/30 bg-amber-950/20',
    button: 'bg-amber-500/20 border-amber-500/50 text-amber-400 hover:bg-amber-500/30',
    result: 'border-amber-500/30',
  },
};

function ExampleCycler({
  title,
  description,
  buttonLabel,
  examples,
  activeIndex,
  onCycle,
  borderColor,
}) {
  const colors = COLOR_VARIANTS[borderColor] ?? COLOR_VARIANTS.cyan;
  return (
    <div className={`border ${colors.wrapper} p-4 rounded-xl transition-all`}>
      <h5 className="font-bold text-white mb-1">{title}</h5>
      <p className="text-xs text-slate-400 mb-3">{description}</p>
      <button
        onClick={onCycle}
        className={`w-full ${colors.button} border py-2 rounded-lg text-xs font-bold transition mb-3`}
      >
        {buttonLabel}
      </button>
      {activeIndex >= 0 && (
        <div className={`bg-[#040811] p-3 rounded-lg border ${colors.result}`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-bold text-white">{examples[activeIndex].title}</span>
            <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Saved: {examples[activeIndex].saved}
            </span>
          </div>
          <p className="text-xs text-slate-300">{examples[activeIndex].desc}</p>
        </div>
      )}
    </div>
  );
}

export default ROICalculator;
