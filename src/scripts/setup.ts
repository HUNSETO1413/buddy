import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const BUDDY_DATA_DIR = path.join(os.homedir(), '.claude', 'buddy');
const SETTINGS_PATH = path.join(os.homedir(), '.claude', 'settings.json');
const COMMANDS_DIR = path.join(os.homedir(), '.claude', 'commands');
const PKG_ROOT = path.resolve(__dirname, '..', '..'); // dist/scripts/setup.js -> buddy root

function setup() {
  // 1. Create data directory
  fs.mkdirSync(BUDDY_DATA_DIR, { recursive: true });

  // 2. Resolve hook script paths (absolute)
  const onStart = path.join(PKG_ROOT, 'dist', 'hooks', 'on-start.js');
  const onPrompt = path.join(PKG_ROOT, 'dist', 'hooks', 'on-prompt.js');
  const onTool = path.join(PKG_ROOT, 'dist', 'hooks', 'on-tool.js');

  // 3. Read existing settings.json
  let settings: any = {};
  if (fs.existsSync(SETTINGS_PATH)) {
    try {
      settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
    } catch {
      settings = {};
    }
  }

  // 4. Ensure hooks object exists
  if (!settings.hooks) settings.hooks = {};

  // 5. Define buddy hooks
  const buddyHooks: Record<string, any> = {
    SessionStart: {
      matcher: '',
      hooks: [{ type: 'command', command: `node "${onStart}"` }],
    },
    UserPromptSubmit: {
      matcher: '',
      hooks: [{ type: 'command', command: `node "${onPrompt}"` }],
    },
    PostToolUse: {
      matcher: 'Write|Edit|Bash',
      hooks: [{ type: 'command', command: `node "${onTool}"` }],
    },
  };

  // 6. Merge hooks (replace existing buddy hooks, preserve others)
  for (const [event, hookConfig] of Object.entries(buddyHooks)) {
    if (!settings.hooks[event]) settings.hooks[event] = [];

    // Remove existing buddy hooks (identified by path containing buddy hook names)
    settings.hooks[event] = settings.hooks[event].filter((h: any) => {
      const cmd = h.hooks?.[0]?.command || h.command || '';
      return (
        !cmd.includes('on-start') &&
        !cmd.includes('on-prompt') &&
        !cmd.includes('on-tool')
      );
    });

    settings.hooks[event].push(hookConfig);
  }

  // 7. Write settings back
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(settings, null, 2));

  // 8. Create custom slash command for /buddy
  fs.mkdirSync(COMMANDS_DIR, { recursive: true });
  const cliPath = path.join(PKG_ROOT, 'dist', 'cli.js');
  const commandFile = path.join(COMMANDS_DIR, 'buddy.md');
  const commandContent = `---
description: "\uD83D\uDC3E Buddy Pet - View and interact with your virtual pet companion"
allowed-tools: Bash
---

Execute the buddy pet CLI and show the result to the user.

The buddy CLI is installed at: \`${cliPath.replace(/\\/g, '\\\\')}\`

## Instructions

1. Run the CLI with the user's argument: \`node "${cliPath.replace(/\\/g, '\\\\')}" $ARGUMENTS\`
   - No argument or "show" → show current pet
   - "card" or "stats" → show full attribute card
   - "hatch" → hatch a new pet
   - "lang zh" → switch to Chinese display
   - "lang en" → switch to English display
   - "update" → update to latest version from GitHub
   - "check" → check if a new version is available

2. Show the output to the user
3. Briefly explain the pet's status (species, rarity, personality)
`;
  fs.writeFileSync(commandFile, commandContent, 'utf8');

  console.log('\uD83D\uDC3E Claude Code Buddy Pet installed!');
  console.log('   Hooks registered in settings.json');
  console.log('   Custom command /user:buddy created');
  console.log('');
  console.log('   Next step: restart Claude Code and type /buddy');
}

setup();
