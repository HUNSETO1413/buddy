import { EyeVariant } from '../types';

export const EYE_VARIANTS: EyeVariant[] = [
  { id: 'round', eyes: 'o.o', name: 'Round' },
  { id: 'happy', eyes: '^.^', name: 'Happy' },
  { id: 'closed', eyes: '-.-', name: 'Closed' },
  { id: 'star', eyes: '\u2605.\u2605', name: 'Star' },
  { id: 'heart', eyes: '\u2665.\u2665', name: 'Heart' },
  { id: 'wide', eyes: 'O.O', name: 'Wide' },
  { id: 'wink', eyes: '^.~', name: 'Wink' },
  { id: 'blank', eyes: '\u00B0.\u00B0', name: 'Blank' },
  { id: 'dizzy', eyes: '@.@', name: 'Dizzy' },
  { id: 'target', eyes: '\u25D5.\u25D5', name: 'Target' },
];

export function resolveEyeVariant(hash: number): string {
  const index = Math.abs(hash) % EYE_VARIANTS.length;
  return EYE_VARIANTS[index].eyes;
}
