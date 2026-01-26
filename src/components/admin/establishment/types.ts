// Types et constantes partagées pour la création d'établissement

// Re-export staff types from the new module
export type { StaffMember, StaffType, StaffCategory } from "./staffTypes";
export {
  STAFF_TYPES,
  STAFF_CATEGORIES,
  STAFF_TYPES_BY_CATEGORY,
  POSITIONS_BY_TYPE,
  CONTRACT_TYPES,
  TUTOR_RELATIONS,
  requiresStudentLink,
  hasContract,
  getCategoryForType,
  getAdministrativeTypes,
  getEducationalTypes,
} from "./staffTypes";

export interface TypeWithQualification {
  type: string;
  qualification: string;
}

export type NameElement = 'type' | 'qualification' | 'designation' | 'name';

// Import types from classConfigTypes
import { LevelClassesConfig as LevelClassesConfigType } from "./classConfigTypes";

export interface EstablishmentFormData {
  name: string;
  educationSystems: string[];
  additionalTeachingLanguages: string[];
  typesWithQualification: TypeWithQualification[];
  address: string;
  phone: string;
  email: string;
  country_code: string;
  selectedLevels: string[];
  classesConfig: LevelClassesConfigType[]; // Configuration des classes par niveau
  group_id: string | null;
  options: string[];
  latitude: number | null;
  longitude: number | null;
  nameElementsOrder: NameElement[];
  enabledModules: string[]; // Modules activés pour cet établissement
}

export interface EstablishmentDraft {
  id: string;
  user_id: string;
  name: string | null;
  data: EstablishmentFormData;
  status: 'draft' | 'completed';
  last_step: string;
  created_at: string;
  updated_at: string;
}

export const DEFAULT_ENABLED_MODULES = [
  'messages',
  'grades',
  'assignments',
  'absences',
  'schedule',
  'calendar',
];

export const DEFAULT_FORM_DATA: EstablishmentFormData = {
  name: "",
  educationSystems: [],
  additionalTeachingLanguages: [],
  typesWithQualification: [],
  address: "",
  phone: "",
  email: "",
  country_code: "GA",
  selectedLevels: [],
  classesConfig: [],
  group_id: null,
  options: [],
  latitude: null,
  longitude: null,
  nameElementsOrder: ['type', 'qualification', 'designation', 'name'],
  enabledModules: DEFAULT_ENABLED_MODULES,
};
