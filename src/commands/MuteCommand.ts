import { PetState, CommandResult } from '../types';

export async function mute(state: PetState): Promise<CommandResult> {
  state.isMuted = true;

  return {
    success: true,
    message: `${state.name || 'Buddy'} has been muted. They'll stay quiet but are still watching! Use /buddy unmute to bring them back.`,
    stateChanges: { isMuted: true },
  };
}
