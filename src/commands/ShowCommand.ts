import { PetState, CommandResult } from '../types';
import { renderPetCompact } from '../render/PetRenderer';

export async function show(state: PetState): Promise<CommandResult> {
  const render = renderPetCompact(state);
  return {
    success: true,
    message: render,
    stateChanges: {},
  };
}
