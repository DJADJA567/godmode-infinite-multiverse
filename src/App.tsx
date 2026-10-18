--- a/src/App.tsx
+++ b/src/App.tsx
@@
   useEffect(() => {
     const activeMods = loadModDefinitions();
     setModCatalog(activeMods);
   }, []);
@@
-  return (
+  return (
     <div className="app-shell">
@@
         <aside className="panel sidebar">
           <section>
             <h2>World status</h2>
@@
           </section>
 
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
+
+          <section>
+            <h2>Active mods</h2>
+            <div className="mod-list">
+              {modCatalog.map((mod) => (
+                <div key={mod.id} className="mod-card">
+                  <strong>{mod.name}</strong>
+                  <small>{mod.energyType}</small>
+                  <span>{mod.description}</span>
+                </div>
+              ))}
+            </div>
+          </section>
         </aside>
@@
       </section>
@@
         <aside className="panel inspector">
           <h2>Person inspector</h2>
