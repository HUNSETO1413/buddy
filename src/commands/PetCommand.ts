import { PetState, CommandResult } from '../types';
import { t } from '../i18n';

export async function pet(state: PetState): Promise<CommandResult> {
  const lang = state.language || 'en';
  const i18n = t(lang);

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

  const msg = i18n.petResponse.replace('{name}', state.name || 'Buddy');
  return {
    success: true,
    message: `\u2764\uFE0F ${msg}`,
    stateChanges: { attributes: { ...state.attributes } } as Partial<PetState>,
  };
}
