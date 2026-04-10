export const RAINBOW_COLORS: string[] = [
  '\x1b[31m',  // red
  '\x1b[33m',  // yellow
  '\x1b[32m',  // green
  '\x1b[36m',  // cyan
  '\x1b[34m',  // blue
  '\x1b[35m',  // magenta
  '\x1b[37m',  // white
];

export const RESET = '\x1b[0m';

const FILLED = '\u2588';  // █
const EMPTY = '\u2591';   // ░

export function renderRainbowBar(current: number, max: number, width: number = 20): string {
  if (max <= 0) return EMPTY.repeat(width);

  const filledCount = Math.min(width, Math.max(0, Math.round((current / max) * width)));
  const emptyCount = width - filledCount;

  let bar = '';
  for (let i = 0; i < filledCount; i++) {
    const colorIdx = i % RAINBOW_COLORS.length;
    bar += `${RAINBOW_COLORS[colorIdx]}${FILLED}`;
  }
  bar += RESET;

  if (emptyCount > 0) {
    bar += EMPTY.repeat(emptyCount);
  }

  return bar;
}

/** Plain text bar without any ANSI escape codes */
export function renderPlainBar(current: number, max: number, width: number = 20): string {
  if (max <= 0) return '░'.repeat(width);
  const filledCount = Math.min(width, Math.max(0, Math.round((current / max) * width)));
  const emptyCount = width - filledCount;
  return '█'.repeat(filledCount) + '░'.repeat(emptyCount);
}
