import { PersonalityProfile, PersonalityKey, RarityTier } from '../types';
import { fnv1a, SALT } from '../engine/fnv1a';

export const PERSONALITY_KEYS: PersonalityKey[] = [
  'debugging',
  'patience',
  'chaos',
  'wisdom',
  'snark',
];

const ATTRIBUTE_FLOORS: Record<RarityTier, number> = {
  common: 10,
  uncommon: 25,
  rare: 40,
  epic: 55,
  legendary: 70,
};

export function generatePersonality(userId: string, rarity: RarityTier): PersonalityProfile {
  const floor = ATTRIBUTE_FLOORS[rarity];
  const values: Record<PersonalityKey, number> = {} as Record<PersonalityKey, number>;
  let peak: PersonalityKey = PERSONALITY_KEYS[0];
  let trough: PersonalityKey = PERSONALITY_KEYS[0];
  let peakValue = -1;
  let troughValue = 101;

  for (const key of PERSONALITY_KEYS) {
    const hash = fnv1a(userId + '-personality-' + key + '-' + SALT);
    // Generate value between floor and 100
    const range = 100 - floor;
    const value = floor + (Math.abs(hash) % (range + 1));
    values[key] = value;

    if (value > peakValue) {
      peakValue = value;
      peak = key;
    }
    if (value < troughValue) {
      troughValue = value;
      trough = key;
    }
  }

  // Enforce peak is in 85-100 range
  const peakHash = fnv1a(userId + '-peak-salt-' + SALT);
  values[peak] = 85 + (Math.abs(peakHash) % 16); // 85-100

  // Enforce trough is in floor to floor+15 range
  const troughHash = fnv1a(userId + '-trough-salt-' + SALT);
  values[trough] = floor + (Math.abs(troughHash) % 16); // floor to floor+15

  return {
    ...values,
    peakAttribute: peak,
    troughAttribute: trough,
  };
}
