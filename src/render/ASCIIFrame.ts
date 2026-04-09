/**
 * Render a Unicode box with a title embedded in the top border.
 *
 * Example:
 *   ╔══ Pet Card ════════════════╗
 *   ║  content line 1            ║
 *   ║  content line 2            ║
 *   ╚════════════════════════════╝
 */

export function frameBox(title: string, content: string, width: number = 40): string {
  const innerWidth = width - 2; // space inside the borders

  // Top border with title
  const titleStr = ` ${title} `;
  const titleDisplayLen = stripAnsi(titleStr).length;
  const leftPad = Math.floor((innerWidth - titleDisplayLen) / 2);
  const rightPad = innerWidth - titleDisplayLen - leftPad;
  const top = '\u2550'.repeat(leftPad) + titleStr + '\u2550'.repeat(rightPad);

  // Content lines, each padded to innerWidth
  const lines = content.split('\n');
  const contentLines = lines.map(line => {
    const displayLen = stripAnsi(line).length;
    const padding = Math.max(0, innerWidth - 2 - displayLen);
    return ' ' + line + ' '.repeat(padding) + ' ';
  });

  // Build box
  const box: string[] = [];
  box.push(`\u2554${top}\u2557`); // ╔...╗
  for (const line of contentLines) {
    box.push(`\u2551${line}\u2551`); // ║...║
  }
  box.push(`\u255A${'\u2550'.repeat(innerWidth)}\u255D`); // ╚...╝

  return box.join('\n');
}

/**
 * Measure visible length of a string, ignoring ANSI escape sequences.
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}
