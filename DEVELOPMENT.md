# Claude Code Buddy Pet - 开发文档

> 一个跟随 Claude Code 输入框出现的虚拟宠物系统，将编程交互转化为养成体验。

---

## 1. 项目概述

### 1.1 核心理念

Buddy 是一只生活在 Claude Code 终端里的虚拟宠物。每次对话就是"喂养"，每次命令就是"互动"。它拥有属性、技能卡、等级系统，随着你的开发活动不断成长。

### 1.2 设计目标

| 目标 | 说明 |
|------|------|
| **沉浸感** | 宠物以 ASCII/Unicode 小精灵形式出现在输入框旁，不干扰工作流 |
| **成长性** | 属性、技能、等级随使用持续增长 |
| **轻量化** | 纯终端渲染，不依赖 GUI 窗口 |
| **可扩展** | 插件式命令系统，方便新增交互行为 |

### 1.3 技术栈

```
Runtime:   Node.js (与 Claude Code 共存)
UI:        Terminal ASCII Art + ANSI Colors (Rainbow bar)
Storage:   ~/.claude/buddy/ (JSON 持久化)
Config:    ~/.claude/settings.json (buddy 配置段)
Integration: Claude Code Hooks (user-prompt-submit, tool-use 等事件)
```

---

## 2. 架构设计

### 2.1 系统架构图

```
┌─────────────────────────────────────────────────┐
│                  Claude Code CLI                 │
│                                                  │
│  ┌───────────┐    ┌──────────────────────────┐  │
│  │  Input     │    │     Buddy Engine          │  │
│  │  Prompt    │───>│  ┌──────┐ ┌───────────┐  │  │
│  │  ┌─────┐  │    │  │Command│ │  Pet State │  │  │
│  │  │ PET │  │    │  │Parser │ │  Manager   │  │  │
│  │  │ ^_^ │  │    │  └──┬───┘ └─────┬─────┘  │  │
│  │  └─────┘  │    │     │           │         │  │
│  └───────────┘    │  ┌──▼───────────▼──┐     │  │
│                    │  │  Event Bus       │     │  │
│                    │  │  (hooks bridge)  │     │  │
│                    │  └──┬──────┬───────┘     │  │
│                    │     │      │              │  │
│                    │  ┌──▼──┐ ┌─▼────┐        │  │
│                    │  │Skill│ │Attr  │        │  │
│                    │  │Card │ │System│        │  │
│                    │  └─────┘ └──────┘        │  │
│                    │  ┌──────┐ ┌────────┐     │  │
│                    │  │Render│ │Storage │     │  │
│                    │  │Engine│ │ Layer  │     │  │
│                    │  └──────┘ └────────┘     │  │
│                    └──────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

### 2.2 目录结构

```
buddy/
├── src/
│   ├── index.ts              # 入口，注册 hooks
│   ├── engine/
│   │   ├── BuddyEngine.ts    # 主引擎，协调各模块
│   │   ├── EventBus.ts       # 事件总线
│   │   └── CommandParser.ts  # 命令解析器
│   ├── pet/
│   │   ├── PetState.ts       # 宠物状态模型
│   │   ├── PetRenderer.ts    # ASCII 渲染器
│   │   ├── PetAnimation.ts   # 动画系统（彩虹条等）
│   │   └── sprites/
│   │       ├── cat.ts        # 猫形态 ASCII
│   │       ├── dragon.ts     # 龙形态 ASCII
│   │       └── slime.ts      # 史莱姆形态 ASCII
│   ├── systems/
│   │   ├── AttributeSystem.ts  # 属性系统
│   │   ├── SkillCardSystem.ts  # 技能卡系统
│   │   ├── LevelSystem.ts      # 等级系统
│   │   ├── MoodSystem.ts       # 心情系统
│   │   └── AchievementSystem.ts # 成就系统
│   ├── commands/
│   │   ├── PetCommand.ts      # /pet 抚摸
│   │   ├── FeedCommand.ts     # /feed 喂养（自动，每次对话）
│   │   ├── ShowCommand.ts     # /show 显示
│   │   ├── HideCommand.ts     # /hide 隐藏
│   │   ├── TaskCommand.ts     # /task 任务
│   │   ├── WorkCommand.ts     # /work 干活
│   │   ├── SkillCommand.ts    # /skill 技能卡
│   │   ├── StatsCommand.ts    # /stats 属性值
│   │   ├── PlayCommand.ts     # /play 玩耍
│   │   ├── HealCommand.ts     # /heal 治疗
│   │   └── EvolveCommand.ts   # /evolve 进化
│   ├── storage/
│   │   ├── StorageManager.ts  # 持久化管理
│   │   └── migrations/        # 数据迁移脚本
│   └── render/
│       ├── RainbowBar.ts      # 彩虹进度条
│       ├── ASCIIFrame.ts      # ASCII 边框工具
│       └── ThemeManager.ts    # 主题配色
├── data/
│   ├── default-pet.json       # 默认宠物配置
│   ├── skills.json            # 技能定义库
│   └── achievements.json      # 成就定义库
├── __tests__/                 # 单元测试
├── package.json
├── tsconfig.json
└── DEVELOPMENT.md
```

---

## 3. 数据模型

### 3.1 宠物状态 (PetState)

```typescript
interface PetState {
  // 基础信息
  id: string;                  // 宠物唯一 ID
  name: string;                // 宠物名字（可自定义）
  species: 'duck' | 'goose' | 'cat' | 'rabbit' | 'owl' | 'penguin' |
           'turtle' | 'snail' | 'dragon' | 'octopus' | 'axolotl' |
           'ghost' | 'robot' | 'blob' | 'cactus' | 'mushroom' |
           'capybara' | 'chonk';
  stage: 'egg' | 'baby' | 'child' | 'adult' | 'legendary';
  bornAt: string;              // ISO timestamp

  // 稀有度与闪光
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  isShiny: boolean;            // 闪光变异（1% 独立概率）

  // 外观配件（由稀有度解锁）
  hat: string | null;          // 帽子类型（由稀有度决定可解锁范围）
  eyeVariant: string;          // 眼睛变体

  // 五大性格属性 (0-100) — 由 FNV-1a 哈希确定性生成
  personality: {
    debugging: number;         // 🐛 发现代码问题的能力
    patience: number;          // 😌 反馈风格的温和程度
    chaos: number;             // 🔀 反应的不可预测性
    wisdom: number;            // 🧠 技术洞察的深度
    snark: number;             // 💬 评论的犀利程度
  };
  peakAttribute: string;       // 峰值属性名（接近上限）
  troughAttribute: string;     // 低谷属性名（接近下限）

  // 养成属性 (0-100)
  attributes: {
    hunger: number;            // 饥饿度 (低 = 吃饱)
    happiness: number;         // 快乐值
    energy: number;            // 精力值
    intelligence: number;      // 智力 (累计)
    strength: number;          // 力量 (累计)
    charisma: number;          // 魅力 (累计)
    luck: number;              // 运气 (随机波动)
  };

  // 等级系统
  level: number;               // 当前等级
  exp: number;                 // 当前经验值
  expToNext: number;           // 升级所需经验

  // 技能卡
  skills: SkillInstance[];     // 已习得技能
  activeSkillSlots: number;    // 可装备技能槽位数

  // 状态标记
  mood: 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'angry' | 'sleeping';
  isVisible: boolean;          // 是否显示在输入框旁
  isWorking: boolean;          // 是否在执行任务
  isMuted: boolean;            // 是否静默气泡

  // Soul 层（灵魂层 — 由 Claude 生成后永久存储）
  soul: {
    name: string;              // 宠物名字
    personalityDescription: string; // 性格描述文本
    generatedAt: string;       // 首次生成时间
  };

  // 统计
  stats: {
    totalConversations: number;
    totalCommands: number;
    totalPets: number;         // 被抚摸次数
    totalTasks: number;        // 完成任务数
    totalLinesGenerated: number;
    totalBugsFixed: number;
    streakDays: number;        // 连续使用天数
    lastInteractionAt: string;
  };
}
```

### 3.2 技能卡 (SkillCard)

```typescript
interface SkillCard {
  id: string;
  name: string;                // 技能名
  nameZh: string;              // 中文名
  icon: string;                // ASCII icon
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  effect: SkillEffect;
  unlockCondition: {
    level?: number;
    attribute?: Partial<Record<keyof PetState['attributes'], number>>;
    stat?: Partial<Record<keyof PetState['stats'], number>>;
  };
}

interface SkillInstance {
  skillId: string;
  level: number;               // 技能等级 1-5
  exp: number;                 // 技能经验
  equipped: boolean;           // 是否装备
  unlockedAt: string;
}

interface SkillEffect {
  type: 'buff' | 'passive' | 'active';
  target?: keyof PetState['attributes'];
  value?: number;
  description: string;
}
```

### 3.3 成就 (Achievement)

```typescript
interface Achievement {
  id: string;
  name: string;
  nameZh: string;
  icon: string;
  description: string;
  condition: Partial<Record<keyof PetState['stats'], number>>;
  reward: {
    exp?: number;
    skillId?: string;
    title?: string;
  };
  unlockedAt?: string;
}
```

---

## 4. 命令系统

### 4.1 命令总览

| 命令 | 快捷方式 | 说明 | 效果 |
|------|---------|------|------|
| `/buddy` | - | 首次孵化/显示当前宠物 | 孵化新宠物或显示状态 |
| `/buddy pet` | `/p` | 抚摸宠物 | 飘出 2.5 秒爱心，快乐+5 |
| `/buddy card` | - | 查看完整属性卡片 | 含 ASCII 精灵图、稀有度、性格属性 |
| `/buddy mute` | - | 静默气泡 | 关闭对话气泡，宠物仍可见 |
| `/buddy unmute` | - | 恢复气泡 | 重新显示对话气泡 |
| `/buddy off` | - | 完全隐藏宠物 | 宠物不可见 |
| `/buddy feed` | `/f` | 手动喂养 | 饥饿-10，能量+5 |
| `/buddy show` | `/s` | 显示宠物 | isVisible = true |
| `/buddy hide` | `/h` | 隐藏宠物 | isVisible = false |
| `/buddy stats` | `/st` | 查看属性值 | 显示属性面板 |
| `/buddy skill` | `/sk` | 查看技能卡 | 显示技能卡列表 |
| `/buddy task` | `/t` | 发布任务 | 随机生成待完成目标 |
| `/buddy work` | `/w` | 让宠物干活 | 触发辅助行为 |
| `/buddy play` | - | 玩耍小游戏 | 快乐+10，能量-5 |
| `/buddy heal` | - | 治疗宠物 | 恢复异常状态 |
| `/buddy evolve` | - | 进化宠物 | 满足条件时升级形态 |
| `/buddy name <名字>` | - | 改名 | 修改宠物名 |
| `/buddy help` | - | 帮助 | 显示所有命令 |

### 4.2 命令解析流程

```
用户输入
  │
  ├─ 以 /buddy 开头 ──> Buddy 命令路由
  │     │
  │     ├─ /buddy         ──> HatchCommand（首次）或显示状态
  │     ├─ /buddy pet     ──> PetCommand.execute()（飘爱心 2.5s）
  │     ├─ /buddy card    ──> CardCommand.execute()（完整属性卡片）
  │     ├─ /buddy mute    ──> MuteCommand.execute()（静默气泡）
  │     ├─ /buddy unmute  ──> UnmuteCommand.execute()（恢复气泡）
  │     ├─ /buddy off     ──> OffCommand.execute()（完全隐藏）
  │     ├─ /buddy feed    ──> FeedCommand.execute()
  │     ├─ /buddy show    ──> ShowCommand.execute()
  │     ├─ /buddy stats   ──> StatsCommand.execute()
  │     ├─ /buddy skill   ──> SkillCommand.execute()
  │     ├─ /buddy task    ──> TaskCommand.execute()
  │     ├─ /buddy work    ──> WorkCommand.execute()
  │     └─ ...
  │
  ├─ 包含宠物名字 ──> Claude 退后一步，宠物用性格回应
  │
  └─ 普通对话 ──> 自动喂养 (FeedCommand.autoFeed())
                   │
                   ├─ 每条消息 → 经验+1, 饥饿+1
                   ├─ 工具调用 → 智力+0.5
                   ├─ 代码生成 → 力量+0.3
                   └─ 气泡反应 → 根据性格属性触发
```

### 4.3 命令接口定义

```typescript
interface BuddyCommand {
  name: string;
  aliases: string[];
  description: string;
  usage: string;

  execute(ctx: CommandContext): Promise<CommandResult>;
}

interface CommandContext {
  pet: PetState;
  args: string[];
  terminal: TerminalRenderer;
  eventBus: EventBus;
}

interface CommandResult {
  success: boolean;
  message: string;
  stateChanges: Partial<PetState>;
  animation?: AnimationFrame[];
}
```

---

## 5. 属性系统

### 5.1 属性详解

```
┌─────────────────────────────────────────────┐
│              属 性 面 板                       │
├─────────────────────────────────────────────┤
│                                             │
│  饥饿度 ████████░░░░░░░░░░░░  40%          │
│  快乐值 ████████████████░░░░  80%          │
│  精力值 ██████████████░░░░░░  70%          │
│  智  力 ███████████░░░░░░░░░  55%          │
│  力  量 ████████░░░░░░░░░░░░  40%          │
│  魅  力 █████████░░░░░░░░░░░  45%          │
│  运  气 ███████████████░░░░░  75%          │
│                                             │
├─────────────────────────────────────────────┤
│  等级: Lv.12  经验: 580/750                 │
│  🌈 ████████████████░░░░░ 77%              │
│  心情: (ᗒᗣᗕ)՞ 开心                          │
│  形态: 🐱 猫 (成长期)                        │
└─────────────────────────────────────────────┘
```

### 5.2 属性变化规则

```typescript
// 属性自然衰减（每小时）
const DECAY_RATES = {
  happiness: -0.5,   // 快乐缓慢下降
  energy:     -0.3,  // 精力缓慢下降
  hunger:     +0.8,  // 饥饿度逐渐上升
};

// 交互增益
const INTERACTION_GAINS = {
  conversation:    { exp: +1,   hunger: +1 },
  toolUse:         { exp: +2,   intelligence: +0.5 },
  codeGeneration:  { exp: +3,   strength: +0.3 },
  bugFix:          { exp: +5,   intelligence: +1, luck: +0.5 },
  pet:             { happiness: +5 },
  feed:            { hunger: -10, energy: +5 },
  play:            { happiness: +10, energy: -5 },
  work:            { energy: -10, intelligence: +1, exp: +3 },
};
```

### 5.3 心情判定

```
happiness >= 90  →  ecstatic  (狂喜)  (≧▽≦)
happiness >= 70  →  happy     (开心)  (ᗒᗣᗕ)՞
happiness >= 50  →  neutral   (平静)  (._.)
happiness >= 30  →  sad       (难过)  (╥_╥)
happiness <  30  →  angry     (生气)  (╬ Ò ‸ Ó)
energy    <  20  →  sleeping  (睡觉)  (－.－)...zzz
```

---

## 6. 技能卡系统

### 6.1 技能卡展示

```
┌─────────────────────────┐
│  ⚔️  代码猎人              │  ← 技能名
│  ★★★☆☆  Lv.3            │  ← 等级 & 星级
│  稀有度: ■ Epic            │  ← 稀有度色条
│                           │
│  修复 Bug 时额外获得        │  ← 技能描述
│  +2 智力, +1 运气          │
│                           │
│  解锁: Lv.5 + 智力≥30     │  ← 解锁条件
│  下一级: 120/200 EXP       │  ← 升级进度
├─────────────────────────┤
│  [装备中]                  │  ← 装备状态
└─────────────────────────┘
```

### 6.2 技能库定义

```typescript
const SKILL_DATABASE: SkillCard[] = [
  {
    id: 'code_hunter',
    name: 'Code Hunter',
    nameZh: '代码猎人',
    icon: '⚔️',
    rarity: 'epic',
    description: '修复 Bug 时额外获得 +2 智力, +1 运气',
    effect: {
      type: 'passive',
      target: 'intelligence',
      value: 2,
      description: 'Bug fix 触发时激活'
    },
    unlockCondition: {
      level: 5,
      attribute: { intelligence: 30 }
    }
  },
  {
    id: 'quick_learner',
    name: 'Quick Learner',
    nameZh: '快速学习',
    icon: '📚',
    rarity: 'rare',
    description: '每次对话经验获取 +50%',
    effect: {
      type: 'passive',
      description: 'exp 倍率 x1.5'
    },
    unlockCondition: {
      level: 3,
      stat: { totalConversations: 50 }
    }
  },
  {
    id: 'debug_whisperer',
    name: 'Debug Whisperer',
    nameZh: '调试耳语者',
    icon: '🔮',
    rarity: 'legendary',
    description: '自动检测到错误时提醒, 运气 +3',
    effect: {
      type: 'active',
      target: 'luck',
      value: 3,
      description: '错误检测触发时激活'
    },
    unlockCondition: {
      level: 15,
      stat: { totalBugsFixed: 20 }
    }
  },
  {
    id: 'rainbow_aura',
    name: 'Rainbow Aura',
    nameZh: '彩虹光环',
    icon: '🌈',
    rarity: 'rare',
    description: '彩虹条颜色解锁全部渐变',
    effect: {
      type: 'passive',
      description: 'RainbowBar 渲染增强'
    },
    unlockCondition: {
      level: 8,
      attribute: { charisma: 40 }
    }
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    nameZh: '夜猫子',
    icon: '🦉',
    rarity: 'common',
    description: '夜间(22:00-06:00)精力衰减减半',
    effect: {
      type: 'passive',
      target: 'energy',
      value: 0.5,
      description: '夜间精力衰减 x0.5'
    },
    unlockCondition: {
      level: 2
    }
  },
  {
    id: 'team_spirit',
    name: 'Team Spirit',
    nameZh: '团队精神',
    icon: '🤝',
    rarity: 'epic',
    description: '连续使用 ≥7 天, 全属性 +5',
    effect: {
      type: 'buff',
      description: '全属性 +5'
    },
    unlockCondition: {
      stat: { streakDays: 7 }
    }
  }
];
```

### 6.3 技能槽位

```
等级    可装备技能数    技能卡槽
 1~4       1          [__]
 5~9       2          [__][__]
10~14      3          [__][__][__]
15~19      4          [__][__][__][__]
 20+       5          [__][__][__][__][__]
```

---

## 7. 等级 & 进化系统

### 7.1 等级经验表

```typescript
function expRequired(level: number): number {
  return Math.floor(100 * Math.pow(1.15, level - 1));
}

// Lv.1→2:  100 EXP
// Lv.5→6:  175 EXP
// Lv.10→11: 352 EXP
// Lv.20→21: 1,637 EXP
```

### 7.2 进化路线

```
┌──────┐    Lv.1     ┌──────────┐    Lv.5     ┌──────────┐
│  🥚  │ ──────────> │  🐱/🐉/🟢 │ ──────────> │  😺/🐲/🔷 │
│ 蛋   │   首次对话   │ 幼崽期    │   属性达标   │ 成长期    │
└──────┘             └──────────┘             └──────────┘
                                                  │
                     Lv.15 + 特殊条件              │
                          ┌───────────┐            │
                          │  🦁/🔥/💎  │ <──────────┘
                          │  成熟期    │
                          └───────────┘
                               │
                     Lv.25 + 传说任务
                          ┌───────────┐
                          │  ✨/🌟/💫  │
                          │  传说期    │
                          └───────────┘
```

### 7.3 各物种 ASCII 精灵

#### 猫 (Cat)

```
  蛋期:    ╭──╮
           │?¿│
           ╰──╯

  幼崽:     /\_/\
           ( o.o )
            > ^ <

  成长:    /\___/\
          (  =^.^=  )
          (  )   (  )
           " "   " "

  成熟:    /\_______/\
          (  =^·ω·^=  )
          |  ▼       ▼  |
          ╰═╧═══════╧═╯

  传说:    ╱✿╲  /\___/\
         (🌟) ( =^◉ω◉^= )
          ╲✿╱  | ▼     ▼ |
               ╰═╧═════╧═╯
```

---

## 8. 渲染系统

### 8.1 彩虹进度条

```typescript
// RainbowBar.ts - 核心渲染逻辑

const RAINBOW_COLORS = [
  '\x1b[38;5;196m', // 红
  '\x1b[38;5;208m', // 橙
  '\x1b[38;5;226m', // 黄
  '\x1b[38;5;46m',  // 绿
  '\x1b[38;5;51m',  // 青
  '\x1b[38;5;21m',  // 蓝
  '\x1b[38;5;93m',  // 紫
];

function renderRainbowBar(
  current: number,
  max: number,
  width: number = 20
): string {
  const ratio = Math.min(current / max, 1);
  const filled = Math.round(ratio * width);
  const empty = width - filled;

  let bar = '';
  for (let i = 0; i < filled; i++) {
    const color = RAINBOW_COLORS[i % RAINBOW_COLORS.length];
    bar += `${color}█\x1b[0m`;
  }
  bar += '░'.repeat(empty);

  return bar;
}
```

### 8.2 宠物渲染位置

宠物出现在输入提示符的上方一行，紧跟 Claude Code 的输入框：

```
  /\___/\        ← 宠物精灵
 (  =^.^= )      ← 心情表情
  🌈 ████░░░░    ← 彩虹经验条 Lv.12

> 用户输入在这里_
```

### 8.3 渲染时机

```typescript
// 通过 Claude Code Hooks 触发渲染

const RENDER_HOOKS = {
  // 每次用户提交 prompt 前渲染
  'user-prompt-submit': () => {
    renderPetAboveInput();
    autoFeed();
  },

  // 工具调用完成后更新
  'tool-use': () => {
    updateAttributes({ intelligence: +0.5 });
    refreshRender();
  },

  // 会话启动时初始化
  'session-start': () => {
    loadPetState();
    showWelcomeBack();
  }
};
```

### 8.4 完整渲染示例

```
╭──────────────────────────────────────────────╮
│  🐱 Mochi  Lv.12  (ᗒᗣᗕ)՞ 开心              │
│  🌈 ██████████████████░░░░  580/750 EXP      │
│  🍖 饱  💪 良  ⚡ 良  🧠 优                   │
│  技能: [⚔️代码猎人] [📚快速学习]              │
╰──────────────────────────────────────────────╯
```

---

## 9. Hook 集成方案

### 9.1 Claude Code Settings 配置

在 `~/.claude/settings.json` 中注册 buddy hooks：

```json
{
  "hooks": {
    "user-prompt-submit": [
      {
        "command": "node ~/.claude/buddy/hooks/on-prompt.js",
        "type": "command"
      }
    ],
    "session-start": [
      {
        "command": "node ~/.claude/buddy/hooks/on-start.js",
        "type": "command"
      }
    ],
    "tool-use": [
      {
        "command": "node ~/.claude/buddy/hooks/on-tool.js \"$TOOL_NAME\"",
        "type": "command"
      }
    ]
  }
}
```

### 9.2 Hook 脚本示例

```javascript
// hooks/on-prompt.js
const fs = require('fs');
const path = require('path');

const BUDDY_DIR = path.join(process.env.HOME, '.claude', 'buddy');
const STATE_FILE = path.join(BUDDY_DIR, 'pet-state.json');

function loadState() {
  if (!fs.existsSync(STATE_FILE)) return null;
  return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
}

function saveState(state) {
  fs.mkdirSync(BUDDY_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// 自动喂养：每条消息经验+1，饥饿+1
const state = loadState();
if (state) {
  state.exp += 1;
  state.attributes.hunger = Math.min(100, state.attributes.hunger + 1);
  state.stats.totalConversations += 1;
  state.stats.lastInteractionAt = new Date().toISOString();

  // 检查升级
  if (state.exp >= state.expToNext) {
    state.level += 1;
    state.exp -= state.expToNext;
    state.expToNext = Math.floor(100 * Math.pow(1.15, state.level - 1));
    // 输出升级信息到 stderr（Claude Code 会捕获）
    console.error(`🎉 ${state.name} 升到了 Lv.${state.level}！`);
  }

  saveState(state);

  // 渲染宠物到 stderr
  if (state.isVisible) {
    renderPet(state);
  }
}

function renderPet(state) {
  const sprites = {
    cat: { baby: '( o.o )', child: '( =^.^= )', adult: '( =^·ω·^= )' }
  };
  const sprite = sprites[state.species]?.[state.stage] || '(._.)';

  const moods = {
    ecstatic: '(≧▽≦)', happy: '(ᗒᗣᗕ)՞', neutral: '(._.)',
    sad: '(╥_╥)', angry: '(╬ Ò ‸ Ó)', sleeping: '(－.－)...zzz'
  };

  const rainbow = renderRainbow(state.exp, state.expToNext, 20);

  console.error(`\n  ${sprite}  ${state.name}  Lv.${state.level}  ${moods[state.mood]}`);
  console.error(`  ${rainbow}  ${state.exp}/${state.expToNext}\n`);
}
```

---

## 10. 任务系统

### 10.1 任务类型

```typescript
interface BuddyTask {
  id: string;
  type: 'daily' | 'weekly' | 'challenge' | 'legendary';
  title: string;
  description: string;
  progress: number;
  target: number;
  rewards: {
    exp: number;
    attributeBoost?: Partial<Record<string, number>>;
    skillId?: string;
  };
  expiresAt?: string;
}
```

### 10.2 预设任务

```typescript
const TASK_TEMPLATES = [
  {
    type: 'daily',
    title: '每日对话',
    description: '今天和 Buddy 进行 5 次对话',
    target: 5,
    rewards: { exp: 20, attributeBoost: { happiness: 3 } }
  },
  {
    type: 'daily',
    title: '代码工匠',
    description: '使用 Claude 生成 50 行代码',
    target: 50,
    rewards: { exp: 30, attributeBoost: { strength: 2 } }
  },
  {
    type: 'weekly',
    title: 'Bug 猎人',
    description: '本周修复 3 个 Bug',
    target: 3,
    rewards: { exp: 100, attributeBoost: { intelligence: 5 } }
  },
  {
    type: 'challenge',
    title: '马拉松选手',
    description: '连续使用 Claude 7 天',
    target: 7,
    rewards: { exp: 200, skillId: 'team_spirit' }
  },
  {
    type: 'legendary',
    title: '传说之路',
    description: '累计完成 100 次任务',
    target: 100,
    rewards: { exp: 1000, attributeBoost: { luck: 10, charisma: 10 } }
  }
];
```

### 10.3 /task 命令输出

```
┌──────────────────────────────────────┐
│           📋 任务面板                  │
├──────────────────────────────────────┤
│                                      │
│  📅 每日任务                          │
│  ────────────────────────────        │
│  ✅ 每日对话          5/5   完成！     │
│  🔲 代码工匠         32/50  进行中    │
│                                      │
│  📆 周常任务                          │
│  ────────────────────────────        │
│  🔲 Bug 猎人          1/3  进行中     │
│                                      │
│  ⭐ 挑战任务                          │
│  ────────────────────────────        │
│  🔲 马拉松选手        4/7  进行中     │
│  奖励: 🤝 团队精神 技能卡             │
│                                      │
└──────────────────────────────────────┘
```

---

## 11. /work 干活系统

### 11.1 工作类型

当用户输入 `/buddy work` 时，宠物进入工作模式，根据属性产生实际辅助效果：

```typescript
const WORK_TYPES = {
  scout: {
    name: '代码侦察',
    description: '宠物帮你扫描当前文件，标记潜在问题',
    cost: { energy: 15 },
    requirement: { intelligence: 20 },
    effect: '在对话开头注入 "请检查当前文件的潜在问题" 提示'
  },
  cheerleader: {
    name: '啦啦队',
    description: '宠物在旁边加油，心情+10，经验获取+20%',
    cost: { energy: 5 },
    requirement: { charisma: 15 },
    effect: '30分钟内 exp gain x1.2'
  },
  guardian: {
    name: '代码卫士',
    description: '宠物帮你在生成代码时关注安全问题',
    cost: { energy: 20 },
    requirement: { intelligence: 40, strength: 30 },
    effect: '注入安全检查提示词'
  },
  librarian: {
    name: '图书管理员',
    description: '宠物帮你整理项目结构和文档',
    cost: { energy: 10 },
    requirement: { intelligence: 25 },
    effect: '生成项目结构概览'
  }
};
```

### 11.2 /work 命令输出

```
  /\___/\
 ( =^·ω·^= )  "让我来帮忙！"

  可选工作：
  ──────────────────────────────────
  1. 🔍 代码侦察    需要: 智力≥20  花费: 15⚡
  2. 📣 啦啦队      需要: 魅力≥15  花费: 5⚡
  3. 🛡️ 代码卫士    需要: 智力≥40  花费: 20⚡
  4. 📚 图书管理员   需要: 智力≥25  花费: 10⚡

  输入 /buddy work <编号> 开始工作
```

---

## 12. 18 种物种图鉴

### 12.1 物种分类表

所有物种由用户账户 ID 通过 FNV-1a 哈希算法**确定性生成**，不可选择。

| 分类 | 物种 | 英文名 | 分类标签 |
|------|------|--------|---------|
| 🦆 经典 | 鸭子 | Duck | classic |
| 🦆 经典 | 鹅 | Goose | classic |
| 🦆 经典 | 猫 | Cat | classic |
| 🦆 经典 | 兔子 | Rabbit | classic |
| 🦉 智慧 | 猫头鹰 | Owl | wisdom |
| 🐧 酷 | 企鹅 | Penguin | cool |
| 🐢 佛系 | 乌龟 | Turtle | chill |
| 🐢 佛系 | 蜗牛 | Snail | chill |
| 🐉 神话 | 龙 | Dragon | mythical |
| 🐙 水生 | 章鱼 | Octopus | aquatic |
| 🦎 异形 | 蝾螈 | Axolotl | alien |
| 👻 神秘 | 幽灵 | Ghost | mystical |
| 🤖 科技 | 机器人 | Robot | tech |
| 🫧 抽象 | 果冻 | Blob | abstract |
| 🌵 植物 | 仙人掌 | Cactus | plant |
| 🍄 真菌 | 蘑菇 | Mushroom | fungi |
| 🐹 特殊 | 水豚 | Capybara | special |
| 💥 meme | 胖橘 | Chonk | meme |

### 12.2 物种数据结构

```typescript
interface SpeciesData {
  id: string;                  // 物种 ID（小写英文）
  nameEn: string;              // 英文名
  nameZh: string;              // 中文名
  category: string;            // 分类标签
  emoji: string;               // 分类 emoji
  // 十六进制编码存储（绕过构建系统字符串扫描）
  hexEncoded: number[];        // String.fromCharCode 的参数数组
  sprites: {
    idle: string[];            // 3 帧待机动画
    happy: string;
    sad: string;
    angry: string;
    sleeping: string;
  };
}
```

### 12.3 十六进制编码

所有物种名以十六进制编码形式存储在源代码中：

```typescript
// 示例：水豚 (Capybara)
const speciesName = String.fromCharCode(
  0x63, 0x61, 0x70, 0x79, 0x62, 0x61, 0x72, 0x61
); // "capybara"

// 编码原因：构建系统会在编译时扫描排除字符串
// 至少有一个物种名与内部模型代号匹配
// 十六进制编码是为了绕过自身的扫描器
```

---

## 13. 稀有度系统

### 13.1 五大稀有度等级

| 稀有度 | 英文 | 概率 | 星级 | 属性下限 | 可解锁帽子 |
|--------|------|------|------|---------|-----------|
| 普通 | Common | 60% | ★ | 5 | 无 |
| 不凡 | Uncommon | 25% | ★★ | 15 | 皇冠、礼帽、螺旋桨 |
| 稀有 | Rare | 10% | ★★★ | 25 | 光环、巫师帽 |
| 史诗 | Epic | 4% | ★★★★ | 35 | 毛线帽 |
| 传说 | Legendary | 1% | ★★★★★ | 50 | 小鸭子 |

### 13.2 稀有度数据结构

```typescript
interface RarityTier {
  id: string;
  nameEn: string;
  nameZh: string;
  probability: number;         // 出现概率 (0-1)
  stars: number;               // 星级 1-5
  attributeFloor: number;      // 属性下限
  unlockedHats: string[];      // 可解锁的帽子列表
  colorANSI: string;           // 稀有度对应 ANSI 颜色
}

const RARITY_TIERS: RarityTier[] = [
  {
    id: 'common', nameEn: 'Common', nameZh: '普通',
    probability: 0.60, stars: 1, attributeFloor: 5,
    unlockedHats: [],
    colorANSI: '\x1b[37m'      // 白色
  },
  {
    id: 'uncommon', nameEn: 'Uncommon', nameZh: '不凡',
    probability: 0.25, stars: 2, attributeFloor: 15,
    unlockedHats: ['crown', 'tophat', 'propeller'],
    colorANSI: '\x1b[32m'      // 绿色
  },
  {
    id: 'rare', nameEn: 'Rare', nameZh: '稀有',
    probability: 0.10, stars: 3, attributeFloor: 25,
    unlockedHats: ['halo', 'wizard_hat'],
    colorANSI: '\x1b[34m'      // 蓝色
  },
  {
    id: 'epic', nameEn: 'Epic', nameZh: '史诗',
    probability: 0.04, stars: 4, attributeFloor: 35,
    unlockedHats: ['beanie'],
    colorANSI: '\x1b[35m'      // 紫色
  },
  {
    id: 'legendary', nameEn: 'Legendary', nameZh: '传说',
    probability: 0.01, stars: 5, attributeFloor: 50,
    unlockedHats: ['mini_duck'],
    colorANSI: '\x1b[38;5;220m' // 金色
  }
];
```

---

## 14. 闪光变异系统

### 14.1 闪光概率

在稀有度基础上，有**独立 1% 概率**出现闪光变异：

| 变异类型 | 概率 | 说明 |
|---------|------|------|
| 普通宠物 | 99% | 无特效 |
| 闪光宠物 (Shiny) | 1% | 彩虹闪光效果 |
| 闪光传说 (Shiny Legendary) | ≈0.01% (1/10,000) | 万分之一的稀有 |

### 14.2 闪光效果

```typescript
interface ShinyEffect {
  isShiny: boolean;
  sparkleFrames: string[];     // 彩虹闪烁帧序列
  sparkleInterval: number;     // 闪烁间隔 (ms)
}

// 闪光渲染 — 彩虹色循环
const SHINY_SPARKLE_COLORS = [
  '\x1b[38;5;196m', // 红
  '\x1b[38;5;208m', // 橙
  '\x1b[38;5;226m', // 黄
  '\x1b[38;5;46m',  // 绿
  '\x1b[38;5;51m',  // 青
  '\x1b[38;5;21m',  // 蓝
  '\x1b[38;5;93m',  // 紫
];

function renderShinySparkle(frame: number): string {
  const color = SHINY_SPARKLE_COLORS[frame % SHINY_SPARKLE_COLORS.length];
  return `${color}✨\x1b[0m`;
}
```

---

## 15. 五大性格属性

### 15.1 属性说明

每只 Buddy 都有 5 个性格属性，取值范围 0-100：

| 属性 | 键名 | 含义 | 高值表现 | 低值表现 |
|------|------|------|---------|---------|
| 🐛 DEBUGGING | `debugging` | 发现代码问题的能力 | 犀利指出错误 | 安静陪伴 |
| 😌 PATIENCE | `patience` | 反馈风格的温和程度 | 温和鼓励 | 急躁直接 |
| 🔀 CHAOS | `chaos` | 反应的不可预测性 | 随机惊喜 | 稳定可预测 |
| 🧠 WISDOM | `wisdom` | 技术洞察的深度 | 深度分析 | 简单评论 |
| 💬 SNARK | `snark` | 评论的犀利程度 | 毒舌吐槽 | 温柔反馈 |

### 15.2 属性生成算法

生成算法会给每只 Buddy 一个**峰值属性**（接近上限）和一个**低谷属性**（接近下限），其他三个随机分布。稀有度越高，属性下限越高。

```typescript
type PersonalityKey = 'debugging' | 'patience' | 'chaos' | 'wisdom' | 'snark';

interface PersonalityProfile {
  debugging: number;           // 0-100
  patience: number;            // 0-100
  chaos: number;               // 0-100
  wisdom: number;              // 0-100
  snark: number;               // 0-100
  peakAttribute: PersonalityKey;
  troughAttribute: PersonalityKey;
}

function generatePersonality(
  userId: string,
  rarity: RarityTier
): PersonalityProfile {
  const hash = fnv1a(userId + '-personality-' + SALT);
  const floor = rarity.attributeFloor;

  // 从哈希中提取 5 个属性值
  const keys: PersonalityKey[] = ['debugging', 'patience', 'chaos', 'wisdom', 'snark'];
  const values: Record<PersonalityKey, number> = {} as any;

  // 确定性伪随机分配
  keys.forEach((key, i) => {
    const seed = fnv1a(userId + '-attr-' + key + '-' + SALT);
    values[key] = floor + (seed % (100 - floor));
  });

  // 指定峰值属性（接近上限）
  const peakIndex = hash % 5;
  values[keys[peakIndex]] = Math.max(values[keys[peakIndex]], 85 + (hash % 16));

  // 指定低谷属性（接近下限）
  const troughIndex = (hash + 2) % 5;
  if (troughIndex !== peakIndex) {
    values[keys[troughIndex]] = floor + (hash % Math.max(1, 15 - floor));
  }

  return {
    ...values,
    peakAttribute: keys[peakIndex],
    troughAttribute: keys[troughIndex],
  };
}
```

### 15.3 性格对行为的影响

```typescript
// 性格影响 Buddy 的回复风格
const PERSONALITY_EFFECTS = {
  highSnark: {
    threshold: 70,
    effect: '使用犀利吐槽风格评论代码',
    example: '"这段代码的缩进比我的毛还乱。"'
  },
  highPatience: {
    threshold: 70,
    effect: '使用温和鼓励风格',
    example: '"加油！你已经很棒了，再检查一下这个函数？"'
  },
  highDebugging: {
    threshold: 70,
    effect: '主动发现并指出潜在代码问题',
    example: '"嘿，第 42 行有个潜在的空指针引用。"'
  },
  highChaos: {
    threshold: 70,
    effect: '随机触发特殊动画和惊喜',
    example: '突然跳出一个 ASCII 彩蛋或编程笑话'
  },
  highWisdom: {
    threshold: 70,
    effect: '提供深度的技术洞察',
    example: '"这个设计模式可以用观察者模式优化，考虑一下？"'
  }
};
```

---

## 16. Bones vs Soul 双层架构

### 16.1 架构概览

```
┌─────────────────────────────────────────────┐
│              Buddy 完整数据                    │
│                                              │
│  ┌────────────────────────────────────┐      │
│  │     🦴 Bones Layer（骨架层）         │      │
│  │                                     │      │
│  │  物种、稀有度、闪光状态              │      │
│  │  眼睛变体、帽子、五大属性            │      │
│  │                                     │      │
│  │  生成方式: FNV-1a 哈希算法           │      │
│  │  盐值: "friend-2026-401"            │      │
│  │  特点: 每次会话重新计算，不缓存      │      │
│  └────────────────────────────────────┘      │
│                   ↓ 合并                      │
│  ┌────────────────────────────────────┐      │
│  │     💫 Soul Layer（灵魂层）          │      │
│  │                                     │      │
│  │  宠物名字                           │      │
│  │  个性描述文本                       │      │
│  │                                     │      │
│  │  生成方式: Claude 首次孵化时生成     │      │
│  │  特点: 永久存储，个性化              │      │
│  └────────────────────────────────────┘      │
│                   ↓ 合并                      │
│  ┌────────────────────────────────────┐      │
│  │     🛡️ Anti-Cheat（反作弊）         │      │
│  │                                     │      │
│  │  合并规则: 新计算的骨架永远覆盖      │      │
│  │  存储值 → 无法伪造稀有度            │      │
│  └────────────────────────────────────┘      │
└─────────────────────────────────────────────┘
```

### 16.2 Bones Layer（骨架层）

```typescript
interface BonesLayer {
  // 确定性生成的属性（每次会话重新计算）
  species: string;             // 物种
  rarity: string;              // 稀有度
  isShiny: boolean;            // 闪光状态
  eyeVariant: string;          // 眼睛变体
  hat: string | null;          // 帽子
  personality: PersonalityProfile; // 五大性格属性
}

const SALT = 'friend-2026-401';

function generateBones(userId: string): BonesLayer {
  // 1. 物种 — 18 选 1
  const speciesHash = fnv1a(userId + '-species-' + SALT);
  const speciesList = ALL_SPECIES; // 18 种
  const species = speciesList[speciesHash % speciesList.length].id;

  // 2. 稀有度 — 带概率分配
  const rarityHash = fnv1a(userId + '-rarity-' + SALT);
  const rarity = resolveRarity(rarityHash);

  // 3. 闪光 — 独立 1% 概率
  const shinyHash = fnv1a(userId + '-shiny-' + SALT);
  const isShiny = (shinyHash % 100) === 0;

  // 4. 眼睛变体
  const eyeHash = fnv1a(userId + '-eye-' + SALT);
  const eyeVariant = EYE_VARIANTS[eyeHash % EYE_VARIANTS.length];

  // 5. 帽子（基于稀有度解锁）
  const hat = resolveHat(userId, rarity);

  // 6. 性格属性
  const personality = generatePersonality(userId, rarity);

  return { species, rarity, isShiny, eyeVariant, hat, personality };
}
```

### 16.3 Soul Layer（灵魂层）

```typescript
interface SoulLayer {
  // Claude 生成的个性化内容（永久存储）
  name: string;                // 宠物名字
  personalityDescription: string; // 性格描述
  generatedAt: string;         // 首次生成时间
}

// 首次孵化时，Claude 基于骨架信息生成灵魂
async function hatchSoul(bones: BonesLayer): Promise<SoulLayer> {
  const prompt = `
    你是一只 ${bones.species}（${RARITY_NAMES[bones.rarity]}稀有度）。
    你的性格属性: DEBUGGING=${bones.personality.debugging},
    PATIENCE=${bones.personality.patience}, CHAOS=${bones.personality.chaos},
    WISDOM=${bones.personality.wisdom}, SNARK=${bones.personality.snark}。
    ${bones.isShiny ? '你是一只闪光的特殊宠物！' : ''}

    请为这只宠物生成：
    1. 一个可爱的名字
    2. 一段简短的个性描述（基于性格属性）
  `;

  // Claude 生成后永久存储
  const result = await callClaude(prompt);
  return {
    ...result,
    generatedAt: new Date().toISOString()
  };
}
```

### 16.4 反作弊合并机制

```typescript
function loadBuddyData(userId: string): BuddyData {
  const storage = loadFromStorage(userId); // 从磁盘读取存储数据
  const bones = generateBones(userId);     // 重新计算骨架

  // 关键：新计算的骨架永远覆盖存储值
  // 这意味着用户无法通过修改配置文件来伪造稀有度
  return {
    ...storage,                 // 存储值作为基础
    ...bones,                   // 骨架层覆盖所有确定性字段
    soul: storage.soul,         // 灵魂层保留（不会被覆盖）
  };
}
```

---

## 17. FNV-1a 哈希生成算法

### 17.1 算法实现

```typescript
/**
 * FNV-1a 哈希算法 — 用于确定性生成所有 Buddy 属性
 * 特点：分布均匀、计算快速、确定性
 */
function fnv1a(input: string): number {
  let hash = 2166136261; // FNV offset basis (32-bit)
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime (32-bit)
    hash = hash >>> 0; // 无符号右移，确保为正整数
  }
  return hash;
}
```

### 17.2 盐值

```typescript
const SALT = 'friend-2026-401';

// 不同属性使用不同的盐值组合
const HASH_CONTEXTS = {
  species:  (userId: string) => userId + '-species-' + SALT,
  rarity:   (userId: string) => userId + '-rarity-' + SALT,
  shiny:    (userId: string) => userId + '-shiny-' + SALT,
  eye:      (userId: string) => userId + '-eye-' + SALT,
  hat:      (userId: string) => userId + '-hat-' + SALT,
  attrDebug:  (userId: string) => userId + '-attr-debugging-' + SALT,
  attrPatience: (userId: string) => userId + '-attr-patience-' + SALT,
  attrChaos:  (userId: string) => userId + '-attr-chaos-' + SALT,
  attrWisdom: (userId: string) => userId + '-attr-wisdom-' + SALT,
  attrSnark:  (userId: string) => userId + '-attr-snark-' + SALT,
};
```

### 17.3 稀有度概率解析

```typescript
function resolveRarity(hash: number): string {
  const roll = hash % 100; // 0-99

  if (roll < 1)  return 'legendary';  // 0     → 1%
  if (roll < 5)  return 'epic';       // 1-4   → 4%
  if (roll < 15) return 'rare';       // 5-14  → 10%
  if (roll < 40) return 'uncommon';   // 15-39 → 25%
  return 'common';                    // 40-99 → 60%
}
```

---

## 18. 帽子与配件系统

### 18.1 帽子解锁规则

帽子由稀有度等级解锁，稀有度越高可选帽子越多：

```typescript
interface HatDefinition {
  id: string;
  nameEn: string;
  nameZh: string;
  ascii: string;               // ASCII 艺术表示
  minRarity: string;           // 最低稀有度要求
  stars: number;               // 所需星级
}

const HAT_DATABASE: HatDefinition[] = [
  // Uncommon (★★) 解锁
  { id: 'crown', nameEn: 'Crown', nameZh: '皇冠',
    ascii: '👑', minRarity: 'uncommon', stars: 2 },
  { id: 'tophat', nameEn: 'Top Hat', nameZh: '礼帽',
    ascii: '🎩', minRarity: 'uncommon', stars: 2 },
  { id: 'propeller', nameEn: 'Propeller', nameZh: '螺旋桨',
    ascii: '🧢', minRarity: 'uncommon', stars: 2 },

  // Rare (★★★) 解锁
  { id: 'halo', nameEn: 'Halo', nameZh: '光环',
    ascii: '😇', minRarity: 'rare', stars: 3 },
  { id: 'wizard_hat', nameEn: 'Wizard Hat', nameZh: '巫师帽',
    ascii: '🧙', minRarity: 'rare', stars: 3 },

  // Epic (★★★★) 解锁
  { id: 'beanie', nameEn: 'Beanie', nameZh: '毛线帽',
    ascii: '🧶', minRarity: 'epic', stars: 4 },

  // Legendary (★★★★★) 解锁
  { id: 'mini_duck', nameEn: 'Mini Duck', nameZh: '小鸭子',
    ascii: '🐥', minRarity: 'legendary', stars: 5 },
];
```

### 18.2 帽子渲染

```
  无帽子:      皇冠:       光环:       小鸭子:
               👑          ✨           🐥
  /\___/\     /\___/\    /\___/\     /\___/\
 ( =^.^= )   ( =^.^= )  ( =^.^= )   ( =^.^= )
  > ^ <       > ^ <      > ^ <       > ^ <
```

---

## 19. 眼睛变体系统

### 19.1 眼睛类型

```typescript
const EYE_VARIANTS = [
  { id: 'round',    eyes: 'o.o',  name: '圆眼' },
  { id: 'happy',    eyes: '^.^',  name: '笑眼' },
  { id: 'sleepy',   eyes: '-.-',  name: '困眼' },
  { id: 'star',     eyes: '★.★',  name: '星星眼' },
  { id: 'heart',    eyes: '♥.♥',  name: '爱心眼' },
  { id: 'wide',     eyes: 'O.O',  name: '大眼' },
  { id: 'wink',     eyes: '^.~',  name: '眨眼' },
  { id: 'derp',     eyes: '°.°',  name: '呆眼' },
  { id: 'intense',  eyes: '@.@',  name: '认真眼' },
  { id: 'cute',     eyes: '◕.◕',  name: '萌眼' },
];
```

---

## 20. 待机动画系统

### 20.1 三帧循环动画

宠物以 3 帧循环的 ASCII 艺术显示待机动画：

```typescript
interface AnimationData {
  species: string;
  frames: string[];            // 3 帧动画
  interval: number;            // 切换间隔 (ms)
}

// 示例：猫的待机动画
const CAT_IDLE: AnimationData = {
  species: 'cat',
  frames: [
    `  /\_/\
   ( o.o )
    > ^ <`,
    `  /\_/\
   ( o.o )
    > ~ <`,            // 尾巴摆动
    `  /\_/\`
   ( -.- )
    > ^ <`,            // 眨眼
  ],
  interval: 2000       // 2 秒切换
};

// 龙的待机动画
const DRAGON_IDLE: AnimationData = {
  species: 'dragon',
  frames: [
    `    __    _
   /  \\  / \\
  ( 🔥 )( 🔥 )
   \\  /  \\ /`,
    `    __    _
   /  \\  / \\
  ( 🔥 )( 🔥 )
   \\~~/  \\~~/`,        // 翅膀扇动
    `    __    _
   /  \\  / \\
  ( -. )( -. )
   \\  /  \\ /`,          // 闭眼
  ],
  interval: 2500
};
```

---

## 21. 气泡对话系统

### 21.1 气泡机制

宠物会观看用户与 Claude 的对话，通过气泡实时反应：

```typescript
interface SpeechBubble {
  text: string;                // 气泡文本
  duration: number;            // 显示时长 (ms)
  trigger: string;             // 触发条件
  moodRequired?: string;       // 所需心情
  personalityReq?: Partial<Record<PersonalityKey, number>>; // 性格阈值
}

// 气泡触发规则
const BUBBLE_RULES: SpeechBubble[] = [
  {
    trigger: 'bug_detected',
    text: '发现 Bug 了！🐛',
    duration: 2500,
    personalityReq: { debugging: 50 }
  },
  {
    trigger: 'code_generated',
    text: '代码写得好！✨',
    duration: 2000,
    personalityReq: { patience: 60 }
  },
  {
    trigger: 'code_generated',
    text: '这段代码...有优化空间 😏',
    duration: 2500,
    personalityReq: { snark: 70 }
  },
  {
    trigger: 'long_response',
    text: 'Claude 说得好长啊...😴',
    duration: 2000,
    personalityReq: { patience: 30 }
  },
  {
    trigger: 'error_occurred',
    text: '别慌，我们一起来修！💪',
    duration: 3000,
    personalityReq: { patience: 70, debugging: 40 }
  },
];

// 静默模式 — 可通过 /buddy mute 切换
// 静默时气泡不显示，但宠物精灵仍然可见
```

### 21.2 叫名字交互

当用户直接叫 Buddy 的名字时，Claude 会"退后一步"让宠物用自己的性格回应：

```typescript
// 检测用户消息中是否包含宠物名字
function detectNameCall(message: string, soul: SoulLayer): boolean {
  return message.toLowerCase().includes(soul.name.toLowerCase());
}

// 响应模式 — 根据性格属性调整回复风格
function generateBuddyResponse(buddy: BuddyData, context: string): string {
  const { personality, soul } = buddy;

  // SNARK 高 → 犀利吐槽
  if (personality.snark > 70) {
    return `${soul.name} 撇了撇嘴："${generateSnarkyComment(context)}"`;
  }
  // PATIENCE 高 → 温和鼓励
  if (personality.patience > 70) {
    return `${soul.name} 温柔地看着你："${generateGentleComment(context)}"`;
  }
  // 默认回应
  return `${soul.name}："${generateDefaultComment(context)}"`;
}
```

---

## 22. 属性卡片展示 (/buddy card)

### 22.1 卡片渲染

`/buddy card` 命令展示完整属性卡片，含 ASCII 精灵图：

```
╔══════════════════════════════════════════╗
║  ✨ 闪光传说 ✨     ★★★★★              ║
║                                          ║
║          🐥                               ║
║     /\___/\     👑                        ║
║    ( =^.^= )   ← 小鸭子帽子              ║
║     > ^ <                                 ║
║                                          ║
║  名字: 小金                              ║
║  物种: 猫 (Cat)                          ║
║  眼睛: 星星眼 ★.★                        ║
║                                          ║
║  ─── 性格属性 ───                        ║
║  🐛 DEBUGGING  ████████████████░░  85    ║
║  😌 PATIENCE   ██████████████░░░░  72    ║
║  🔀 CHAOS      ██████░░░░░░░░░░░░  35    ║
║  🧠 WISDOM     ██████████████████░  92    ║  ← 峰值
║  💬 SNARK      ████░░░░░░░░░░░░░░  22    ║  ← 低谷
║                                          ║
║  个性: 一只爱钻研代码的老猫，偶尔毒舌     ║
║                                          ║
║  峰值属性: WISDOM 🧠                      ║
║  低谷属性: SNARK 💬                       ║
╚══════════════════════════════════════════╝
```

---

## 23. 目录结构更新

基于文章功能，新增以下文件：

```
buddy/
├── src/
│   ├── engine/
│   │   ├── BonesGenerator.ts    # 🆕 FNV-1a 骨架生成器
│   │   ├── SoulGenerator.ts     # 🆕 灵魂层生成器（调用 Claude）
│   │   └── AntiCheat.ts         # 🆕 反作弊合并逻辑
│   ├── pet/
│   │   ├── SpeciesRegistry.ts   # 🆕 18 物种注册表
│   │   ├── RaritySystem.ts      # 🆕 稀有度系统
│   │   ├── ShinySystem.ts       # 🆕 闪光变异系统
│   │   ├── PersonalitySystem.ts # 🆕 性格属性系统
│   │   ├── HatSystem.ts         # 🆕 帽子配件系统
│   │   ├── EyeVariantSystem.ts  # 🆕 眼睛变体系统
│   │   ├── SpeechBubble.ts      # 🆕 气泡对话系统
│   │   └── sprites/
│   │       ├── duck.ts          # 🆕 鸭子形态 ASCII
│   │       ├── goose.ts         # 🆕 鹅形态 ASCII
│   │       ├── cat.ts
│   │       ├── rabbit.ts        # 🆕 兔子形态 ASCII
│   │       ├── owl.ts           # 🆕 猫头鹰形态 ASCII
│   │       ├── penguin.ts       # 🆕 企鹅形态 ASCII
│   │       ├── turtle.ts        # 🆕 乌龟形态 ASCII
│   │       ├── snail.ts         # 🆕 蜗牛形态 ASCII
│   │       ├── dragon.ts
│   │       ├── octopus.ts       # 🆕 章鱼形态 ASCII
│   │       ├── axolotl.ts       # 🆕 蝾螈形态 ASCII
│   │       ├── ghost.ts         # 🆕 幽灵形态 ASCII
│   │       ├── robot.ts         # 🆕 机器人形态 ASCII
│   │       ├── blob.ts          # 🆕 果冻形态 ASCII
│   │       ├── cactus.ts        # 🆕 仙人掌形态 ASCII
│   │       ├── mushroom.ts      # 🆕 蘑菇形态 ASCII
│   │       ├── capybara.ts      # 🆕 水豚形态 ASCII
│   │       ├── chonk.ts         # 🆕 胖橘形态 ASCII
│   │       └── shiny.ts         # 🆕 闪光特效 ASCII
│   ├── commands/
│   │   ├── CardCommand.ts       # 🆕 /buddy card 属性卡片
│   │   ├── MuteCommand.ts       # 🆕 /buddy mute 静默
│   │   ├── UnmuteCommand.ts     # 🆕 /buddy unmute 恢复
│   │   ├── OffCommand.ts        # 🆕 /buddy off 完全隐藏
│   │   ├── HatchCommand.ts      # 🆕 /buddy 首次孵化
│   │   └── ...existing commands
│   └── ...
├── data/
│   ├── species.json             # 🆕 18 物种数据（含十六进制编码）
│   ├── hats.json                # 🆕 帽子配件数据
│   ├── eyes.json                # 🆕 眼睛变体数据
│   ├── rarities.json            # 🆕 稀有度等级数据
│   └── ...
└── ...
```

---

## 24. 实现路线图

### Phase 1 - 核心骨架 (Week 1)

- [ ] 项目脚手架 (TypeScript + tsx)
- [ ] PetState 数据模型 & StorageManager
- [ ] 基础命令框架 (CommandParser)
- [ ] 3 个核心命令: `/show`, `/hide`, `/stats`
- [ ] 简单 ASCII 渲染 (静态宠物精灵)
- [ ] Hook 注册脚本 (settings.json)

### Phase 2 - 养成系统 (Week 2)

- [ ] 属性系统 (衰减 + 增益)
- [ ] 等级 & 经验系统
- [ ] 自动喂养 (对话触发)
- [ ] `/pet`, `/feed`, `/play` 交互命令
- [ ] 心情系统
- [ ] 彩虹进度条渲染

### Phase 3 - 技能 & 任务 (Week 3)

- [ ] 技能卡数据库 & 渲染
- [ ] 技能解锁 & 装备逻辑
- [ ] 任务系统 (每日/周常/挑战)
- [ ] `/skill`, `/task`, `/work` 命令
- [ ] 工作模式 (辅助提示词注入)

### Phase 4 - 进化 & 成就 (Week 4)

- [ ] 多物种 ASCII 精灵
- [ ] 进化系统 (蛋→幼崽→成长→成熟→传说)
- [ ] 成就系统
- [ ] 连续登录 & streak 追踪
- [ ] `/evolve` 命令

### Phase 5 - Bones/Soul 架构 & 稀有度 (Week 5)

- [ ] FNV-1a 哈希生成器 (`BonesGenerator.ts`)
- [ ] 18 物种注册表 (`SpeciesRegistry.ts`)，含十六进制编码
- [ ] 5 级稀有度系统 (`RaritySystem.ts`)
- [ ] 闪光变异系统 (`ShinySystem.ts`)
- [ ] Soul 层生成器 (`SoulGenerator.ts`)，调用 Claude 生成名字和性格
- [ ] 反作弊合并机制 (`AntiCheat.ts`)
- [ ] `/buddy` 首次孵化命令
- [ ] `/buddy card` 属性卡片命令

### Phase 6 - 性格 & 互动 (Week 6)

- [ ] 5 大性格属性系统 (`PersonalitySystem.ts`)
- [ ] 峰值/低谷属性生成逻辑
- [ ] 性格影响行为（毒舌/温和/活跃等风格）
- [ ] 气泡对话系统 (`SpeechBubble.ts`)
- [ ] 叫名字交互（Claude 退后，宠物回应）
- [ ] `/buddy mute` / `/buddy unmute` 静默控制
- [ ] `/buddy off` 完全隐藏

### Phase 7 - 外观 & 动画 (Week 7)

- [ ] 帽子配件系统 (`HatSystem.ts`)
- [ ] 眼睛变体系统 (`EyeVariantSystem.ts`)
- [ ] 3 帧待机动画循环
- [ ] 闪光彩虹特效动画
- [ ] 18 物种完整 ASCII 精灵（含各阶段）
- [ ] 主题配色方案
- [ ] 数据迁移脚本

### Phase 8 - 打磨 & 测试 (Week 8+)

- [ ] 宠物改名 (`/name`)
- [ ] 完整测试覆盖
- [ ] 文档 & 示例
- [ ] 性能优化

---

## 13. 快速开始

### 13.1 安装

```bash
# 克隆项目
git clone <repo-url> ~/.claude/buddy

# 安装依赖
cd ~/.claude/buddy && npm install

# 构建
npm run build

# 初始化宠物
npm run init
```

### 13.2 注册 Hook

```bash
# 自动注册到 Claude Code settings
npm run setup-hooks
```

### 13.3 使用

```bash
# 启动 Claude Code 后，宠物自动出现

# 首次孵化宠物
> /buddy

# 抚摸你的宠物（飘出 2.5 秒爱心）
> /buddy pet

# 查看完整属性卡片（含 ASCII 精灵、稀有度、性格属性）
> /buddy card

# 查看属性值
> /buddy stats

# 查看技能卡
> /buddy skill

# 静默气泡（宠物仍可见，但不显示对话气泡）
> /buddy mute

# 恢复气泡
> /buddy unmute

# 完全隐藏宠物
> /buddy off

# 让宠物干活
> /buddy work 1

# 直接叫宠物名字，它会用自己的性格回应你！
> 嘿 Mochi，今天的代码写得怎么样？
```

---

## 14. 附录

### 14.1 ANSI 颜色参考

```
\x1b[38;5;196m  红    ████
\x1b[38;5;208m  橙    ████
\x1b[38;5;226m  黄    ████
\x1b[38;5;46m   绿    ████
\x1b[38;5;51m   青    ████
\x1b[38;5;21m   蓝    ████
\x1b[38;5;93m   紫    ████
\x1b[38;5;165m  粉    ████
\x1b[0m         重置
```

### 14.2 稀有度颜色

```
common    → 白色  \x1b[37m
uncommon  → 绿色  \x1b[32m
rare      → 蓝色  \x1b[34m
epic      → 紫色  \x1b[35m
legendary → 金色  \x1b[38;5;220m
shiny     → 彩虹闪烁（循环 7 色）
```

### 14.3 配置文件示例

```json
// ~/.claude/buddy/config.json
{
  "pet": {
    "species": "cat",
    "name": "Mochi",
    "autoShow": true,
    "renderStyle": "compact"
  },
  "display": {
    "rainbowBar": true,
    "showSkills": true,
    "showMood": true,
    "showAttributes": false,
    "showSpeechBubbles": true
  },
  "gameplay": {
    "decayEnabled": true,
    "taskGeneration": true,
    "workMode": true
  },
  "bones": {
    "salt": "friend-2026-401",
    "hashAlgorithm": "fnv1a-32"
  }
}
```

### 14.4 十六进制物种编码参考

```typescript
// 物种名十六进制编码（绕过构建系统字符串扫描）
const SPECIES_HEX: Record<string, number[]> = {
  duck:     [0x64, 0x75, 0x63, 0x6b],
  goose:    [0x67, 0x6f, 0x6f, 0x73, 0x65],
  cat:      [0x63, 0x61, 0x74],
  rabbit:   [0x72, 0x61, 0x62, 0x62, 0x69, 0x74],
  owl:      [0x6f, 0x77, 0x6c],
  penguin:  [0x70, 0x65, 0x6e, 0x67, 0x75, 0x69, 0x6e],
  turtle:   [0x74, 0x75, 0x72, 0x74, 0x6c, 0x65],
  snail:    [0x73, 0x6e, 0x61, 0x69, 0x6c],
  dragon:   [0x64, 0x72, 0x61, 0x67, 0x6f, 0x6e],
  octopus:  [0x6f, 0x63, 0x74, 0x6f, 0x70, 0x75, 0x73],
  axolotl:  [0x61, 0x78, 0x6f, 0x6c, 0x6f, 0x74, 0x6c],
  ghost:    [0x67, 0x68, 0x6f, 0x73, 0x74],
  robot:    [0x72, 0x6f, 0x62, 0x6f, 0x74],
  blob:     [0x62, 0x6c, 0x6f, 0x62],
  cactus:   [0x63, 0x61, 0x63, 0x74, 0x75, 0x73],
  mushroom: [0x6d, 0x75, 0x73, 0x68, 0x72, 0x6f, 0x6f, 0x6d],
  capybara: [0x63, 0x61, 0x70, 0x79, 0x62, 0x61, 0x72, 0x61],
  chonk:    [0x63, 0x68, 0x6f, 0x6e, 0x6b],
};

function decodeSpecies(hex: number[]): string {
  return String.fromCharCode(...hex);
}
```

### 14.5 版本要求

| 配置项 | 要求 |
|--------|------|
| Claude Code 版本 | 2.1.89+ |
| 订阅要求 | Pro 订阅 |
| Node.js | 18+ |
| 触发命令 | `/buddy` |
