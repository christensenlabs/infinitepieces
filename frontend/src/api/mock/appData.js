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
