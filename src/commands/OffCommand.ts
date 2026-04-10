import { PetState, CommandResult } from '../types';
import { t } from '../i18n';

export async function off(state: PetState): Promise<CommandResult> {
  const lang = state.language || 'en';
  const i18n = t(lang);

  state.isVisible = false;

  const msg = i18n.offResponse.replace('{name}', state.name || 'Buddy');
  return {
    success: true,
    message: msg,
    stateChanges: { isVisible: false },
  };
}
