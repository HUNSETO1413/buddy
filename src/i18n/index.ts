import { BuddyLanguage, MoodType, PersonalityKey } from '../types';

// ---------------------------------------------------------------------------
// All translatable strings in one place
// ---------------------------------------------------------------------------

interface Translations {
  // Compact display
  mascotBack: string;
  noPetYet: string;
  noPetHatch: string;

  // Card sections
  species: string;
  level: string;
  mood: string;
  personality: string;
  attributes: string;
  stats: string;
  conversations: string;
  pets: string;
  commands: string;
  streak: string;

  // Personality labels
  personalityLabels: Record<PersonalityKey, string>;

  // Attribute labels
  attrStrength: string;
  attrIntelligence: string;
  attrCharisma: string;
  attrLuck: string;
  attrHunger: string;
  attrHappiness: string;
  attrEnergy: string;

  // Mood labels
  moodLabels: Record<MoodType, string>;

  // Command responses
  petResponse: string;
  muteResponse: string;
  unmuteResponse: string;
  offResponse: string;
  langChanged: string;
  langUsage: string;

  // CLI help
  cliHelp: string[];
}

const EN: Translations = {
  mascotBack: 'is back!',
  noPetYet: 'No pet yet!',
  noPetHatch: 'Type /user:buddy to hatch your exclusive pet companion!',

  species: 'Species',
  level: 'Lv.',
  mood: 'Mood',
  personality: 'Personality',
  attributes: 'Attributes',
  stats: 'Stats',
  conversations: 'Conversations',
  pets: 'Pets',
  commands: 'Commands',
  streak: 'Streak',

  personalityLabels: {
    debugging: 'DEBUG',
    patience: 'PATIENCE',
    chaos: 'CHAOS',
    wisdom: 'WISDOM',
    snark: 'SNARK',
  },

  attrStrength: 'STR',
  attrIntelligence: 'INT',
  attrCharisma: 'CHR',
  attrLuck: 'LCK',
  attrHunger: 'Hunger',
  attrHappiness: 'Happy',
  attrEnergy: 'NRG',

  moodLabels: {
    ecstatic: 'Ecstatic',
    happy: 'Happy',
    neutral: 'Neutral',
    sad: 'Sad',
    angry: 'Angry',
    sleeping: 'Sleeping',
  },

  petResponse: '*heart floats up* You pet {name}! Happiness +5',
  muteResponse: '{name} is now muted. Speech bubbles disabled.',
  unmuteResponse: '{name} is now unmuted! Speech bubbles restored!',
  offResponse: '{name} is now hidden. Type /user:buddy to show again.',
  langChanged: 'Language changed to {lang}!',
  langUsage: 'Usage: /user:buddy lang en | /user:buddy lang zh',

  cliHelp: [
    'Claude Code Buddy Pet - CLI',
    '',
    'Usage: buddy <command>',
    '',
    'Commands:',
    '  hatch    Hatch a new pet (first time only)',
    '  show     Show your current pet (compact)',
    '  card     Show full pet card with stats',
    '  lang     Set language (en/zh)',
    '  setup    Register hooks in Claude Code settings',
    '  help     Show this help message',
    '',
    'In Claude Code, use /user:buddy to interact with your pet.',
    '  /user:buddy          Show pet',
    '  /user:buddy pet      Pet your buddy',
    '  /user:buddy card     Show full card',
    '  /user:buddy lang zh  Switch to Chinese',
    '  /user:buddy lang en  Switch to English',
    '  /user:buddy mute     Mute pet speech bubbles',
    '  /user:buddy unmute   Unmute pet speech bubbles',
    '  /user:buddy off      Hide pet from view',
    '  /user:buddy update   Update to latest version',
    '  /user:buddy check    Check for updates',
  ],
};

const ZH: Translations = {
  mascotBack: '回来了！',
  noPetYet: '还没有宠物！',
  noPetHatch: '输入 /user:buddy 孵化你的专属宠物伙伴！',

  species: '物种',
  level: '等级',
  mood: '心情',
  personality: '性格',
  attributes: '属性',
  stats: '统计',
  conversations: '对话',
  pets: '抚摸',
  commands: '命令',
  streak: '连续',

  personalityLabels: {
    debugging: '调试',
    patience: '耐心',
    chaos: '混乱',
    wisdom: '智慧',
    snark: '毒舌',
  },

  attrStrength: '力量',
  attrIntelligence: '智力',
  attrCharisma: '魅力',
  attrLuck: '运气',
  attrHunger: '饥饿',
  attrHappiness: '快乐',
  attrEnergy: '精力',

  moodLabels: {
    ecstatic: '狂喜',
    happy: '开心',
    neutral: '平静',
    sad: '难过',
    angry: '生气',
    sleeping: '睡觉',
  },

  petResponse: '*飘出一颗爱心* 你摸了摸 {name}！快乐 +5',
  muteResponse: '{name} 已静音，气泡已关闭。',
  unmuteResponse: '{name} 已解除静音！气泡已恢复！',
  offResponse: '{name} 已隐藏。输入 /user:buddy 重新显示。',
  langChanged: '语言已切换为 {lang}！',
  langUsage: '用法: /user:buddy lang en | /user:buddy lang zh',

  cliHelp: [
    'Claude Code 宠物伙伴 - CLI',
    '',
    '用法: buddy <command>',
    '',
    '命令:',
    '  hatch    孵化新宠物（首次使用）',
    '  show     显示当前宠物（紧凑）',
    '  card     显示完整属性卡片',
    '  lang     设置语言（en/zh）',
    '  setup    注册 Claude Code 设置中的 hooks',
    '  help     显示帮助信息',
    '',
    '在 Claude Code 中，使用 /user:buddy 与宠物互动。',
    '  /user:buddy          显示宠物',
    '  /user:buddy pet      抚摸宠物',
    '  /user:buddy card     完整属性卡',
    '  /user:buddy lang zh  切换中文',
    '  /user:buddy lang en  切换英文',
    '  /user:buddy mute     静音气泡',
    '  /user:buddy unmute   解除静音',
    '  /user:buddy off      隐藏宠物',
    '  /user:buddy update   更新到最新版本',
    '  /user:buddy check    检查更新',
  ],
};

const TRANSLATIONS: Record<BuddyLanguage, Translations> = { en: EN, zh: ZH };

export function t(lang: BuddyLanguage): Translations {
  return TRANSLATIONS[lang] || EN;
}
