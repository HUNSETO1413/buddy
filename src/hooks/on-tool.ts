import * as fs from 'fs';
import { StorageManager } from '../storage/StorageManager';
import { PetState, HookOutput, PostToolUseInput } from '../types';
import { checkLevelUp } from '../systems/LevelSystem';

// Read stdin
const rawInput = fs.readFileSync(0, 'utf8').trim();
const input: PostToolUseInput = JSON.parse(rawInput);
const toolName: string = input.tool_name || '';

const storage = new StorageManager();
const data = storage.load();

if (!data || !data.petState) {
  // No pet, nothing to do
  const output: HookOutput = {
    hookSpecificOutput: {
      hookEventName: 'PostToolUse',
      additionalContext: '',
    },
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

const state: PetState = data.petState;

// Apply exp gain for any tool usage
state.exp = (state.exp || 0) + 2;

// Tool-specific attribute gains
const lowerTool = toolName.toLowerCase();

if (lowerTool === 'write' || lowerTool === 'edit') {
  // Writing code builds strength
  state.attributes.strength = Math.min(100, (state.attributes.strength || 0) + 0.3);
}

if (lowerTool === 'bash') {
  // Running commands builds intelligence
  state.attributes.intelligence = Math.min(100, (state.attributes.intelligence || 0) + 0.5);
}

// Check level up
const leveledState = checkLevelUp(state);
const didLevelUp = leveledState.level > (state.level || 1);
state.level = leveledState.level;
state.exp = leveledState.exp;

// Update last interaction
if (state.stats) {
  state.stats.lastInteractionAt = new Date().toISOString();
}

// Save
data.petState = state;
storage.save(data);

// Build output
let additionalContext = '';

if (didLevelUp) {
  additionalContext = `\uD83C\uDF89 ${state.name || 'Buddy'} leveled up to Lv.${state.level}!`;
}

const output: HookOutput = {
  hookSpecificOutput: {
    hookEventName: 'PostToolUse',
    additionalContext,
  },
};
console.log(JSON.stringify(output));
process.exit(0);
