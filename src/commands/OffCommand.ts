import { PetState, CommandResult } from '../types';

export async function off(state: PetState): Promise<CommandResult> {
  state.isVisible = false;

  return {
    success: true,
    message: `${state.name || 'Buddy'} is now hidden. They're resting behind the scenes. Use /buddy show to bring them back.`,
    stateChanges: { isVisible: false },
  };
}
