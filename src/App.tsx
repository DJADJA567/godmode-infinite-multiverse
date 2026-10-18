--- a/src/App.tsx
+++ b/src/App.tsx
@@
-import PhaserGame from './game/PhaserGame';
-import { SimulationEngine } from './simulation/engine';
-import { generateWorld, getWorldSnapshot } from './simulation/world';
-import type { WorldState } from './simulation/types';
-import { getModCatalog, loadModDefinitions } from './simulation/mods';
+import PhaserGame from './game/PhaserGame';
+import { SimulationEngine } from './simulation/engine';
+import { generateWorld, getWorldSnapshot } from './simulation/world';
+import type { WorldState } from './simulation/types';
+import { loadAvailableMods, validateMods, resolveDependencies, detectConflicts } from './simulation/mods';
+import { getActiveModIds, setActiveModIds } from './persistence/modsStore';
@@
-  const [modCatalog, setModCatalog] = useState(getModCatalog());
+  const [modCatalog, setModCatalog] = useState<any[]>([]);
@@
-  useEffect(() => {
-    const activeMods = loadModDefinitions();
-    setModCatalog(activeMods);
-  }, []);
+  useEffect(() => {
+    (async () => {
+      const mods = await loadAvailableMods();
+      const { valid, errors } = validateMods(mods);
+      if (errors.length) console.warn('mod validation errors', errors);
+      const { ordered, errors: depErrors } = resolveDependencies(valid as any);
+      if (depErrors.length) console.warn('dependency errors', depErrors);
+      const conflicts = detectConflicts(ordered as any);
+      if (conflicts.length) console.warn('mod conflicts', conflicts);
+      setModCatalog(ordered as any);
+
+      const active = getActiveModIds();
+      if (engineRef.current) engineRef.current.applyModDefinitions(active, ordered as any);
+    })();
+  }, []);
@@
-          <section>
-            <h2>Civilizations</h2>
-            <div className="mod-list">
-              {world.civilizations.map((civ) => (
-                <div key={civ.id} className="mod-card">
-                  <strong>{civ.name}</strong>
-                  <small>Pop: {civ.populationIds.length}</small>
-                  <span>Food: {civ.resources.food} · Wood: {civ.resources.wood} · Stone: {civ.resources.stone}</span>
-                </div>
-              ))}
-            </div>
-          </section>
+          <section>
+            <h2>Civilizations</h2>
+            <div className="mod-list">
+              {world.civilizations.map((civ) => (
+                <div key={civ.id} className="mod-card">
+                  <strong>{civ.name}</strong>
+                  <small>Pop: {civ.populationIds.length}</small>
+                  <span>Food: {civ.resources.food} · Wood: {civ.resources.wood} · Stone: {civ.resources.stone}</span>
+                </div>
+              ))}
+            </div>
+          </section>
@@
-          <section>
-            <h2>Active mods</h2>
-            <div className="mod-list">
-              {modCatalog.map((mod) => (
-                <div key={mod.id} className="mod-card">
-                  <strong>{mod.name}</strong>
-                  <small>{mod.energyType}</small>
-                  <span>{mod.description}</span>
-                </div>
-              ))}
-            </div>
-          </section>
+          <section>
+            <h2>Mods</h2>
+            <div className="mod-list">
+              {modCatalog.map((mod) => {
+                const active = getActiveModIds();
+                const checked = active.includes(mod.id);
+                return (
+                  <label key={mod.id} className="mod-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
+                    <div>
+                      <strong>{mod.name}</strong>
+                      <small style={{ display: 'block' }}>{mod.energyType}</small>
+                      <span>{mod.description}</span>
+                    </div>
+                    <div>
+                      <input
+                        type="checkbox"
+                        checked={checked}
+                        onChange={() => {
+                          const current = getActiveModIds();
+                          const next = checked ? current.filter((id) => id !== mod.id) : [...current, mod.id];
+                          setActiveModIds(next);
+                          if (engineRef.current) engineRef.current.applyModDefinitions(next, modCatalog as any);
+                        }}
+                      />
+                    </div>
+                  </label>
+                );
+              })}
+            </div>
+          </section>
