const DEFAULT_POOLS = {
  approved: {
    label: "Active / Approved",
    short: "Approved",
    dot: "bg-emerald-500",
    className: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
  baseline: {
    label: "Pending Baseline",
    short: "Baseline",
    dot: "bg-blue-500",
    className: "bg-blue-50 text-blue-800 border-blue-200",
  },
  candidate: {
    label: "BCBA Drafts",
    short: "Draft",
    dot: "bg-purple-500",
    className: "bg-purple-50 text-purple-800 border-purple-200",
  },
  revision: {
    label: "Needs Revision",
    short: "Revision",
    dot: "bg-amber-500",
    className: "bg-amber-50 text-amber-800 border-amber-200",
  },
  archived: {
    label: "Archived / Mastered",
    short: "Archived",
    dot: "bg-slate-400",
    className: "bg-slate-100 text-slate-700 border-slate-300",
  },
};

const DEFAULT_FLAG_TYPES = {
  baselineData: "Baseline Data Logged",
  successRBT: "Working Well for RBT",
  successHome: "Working Well at Home",
  interest: "Interested in Running",
  newPlan: "Request New Target",
  wording: "Needs Clearer Wording",
  barrier: "Implementation Barrier",
  question: "Question for BCBA",
  stagnant: "Program Stagnant (No Progress)",
};

const DEFAULT_DOMAINS = [
  "Early Echoics",
  "Listener Responding (LR)",
  "Motor Imitation",
  "Tacting",
  "Manding",
  "Intraverbals",
  "Social & Play Skills",
  "Daily Living / Adaptive",
  "Behavior Reduction",
  "Tolerance & Coping",
  "Executive Functioning",
  "School Readiness"
];

const DEFAULT_PROGRAM_TEMPLATES = {
  DTT: {
    method: "DTT (Discrete Trial Training)",
    procedure: "1. Clear environment of extraneous distractors.\n2. Establish attending (e.g., 'Look', eye contact, or quiet body).\n3. Deliver SD clearly and neutrally without extra verbiage.\n4. Wait 3 seconds for response.",
    promptPlan: "0-second delay Errorless Learning for acquisition targets (Most-to-Least). Fade to 3-second delay once independent responses emerge.",
    reinforcementPlan: "FR-1: Deliver behavior-specific praise and access to highly preferred item within 0.5s of correct independent response. Differential (lesser) reinforcement for prompted responses.",
    errorCorrection: "4-Step Error Correction: Model -> Prompt -> Switch (2 mastered distractors) -> Repeat original SD.",
    dataCollection: "Trial-by-trial. Score: Independent (+), Prompted (P), Error (-).",
  },
  NET: {
    method: "NET (Natural Environment Teaching)",
    procedure: "1. Seed the environment with preferred items out of reach or in locked containers.\n2. Capture or contrive a Motivating Operation (MO).\n3. Wait for client to initiate/show interest.",
    promptPlan: "Least-to-Most (LTM). Utilize an expectant pause (3-5s). If no response, provide an indirect verbal prompt, then a direct verbal/model prompt.",
    reinforcementPlan: "Natural Contingency: Immediately deliver the specific item or action requested. Pair with natural social praise.",
    errorCorrection: "If maladaptive behavior occurs or incorrect mand, withhold item neutrally. Re-establish MO, and immediately prompt the correct response.",
    dataCollection: "Frequency of independent vs. prompted mands per session.",
  },
  PRT: {
    method: "PRT (Pivotal Response Treatment)",
    procedure: "1. Establish shared control via child-led play.\n2. Intersperse maintenance (easy) and acquisition (hard) tasks (80/20 ratio).\n3. Provide natural opportunities for target behavior within the play routine.",
    promptPlan: "Follow client's lead. Use time delay. Prompt only to facilitate access to the natural reinforcer.",
    reinforcementPlan: "Direct Natural Reinforcement. Reinforce clear *attempts* or approximations to shape terminal behavior, maintaining high behavioral momentum.",
    errorCorrection: "If no response, re-model the target playfully. Do not force compliance if motivation drops; pivot to a new shared activity to rebuild momentum.",
    dataCollection: "Probe data or rating scale on initiation and joint attention.",
  },
  TA: {
    method: "TA (Task Analysis)",
    procedure: "1. Ensure terminal environment is prepared (e.g., sink area for handwashing).\n2. Bring client to area and deliver initial SD ('Time to wash hands').\n3. Allow client to complete steps independently.",
    promptPlan: "Total Task Presentation with Least-to-Most prompting per step. Alternatively, Forward/Backward chaining depending on client baseline.",
    reinforcementPlan: "Provide brief, non-disruptive praise during intermediate steps. Deliver terminal reinforcement immediately upon completion of the final step.",
    errorCorrection: "If latency >3s or incorrect topography occurs on a step, physically prompt that specific step to completion, then allow independence on the next step.",
    dataCollection: "TA Data Sheet. Score independence level for each micro-step in the chain.",
  }
};

const DEFAULT_ACE_CURRICULUM = [
  { domain: "Manding", title: "Mand for Missing Item", method: "NET", desc: "Learner requests an item required to complete a task (e.g., spoon for yogurt)." },
  { domain: "Manding", title: "Mand for Information (Where/Who)", method: "NET", desc: "Learner asks 'Where is it?' when a preferred item is hidden." },
  { domain: "Tacting", title: "Tact 2-Component Noun-Verb", method: "DTT", desc: "Learner tacts pictures of actions (e.g., 'Boy running', 'Dog sleeping')." },
  { domain: "Tacting", title: "Tact Internal States", method: "NET", desc: "Learner identifies feeling hungry, thirsty, tired, or in pain." },
  { domain: "Listener Responding (LR)", title: "LR: Feature, Function, Class", method: "DTT", desc: "Learner selects items from an array based on FFC (e.g., 'Touch the one you eat with')." },
  { domain: "Listener Responding (LR)", title: "LR: Multi-step Directions", method: "NET", desc: "Learner follows 2-step related instructions (e.g., 'Get your shoes and put them on')." },
  { domain: "Social & Play Skills", title: "Initiate Peer Play", method: "PRT", desc: "Learner approaches a peer and asks 'Can I play?' or offers a toy." },
  { domain: "Tolerance & Coping", title: "Tolerate Denied Access", method: "NET", desc: "Learner accepts 'No' or 'Wait' without maladaptive behavior, using a visual timer." },
  { domain: "Daily Living / Adaptive", title: "Handwashing", method: "TA", desc: "Learner independently completes a 7-step handwashing chain." },
  { domain: "Behavior Reduction", title: "FCT for Escape", method: "NET", desc: "Learner hands a 'Break' card instead of eloping or engaging in property destruction." }
];

export {
  DEFAULT_POOLS,
  DEFAULT_FLAG_TYPES,
  DEFAULT_DOMAINS,
  DEFAULT_PROGRAM_TEMPLATES,
  DEFAULT_ACE_CURRICULUM,
};
