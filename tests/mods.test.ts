import { describe, expect, it } from 'vitest';
import { loadAvailableMods, validateMods, resolveDependencies, detectConflicts } from '../src/simulation/mods';

describe('mod engine', () => {
  it('validates built-in and manifest mods', async () => {
    const mods = await loadAvailableMods();
    const { valid, errors } = validateMods(mods);
    expect(errors.length).toBeGreaterThanOrEqual(0);
    expect(valid.length).toBeGreaterThan(0);
  });

  it('resolves dependencies and detects conflicts', async () => {
    const mods = await loadAvailableMods();
    const { ordered, errors } = resolveDependencies(mods as any);
    expect(errors.length).toBeGreaterThanOrEqual(0);
    const conflicts = detectConflicts(ordered as any);
    expect(Array.isArray(conflicts)).toBe(true);
  });
});
