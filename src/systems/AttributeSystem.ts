import { GameplayAttributes } from '../types';

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Apply time-based decay to pet attributes.
 * happiness: -0.5/hr
 * energy: -0.3/hr
 * hunger: +0.8/hr (increases over time)
 * Other attributes remain unchanged.
 */
export function applyDecay(attrs: GameplayAttributes, hoursElapsed: number): GameplayAttributes {
  return {
    happiness: clamp((attrs.happiness || 0) - 0.5 * hoursElapsed, 0, 100),
    energy: clamp((attrs.energy || 0) - 0.3 * hoursElapsed, 0, 100),
    hunger: clamp((attrs.hunger || 0) + 0.8 * hoursElapsed, 0, 100),
    intelligence: attrs.intelligence,
    strength: attrs.strength,
    charisma: attrs.charisma,
    luck: attrs.luck,
  };
}

/**
 * Apply attribute gains (e.g., from interactions).
 * Values are added to current attributes, then clamped to 0-100.
 * Only the attributes present in `gains` are modified.
 */
export function applyGains(
  attrs: GameplayAttributes,
  gains: Partial<GameplayAttributes>
): GameplayAttributes {
  return {
    happiness: clamp((attrs.happiness || 0) + (gains.happiness || 0), 0, 100),
    energy: clamp((attrs.energy || 0) + (gains.energy || 0), 0, 100),
    hunger: clamp((attrs.hunger || 0) + (gains.hunger || 0), 0, 100),
    intelligence: clamp((attrs.intelligence || 0) + (gains.intelligence || 0), 0, 100),
    strength: clamp((attrs.strength || 0) + (gains.strength || 0), 0, 100),
    charisma: clamp((attrs.charisma || 0) + (gains.charisma || 0), 0, 100),
    luck: clamp((attrs.luck || 0) + (gains.luck || 0), 0, 100),
  };
}
