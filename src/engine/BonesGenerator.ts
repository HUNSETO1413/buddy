import { fnv1a, SALT } from './fnv1a';
import {
  BonesLayer,
  SpeciesId,
  RarityTier,
  PersonalityKey,
  PersonalityProfile,
} from '../types';

const ALL_SPECIES: SpeciesId[] = [
  'duck', 'goose', 'cat', 'rabbit', 'owl', 'penguin',
  'turtle', 'snail', 'dragon', 'octopus', 'axolotl', 'ghost',
  'robot', 'blob', 'cactus', 'mushroom', 'capybara', 'chonk',
];

const EYE_VARIANTS = [
  'o.o', '^.^', '-.-', '\u2605.\u2605', '\u2665.\u2665',
  'O.O', '^.~', '\u00B0.\u00B0', '@.@', '\u25D5.\u25D5',
];

const HATS_BY_RARITY: Record<RarityTier, string[]> = {
  common: [],
  uncommon: ['bow', 'headband'],
  rare: ['cowboy', 'wizard', 'beret'],
  epic: ['crown', 'tophat', 'horns'],
  legendary: ['halo', 'flame', 'aurora'],
};

function pickSpecies(userId: string): SpeciesId {
  const hash = fnv1a(userId + '-species-' + SALT);
  const index = Math.abs(hash) % ALL_SPECIES.length;
  return ALL_SPECIES[index];
}

function pickRarity(userId: string): RarityTier {
  const roll = Math.abs(fnv1a(userId + '-rarity-' + SALT)) % 100;
  if (roll < 1) return 'legendary';
  if (roll < 5) return 'epic';
  if (roll < 15) return 'rare';
  if (roll < 40) return 'uncommon';
  return 'common';
}

function pickShiny(userId: string): boolean {
  return Math.abs(fnv1a(userId + '-shiny-' + SALT)) % 100 === 0;
}

function pickEyes(userId: string): string {
  const hash = fnv1a(userId + '-eye-' + SALT);
  const index = Math.abs(hash) % EYE_VARIANTS.length;
  return EYE_VARIANTS[index];
}

function pickHat(userId: string, rarity: RarityTier): string | null {
  const allAvailable: string[] = [];
  const rarityOrder: RarityTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  for (const tier of rarityOrder) {
    if (rarityOrder.indexOf(tier) <= rarityOrder.indexOf(rarity)) {
      allAvailable.push(...HATS_BY_RARITY[tier]);
    }
  }
  if (allAvailable.length === 0) return null;
  const hash = fnv1a(userId + '-hat-' + SALT);
  const index = Math.abs(hash) % allAvailable.length;
  return allAvailable[index];
}

function generatePersonality(userId: string, rarity: RarityTier): PersonalityProfile {
  const attributeFloors: Record<RarityTier, number> = {
    common: 10,
    uncommon: 25,
    rare: 40,
    epic: 55,
    legendary: 70,
  };
  const floor = attributeFloors[rarity];
  const keys: PersonalityKey[] = ['debugging', 'patience', 'chaos', 'wisdom', 'snark'];

  const values: Record<PersonalityKey, number> = {} as Record<PersonalityKey, number>;
  let peak: PersonalityKey = keys[0];
  let trough: PersonalityKey = keys[0];
  let peakValue = -1;
  let troughValue = 101;

  for (const key of keys) {
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

  return {
    ...values,
    peakAttribute: peak,
    troughAttribute: trough,
  };
}

export function generateBones(userId: string): BonesLayer {
  const species = pickSpecies(userId);
  const rarity = pickRarity(userId);
  const isShiny = pickShiny(userId);
  const eyeVariant = pickEyes(userId);
  const hat = pickHat(userId, rarity);
  const personality = generatePersonality(userId, rarity);

  return {
    species,
    rarity,
    isShiny,
    eyeVariant,
    hat,
    personality,
  };
}
