import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, MapPin, Users, GraduationCap, School, Navigation, Loader2, MapPinned, AlertCircle, Map, Search, ChevronDown, ChevronRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocationPickerMap } from "./LocationPickerMap";
interface CreateEstablishmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  groupId?: string | null;
}

interface EstablishmentGroup {
  id: string;
  name: string;
}

// Définition complète des cycles et niveaux scolaires
const EDUCATION_CYCLES = {
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

// Types d'établissements avec leurs cycles associés par défaut
const ESTABLISHMENT_TYPES = [
  { value: "maternelle", label: "Maternelle", defaultCycles: ["maternelle"], icon: "🏒" },
  { value: "primaire", label: "École Primaire", defaultCycles: ["primaire"], icon: "📚" },
  { value: "college", label: "Collège", defaultCycles: ["college"], icon: "🎓" },
  { value: "lycee", label: "Lycée", defaultCycles: ["lycee"], icon: "📖" },
  { value: "superieur", label: "Enseignement Supérieur", defaultCycles: ["superieur"], icon: "🎓" },
  { value: "universite", label: "Université", defaultCycles: ["superieur"], icon: "🏛️" },
];

// Qualifications disponibles pour chaque type (sélection uniquement)
const TYPE_QUALIFICATIONS: Record<string, string[]> = {
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

// Catégories de systèmes éducatifs par région
const EDUCATION_SYSTEM_CATEGORIES = [
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
      { value: "neo_zelandais", label: "Néo-Zélandais", icon: "🇳🇿", description: "NCEA (National Certificate)", mainLanguage: "en" },
      { value: "irlandais", label: "Irlandais", icon: "🇮🇪", description: "Leaving Certificate", mainLanguage: "en" },
      { value: "sud_africain", label: "Sud-Africain", icon: "🇿🇦", description: "National Senior Certificate (NSC)", mainLanguage: "en" },
    ]
  },
  {
    id: "international",
    label: "Internationaux",
    icon: "🌐",
    systems: [
      { value: "ib", label: "Baccalauréat International (IB)", icon: "🌐", description: "Programme IB (PYP, MYP, DP)", mainLanguage: "multi" },
      { value: "cambridge", label: "Cambridge International", icon: "📚", description: "Cambridge IGCSE, AS/A Level", mainLanguage: "en" },
      { value: "wassce", label: "WASSCE (Afrique de l'Ouest)", icon: "🌍", description: "West African Senior School Certificate", mainLanguage: "en" },
    ]
  },
  {
    id: "germanique",
    label: "Germaniques",
    icon: "🇩🇪",
    systems: [
      { value: "allemand", label: "Allemand", icon: "🇩🇪", description: "Abitur, Realschulabschluss", mainLanguage: "de" },
      { value: "autrichien", label: "Autrichien", icon: "🇦🇹", description: "Matura autrichienne", mainLanguage: "de" },
    ]
  },
  {
    id: "hispanique",
    label: "Hispaniques / Lusophones",
    icon: "🇪🇸",
    systems: [
      { value: "espagnol", label: "Espagnol", icon: "🇪🇸", description: "Bachillerato, Selectividad/EBAU", mainLanguage: "es" },
      { value: "mexicain", label: "Mexicain", icon: "🇲🇽", description: "Bachillerato mexicain", mainLanguage: "es" },
      { value: "portugais", label: "Portugais", icon: "🇵🇹", description: "Ensino Secundário", mainLanguage: "pt" },
      { value: "bresilien", label: "Brésilien", icon: "🇧🇷", description: "ENEM, Vestibular", mainLanguage: "pt" },
    ]
  },
  {
    id: "asiatique",
    label: "Asiatiques",
    icon: "🌏",
    systems: [
      { value: "chinois", label: "Chinois", icon: "🇨🇳", description: "Gaokao, Zhongkao", mainLanguage: "zh" },
      { value: "japonais", label: "Japonais", icon: "🇯🇵", description: "Juken (examens d'entrée universitaire)", mainLanguage: "ja" },
      { value: "coreen", label: "Coréen", icon: "🇰🇷", description: "Suneung (CSAT)", mainLanguage: "ko" },
      { value: "indien", label: "Indien", icon: "🇮🇳", description: "CBSE, ICSE, ISC, State Boards", mainLanguage: "hi" },
      { value: "singapourien", label: "Singapourien", icon: "🇸🇬", description: "O-Level, A-Level singapourien", mainLanguage: "en" },
      { value: "hong_kong", label: "Hong Kong", icon: "🇭🇰", description: "HKDSE (Diploma of Secondary Education)", mainLanguage: "zh" },
      { value: "taiwanais", label: "Taïwanais", icon: "🇹🇼", description: "Système taïwanais", mainLanguage: "zh" },
      { value: "indonesien", label: "Indonésien", icon: "🇮🇩", description: "Ujian Nasional (UN)", mainLanguage: "id" },
      { value: "malaysien", label: "Malaisien", icon: "🇲🇾", description: "SPM, STPM", mainLanguage: "ms" },
      { value: "philippin", label: "Philippin", icon: "🇵🇭", description: "K-12 philippin", mainLanguage: "en" },
      { value: "vietnamien", label: "Vietnamien", icon: "🇻🇳", description: "Thi THPT Quốc gia", mainLanguage: "vi" },
      { value: "thailandais", label: "Thaïlandais", icon: "🇹🇭", description: "Système thaïlandais", mainLanguage: "th" },
    ]
  },
  {
    id: "arabe",
    label: "Arabes / Islamiques",
    icon: "🌙",
    systems: [
      { value: "arabe", label: "Arabe", icon: "🇸🇦", description: "Système arabe standard", mainLanguage: "ar" },
      { value: "islamique", label: "Islamique / Coranique", icon: "☪️", description: "Madrasah, Maktab, études islamiques", mainLanguage: "ar" },
      { value: "egyptien", label: "Égyptien", icon: "🇪🇬", description: "Thanaweya Amma", mainLanguage: "ar" },
      { value: "marocain", label: "Marocain", icon: "🇲🇦", description: "Baccalauréat marocain", mainLanguage: "ar" },
      { value: "algerien", label: "Algérien", icon: "🇩🇿", description: "BEF, Baccalauréat algérien", mainLanguage: "ar" },
      { value: "tunisien", label: "Tunisien", icon: "🇹🇳", description: "Baccalauréat tunisien", mainLanguage: "ar" },
      { value: "emirien", label: "Émirien (EAU)", icon: "🇦🇪", description: "Système des Émirats", mainLanguage: "ar" },
      { value: "iranien", label: "Iranien", icon: "🇮🇷", description: "Diplom, Konkoor", mainLanguage: "fa" },
    ]
  },
  {
    id: "europe_est",
    label: "Europe de l'Est / Slaves",
    icon: "🇷🇺",
    systems: [
      { value: "russe", label: "Russe", icon: "🇷🇺", description: "EGE (Examen d'État unifié)", mainLanguage: "ru" },
      { value: "polonais", label: "Polonais", icon: "🇵🇱", description: "Matura polonaise", mainLanguage: "pl" },
      { value: "tcheque", label: "Tchèque", icon: "🇨🇿", description: "Maturita tchèque", mainLanguage: "cs" },
      { value: "roumain", label: "Roumain", icon: "🇷🇴", description: "Bacalaureat roumain", mainLanguage: "ro" },
      { value: "ukrainien", label: "Ukrainien", icon: "🇺🇦", description: "ZNO (test externe)", mainLanguage: "uk" },
    ]
  },
  {
    id: "nordique",
    label: "Nordiques",
    icon: "❄️",
    systems: [
      { value: "finlandais", label: "Finlandais", icon: "🇫🇮", description: "Ylioppilastutkinto", mainLanguage: "fi" },
      { value: "suedois", label: "Suédois", icon: "🇸🇪", description: "Gymnasieexamen", mainLanguage: "sv" },
      { value: "norvegien", label: "Norvégien", icon: "🇳🇴", description: "Vitnemål (Certificat)", mainLanguage: "no" },
      { value: "danois", label: "Danois", icon: "🇩🇰", description: "Studentereksamen", mainLanguage: "da" },
    ]
  },
  {
    id: "autres",
    label: "Autres",
    icon: "🌍",
    systems: [
      { value: "italien", label: "Italien", icon: "🇮🇹", description: "Esame di Stato (Maturità)", mainLanguage: "it" },
      { value: "neerlandais", label: "Néerlandais", icon: "🇳🇱", description: "VWO, HAVO, VMBO", mainLanguage: "nl" },
      { value: "grec", label: "Grec", icon: "🇬🇷", description: "Apolitirio, Panellinies", mainLanguage: "el" },
      { value: "turc", label: "Turc", icon: "🇹🇷", description: "YKS, LGS", mainLanguage: "tr" },
      { value: "israelien", label: "Israélien", icon: "🇮🇱", description: "Bagrut", mainLanguage: "he" },
      { value: "pakistanais", label: "Pakistanais", icon: "🇵🇰", description: "Matriculation, Intermediate, O/A Levels", mainLanguage: "ur" },
      { value: "bangladais", label: "Bangladais", icon: "🇧🇩", description: "SSC, HSC", mainLanguage: "bn" },
      { value: "sri_lankais", label: "Sri Lankais", icon: "🇱🇰", description: "GCE O/L, GCE A/L", mainLanguage: "si" },
    ]
  },
];

// Flatten pour accès facile
const EDUCATION_SYSTEMS = EDUCATION_SYSTEM_CATEGORIES.flatMap(cat => cat.systems);

// Langues disponibles
const LANGUAGES = [
  { value: "fr", label: "Français", icon: "🇫🇷" },
  { value: "en", label: "Anglais", icon: "🇬🇧" },
  { value: "ar", label: "Arabe", icon: "🇸🇦" },
  { value: "es", label: "Espagnol", icon: "🇪🇸" },
  { value: "de", label: "Allemand", icon: "🇩🇪" },
  { value: "zh", label: "Chinois (Mandarin)", icon: "🇨🇳" },
  { value: "pt", label: "Portugais", icon: "🇵🇹" },
  { value: "ru", label: "Russe", icon: "🇷🇺" },
  { value: "ja", label: "Japonais", icon: "🇯🇵" },
  { value: "ko", label: "Coréen", icon: "🇰🇷" },
  { value: "it", label: "Italien", icon: "🇮🇹" },
  { value: "nl", label: "Néerlandais", icon: "🇳🇱" },
  { value: "tr", label: "Turc", icon: "🇹🇷" },
  { value: "hi", label: "Hindi", icon: "🇮🇳" },
  { value: "he", label: "Hébreu", icon: "🇮🇱" },
  { value: "sw", label: "Swahili", icon: "🇰🇪" },
  { value: "la", label: "Latin", icon: "📜" },
  { value: "gr", label: "Grec ancien", icon: "🏛️" },
  { value: "local", label: "Langue locale", icon: "🌍" },
];

// Helper pour obtenir les langues principales d'enseignement à partir des systèmes sélectionnés
const getTeachingLanguagesFromSystems = (educationSystems: string[]): string[] => {
  const languages = new Set<string>();
  educationSystems.forEach(sysValue => {
    const system = EDUCATION_SYSTEMS.find(s => s.value === sysValue);
    if (system?.mainLanguage && system.mainLanguage !== "multi") {
      languages.add(system.mainLanguage);
    }
  });
  return Array.from(languages);
};

// Helper pour déterminer le type linguistique basé sur les langues d'enseignement
const getLanguageDesignation = (
  educationSystems: string[], 
  additionalTeachingLanguages: string[]
): { label: string; icon: string; totalLanguages: number } | null => {
  // Langues d'enseignement provenant des systèmes
  const systemLanguages = getTeachingLanguagesFromSystems(educationSystems);
  
  // Combiner avec les langues d'enseignement additionnelles (sans doublons)
  const allTeachingLanguages = new Set([...systemLanguages, ...additionalTeachingLanguages]);
  const totalLanguages = allTeachingLanguages.size;
  
  // Déterminer si c'est un système mixte/hybride (plusieurs systèmes éducatifs)
  const isMixedSystem = educationSystems.length > 1;
  
  if (totalLanguages === 1) {
    return isMixedSystem 
      ? { label: "Mixte / Hybride", icon: "🔀", totalLanguages }
      : null;
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

interface TypeWithQualification {
  type: string;
  qualification: string;
}

const COUNTRIES = [
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "CD", name: "République Démocratique du Congo", flag: "🇨🇩" },
  { code: "CG", name: "République du Congo", flag: "🇨🇬" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "TG", name: "Togo", flag: "🇹🇬" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯" },
  { code: "GN", name: "Guinée", flag: "🇬🇳" },
  { code: "TD", name: "Tchad", flag: "🇹🇩" },
  { code: "CF", name: "République Centrafricaine", flag: "🇨🇫" },
  { code: "NE", name: "Niger", flag: "🇳🇪" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", flag: "🇨🇭" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

const OPTIONS_LYCEE = [
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

export const CreateEstablishmentModal = ({
  open,
  onOpenChange,
  onSuccess,
  groupId,
}: CreateEstablishmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<EstablishmentGroup[]>([]);
  const [activeTab, setActiveTab] = useState("info");
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoAddress, setGeoAddress] = useState<string | null>(null);
  const [systemSearchTerm, setSystemSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["francophone", "anglophone", "international"]);
  
  // Éléments pour le nom complet configurable
  type NameElement = 'type' | 'qualification' | 'designation' | 'name';
  
  const [form, setForm] = useState({
    name: "",
    educationSystems: [] as string[], // Multiple systems allowed
    additionalTeachingLanguages: [] as string[], // Langues d'enseignement additionnelles (détermine bilingue/trilingue)
    typesWithQualification: [] as TypeWithQualification[],
    address: "",
    phone: "",
    email: "",
    country_code: "GA",
    selectedLevels: [] as string[],
    group_id: groupId || null as string | null,
    options: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null,
    nameElementsOrder: ['type', 'qualification', 'designation', 'name'] as NameElement[], // Ordre configurable
  });
  
  // Langues d'enseignement dérivées des systèmes sélectionnés
  const systemTeachingLanguages = getTeachingLanguagesFromSystems(form.educationSystems);
  
  // Computed language designation
  const languageDesignation = getLanguageDesignation(form.educationSystems, form.additionalTeachingLanguages);
  
  // Filtrer les catégories et systèmes selon la recherche
  const filteredCategories = EDUCATION_SYSTEM_CATEGORIES.map(category => ({
    ...category,
    systems: category.systems.filter(system =>
      system.label.toLowerCase().includes(systemSearchTerm.toLowerCase()) ||
      system.description.toLowerCase().includes(systemSearchTerm.toLowerCase())
    )
  })).filter(category => category.systems.length > 0);
  
  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  // Génération automatique du code unique
  const generateUniqueCode = () => {
    const firstType = form.typesWithQualification[0]?.type || "ETB";
    const typePrefix = firstType.substring(0, 3).toUpperCase();
    const nameWords = form.name.trim().split(/\s+/);
    const nameInitials = nameWords
      .slice(0, 3)
      .map(word => word.charAt(0).toUpperCase())
      .join("");
    const countryCode = form.country_code.toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${typePrefix}-${nameInitials || "XXX"}-${countryCode}-${randomSuffix}`;
  };

  const fetchGroups = async () => {
    try {
      console.log("Fetching groups...");
      const { data, error } = await supabase
        .from("establishment_groups")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error("Error fetching groups:", error);
        return;
      }
      
      console.log("Groups fetched:", data);
      setGroups(data || []);
    } catch (err) {
      console.error("Exception fetching groups:", err);
    }
  };

  // Charger les groupes au montage et quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  // Mettre à jour les niveaux sélectionnés quand les types changent
  useEffect(() => {
    const defaultLevels: string[] = [];
    form.typesWithQualification.forEach(twq => {
      const estType = ESTABLISHMENT_TYPES.find(t => t.value === twq.type);
      if (estType) {
        estType.defaultCycles.forEach(cycle => {
          const cycleData = EDUCATION_CYCLES[cycle as keyof typeof EDUCATION_CYCLES];
          if (cycleData) {
            cycleData.levels.forEach(level => {
              if (!defaultLevels.includes(level.id)) {
                defaultLevels.push(level.id);
              }
            });
          }
        });
      }
    });
    setForm(prev => ({ ...prev, selectedLevels: defaultLevels }));
  }, [JSON.stringify(form.typesWithQualification)]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      fetchGroups();
      setActiveTab("info");
      setGeoError(null);
      setGeoAddress(null);
      setSystemSearchTerm("");
      setExpandedCategories(["francophone", "anglophone", "international"]);
      setForm({
        name: "",
        educationSystems: [],
        additionalTeachingLanguages: [],
        typesWithQualification: [],
        address: "",
        phone: "",
        email: "",
        country_code: "GA",
        selectedLevels: [],
        group_id: groupId || null,
        options: [],
        latitude: null,
        longitude: null,
        nameElementsOrder: ['type', 'qualification', 'designation', 'name'],
      });
    }
    onOpenChange(isOpen);
  };

  // Reverse geocoding pour obtenir l'adresse à partir des coordonnées
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await response.json();
      if (data.address) {
        // Formater l'adresse au format standard français
        const addr = data.address;
        const parts: string[] = [];
        
        // Numéro + Rue
        const streetNumber = addr.house_number || '';
        const street = addr.road || addr.street || addr.pedestrian || '';
        if (streetNumber && street) {
          parts.push(`${streetNumber} ${street}`);
        } else if (street) {
          parts.push(street);
        }
        
        // Ville (prendre la première disponible)
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || '';
        if (city) {
          parts.push(city);
        }
        
        // Code postal
        const postcode = addr.postcode || '';
        if (postcode) {
          parts.push(postcode);
        }
        
        // Pays
        const country = addr.country || '';
        if (country) {
          parts.push(country);
        }
        
        const formattedAddress = parts.join(', ');
        setGeoAddress(formattedAddress);
        // Pré-remplir automatiquement l'adresse complète
        setForm(prev => ({ ...prev, address: formattedAddress }));
      }
    } catch (error) {
      console.error("Erreur de géocodage inverse:", error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          latitude,
          longitude,
        }));
        setGeoLoading(false);
        toast.success("Position GPS capturée avec succès");
        // Récupérer l'adresse correspondante
        await reverseGeocode(latitude, longitude);
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Vous avez refusé l'accès à votre position. Veuillez autoriser la géolocalisation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Les informations de localisation ne sont pas disponibles.");
            break;
          case error.TIMEOUT:
            setGeoError("La demande de localisation a expiré. Réessayez.");
            break;
          default:
            setGeoError("Une erreur inconnue s'est produite.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const clearLocation = () => {
    setForm(prev => ({ ...prev, latitude: null, longitude: null }));
    setGeoAddress(null);
    setGeoError(null);
  };

  // Handler pour la sélection sur la carte
  const handleMapLocationChange = async (lat: number, lng: number) => {
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
    toast.success("Position sélectionnée sur la carte");
    await reverseGeocode(lat, lng);
  };

  const toggleLevel = (levelId: string) => {
    setForm(prev => ({
      ...prev,
      selectedLevels: prev.selectedLevels.includes(levelId)
        ? prev.selectedLevels.filter(l => l !== levelId)
        : [...prev.selectedLevels, levelId]
    }));
  };

  const toggleCycle = (cycleKey: string) => {
    const cycle = EDUCATION_CYCLES[cycleKey as keyof typeof EDUCATION_CYCLES];
    if (!cycle) return;
    
    const cycleLevelIds = cycle.levels.map(l => l.id);
    const allSelected = cycleLevelIds.every(id => form.selectedLevels.includes(id));
    
    if (allSelected) {
      setForm(prev => ({
        ...prev,
        selectedLevels: prev.selectedLevels.filter(id => !cycleLevelIds.includes(id))
      }));
    } else {
      setForm(prev => ({
        ...prev,
        selectedLevels: [...new Set([...prev.selectedLevels, ...cycleLevelIds])]
      }));
    }
  };

  const toggleOption = (option: string) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.includes(option)
        ? prev.options.filter(o => o !== option)
        : [...prev.options, option]
    }));
  };

  const getSelectedLevelsDisplay = () => {
    const levels: string[] = [];
    Object.entries(EDUCATION_CYCLES).forEach(([_, cycle]) => {
      cycle.levels.forEach(level => {
        if (form.selectedLevels.includes(level.id)) {
          levels.push(level.short);
        }
      });
    });
    return levels.join(", ") || "Aucun niveau sélectionné";
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Le nom est requis");
      return;
    }

    if (form.educationSystems.length === 0) {
      toast.error("Veuillez sélectionner au moins un système éducatif");
      return;
    }

    if (form.typesWithQualification.length === 0) {
      toast.error("Veuillez sélectionner au moins un type d'établissement");
      return;
    }

    // Vérifier les doublons (même type sans qualification différente)
    const typeKeys = form.typesWithQualification.map(twq => `${twq.type}:${twq.qualification || ""}`);
    const hasDuplicates = typeKeys.length !== new Set(typeKeys).size;
    if (hasDuplicates) {
      toast.error("Vous avez des types en double. Ajoutez des qualifications différentes.");
      return;
    }

    // Vérifier qu'il n'y a pas 2 types identiques sans qualification
    const unqualifiedTypes = form.typesWithQualification.filter(twq => !twq.qualification).map(twq => twq.type);
    const hasUnqualifiedDuplicates = unqualifiedTypes.length !== new Set(unqualifiedTypes).size;
    if (hasUnqualifiedDuplicates) {
      toast.error("Vous ne pouvez pas avoir deux fois le même type sans qualification.");
      return;
    }

    if (form.selectedLevels.length === 0) {
      toast.error("Veuillez sélectionner au moins un niveau");
      return;
    }

    if (form.latitude === null || form.longitude === null) {
      toast.error("La localisation GPS est obligatoire. Veuillez capturer la position de l'établissement.");
      setActiveTab("contact");
      return;
    }

    setLoading(true);
    try {
      const autoCode = generateUniqueCode();
      // Formater les types avec qualifications pour le stockage (inclut le système éducatif)
      const typesForDb = form.typesWithQualification
        .map(twq => twq.qualification ? `${twq.type}:${twq.qualification}` : twq.type)
        .join(",");
      
      // Ajouter les systèmes éducatifs et langues aux options
      const allOptions = [...form.options];
      form.educationSystems.forEach(sys => {
        allOptions.push(`system:${sys}`);
      });
      form.additionalTeachingLanguages.forEach(lang => {
        allOptions.push(`teaching_lang:${lang}`);
      });
      if (languageDesignation) {
        allOptions.push(`designation:${languageDesignation.label.toLowerCase().replace(/ \/ /g, "_").replace(/ /g, "_")}`);
      }
      
      const { error } = await supabase.from("establishments").insert({
        name: form.name,
        code: autoCode,
        type: typesForDb,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        country_code: form.country_code,
        levels: getSelectedLevelsDisplay(),
        group_id: form.group_id,
        options: allOptions.length > 0 ? allOptions : null,
        latitude: form.latitude,
        longitude: form.longitude,
      });

      if (error) throw error;

      toast.success("Établissement créé avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating establishment:", error);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const showOptions = form.typesWithQualification.some(twq => ["lycee"].includes(twq.type));

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5" />
            Nouvel établissement
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Niveaux
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[55vh] mt-4 pr-4">
            <TabsContent value="info" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Nom de l'établissement *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Saint-Michel"
                  className="text-base"
                />
              </div>

              {/* Prévisualisation du nom complet configurable */}
              {(form.name || form.typesWithQualification.length > 0 || languageDesignation) && (
                <div className="space-y-3 p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <School className="h-4 w-4" />
                      Prévisualisation du nom complet
                    </Label>
                    <span className="text-xs text-muted-foreground">Réorganisez les éléments ci-dessous</span>
                  </div>
                  
                  {/* Nom complet généré */}
                  <div className="p-3 rounded-lg bg-background border-2 border-primary/30">
                    <p className="text-lg font-semibold text-center">
                      {(() => {
                        const elements: Record<string, string> = {
                          type: form.typesWithQualification[0] 
                            ? ESTABLISHMENT_TYPES.find(t => t.value === form.typesWithQualification[0].type)?.label || ""
                            : "",
                          qualification: form.typesWithQualification[0]?.qualification || "",
                          designation: languageDesignation?.label || "",
                          name: form.name || "..."
                        };
                        
                        return form.nameElementsOrder
                          .map(key => elements[key])
                          .filter(Boolean)
                          .join(" ");
                      })()}
                    </p>
                  </div>
                  
                  {/* Réorganisation des éléments */}
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Cliquez sur les flèches pour réorganiser :</p>
                    <div className="flex flex-wrap gap-2">
                      {form.nameElementsOrder.map((element, index) => {
                        const elementLabels: Record<string, { label: string; color: string; value: string }> = {
                          type: { 
                            label: "Type", 
                            color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
                            value: form.typesWithQualification[0] 
                              ? ESTABLISHMENT_TYPES.find(t => t.value === form.typesWithQualification[0].type)?.label || "—"
                              : "—"
                          },
                          qualification: { 
                            label: "Qualification", 
                            color: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
                            value: form.typesWithQualification[0]?.qualification || "—"
                          },
                          designation: { 
                            label: "Désignation", 
                            color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
                            value: languageDesignation?.label || "—"
                          },
                          name: { 
                            label: "Nom", 
                            color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
                            value: form.name || "—"
                          },
                        };
                        
                        const info = elementLabels[element];
                        
                        return (
                          <div key={element} className={cn(
                            "flex items-center gap-1 px-2 py-1.5 rounded-lg border text-sm",
                            info.color
                          )}>
                            {/* Flèche gauche */}
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                const newOrder = [...form.nameElementsOrder];
                                [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                                setForm({ ...form, nameElementsOrder: newOrder });
                              }}
                              className={cn(
                                "p-0.5 rounded hover:bg-background/50",
                                index === 0 && "opacity-30 cursor-not-allowed"
                              )}
                            >
                              ◀
                            </button>
                            
                            <div className="flex flex-col items-center min-w-[60px]">
                              <span className="text-[10px] font-medium opacity-70">{info.label}</span>
                              <span className="font-semibold text-xs truncate max-w-[80px]">{info.value}</span>
                            </div>
                            
                            {/* Flèche droite */}
                            <button
                              type="button"
                              disabled={index === form.nameElementsOrder.length - 1}
                              onClick={() => {
                                const newOrder = [...form.nameElementsOrder];
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                setForm({ ...form, nameElementsOrder: newOrder });
                              }}
                              className={cn(
                                "p-0.5 rounded hover:bg-background/50",
                                index === form.nameElementsOrder.length - 1 && "opacity-30 cursor-not-allowed"
                              )}
                            >
                              ▶
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Système(s) éducatif(s) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Système(s) éducatif(s) * <span className="text-xs text-muted-foreground">(sélection multiple possible)</span></Label>
                  {languageDesignation && (
                    <Badge variant="outline" className="bg-primary/10 border-primary text-primary">
                      {languageDesignation.icon} {languageDesignation.label}
                    </Badge>
                  )}
                </div>
                
                {/* Systèmes sélectionnés */}
                {form.educationSystems.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    {form.educationSystems.map(sysValue => {
                      const system = EDUCATION_SYSTEMS.find(s => s.value === sysValue);
                      return system ? (
                        <Badge key={sysValue} variant="secondary" className="gap-2 pr-1">
                          <span>{system.icon}</span>
                          <span>{system.label}</span>
                          <button
                            type="button"
                            onClick={() => setForm({
                              ...form,
                              educationSystems: form.educationSystems.filter(s => s !== sysValue)
                            })}
                            className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                          >
                            ✕
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}

                {/* Champ de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={systemSearchTerm}
                    onChange={(e) => setSystemSearchTerm(e.target.value)}
                    placeholder="Rechercher un système éducatif..."
                    className="pl-10"
                  />
                </div>

                {/* Liste par catégories */}
                <div className="max-h-72 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {filteredCategories.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Aucun système trouvé pour "{systemSearchTerm}"</p>
                    </div>
                  ) : (
                    filteredCategories.map((category) => {
                      const isExpanded = expandedCategories.includes(category.id) || systemSearchTerm.length > 0;
                      const selectedInCategory = category.systems.filter(s => form.educationSystems.includes(s.value)).length;
                      
                      return (
                        <div key={category.id} className="border rounded-lg overflow-hidden">
                          {/* Header de catégorie */}
                          <button
                            type="button"
                            onClick={() => toggleCategory(category.id)}
                            className="w-full p-3 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-lg">{category.icon}</span>
                              <span className="font-medium text-sm">{category.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              {selectedInCategory > 0 && (
                                <Badge variant="default" className="text-xs">
                                  {selectedInCategory} sélectionné(s)
                                </Badge>
                              )}
                              <Badge variant="secondary" className="text-xs">
                                {category.systems.length}
                              </Badge>
                            </div>
                          </button>
                          
                          {/* Systèmes de la catégorie */}
                          {isExpanded && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-background">
                              {category.systems.map((system) => {
                                const isSelected = form.educationSystems.includes(system.value);
                                return (
                                  <button
                                    key={system.value}
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        setForm({
                                          ...form,
                                          educationSystems: form.educationSystems.filter(s => s !== system.value)
                                        });
                                      } else {
                                        setForm({
                                          ...form,
                                          educationSystems: [...form.educationSystems, system.value]
                                        });
                                      }
                                    }}
                                    className={cn(
                                      "p-3 rounded-lg border text-left transition-all",
                                      isSelected
                                        ? "bg-primary/10 border-primary"
                                        : "bg-muted/30 border-transparent hover:bg-muted/50"
                                    )}
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{system.icon}</span>
                                      <span className={cn("font-medium text-sm flex-1", isSelected ? "text-primary" : "text-foreground")}>
                                        {system.label}
                                      </span>
                                      {isSelected && <span className="text-primary">✓</span>}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{system.description}</p>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  💡 Sélectionnez plusieurs systèmes pour un établissement "Mixte / Hybride"
                </p>
              </div>

              {/* Langues d'enseignement - Section améliorée */}
              <div className="space-y-3 p-4 rounded-lg border bg-muted/20">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-semibold">🗣️ Langues d'enseignement</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Langues dans lesquelles les cours sont dispensés (détermine bilingue/trilingue/multilingue)
                    </p>
                  </div>
                  {languageDesignation && (
                    <Badge variant="default" className="bg-primary text-primary-foreground">
                      {languageDesignation.icon} {languageDesignation.label}
                    </Badge>
                  )}
                </div>

                {/* Langues principales automatiques (du système) */}
                {systemTeachingLanguages.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">Langues principales (du système éducatif) :</Label>
                    <div className="flex flex-wrap gap-2">
                      {systemTeachingLanguages.map(langCode => {
                        const lang = LANGUAGES.find(l => l.value === langCode);
                        return lang ? (
                          <Badge key={langCode} variant="secondary" className="gap-2 bg-primary/10 border-primary/30">
                            <span>{lang.icon}</span>
                            <span>{lang.label}</span>
                            <span className="text-xs text-muted-foreground">(auto)</span>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                {/* Langues d'enseignement additionnelles */}
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Langues d'enseignement additionnelles <span className="text-xs">(optionnel)</span> :
                  </Label>
                  
                  {form.additionalTeachingLanguages.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-2 rounded-lg bg-secondary/30 border">
                      {form.additionalTeachingLanguages.map(langValue => {
                        const lang = LANGUAGES.find(l => l.value === langValue);
                        return lang ? (
                          <Badge key={langValue} variant="outline" className="gap-2 pr-1">
                            <span>{lang.icon}</span>
                            <span>{lang.label}</span>
                            <button
                              type="button"
                              onClick={() => setForm({
                                ...form,
                                additionalTeachingLanguages: form.additionalTeachingLanguages.filter(l => l !== langValue)
                              })}
                              className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                            >
                              ✕
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {LANGUAGES.map((lang) => {
                      const isSelected = form.additionalTeachingLanguages.includes(lang.value);
                      // Ne pas afficher si c'est déjà une langue principale du système
                      const isMainLanguage = systemTeachingLanguages.includes(lang.value);
                      
                      if (isMainLanguage) return null;
                      
                      return (
                        <button
                          key={lang.value}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setForm({
                                ...form,
                                additionalTeachingLanguages: form.additionalTeachingLanguages.filter(l => l !== lang.value)
                              });
                            } else {
                              setForm({
                                ...form,
                                additionalTeachingLanguages: [...form.additionalTeachingLanguages, lang.value]
                              });
                            }
                          }}
                          className={cn(
                            "px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2",
                            isSelected
                              ? "bg-secondary border-secondary-foreground/20"
                              : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                          )}
                        >
                          <span>{lang.icon}</span>
                          <span>{lang.label}</span>
                          {isSelected && <span className="text-primary">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>


              <div className="space-y-3">
                <Label>Type(s) d'établissement * <span className="text-xs text-muted-foreground">(au moins un)</span></Label>
                
                {/* Types sélectionnés avec qualifications */}
                <div className="space-y-2">
                  {form.typesWithQualification.map((twq, index) => {
                    const typeInfo = ESTABLISHMENT_TYPES.find(t => t.value === twq.type);
                    const suggestions = TYPE_QUALIFICATIONS[twq.type] || [];
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-primary/5 border-primary/20">
                        <span className="text-lg">{typeInfo?.icon}</span>
                        <span className="font-medium min-w-[100px]">{typeInfo?.label}</span>
                        <Select
                          value={twq.qualification || "none"}
                          onValueChange={(v) => {
                            const updated = [...form.typesWithQualification];
                            updated[index] = { ...twq, qualification: v === "none" ? "" : v };
                            setForm({ ...form, typesWithQualification: updated });
                          }}
                        >
                          <SelectTrigger className="flex-1 h-8">
                            <SelectValue placeholder="Sélectionner une qualification" />
                          </SelectTrigger>
                          <SelectContent position="popper" className="max-h-60 z-[9999]">
                            <SelectItem value="none">
                              <span className="text-muted-foreground">Sans qualification</span>
                            </SelectItem>
                            {suggestions.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.typesWithQualification.length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              setForm({
                                ...form,
                                typesWithQualification: form.typesWithQualification.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-destructive hover:bg-destructive/10 p-1 rounded"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Boutons pour ajouter des types */}
                <div className="flex flex-wrap gap-2">
                  {ESTABLISHMENT_TYPES.map((typeOption) => {
                    // Vérifier si ce type est déjà ajouté sans qualification
                    const hasUnqualified = form.typesWithQualification.some(
                      twq => twq.type === typeOption.value && !twq.qualification
                    );
                    return (
                      <button
                        key={typeOption.value}
                        type="button"
                        onClick={() => {
                          // Si déjà présent sans qualification, on ne peut pas ajouter
                          if (hasUnqualified) {
                            toast.info("Ajoutez une qualification au type existant avant d'en ajouter un autre");
                            return;
                          }
                          setForm({
                            ...form,
                            typesWithQualification: [
                              ...form.typesWithQualification,
                              { type: typeOption.value, qualification: "" }
                            ]
                          });
                        }}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2",
                          "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50 hover:border-primary/30"
                        )}
                      >
                        <span>{typeOption.icon}</span>
                        <span>{typeOption.label}</span>
                        <span className="text-primary">+</span>
                      </button>
                    );
                  })}
                </div>
                
                <p className="text-xs text-muted-foreground">
                  💡 Ajoutez une qualification pour différencier les types (ex: "Lycée Technique" et "Lycée Général")
                </p>
              </div>

              <div className="space-y-2">
                <Label>Groupe scolaire</Label>
                <Select
                  value={form.group_id || "none"}
                  onValueChange={(v) => setForm({ ...form, group_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun groupe" />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-60 z-[9999]">
                    <SelectItem value="none">Aucun groupe (indépendant)</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select
                    value={form.country_code}
                    onValueChange={(v) => setForm({ ...form, country_code: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Résumé des niveaux sélectionnés */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <Label className="text-sm text-muted-foreground">Niveaux sélectionnés</Label>
                <p className="text-sm font-medium mt-1">
                  {getSelectedLevelsDisplay()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Modifiez dans l'onglet "Niveaux"
                </p>
              </div>
            </TabsContent>

            <TabsContent value="levels" className="space-y-4 mt-0">
              <div className="p-3 rounded-lg bg-muted/50 border mb-4">
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les niveaux enseignés dans cet établissement. Cliquez sur un cycle pour tout sélectionner/désélectionner.
                </p>
              </div>

              {Object.entries(EDUCATION_CYCLES).map(([cycleKey, cycle]) => {
                const cycleLevelIds = cycle.levels.map(l => l.id);
                const selectedCount = cycleLevelIds.filter(id => form.selectedLevels.includes(id)).length;
                const allSelected = selectedCount === cycleLevelIds.length;
                const someSelected = selectedCount > 0 && !allSelected;

                return (
                  <div key={cycleKey} className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCycle(cycleKey)}
                      className={`w-full p-3 flex items-center justify-between ${cycle.color} hover:opacity-90 transition-opacity`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={allSelected}
                          className="pointer-events-none"
                          // @ts-ignore
                          indeterminate={someSelected}
                        />
                        <span className="font-semibold">{cycle.label}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/50">
                        {selectedCount}/{cycleLevelIds.length}
                      </Badge>
                    </button>
                    <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2 bg-background">
                      {cycle.levels.map((level) => (
                        <label
                          key={level.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                            form.selectedLevels.includes(level.id) ? "bg-muted" : ""
                          }`}
                        >
                          <Checkbox
                            checked={form.selectedLevels.includes(level.id)}
                            onCheckedChange={() => toggleLevel(level.id)}
                          />
                          <span className="text-sm">{level.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Options pour lycée */}
              {showOptions && (
                <div className="border rounded-lg overflow-hidden mt-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/50">
                    <span className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <School className="h-4 w-4" />
                      Séries / Options disponibles
                    </span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2 bg-background">
                    {OPTIONS_LYCEE.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                          form.options.includes(option) ? "bg-muted" : ""
                        }`}
                      >
                        <Checkbox
                          checked={form.options.includes(option)}
                          onCheckedChange={() => toggleOption(option)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-0">
              {/* Section GPS obligatoire */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-primary" />
                  <Label className="text-base font-semibold">Localisation GPS *</Label>
                </div>
                
                <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
                  <Navigation className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Important :</strong> Placez-vous à l'entrée principale de l'établissement (portail ou porte du bâtiment) avant de capturer la position GPS. Cette localisation servira de point de référence pour les visiteurs.
                  </AlertDescription>
                </Alert>

                {geoError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{geoError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-3">
                  {form.latitude !== null && form.longitude !== null ? (
                    <div className="p-4 rounded-lg border-2 border-green-500/50 bg-green-50 dark:bg-green-950/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Position capturée ✓</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Lat: {form.latitude.toFixed(6)} | Long: {form.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <GlassButton
                            variant="outline"
                            size="sm"
                            onClick={getCurrentLocation}
                            disabled={geoLoading}
                          >
                            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recapturer"}
                          </GlassButton>
                          <GlassButton
                            variant="outline"
                            size="sm"
                            onClick={clearLocation}
                            className="text-destructive hover:text-destructive"
                          >
                            Effacer
                          </GlassButton>
                        </div>
                      </div>
                      {/* Carte interactive */}
                      <div className="mt-3">
                        <LocationPickerMap
                          latitude={form.latitude}
                          longitude={form.longitude}
                          onLocationChange={handleMapLocationChange}
                          className="[&_>_div:last-child]:h-[200px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Navigation className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Aucune position GPS définie</p>
                          <p className="text-sm text-muted-foreground">
                            Capturez votre position actuelle ou sélectionnez sur la carte
                          </p>
                        </div>
                        <GlassButton
                          variant="primary"
                          onClick={getCurrentLocation}
                          disabled={geoLoading}
                          className="gap-2"
                        >
                          {geoLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Recherche de la position...
                            </>
                          ) : (
                            <>
                              <Navigation className="h-4 w-4" />
                              Capturer ma position GPS
                            </>
                          )}
                        </GlassButton>
                      </div>

                      {/* Carte interactive pour sélection manuelle */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Ou sélectionner sur la carte</Label>
                        </div>
                        <LocationPickerMap
                          latitude={form.latitude}
                          longitude={form.longitude}
                          onLocationChange={handleMapLocationChange}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Adresse détectée + Coordonnées GPS (non modifiables) */}
                {form.latitude !== null && form.longitude !== null && (
                  <div className="pt-2 border-t space-y-3">
                    {geoAddress && (
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-foreground">{geoAddress}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Latitude</Label>
                        <Input
                          type="text"
                          value={form.latitude.toFixed(6)}
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Longitude</Label>
                        <Input
                          type="text"
                          value={form.longitude.toFixed(6)}
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Adresse complète <span className="text-xs text-muted-foreground">(modifiable)</span></Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Rue, quartier, ville, boîte postale..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez modifier ou compléter l'adresse pré-remplie ci-dessus.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+241 01 XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@etablissement.com"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <h4 className="font-medium mb-2">Récapitulatif</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Système(s):</span>{" "}
                    <span className="font-medium">
                      {form.educationSystems.length > 0
                        ? form.educationSystems.map(sysValue => {
                            const sys = EDUCATION_SYSTEMS.find(s => s.value === sysValue);
                            return sys ? `${sys.icon} ${sys.label}` : sysValue;
                          }).join(", ")
                        : "Non défini"}
                      {languageDesignation && (
                        <Badge variant="outline" className="ml-2 bg-primary/10 border-primary text-primary text-xs">
                          {languageDesignation.icon} {languageDesignation.label}
                        </Badge>
                      )}
                    </span>
                  </div>
                  {form.additionalTeachingLanguages.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Langues d'ens. add.:</span>{" "}
                      <span className="font-medium">
                        {form.additionalTeachingLanguages.map(langValue => {
                          const lang = LANGUAGES.find(l => l.value === langValue);
                          return lang ? `${lang.icon} ${lang.label}` : langValue;
                        }).join(", ")}
                      </span>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Pays:</span>{" "}
                    <span className="font-medium">
                      {COUNTRIES.find(c => c.code === form.country_code)?.flag}{" "}
                      {COUNTRIES.find(c => c.code === form.country_code)?.name}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Type(s):</span>{" "}
                    <span className="font-medium">
                      {form.typesWithQualification.map(twq => {
                        const typeInfo = ESTABLISHMENT_TYPES.find(t => t.value === twq.type);
                        return twq.qualification ? `${typeInfo?.label} ${twq.qualification}` : typeInfo?.label;
                      }).filter(Boolean).join(", ") || "Aucun"}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Niveaux:</span>{" "}
                    <span className="font-medium">{getSelectedLevelsDisplay()}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">GPS:</span>{" "}
                    <span className={`font-medium ${form.latitude && form.longitude ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                      {form.latitude && form.longitude 
                        ? `${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}` 
                        : "Non défini (obligatoire)"}
                    </span>
                  </div>
                  {form.options.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Options:</span>{" "}
                      <span className="font-medium">{form.options.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <GlassButton variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </GlassButton>
          <GlassButton variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer l'établissement"}
          </GlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
