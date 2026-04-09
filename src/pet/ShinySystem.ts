export const SHINY_COLORS: string[] = [
  '\x1b[31m',  // red
  '\x1b[33m',  // yellow
  '\x1b[32m',  // green
  '\x1b[36m',  // cyan
  '\x1b[34m',  // blue
  '\x1b[35m',  // magenta
  '\x1b[37m',  // white
];

const SPARKLE_FRAMES = ['\u2728', '\u2728', '\u2B50', '\u2728', '\u2728', '\u2B50', '\u2728'];

export function isShinyRoll(hash: number): boolean {
  return Math.abs(hash) % 100 === 0;
}

export function renderShinyPrefix(frame: number): string {
  const colorIdx = frame % SHINY_COLORS.length;
  const sparkleIdx = frame % SPARKLE_FRAMES.length;
  return `${SHINY_COLORS[colorIdx]}${SPARKLE_FRAMES[sparkleIdx]}\x1b[0m`;
}
