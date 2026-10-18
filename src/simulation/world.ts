import type { Building, Person, ResourceType, TileType, WorldState, WorldTile } from './types';

const resourcePalette: ResourceType[] = ['food', 'wood', 'stone', 'energy'];

function seededRandom(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;

  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

function tileTypeFromValue(value: number): TileType {
  if (value < 0.15) return 'water';
  if (value < 0.38) return 'forest';
  if (value < 0.6) return 'grass';
  if (value < 0.8) return 'mountain';
  return 'desert';
}

function resourceFromTile(tile: TileType): ResourceType | null {
  if (tile === 'forest') return 'wood';
  if (tile === 'grass') return 'food';
  if (tile === 'mountain') return 'stone';
  if (tile === 'desert') return 'energy';
  return null;
}

function pickName(seedRand: () => number, idx: number) {
  const baseNames = ['Ari', 'Mira', 'Toma', 'Zeki', 'Lina', 'Ren', 'Kova', 'Edda', 'Juno', 'Noor'];
  return `${baseNames[idx % baseNames.length]}-${Math.floor(seedRand() * 1000)}`;
}

export function generateWorld(seed: number, width: number, height: number): WorldState {
  const rand = seededRandom(seed);
  const tiles: WorldTile[] = [];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const noise = rand();
      const tileType = tileTypeFromValue(noise);
      const fertility = Math.round((rand() + 0.2) * 100) / 100;

      tiles.push({
        x,
        y,
        type: tileType,
        resource: resourceFromTile(tileType),
        fertility,
      });
    }
  }

  const people: Person[] = [];

  for (let i = 0; i < 10; i += 1) {
    const x = Math.floor(rand() * width);
    const y = Math.floor(rand() * height);
    const personality = ['curious', 'ambitious', 'steady', 'fierce', 'inventive'][i % 5];
    const job = ['gatherer', 'builder', 'explorer', 'warrior'][i % 4] as Person['job'];

    people.push({
      id: `person-${i + 1}`,
      name: pickName(rand, i),
      x,
      y,
      health: 100,
      hunger: 25 + Math.floor(rand() * 30),
      energy: 80,
      job,
      goal: 'Explore the wilds',
      personality,
      homeId: null,
      strength: 5 + Math.floor(rand() * 6),
      defense: 3 + Math.floor(rand() * 5),
      agility: 3 + Math.floor(rand() * 5),
      xp: 0,
      level: 1,
      skills: {},
    });
  }

  const buildings: Building[] = [
    { id: 'camp-1', x: 2, y: 2, type: 'camp' },
    { id: 'hut-1', x: 4, y: 4, type: 'hut' },
  ];

  // Create a couple of starter civilizations
  const civilizations = [];
  const civCount = 2;
  for (let i = 0; i < civCount; i += 1) {
    const cx = Math.floor(rand() * width);
    const cy = Math.floor(rand() * height);
    const civId = `civ-${i + 1}`;
    const territory = [{ x: cx, y: cy }];

    civilizations.push({
      id: civId,
      name: `Civ ${i + 1}`,
      capitalX: cx,
      capitalY: cy,
      populationIds: [],
      territory,
      resources: { food: 5 + Math.floor(rand() * 20), wood: 5 + Math.floor(rand() * 20), stone: 2 + Math.floor(rand() * 10) },
      technologyLevel: 1,
      relations: {},
    });
  }

  // Initialize relations neutral
  for (const a of civilizations) {
    for (const b of civilizations) {
      if (a.id === b.id) continue;
      a.relations[b.id] = 'neutral';
    }
  }

  // Assign people to nearest civ
  for (const person of people) {
    let nearest = civilizations[0];
    let bestDist = Math.abs(person.x - nearest.capitalX) + Math.abs(person.y - nearest.capitalY);
    for (const civ of civilizations) {
      const d = Math.abs(person.x - civ.capitalX) + Math.abs(person.y - civ.capitalY);
      if (d < bestDist) {
        nearest = civ;
        bestDist = d;
      }
    }
    person.homeId = nearest.id;
    nearest.populationIds.push(person.id);
  }

  // Add capitals as buildings
  for (const civ of civilizations) {
    buildings.push({ id: `${civ.id}-capital`, x: civ.capitalX, y: civ.capitalY, type: 'capital' });
  }

  return {
    width,
    height,
    seed,
    tick: 0,
    tiles,
    people,
    buildings,
    systems: [
      {
        id: 'ki-system',
        name: 'Ki',
        description: 'A martial energy source measured by focus and force.',
        energyType: 'ki',
        compatibility: ['chakra', 'spirit'],
      },
      {
        id: 'chakra-system',
        name: 'Chakra',
        description: 'A spiritual energy field used for ninjutsu and ritual techniques.',
        energyType: 'chakra',
        compatibility: ['ki', 'spirit'],
      },
    ],
    civilizations,
    events: [],
  };
}

export function getWorldSnapshot(world: WorldState) {
  return {
    population: world.people.length,
    tick: world.tick,
    resources: world.tiles.filter((tile) => tile.resource).length,
    systems: world.systems.length,
    civilizations: world.civilizations.length,
  };
}
