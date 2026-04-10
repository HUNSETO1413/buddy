import { PetState, CommandResult, BuddyLanguage } from '../types';
import { t } from '../i18n';

export async function lang(state: PetState, args: string[]): Promise<CommandResult> {
  const target = args[0];
  if (target !== 'en' && target !== 'zh') {
    const currentLang: BuddyLanguage = state.language || 'en';
    const i18n = t(currentLang);
    return {
      success: false,
      message: i18n.langUsage,
      stateChanges: {},
    };
  }

  const newLang = target as BuddyLanguage;
  const i18n = t(newLang);
  const langName = newLang === 'zh' ? '中文' : 'English';

  return {
    success: true,
    message: i18n.langChanged.replace('{lang}', langName),
    stateChanges: { language: newLang },
  };
}
