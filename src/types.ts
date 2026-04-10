// Pet Identity (Bones Layer)
export type SpeciesId = 'duck' | 'goose' | 'cat' | 'rabbit' | 'owl' | 'penguin' |
  'turtle' | 'snail' | 'dragon' | 'octopus' | 'axolotl' | 'ghost' | 'robot' |
  'blob' | 'cactus' | 'mushroom' | 'capybara' | 'chonk';

export type BuddyLanguage = 'en' | 'zh';
export type RarityTier = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
export type PersonalityKey = 'debugging' | 'patience' | 'chaos' | 'wisdom' | 'snark';
export type MoodType = 'ecstatic' | 'happy' | 'neutral' | 'sad' | 'angry' | 'sleeping';

export interface PersonalityProfile {
  debugging: number;
  patience: number;
  chaos: number;
  wisdom: number;
  snark: number;
  peakAttribute: PersonalityKey;
  troughAttribute: PersonalityKey;
}

export interface BonesLayer {
  species: SpeciesId;
  rarity: RarityTier;
  isShiny: boolean;
  eyeVariant: string;
  hat: string | null;
  personality: PersonalityProfile;
}

export interface SoulLayer {
  name: string;
  personalityDescription: string;
  generatedAt: string;
}

export interface GameplayAttributes {
  hunger: number;
  happiness: number;
  energy: number;
  intelligence: number;
  strength: number;
  charisma: number;
  luck: number;
}

export interface PetStats {
  totalConversations: number;
  totalCommands: number;
  totalPets: number;
  totalTasks: number;
  totalLinesGenerated: number;
  totalBugsFixed: number;
  streakDays: number;
  lastInteractionAt: string;
}

export interface PetState {
  id: string;
  name: string;
  species: SpeciesId;
  rarity: RarityTier;
  isShiny: boolean;
  eyeVariant: string;
  hat: string | null;
  personality: PersonalityProfile;
  peakAttribute: PersonalityKey;
  troughAttribute: PersonalityKey;
  attributes: GameplayAttributes;
  level: number;
  exp: number;
  expToNext: number;
  mood: MoodType;
  language: BuddyLanguage;
  isVisible: boolean;
  isMuted: boolean;
  bornAt: string;
  soul: SoulLayer | null;
  stats: PetStats;
}

// Hook input/output types
export interface SessionStartInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: 'SessionStart';
  source: 'startup' | 'resume' | 'clear' | 'compact';
  model: string;
}

export interface UserPromptSubmitInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  permission_mode: string;
  hook_event_name: 'UserPromptSubmit';
  prompt: string;
}

export interface PostToolUseInput {
  session_id: string;
  transcript_path: string;
  cwd: string;
  hook_event_name: 'PostToolUse';
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_response: Record<string, unknown>;
  tool_use_id: string;
}

export interface HookOutput {
  hookSpecificOutput: {
    hookEventName: string;
    additionalContext: string;
    sessionTitle?: string;
  };
}

// Species data
export interface SpeciesData {
  id: SpeciesId;
  nameEn: string;
  nameZh: string;
  category: string;
  emoji: string;
  hexEncoded: number[];
}

export interface SpeciesSprites {
  idle: [string, string, string]; // 3 frames
  happy: string;
  sad: string;
  angry: string;
  sleeping: string;
}

export type SpeciesSpriteMood = 'idle' | 'happy' | 'sad' | 'angry' | 'sleeping';

// Rarity data
export interface RarityTierData {
  id: RarityTier;
  nameEn: string;
  nameZh: string;
  probability: number;
  stars: number;
  attributeFloor: number;
  unlockedHats: string[];
  colorANSI: string;
  starsDisplay: string;
}

// Hat data
export interface HatDefinition {
  id: string;
  nameEn: string;
  nameZh: string;
  ascii: string;
  minRarity: RarityTier;
}

// Eye data
export interface EyeVariant {
  id: string;
  eyes: string;
  name: string;
}

// Storage
export interface BuddyStorage {
  petState: PetState | null;
  soul: SoulLayer | null;
  userId: string;
  version: number;
}

// Commands
export interface BuddyCommand {
  name: string;
  description: string;
  execute(state: PetState, args: string[]): Promise<CommandResult>;
}

export interface CommandResult {
  success: boolean;
  message: string;
  stateChanges?: Partial<PetState>;
}
