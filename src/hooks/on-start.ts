import * as fs from 'fs';
import { StorageManager } from '../storage/StorageManager';
import { generateBones } from '../engine/BonesGenerator';
import { mergeBonesWithStorage } from '../engine/AntiCheat';
import { renderPetCompact } from '../render/PetRenderer';
import { SessionStartInput, HookOutput, PetState } from '../types';
import { applyDecay } from '../systems/AttributeSystem';
import { t } from '../i18n';

// Read stdin
const rawInput = fs.readFileSync(0, 'utf8').trim();
const input: SessionStartInput = JSON.parse(rawInput);

const storage = new StorageManager();
const data = storage.load();

if (!data || !data.petState) {
  // No pet yet
  const output: HookOutput = {
    hookSpecificOutput: {
      hookEventName: 'SessionStart',
      additionalContext:
        '\uD83D\uDC3E Buddy Pet: No pet yet! Type /user:buddy to hatch your exclusive pet companion!',
    },
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

// Recalculate bones (anti-cheat), merge with stored state
const bones = generateBones(data.userId);
const state: PetState = mergeBonesWithStorage(bones, data);

// Apply time-based decay since last interaction
const lastInteraction = state.stats?.lastInteractionAt
  ? new Date(state.stats.lastInteractionAt).getTime()
  : Date.now();
const hoursElapsed = Math.max(0, (Date.now() - lastInteraction) / (1000 * 60 * 60));

if (hoursElapsed > 0.01) {
  // More than ~36 seconds
  const decayed = applyDecay(
    {
      happiness: state.attributes.happiness ?? 50,
      energy: state.attributes.energy ?? 80,
      hunger: state.attributes.hunger ?? 20,
      intelligence: state.attributes.intelligence ?? 30,
      strength: state.attributes.strength ?? 30,
      charisma: state.attributes.charisma ?? 30,
      luck: state.attributes.luck ?? 30,
    },
    hoursElapsed
  );
  state.attributes.happiness = decayed.happiness;
  state.attributes.energy = decayed.energy;
  state.attributes.hunger = decayed.hunger;
}

// Update last interaction time
if (state.stats) {
  state.stats.lastInteractionAt = new Date().toISOString();
}

// Save updated state
data.petState = state;
storage.save(data);

// Render welcome
const lang = state.language || 'en';
const i18n = t(lang);
const render = renderPetCompact(state);
const output: HookOutput = {
  hookSpecificOutput: {
    hookEventName: 'SessionStart',
    additionalContext: `\uD83D\uDC3E ${state.soul?.name || state.name} ${i18n.mascotBack}\n${render}`,
  },
};
console.log(JSON.stringify(output));
process.exit(0);
