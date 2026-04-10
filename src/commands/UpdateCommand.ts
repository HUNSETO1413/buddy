import { PetState, CommandResult } from '../types';
import { t } from '../i18n';

export async function updateCheck(state: PetState): Promise<CommandResult> {
  const lang = state.language || 'en';

  // Dynamic import to avoid loading UpdateChecker unless needed
  const { checkForUpdate } = await import('../systems/UpdateChecker');
  const result = await checkForUpdate();

  if (result.hasUpdate) {
    const msg = lang === 'zh'
      ? `发现新版本! 当前: v${result.localVersion} → 最新: v${result.remoteVersion}\n输入 /user:buddy update 执行更新。`
      : `New version available! Current: v${result.localVersion} → Latest: v${result.remoteVersion}\nType /user:buddy update to upgrade.`;
    return { success: true, message: msg, stateChanges: {} };
  }

  const msg = lang === 'zh'
    ? `已是最新版本! v${result.localVersion}`
    : `You're on the latest version! v${result.localVersion}`;
  return { success: true, message: msg, stateChanges: {} };
}

export async function updateRun(state: PetState): Promise<CommandResult> {
  const lang = state.language || 'en';

  const { runUpdate } = await import('../systems/UpdateChecker');
  const result = runUpdate();

  if (result.success) {
    const msg = lang === 'zh'
      ? `更新成功! 请重启 Claude Code 以加载新版本。`
      : `Update complete! Restart Claude Code to load the new version.`;
    return { success: true, message: msg, stateChanges: {} };
  }

  const msg = lang === 'zh'
    ? `更新失败: ${result.output}`
    : `Update failed: ${result.output}`;
  return { success: false, message: msg, stateChanges: {} };
}
