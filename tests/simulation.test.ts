import { describe, expect, it } from 'vitest';
import { generateWorld } from '../src/simulation/world';
import { deriveHybridAbility, canFuseSystems } from '../src/simulation/fusion';

describe('simulation core', () => {
  it('generates a reproducible world with tiles, people and buildings', () => {
    const world = generateWorld(42, 12, 10);
    expect(world.width).toBe(12);
    expect(world.height).toBe(10);
    expect(world.tiles.length).toBe(120);
    expect(world.people.length).toBeGreaterThan(0);
    expect(world.buildings.length).toBeGreaterThan(0);
  });

  it('supports energy compatibility fusion', () => {
    const ki = { id: 'ki', name: 'Ki', energyType: 'ki', compatibility: ['chakra', 'spirit'], description: '' };
    const chakra = { id: 'chakra', name: 'Chakra', energyType: 'chakra', compatibility: ['ki', 'spirit'], description: '' };

    expect(canFuseSystems(ki, chakra)).toBe(true);
    expect(deriveHybridAbility(ki, chakra)?.name).toContain('Ki');
  });
});
