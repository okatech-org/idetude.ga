// Types pour la configuration des classes par niveau

export interface ClassConfig {
  id: string;
  levelId: string;
  name: string; // ex: "A", "B", "C", ou nom personnalisé
  capacity?: number;
  room?: string;
  sections?: string[]; // sections linguistiques associées
}

export interface LevelClassesConfig {
  levelId: string;
  classes: ClassConfig[];
}

export interface ClassPreset {
  id: string;
  label: string;
  description: string;
  pattern: string; // Pattern pour générer les noms: "alpha" pour A,B,C | "numeric" pour 1,2,3 | "custom"
  defaultCount: number;
  icon: string;
}

// Pré-configurations par système éducatif - basées sur le PATTERN de nommage uniquement
export const CLASS_PRESETS_BY_SYSTEM: Record<string, ClassPreset[]> = {
  francophone: [
    { id: "alpha", label: "Alphabétique (A, B, C...)", description: "Nommage alphabétique", pattern: "alpha", defaultCount: 0, icon: "🔤" },
    { id: "numeric", label: "Numérique (1, 2, 3...)", description: "Numérotation simple", pattern: "numeric", defaultCount: 0, icon: "🔢" },
  ],
  britannique: [
    { id: "alpha", label: "Forms (A, B, C...)", description: "Form system", pattern: "alpha", defaultCount: 0, icon: "🇬🇧" },
    { id: "house", label: "Houses (Red, Blue...)", description: "House system", pattern: "house", defaultCount: 0, icon: "🏠" },
  ],
  americain: [
    { id: "numeric_padded", label: "Sections (01, 02, 03...)", description: "Numbered sections", pattern: "numeric_padded", defaultCount: 0, icon: "🇺🇸" },
    { id: "numeric", label: "Numérique (1, 2, 3...)", description: "Simple numbering", pattern: "numeric", defaultCount: 0, icon: "🔢" },
  ],
  ib: [
    { id: "alpha", label: "Groups (A, B, C...)", description: "Standard IB grouping", pattern: "alpha", defaultCount: 0, icon: "🌐" },
  ],
  // Preset par défaut pour tous les systèmes
  default: [
    { id: "alpha", label: "Alphabétique (A, B, C...)", description: "Nommage alphabétique", pattern: "alpha", defaultCount: 0, icon: "🔤" },
    { id: "numeric", label: "Numérique (1, 2, 3...)", description: "Numérotation simple", pattern: "numeric", defaultCount: 0, icon: "🔢" },
    { id: "numeric_padded", label: "Numérique (01, 02, 03...)", description: "Numérotation avec zéro", pattern: "numeric_padded", defaultCount: 0, icon: "🔢" },
    { id: "roman", label: "Romain (I, II, III...)", description: "Chiffres romains", pattern: "roman", defaultCount: 0, icon: "🏛️" },
    { id: "custom", label: "Personnalisé", description: "Définir manuellement chaque classe", pattern: "custom", defaultCount: 0, icon: "✏️" },
  ],
};

// Génération de noms de classes selon le pattern
export const generateClassNames = (pattern: string, count: number): string[] => {
  const names: string[] = [];
  
  switch (pattern) {
    case "alpha":
      for (let i = 0; i < count; i++) {
        names.push(String.fromCharCode(65 + i)); // A, B, C, D...
      }
      break;
    case "numeric":
      for (let i = 1; i <= count; i++) {
        names.push(String(i)); // 1, 2, 3...
      }
      break;
    case "numeric_padded":
      for (let i = 1; i <= count; i++) {
        names.push(String(i).padStart(2, "0")); // 01, 02, 03...
      }
      break;
    case "roman":
      const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];
      for (let i = 0; i < Math.min(count, romans.length); i++) {
        names.push(romans[i]);
      }
      break;
    case "house":
      const houses = ["Red", "Blue", "Green", "Yellow", "Purple", "Orange"];
      for (let i = 0; i < Math.min(count, houses.length); i++) {
        names.push(houses[i]);
      }
      break;
    default:
      // Custom - return empty, user will define
      break;
  }
  
  return names;
};

// Générer un ID unique pour une classe
export const generateClassId = (): string => {
  return `class_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

// Obtenir les presets disponibles pour un système éducatif donné
export const getPresetsForSystem = (educationSystems: string[]): ClassPreset[] => {
  const presets: ClassPreset[] = [];
  const addedIds = new Set<string>();
  
  // Ajouter les presets spécifiques à chaque système
  educationSystems.forEach(system => {
    const systemPresets = CLASS_PRESETS_BY_SYSTEM[system] || [];
    systemPresets.forEach(preset => {
      if (!addedIds.has(preset.id)) {
        presets.push(preset);
        addedIds.add(preset.id);
      }
    });
  });
  
  // Ajouter les presets par défaut
  CLASS_PRESETS_BY_SYSTEM.default.forEach(preset => {
    if (!addedIds.has(preset.id)) {
      presets.push(preset);
      addedIds.add(preset.id);
    }
  });
  
  return presets;
};
