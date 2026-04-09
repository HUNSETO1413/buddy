import { PetState } from '../types';

/**
 * Calculate the EXP required to reach the next level.
 * Formula: floor(100 * 1.15^(level-1))
 */
export function expRequired(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

/**
 * Check if the pet has enough EXP to level up.
 * If so, increment level and deduct the required EXP.
 * May level up multiple times if enough EXP accumulated.
 */
export function checkLevelUp(state: PetState): PetState {
  let exp = state.exp || 0;
  let level = state.level || 1;

  let required = expRequired(level);
  while (exp >= required) {
    exp -= required;
    level += 1;
    required = expRequired(level);
  }

  state.exp = exp;
  state.level = level;

  return state;
}
