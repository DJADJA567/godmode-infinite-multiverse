export interface ModDefinition {
  id: string;
  name: string;
  description: string;
  energyType: string;
  compatibility: string[];
}

const builtInMods: ModDefinition[] = [
  {
    id: 'ki-system',
    name: 'Ki System',
    description: 'Martial energy derived from willpower, focus, and training.',
    energyType: 'ki',
    compatibility: ['chakra', 'spirit'],
  },
  {
    id: 'chakra-system',
    name: 'Chakra System',
    description: 'Spiritual energy flowing through body and technique.',
    energyType: 'chakra',
    compatibility: ['ki', 'spirit'],
  },
];

export function getModCatalog(): ModDefinition[] {
  return builtInMods;
}

export function loadModDefinitions(): ModDefinition[] {
  return builtInMods;
}

export function validateMods(mods: ModDefinition[]) {
  return mods.filter((mod) => Boolean(mod.id && mod.name && mod.energyType));
}
