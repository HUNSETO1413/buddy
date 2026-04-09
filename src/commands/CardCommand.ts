import { PetState, CommandResult } from '../types';
import { renderPetCard } from '../render/PetRenderer';

export async function card(state: PetState): Promise<CommandResult> {
  const render = renderPetCard(state);
  return {
    success: true,
    message: render,
    stateChanges: {},
  };
}
