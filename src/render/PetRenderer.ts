import { PetState, MoodType, PersonalityKey, SpeciesSpriteMood, BuddyLanguage } from '../types';
import { SPRITES } from '../pet/sprites/index';
import { getRarityData } from '../pet/RaritySystem';
import { isShinyRoll, renderShinyPrefix } from '../pet/ShinySystem';
import { getHatAscii } from '../pet/HatSystem';
import { renderRainbowBar, RESET } from './RainbowBar';
import { frameBox } from './ASCIIFrame';
import { t } from '../i18n';

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
// Attribute bar (same as personality bar but shorter)
// ---------------------------------------------------------------------------
function attrBar(value: number, width: number = 8): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return '\u2588'.repeat(Math.max(0, filled)) + '\u2591'.repeat(Math.max(0, empty));
}

// ---------------------------------------------------------------------------
// Apply eye variant to sprite
// ---------------------------------------------------------------------------
function applyEyes(sprite: string, eyeVariant: string): string {
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
// Compact render: 3-5 lines (used in auto-display hooks)
// ---------------------------------------------------------------------------
export function renderPetCompact(state: PetState): string {
  const lang: BuddyLanguage = state.language || 'en';
  const i18n = t(lang);
  const sprites = SPRITES[state.species];
  if (!sprites) return `[${state.name}]`;

  const rarityData = getRarityData(state.rarity);
  const color = rarityData.colorANSI;
  const rarityName = lang === 'zh' ? rarityData.nameZh : rarityData.id;

  // Pick sprite based on mood
  const emotion = MOOD_SPRITE_MAP[state.mood] || 'idle';
  let sprite: string;
  if (emotion === 'idle') {
    const frame = Date.now() % 3;
    sprite = sprites.idle[frame];
  } else {
    sprite = sprites[emotion] as string;
  }

  sprite = applyEyes(sprite, state.eyeVariant);

  const hatAscii = getHatAscii(state.hat);
  const hatLine = hatAscii ? '   ' + hatAscii + '\n' : '';

  const shinyLine = state.isShiny ? renderShinyPrefix(0) + ' ' : '';

  const moodEmoji = MOOD_EMOJI[state.mood] || '';

  const expBar = renderRainbowBar(state.exp, state.expToNext, 15);

  const lines: string[] = [];
  lines.push(`${color}${shinyLine}${hatLine}${sprite}${RESET}`);
  lines.push(`${moodEmoji} ${color}${state.name}${RESET} ${i18n.level}${state.level} ${rarityData.starsDisplay} ${rarityName}`);
  lines.push(`EXP ${expBar} ${state.exp}/${state.expToNext}`);

  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Full card render with complete skill tree + attributes
// ---------------------------------------------------------------------------
export function renderPetCard(state: PetState): string {
  const lang: BuddyLanguage = state.language || 'en';
  const i18n = t(lang);
  const sprites = SPRITES[state.species];
  if (!sprites) return `[${state.name}]`;

  const rarityData = getRarityData(state.rarity);
  const color = rarityData.colorANSI;
  const rarityName = lang === 'zh' ? rarityData.nameZh : rarityData.id.toUpperCase();

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

  const hatAscii = getHatAscii(state.hat);
  const hatLine = hatAscii ? '      ' + hatAscii + '\n' : '';

  const shinyPrefix = state.isShiny ? renderShinyPrefix(0) + ' ' : '';

  const contentParts: string[] = [];

  // Sprite section
  contentParts.push(`${color}${shinyPrefix}${hatLine}${sprite}${RESET}`);
  contentParts.push('');

  // Identity
  const shinyTag = state.isShiny ? ' \u2728SHINY' : '';
  contentParts.push(`  ${color}${state.name}${RESET}  ${rarityData.starsDisplay}${shinyTag}`);
  contentParts.push(`  ${i18n.species}: ${rarityName}  |  ${i18n.level}${state.level}`);
  contentParts.push(`  ${i18n.mood}: ${MOOD_EMOJI[state.mood]} ${i18n.moodLabels[state.mood]}`);
  contentParts.push('');

  // EXP bar
  const expBar = renderRainbowBar(state.exp, state.expToNext, 20);
  contentParts.push(`  EXP ${expBar} ${state.exp}/${state.expToNext}`);
  contentParts.push('');

  // Personality (full bars with values)
  const personalityKeys: PersonalityKey[] = ['debugging', 'patience', 'chaos', 'wisdom', 'snark'];
  contentParts.push(`  -- ${i18n.personality} --`);
  for (const key of personalityKeys) {
    const val = state.personality[key];
    const bar = personalityBar(val, 12);
    const peakMarker = key === state.peakAttribute ? ' \u2191' : '';
    const troughMarker = key === state.troughAttribute ? ' \u2193' : '';
    const label = i18n.personalityLabels[key].padEnd(10);
    contentParts.push(`  ${label} ${bar} ${val}${peakMarker}${troughMarker}`);
  }
  contentParts.push('');

  // Full Attributes with bars
  const attr = state.attributes;
  const r = (v: number) => Math.round(v);
  contentParts.push(`  -- ${i18n.attributes} --`);
  contentParts.push(`  ${i18n.attrStrength.padEnd(6)} ${attrBar(r(attr.strength))} ${r(attr.strength)}`);
  contentParts.push(`  ${i18n.attrIntelligence.padEnd(6)} ${attrBar(r(attr.intelligence))} ${r(attr.intelligence)}`);
  contentParts.push(`  ${i18n.attrCharisma.padEnd(6)} ${attrBar(r(attr.charisma))} ${r(attr.charisma)}`);
  contentParts.push(`  ${i18n.attrLuck.padEnd(6)} ${attrBar(r(attr.luck))} ${r(attr.luck)}`);
  contentParts.push(`  ${i18n.attrHunger.padEnd(6)} ${attrBar(r(attr.hunger))} ${r(attr.hunger)}`);
  contentParts.push(`  ${i18n.attrHappiness.padEnd(6)} ${attrBar(r(attr.happiness))} ${r(attr.happiness)}`);
  contentParts.push(`  ${i18n.attrEnergy.padEnd(6)} ${attrBar(r(attr.energy))} ${r(attr.energy)}`);
  contentParts.push('');

  // Stats
  if (state.stats) {
    contentParts.push(`  -- ${i18n.stats} --`);
    contentParts.push(`  ${i18n.conversations}: ${state.stats.totalConversations}  ${i18n.pets}: ${state.stats.totalPets}`);
    contentParts.push(`  ${i18n.commands}: ${state.stats.totalCommands}  ${i18n.streak}: ${state.stats.streakDays}d`);
  }

  // Soul description
  if (state.soul?.personalityDescription) {
    contentParts.push('');
    contentParts.push(`  "${state.soul.personalityDescription}"`);
  }

  const title = `${state.name} - ${rarityName}`;
  return frameBox(title, contentParts.join('\n'), 50);
}
