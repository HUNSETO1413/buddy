import { BonesLayer, SoulLayer } from '../types';
import { fnv1a } from './fnv1a';

const SPECIES_NAMES: Record<string, string[]> = {
  duck: ['Quackers', 'Waddles', 'Ducky', 'Splash', 'Nugget'],
  goose: ['Honk', 'Goosey', 'Commander', 'Fang', 'Diva'],
  cat: ['Mochi', 'Whiskers', 'Luna', 'Mittens', 'Neko'],
  rabbit: ['Bun', 'Clover', 'Hopscotch', 'Cotton', 'Thumper'],
  owl: ['Hoot', 'Sage', 'Athena', 'Owliver', 'Moonlight'],
  penguin: ['Pebble', 'Ice', 'Waddle', 'Chillie', 'Tux'],
  turtle: ['Shelly', 'Slowpoke', 'Tank', 'Olive', 'Snap'],
  snail: ['Turbo', 'Slippy', 'Shelly', 'Goober', 'Trail'],
  dragon: ['Ember', 'Blaze', 'Spike', 'Draco', 'Flame'],
  octopus: ['Inky', 'Tentacle', 'Squish', 'Cthulhu', 'Bubbles'],
  axolotl: ['Axel', 'Gilly', 'Smiley', 'Frills', 'Neoteny'],
  ghost: ['Boo', 'Spooky', 'Casper', 'Shade', 'Wisp'],
  robot: ['Byte', 'Beep', 'Spark', 'Circuit', 'Pixel'],
  blob: ['Jiggle', 'Goo', 'Squish', 'Plop', 'Wobble'],
  cactus: ['Spike', 'Prickle', 'Succy', 'Desert', 'Green'],
  mushroom: ['Cap', 'Spore', 'Fungi', 'Morel', 'Shroomy'],
  capybara: ['Cappy', 'Chill', 'Relaxo', 'Buddy', 'Zen'],
  chonk: ['Biscuit', 'Meatball', 'Fluff', 'Hefty', 'Plump'],
};

interface PersonalityDescriptions {
  high: string[];
  low: string[];
}

const PERSONALITY_DESCRIPTIONS: Record<string, PersonalityDescriptions> = {
  debugging: {
    high: ['fixes bugs in its sleep', 'can smell a segfault from miles away', 'compiles mentally before breakfast'],
    low: ['thinks syntax errors are personality', 'git push --force is a lifestyle', 'console.log is the only debugger'],
  },
  patience: {
    high: ['waits calmly for npm install', 'never rage-quits a debug session', 'meditates during long builds'],
    low: ['types fast and hits enter too soon', 'zero patience for slow tests', 'refreshes the page 47 times'],
  },
  chaos: {
    high: ['rewrites everything in Rust at 3am', 'lives on the main branch', 'deletes node_modules for fun'],
    low: ['follows the style guide to the letter', 'never breaks the build', 'commits after every semicolon'],
  },
  wisdom: {
    high: ['knows why the regex works', 'reads RFCs for fun', 'understands CSS vertical centering'],
    low: ['still Googles basic git commands', 'has 47 Stack Overflow tabs open', 'copy-pastes from ChatGPT blindly'],
  },
  snark: {
    high: ['comments "works on my machine" sarcastically', 'reviews code with unnecessary sass', 'gives error messages attitude'],
    low: ['is always encouraging and supportive', 'says "great job!" to the linter', 'never complains about the framework'],
  },
};

function pickName(species: string, hash: number): string {
  const names = SPECIES_NAMES[species] || SPECIES_NAMES['cat'];
  const index = Math.abs(hash) % names.length;
  return names[index];
}

function buildPersonalityDescription(personality: BonesLayer['personality']): string {
  const { peakAttribute, troughAttribute } = personality;
  const parts: string[] = [];

  // Describe peak attribute
  const peakDescs = PERSONALITY_DESCRIPTIONS[peakAttribute]?.high;
  if (peakDescs) {
    const idx = Math.abs(fnv1a(peakAttribute + '-peak-desc')) % peakDescs.length;
    parts.push(peakDescs[idx]);
  }

  // Describe trough attribute
  const troughDescs = PERSONALITY_DESCRIPTIONS[troughAttribute]?.low;
  if (troughDescs) {
    const idx = Math.abs(fnv1a(troughAttribute + '-trough-desc')) % troughDescs.length;
    parts.push(troughDescs[idx]);
  }

  return parts.join('. ') + '.';
}

export function generateDefaultSoul(bones: BonesLayer): SoulLayer {
  const nameHash = fnv1a(bones.species + '-name-soul');
  const name = pickName(bones.species, nameHash);
  const personalityDescription = buildPersonalityDescription(bones.personality);

  return {
    name,
    personalityDescription,
    generatedAt: new Date().toISOString(),
  };
}
