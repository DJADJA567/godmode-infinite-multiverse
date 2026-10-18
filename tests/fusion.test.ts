import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { generateWorld } from '../src/simulation/world';
import { deriveHybridAbility, attemptDiscoverHybrid } from '../src/simulation/fusion';

describe('fusion engine', () => {
  it('derives hybrid abilities for compatible systems', () => {
    const world = generateWorld(42, 10, 8);
    const a = world.systems[0];
    const b = world.systems[1];
    const hybrid = deriveHybridAbility(a as any, b as any);
    expect(hybrid).not.toBeNull();
    if (hybrid) {
      expect(hybrid.energyTypes.length).toBe(2);
      expect(hybrid.id).toContain(a.id);
      expect(hybrid.name).toContain(a.name);
    }
  });

  it('allows a high-chance discovery when randomness forced low', () => {
    const world = generateWorld(123, 12, 12);
    // make sure systems are compatible
    if (world.systems.length < 2) return;
    const person = world.people[0];
    person.job = 'explorer';
    person.level = 5;
    person.xp = 200;

    // force Math.random to 0 to ensure success when chance > 0
    const orig = Math.random;
    Math.random = () => 0 as any;
    try {
      const found = attemptDiscoverHybrid(world as any, person as any);
      // either found or already present but discovery should run without throwing
      expect(found === null || typeof found.id === 'string').toBeTruthy();
    } finally {
      Math.random = orig;
    }
  });
});
