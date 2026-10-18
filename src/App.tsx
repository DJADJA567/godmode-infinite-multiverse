import React, { useEffect, useRef, useState } from 'react';
import PhaserGame from './game/PhaserGame';
import { SimulationEngine } from './simulation/engine';
import { generateWorld, getWorldSnapshot } from './simulation/world';
import type { WorldState } from './simulation/types';
import { loadAvailableMods, validateMods, resolveDependencies, detectConflicts } from './simulation/mods';
import { getActiveModIds, setActiveModIds } from './persistence/modsStore';
import ModEditor from './components/ModEditor';

const initialWorld = generateWorld(42, 22, 16);

export default function App() {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [world, setWorld] = useState<WorldState>(initialWorld);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [modCatalog, setModCatalog] = useState<any[]>([]);

  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new SimulationEngine(initialWorld);
    }

    const interval = window.setInterval(() => {
      engineRef.current?.step();
      setWorld(engineRef.current!.getWorld());
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  async function reloadMods() {
    const mods = await loadAvailableMods();
    const { valid, errors } = validateMods(mods);
    if (errors.length) console.warn('mod validation errors', errors);
    const { ordered, errors: depErrors } = resolveDependencies(valid as any);
    if (depErrors.length) console.warn('dependency errors', depErrors);
    const conflicts = detectConflicts(ordered as any);
    if (conflicts.length) console.warn('mod conflicts', conflicts);
    setModCatalog(ordered as any);

    const active = getActiveModIds();
    if (engineRef.current) engineRef.current.applyModDefinitions(active, ordered as any);
  }

  useEffect(() => {
    reloadMods();
    const handler = () => reloadMods();
    window.addEventListener('godmode:modsChanged', handler);
    return () => window.removeEventListener('godmode:modsChanged', handler);
  }, []);

  const selectedPerson = world.people.find((person) => person.id === selectedPersonId) ?? world.people[0] ?? null;

  const stats = {
    population: world.people.length,
    buildings: world.buildings.length,
    tick: world.tick,
    resources: {
      food: world.tiles.filter((tile) => tile.resource === 'food').length,
      wood: world.tiles.filter((tile) => tile.resource === 'wood').length,
      stone: world.tiles.filter((tile) => tile.resource === 'stone').length,
    },
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="eyebrow">SIMULATION CORE</div>
          <h1>GODMODE: Infinite Multiverse</h1>
        </div>
        <div className="badges">
          <span>Prototype</span>
          <span>{world.tick} ticks</span>
        </div>
      </header>

      <main className="layout">
        <aside className="panel sidebar">
          <section>
            <h2>World status</h2>
            <ul className="stats-list">
              <li><span>Population</span><strong>{stats.population}</strong></li>
              <li><span>Buildings</span><strong>{stats.buildings}</strong></li>
              <li><span>Food nodes</span><strong>{stats.resources.food}</strong></li>
              <li><span>Wood nodes</span><strong>{stats.resources.wood}</strong></li>
              <li><span>Stone nodes</span><strong>{stats.resources.stone}</strong></li>
            </ul>
          </section>

          <section>
            <h2>Civilizations</h2>
            <div className="mod-list">
              {world.civilizations.map((civ) => (
                <div key={civ.id} className="mod-card">
                  <strong>{civ.name}</strong>
                  <small>Pop: {civ.populationIds.length}</small>
                  <span>Food: {civ.resources.food} · Wood: {civ.resources.wood} · Stone: {civ.resources.stone}</span>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2>Hybrid abilities</h2>
            <div className="mod-list">
              {world.hybridAbilities.length === 0 ? (
                <div className="mod-card">No hybrid abilities catalogued yet.</div>
              ) : (
                world.hybridAbilities.map((h) => (
                  <div key={h.id} className="mod-card">
                    <strong>{h.name}</strong>
                    <small>{h.energyTypes.join(' + ')}</small>
                    <span>{h.description}</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section>
            <h2>Mods</h2>
            <div className="mod-list">
              {modCatalog.map((mod) => {
                const active = getActiveModIds();
                const checked = active.includes(mod.id);
                return (
                  <label key={mod.id} className="mod-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <strong>{mod.name}</strong>
                      <small style={{ display: 'block' }}>{mod.energyType}</small>
                      <span>{mod.description}</span>
                    </div>
                    <div>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => {
                          const current = getActiveModIds();
                          const next = checked ? current.filter((id) => id !== mod.id) : [...current, mod.id];
                          setActiveModIds(next);
                          if (engineRef.current) engineRef.current.applyModDefinitions(next, modCatalog as any);
                        }}
                      />
                    </div>
                  </label>
                );
              })}
            </div>

            <ModEditor />
          </section>
        </aside>

        <section className="panel main-panel">
          <PhaserGame world={world} onSelectPerson={setSelectedPersonId} />
        </section>

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
                <li><span>Known abilities</span><strong>{selectedPerson.knownAbilities?.length ?? 0}</strong></li>
              </ul>
              {selectedPerson.knownAbilities && selectedPerson.knownAbilities.length > 0 && (
                <div style={{ marginTop: 10 }}>
                  <h4>Abilities</h4>
                  <ul>
                    {selectedPerson.knownAbilities.map((abId) => {
                      const ab = world.hybridAbilities.find((h) => h.id === abId);
                      return (
                        <li key={abId} title={ab?.description}>{ab?.name ?? abId}</li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p>No inhabitants selected.</p>
          )}

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

      <section className="panel" style={{ marginTop: 18 }}>
        <h2>Chronicle</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3>Timeline</h3>
            {world.chronicle.slice().reverse().slice(0, 40).map((h) => (
              <div key={h.id} style={{ padding: 8, borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
                <strong>{h.tick}: {h.title}</strong>
                <div style={{ fontSize: 12 }}>{h.description}</div>
              </div>
            ))}
          </div>
          <div style={{ width: 320 }}>
            <h3>Notable figures</h3>
            {world.figures.length === 0 ? (
              <div className="mod-card">No notable figures yet.</div>
            ) : (
              world.figures.map((f) => (
                <div key={f.id} className="mod-card">
                  <strong>{f.id}</strong>
                  <small>Score: {f.score}</small>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
