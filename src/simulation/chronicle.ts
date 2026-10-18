import type { WorldState, HistoricalEvent } from './types';

function makeId(prefix = 'evt') {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

export function recordEvent(world: WorldState, title: string, description: string, subjects: string[] = [], tags: string[] = []) {
  const evt: HistoricalEvent = {
    id: makeId('hist'),
    tick: world.tick,
    title,
    description,
    subjects,
    tags,
  };
  world.chronicle.push(evt);
  world.events.push(`${world.tick}: ${title}`);
  if (world.events.length > 120) world.events.splice(0, world.events.length - 120);
  return evt;
}

export function generateBiography(world: WorldState, personId: string) {
  // Collect events that mention the person
  const evts = world.chronicle.filter((e) => e.subjects.includes(personId));
  if (evts.length === 0) return `No recorded history for ${personId}.`;

  const lines = [`Biography for ${personId}:`];
  for (const e of evts) {
    lines.push(`Year ${e.tick}: ${e.title} — ${e.description}`);
  }
  return lines.join('\n');
}

export function detectEmergentFigures(world: WorldState, threshold = 3) {
  // Simple metric: count how many events reference each person
  const counts = new Map<string, { count: number; highlights: string[] }>();
  for (const e of world.chronicle) {
    for (const s of e.subjects) {
      const cur = counts.get(s) ?? { count: 0, highlights: [] };
      cur.count += 1;
      cur.highlights.push(e.id);
      counts.set(s, cur);
    }
  }

  const figures = [] as any[];
  for (const [id, info] of counts.entries()) {
    if (info.count >= threshold) {
      figures.push({ id, score: info.count, highlights: info.highlights.slice(0, 5) });
    }
  }

  // store top figures
  world.figures = (figures as any[])
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 20)
    .map((f) => ({ id: f.id, score: f.score, highlights: f.highlights }));

  return world.figures;
}
