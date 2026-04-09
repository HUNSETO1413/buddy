import { PetState, MoodType, PersonalityKey, SpeciesSpriteMood } from '../types';
import { SPRITES } from '../pet/sprites/index';
import { getRarityData } from '../pet/RaritySystem';
import { isShinyRoll, renderShinyPrefix } from '../pet/ShinySystem';
import { getHatAscii } from '../pet/HatSystem';
import { renderRainbowBar, RESET } from './RainbowBar';
import { frameBox } from './ASCIIFrame';

// ---------------------------------------------------------------------------
// Mood -> sprite emotion mapping
// ---------------------------------------------------------------------------
const MOOD_SPRITE_MAP: Record<MoodType, SpeciesSpriteMood> = {
  ecstatic: 'happy',
  happy: 'happy',
  neutral: 'idle',
  sad: 'sad',
  angry: 'angry',
  sleeping: 'sleeping',
};

// ---------------------------------------------------------------------------
// Mood emoji
// ---------------------------------------------------------------------------
const MOOD_EMOJI: Record<MoodType, string> = {
  ecstatic: '\u2728',
  happy: '\u263A',
  neutral: '\u2014',
  sad: '\u2639',
  angry: '\u2620',
  sleeping: '\u2601',
};

// ---------------------------------------------------------------------------
// Personality bar
// ---------------------------------------------------------------------------
function personalityBar(value: number, width: number = 10): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return '\u2588'.repeat(Math.max(0, filled)) + '\u2591'.repeat(Math.max(0, empty));
}

// ---------------------------------------------------------------------------
// Apply eye variant to sprite: replace a generic eye placeholder
// with the user's eye variant. We look for common eye patterns and replace.
// ---------------------------------------------------------------------------
function applyEyes(sprite: string, eyeVariant: string): string {
  // The sprites use characters like o.o, -.-, etc for eyes.
  // We try to replace recognized patterns.
  const eyePatterns = [
    /o\.o/g, /\^[\.,]\^/g, /-[\.,]-/g,
    />\.</g, /T[\.,]T/g, /O[\.,]O/g,
    /\u00B0[\.,]\u00B0/g, /@[\.,]@/g,
    /\u2605[\.,]\u2605/g, /\u2665[\.,]\u2665/g,
    /\u25D5[\.,]\u25D5/g, /\^[\.,]~/g,
  ];
  let result = sprite;
  for (const pat of eyePatterns) {
    if (pat.test(result)) {
      result = result.replace(pat, eyeVariant);
      break;
    }
  }
  return result;
}

// ---------------------------------------------------------------------------
// Compact render: 3-5 lines
// ---------------------------------------------------------------------------
export function renderPetCompact(state: PetState): string {
  const sprites = SPRITES[state.species];
  if (!sprites) return `[${state.name} the ${state.species}]`;

  const rarityData = getRarityData(state.rarity);
  const color = rarityData.colorANSI;

  // Pick sprite based on mood
  const emotion = MOOD_SPRITE_MAP[state.mood] || 'idle';
  let sprite: string;
  if (emotion === 'idle') {
    const frame = Date.now() % 3;
    sprite = sprites.idle[frame];
  } else {
    sprite = sprites[emotion] as string;
  }

  // Apply eye variant
  sprite = applyEyes(sprite, state.eyeVariant);

  // Hat as line above sprite
  const hatAscii = getHatAscii(state.hat);
  const hatLine = hatAscii ? '   ' + hatAscii + '\n' : '';

  // Shiny prefix
  const shinyLine = state.isShiny ? renderShinyPrefix(0) + ' ' : '';

  // Mood emoji
  const moodEmoji = MOOD_EMOJI[state.mood] || '';

  // EXP bar
  const expBar = renderRainbowBar(state.exp, state.expToNext, 15);

  const lines: string[] = [];
  lines.push(`${color}${shinyLine}${hatLine}${sprite}${RESET}`);
  lines.push(`${moodEmoji} ${color}${state.name}${RESET} Lv.${state.level} ${rarityData.starsDisplay}`);
  lines.push(`EXP ${expBar} ${state.exp}/${state.expToNext}`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Full card render
// ---------------------------------------------------------------------------
export function renderPetCard(state: PetState): string {
  const sprites = SPRITES[state.species];
  if (!sprites) return `[${state.name} the ${state.species}]`;

  const rarityData = getRarityData(state.rarity);
  const color = rarityData.colorANSI;

  // Pick sprite
  const emotion = MOOD_SPRITE_MAP[state.mood] || 'idle';
  let sprite: string;
  if (emotion === 'idle') {
    const frame = Date.now() % 3;
    sprite = sprites.idle[frame];
  } else {
    sprite = sprites[emotion] as string;
  }
  sprite = applyEyes(sprite, state.eyeVariant);

  // Hat above sprite
  const hatAscii = getHatAscii(state.hat);
  const hatLine = hatAscii ? '      ' + hatAscii + '\n' : '';

  // Shiny sparkle
  const shinyPrefix = state.isShiny ? renderShinyPrefix(0) + ' ' : '';

  // Build content sections
  const contentParts: string[] = [];

  // Sprite section
  contentParts.push(`${color}${shinyPrefix}${hatLine}${sprite}${RESET}`);
  contentParts.push('');

  // Identity
  const shinyTag = state.isShiny ? ' \u2728SHINY' : '';
  contentParts.push(`  ${color}${state.name}${RESET}  ${rarityData.starsDisplay}${shinyTag}`);
  contentParts.push(`  Species: ${state.species}  |  Lv.${state.level}`);
  contentParts.push(`  Mood: ${MOOD_EMOJI[state.mood]} ${state.mood}`);
  contentParts.push('');

  // EXP bar
  const expBar = renderRainbowBar(state.exp, state.expToNext, 20);
  contentParts.push(`  EXP ${expBar} ${state.exp}/${state.expToNext}`);
  contentParts.push('');

  // Personality
  const personalityKeys: PersonalityKey[] = ['debugging', 'patience', 'chaos', 'wisdom', 'snark'];
  contentParts.push('  -- Personality --');
  for (const key of personalityKeys) {
    const val = state.personality[key];
    const bar = personalityBar(val, 12);
    const peakMarker = key === state.peakAttribute ? ' \u2191' : '';
    const troughMarker = key === state.troughAttribute ? ' \u2193' : '';
    contentParts.push(`  ${key.padEnd(10)} ${bar} ${val}${peakMarker}${troughMarker}`);
  }
  contentParts.push('');

  // Attributes (round to integer for display)
  const attr = state.attributes;
  const r = (v: number) => Math.round(v);
  contentParts.push('  -- Attributes --');
  contentParts.push(`  STR:${r(attr.strength)}  INT:${r(attr.intelligence)}  CHR:${r(attr.charisma)}  LCK:${r(attr.luck)}`);
  contentParts.push(`  Hunger:${r(attr.hunger)}  Happy:${r(attr.happiness)}  NRG:${r(attr.energy)}`);
  contentParts.push('');

  // Stats
  if (state.stats) {
    contentParts.push('  -- Stats --');
    contentParts.push(`  Conversations: ${state.stats.totalConversations}  Pets: ${state.stats.totalPets}`);
    contentParts.push(`  Commands: ${state.stats.totalCommands}  Streak: ${state.stats.streakDays}d`);
  }

  // Soul description
  if (state.soul?.personalityDescription) {
    contentParts.push('');
    contentParts.push(`  "${state.soul.personalityDescription}"`);
  }

  const title = `${state.name} - ${rarityData.id.toUpperCase()}`;
  return frameBox(title, contentParts.join('\n'), 48);
}
