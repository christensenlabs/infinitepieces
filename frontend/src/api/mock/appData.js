// ─── Mock data extracted from Tyler's app modules ───
// Each export maps to a GET endpoint so components can fetch via useApiData.

// ── Clinic Scheduler ──
export const mockSchedulerConfig = {
  adminPin: '000000',
  defaultBounty: 35,
  billableHoursMultiplier: 2,
  sessionTypes: {
    clinical: ['1:1 Therapy', 'Group Therapy', 'Parent Training'],
    admin: ['Prep / Planning', 'Drive Time', 'Meeting', 'Other Non-Billable'],
  },
  staffPool: ['Sarah Jenkins', 'David Chen', 'Amanda Rivera'],
  defaultSession: {
    category: 'clinical',
    patientName: '',
    date: '',
    startTime: '09:00',
    endTime: '11:00',
    type: '1:1 Therapy',
    location: 'Clinic',
    staffName: '',
  },
};

// ── SubPool Marketplace ──
export const mockSubPoolConfig = {
  defaultBounty: 10,
  bountyBoost: 15,
  profiles: {
    scheduler: { name: 'Sam (Scheduler)', color: 'text-blue-400', bg: 'bg-blue-500/20' },
    rbt: { name: 'Michael T. (RBT)', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    bcba: { name: 'Amanda R. (BCBA)', color: 'text-purple-400', bg: 'bg-purple-500/20' },
  },
};

// ── Compliance Sentinel ──
export const mockComplianceConfig = {
  cptCodes: ['97153 (Direct Tech)', '97155 (Protocol Mod)', '97151 (Assessment)'],
  providerRoles: ['RBT', 'BCBA'],
  supervisionThreshold: 5.0,
  defaultClaimForm: {
    client: '', date: '', code1: '97153', code2: '', modifier: false, sig: true, gps: true,
  },
  defaultAuthForm: {
    client: '', payer: '', code: '97153', total: 100, used: 0, expire: '',
  },
  defaultProviderForm: {
    name: '', role: 'RBT', bacbExp: '', oigCleared: true, supPercent: 5.0,
  },
};

// ── DataFlow Pro ──
export const mockDataFlowClients = [
  { id: 1, name: 'Jane Doe', age: 5, profile: 'Non-verbal, sensory-seeking, elopement risk.' },
  { id: 2, name: 'John Doe', age: 9, profile: 'Gestalt Language Processor (GLP).' },
];

export const mockDataFlowPrograms = [
  { id: 101, clientId: 1, domain: 'Language & Comm', target: 'Mand for Break', method: 'NET', description: 'Learner will exchange a break card.', isNew: false },
  { id: 102, clientId: 1, domain: 'Tolerance', target: 'Waiting (1 min)', method: 'DTT', description: 'Learner will wait with calm body.', isNew: false },
];

export const mockDataFlowConfig = {
  systemSettings: { bcbaPin: '222222', rbtPin: '333333', caregiverPin: '111111' },
  trialResponseTypes: ['IND', 'V', 'M', 'ERR'],
  behaviorTrackingTypes: ['frequency', 'duration'],
};

// ── ABA Pocket RBT Mentor ──
export const mockRbtMentorClients = {
  'Noah S.': 'Dinosaurs, kinetic sand, spinning objects, water play',
  'Emma W.': 'Baby Shark, bubbles, tickles, chase, light-up toys',
  'Liam T.': 'Trains, iPad games, lining up blocks, snacks',
};

export const mockBehaviorTemplates = [
  { name: 'Physical Aggression', function: 'Access / Escape', context: 'Hitting, kicking, biting during transitions or demands' },
  { name: 'Elopement', function: 'Escape / Sensory', context: 'Running from designated area without permission' },
  { name: 'Severe SIB', function: 'Automatic / Escape', context: 'Head-banging, hand-biting, skin-picking' },
  { name: 'Property Destruction', function: 'Access / Escape', context: 'Throwing, breaking, sweeping items off surfaces' },
  { name: 'Task Refusal', function: 'Escape', context: 'Verbal refusal, dropping to floor, turning away' },
  { name: 'Spitting', function: 'Attention / Escape', context: 'Spitting at peers or staff during structured activities' },
  { name: 'Pica', function: 'Automatic', context: 'Ingesting non-food items' },
  { name: 'Disrobing', function: 'Automatic / Sensory', context: 'Removing clothing in inappropriate settings' },
  { name: 'Feces Smearing', function: 'Automatic / Sensory', context: 'Smearing or playing with feces' },
  { name: 'Motor Stereotypy', function: 'Automatic', context: 'Hand flapping, body rocking, spinning in circles' },
  { name: 'Vocal Stereotypy', function: 'Automatic', context: 'Repetitive sounds, scripting, echolalia beyond functional use' },
  { name: 'Verbal Aggression', function: 'Attention / Escape', context: 'Threats, profanity, screaming directed at others' },
  { name: 'Mouthing', function: 'Automatic / Sensory', context: 'Placing non-food objects in mouth' },
  { name: 'Non-compliance', function: 'Escape', context: 'Failure to initiate task within 5 seconds of instruction' },
  { name: 'Environmental Manipulation', function: 'Access / Control', context: 'Moving furniture, blocking doors, hiding materials' },
];

export const mockRbtMentorPermissions = {
  RBT: ['quick', 'abAnalyzer', 'programMentor', 'genMatrix', 'jargon', 'playIdeas', 'parentGuide', 'socialStory', 'objectiveNote', 'visualSchedule', 'siblingExplainer', 'iepDecoder'],
  Parent: ['playIdeas', 'genMatrix', 'socialStory', 'parentGuide', 'siblingExplainer', 'iepDecoder'],
};

// ── BCBA Pocket ──
export const mockBcbaClients = [
  { id: 1, initials: 'J.D.', age: '5 yrs 2 mo', diagnosis: 'F84.0', authExpiry: '2026-05-15', status: 'Active', intensity: '30 hrs/wk' },
  { id: 2, initials: 'A.M.', age: '3 yrs 8 mo', diagnosis: 'F84.0', authExpiry: '2026-04-28', status: 'Expiring Soon', intensity: '15 hrs/wk' },
  { id: 3, initials: 'S.R.', age: '8 yrs 1 mo', diagnosis: 'F84.0, F90.0', authExpiry: '2026-08-20', status: 'Active', intensity: '20 hrs/wk' },
  { id: 4, initials: 'E.B.', age: '4 yrs 5 mo', diagnosis: 'F84.0', authExpiry: '2026-05-02', status: 'Auth Pending', intensity: '25 hrs/wk' },
];

export const mockBcbaConfig = {
  defaultProgramData: {
    domain: 'Communication',
    type: 'DTT (Discrete Trial Training)',
    promptStrategy: 'Least-to-Most (LTM)',
    mastery: '80% across 3 consecutive sessions',
  },
  defaultSoapData: { sessionLength: '120 mins' },
  domains: ['Communication', 'Social Skills', 'Adaptive/Daily Living', 'Play & Leisure', 'Motor Skills', 'Executive Functioning'],
  teachingMethods: ['DTT', 'NET', 'TA', 'Shaping'],
  promptStrategies: ['Least-to-Most (LTM)', 'Most-to-Least (MTL)', 'Errorless', 'Progressive Time Delay', 'Graduated Guidance'],
  masteryCriteria: ['80% across 3 consecutive sessions', '90% across 2 consecutive sessions', '100% across 2 consecutive sessions', 'First Trial Data'],
  commTones: ['Empathetic & Supportive', 'Direct Incident Report', 'Celebratory & Positive', 'Collaboration Request'],
  learnerLevels: ['Beginner', 'Intermediate', 'Advanced'],
  chainingMethods: ['Forward', 'Backward', 'Total Task Presentation'],
  defaultRftBuilder: { a: 'Spoken Word "Dog"', b: 'Picture of Dog', c: 'Text "D-O-G"' },
  defaultMatchingLaw: { r1: 10, r2: 2 },
};

// ── Material Maker ──
export const mockMaterialMakerConfig = {
  defaultNetPool: ['Dinosaur toys', 'Magnet tiles', 'Little toy castles', 'Little army people', 'Doctor kit'],
  defaultGrossMotorPool: ['Hide and seek', 'Riding in a clear bucket', 'Piggy back rides', 'Tag', 'Obstacle course'],
  defaultTokenBoard: { title: 'My Token Board', imgUrl: null, bgUrl: null, rewardImgUrl: null },
  dttQuickPicks: ['Colors', 'Body Parts', 'Manding'],
  schedulePlaceholders: ['Hang up coat', 'Wash Hands', 'Eat Snack', 'Play with Blocks'],
  activityTypes: ['coloring', 'maze', 'dots', 'cutout', 'craft'],
  scheduleStyles: ['cartoon', 'realistic'],
};

// ── Program Tree ──
export const mockProgramTreePools = {
  approved: { label: 'Approved', shortName: 'APPR', dotColor: 'bg-emerald-400', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  baseline: { label: 'Baseline', shortName: 'BASE', dotColor: 'bg-blue-400', className: 'bg-blue-50 text-blue-700 border-blue-200' },
  candidate: { label: 'Candidate', shortName: 'CAND', dotColor: 'bg-purple-400', className: 'bg-purple-50 text-purple-700 border-purple-200' },
  revision: { label: 'Revision', shortName: 'REV', dotColor: 'bg-amber-400', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  archived: { label: 'Archived', shortName: 'ARCH', dotColor: 'bg-slate-400', className: 'bg-slate-50 text-slate-700 border-slate-200' },
};

export const mockProgramTreeFlagTypes = {
  baselineData: 'Baseline Data',
  success: 'Success / Celebration',
  interest: 'High Interest / Motivator',
  barriers: 'Barriers / Regression',
  questions: 'Question for BCBA',
  stagnation: 'Stagnation Alert',
  parentInput: 'Parent Input',
  observation: 'Field Observation',
  prompt: 'Prompt Dependency',
};

export const mockProgramTreeDomains = [
  'Early Echoics', 'Listener Responding (LR)', 'Motor Imitation', 'Tacting',
  'Manding', 'Intraverbals', 'Social & Play Skills', 'Daily Living / Adaptive',
  'Behavior Reduction', 'Tolerance & Coping', 'Executive Functioning', 'School Readiness',
];

export const mockProgramTemplates = {
  DTT: { method: 'DTT', procedure: 'Discrete Trial Training — mass trials, clear SD, reinforcement', promptPlan: 'Least-to-Most (LTM)', reinforcementPlan: 'Token economy with backup reinforcer', errorCorrection: '4-step error correction', dataCollection: 'Trial-by-trial (+/-)' },
  NET: { method: 'NET', procedure: 'Natural Environment Teaching — follow learner motivation', promptPlan: 'Time delay', reinforcementPlan: 'Natural reinforcement related to target', errorCorrection: 'Prompt and redirect', dataCollection: 'Probe data (first trial)' },
  PRT: { method: 'PRT', procedure: 'Pivotal Response Training — natural reinforcement, child choice', promptPlan: 'Model + time delay', reinforcementPlan: 'Natural + social reinforcement', errorCorrection: 'Intersperse maintenance tasks', dataCollection: 'Interval scoring' },
  TA: { method: 'TA', procedure: 'Task Analysis — chained steps with systematic prompting', promptPlan: 'Forward / backward chaining', reinforcementPlan: 'Praise + token per step, backup at end', errorCorrection: 'Re-present step with increased prompt', dataCollection: 'Step-by-step independence scoring' },
};

export const mockAceCurriculum = [
  { domain: 'Early Echoics', title: 'Echo 1-syllable words', method: 'DTT', desc: 'Learner echoes 1-syllable CVC words within 3 seconds of SD.' },
  { domain: 'Listener Responding (LR)', title: 'Touch body parts', method: 'DTT', desc: 'When asked "Touch your [body part]" learner responds within 5 seconds.' },
  { domain: 'Tacting', title: 'Tact common objects', method: 'NET', desc: 'Learner labels common items in the environment (cup, ball, car).' },
  { domain: 'Manding', title: 'Mand for items using carrier phrase', method: 'NET', desc: 'Learner says "I want [item]" to request preferred items.' },
  { domain: 'Motor Imitation', title: 'Gross motor imitation', method: 'DTT', desc: 'Learner imitates gross motor actions (clap, stomp, wave) within 5 sec.' },
  { domain: 'Intraverbals', title: 'Fill-in-the-blank songs', method: 'NET', desc: 'Learner fills in missing word in familiar songs (e.g., Twinkle twinkle little _____).' },
  { domain: 'Social & Play Skills', title: 'Parallel play for 2 minutes', method: 'NET', desc: 'Learner plays alongside a peer with shared materials for 2 min.' },
  { domain: 'Daily Living / Adaptive', title: 'Hand washing routine', method: 'TA', desc: 'Learner completes 6-step hand washing chain independently.' },
  { domain: 'Tolerance & Coping', title: 'Wait for 1 minute', method: 'DTT', desc: 'Learner waits with calm body for 1 minute after "Wait" instruction.' },
  { domain: 'Executive Functioning', title: 'Follow 2-step directions', method: 'NET', desc: 'Learner follows 2-step unrelated instructions (e.g., "Get the cup and sit down").' },
];

export const mockProgramTreeClients = [
  { id: 1, name: 'Jane Doe', age: 5, profile: 'Learner profile is blank. BCBA can add notes.' },
  { id: 2, name: 'John Doe', age: 7, profile: 'Learner profile is blank. BCBA can add notes.' },
];

// ── Session Structure (Caregiver schedule builder) ──
export const mockSessionStructureConfig = {
  defaultGroupActivities: [
    'Story Time: Interactive reading & tacting',
    'Pretend Play: Role play & social scripts',
    'Arts & Crafts: Glue, paint, stickers (fine motor + requesting)',
    'Hide & Seek: Motor planning & social turn-taking',
    'Functional Play: Kitchen set, tool bench (imitation & manding)',
    'Sensory Bins: Rice, water, sand (exploration & labeling)',
  ],
  defaultMotorActivities: [
    'Trampoline: Jump counting & imitation',
    'Swings: Manding & vestibular input',
    'Obstacle Course: Sequencing & motor planning',
    'Deep Pressure: Bear hugs & steamroller',
    'Ball Pit: Color tacting & turn-taking',
    'Scooter Board: Core strength & bilateral coordination',
  ],
  defaultFineMotorActivities: [
    'Play-Doh: Shaping & imitating models',
    'Bead Stringing: Patterning & pincer grasp',
    'Coloring: Pre-writing strokes & requesting colors',
    'Cutting Practice: Scissor skills & safety awareness',
    'Tweezers Game: Sorting & requesting help',
    'Sticker Peeling: Bilateral coordination & matching',
  ],
  defaultSocialPeakActivities: [
    'Board Games: Turn-taking & sportsmanship',
    'LEGO Build: Cooperative play & requesting pieces',
    'Musical Chairs: Impulse control & transitions',
    'Pretend Kitchen: Social scripts & sharing',
    'Parachute Play: Group cooperation & following directions',
    'Red Light / Green Light: Impulse control & body awareness',
  ],
  quickChips: [
    { emoji: '🏃', text: 'High Energy' },
    { emoji: '🧘', text: 'Calm Down' },
    { emoji: '🌧️', text: 'Rainy Day' },
    { emoji: '🧩', text: 'Magnet Tiles' },
    { emoji: '🎈', text: 'Bubbles' },
  ],
  scheduleStartMinutes: 510,
  totalDayBlocks: 19,
  blockDuration: 30,
  transitionTunes: ['Twinkle Twinkle', 'Old MacDonald', 'If You\'re Happy', 'Wheels on the Bus'],
};

// ── Caregiver Portal ──
export const mockCaregiverClients = [
  {
    id: 'jane',
    name: 'Liam S.',
    guardian: 'Sarah S.',
    avatar: 'LS',
    focus: 'Functional Communication + Tolerating Delay',
    nextSession: 'Today · 2:00 PM',
    authUsed: 0,
    authTotal: 0,
    cliffDate: 'TBD',
    risk: 'Moderate',
    bip: {
      approvedBy: 'Dr. Kim, BCBA-D',
      targetBehaviors: ['Leaving area', 'Crying/refusal', 'Grabbing materials'],
      functionHypothesis: 'Access to tangibles and escape from difficult transitions.',
      prevention: ['First/Then board visible at all times', 'Visual timer for delay tolerance training'],
      replacement: ['Break card exchange (trained functional alternative)', 'AAC / gesture for requesting preferred items'],
      reinforcement: ['Immediate praise + 30-sec preferred item access for FCR', 'Token system: 3 tokens → 2-min earned break'],
      escalation: 'If behavior escalates beyond 2 minutes: remove demands, allow 60-sec cool-down in safe space, re-present demand with increased support.',
    },
    feed: [],
  },
];

export const mockCaregiverLibrary = {
  functions: [
    { title: 'Escape', color: 'bg-rose-500', desc: 'Behavior happens to GET AWAY from something.', howToTell: 'The behavior increases when demands are placed and decreases when demands are removed.', do: 'Give brief, manageable tasks. Use "First/Then" boards. Praise attempts.', dont: 'Don\'t remove all demands after behavior — this reinforces escape.' },
    { title: 'Attention', color: 'bg-amber-500', desc: 'Behavior happens to GET a reaction from someone.', howToTell: 'The behavior increases when the child is not receiving attention and decreases when attention is given.', do: 'Give frequent positive attention. Ignore minor attention-seeking behaviors when safe.', dont: 'Don\'t give long verbal reprimands — that\'s still attention.' },
    { title: 'Access', color: 'bg-blue-500', desc: 'Behavior happens to GET a preferred item or activity.', howToTell: 'The behavior happens when a preferred item is visible/available but restricted.', do: 'Teach requesting (manding). Use a token economy. Offer choices.', dont: 'Don\'t give the item immediately after the behavior — teach an appropriate way to ask.' },
    { title: 'Sensory', color: 'bg-emerald-500', desc: 'Behavior happens because it FEELS GOOD internally.', howToTell: 'The behavior happens regardless of who is around or what is available.', do: 'Provide sensory alternatives (fidgets, movement breaks). Build a sensory diet.', dont: 'Don\'t punish — the reinforcement is internal. Redirect to appropriate sensory input.' },
  ],
  proactive: [
    { title: 'Premack Principle', color: 'bg-indigo-500', desc: 'Use a preferred activity to motivate a non-preferred one.', howToTell: 'The child consistently resists non-preferred tasks but has clear preferred activities.', do: '"First math worksheet, THEN iPad." Be consistent and follow through.', dont: 'Don\'t give the preferred activity before the non-preferred one is complete.' },
    { title: 'Behavioral Momentum', color: 'bg-pink-500', desc: 'Start with easy tasks to build compliance momentum before harder ones.', howToTell: 'The child often refuses the first demand of a new task or activity.', do: 'Give 2-3 easy "high-p" requests before the hard one. Praise each one.', dont: 'Don\'t start sessions with the hardest demand — build momentum first.' },
    { title: 'Visual Timers', color: 'bg-cyan-500', desc: 'Use a visual timer to show how long until a transition or break.', howToTell: 'The child struggles with transitions or doesn\'t understand "wait."', do: 'Show the timer BEFORE starting. Pair with verbal countdown. Celebrate when time is up.', dont: 'Don\'t use timers punitively ("You have 10 seconds or else...").' },
    { title: 'Shared Control', color: 'bg-teal-500', desc: 'Offer choices within boundaries to give the child a sense of control.', howToTell: 'The child frequently says "no" or engages in oppositional behavior.', do: '"Do you want to sit here or there?" "Red crayon or blue?"', dont: 'Don\'t offer open-ended choices. Limit to 2-3 acceptable options.' },
  ],
  teaching: [
    { title: 'Errorless Teaching', color: 'bg-violet-500', desc: 'Provide immediate prompts so the child gets the answer right on the first try.', howToTell: 'The child gets frustrated by errors or gives up quickly.', do: 'Present SD, immediately prompt correct response, reinforce. Fade prompts gradually.', dont: 'Don\'t wait for errors — the goal is 100% success at first.' },
    { title: 'Task Analysis', color: 'bg-orange-500', desc: 'Break a complex skill into small, teachable steps.', howToTell: 'The child can do some parts of a skill but not the whole sequence.', do: 'List every step. Teach one step at a time (forward or backward chaining).', dont: 'Don\'t expect the whole skill at once. Master each step before adding the next.' },
    { title: 'Reinforcement vs Bribery', color: 'bg-lime-500', desc: 'Reinforcement is planned and follows appropriate behavior. Bribery is reactive.', howToTell: '"If you stop screaming, I\'ll give you candy" = bribery. "Great job sitting! Here\'s a token" = reinforcement.', do: 'Set expectations BEFORE behavior. Deliver reinforcement AFTER appropriate behavior.', dont: 'Don\'t negotiate during a tantrum. Plan reinforcement systems in advance.' },
    { title: 'Extinction', color: 'bg-red-500', desc: 'Stop reinforcing a behavior so it decreases over time.', howToTell: 'A behavior is clearly maintained by a specific reinforcer (attention, escape, access).', do: 'Identify the reinforcer. Withhold it consistently. Expect an extinction burst first.', dont: 'Don\'t use extinction for dangerous behaviors. Don\'t give in during the burst.' },
  ],
};

export const mockCaregiverSessionConfig = {
  cancellationFee: 75,
  sessionTime: '2:00 PM - 5:00 PM',
  makeupSlots: ['Thursday, 4:00 PM', 'Friday, 3:00 PM'],
};

// ── ZoneMate ──
export const mockZoneMateCatalog = [
  { id: 'camera', name: 'Camera 3-in-1', bricksNeeded: 5, color: 'bg-slate-700' },
  { id: 'honda', name: 'Yellow Honda Sports Car', bricksNeeded: 6, color: 'bg-yellow-400' },
];

export const mockZoneMateConfig = {
  defaultTimerSeconds: 240,
  zones: {
    GREEN: {
      id: 'GREEN', name: 'Calm & Focused', description: 'I feel calm and ready to learn!',
      color: 'bg-green-500', characterColor: 'bg-green-400', borderColor: 'border-green-400',
      strategies: [
        { text: 'Keep going!', icon: 'CheckCircle2' },
        { text: 'High five a friend', icon: 'Hand' },
        { text: 'Help someone', icon: 'Users' },
      ],
    },
    BLUE: {
      id: 'BLUE', name: 'Tired or Sad', description: 'I feel slow, tired, or sad.',
      color: 'bg-blue-500', characterColor: 'bg-blue-400', borderColor: 'border-blue-400',
      strategies: [
        { text: 'Stretch tall', icon: 'Activity' },
        { text: 'Drink water', icon: 'Droplet' },
        { text: 'Quick walk', icon: 'Footprints' },
        { text: 'Ask for a hug', icon: 'Heart' },
      ],
    },
    YELLOW: {
      id: 'YELLOW', name: 'Wiggly or Silly', description: 'I feel hyper, wiggly, or silly!',
      color: 'bg-yellow-400', characterColor: 'bg-yellow-300', borderColor: 'border-yellow-400',
      strategies: [
        { text: '3 Deep breaths', icon: 'Wind' },
        { text: 'Wall pushes', icon: 'Hand' },
        { text: 'Use a fidget', icon: 'Settings' },
        { text: 'Squeeze ball', icon: 'Circle' },
      ],
    },
    RED: {
      id: 'RED', name: 'Angry or Overwhelmed', description: 'I feel angry or out of control!',
      color: 'bg-red-500', characterColor: 'bg-red-400', borderColor: 'border-red-400',
      strategies: [
        { text: 'Quiet space', icon: 'Home' },
        { text: 'Count to 10', icon: 'Hash' },
        { text: 'Big squeeze', icon: 'Maximize' },
        { text: 'Ask for break', icon: 'Hand' },
      ],
    },
  },
};

// ── Supervision Command Center ──
export const mockSupervisionRbtRoster = [
  { id: 1, name: 'Sarah M.', totalHours: 120, supHours: 4.5, compliance: 3.75, obs: 1, status: 'red', pip: true, trend: 'Declining data accuracy' },
  { id: 2, name: 'Marcus L.', totalHours: 100, supHours: 7.0, compliance: 7.0, obs: 2, status: 'green', pip: false, trend: 'Excellent prompt fading' },
  { id: 3, name: 'Chloe T.', totalHours: 85, supHours: 5.5, compliance: 6.4, obs: 1, status: 'green', pip: false, trend: 'Strong rapport building' },
  { id: 4, name: 'Devon K.', totalHours: 90, supHours: 4.0, compliance: 4.4, obs: 0, status: 'yellow', pip: false, trend: 'Needs specific praise modeling' },
];

export const mockSupervisionConfig = {
  bcbaCapacity: { current: 88, max: 100 },
};

// ── Treatment Integrity Lab ──
export const mockIntegrityStaffData = [
  {
    id: 1, name: 'Sarah M.', role: 'RBT',
    metrics: { total: 78, technical: 85, assent: 71 },
    ioa: { score: 82, method: 'Trial-by-Trial' },
    trend: 'down', status: 'warning', lastCheck: '2 days ago',
  },
  {
    id: 2, name: 'Marcus L.', role: 'RBT',
    metrics: { total: 96, technical: 95, assent: 97 },
    ioa: { score: 96, method: 'Exact Count' },
    trend: 'up', status: 'good', lastCheck: '1 week ago',
  },
  {
    id: 3, name: 'Chloe T.', role: 'RBT',
    metrics: { total: 91, technical: 90, assent: 92 },
    ioa: { score: 89, method: 'Interval' },
    trend: 'stable', status: 'good', lastCheck: '3 days ago',
  },
  {
    id: 4, name: 'Devon K.', role: 'RBT',
    metrics: { total: 65, technical: 80, assent: 50 },
    ioa: { score: 70, method: 'Trial-by-Trial' },
    trend: 'down', status: 'danger', lastCheck: 'Today',
  },
];

export const mockIntegrityChecklist = [
  { id: 1, category: 'Assent & Readiness', step: 'Verified learner readiness and active assent prior to demand', scored: true },
  { id: 2, category: 'Assent & Readiness', step: 'Honored precursor behaviors or withdrawal of assent', scored: false },
  { id: 3, category: 'Technical Execution', step: 'Delivered instruction using naturalistic/contextually appropriate language', scored: true },
  { id: 4, category: 'Technical Execution', step: 'Utilized specified prompt hierarchy (Errorless/Most-to-Least)', scored: false },
  { id: 5, category: 'Reinforcement', step: 'Delivered functionally-matched, highly preferred reinforcement', scored: false },
];

// ── Risk & Governance Hub ──
export const mockRiskIncidents = [
  {
    id: 1, type: 'Elopement / Safety Risk', client: 'Noah T.',
    time: 'Today, 10:14 AM', note: 'Pending BCBA Debrief & Parent Notification.',
  },
];

export const mockRiskCredentials = [
  { id: 1, initials: 'ER', name: 'Emma R. (RBT)', rbtCert: 'Valid', cprCert: 'Expired (2 days ago)', cprStatus: 'expired', status: 'Suspended from Schedule' },
  { id: 2, initials: 'DC', name: 'David C. (RBT)', rbtCert: 'Valid', cprCert: 'Valid', cprStatus: 'valid', status: 'Cleared' },
];

export const mockRiskConsents = [
  { id: 1, type: 'Media/Photo Consent', client: 'Liam M.', date: 'Signed Oct 12', signed: true },
  { id: 2, type: 'Telehealth Consent', client: 'Emma W.', date: 'Missing', signed: false },
];

// ── Outcomes Intelligence ──
export const mockOutcomesKpis = [
  { key: 'mastery', label: 'Clinic Mastery Rate', value: '42', unit: 'Goals/Mo', direction: 'up' },
  { key: 'velocity', label: 'Skill Acquisition Velocity', value: '12', unit: '% Faster', direction: 'up' },
  { key: 'reduction', label: 'Behavior Reduction', value: '-18', unit: '% Freq', direction: 'down' },
  { key: 'stagnant', label: 'Stagnant Targets', value: '14', unit: null, note: 'Requires BCBA Review', direction: 'alert' },
];

export const mockOutcomesStagnantTargets = [
  { id: 1, target: 'Manding for Break', client: 'Liam M.', note: 'No progress > 20% in 4 weeks.' },
  { id: 2, target: 'Tacting Colors', client: 'Emma W.', note: 'No data collected in 14 days.' },
];

// ── Gestalt AAC ──
export const mockAacConfig = {
  users: [
    { id: 'u1', name: 'Boy A', demo: 'African boy', voice: 'Puck' },
    { id: 'user_b', name: 'Boy B', demo: 'Caucasian boy', voice: 'Zephyr' },
  ],
  scenes: [
    { id: 's1', userId: 'u1', title: 'Things I Want', icon: 'Star', bgClass: 'scene-home' },
    { id: 's2', userId: 'u1', title: 'Feelings', icon: 'Smile', bgClass: 'scene-home' },
    { id: 's3', userId: 'u1', title: 'Sensory', icon: 'Sparkles', bgClass: 'scene-outside' },
    { id: 's4', userId: 'u1', title: 'People', icon: 'Users', bgClass: 'scene-home' },
    { id: 's5', userId: 'u1', title: 'Places', icon: 'MapPin', bgClass: 'scene-outside' },
    { id: 's6', userId: 'u1', title: 'Directing', icon: 'Hand', bgClass: 'scene-classroom' },
    { id: 's1_b', userId: 'user_b', title: 'Boundaries', icon: 'Shapes', bgClass: 'scene-classroom' },
    { id: 's2_b', userId: 'user_b', title: 'Media', icon: 'Activity', bgClass: 'scene-home' },
    { id: 's3_b', userId: 'user_b', title: 'Safe Zones', icon: 'Home', bgClass: 'scene-outside' },
    { id: 's4_b', userId: 'user_b', title: 'Intents', icon: 'Hand', bgClass: 'scene-home' },
  ],
  phrases: [
    { id: 'p1', userId: 'u1', text: 'I want to go', sceneId: 's1', prompt: 'Young boy running fast' },
    { id: 'p2', userId: 'u1', text: 'I want to swing', sceneId: 's1', prompt: 'Sensory swing' },
    { id: 'p3', userId: 'u1', text: 'I want to eat', sceneId: 's1', prompt: 'Plate of food' },
    { id: 'p4', userId: 'u1', text: 'I want trampoline', sceneId: 's1', prompt: 'Trampoline' },
    { id: 'p5', userId: 'u1', text: 'I want chips', sceneId: 's1', prompt: 'Potato chips' },
    { id: 'p6', userId: 'u1', text: 'I want more', sceneId: 's1', prompt: 'Two hands reaching' },
    { id: 'p2_1', userId: 'u1', text: 'I need a break', sceneId: 's2', prompt: 'Child resting with blanket' },
    { id: 'p2_2', userId: 'u1', text: 'Too loud!', sceneId: 's2', prompt: 'Noise canceling headphones' },
    { id: 'p2_3', userId: 'u1', text: 'I am happy', sceneId: 's2', prompt: 'Big smiley face' },
    { id: 'p9', userId: 'u1', text: 'I need my bite block', sceneId: 's3', prompt: 'Chewy coil sensory necklace' },
    { id: 'p3_3', userId: 'u1', text: 'I want a squeeze', sceneId: 's3', prompt: 'A tight bear hug' },
    { id: 'p3_4', userId: 'u1', text: 'I want to spin', sceneId: 's3', prompt: 'Sit-and-spin chair' },
    { id: 'p11', userId: 'u1', text: 'This is mom', sceneId: 's4', prompt: 'A beautiful mother smiling warmly' },
    { id: 'p13', userId: 'u1', text: "I'm going home", sceneId: 's5', prompt: 'A suburban house exterior' },
    { id: 'p6_1', userId: 'u1', text: 'Stop doing that!', sceneId: 's6', prompt: 'A red stop sign' },
    { id: 'p1_b', userId: 'user_b', text: 'It is available!', sceneId: 's1_b', prompt: 'Solid bright green circle' },
    { id: 'p2_b', userId: 'user_b', text: 'It is closed right now.', sceneId: 's1_b', prompt: 'Large bold red X mark' },
    { id: 'p3_b', userId: 'user_b', text: 'Oh no, it is broken.', sceneId: 's1_b', prompt: 'Red empty battery icon with wrench' },
    { id: 'p7_b', userId: 'user_b', text: 'Play it again!', sceneId: 's2_b', prompt: 'Circular loop replay arrow' },
    { id: 'p11_b', userId: 'user_b', text: 'Sitting on the window sill.', sceneId: 's3_b', prompt: 'Cozy window sill sitting spot' },
    { id: 'p19_b', userId: 'user_b', text: 'I really want that.', sceneId: 's4_b', prompt: 'Boy reaching hands out' },
  ],
};

// ── Auth War Room ──
export const mockAuthWarRoomData = [
  { id: 1, name: 'Liam M.', code: '97153', total: 120, used: 112, expire: '12 Days', status: 'danger', velocity: 1.08 },
  { id: 2, name: 'Emma W.', code: '97153', total: 100, used: 45, expire: '4 Months', status: 'under', velocity: 0.62 },
  { id: 3, name: 'Noah S.', code: '97153', total: 160, used: 135, expire: '28 Days', status: 'good', velocity: 0.92 },
  { id: 4, name: 'Ava R.', code: '97155', total: 40, used: 38, expire: '5 Days', status: 'danger', velocity: 1.15 },
  { id: 5, name: 'Lucas H.', code: '97153', total: 80, used: 55, expire: '2 Months', status: 'good', velocity: 0.88 },
  { id: 6, name: 'Sophia P.', code: '97153', total: 120, used: 70, expire: '3 Months', status: 'under', velocity: 0.74 },
];

// ── Clinical QA Chart Audit ──
export const mockChartAuditQueue = [
  {
    id: 'qa-001',
    client: 'Client A',
    owner: 'BCBA A',
    noteType: 'Session Note',
    score: 72,
    severity: 'high',
    status: 'Needs revision',
    flags: ['Missing ABC context', 'Caregiver involvement not documented', 'Subjective phrasing'],
    evidence: 'Note says "client was upset" without observable description or antecedent/context.',
    lastUpdated: 'Today, 10:42 AM',
  },
  {
    id: 'qa-002',
    client: 'Client B',
    owner: 'BCBA A',
    noteType: 'Program Review',
    score: 84,
    severity: 'medium',
    status: 'Review recommended',
    flags: ['Mastery criteria missing', 'No maintenance schedule'],
    evidence: 'Target has progress data but no clear mastery threshold or maintenance plan attached.',
    lastUpdated: 'Yesterday, 4:13 PM',
  },
  {
    id: 'qa-003',
    client: 'Client C',
    owner: 'BCBA B',
    noteType: 'SOAP Draft',
    score: 94,
    severity: 'low',
    status: 'Audit-ready',
    flags: ['Minor formatting issue'],
    evidence: 'Objective data and plan are present; formatting standardization recommended before export.',
    lastUpdated: '2 days ago',
  },
];

export const mockChartAuditStats = {
  chartsInQA: 18,
  highPriority: 4,
  avgQAScore: 86,
  auditPackageReady: 11,
};

export const mockRemediationChecklist = [
  'Replace subjective language with observable behavior.',
  'Add antecedent, behavior, and consequence context if clinically relevant.',
  'Confirm note statements match captured session data.',
  'Document caregiver involvement or why it was not applicable.',
  'Confirm BCBA review/signature before payer-facing export.',
];

// ── Intake, Assessment & Treatment Plan Builder ──
export const mockIntakeCases = [
  { id: 'int-001', client: 'Client A', stage: 'Assessment', days: 8, payer: 'Demo Payer A', priority: 'high', missing: ['Caregiver consent', 'Baseline probe set'] },
  { id: 'int-002', client: 'Client B', stage: 'Treatment Plan Review', days: 21, payer: 'Demo Payer B', priority: 'medium', missing: ['Medical necessity summary'] },
  { id: 'int-003', client: 'Client C', stage: 'Waitlist', days: 3, payer: 'Private Pay Demo', priority: 'low', missing: ['Initial screening'] },
];

export const mockIntakeStages = ['Referral', 'Eligibility', 'Consent', 'Assessment', 'Baseline', 'Plan Review', 'Active'];

export const mockAssessmentDomains = [
  { domain: 'Communication', probes: 18, complete: 12, note: 'Mand, tact, listener response, AAC/GLP supports.' },
  { domain: 'Social & Play', probes: 12, complete: 6, note: 'Joint attention, turn taking, play expansion.' },
  { domain: 'Adaptive Skills', probes: 10, complete: 4, note: 'Daily living skills and routines.' },
  { domain: 'Behavior Reduction', probes: 8, complete: 5, note: 'ABC patterns, replacement responses, safety planning.' },
];

export const mockPlanSections = [
  'Medical necessity narrative',
  'Recommended service intensity',
  'Caregiver priorities and participation',
  'Baseline summary by domain',
  'Measurable treatment goals',
  'Generalization and maintenance plan',
  'Discharge/transition criteria',
];

export const mockIntakeStats = {
  openReferrals: 14,
  plansReady: 5,
  consentGaps: 3,
};

// ── Competency & Credential Vault ──
export const mockCredentialStaff = [
  {
    id: 'staff-a',
    name: 'RBT A',
    role: 'RBT',
    status: 'Blocked',
    cprDays: 18,
    bacbDays: 42,
    backgroundDays: 310,
    hipaaTrainingDays: 9,
    clientCompetency: 68,
    payerEligible: false,
    blockers: ['CPR expires within 30 days', 'Client A competency below threshold'],
  },
  {
    id: 'staff-b',
    name: 'RBT B',
    role: 'RBT',
    status: 'Eligible',
    cprDays: 220,
    bacbDays: 190,
    backgroundDays: 500,
    hipaaTrainingDays: 130,
    clientCompetency: 94,
    payerEligible: true,
    blockers: [],
  },
  {
    id: 'staff-c',
    name: 'BCBA A',
    role: 'BCBA',
    status: 'Watch',
    cprDays: 44,
    bacbDays: 28,
    backgroundDays: 250,
    hipaaTrainingDays: 63,
    clientCompetency: 100,
    payerEligible: true,
    blockers: ['BACB registration renewal due within 30 days'],
  },
];

export const mockCredentialStats = {
  activeStaff: 32,
  expiring30Days: 6,
  blockedShifts: 4,
  competencyComplete: '88%',
};

// ── HIPAA Trust Center & Security Admin ──
export const mockSecurityEvents = [
  { id: 'evt-001', type: 'Client record access', actor: 'BCBA A', target: 'Client A', time: '10:42 AM', risk: 'low', detail: 'Viewed active treatment plan from assigned caseload.' },
  { id: 'evt-002', type: 'Failed login', actor: 'Unknown user', target: 'Portal', time: '10:28 AM', risk: 'medium', detail: '3 failed attempts from unrecognized device fingerprint.' },
  { id: 'evt-003', type: 'Export requested', actor: 'Admin A', target: 'Audit package', time: '09:55 AM', risk: 'medium', detail: 'De-identified audit export queued for supervisor review.' },
  { id: 'evt-004', type: 'Shared device auto-logout', actor: 'RBT A', target: 'Clinic Tablet 04', time: '09:31 AM', risk: 'low', detail: 'Idle timeout purged active client/session context.' },
];

export const mockDeviceSessions = [
  { id: 'dev-01', device: 'Clinic Tablet 04', user: 'RBT A', status: 'Auto-logged out', lastSeen: '9:31 AM', posture: 'Shared device' },
  { id: 'dev-02', device: 'Admin Laptop 02', user: 'Admin A', status: 'Active', lastSeen: 'Now', posture: 'Managed workstation' },
  { id: 'dev-03', device: 'Unknown Browser', user: 'Failed login', status: 'Blocked', lastSeen: '10:28 AM', posture: 'Unrecognized' },
];

export const mockResponseChecklist = [
  { id: 1, label: 'Identify affected records and users', done: true },
  { id: 2, label: 'Preserve audit logs and access evidence', done: true },
  { id: 3, label: 'Disable suspected sessions or credentials', done: false },
  { id: 4, label: 'Notify privacy/security lead for review', done: false },
  { id: 5, label: 'Document determination and follow-up actions', done: false },
];

export const mockTrustCenterStats = {
  securityPosture: 91,
  failedLogins: 3,
  activeSessions: 18,
  exportsToday: 2,
};

// ── API / Integration Hub ──
export const mockIntegrations = [
  { id: 'office-ally', name: 'Office Ally Clearinghouse', category: 'Claims', status: 'Sandbox ready', icon: 'FileCode2', color: 'cyan', next: 'Map payer IDs and service codes' },
  { id: 'availity', name: 'Availity', category: 'Eligibility / Claims', status: 'Planned', icon: 'Cloud', color: 'slate', next: 'Contracting and API review' },
  { id: 'quickbooks', name: 'QuickBooks Payroll', category: 'Accounting', status: 'Needs approval', icon: 'WalletCards', color: 'gold', next: 'Configure locked timesheet export' },
  { id: 'workspace', name: 'Google Workspace', category: 'Identity / Mail', status: 'Connected in demo', icon: 'KeyRound', color: 'emerald', next: 'Backend service-account review' },
  { id: 'm365', name: 'Microsoft 365', category: 'Identity / Mail', status: 'Planned', icon: 'PlugZap', color: 'slate', next: 'Microsoft Graph backend function' },
];

export const mockIntegrationJobs = [
  { id: 'job-001', name: '837P claim batch export', target: 'Clearinghouse sandbox', status: 'Ready for test', count: 42, risk: 'low' },
  { id: 'job-002', name: 'Locked timesheet sync', target: 'Payroll staging', status: 'Mapping needed', count: 18, risk: 'medium' },
  { id: 'job-003', name: 'Eligibility check queue', target: 'Payer API', status: 'Blocked: credentials', count: 7, risk: 'high' },
  { id: 'job-004', name: '835 remittance parser', target: 'Revenue ops', status: 'Design review', count: 0, risk: 'medium' },
];

export const mockServiceCodeMappings = [
  { service: 'Direct therapy', code: '97153', payer: 'Demo Payer A', rule: 'Session note signed + timer validated', ready: true },
  { service: 'Supervision', code: '97155', payer: 'Demo Payer A', rule: 'BCBA credential active + auth remaining', ready: true },
  { service: 'Caregiver training', code: '97156', payer: 'Demo Payer B', rule: 'Caregiver attendance + plan linked', ready: false },
];

export const mockIntegrationStats = {
  connectedCount: 2,
  pendingMappings: 7,
  failedJobs: 1,
  lastSuccessfulSync: '2h',
};

// ── De-identified Outcomes Registry ──
export const mockRegistryJobs = [
  { id: 'reg-001', cohort: 'Early Communication Growth', records: 128, status: 'Ready for governance review', risk: 'low', consent: '94%', kAnon: 12, domain: 'Communication' },
  { id: 'reg-002', cohort: 'Replacement Behavior Trends', records: 73, status: 'Suppression needed', risk: 'medium', consent: '88%', kAnon: 6, domain: 'Behavior Reduction' },
  { id: 'reg-003', cohort: 'Caregiver Generalization', records: 24, status: 'Consent incomplete', risk: 'high', consent: '61%', kAnon: 4, domain: 'Generalization' },
];

export const mockRegistryTransformations = [
  { name: 'Direct identifier removal', done: true, detail: 'Names, addresses, phone numbers, emails, IDs removed.' },
  { name: 'Date shifting / age banding', done: true, detail: 'Dates converted to relative windows and age bands.' },
  { name: 'Small-cell suppression', done: false, detail: 'Cohorts below threshold require suppression or merge.' },
  { name: 'Consent/IRB governance check', done: false, detail: 'Registry export requires governance approval workflow.' },
];

export const mockCohortMetrics = [
  { label: 'Communication targets', value: 43, trend: '+12%', tone: 'cyan' },
  { label: 'Mastered targets', value: 31, trend: '+8%', tone: 'emerald' },
  { label: 'Stagnant targets', value: 7, trend: '-4%', tone: 'amber' },
  { label: 'Excluded records', value: 19, trend: 'consent / small cell', tone: 'rose' },
];

export const mockRegistryStats = {
  consentBlocked: 41,
  smallCellRisks: 6,
  governancePackets: 3,
};

// ── Infinite Comms (Messages) ──
export const mockCommsUsers = {
  admin: { uid: 'u1', name: 'Admin A', role: 'Administrator', init: 'AA' },
  bcba: { uid: 'u2', name: 'BCBA A', role: 'BCBA', init: 'BA' },
  rbt: { uid: 'u3', name: 'RBT A', role: 'RBT', init: 'RA' },
};

export const mockCommsChannels = [
  { id: 'c1', name: 'clinic-announcements', type: 'general', iconType: 'Hash', isSecure: false, unread: 2, desc: 'General clinic updates. NO PHI.' },
  { id: 'c2', name: 'bcba-clinical-review', type: 'role', iconType: 'Lock', isSecure: true, unread: 0, desc: 'BCBA-only clinical strategy discussions.' },
  { id: 'c3', name: 'client-a-care-team', type: 'client', iconType: 'Shield', isSecure: true, linkedClient: 'Client A', unread: 5, desc: 'Secure care team thread for Client A.' },
  { id: 'c4', name: 'client-b-care-team', type: 'client', iconType: 'Shield', isSecure: true, linkedClient: 'Client B', unread: 0, desc: 'Secure care team thread for Client B.' },
  { id: 'c5', name: 'subpool-marketplace', type: 'general', iconType: 'Hash', isSecure: false, unread: 1, desc: 'Shift coverage requests.' },
];

export const mockCommsMessages = {
  'c3': [
    { id: 'm1', sender: 'System Engine', role: 'OS', time: '09:00 AM', body: 'Client A Care Team channel created. Audit logging enabled.', isSystem: true },
    { id: 'm2', sender: 'BCBA A', role: 'BCBA', time: '09:15 AM', body: 'I have updated the BIP for Client A. Please review the new token board before the 10 AM session.', isUrgent: false, reqAck: true, acks: [] },
    { id: 'm3', sender: 'RBT A', role: 'RBT', time: '09:20 AM', body: 'Reviewed. The new visual schedules look great. Ready for session.', isUrgent: false, reqAck: false, acks: [] },
  ],
  'c1': [
    { id: 'm4', sender: 'Admin A', role: 'Administrator', time: '08:00 AM', body: 'Reminder: The clinic will close at 3 PM tomorrow for staff training. Please ensure all sessions are wrapped up by 2:45 PM.', isUrgent: true, reqAck: false, acks: [] },
  ],
};
