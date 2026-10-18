--- a/src/App.tsx
+++ b/src/App.tsx
@@
         <aside className="panel inspector">
           <h2>Person inspector</h2>
@@
           <div className="timeline-mini">
             <h3>Simulation log</h3>
             {world.events.length === 0 ? (
               <p className="muted">No events yet. Start the simulation.</p>
             ) : (
               world.events.slice().reverse().slice(0, 12).map((e, i) => (
                 <div key={i} className="log-item">
                   <span style={{ flex: 1 }}>{e}</span>
                 </div>
               ))
             )}
           </div>
         </aside>
       </main>
 
+      <section className="panel" style={{ marginTop: 18 }}>
+        <h2>Chronicle</h2>
+        <div style={{ display: 'flex', gap: 12 }}>
+          <div style={{ flex: 1 }}>
+            <h3>Timeline</h3>
+            {world.chronicle.slice().reverse().slice(0, 40).map((h) => (
+              <div key={h.id} style={{ padding: 8, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
+                <strong>{h.tick}: {h.title}</strong>
+                <div style={{ fontSize: 12 }}>{h.description}</div>
+              </div>
+            ))}
+          </div>
+          <div style={{ width: 320 }}>
+            <h3>Notable figures</h3>
+            {world.figures.length === 0 ? (
+              <div className="mod-card">No notable figures yet.</div>
+            ) : (
+              world.figures.map((f) => (
+                <div key={f.id} className="mod-card">
+                  <strong>{f.id}</strong>
+                  <small>Score: {f.score}</small>
+                </div>
+              ))
+            )}
+          </div>
+        </div>
+      </section>
+
     </div>
   );
 }
