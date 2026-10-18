import type { WorldState, ModDefinition } from './types';
import { getBuiltInMods } from './mods';

// Simple persistence wrapper for active mods
export function getActiveModIds(): string[] {
  try {
    const raw = localStorage.getItem('godmode:activeMods');
    if (!raw) return [];
    return JSON.parse(raw) as string[];
  } catch (err) {
    return [];
  }
}

export function setActiveModIds(ids: string[]) {
  try {
    localStorage.setItem('godmode:activeMods', JSON.stringify(ids));
  } catch (err) {
    // ignore
  }
}
