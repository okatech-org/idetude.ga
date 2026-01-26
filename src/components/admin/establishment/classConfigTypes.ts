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

// Pré-configurations par système éducatif
export const CLASS_PRESETS_BY_SYSTEM: Record<string, ClassPreset[]> = {
  francophone: [
    { id: "alpha_3", label: "Alphabétique (A, B, C)", description: "3 classes par niveau", pattern: "alpha", defaultCount: 3, icon: "🔤" },
    { id: "alpha_5", label: "Alphabétique (A-E)", description: "5 classes par niveau", pattern: "alpha", defaultCount: 5, icon: "🔤" },
    { id: "numeric_3", label: "Numérique (1, 2, 3)", description: "3 classes par niveau", pattern: "numeric", defaultCount: 3, icon: "🔢" },
  ],
  britannique: [
    { id: "form_alpha", label: "Forms (A, B, C)", description: "Form system", pattern: "alpha", defaultCount: 4, icon: "🇬🇧" },
    { id: "house", label: "Houses", description: "House system (Red, Blue...)", pattern: "custom", defaultCount: 4, icon: "🏠" },
  ],
  americain: [
    { id: "section_num", label: "Sections (01, 02, 03)", description: "Numbered sections", pattern: "numeric_padded", defaultCount: 5, icon: "🇺🇸" },
    { id: "period", label: "Periods", description: "Period-based classes", pattern: "numeric", defaultCount: 6, icon: "⏰" },
  ],
  ib: [
    { id: "ib_groups", label: "IB Groups (A, B)", description: "Standard IB grouping", pattern: "alpha", defaultCount: 2, icon: "🌐" },
  ],
  // Preset par défaut pour tous les systèmes
  default: [
    { id: "alpha_single", label: "Classe unique", description: "Une seule classe par niveau", pattern: "alpha", defaultCount: 1, icon: "1️⃣" },
    { id: "alpha_2", label: "Deux classes (A, B)", description: "2 classes par niveau", pattern: "alpha", defaultCount: 2, icon: "2️⃣" },
    { id: "alpha_3_default", label: "Trois classes (A, B, C)", description: "3 classes par niveau", pattern: "alpha", defaultCount: 3, icon: "3️⃣" },
    { id: "alpha_4", label: "Quatre classes (A-D)", description: "4 classes par niveau", pattern: "alpha", defaultCount: 4, icon: "4️⃣" },
    { id: "alpha_6", label: "Six classes (A-F)", description: "6 classes par niveau", pattern: "alpha", defaultCount: 6, icon: "6️⃣" },
    { id: "numeric_standard", label: "Numérique (1, 2, 3...)", description: "Numérotation simple", pattern: "numeric", defaultCount: 3, icon: "🔢" },
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
