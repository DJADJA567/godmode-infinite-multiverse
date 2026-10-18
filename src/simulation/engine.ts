import type { WorldState } from './types';
import { updateCivilizations } from './civilization';
import { simulateSkirmish } from './combat';
import { attemptDiscoverHybrid } from './fusion';
import { recordEvent, detectEmergentFigures } from './chronicle';

export class SimulationEngine {
  private world: WorldState;
  private activeModIds: string[] = [];

  constructor(initialWorld: WorldState) {
    this.world = structuredClone(initialWorld);
  }

  applyModDefinitions(activeModIds: string[], availableMods: any[]) {
    this.activeModIds = activeModIds;
  }

  step() {
    this.world.tick += 1;

    // Update civilizations before individuals (they may produce resources, spawn people, trigger wars)
    updateCivilizations(this.world as WorldState);

    // Combat resolution for wars
    simulateSkirmish(this.world as WorldState);

    for (const person of this.world.people as any[]) {
      this.updatePerson(person);

      // attempt hybrid discovery occasionally
      if (person.job === 'explorer' || person.personality === 'curious' || person.xp > 30) {
        attemptDiscoverHybrid(this.world as WorldState, person);
      }
    }

    // Recompute notable figures every 25 ticks
    if (this.world.tick % 25 === 0) {
      detectEmergentFigures(this.world as WorldState, 2);
    }
  }

  getWorld() {
    return this.world;
  }

  private updatePerson(person: any) {
    person.hunger = Math.min(100, person.hunger + 3);
    person.energy = Math.max(0, person.energy - 1);

    if (person.hunger > 65) {
      person.goal = 'Find food';
      const foodTile = this.world.tiles.find((tile) => tile.resource === 'food' && this.distance(person.x, person.y, tile.x, tile.y) < 8);

      if (foodTile) {
        person.x = foodTile.x;
        person.y = foodTile.y;
        person.hunger = Math.max(10, person.hunger - 35);
        person.energy = Math.min(100, person.energy + 5);
      }
    } else if (person.energy < 25) {
      person.goal = 'Recover by resting';
      person.energy = Math.min(100, person.energy + 15);
    } else if (person.job === 'builder' && this.world.buildings.length < 12) {
      person.goal = 'Construct a shelter';
      const x = (person.x + 1) % this.world.width;
      const y = (person.y + 2) % this.world.height;
      this.world.buildings.push({ id: `hut-${Date.now()}-${Math.random()}`, x, y, type: 'hut' });
      recordEvent(this.world as WorldState, 'Construction', `${person.name} built a ${'hut'}`, [person.id, person.homeId ?? ''], ['construction']);
    } else {
      person.goal = 'Explore the frontier';
      person.x = (person.x + 1) % this.world.width;
      person.y = (person.y + (person.id.length % 2 === 0 ? 1 : -1) + this.world.height) % this.world.height;
      person.energy = Math.max(0, person.energy - 2);
    }

    if (person.health <= 0) {
      person.goal = 'Fallen';
    }
  }

  private distance(x1: number, y1: number, x2: number, y2: number) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
  }
}
