import { PetState, CommandResult } from '../types';
import { t } from '../i18n';

export async function unmute(state: PetState): Promise<CommandResult> {
  const lang = state.language || 'en';
  const i18n = t(lang);

  state.isMuted = false;

  const msg = i18n.unmuteResponse.replace('{name}', state.name || 'Buddy');
  return {
    success: true,
    message: msg,
    stateChanges: { isMuted: false },
  };
}
