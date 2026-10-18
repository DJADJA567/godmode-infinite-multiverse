--- a/src/App.tsx
+++ b/src/App.tsx
@@
         <aside className="panel inspector">
           <h2>Person inspector</h2>
           {selectedPerson ? (
             <div className="person-card">
               <h3>{selectedPerson.name}</h3>
               <ul>
                 <li><span>Goal</span><strong>{selectedPerson.goal}</strong></li>
                 <li><span>Job</span><strong>{selectedPerson.job}</strong></li>
                 <li><span>Hunger</span><strong>{selectedPerson.hunger}</strong></li>
                 <li><span>Energy</span><strong>{selectedPerson.energy}</strong></li>
                 <li><span>Health</span><strong>{selectedPerson.health}</strong></li>
                 <li><span>Location</span><strong>{selectedPerson.x}, {selectedPerson.y}</strong></li>
                 <li><span>Personality</span><strong>{selectedPerson.personality}</strong></li>
+                <li><span>Known abilities</span><strong>{selectedPerson.knownAbilities?.length ?? 0}</strong></li>
               </ul>
+              {selectedPerson.knownAbilities && selectedPerson.knownAbilities.length > 0 && (
+                <div style={{ marginTop: 10 }}>
+                  <h4>Abilities</h4>
+                  <ul>
+                    {selectedPerson.knownAbilities.map((abId) => {
+                      const ab = world.hybridAbilities.find((h) => h.id === abId);
+                      return (
+                        <li key={abId} title={ab?.description}>{ab?.name ?? abId}</li>
+                      );
+                    })}
+                  </ul>
+                </div>
+              )}
             </div>
           ) : (
             <p>No inhabitants selected.</p>
           )}
@@
-          <section>
-            <h2>Mods</h2>
+          <section>
+            <h2>Hybrid abilities</h2>
+            <div className="mod-list">
+              {world.hybridAbilities.length === 0 ? (
+                <div className="mod-card">No hybrid abilities catalogued yet.</div>
+              ) : (
+                world.hybridAbilities.map((h) => (
+                  <div key={h.id} className="mod-card">
+                    <strong>{h.name}</strong>
+                    <small>{h.energyTypes.join(' + ')}</small>
+                    <span>{h.description}</span>
+                  </div>
+                ))
+              )}
+            </div>
+          </section>
+
+          <section>
+            <h2>Mods</h2>
             <div className="mod-list">
               {modCatalog.map((mod) => {
                 const active = getActiveModIds();
                 const checked = active.includes(mod.id);
@@
                   </label>
                 );
               })}
             </div>
           </section>
