import { generateBones } from '../engine/BonesGenerator';
import { generateDefaultSoul } from '../engine/SoulGenerator';
import { createInitialState } from '../engine/AntiCheat';
import { StorageManager } from '../storage/StorageManager';
import { BuddyStorage, PetState, BonesLayer } from '../types';

function rarityStars(rarity: string): string {
  const map: Record<string, string> = {
    common: '\u2605',
    uncommon: '\u2605\u2605',
    rare: '\u2605\u2605\u2605',
    epic: '\u2605\u2605\u2605\u2605',
    legendary: '\u2605\u2605\u2605\u2605\u2605',
  };
  return map[rarity] || '\u2605';
}

export async function hatch(userId: string): Promise<{ state: PetState; message: string }> {
  const storage = new StorageManager();

  // Check if pet already exists
  const existing = storage.load();
  if (existing && existing.petState) {
    return {
      state: existing.petState,
      message: `You already have a pet: ${existing.petState.name}! Use /buddy show to see them.`,
    };
  }

  // Generate bones (genetics)
  const bones: BonesLayer = generateBones(userId);

  // Generate soul (personality, name, etc.)
  const soul = generateDefaultSoul(bones);

  // Create initial gameplay state (takes bones, returns PetState)
  const state = createInitialState(bones);

  // Attach soul to state
  state.soul = soul;

  // Persist
  const storageData: BuddyStorage = {
    userId,
    petState: state,
    soul,
    version: 1,
  };
  storage.save(storageData);

  const stars = rarityStars(state.rarity || 'common');
  const personalityHighlights = state.soul?.personalityDescription || 'curious and friendly';

  const message = [
    `Egg cracked! Your ${state.species || 'pet'} hatched!`,
    `Name: ${state.name}`,
    `Rarity: ${stars} ${state.rarity || 'common'}`,
    `Personality: ${personalityHighlights}`,
    '',
    'Welcome to your new companion! Use /buddy to interact.',
  ].join('\n');

  return { state, message };
}
