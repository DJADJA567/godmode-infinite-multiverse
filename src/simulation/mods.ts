// Mod management: built-in loader + support for custom mods saved in localStorage
import type { ModDefinition } from './types';

// built-in definitions
const builtInMods: ModDefinition[] = [
  {
    id: 'ki-system',
    name: 'Ki System',
    description: 'Martial energy derived from willpower, focus, and training.',
    energyType: 'ki',
    compatibility: ['chakra', 'spirit'],
    provides: {
      systems: [
        {
          id: 'ki-system',
          name: 'Ki',
          description: 'A martial energy source measured by focus and force.',
          energyType: 'ki',
          compatibility: ['chakra', 'spirit'],
        },
      ],
    },
  },
  {
    id: 'chakra-system',
    name: 'Chakra System',
    description: 'Spiritual energy flowing through body and technique.',
    energyType: 'chakra',
    compatibility: ['ki', 'spirit'],
    provides: {
      systems: [
        {
          id: 'chakra-system',
          name: 'Chakra',
          description: 'A spiritual flow system connected to life force and technique.',
          energyType: 'chakra',
          compatibility: ['ki', 'spirit'],
        },
      ],
    },
  },
];

const CUSTOM_MOD_KEY = 'godmode:customMods';

export function getBuiltInMods() {
  return builtInMods;
}

export function listCustomMods(): ModDefinition[] {
  try {
    const raw = localStorage.getItem(CUSTOM_MOD_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ModDefinition[];
  } catch (err) {
    return [];
  }
}

export function saveCustomMod(mod: ModDefinition) {
  const current = listCustomMods();
  const index = current.findIndex((m) => m.id === mod.id);
  if (index >= 0) current[index] = mod; else current.push(mod);
  localStorage.setItem(CUSTOM_MOD_KEY, JSON.stringify(current));
  // notify listeners
  try {
    window.dispatchEvent(new CustomEvent('godmode:modsChanged'));
  } catch (e) {
    // ignore
  }
}

export function deleteCustomMod(modId: string) {
  const current = listCustomMods().filter((m) => m.id !== modId);
  localStorage.setItem(CUSTOM_MOD_KEY, JSON.stringify(current));
  try {
    window.dispatchEvent(new CustomEvent('godmode:modsChanged'));
  } catch (e) {
    // ignore
  }
}

export async function loadAvailableMods(): Promise<ModDefinition[]> {
  const fetched: ModDefinition[] = [];
  try {
    const resp = await fetch('/mods/manifest.json');
    if (resp.ok) {
      const list: string[] = await resp.json();
      for (const filename of list) {
        try {
          const r = await fetch(`/mods/${filename}`);
          if (!r.ok) continue;
          const j = await r.json();
          fetched.push(j as ModDefinition);
        } catch (err) {
          // ignore
        }
      }
    }
  } catch (err) {
    // ignore network errors
  }

  // merge built-ins, fetched, and local custom mods
  const map = new Map<string, ModDefinition>();
  for (const m of builtInMods) map.set(m.id, m);
  for (const m of fetched) map.set(m.id, m);
  for (const m of listCustomMods()) map.set(m.id, m);
  return Array.from(map.values());
}

export function validateMods(mods: ModDefinition[]) {
  const errors: string[] = [];
  const valid: ModDefinition[] = [];

  const ids = new Set<string>();
  for (const mod of mods) {
    if (!mod.id || !mod.name || !mod.energyType) {
      errors.push(`Invalid mod: missing required fields in ${JSON.stringify(mod).slice(0, 80)}`);
      continue;
    }
    if (ids.has(mod.id)) {
      errors.push(`Duplicate mod id: ${mod.id}`);
      continue;
    }
    ids.add(mod.id);
    valid.push(mod);
  }

  return { valid, errors };
}

export function detectConflicts(mods: ModDefinition[]) {
  // naive conflict detection: two mods providing the same system id
  const provided = new Map<string, string[]>();
  for (const mod of mods) {
    const systems = (mod as any).provides?.systems ?? [];
    for (const s of systems) {
      const arr = provided.get(s.id) ?? [];
      arr.push(mod.id);
      provided.set(s.id, arr);
    }
  }

  const conflicts: { systemId: string; mods: string[] }[] = [];
  for (const [systemId, modIds] of provided.entries()) {
    if (modIds.length > 1) conflicts.push({ systemId, mods: modIds });
  }
  return conflicts;
}

export function resolveDependencies(mods: ModDefinition[]) {
  // topological sort
  const map = new Map(mods.map((m) => [m.id, m]));
  const visited = new Set<string>();
  const temp = new Set<string>();
  const result: ModDefinition[] = [];
  const errors: string[] = [];

  function visit(id: string) {
    if (visited.has(id)) return;
    if (temp.has(id)) {
      errors.push(`Cyclic dependency detected at ${id}`);
      return;
    }
    const mod = map.get(id);
    if (!mod) {
      errors.push(`Missing dependency: ${id}`);
      return;
    }
    temp.add(id);
    for (const dep of (mod.dependencies ?? []) as string[]) visit(dep);
    temp.delete(id);
    visited.add(id);
    result.push(mod);
  }

  for (const m of mods) visit(m.id);
  return { ordered: result, errors };
}

export function applyModsToWorld(world: any, activeModIds: string[], availableMods: ModDefinition[]) {
  const byId = new Map(availableMods.map((m) => [m.id, m]));
  for (const id of activeModIds) {
    const mod = byId.get(id);
    if (!mod) continue;
    const systems = (mod as any).provides?.systems ?? [];
    for (const s of systems) {
      const exists = (world.systems as any[]).find((ws: any) => ws.id === s.id);
      if (!exists) {
        world.systems.push({ id: s.id, name: s.name, description: s.description, energyType: s.energyType, compatibility: s.compatibility });
      }
    }
  }
}
