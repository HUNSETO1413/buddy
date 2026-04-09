import { BonesLayer, PetState, BuddyStorage, MoodType } from '../types';

export function createInitialState(bones: BonesLayer): PetState {
  return {
    id: `buddy-${Date.now()}`,
    name: bones.species.charAt(0).toUpperCase() + bones.species.slice(1),
    species: bones.species,
    rarity: bones.rarity,
    isShiny: bones.isShiny,
    eyeVariant: bones.eyeVariant,
    hat: bones.hat,
    personality: bones.personality,
    peakAttribute: bones.personality.peakAttribute,
    troughAttribute: bones.personality.troughAttribute,
    attributes: {
      hunger: 20,
      happiness: 70,
      energy: 80,
      intelligence: 30 + Math.floor(Math.random() * 30),
      strength: 30 + Math.floor(Math.random() * 30),
      charisma: 30 + Math.floor(Math.random() * 30),
      luck: 30 + Math.floor(Math.random() * 30),
    },
    level: 1,
    exp: 0,
    expToNext: 100,
    mood: 'happy' as MoodType,
    isVisible: true,
    isMuted: false,
    bornAt: new Date().toISOString(),
    soul: null,
    stats: {
      totalConversations: 0,
      totalCommands: 0,
      totalPets: 0,
      totalTasks: 0,
      totalLinesGenerated: 0,
      totalBugsFixed: 0,
      streakDays: 0,
      lastInteractionAt: new Date().toISOString(),
    },
  };
}

export function mergeBonesWithStorage(bones: BonesLayer, storage: BuddyStorage): PetState {
  if (!storage.petState) {
    // First time — create initial state from bones
    return createInitialState(bones);
  }
  // Anti-cheat: bones ALWAYS overwrite stored values
  const existing = storage.petState;
  return {
    ...existing,
    species: bones.species,
    rarity: bones.rarity,
    isShiny: bones.isShiny,
    eyeVariant: bones.eyeVariant,
    hat: bones.hat,
    personality: bones.personality,
    peakAttribute: bones.personality.peakAttribute,
    troughAttribute: bones.personality.troughAttribute,
    name: storage.soul?.name || existing.name,
    soul: storage.soul || existing.soul,
  };
}
