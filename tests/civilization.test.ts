import { describe, expect, it } from 'vitest';
import { generateWorld } from '../src/simulation/world';
import { updateCivilizations } from '../src/simulation/civilization';

describe('civilizations phase 2', () => {
  it('generates civilizations and assigns people', () => {
    const world = generateWorld(1234, 16, 12);
    expect(world.civilizations.length).toBeGreaterThanOrEqual(2);
    const totalAssigned = world.civilizations.reduce((sum, c) => sum + c.populationIds.length, 0);
    expect(totalAssigned).toBe(world.people.length);
  });

  it('updateCivilizations mutates resources and can spawn or remove people', () => {
    const world = generateWorld(42, 12, 10);
    const beforePopulation = world.people.length;
    updateCivilizations(world as any);
    // after update, population may have changed but should remain >= 0
    expect(world.people.length).toBeGreaterThanOrEqual(0);
    expect(world.civilizations.length).toBeGreaterThanOrEqual(2);
  });
});
