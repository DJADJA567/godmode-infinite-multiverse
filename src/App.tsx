import { useEffect, useRef, useState } from 'react';
import PhaserGame from './game/PhaserGame';
import { SimulationEngine } from './simulation/engine';
import { generateWorld, getWorldSnapshot } from './simulation/world';
import type { WorldState } from './simulation/types';
import { getModCatalog, loadModDefinitions } from './simulation/mods';

const initialWorld = generateWorld(42, 22, 16);

export default function App() {
  const engineRef = useRef<SimulationEngine | null>(null);
  const [world, setWorld] = useState<WorldState>(initialWorld);
  const [selectedPersonId, setSelectedPersonId] = useState<string | null>(null);
  const [modCatalog, setModCatalog] = useState(getModCatalog());

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

  useEffect(() => {
    const activeMods = loadModDefinitions();
    setModCatalog(activeMods);
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
            <h2>Active mods</h2>
            <div className="mod-list">
              {modCatalog.map((mod) => (
                <div key={mod.id} className="mod-card">
                  <strong>{mod.name}</strong>
                  <small>{mod.energyType}</small>
                  <span>{mod.description}</span>
                </div>
              ))}
            </div>
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
              </ul>
            </div>
          ) : (
            <p>No inhabitants selected.</p>
          )}

          <div className="timeline-mini">
            <h3>Simulation log</h3>
            {world.people.slice(0, 4).map((person) => (
              <div key={person.id} className="log-item">
                <button type="button" onClick={() => setSelectedPersonId(person.id)}>{person.name}</button>
                <span>{person.goal}</span>
              </div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  );
}
