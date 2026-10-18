--- a/src/simulation/combat.ts
+++ b/src/simulation/combat.ts
@@
-import type { WorldState, Person } from './types';
+import type { WorldState, Person } from './types';
+import { recordEvent } from './chronicle';
@@
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
+    // record historical death
+    recordEvent(world as WorldState, 'Death in battle', `${defender.name} died fighting ${attacker.name}`, [defender.id, attacker.id], ['death', 'battle']);
   }
