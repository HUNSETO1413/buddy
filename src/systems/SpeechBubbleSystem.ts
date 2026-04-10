import { PetState, PersonalityKey, BuddyLanguage } from '../types';

interface BubbleRule {
  keywords: string[];
  keywordsZh: string[];
  responses: string[];
  responsesZh: string[];
  minHappiness?: number;
  maxHappiness?: number;
}

const BUBBLE_RULES: BubbleRule[] = [
  {
    keywords: ['bug', 'error', 'crash', 'fail', 'broken', 'exception', 'traceback', 'undefined'],
    keywordsZh: ['错误', '崩溃', '失败', '异常', 'bug', '报错', '故障'],
    responses: [
      'Uh oh... let me help debug that!',
      'Bugs fear me! Let\'s squash it!',
      'I smell a bug... *sniff sniff*',
      'Don\'t worry, we\'ll fix it together!',
      'Error? More like adventure!',
    ],
    responsesZh: [
      '哎呀...让我来帮你调试！',
      'Bug最怕我了！一起来消灭它！',
      '我闻到了bug的味道... *嗅嗅*',
      '别担心，我们一起修！',
      '报错？这叫冒险！',
    ],
  },
  {
    keywords: ['code', 'function', 'class', 'module', 'import', 'refactor', 'implement'],
    keywordsZh: ['代码', '函数', '类', '模块', '重构', '实现', '编程'],
    responses: [
      'Ooh, coding time! My favorite!',
      'I love watching you code!',
      'Can I help? I know some tricks!',
      '*takes notes eagerly*',
      'This is getting interesting!',
    ],
    responsesZh: [
      '哦哦，写代码时间！我最喜欢了！',
      '我最爱看你写代码了！',
      '能帮忙吗？我有些技巧！',
      '*认真做笔记*',
      '越来越有趣了！',
    ],
    minHappiness: 40,
  },
  {
    keywords: ['help', 'how', 'what', 'why', 'please', 'stuck'],
    keywordsZh: ['帮助', '怎么', '什么', '为什么', '请', '卡住', '求助'],
    responses: [
      'I\'m here for you!',
      'We can figure this out together!',
      'Don\'t give up! You\'re doing great!',
      'Let me think about that...',
      'Ask away! I\'m all ears!',
    ],
    responsesZh: [
      '我在这里陪你！',
      '我们一起想办法！',
      '别放弃！你做得很好！',
      '让我想想...',
      '问吧！我洗耳恭听！',
    ],
  },
  {
    keywords: ['test', 'spec', 'assert', 'expect', 'coverage', 'jest', 'mocha'],
    keywordsZh: ['测试', '断言', '覆盖', '单元测试'],
    responses: [
      'Testing! Very responsible!',
      '*stands at attention* Tests are important!',
      'Quality code needs quality tests!',
      'Green tests make me happy!',
    ],
    responsesZh: [
      '测试！很负责任！',
      '*立正* 测试很重要！',
      '高质量的代码需要高质量的测试！',
      '绿色的测试让我好开心！',
    ],
    minHappiness: 30,
  },
  {
    keywords: ['deploy', 'release', 'ship', 'production', 'prod', 'launch'],
    keywordsZh: ['部署', '发布', '上线', '投产'],
    responses: [
      'Deploying! How exciting!',
      'To production and beyond!',
      'Fingers crossed... *hides behind tail*',
      'This is the big moment!',
      'Go go go!',
    ],
    responsesZh: [
      '部署！好激动！',
      '冲向生产环境！',
      '祈祷中... *躲到尾巴后面*',
      '这是关键时刻！',
      '冲冲冲！',
    ],
  },
  {
    keywords: ['git', 'commit', 'push', 'merge', 'pull', 'branch', 'pr'],
    keywordsZh: ['提交', '合并', '推送', '分支'],
    responses: [
      'Version control! Nice!',
      'Git gud! Hehe, get it?',
      'Commit early, commit often!',
      '*watches the git graph grow*',
    ],
    responsesZh: [
      '版本控制！不错！',
      'Git gud！嘿嘿，懂吗？',
      '早提交，多提交！',
      '*看着git图表生长*',
    ],
    minHappiness: 20,
  },
  {
    keywords: ['hello', 'hi', 'hey', 'morning', 'evening', 'greetings'],
    keywordsZh: ['你好', '嗨', '早上好', '晚上好', '在吗'],
    responses: [
      'Hey there!',
      'Hello! Happy to see you!',
      'Hi hi hi! *wags tail*',
      'Welcome back!',
    ],
    responsesZh: [
      '嗨！',
      '你好！见到你真开心！',
      '嗨嗨嗨！ *摇尾巴*',
      '欢迎回来！',
    ],
  },
];

const IDLE_BUBBLES_EN: string[] = [
  '*yawns*',
  '*stretches*',
  '...',
  '*looks around curiously*',
  '*plays with a loose thread*',
  'La la la~',
  '*dozes off briefly*',
  '*stares into the distance*',
];

const IDLE_BUBBLES_ZH: string[] = [
  '*打哈欠*',
  '*伸懒腰*',
  '...',
  '*好奇地四处张望*',
  '*玩弄线头*',
  '啦啦啦~',
  '*打了个盹*',
  '*发呆中*',
];

export function generateBubble(state: PetState, context: string): string | null {
  if (state.isMuted) {
    return null;
  }

  const lang: BuddyLanguage = state.language || 'en';
  const happiness = state.attributes?.happiness ?? 50;
  const lowerContext = context.toLowerCase();

  for (const rule of BUBBLE_RULES) {
    if (rule.minHappiness !== undefined && happiness < rule.minHappiness) continue;
    if (rule.maxHappiness !== undefined && happiness > rule.maxHappiness) continue;

    const keywords = lang === 'zh' ? [...rule.keywords, ...rule.keywordsZh] : rule.keywords;
    const matched = keywords.some(kw => lowerContext.includes(kw));
    if (matched) {
      const pool = lang === 'zh' ? rule.responsesZh : rule.responses;
      const idx = Math.floor(Math.random() * pool.length);
      return pool[idx];
    }
  }

  // Random idle bubble (20% chance)
  if (Math.random() < 0.2) {
    const pool = lang === 'zh' ? IDLE_BUBBLES_ZH : IDLE_BUBBLES_EN;
    const idx = Math.floor(Math.random() * pool.length);
    return pool[idx];
  }

  return null;
}
