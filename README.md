# GODMODE: Infinite Multiverse

A modular 2D simulation prototype inspired by civilization sandbox games, autonomous NPCs, resource loops, and energy systems.

## Features
- Procedural world generation
- Autonomous people with goals, hunger, movement, gathering, and construction
- Resource economy and simple building loop
- Save/load via local storage
- Modular energy system compatibility layer
- Two demo mods: Ki and Chakra
- React + Vite + Phaser foundation for future expansion

## Getting started

```bash
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
```

## Test

```bash
npm run test
```

## Project structure

```text
src/
  App.tsx
  main.tsx
  styles.css
  game/
    PhaserGame.tsx
  simulation/
    types.ts
    world.ts
    engine.ts
    mods.ts
    fusion.ts
public/
  mods/
    ki-system.json
    chakra-system.json
```

## Roadmap

Phase 1 complete in this prototype:
- world generation
- autonomous character behavior
- resource gathering
- building construction
- simulation tick loop
- save/load state
- mod loading and compatibility layer

Future phases include larger civ simulation, diplomacy, combat, timeline, and richer mod tooling.
