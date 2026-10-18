import { describe, expect, it } from 'vitest';
import { generateWorld } from '../src/simulation/world';
import { simulateSkirmish } from '../src/simulation/combat';

describe('combat engine', () => {
  it('can simulate a skirmish between warring civilizations and emit events', () => {
    const world = generateWorld(999, 12, 10);
    // force a war
    if (world.civilizations.length >= 2) {
      const a = world.civilizations[0];
      const b = world.civilizations[1];
      a.relations[b.id] = 'war';
      b.relations[a.id] = 'war';

      // ensure both have a warrior
      const warriorAId = a.populationIds[0];
      const warriorBId = b.populationIds[1] ?? b.populationIds[0];
      const wa = world.people.find((p) => p.id === warriorAId);
      const wb = world.people.find((p) => p.id === warriorBId);
      if (wa) wa.job = 'warrior';
      if (wb) wb.job = 'warrior';

      const beforeEvents = world.events.length;
      const events = simulateSkirmish(world as any);
      expect(world.events.length).toBeGreaterThanOrEqual(beforeEvents);
      // events should contain at least one string describing action
      expect(events.length).toBeGreaterThan(0);
    }
  });
});
