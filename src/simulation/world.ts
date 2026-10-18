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
  const baseNames = ['Ari', 'Mira', 'Toma', 'Zeki', 'Lina', 'Ren', 'Kova', 'Edda', 'Juno', 'Noor'];

  for (let i = 0; i < 10; i += 1) {
    const x = Math.floor(rand() * width);
    const y = Math.floor(rand() * height);
    const personality = ['curious', 'ambitious', 'steady', 'fierce', 'inventive'][i % 5];
    const job = ['gatherer', 'builder', 'explorer', 'warrior'][i % 4] as Person['job'];

    people.push({
      id: `person-${i + 1}`,
      name: `${baseNames[i % baseNames.length]}-${i + 1}`,
      x,
      y,
      health: 100,
      hunger: 25 + Math.floor(rand() * 30),
      energy: 80,
      job,
      goal: 'Explore the wilds',
      personality,
      homeId: null,
    });
  }

  const buildings: Building[] = [
    { id: 'camp-1', x: 2, y: 2, type: 'camp' },
    { id: 'hut-1', x: 4, y: 4, type: 'hut' },
  ];

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
  };
}

export function getWorldSnapshot(world: WorldState) {
  return {
    population: world.people.length,
    tick: world.tick,
    resources: world.tiles.filter((tile) => tile.resource).length,
    systems: world.systems.length,
  };
}
