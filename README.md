<div align="center">

# 🐾 Claude Code Buddy Pet

**A virtual pet companion that lives in your Claude Code terminal**

[中文文档](#中文说明) | [English](#english)

[![npm](https://img.shields.io/badge/node-%3E%3D18.0.0-green)](https://nodejs.org/)
[![platform](https://img.shields.io/badge/platform-Windows%20%7C%20Linux%20%7C%20macOS-blue)]()
[![license](https://img.shields.io/badge/license-MIT-orange)]()

</div>

---

## English

### What is Buddy?

Buddy is a virtual pet system integrated into Claude Code. It lives in your terminal as ASCII art, watches you code, reacts to your conversations, and grows with your development activity.

### One-Line Install

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/HUNSETO1413/buddy/main/install.ps1 | iex
```

**Linux / macOS:**
```bash
curl -sL https://raw.githubusercontent.com/HUNSETO1413/buddy/main/install.sh | bash
```

That's it! The script automatically:
1. Downloads the project to `~/.claude/buddy-src/`
2. Installs dependencies and builds
3. Registers hooks in `~/.claude/settings.json`
4. Next time you start Claude Code, your pet is ready!

<details>
<summary>Alternative: Manual Install</summary>

```bash
git clone https://github.com/HUNSETO1413/buddy.git ~/.claude/buddy-src
cd ~/.claude/buddy-src
npm install
npm run build
node dist/scripts/setup.js
```
</details>

### First Time

Launch Claude Code and type:
```
/buddy
```

Your unique pet is deterministically generated from your account — species, rarity, personality, everything is unique to you!

### Commands

| Command | Description |
|---------|-------------|
| `/buddy` | Hatch your pet (first time) or show current pet |
| `/buddy pet` | Pet your buddy (floats a heart for 2.5s) |
| `/buddy card` | Show full attribute card with ASCII sprite |
| `/buddy mute` | Mute speech bubbles (pet still visible) |
| `/buddy unmute` | Restore speech bubbles |
| `/buddy off` | Hide pet completely |

### 18 Species

Your species is determined by your account ID via FNV-1a hash — you can't choose, which makes each pet unique!

| Category | Species |
|----------|---------|
| Classic | Duck, Goose, Cat, Rabbit |
| Wisdom | Owl |
| Cool | Penguin |
| Chill | Turtle, Snail |
| Mythical | Dragon |
| Aquatic | Octopus |
| Alien | Axolotl |
| Mystical | Ghost |
| Tech | Robot |
| Abstract | Blob |
| Plant | Cactus |
| Fungi | Mushroom |
| Special | Capybara |
| Meme | Chonk |

### 5 Rarity Tiers

| Rarity | Chance | Stars | Attribute Floor | Unlockable Hats |
|--------|--------|-------|----------------|-----------------|
| Common | 60% | ★ | 5 | None |
| Uncommon | 25% | ★★ | 15 | Crown, Top Hat, Propeller |
| Rare | 10% | ★★★ | 25 | Halo, Wizard Hat |
| Epic | 4% | ★★★★ | 35 | Beanie |
| Legendary | 1% | ★★★★★ | 50 | Mini Duck |

### Shiny Variant

Independent **1% chance** for a shiny variant with rainbow sparkle effect. **Shiny Legendary** = 1/10,000 chance!

### 5 Personality Attributes

| Attribute | Meaning |
|-----------|---------|
| 🐛 DEBUGGING | Ability to spot code issues |
| 😌 PATIENCE | Gentleness of feedback style |
| 🔀 CHAOS | Unpredictability of reactions |
| 🧠 WISDOM | Depth of technical insight |
| 💬 SNARK | Sharpness of comments |

### Architecture: Bones vs Soul

- **Bones Layer**: Species, rarity, shiny, eyes, hat, personality — computed via FNV-1a hash with salt `friend-2026-401`. Recalculated every session, cannot be forged.
- **Soul Layer**: Name and personality description — generated at first hatch, permanently stored.
- **Anti-cheat**: Freshly computed bones always overwrite stored values.

### System Requirements

- Node.js 18+
- Claude Code
- Works on Windows, Linux, macOS

### Uninstall

```bash
npm uninstall -g claude-code-buddy
```

Then manually remove buddy hooks from `~/.claude/settings.json`.

---

## 中文说明

### Buddy 是什么？

Buddy 是一个集成在 Claude Code 中的虚拟宠物系统。它以 ASCII 艺术的形式生活在你的终端里，看着你写代码，对你的对话做出反应，并随着你的开发活动不断成长。

### 一行命令安装

**Windows (PowerShell):**
```powershell
irm https://raw.githubusercontent.com/HUNSETO1413/buddy/main/install.ps1 | iex
```

**Linux / macOS:**
```bash
curl -sL https://raw.githubusercontent.com/HUNSETO1413/buddy/main/install.sh | bash
```

安装脚本会自动完成：
1. 下载项目到 `~/.claude/buddy-src/`
2. 安装依赖并编译
3. 在 `~/.claude/settings.json` 中注册 hooks
4. 下次启动 Claude Code，宠物就准备好了！

<details>
<summary>备选：手动安装</summary>

```bash
git clone https://github.com/HUNSETO1413/buddy.git ~/.claude/buddy-src
cd ~/.claude/buddy-src
npm install
npm run build
node dist/scripts/setup.js
```
</details>

### 首次使用

启动 Claude Code 后输入：
```
/buddy
```

你的专属宠物由账户 ID 通过 FNV-1a 哈希算法确定性生成——物种、稀有度、性格全部独一无二！

### 命令列表

| 命令 | 说明 |
|------|------|
| `/buddy` | 孵化宠物（首次）或显示当前宠物 |
| `/buddy pet` | 抚摸宠物（飘出 2.5 秒爱心） |
| `/buddy card` | 查看完整属性卡片（含 ASCII 精灵图） |
| `/buddy mute` | 静默气泡（宠物仍可见） |
| `/buddy unmute` | 恢复气泡 |
| `/buddy off` | 完全隐藏宠物 |

### 18 种宠物

你的宠物物种由账户 ID 通过 FNV-1a 哈希确定性生成——无法选择，每只都独一无二！

| 分类 | 物种 |
|------|------|
| 🦆 经典 | 鸭子、鹅、猫、兔子 |
| 🦉 智慧 | 猫头鹰 |
| 🐧 酷 | 企鹅 |
| 🐢 佛系 | 乌龟、蜗牛 |
| 🐉 神话 | 龙 |
| 🐙 水生 | 章鱼 |
| 🦎 异形 | 蝾螈 |
| 👻 神秘 | 幽灵 |
| 🤖 科技 | 机器人 |
| 🫧 抽象 | 果冻 |
| 🌵 植物 | 仙人掌 |
| 🍄 真菌 | 蘑菇 |
| 🐹 特殊 | 水豚 |
| 💥 meme | 胖橘 |

### 5 大稀有度

| 稀有度 | 概率 | 星级 | 属性下限 | 可解锁帽子 |
|--------|------|------|---------|-----------|
| 普通 | 60% | ★ | 5 | 无 |
| 不凡 | 25% | ★★ | 15 | 皇冠、礼帽、螺旋桨 |
| 稀有 | 10% | ★★★ | 25 | 光环、巫师帽 |
| 史诗 | 4% | ★★★★ | 35 | 毛线帽 |
| 传说 | 1% | ★★★★★ | 50 | 小鸭子 |

### 闪光变异

独立的 **1% 概率** 出现闪光变异，带有彩虹闪光效果。**闪光传说** ≈ 万分之一概率！

### 5 大性格属性

| 属性 | 含义 |
|------|------|
| 🐛 DEBUGGING | 发现代码问题的能力 |
| 😌 PATIENCE | 反馈风格的温和程度 |
| 🔀 CHAOS | 反应的不可预测性 |
| 🧠 WISDOM | 技术洞察的深度 |
| 💬 SNARK | 评论的犀利程度 |

### 核心架构：Bones vs Soul

- **骨架层 (Bones)**：物种、稀有度、闪光、眼睛、帽子、性格属性——通过 FNV-1a 哈希 + 盐值 `friend-2026-401` 计算。每次会话重新计算，不可伪造。
- **灵魂层 (Soul)**：名字和性格描述——首次孵化时生成，永久存储。
- **反作弊**：新计算的骨架永远覆盖存储值。

### 系统要求

- Node.js 18+
- Claude Code
- 支持 Windows、Linux、macOS

### 卸载

```bash
npm uninstall -g claude-code-buddy
```

然后手动从 `~/.claude/settings.json` 中移除 buddy 相关的 hooks。

---

## License

MIT

---

## Contact / 联系方式

- **WeChat / 微信**: 399187854

<div align="center">

![WeChat QR](assets/wechat-qr.png)

</div>

- **QQ**: 29052208
