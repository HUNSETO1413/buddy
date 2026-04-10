import { PetState, CommandResult } from '../types';
import { t } from '../i18n';

export async function mute(state: PetState): Promise<CommandResult> {
  const lang = state.language || 'en';
  const i18n = t(lang);

  state.isMuted = true;

  const msg = i18n.muteResponse.replace('{name}', state.name || 'Buddy');
  return {
    success: true,
    message: msg,
    stateChanges: { isMuted: true },
  };
}
