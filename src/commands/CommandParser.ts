import { PetState, CommandResult } from '../types';

export interface BuddyCommandHandler {
  name: string;
  execute(state: PetState, args: string[]): Promise<CommandResult>;
}

export function parseBuddyCommand(prompt: string): { command: string; args: string[] } | null {
  const trimmed = prompt.trim();
  // Match both /buddy and /user:buddy prefixes
  if (trimmed === '/buddy' || trimmed === '/user:buddy') return { command: 'show', args: [] };

  let prefix: string | null = null;
  if (trimmed.startsWith('/buddy ')) prefix = '/buddy ';
  else if (trimmed.startsWith('/user:buddy ')) prefix = '/user:buddy ';

  if (!prefix) return null;
  const parts = trimmed.slice(prefix.length).trim().split(/\s+/);
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
