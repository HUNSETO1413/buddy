export const SALT = 'friend-2026-401';

export function fnv1a(input: string): number {
  let hash = 2166136261; // FNV offset basis
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619); // FNV prime
    hash = hash >>> 0; // unsigned
  }
  return hash;
}
