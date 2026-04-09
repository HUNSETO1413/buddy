import { PetState, MoodType } from '../types';

/**
 * Calculate the pet's current mood based on attribute thresholds.
 * Priority order:
 * 1. If energy < 20 -> sleeping
 * 2. Otherwise, based on happiness:
 *    >= 90 -> ecstatic
 *    >= 70 -> happy
 *    >= 50 -> neutral
 *    >= 30 -> sad
 *    < 30  -> angry
 */
export function calculateMood(state: PetState): MoodType {
  const energy = state.attributes?.energy ?? 50;
  const happiness = state.attributes?.happiness ?? 50;

  // Sleep overrides everything
  if (energy < 20) {
    return 'sleeping';
  }

  if (happiness >= 90) return 'ecstatic';
  if (happiness >= 70) return 'happy';
  if (happiness >= 50) return 'neutral';
  if (happiness >= 30) return 'sad';
  return 'angry';
}
