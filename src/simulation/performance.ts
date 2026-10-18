export interface PerformanceProfile {
  tickIntervalMs: number;
  activeRadius: number;
  simBudget: number;
}

export function getPerformanceProfile(speedMultiplier: number): PerformanceProfile {
  const safeMultiplier = Math.max(1, Math.min(8, speedMultiplier));
  return {
    tickIntervalMs: Math.max(150, 1000 / safeMultiplier),
    activeRadius: safeMultiplier >= 4 ? 7 : 10,
    simBudget: safeMultiplier >= 4 ? 0.85 : 1,
  };
}

export function shouldSimplifyPerson(
  person: { x: number; y: number },
  center: { x: number; y: number },
  radius: number,
): boolean {
  const dx = person.x - center.x;
  const dy = person.y - center.y;
  return Math.abs(dx) + Math.abs(dy) > radius;
}
