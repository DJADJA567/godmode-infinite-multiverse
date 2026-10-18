--- a/src/simulation/civilization.ts
+++ b/src/simulation/civilization.ts
@@
-import type { WorldState } from './types';
+import type { WorldState } from './types';
+import { recordEvent } from './chronicle';
@@
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
+        // record birth event
+        recordEvent(world as WorldState, 'Birth', `A child was born in ${civ.name}`, [newId, civ.id], ['birth']);
       }
     } else if (civ.resources.food === 0) {
@@
         if (rem) {
           // mark person removed
           const idx = world.people.findIndex((p) => p.id === rem);
           if (idx >= 0) world.people.splice(idx, 1);
+          recordEvent(world as WorldState, 'Death', `A person from ${civ.name} died of starvation`, [rem, civ.id], ['death']);
         }
       }
     }
@@
       if (Math.random() < 0.08) {
         const stealFood = Math.min(b.resources.food, 1 + Math.floor(Math.random() * 3));
         b.resources.food = Math.max(0, b.resources.food - stealFood);
         a.resources.food += stealFood;
         
+        // record raid
+        recordEvent(world as WorldState, 'Raid', `${a.name} raided ${b.name} for ${stealFood} food`, [a.id, b.id], ['raid', 'war']);
         }
         // casualties
         if (Math.random() < 0.04 && b.populationIds.length > 0) {
           const rem = b.populationIds.pop();
           if (rem) {
             const idx = world.people.findIndex((p) => p.id === rem);
             if (idx >= 0) world.people.splice(idx, 1);
+            recordEvent(world as WorldState, 'Battle Death', `${rem} perished in a raid by ${a.name}`, [rem, a.id, b.id], ['battle']);
           }
         }
       }
     }
   }
 }
