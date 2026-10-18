import type { EnergySystem } from './types';

export function canFuseSystems(first: EnergySystem, second: EnergySystem) {
  return first.compatibility.includes(second.energyType) || second.compatibility.includes(first.energyType);
}

export function deriveHybridAbility(first: EnergySystem, second: EnergySystem) {
  if (!canFuseSystems(first, second)) {
    return null;
  }

  return {
    id: `${first.id}-${second.id}-hybrid`,
    name: `${first.name} + ${second.name}`,
    description: `A hybrid technique using compatible ${first.energyType} and ${second.energyType} channels.`,
    energyType: `${first.energyType}/${second.energyType}`,
    compatibility: [first.energyType, second.energyType],
  };
}
