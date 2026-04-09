import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as crypto from 'crypto';
import { BuddyStorage } from '../types';

const DATA_DIR = path.join(os.homedir(), '.claude', 'buddy');
const STORAGE_FILE = path.join(DATA_DIR, 'buddy-storage.json');
const USER_ID_FILE = path.join(DATA_DIR, 'user-id.txt');
const TMP_FILE = path.join(DATA_DIR, 'buddy-storage.json.tmp');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function getOrCreateUserId(): string {
  ensureDataDir();
  if (fs.existsSync(USER_ID_FILE)) {
    return fs.readFileSync(USER_ID_FILE, 'utf-8').trim();
  }
  const userId = crypto.randomUUID();
  fs.writeFileSync(USER_ID_FILE, userId, 'utf-8');
  return userId;
}

function loadRaw(): BuddyStorage | null {
  ensureDataDir();
  if (!fs.existsSync(STORAGE_FILE)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    return JSON.parse(raw) as BuddyStorage;
  } catch {
    return null;
  }
}

function saveRaw(data: BuddyStorage): void {
  ensureDataDir();
  const json = JSON.stringify(data, null, 2);
  // Atomic write: write to tmp file then rename
  fs.writeFileSync(TMP_FILE, json, 'utf-8');
  fs.renameSync(TMP_FILE, STORAGE_FILE);
}

/**
 * StorageManager provides a class-based API over the underlying
 * file-based storage so consumers can use `new StorageManager()`.
 */
export class StorageManager {
  load(): BuddyStorage | null {
    return loadRaw();
  }

  save(data: BuddyStorage): void {
    saveRaw(data);
  }
}
