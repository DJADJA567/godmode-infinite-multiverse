import React, { useEffect, useState } from 'react';
import type { ModDefinition } from '../simulation/types';
import { listCustomMods, saveCustomMod, deleteCustomMod } from '../simulation/mods';

export default function ModEditor() {
  const [mods, setMods] = useState<ModDefinition[]>([]);
  const [editing, setEditing] = useState<ModDefinition | null>(null);

  useEffect(() => {
    setMods(listCustomMods());
  }, []);

  useEffect(() => {
    const handler = () => setMods(listCustomMods());
    window.addEventListener('godmode:modsChanged', handler);
    return () => window.removeEventListener('godmode:modsChanged', handler);
  }, []);

  function startNew() {
    setEditing({ id: `custom-${Date.now()}`, name: 'New Mod', description: '', energyType: 'custom', compatibility: [], dependencies: [], provides: { systems: [] } } as any);
  }

  function save() {
    if (!editing) return;
    try {
      saveCustomMod(editing as any);
      setEditing(null);
      setMods(listCustomMods());
      alert('Mod saved to local storage. Use the Mods panel to activate it.');
    } catch (err) {
      alert('Failed to save mod');
    }
  }

  function remove(id: string) {
    if (!confirm('Delete mod?')) return;
    deleteCustomMod(id);
    setMods(listCustomMods());
  }

  return (
    <div style={{ marginTop: 12 }}>
      <h3>Mod Editor (local)</h3>
      <p>Create and edit mods saved locally in your browser. They will appear in the Mods list.</p>
      <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <button type="button" onClick={startNew}>New mod</button>
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {mods.map((m) => (
          <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 8, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }}>
            <div>
              <strong>{m.name}</strong>
              <div style={{ fontSize: 12 }}>{m.energyType} • {m.id}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" onClick={() => setEditing(m)}>Edit</button>
              <button type="button" onClick={() => remove(m.id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <div style={{ marginTop: 12, padding: 12, borderRadius: 8, background: 'rgba(255,255,255,0.02)' }}>
          <h4>Editing {editing.id}</h4>
          <label style={{ display: 'block' }}>
            ID
            <input value={editing.id} onChange={(e) => setEditing({ ...editing, id: e.target.value } as any)} />
          </label>
          <label style={{ display: 'block' }}>
            Name
            <input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value } as any)} />
          </label>
          <label style={{ display: 'block' }}>
            Energy Type
            <input value={(editing as any).energyType} onChange={(e) => setEditing({ ...editing, energyType: e.target.value } as any)} />
          </label>
          <label style={{ display: 'block' }}>
            Description
            <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value } as any)} />
          </label>

          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" onClick={save}>Save</button>
            <button type="button" onClick={() => setEditing(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
