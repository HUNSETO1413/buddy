import { PetState, CommandResult } from '../types';

export async function pet(state: PetState): Promise<CommandResult> {
  // Increment happiness by 5, capped at 100
  state.attributes.happiness = Math.min(100, (state.attributes.happiness || 0) + 5);

  // Increment total pets stat
  if (!state.stats) {
    state.stats = {
      totalPets: 0,
      totalConversations: 0,
      totalCommands: 0,
      totalTasks: 0,
      totalLinesGenerated: 0,
      totalBugsFixed: 0,
      streakDays: 0,
      lastInteractionAt: new Date().toISOString(),
    };
  }
  state.stats.totalPets = (state.stats.totalPets || 0) + 1;

  return {
    success: true,
    message: `\u2764\uFE0F You pet ${state.name || 'your buddy'}! Happiness: ${state.attributes.happiness}/100`,
    stateChanges: { attributes: { ...state.attributes } } as Partial<PetState>,
  };
}
