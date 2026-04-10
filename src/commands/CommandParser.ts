import { PetState, CommandResult } from '../types';

export interface BuddyCommandHandler {
  name: string;
  execute(state: PetState, args: string[]): Promise<CommandResult>;
}

export function parseBuddyCommand(prompt: string): { command: string; args: string[] } | null {
  const trimmed = prompt.trim();
  if (trimmed === '/buddy') return { command: 'show', args: [] };
  if (!trimmed.startsWith('/buddy ')) return null;

  const parts = trimmed.slice(7).trim().split(/\s+/);
  return { command: parts[0], args: parts.slice(1) };
}

export const COMMAND_MAP: Record<string, string> = {
  'pet': 'pet',
  'card': 'card',
  'stats': 'card',
  'mute': 'mute',
  'unmute': 'unmute',
  'off': 'off',
  'hide': 'off',
  'show': 'show',
  'lang': 'lang',
  'language': 'lang',
  'update': 'update',
  'upgrade': 'update',
  'check': 'check',
  'version': 'check',
};
