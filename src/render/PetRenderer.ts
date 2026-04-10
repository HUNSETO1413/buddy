import { PetState, MoodType, PersonalityKey, SpeciesSpriteMood, BuddyLanguage } from '../types';
import { SPRITES } from '../pet/sprites/index';
import { getRarityData } from '../pet/RaritySystem';
import { isShinyRoll, renderShinyPrefix } from '../pet/ShinySystem';
import { getHatAscii } from '../pet/HatSystem';
import { renderRainbowBar, renderPlainBar, RESET } from './RainbowBar';
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
// Attribute config: icon emoji + ANSI color per attribute
// ---------------------------------------------------------------------------
interface AttrConfig {
  icon: string;
  ansiColor: string;
}

const ATTR_CONFIG: Record<string, AttrConfig> = {
  strength:     { icon: '\uD83D\uDCAA', ansiColor: '\x1b[31m' },  // 💪 red
  intelligence: { icon: '\uD83E\uDDE0', ansiColor: '\x1b[34m' },  // 🧠 blue
  charisma:     { icon: '\u2728',       ansiColor: '\x1b[35m' },  // ✨ magenta
  luck:         { icon: '\uD83C\uDF40', ansiColor: '\x1b[32m' },  // 🍀 green
  hunger:       { icon: '\uD83C\uDF56', ansiColor: '\x1b[33m' },  // 🍖 yellow
  happiness:    { icon: '\uD83D\uDE0A', ansiColor: '\x1b[36m' },  // 😊 cyan
  energy:       { icon: '\u26A1',       ansiColor: '\x1b[93m' },  // ⚡ bright yellow
};

// Personality icons
const PERSONALITY_CONFIG: Record<string, { icon: string; ansiColor: string }> = {
  debugging: { icon: '\uD83D\uDC1B', ansiColor: '\x1b[32m' },  // 🐛 green
  patience:  { icon: '\uD83D\uDE0C', ansiColor: '\x1b[36m' },  // 😌 cyan
  chaos:     { icon: '\uD83D\uDD00', ansiColor: '\x1b[35m' },  // 🔀 magenta
  wisdom:    { icon: '\uD83E\uDDE0', ansiColor: '\x1b[34m' },  // 🧠 blue
  snark:     { icon: '\uD83D\uDCAC', ansiColor: '\x1b[33m' },  // 💬 yellow
};

// ---------------------------------------------------------------------------
// Dynamic color bar — color changes based on value
// 0-25: 🔴 red,  25-50: 🟠 orange,  50-75: 🟡 yellow,  75-100: 🟢 green
// ---------------------------------------------------------------------------
function valueColorDot(value: number): string {
  if (value >= 75) return '\uD83D\uDFE2'; // 🟢
  if (value >= 50) return '\uD83D\uDFE1'; // 🟡
  if (value >= 25) return '\uD83D\uDFE0'; // 🟠
  return '\uD83D\uDD34';                   // 🔴
}

function valueAnsiColor(value: number): string {
  if (value >= 75) return '\x1b[32m';  // green
  if (value >= 50) return '\x1b[33m';  // yellow
  if (value >= 25) return '\x1b[38;5;208m'; // orange
  return '\x1b[31m';                   // red
}

/** Plain bar with color dot indicator */
function plainColorBar(value: number, width: number = 8): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return valueColorDot(value) + ' ' + '\u2588'.repeat(Math.max(0, filled)) + '\u2591'.repeat(Math.max(0, empty));
}

/** ANSI colored bar — color shifts with value */
function ansiColorBar(value: number, width: number = 8): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  const color = valueAnsiColor(value);
  return `${color}${'\u2588'.repeat(Math.max(0, filled))}${RESET}${'\u2591'.repeat(Math.max(0, empty))}`;
}

// ---------------------------------------------------------------------------
// Personality bar with icon
// ---------------------------------------------------------------------------
function personalityPlainBar(value: number, width: number = 10): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  return valueColorDot(value) + ' ' + '\u2588'.repeat(Math.max(0, filled)) + '\u2591'.repeat(Math.max(0, empty));
}

function personalityAnsiBar(value: number, width: number = 10): string {
  const filled = Math.round((value / 100) * width);
  const empty = width - filled;
  const color = valueAnsiColor(value);
  return `${color}${'\u2588'.repeat(Math.max(0, filled))}${RESET}${'\u2591'.repeat(Math.max(0, empty))}`;
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
// Compact render: 3-5 lines (ANSI, for terminal CLI)
// ---------------------------------------------------------------------------
export function renderPetCompact(state: PetState): string {
  const lang: BuddyLanguage = state.language || 'en';
  const i18n = t(lang);
  const sprites = SPRITES[state.species];
  if (!sprites) return `[${state.name}]`;

  const rarityData = getRarityData(state.rarity);
  const color = rarityData.colorANSI;
  const rarityName = lang === 'zh' ? rarityData.nameZh : rarityData.id;

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
// Full card render with colored icons + dynamic bars (ANSI, for terminal)
// ---------------------------------------------------------------------------
export function renderPetCard(state: PetState): string {
  const lang: BuddyLanguage = state.language || 'en';
  const i18n = t(lang);
  const sprites = SPRITES[state.species];
  if (!sprites) return `[${state.name}]`;

  const rarityData = getRarityData(state.rarity);
  const color = rarityData.colorANSI;
  const rarityName = lang === 'zh' ? rarityData.nameZh : rarityData.id.toUpperCase();

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

  // Sprite
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

  // Personality with icons + dynamic colored bars
  const personalityKeys: PersonalityKey[] = ['debugging', 'patience', 'chaos', 'wisdom', 'snark'];
  contentParts.push(`  -- ${i18n.personality} --`);
  for (const key of personalityKeys) {
    const val = state.personality[key];
    const cfg = PERSONALITY_CONFIG[key];
    const bar = personalityAnsiBar(val, 12);
    const peakMarker = key === state.peakAttribute ? ' \u2191' : '';
    const troughMarker = key === state.troughAttribute ? ' \u2193' : '';
    const label = i18n.personalityLabels[key].padEnd(10);
    contentParts.push(`  ${cfg.icon} ${label} ${bar} ${val}${peakMarker}${troughMarker}`);
  }
  contentParts.push('');

  // Attributes with unique icons + dynamic colored bars
  const attr = state.attributes;
  const r = (v: number) => Math.round(v);
  contentParts.push(`  -- ${i18n.attributes} --`);

  const attrEntries: [string, number, string][] = [
    ['strength',     r(attr.strength),     i18n.attrStrength],
    ['intelligence', r(attr.intelligence),  i18n.attrIntelligence],
    ['charisma',     r(attr.charisma),      i18n.attrCharisma],
    ['luck',         r(attr.luck),          i18n.attrLuck],
    ['hunger',       r(attr.hunger),        i18n.attrHunger],
    ['happiness',    r(attr.happiness),     i18n.attrHappiness],
    ['energy',       r(attr.energy),        i18n.attrEnergy],
  ];

  for (const [key, val, label] of attrEntries) {
    const cfg = ATTR_CONFIG[key];
    const bar = ansiColorBar(val, 10);
    contentParts.push(`  ${cfg.icon} ${label.padEnd(6)} ${bar} ${val}`);
  }
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
  return frameBox(title, contentParts.join('\n'), 52);
}

// ---------------------------------------------------------------------------
// Plain text render — sprite left, attributes right, side-by-side layout
// ---------------------------------------------------------------------------
export function renderPetPlain(state: PetState): string {
  const lang: BuddyLanguage = state.language || 'en';
  const i18n = t(lang);
  const rarityData = getRarityData(state.rarity);
  const rarityName = lang === 'zh' ? rarityData.nameZh : rarityData.id;
  const moodEmoji = MOOD_EMOJI[state.mood] || '';
  const attr = state.attributes;
  const rv = (v: number) => Math.round(v);

  // Short attribute labels
  const shortLabels: Record<string, Record<BuddyLanguage, string>> = {
    strength:     { en: 'STR', zh: '力量' },
    intelligence: { en: 'INT', zh: '智力' },
    charisma:     { en: 'CHR', zh: '魅力' },
    luck:         { en: 'LCK', zh: '运气' },
    hunger:       { en: 'HGR', zh: '饥饿' },
    happiness:    { en: 'HPY', zh: '快乐' },
    energy:       { en: 'NRG', zh: '精力' },
  };

  // Get sprite lines (without ANSI)
  const sprites = SPRITES[state.species];
  const emotion = MOOD_SPRITE_MAP[state.mood] || 'idle';
  let sprite: string;
  if (emotion === 'idle') {
    const frame = Date.now() % 3;
    sprite = sprites.idle[frame];
  } else {
    sprite = sprites[emotion] as string;
  }
  sprite = applyEyes(sprite, state.eyeVariant);

  // Split sprite into individual lines
  const spriteLines = sprite.split('\n');

  // Hat as extra line above sprite
  const hatAscii = getHatAscii(state.hat);
  if (hatAscii) {
    spriteLines.unshift('   ' + hatAscii);
  }

  // Sprite column width (fixed 12 chars)
  const spriteWidth = 12;

  // Pad sprite lines to fixed width
  const paddedSprite = spriteLines.map(l => {
    // Strip any remaining ANSI
    const clean = l.replace(/\x1b\[[0-9;]*m/g, '');
    if (clean.length >= spriteWidth) return clean.slice(0, spriteWidth);
    return clean + ' '.repeat(spriteWidth - clean.length);
  });

  // Build right-side lines
  const rightLines: string[] = [];
  rightLines.push(`${state.name} ${i18n.level}${state.level} ${rarityData.starsDisplay} ${rarityName} ${moodEmoji}`);
  rightLines.push(`EXP ${renderPlainBar(state.exp, state.expToNext, 8)} ${state.exp}/${state.expToNext}`);

  const attrOrder = ['strength', 'intelligence', 'charisma', 'luck', 'hunger', 'happiness', 'energy'] as const;
  for (const key of attrOrder) {
    const val = rv(attr[key]);
    const cfg = ATTR_CONFIG[key];
    const label = shortLabels[key][lang].padEnd(lang === 'zh' ? 4 : 3);
    const bar = renderPlainBar(val, 100, 6);
    const dot = valueColorDot(val);
    rightLines.push(`${cfg.icon}${label}${dot}${bar}${val}`);
  }

  // Merge: sprite left + right side
  const totalLines = Math.max(paddedSprite.length, rightLines.length);
  const merged: string[] = [];
  merged.push(`🐾 ${rightLines[0]}`);
  for (let i = 0; i < totalLines; i++) {
    const left = i < paddedSprite.length ? paddedSprite[i] : ' '.repeat(spriteWidth);
    const right = i + 1 < rightLines.length ? rightLines[i + 1] : '';
    if (right) {
      merged.push(`${left}  ${right}`);
    } else {
      merged.push(left);
    }
  }

  return merged.join('\n');
}

// ---------------------------------------------------------------------------
// Full card in plain text — game-style, no ANSI/frame, for conversation display
// ---------------------------------------------------------------------------
export function renderPetCardPlain(state: PetState): string {
  const lang: BuddyLanguage = state.language || 'en';
  const i18n = t(lang);
  const rarityData = getRarityData(state.rarity);
  const rarityName = lang === 'zh' ? rarityData.nameZh : rarityData.id.toUpperCase();
  const moodEmoji = MOOD_EMOJI[state.mood] || '';
  const expBar = renderPlainBar(state.exp, state.expToNext, 15);
  const attr = state.attributes;
  const rv = (v: number) => Math.round(v);
  const shinyTag = state.isShiny ? ' ✨SHINY' : '';

  const shortLabels: Record<string, Record<BuddyLanguage, string>> = {
    strength:     { en: 'STR', zh: '力量' },
    intelligence: { en: 'INT', zh: '智力' },
    charisma:     { en: 'CHR', zh: '魅力' },
    luck:         { en: 'LCK', zh: '运气' },
    hunger:       { en: 'HGR', zh: '饥饿' },
    happiness:    { en: 'HPY', zh: '快乐' },
    energy:       { en: 'NRG', zh: '精力' },
  };

  const lines: string[] = [];

  // Header
  lines.push(`🐾 ═══ ${state.name} ═══ ${rarityData.starsDisplay} ${rarityName}${shinyTag}`);
  lines.push(`${moodEmoji} ${i18n.mood}: ${i18n.moodLabels[state.mood]}  |  ${i18n.level}${state.level}`);
  lines.push(`EXP ${expBar} ${state.exp}/${state.expToNext}`);

  // Personality
  lines.push(`── ${i18n.personality} ──`);
  const personalityKeys: PersonalityKey[] = ['debugging', 'patience', 'chaos', 'wisdom', 'snark'];
  for (const key of personalityKeys) {
    const val = state.personality[key];
    const cfg = PERSONALITY_CONFIG[key];
    const label = i18n.personalityLabels[key].padEnd(lang === 'zh' ? 4 : 10);
    const bar = renderPlainBar(val, 100, 8);
    const dot = valueColorDot(val);
    const peak = key === state.peakAttribute ? ' ↑' : '';
    const trough = key === state.troughAttribute ? ' ↓' : '';
    lines.push(`${cfg.icon} ${label} ${dot} ${bar} ${val}${peak}${trough}`);
  }

  // Attributes
  lines.push(`── ${i18n.attributes} ──`);
  const attrOrder = ['strength', 'intelligence', 'charisma', 'luck', 'hunger', 'happiness', 'energy'] as const;
  for (const key of attrOrder) {
    const val = rv(attr[key]);
    const cfg = ATTR_CONFIG[key];
    const label = shortLabels[key][lang].padEnd(lang === 'zh' ? 4 : 3);
    const bar = renderPlainBar(val, 100, 8);
    const dot = valueColorDot(val);
    lines.push(`${cfg.icon} ${label} ${dot} ${bar} ${val}`);
  }

  // Stats
  if (state.stats) {
    lines.push(`── ${i18n.stats} ──`);
    lines.push(`💬 ${i18n.conversations}: ${state.stats.totalConversations}  🤚 ${i18n.pets}: ${state.stats.totalPets}  ⌨ ${i18n.commands}: ${state.stats.totalCommands}  🔥 ${i18n.streak}: ${state.stats.streakDays}d`);
  }

  // Soul
  if (state.soul?.personalityDescription) {
    lines.push(`"${state.soul.personalityDescription}"`);
  }

  return lines.join('\n');
}
