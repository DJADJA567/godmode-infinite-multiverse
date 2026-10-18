import type { WorldState } from './types';

export function updateCivilizations(world: WorldState) {
  // Very simple civilization update rules:
  // - Each civ consumes/produces resources based on nearby tiles and population
  // - If resources fall below threshold, population declines
  // - Diplomacy: chance to change relation to war if resources are low

  for (const civ of world.civilizations) {
    // compute nearby resource potential (count tiles in small radius)
    let foodPotential = 0;
    let woodPotential = 0;
    let stonePotential = 0;

    for (let dx = -2; dx <= 2; dx += 1) {
      for (let dy = -2; dy <= 2; dy += 1) {
        const tx = civ.capitalX + dx;
        const ty = civ.capitalY + dy;
        const tile = world.tiles.find((t) => t.x === tx && t.y === ty);
        if (!tile) continue;
        if (tile.resource === 'food') foodPotential += 1;
        if (tile.resource === 'wood') woodPotential += 1;
        if (tile.resource === 'stone') stonePotential += 1;
      }
    }

    // produce resources proportional to potentials and population
    const popSize = civ.populationIds.length || 1;
    civ.resources.food += Math.max(0, Math.floor(foodPotential * (popSize / 6)));
    civ.resources.wood += Math.max(0, Math.floor(woodPotential * (popSize / 8)));
    civ.resources.stone += Math.max(0, Math.floor(stonePotential * (popSize / 10)));

    // consume resources per tick
    const foodConsumption = Math.max(1, Math.floor(popSize / 3));
    civ.resources.food = Math.max(0, civ.resources.food - foodConsumption);

    // grow/shrink population based on food
    if (civ.resources.food > popSize * 2) {
      // small chance to gain new person
      if (Math.random() < 0.15) {
        const newId = `person-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        world.people.push({
          id: newId,
          name: `Child-${newId.slice(-4)}`,
          x: civ.capitalX,
          y: civ.capitalY,
          health: 100,
          hunger: 10,
          energy: 80,
          job: 'gatherer',
          goal: 'Grow up',
          personality: 'steady',
          homeId: civ.id,
        });
        civ.populationIds.push(newId);
      }
    } else if (civ.resources.food === 0) {
      // population loss due to starvation
      if (civ.populationIds.length > 0 && Math.random() < 0.2) {
        const rem = civ.populationIds.pop();
        if (rem) {
          // mark person removed
          const idx = world.people.findIndex((p) => p.id === rem);
          if (idx >= 0) world.people.splice(idx, 1);
        }
      }
    }

    // Simple diplomacy: if low resources, chance to become aggressive
    for (const other of world.civilizations) {
      if (other.id === civ.id) continue;
      const relation = civ.relations[other.id] ?? 'neutral';
      if (civ.resources.food < 2 && Math.random() < 0.1) {
        civ.relations[other.id] = 'war';
      }
      // if both rich, chance to ally
      if (civ.resources.food > 8 && other.resources.food > 8 && Math.random() < 0.03) {
        civ.relations[other.id] = 'ally';
      }
    }
  }

  // resolve simple wars: if relation 'war', occasionally damage the other civ resources/pop
  for (const a of world.civilizations) {
    for (const b of world.civilizations) {
      if (a.id === b.id) continue;
      if (a.relations[b.id] === 'war') {
        // small raiding effect
        if (Math.random() < 0.08) {
          const stealFood = Math.min(b.resources.food, 1 + Math.floor(Math.random() * 3));
          b.resources.food = Math.max(0, b.resources.food - stealFood);
          a.resources.food += stealFood;
        }
        // casualties
        if (Math.random() < 0.04 && b.populationIds.length > 0) {
          const rem = b.populationIds.pop();
          if (rem) {
            const idx = world.people.findIndex((p) => p.id === rem);
            if (idx >= 0) world.people.splice(idx, 1);
          }
        }
      }
    }
  }
}
