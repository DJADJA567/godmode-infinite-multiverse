import type { Person, WorldState } from './types';
import type { Civilization } from './types';

function roll(min = 0, max = 1) {
  return Math.random() * (max - min) + min;
}

function levelUpIfNeeded(p: Person) {
  const needed = p.level * 20;
  if (p.xp >= needed) {
    p.level += 1;
    p.xp = Math.max(0, p.xp - needed);
    p.strength += 1;
    p.defense += 1;
    p.agility += 1;
    return true;
  }
  return false;
}

export function resolveCombat(attacker: Person, defender: Person, world: WorldState) {
  const atkPower = attacker.strength + attacker.skills['combat'] ?? 0 + Math.floor(roll(0, attacker.agility));
  const defPower = defender.defense + defender.skills['defense'] ?? 0 + Math.floor(roll(0, defender.agility));
  const damage = Math.max(1, atkPower - Math.floor(defPower / 2));

  defender.health -= damage;
  attacker.xp += Math.max(1, Math.floor(damage / 2));

  const events: string[] = [];
  events.push(`${attacker.name} hits ${defender.name} for ${damage} damage.`);

  if (defender.health <= 0) {
    events.push(`${defender.name} has fallen in battle.`);
    // remove defender from world
    const idx = world.people.findIndex((p) => p.id === defender.id);
    if (idx >= 0) world.people.splice(idx, 1);
    // remove from its civ
    if (defender.homeId) {
      const civ = world.civilizations.find((c) => c.id === defender.homeId);
      if (civ) {
        const pidx = civ.populationIds.indexOf(defender.id);
        if (pidx >= 0) civ.populationIds.splice(pidx, 1);
      }
    }
  }

  levelUpIfNeeded(attacker);

  return events;
}

export function simulateSkirmish(world: WorldState) {
  // find any pair of civs at war
  const warPairs: [Civilization, Civilization][] = [];
  for (const a of world.civilizations) {
    for (const b of world.civilizations) {
      if (a.id === b.id) continue;
      if (a.relations[b.id] === 'war') {
        warPairs.push([a, b]);
      }
    }
  }

  if (warPairs.length === 0) return [];

  const events: string[] = [];

  for (const [attackingCiv, defendingCiv] of warPairs) {
    // choose a warrior from attacker
    const attackerId = attackingCiv.populationIds.find((id) => {
      const p = world.people.find((pp) => pp.id === id);
      return !!p && p.job === 'warrior';
    });

    const defenderId = defendingCiv.populationIds.find((id) => {
      const p = world.people.find((pp) => pp.id === id);
      return !!p && p.job === 'warrior';
    });

    if (!attackerId || !defenderId) continue;

    const attacker = world.people.find((p) => p.id === attackerId)!;
    const defender = world.people.find((p) => p.id === defenderId)!;

    // move attacker near defender capital (simple effect)
    attacker.x = defendingCiv.capitalX;
    attacker.y = defendingCiv.capitalY;

    const se = resolveCombat(attacker, defender, world);
    events.push(...se);

    // raiding effect: steal some food
    const steal = Math.min(defendingCiv.resources.food, 1 + Math.floor(Math.random() * 3));
    if (steal > 0) {
      defendingCiv.resources.food = Math.max(0, defendingCiv.resources.food - steal);
      attackingCiv.resources.food += steal;
      events.push(`${attackingCiv.name} raids ${defendingCiv.name} and steals ${steal} food.`);
    }
  }

  // append events to world
  world.events.push(...events);
  // trim to last 80
  if (world.events.length > 80) world.events.splice(0, world.events.length - 80);

  return events;
}
