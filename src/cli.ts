#!/usr/bin/env node

import { StorageManager } from './storage/StorageManager';
import { hatch } from './commands/HatchCommand';
import { show } from './commands/ShowCommand';
import { card } from './commands/CardCommand';
import { lang } from './commands/LangCommand';
import { PetState, BuddyLanguage } from './types';
import { t } from './i18n';

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

    case 'lang': {
      const storage = new StorageManager();
      const data = storage.load();
      if (!data || !data.petState) {
        console.log('No pet yet! Run `buddy hatch` to create one.');
        break;
      }
      const langArg = args[1];
      const result = await lang(data.petState, [langArg]);
      if (result.stateChanges) {
        Object.assign(data.petState, result.stateChanges);
        storage.save(data);
      }
      console.log(result.message);
      break;
    }

    case 'setup': {
      const setupPath = require.resolve('./scripts/setup');
      require(setupPath);
      break;
    }

    case 'help':
    case '--help':
    case '-h':
    default: {
      let lang: BuddyLanguage = 'en';
      try {
        const storage = new StorageManager();
        const data = storage.load();
        if (data?.petState?.language) {
          lang = data.petState.language;
        }
      } catch {}
      const i18n = t(lang);
      console.log(i18n.cliHelp.join('\n'));
      break;
    }
  }
}

main().catch((err) => {
  console.error('Buddy CLI error:', err.message);
  process.exit(1);
});
