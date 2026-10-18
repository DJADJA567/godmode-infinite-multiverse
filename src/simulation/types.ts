export type TileType = 'grass' | 'forest' | 'water' | 'mountain' | 'desert';
export type ResourceType = 'food' | 'wood' | 'stone' | 'energy';
export type Job = 'gatherer' | 'builder' | 'explorer' | 'warrior';

export interface WorldTile {
  x: number;
  y: number;
  type: TileType;
  resource: ResourceType | null;
  fertility: number;
}

export interface Person {
  id: string;
  name: string;
  x: number;
  y: number;
  health: number;
  hunger: number;
  energy: number;
  job: Job;
  goal: string;
  personality: string;
  homeId: string | null;
}

export interface Building {
  id: string;
  x: number;
  y: number;
  type: 'camp' | 'hut' | 'tower';
}

export interface EnergySystem {
  id: string;
  name: string;
  description: string;
  energyType: string;
  compatibility: string[];
}

export interface WorldState {
  width: number;
  height: number;
  seed: number;
  tick: number;
  tiles: WorldTile[];
  people: Person[];
  buildings: Building[];
  systems: EnergySystem[];
}
