import { PetState, CommandResult } from '../types';

export async function unmute(state: PetState): Promise<CommandResult> {
  state.isMuted = false;

  return {
    success: true,
    message: `${state.name || 'Buddy'} has been unmuted! They're happy to chat again.`,
    stateChanges: { isMuted: false },
  };
}
