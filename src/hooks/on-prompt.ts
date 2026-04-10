import * as fs from 'fs';
import { StorageManager } from '../storage/StorageManager';
import { PetState, HookOutput, UserPromptSubmitInput } from '../types';
import { parseBuddyCommand, COMMAND_MAP } from '../commands/CommandParser';
import { hatch } from '../commands/HatchCommand';
import { show } from '../commands/ShowCommand';
import { pet } from '../commands/PetCommand';
import { card } from '../commands/CardCommand';
import { mute } from '../commands/MuteCommand';
import { unmute } from '../commands/UnmuteCommand';
import { off } from '../commands/OffCommand';
import { lang } from '../commands/LangCommand';
import { updateCheck, updateRun } from '../commands/UpdateCommand';
import { renderPetCompact } from '../render/PetRenderer';
import { checkLevelUp } from '../systems/LevelSystem';
import { calculateMood } from '../systems/MoodSystem';
import { generateBubble } from '../systems/SpeechBubbleSystem';
import { applyDecay } from '../systems/AttributeSystem';
import { t } from '../i18n';

// Wrap everything in an async main so we can use await without top-level await
async function main(): Promise<void> {
  // Read stdin
  const rawInput = fs.readFileSync(0, 'utf8').trim();
  const input: UserPromptSubmitInput = JSON.parse(rawInput);
  const prompt = input.prompt || '';

  const storage = new StorageManager();
  let data = storage.load();

  // ---- No pet yet, check if they want to hatch ----
  if (!data || !data.petState) {
    if (prompt.trim() === '/buddy' || prompt.trim().startsWith('/buddy hatch')) {
      const userId = data?.userId || process.env.USER || process.env.USERNAME || 'anonymous';
      const result = await hatch(userId);
      const output: HookOutput = {
        hookSpecificOutput: {
          hookEventName: 'UserPromptSubmit',
          additionalContext: `\uD83D\uDC3E ${result.message}`,
        },
      };
      console.log(JSON.stringify(output));
      process.exit(0);
    }

    // No pet and not trying to hatch
    const output: HookOutput = {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext:
          '\uD83D\uDC3E No pet yet! Type /user:buddy to hatch your exclusive pet companion!',
      },
    };
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // ---- Pet exists, process command or normal prompt ----
  const state: PetState = data.petState;

  // Apply time-based decay
  const lastInteraction = state.stats?.lastInteractionAt
    ? new Date(state.stats.lastInteractionAt).getTime()
    : Date.now();
  const hoursElapsed = Math.max(0, (Date.now() - lastInteraction) / (1000 * 60 * 60));

  if (hoursElapsed > 0.01) {
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

  // Check if it's a /buddy command
  const parsed = parseBuddyCommand(prompt);
  if (parsed) {
    const mappedCommand = COMMAND_MAP[parsed.command] || parsed.command;
    let result;

    switch (mappedCommand) {
      case 'pet':
        result = await pet(state);
        break;
      case 'card':
        result = await card(state);
        break;
      case 'mute':
        result = await mute(state);
        break;
      case 'unmute':
        result = await unmute(state);
        break;
      case 'off':
        result = await off(state);
        break;
      case 'lang':
        result = await lang(state, parsed.args);
        break;
      case 'update':
        result = await updateRun(state);
        break;
      case 'check':
        result = await updateCheck(state);
        break;
      case 'show':
      default:
        result = await show(state);
        break;
    }

    // Save state after command
    if (state.stats) {
      state.stats.lastInteractionAt = new Date().toISOString();
    }
    if (result.stateChanges) {
      Object.assign(state, result.stateChanges);
    }
    data.petState = state;
    storage.save(data);

    const output: HookOutput = {
      hookSpecificOutput: {
        hookEventName: 'UserPromptSubmit',
        additionalContext: `\uD83D\uDC3E ${result.message}`,
      },
    };
    console.log(JSON.stringify(output));
    process.exit(0);
  }

  // ---- Normal prompt: auto-feed, gain exp, update stats ----
  state.exp = (state.exp || 0) + 1;
  state.attributes.hunger = Math.min(100, (state.attributes.hunger || 20) + 1);

  if (!state.stats) {
    state.stats = {
      totalPets: 0,
      totalConversations: 0,
      totalCommands: 0,
      totalTasks: 0,
      totalLinesGenerated: 0,
      totalBugsFixed: 0,
      streakDays: 0,
      lastInteractionAt: new Date().toISOString(),
    };
  }
  state.stats.totalConversations = (state.stats.totalConversations || 0) + 1;

  // Check level up
  const leveledState = checkLevelUp(state);
  state.level = leveledState.level;
  state.exp = leveledState.exp;

  // Calculate mood
  const mood = calculateMood(state);
  state.mood = mood;

  // Generate speech bubble
  const bubble = generateBubble(state, prompt);

  // Update last interaction
  state.stats.lastInteractionAt = new Date().toISOString();

  // Save
  data.petState = state;
  storage.save(data);

  // Build output
  let additionalContext = '';
  if (state.isVisible !== false) {
    const render = renderPetCompact(state);
    additionalContext = `\uD83D\uDC3E ${render}`;
    if (bubble) {
      additionalContext += `\n\uD83D\uDCAC "${bubble}"`;
    }
  }

  const output: HookOutput = {
    hookSpecificOutput: {
      hookEventName: 'UserPromptSubmit',
      additionalContext,
    },
  };
  console.log(JSON.stringify(output));
  process.exit(0);
}

main().catch((err) => {
  console.error('Hook error:', err.message);
  process.exit(1);
});
