import { RarityTier, HatDefinition } from '../types';
import { fnv1a, SALT } from '../engine/fnv1a';

export const HAT_DATABASE: HatDefinition[] = [
  { id: 'bow', nameEn: 'Bow', nameZh: '蝴蝶结', ascii: '\u2588\u2584\u2588', minRarity: 'uncommon' },
  { id: 'headband', nameEn: 'Headband', nameZh: '头带', ascii: '[===]', minRarity: 'uncommon' },
  { id: 'cowboy', nameEn: 'Cowboy Hat', nameZh: '牛仔帽', ascii: '\\^^^/', minRarity: 'rare' },
  { id: 'wizard', nameEn: 'Wizard Hat', nameZh: '巫师帽', ascii: ' /\\~', minRarity: 'rare' },
  { id: 'beret', nameEn: 'Beret', nameZh: '贝雷帽', ascii: ' .--.', minRarity: 'rare' },
  { id: 'crown', nameEn: 'Crown', nameZh: '皇冠', ascii: '/\\**/\\', minRarity: 'epic' },
  { id: 'tophat', nameEn: 'Top Hat', nameZh: '礼帽', ascii: '|___|', minRarity: 'epic' },
  { id: 'horns', nameEn: 'Horns', nameZh: '恶魔角', ascii: '/\\  /\\', minRarity: 'epic' },
  { id: 'halo', nameEn: 'Halo', nameZh: '光环', ascii: '(~~~)', minRarity: 'legendary' },
  { id: 'flame', nameEn: 'Flame Crown', nameZh: '火焰冠', ascii: '\\|/|\\|/', minRarity: 'legendary' },
  { id: 'aurora', nameEn: 'Aurora', nameZh: '极光', ascii: '~~~~~', minRarity: 'legendary' },
];

const RARITY_ORDER: RarityTier[] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];

export function resolveHat(userId: string, rarity: RarityTier): string | null {
  const rarityIndex = RARITY_ORDER.indexOf(rarity);
  const available = HAT_DATABASE.filter(hat =>
    RARITY_ORDER.indexOf(hat.minRarity) <= rarityIndex
  );

  if (available.length === 0) return null;

  const hash = fnv1a(userId + '-hat-' + SALT);
  const index = Math.abs(hash) % available.length;
  return available[index].id;
}

export function getHatAscii(hatId: string | null): string | null {
  if (!hatId) return null;
  const hat = HAT_DATABASE.find(h => h.id === hatId);
  return hat ? hat.ascii : null;
}
