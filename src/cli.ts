#!/usr/bin/env node

import { StorageManager } from './storage/StorageManager';
import { hatch } from './commands/HatchCommand';
import { show } from './commands/ShowCommand';
import { card } from './commands/CardCommand';
import { PetState } from './types';

function printHelp(): void {
  const help = [
    'Claude Code Buddy Pet - CLI',
    '',
    'Usage: buddy <command>',
    '',
    'Commands:',
    '  hatch    Hatch a new pet (first time only)',
    '  show     Show your current pet (compact)',
    '  card     Show full pet card with stats',
    '  setup    Register hooks in Claude Code settings',
    '  help     Show this help message',
    '',
    'In Claude Code, use /buddy to interact with your pet.',
    '  /buddy          Show pet',
    '  /buddy pet      Pet your buddy',
    '  /buddy card     Show full card',
    '  /buddy stats    Show stats',
    '  /buddy mute     Mute pet speech bubbles',
    '  /buddy unmute   Unmute pet speech bubbles',
    '  /buddy off      Hide pet from view',
  ].join('\n');
  console.log(help);
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const command = args[0] || 'help';

  switch (command) {
    case 'hatch': {
      const userId = process.env.USER || process.env.USERNAME || 'anonymous';
      const result = await hatch(userId);
      console.log(result.message);
      break;
    }

    case 'show': {
      const storage = new StorageManager();
      const data = storage.load();
      if (!data || !data.petState) {
        console.log('No pet yet! Run `buddy hatch` to create one.');
        break;
      }
      const result = await show(data.petState);
      console.log(result.message);
      break;
    }

    case 'card': {
      const storage = new StorageManager();
      const data = storage.load();
      if (!data || !data.petState) {
        console.log('No pet yet! Run `buddy hatch` to create one.');
        break;
      }
      const result = await card(data.petState);
      console.log(result.message);
      break;
    }

    case 'setup': {
      // Dynamically import and run setup
      const setupPath = require.resolve('./scripts/setup');
      require(setupPath);
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    default:
      printHelp();
      break;
  }
}

main().catch((err) => {
  console.error('Buddy CLI error:', err.message);
  process.exit(1);
});
