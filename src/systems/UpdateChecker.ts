import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as https from 'https';
import * as http from 'http';
import { execSync } from 'child_process';

const BUDDY_DIR = path.join(os.homedir(), '.claude', 'buddy-src');
const VERSION_FILE = path.join(os.homedir(), '.claude', 'buddy', 'last-checked-version.json');

const GITHUB_RAW = 'https://raw.githubusercontent.com/HUNSETO1413/buddy/main/package.json';

interface VersionCheck {
  localVersion: string;
  remoteVersion: string | null;
  hasUpdate: boolean;
  lastChecked: string;
}

/** Read local version from installed package.json */
export function getLocalVersion(): string {
  try {
    const pkgPath = path.join(BUDDY_DIR, 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.version || '0.0.0';
    }
  } catch {}
  return '0.0.0';
}

/** Read the version baked into THIS running copy (dev source) */
export function getDevVersion(): string {
  try {
    const pkgPath = path.join(__dirname, '..', '..', 'package.json');
    if (fs.existsSync(pkgPath)) {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
      return pkg.version || '0.0.0';
    }
  } catch {}
  return '0.0.0';
}

/** Fetch remote version from GitHub (with timeout) */
function fetchRemoteVersion(): Promise<string | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      req?.destroy();
      resolve(null);
    }, 5000);

    let req: http.ClientRequest | undefined;
    try {
      req = https.get(GITHUB_RAW, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          clearTimeout(timeout);
          try {
            const pkg = JSON.parse(data);
            resolve(pkg.version || null);
          } catch {
            resolve(null);
          }
        });
      });
      req.on('error', () => {
        clearTimeout(timeout);
        resolve(null);
      });
    } catch {
      clearTimeout(timeout);
      resolve(null);
    }
  });
}

/** Compare semver: returns true if remote > local */
function isNewer(remote: string, local: string): boolean {
  const r = remote.split('.').map(Number);
  const l = local.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((r[i] || 0) > (l[i] || 0)) return true;
    if ((r[i] || 0) < (l[i] || 0)) return false;
  }
  return false;
}

/** Save last check result */
function saveCheckResult(result: VersionCheck): void {
  try {
    const dir = path.dirname(VERSION_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(VERSION_FILE, JSON.stringify(result, null, 2), 'utf8');
  } catch {}
}

/** Load last check result */
function loadCheckResult(): VersionCheck | null {
  try {
    if (fs.existsSync(VERSION_FILE)) {
      return JSON.parse(fs.readFileSync(VERSION_FILE, 'utf8'));
    }
  } catch {}
  return null;
}

/**
 * Check if an update is available.
 * Caches results for 24 hours to avoid hitting GitHub on every session.
 */
export async function checkForUpdate(): Promise<VersionCheck> {
  const local = getLocalVersion();
  const cached = loadCheckResult();

  // Use cache if less than 24h old and same local version
  if (cached && cached.localVersion === local) {
    const age = Date.now() - new Date(cached.lastChecked).getTime();
    if (age < 24 * 60 * 60 * 1000) {
      return cached;
    }
  }

  const remote = await fetchRemoteVersion();
  const hasUpdate = remote ? isNewer(remote, local) : false;

  const result: VersionCheck = {
    localVersion: local,
    remoteVersion: remote,
    hasUpdate,
    lastChecked: new Date().toISOString(),
  };
  saveCheckResult(result);
  return result;
}

/**
 * Run the actual update: git pull + npm install + tsc
 * Returns stdout/stderr output.
 */
export function runUpdate(): { success: boolean; output: string } {
  try {
    if (!fs.existsSync(BUDDY_DIR)) {
      return { success: false, output: 'Buddy source directory not found.' };
    }

    const cmd = [
      `cd "${BUDDY_DIR}"`,
      'git pull',
      'npm install',
      'npx tsc',
      'node dist/scripts/setup.js',
    ].join(' && ');

    const output = execSync(cmd, {
      encoding: 'utf8',
      timeout: 120000,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    return { success: true, output: output.trim() };
  } catch (err: any) {
    return {
      success: false,
      output: err.stdout?.toString()?.trim() || err.message || 'Update failed.',
    };
  }
}
