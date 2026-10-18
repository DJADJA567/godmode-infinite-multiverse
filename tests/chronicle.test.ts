import { describe, expect, it } from 'vitest';
import { generateWorld } from '../src/simulation/world';
import { recordEvent, generateBiography, detectEmergentFigures } from '../src/simulation/chronicle';

describe('chronicle engine', () => {
  it('records events and generates biographies', () => {
    const world = generateWorld(42, 12, 10);
    const p = world.people[0];
    const ev = recordEvent(world as any, 'Test Event', 'A test occurred', [p.id], ['test']);
    expect(world.chronicle.length).toBeGreaterThan(0);
    const bio = generateBiography(world as any, p.id);
    expect(bio).toContain('Biography');
    expect(bio).toContain('Test Event');
  });

  it('detects emergent figures based on event frequency', () => {
    const world = generateWorld(99, 10, 8);
    const pid = world.people[0].id;
    // add multiple events referencing the same person
    for (let i = 0; i < 5; i++) {
      recordEvent(world as any, `Event ${i}`, 'something', [pid], ['test']);
    }
    const figures = detectEmergentFigures(world as any, 3);
    expect(Array.isArray(figures)).toBe(true);
    expect(figures.find((f: any) => f.id === pid)).toBeTruthy();
  });
});
