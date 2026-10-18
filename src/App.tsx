@@
         <aside className="panel inspector">
           <h2>Person inspector</h2>
           {selectedPerson ? (
@@
           <div className="timeline-mini">
             <h3>Simulation log</h3>
-            {world.people.slice(0, 4).map((person) => (
-              <div key={person.id} className="log-item">
-                <button type="button" onClick={() => setSelectedPersonId(person.id)}>{person.name}</button>
-                <span>{person.goal}</span>
-              </div>
-            ))}
+            {world.events.length === 0 ? (
+              <p className="muted">No events yet. Start the simulation.</p>
+            ) : (
+              world.events.slice().reverse().slice(0, 12).map((e, i) => (
+                <div key={i} className="log-item">
+                  <span style={{ flex: 1 }}>{e}</span>
+                </div>
+              ))
+            )}
           </div>
         </aside>
