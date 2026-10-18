export interface ModDefinition {
  id: string;
  name: string;
  description: string;
  energyType: string;
  compatibility: string[];
  dependencies?: string[];
  provides?: {
    systems?: {
      id: string;
      name: string;
      description: string;
      energyType: string;
      compatibility: string[];
    }[];
  };
}

import type { EnergySystem } from './types';

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

export function getBuiltInMods() {
  return builtInMods;
}

// Load mods declared in public/mods via manifest.json
export async function loadAvailableMods(): Promise<ModDefinition[]> {
  try {
    const resp = await fetch('/mods/manifest.json');
    if (!resp.ok) return builtInMods;
    const list: string[] = await resp.json();
    const fetched: ModDefinition[] = [];
    for (const filename of list) {
      try {
        const r = await fetch(`/mods/${filename}`);
        if (!r.ok) continue;
        const j = await r.json();
        fetched.push(j as ModDefinition);
      } catch (err) {
        // ignore single file errors
        // eslint-disable-next-line no-console
        console.warn('failed loading mod', filename, err);
      }
    }

    // merge built-ins with fetched (override built-ins with fetched if same id)
    const map = new Map<string, ModDefinition>();
    for (const m of builtInMods) map.set(m.id, m);
    for (const m of fetched) map.set(m.id, m);
    return Array.from(map.values());
  } catch (err) {
    // fallback
    return builtInMods;
  }
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
    const systems = mod.provides?.systems ?? [];
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
    for (const dep of mod.dependencies ?? []) visit(dep);
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
    const systems = mod.provides?.systems ?? [];
    for (const s of systems) {
      const exists = (world.systems as EnergySystem[]).find((ws: EnergySystem) => ws.id === s.id);
      if (!exists) {
        world.systems.push({ id: s.id, name: s.name, description: s.description, energyType: s.energyType, compatibility: s.compatibility });
      }
    }
  }
}
