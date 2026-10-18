import type { EnergySystem, WorldState, Person, Ability } from './types';

export function canFuseSystems(first: EnergySystem, second: EnergySystem) {
  return first.compatibility.includes(second.energyType) || second.compatibility.includes(first.energyType);
}

function generateHybridId(a: EnergySystem, b: EnergySystem) {
  return `${a.id}__${b.id}__hybrid`;
}

function computeCompatibilityScore(a: EnergySystem, b: EnergySystem) {
  // Basic score: number of shared compatibilities + heuristic based on energyType string similarity
  const shared = a.compatibility.filter((c) => b.compatibility.includes(c)).length;
  const typeBonus = a.energyType === b.energyType ? 1 : 0;
  return shared + typeBonus;
}

export function deriveHybridAbility(a: EnergySystem, b: EnergySystem): Ability | null {
  if (!canFuseSystems(a, b)) return null;

  const score = computeCompatibilityScore(a, b);
  const power = 10 + score * 5;
  const cost = 5 + Math.max(1, 3 - score);

  const id = generateHybridId(a, b);
  const name = `${a.name}–${b.name} Hybrid`;
  const description = `A hybrid technique combining ${a.name} and ${b.name}. Compatibility score ${score}.`;

  return {
    id,
    name,
    description,
    energyTypes: [a.energyType, b.energyType],
    power,
    cost,
    sourceSystems: [a.id, b.id],
    conditions: [],
  };
}

export function findOrCreateHybrid(world: WorldState, a: EnergySystem, b: EnergySystem) {
  const candidate = deriveHybridAbility(a, b);
  if (!candidate) return null;
  const existing = world.hybridAbilities.find((h) => h.id === candidate.id);
  if (existing) return existing;
  world.hybridAbilities.push(candidate);
  world.events.push(`A new hybrid ability was catalogued: ${candidate.name}`);
  if (world.events.length > 80) world.events.splice(0, world.events.length - 80);
  return candidate;
}

export function attemptDiscoverHybrid(world: WorldState, person: Person) {
  // Discovery chance depends on: person level/xp, nearby systems, active systems in world, personality
  const systems = world.systems;
  for (let i = 0; i < systems.length; i++) {
    for (let j = i + 1; j < systems.length; j++) {
      const a = systems[i];
      const b = systems[j];

      if (!canFuseSystems(a, b)) continue;

      // chance calculation
      const base = 0.02; // base 2% per tick for explorers
      const levelBonus = Math.min(0.2, person.level * 0.01);
      const xpBonus = Math.min(0.15, person.xp / 200);
      const personalityBonus = person.personality === 'curious' ? 0.03 : 0;
      const jobBonus = person.job === 'explorer' ? 0.05 : 0;
      const compatibilityBonus = computeCompatibilityScore(a, b) * 0.02;

      const chance = base + levelBonus + xpBonus + personalityBonus + jobBonus + compatibilityBonus;

      if (Math.random() < chance) {
        const ability = findOrCreateHybrid(world, a, b);
        if (!ability) continue;
        // person learns the ability with some probability
        if (!person.knownAbilities.includes(ability.id)) {
          person.knownAbilities.push(ability.id);
          world.events.push(`${person.name} discovered a hybrid ability: ${ability.name}`);
          if (world.events.length > 80) world.events.splice(0, world.events.length - 80);
          return ability;
        }
      }
    }
  }

  return null;
}
