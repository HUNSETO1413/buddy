import { RarityTier, RarityTierData } from '../types';

export const RARITY_TIERS: RarityTierData[] = [
  {
    id: 'common',
    nameEn: 'Common',
    nameZh: '普通',
    probability: 60,
    stars: 1,
    attributeFloor: 10,
    unlockedHats: [],
    colorANSI: '\x1b[37m',   // white
    starsDisplay: '\u2605',
  },
  {
    id: 'uncommon',
    nameEn: 'Uncommon',
    nameZh: '稀有',
    probability: 25,
    stars: 2,
    attributeFloor: 25,
    unlockedHats: ['bow', 'headband'],
    colorANSI: '\x1b[32m',   // green
    starsDisplay: '\u2605\u2605',
  },
  {
    id: 'rare',
    nameEn: 'Rare',
    nameZh: '珍贵',
    probability: 10,
    stars: 3,
    attributeFloor: 40,
    unlockedHats: ['cowboy', 'wizard', 'beret'],
    colorANSI: '\x1b[34m',   // blue
    starsDisplay: '\u2605\u2605\u2605',
  },
  {
    id: 'epic',
    nameEn: 'Epic',
    nameZh: '史诗',
    probability: 4,
    stars: 4,
    attributeFloor: 55,
    unlockedHats: ['crown', 'tophat', 'horns'],
    colorANSI: '\x1b[35m',   // purple
    starsDisplay: '\u2605\u2605\u2605\u2605',
  },
  {
    id: 'legendary',
    nameEn: 'Legendary',
    nameZh: '传说',
    probability: 1,
    stars: 5,
    attributeFloor: 70,
    unlockedHats: ['halo', 'flame', 'aurora'],
    colorANSI: '\x1b[33m',   // gold
    starsDisplay: '\u2605\u2605\u2605\u2605\u2605',
  },
];

const THRESHOLDS: { max: number; tier: RarityTier }[] = [
  { max: 1, tier: 'legendary' },
  { max: 5, tier: 'epic' },
  { max: 15, tier: 'rare' },
  { max: 40, tier: 'uncommon' },
  { max: 100, tier: 'common' },
];

export function resolveRarity(hash: number): RarityTier {
  const roll = Math.abs(hash) % 100;
  for (const { max, tier } of THRESHOLDS) {
    if (roll < max) return tier;
  }
  return 'common';
}

export function getRarityData(tier: RarityTier): RarityTierData {
  return RARITY_TIERS.find(t => t.id === tier) || RARITY_TIERS[0];
}
