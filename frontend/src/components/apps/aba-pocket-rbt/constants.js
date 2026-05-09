// --- The "Infinity Clinical Core" Persona Definition ---
export const infiniteClinicalCore = `[SYSTEM: INFINITY CLINICAL CORE ENGAGED]
You are an elite, doctorate-level BCBA-D acting as an immediate field mentor to RBTs and Parents. You possess exhaustive, instant recall of Applied Behavior Analysis, the 2026 BACB Ethics Code, JABA/JEAB literature, and clinical best practices.

CRITICAL INSTRUCTIONS TO ENSURE SPEED & QUALITY:
1. ADAPTIVE LANGUAGE: Analyze the user's input. Match their sophistication. If they use layman's terms, explain simply and empathetically. If they use clinical jargon, respond at a peer clinical level.
2. EXTREME SCANNABILITY: The user is in the field and needs answers INSTANTLY. Keep responses under 150 words. Use tight, punchy bullet points. NO introductory or concluding fluff.
3. VISUAL CLARITY: You MUST **bold key terms and actions** for rapid visual processing.
4. WHOLE GAMUT PBS: Always provide a comprehensive behavioral perspective: Proactive (Antecedent) modifications, Educative (Replacement/DRA/DRO), and safe Reactive (Consequence) procedures.
5. THE COACHING HINT: End every single response with a section titled "**Data Collection Hint:**". Write exactly one sentence teaching the user how to describe the behavior more objectively, observably, and measurably next time.`;

// --- UI Dictionary ---
export const tabTitles = {
  abAnalyzer: 'A-B Data Analyzer',
  programMentor: 'Program Mentor',
  genMatrix: 'Generalization Builder',
  jargonTranslator: 'Jargon Translator',
  playIdeas: 'Ideas for Play',
  parentTraining: 'Parent Training Guide',
  socialStory: 'Social Story Drafter',
  objectiveNote: 'Objective Note Translator',
  visualSchedule: 'Visual Schedule Builder',
  siblingExplainer: 'Peer/Sibling Explainer',
  iepDecoder: 'IEP Goal Decoder',
  safeSnap: 'Safe-Snap Protocol',
  quick: 'Rapid Intervention Strategy',
  templates: 'Behavior Templates',
  library: 'My Saved Artifacts',
  result: 'Clinical Output Generated'
};

// --- Hardcoded behavior templates (full clinical detail) ---
export const fullBehaviorTemplates = [
  {
    name: 'Physical Aggression (Multiple Functions)',
    function: 'Unknown / Multiple',
    context: 'Topography: Hitting with open/closed fist, kicking, biting, or scratching others. \nPutative Functions: Synthesized Social Positive (Attention) & Social Negative (Escape). \nIntervention Guidelines: Implement synthesized contingencies. \nAntecedents: FCT for "break" and "attention", prespecified reinforcer periods, high-P request sequences. \nConsequence (if Escape-maintained in moment): Continue demand presentation, block safely (Escape Extinction). \nConsequence (if Attention-maintained in moment): Planned ignoring, block safely without eye contact or vocalizations (Attention Extinction).'
  },
  {
    name: 'Elopement (Multiple Functions)',
    function: 'Unknown / Multiple',
    context: 'Topography: Moving >10 feet away from designated instructional or safety area without permission. \nFunctions: Escape (from demands) & Access (to preferred areas/tangibles). \nAntecedents: Visual boundaries, Premack principle (First work, then go), enrich instructional environment. \nReplacement: FCT to mand "Can I go to X?" or "I need a break". \nConsequence: Shadow for safety. Block access to desired tangible/area. If escape-maintained, gently guide back to instructional area and represent demand without verbal reprimand.'
  },
  {
    name: 'Severe SIB (Head-Banging/Biting)',
    function: 'Sensory / Automatic',
    context: 'Topography: Forceful head-banging against hard surfaces, or biting own hands/arms causing tissue damage. \nFunction: Automatic Reinforcement (Sensory regulation). \nAntecedents: NCR (non-contingent access to sensory alternatives like joint compression/vibration), environmental padding. \nReplacement: DRA (teaching to mand for sensory input or use a safe chew tube/helmet). \nConsequences: Immediate response blocking for safety, absolute minimal attention/reaction, redirect to functionally equivalent sensory replacement.'
  },
  {
    name: 'Property Destruction',
    function: 'Unknown / Multiple',
    context: 'Topography: Throwing, sweeping, tearing, or intentionally breaking items resulting in damage. \nFunctions: Escape (destroying materials to end task) & Access to Tangible (destroying items when denied preferred item). \nAntecedents: Clear workspace, provide durable materials, visual timers for transitions. \nReplacement: FCT "I don\'t want this" or "I want [item]". \nConsequences: Block throwing safely. Require restitution/overcorrection (e.g., picking up thrown items) before returning to baseline or accessing any reinforcers.'
  },
  {
    name: 'Task Refusal / Dropping',
    function: 'Escape / Avoidance',
    context: 'Topography: Dropping to the floor to become "dead weight", putting head down on desk, or ignoring SDs when directive is given. \nFunction: Social Negative (Escape/Avoidance). \nAntecedents: Behavioral momentum (High-P to Low-P), choice-making (e.g., "Do you want to do math or reading first?"), reduce task response effort. \nReplacement: Manding for a break or assistance. \nConsequences: Escape Extinction. Do not remove demand. Use physical prompting (graduated guidance) if necessary and safe, or wait out with demand placed until compliance.'
  },
  {
    name: 'Spitting (At Others)',
    function: 'Unknown / Multiple',
    context: 'Topography: Expelling saliva from mouth directed at peers or staff. \nFunctions: Social Positive (Attention/Reaction) & Social Negative (Escape). \nAntecedents: Increase distance during high-stress demands, differential reinforcement of incompatible behaviors (DRI - chewing gum or holding a preferred item in mouth). \nConsequence: Neutral facial expression. Wipe away safely without comment. If escape, continue demand. If attention, immediately withdraw all social interaction for 30 seconds.'
  },
  {
    name: 'Pica (Ingesting non-edible items)',
    function: 'Sensory / Automatic',
    context: 'Topography: Placing non-edible, non-nutritive items (e.g., dirt, paper, small toys) into the mouth and swallowing. \nFunction: Automatic Reinforcement (Note: Medical rule-out for nutritional deficiencies is required). \nAntecedents: Sweep environment for hazards, provide constant access to safe oral stimulation (chewelry, crunchy snacks). \nReplacement: Manding for food/chews. \nConsequences: Response blocking (hand over mouth), physically remove item if safe, redirect to edible alternative without reprimand.'
  },
  {
    name: 'Disrobing (Inappropriate)',
    function: 'Unknown / Multiple',
    context: 'Topography: Removing clothing (shirts, pants, underwear) in non-designated areas (e.g., classroom, living room). \nFunctions: Automatic (Sensory discomfort from clothes), Escape (from setting), or Attention. \nAntecedents: Ensure clothing is sensory-friendly, teach discrimination of private vs. public spaces. \nReplacement: FCT "I am hot/itchy" or teaching to go to the bathroom/bedroom to undress. \nConsequences: Neutral redirection. Prompt learner to redress immediately with physical guidance if necessary, zero eye contact or verbal reprimands.'
  },
  {
    name: 'Feces Smearing (Scatolia)',
    function: 'Unknown / Multiple',
    context: 'Topography: Handling, playing with, or smearing feces on walls, self, or objects. \nFunctions: Automatic (Sensory/Tactile) & Social Positive (Extreme Attention). \nAntecedents: Scheduled toileting, restrictive clothing (e.g., onesies worn backwards), provide high-tactile sensory play (play-doh, slime, shaving cream). \nReplacement: Requesting bathroom, independent toileting chain. \nConsequences: Emotionless clean-up. Do not display disgust. Use physical prompts to guide learner through cleaning themselves (overcorrection), followed by immediate handwashing.'
  },
  {
    name: 'Motor Stereotypy',
    function: 'Sensory / Automatic',
    context: 'Topography: Repetitive, non-functional motor movements (e.g., hand-flapping, body rocking, finger posturing). \nFunction: Automatic reinforcement. \nAntecedents: Enrich environment with competing stimuli. \nReplacement: Functionally equivalent or incompatible behaviors (e.g., squeezing a stress ball instead of flapping). \nConsequences: Usually ignore unless it impedes learning. If impeding, use Response Interruption and Redirection (RIRD) to a motor task (e.g., "Touch your nose, clap hands").'
  },
  {
    name: 'Vocal Stereotypy / Scripting',
    function: 'Sensory / Automatic',
    context: 'Topography: Repetitive vocalizations, echolalia, or delayed scripting of movies/videos non-contextually. \nFunction: Automatic reinforcement. \nAntecedents: High-density schedule of competing auditory stimuli (music, engaging conversation). \nReplacement: Teaching appropriate "time and place" for scripting, or expanding scripts into functional intraverbals. \nConsequences: RIRD (Response Interruption and Redirection) by asking 3 rapid-fire intraverbal questions to interrupt the vocal loop, then praise for correct answering.'
  },
  {
    name: 'Verbal Aggression / Threats',
    function: 'Unknown / Multiple',
    context: 'Topography: Using profanity, making statements of harm, or screaming insults at others. \nFunctions: Social Positive (Attention/Reaction) & Escape. \nAntecedents: Teach emotional regulation protocols (e.g., Zone of Regulation), priming for difficult tasks. \nReplacement: FCT "I am angry", "I need space", or appropriate disagreement. \nConsequences: Planned ignoring for the verbal content. Do not argue, negotiate, or react emotionally. If associated with a demand, follow through silently using visual prompts.'
  },
  {
    name: 'Mouthing',
    function: 'Sensory / Automatic',
    context: 'Topography: Placing non-edible items, toys, clothing, or body parts into the mouth past the plane of the lips (without swallowing). \nFunction: Automatic Sensory. \nAntecedents: Provide continuous access to safe chew-tubes or crunchy/cold edibles. \nReplacement: Manding for chew-tube. \nConsequences: Response blocking, differential reinforcement of incompatible behavior (DRI) by prompting hands-down or hands-busy activities.'
  },
  {
    name: 'Non-compliance (Passive)',
    function: 'Escape / Avoidance',
    context: 'Topography: Failing to follow an instruction or initiate a requested task within 5 seconds of the SD, without physical aggression. \nFunction: Escape/Avoidance. \nAntecedents: Ensure learner attending before SD, use clear/concise SDs (not phrased as questions), Token Economy. \nReplacement: Manding for a break or help. \nConsequences: 3-step prompting hierarchy (Vocal, Model, Physical). Do not repeat SD endlessly. Ensure compliance is met before access to reinforcement.'
  },
  {
    name: 'Environmental Manipulation (Rigidity)',
    function: 'Sensory / Automatic',
    context: 'Topography: Repeatedly opening/closing doors, turning lights on/off, lining up toys, or demanding items be in an exact spatial arrangement. \nFunction: Automatic/Control. \nAntecedents: Warn before transitions, visually structure the environment, teach tolerance to change/denial. \nReplacement: Flexibility training, functional play skills. \nConsequences: Interrupt the repetitive loop. Prompt learner to engage in a functional activity with the object (e.g., pushing the car instead of lining it up).'
  }
];
