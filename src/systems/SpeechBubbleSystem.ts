import { PetState, PersonalityKey } from '../types';

interface BubbleRule {
  keywords: string[];
  responses: string[];
  minHappiness?: number;
  maxHappiness?: number;
}

const BUBBLE_RULES: BubbleRule[] = [
  {
    keywords: ['bug', 'error', 'crash', 'fail', 'broken', 'exception', 'traceback', 'undefined'],
    responses: [
      'Uh oh... let me help debug that!',
      'Bugs fear me! Let\'s squash it!',
      'I smell a bug... *sniff sniff*',
      'Don\'t worry, we\'ll fix it together!',
      'Error? More like adventure!',
    ],
  },
  {
    keywords: ['code', 'function', 'class', 'module', 'import', 'refactor', 'implement'],
    responses: [
      'Ooh, coding time! My favorite!',
      'I love watching you code!',
      'Can I help? I know some tricks!',
      '*takes notes eagerly*',
      'This is getting interesting!',
    ],
    minHappiness: 40,
  },
  {
    keywords: ['help', 'how', 'what', 'why', 'please', 'stuck'],
    responses: [
      'I\'m here for you!',
      'We can figure this out together!',
      'Don\'t give up! You\'re doing great!',
      'Let me think about that...',
      'Ask away! I\'m all ears!',
    ],
  },
  {
    keywords: ['test', 'spec', 'assert', 'expect', 'coverage', 'jest', 'mocha'],
    responses: [
      'Testing! Very responsible!',
      '*stands at attention* Tests are important!',
      'Quality code needs quality tests!',
      'Green tests make me happy!',
    ],
    minHappiness: 30,
  },
  {
    keywords: ['deploy', 'release', 'ship', 'production', 'prod', 'launch'],
    responses: [
      'Deploying! How exciting!',
      'To production and beyond!',
      'Fingers crossed... *hides behind tail*',
      'This is the big moment!',
      'Go go go!',
    ],
  },
  {
    keywords: ['git', 'commit', 'push', 'merge', 'pull', 'branch', 'pr'],
    responses: [
      'Version control! Nice!',
      'Git gud! Hehe, get it?',
      'Commit early, commit often!',
      '*watches the git graph grow*',
    ],
    minHappiness: 20,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'morning', 'evening', 'greetings'],
    responses: [
      'Hey there!',
      'Hello! Happy to see you!',
      'Hi hi hi! *wags tail*',
      'Welcome back!',
    ],
  },
];

const IDLE_BUBBLES: string[] = [
  '*yawns*',
  '*stretches*',
  '...',
  '*looks around curiously*',
  '*plays with a loose thread*',
  'La la la~',
  '*dozes off briefly*',
  '*stares into the distance*',
];

/**
 * Generate a speech bubble based on context and pet state.
 * Returns null if the pet is muted or no appropriate bubble is found.
 */
export function generateBubble(state: PetState, context: string): string | null {
  // Muted pets don't talk
  if (state.isMuted) {
    return null;
  }

  const happiness = state.attributes?.happiness ?? 50;
  const lowerContext = context.toLowerCase();

  // Find matching rules
  for (const rule of BUBBLE_RULES) {
    // Check happiness thresholds
    if (rule.minHappiness !== undefined && happiness < rule.minHappiness) continue;
    if (rule.maxHappiness !== undefined && happiness > rule.maxHappiness) continue;

    // Check keyword match
    const matched = rule.keywords.some(kw => lowerContext.includes(kw));
    if (matched) {
      const idx = Math.floor(Math.random() * rule.responses.length);
      return rule.responses[idx];
    }
  }

  // Random idle bubble (20% chance)
  if (Math.random() < 0.2) {
    const idx = Math.floor(Math.random() * IDLE_BUBBLES.length);
    return IDLE_BUBBLES[idx];
  }

  return null;
}
