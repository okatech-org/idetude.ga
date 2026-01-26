// Constantes pour la création d'établissement

export const EDUCATION_CYCLES = {
  maternelle: {
    label: "Maternelle",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    levels: [
      { id: "ps", label: "Petite Section (PS)", short: "PS" },
      { id: "ms", label: "Moyenne Section (MS)", short: "MS" },
      { id: "gs", label: "Grande Section (GS)", short: "GS" },
    ]
  },
  primaire: {
    label: "Primaire",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    levels: [
      { id: "cp", label: "Cours Préparatoire (CP)", short: "CP" },
      { id: "ce1", label: "Cours Élémentaire 1 (CE1)", short: "CE1" },
      { id: "ce2", label: "Cours Élémentaire 2 (CE2)", short: "CE2" },
      { id: "cm1", label: "Cours Moyen 1 (CM1)", short: "CM1" },
      { id: "cm2", label: "Cours Moyen 2 (CM2)", short: "CM2" },
    ]
  },
  college: {
    label: "Collège",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    levels: [
      { id: "6eme", label: "Sixième (6ème)", short: "6ème" },
      { id: "5eme", label: "Cinquième (5ème)", short: "5ème" },
      { id: "4eme", label: "Quatrième (4ème)", short: "4ème" },
      { id: "3eme", label: "Troisième (3ème)", short: "3ème" },
    ]
  },
  lycee: {
    label: "Lycée",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    levels: [
      { id: "2nde", label: "Seconde (2nde)", short: "2nde" },
      { id: "1ere", label: "Première (1ère)", short: "1ère" },
      { id: "tle", label: "Terminale (Tle)", short: "Tle" },
    ]
  },
  technique: {
    label: "Technique/Professionnel",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    levels: [
      { id: "cap1", label: "CAP 1ère année", short: "CAP1" },
      { id: "cap2", label: "CAP 2ème année", short: "CAP2" },
      { id: "bep1", label: "BEP 1ère année", short: "BEP1" },
      { id: "bep2", label: "BEP 2ème année", short: "BEP2" },
      { id: "bac_pro1", label: "Bac Pro 1ère année", short: "BacPro1" },
      { id: "bac_pro2", label: "Bac Pro 2ème année", short: "BacPro2" },
      { id: "bac_pro3", label: "Bac Pro 3ème année", short: "BacPro3" },
    ]
  },
  superieur: {
    label: "Études Supérieures",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    levels: [
      { id: "l1", label: "Licence 1 (L1)", short: "L1" },
      { id: "l2", label: "Licence 2 (L2)", short: "L2" },
      { id: "l3", label: "Licence 3 (L3)", short: "L3" },
      { id: "m1", label: "Master 1 (M1)", short: "M1" },
      { id: "m2", label: "Master 2 (M2)", short: "M2" },
      { id: "d1", label: "Doctorat 1ère année", short: "D1" },
      { id: "d2", label: "Doctorat 2ème année", short: "D2" },
      { id: "d3", label: "Doctorat 3ème année", short: "D3" },
      { id: "bts1", label: "BTS 1ère année", short: "BTS1" },
      { id: "bts2", label: "BTS 2ème année", short: "BTS2" },
      { id: "dut1", label: "DUT/BUT 1ère année", short: "DUT1" },
      { id: "dut2", label: "DUT/BUT 2ème année", short: "DUT2" },
      { id: "dut3", label: "DUT/BUT 3ème année", short: "DUT3" },
    ]
  }
};

export const ESTABLISHMENT_TYPES = [
  { value: "maternelle", label: "Maternelle", defaultCycles: ["maternelle"], icon: "🏒" },
  { value: "primaire", label: "École Primaire", defaultCycles: ["primaire"], icon: "📚" },
  { value: "college", label: "Collège", defaultCycles: ["college"], icon: "🎓" },
  { value: "lycee", label: "Lycée", defaultCycles: ["lycee"], icon: "📖" },
  { value: "superieur", label: "Enseignement Supérieur", defaultCycles: ["superieur"], icon: "🎓" },
  { value: "universite", label: "Université", defaultCycles: ["superieur"], icon: "🏛️" },
];

export const TYPE_QUALIFICATIONS: Record<string, string[]> = {
  maternelle: [
    "Bilingue", "Montessori", "Catholique", "Islamique", "Protestante", 
    "Internationale", "Publique", "Privée", "Conventionnée", "Laïque"
  ],
  primaire: [
    "Bilingue", "Catholique", "Islamique", "Protestante", "Internationale", 
    "d'Application", "Publique", "Privée", "Conventionnée", "Laïque",
    "d'Excellence", "Pilote", "Expérimentale"
  ],
  college: [
    "Général", "Technique", "Catholique", "Islamique", "Protestante", 
    "International", "Bilingue", "Public", "Privé", "Conventionné",
    "d'Excellence", "Pilote", "d'Enseignement Général"
  ],
  lycee: [
    "Général", "Technique", "Professionnel", "Scientifique", "Littéraire",
    "Économique", "Agricole", "Hôtelier", "Maritime", "Industriel",
    "Commercial", "Artistique", "Sportif", "Militaire",
    "Catholique", "Islamique", "Protestante", "International", "Bilingue",
    "Public", "Privé", "Conventionné", "d'Excellence", "Polyvalent"
  ],
  superieur: [
    "Technique", "Professionnel", "Commerce", "Ingénierie", "Santé",
    "Agriculture", "Arts", "Communication", "Informatique", "Gestion",
    "Tourisme", "Hôtellerie", "Paramédical", "Social", "Pédagogique"
  ],
  universite: [
    "Sciences", "Lettres", "Droit", "Médecine", "Polytechnique",
    "Économie", "Gestion", "Sciences Humaines", "Sciences Sociales",
    "Ingénierie", "Agronomie", "Pharmacie", "Odontologie", "Vétérinaire",
    "Arts", "Théologie", "Pédagogique", "Technologique"
  ],
};

export const EDUCATION_SYSTEM_CATEGORIES = [
  {
    id: "francophone",
    label: "Francophones",
    icon: "🇫🇷",
    systems: [
      { value: "francophone", label: "Francophone (France)", icon: "🇫🇷", description: "Baccalauréat français (BEPC, BAC)", mainLanguage: "fr" },
      { value: "belge", label: "Belge", icon: "🇧🇪", description: "Système belge francophone", mainLanguage: "fr" },
      { value: "suisse", label: "Suisse", icon: "🇨🇭", description: "Maturité suisse / Certificat fédéral", mainLanguage: "fr" },
      { value: "canadien_fr", label: "Canadien Francophone", icon: "🇨🇦", description: "Système québécois (DES, DEC)", mainLanguage: "fr" },
    ]
  },
  {
    id: "anglophone",
    label: "Anglophones",
    icon: "🇬🇧",
    systems: [
      { value: "britannique", label: "Britannique", icon: "🇬🇧", description: "GCSE, IGCSE, A-Levels, O-Levels", mainLanguage: "en" },
      { value: "americain", label: "Américain", icon: "🇺🇸", description: "High School Diploma, AP, SAT/ACT", mainLanguage: "en" },
      { value: "canadien_en", label: "Canadien Anglophone", icon: "🇨🇦", description: "Système canadien anglophone", mainLanguage: "en" },
      { value: "australien", label: "Australien", icon: "🇦🇺", description: "HSC, VCE, ATAR", mainLanguage: "en" },
    ]
  },
  {
    id: "international",
    label: "Internationaux",
    icon: "🌐",
    systems: [
      { value: "ib", label: "Baccalauréat International (IB)", icon: "🌐", description: "Programme IB (PYP, MYP, DP)", mainLanguage: "multi" },
      { value: "cambridge", label: "Cambridge International", icon: "📚", description: "Cambridge IGCSE, AS/A Level", mainLanguage: "en" },
    ]
  },
];

export const EDUCATION_SYSTEMS = EDUCATION_SYSTEM_CATEGORIES.flatMap(cat => cat.systems);

export const LANGUAGES = [
  { value: "fr", label: "Français", icon: "🇫🇷" },
  { value: "en", label: "Anglais", icon: "🇬🇧" },
  { value: "ar", label: "Arabe", icon: "🇸🇦" },
  { value: "es", label: "Espagnol", icon: "🇪🇸" },
  { value: "de", label: "Allemand", icon: "🇩🇪" },
  { value: "zh", label: "Chinois (Mandarin)", icon: "🇨🇳" },
  { value: "pt", label: "Portugais", icon: "🇵🇹" },
  { value: "it", label: "Italien", icon: "🇮🇹" },
  { value: "sw", label: "Swahili", icon: "🇰🇪" },
  { value: "local", label: "Langue locale", icon: "🌍" },
];

export const COUNTRIES = [
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "CD", name: "République Démocratique du Congo", flag: "🇨🇩" },
  { code: "CG", name: "République du Congo", flag: "🇨🇬" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", flag: "🇨🇭" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

export const OPTIONS_LYCEE = [
  "Série A (Littéraire)",
  "Série B (Économique)",
  "Série C (Scientifique Math)",
  "Série D (Scientifique Bio)",
  "Série S (Scientifique)",
  "Série ES (Économique et Social)",
  "Série L (Littéraire)",
  "Série STI2D",
  "Série STMG",
  "Série STL",
  "Série ST2S",
];

// Helper functions
export const getTeachingLanguagesFromSystems = (educationSystems: string[]): string[] => {
  const languages = new Set<string>();
  educationSystems.forEach(sysValue => {
    const system = EDUCATION_SYSTEMS.find(s => s.value === sysValue);
    if (system?.mainLanguage && system.mainLanguage !== "multi") {
      languages.add(system.mainLanguage);
    }
  });
  return Array.from(languages);
};

export const getLanguageDesignation = (
  educationSystems: string[], 
  additionalTeachingLanguages: string[]
): { label: string; icon: string; totalLanguages: number } | null => {
  const systemLanguages = getTeachingLanguagesFromSystems(educationSystems);
  const allTeachingLanguages = new Set([...systemLanguages, ...additionalTeachingLanguages]);
  const totalLanguages = allTeachingLanguages.size;
  const isMixedSystem = educationSystems.length > 1;
  
  if (totalLanguages === 1) {
    return isMixedSystem ? { label: "Mixte / Hybride", icon: "🔀", totalLanguages } : null;
  }
  if (totalLanguages === 2) {
    return { label: isMixedSystem ? "Mixte Bilingue" : "Bilingue", icon: "🌍", totalLanguages };
  }
  if (totalLanguages === 3) {
    return { label: isMixedSystem ? "Mixte Trilingue" : "Trilingue", icon: "🌐", totalLanguages };
  }
  if (totalLanguages > 3) {
    return { label: isMixedSystem ? "Mixte Multilingue" : "Multilingue", icon: "🌐", totalLanguages };
  }
  return null;
};

export const getSelectedLevelsDisplay = (selectedLevels: string[]) => {
  const levels: string[] = [];
  Object.entries(EDUCATION_CYCLES).forEach(([_, cycle]) => {
    cycle.levels.forEach(level => {
      if (selectedLevels.includes(level.id)) {
        levels.push(level.short);
      }
    });
  });
  return levels.join(", ") || "Aucun niveau sélectionné";
};
