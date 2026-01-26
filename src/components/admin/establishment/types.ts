// Types et constantes partagées pour la création d'établissement

export interface TypeWithQualification {
  type: string;
  qualification: string;
}

export type NameElement = 'type' | 'qualification' | 'designation' | 'name';

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
  group_id: string | null;
  options: string[];
  latitude: number | null;
  longitude: number | null;
  nameElementsOrder: NameElement[];
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

export interface StaffMember {
  id?: string;
  establishment_id?: string;
  user_id?: string;
  staff_type: 'direction' | 'admin' | 'teacher' | 'student' | 'tutor' | 'technical';
  position?: string;
  department?: string;
  contract_type?: 'permanent' | 'temporary' | 'contractor' | 'intern';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  // Champs temporaires pour le formulaire
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

export const STAFF_TYPES = [
  { value: 'direction', label: 'Direction', icon: '👔', description: 'Directeur, Proviseur, Principal' },
  { value: 'admin', label: 'Administration', icon: '📋', description: 'Secrétaire, Comptable, RH' },
  { value: 'teacher', label: 'Enseignant', icon: '👨‍🏫', description: 'Professeurs et formateurs' },
  { value: 'student', label: 'Élève', icon: '🎓', description: 'Étudiants inscrits' },
  { value: 'tutor', label: 'Tuteur', icon: '👨‍👩‍👧', description: 'Parents et tuteurs légaux' },
  { value: 'technical', label: 'Technique', icon: '🔧', description: 'Maintenance, sécurité, cantine' },
] as const;

export const POSITIONS_BY_TYPE: Record<string, string[]> = {
  direction: [
    'Directeur Général',
    'Directeur',
    'Proviseur',
    'Principal',
    'Vice-Directeur',
    'Censeur',
    'Directeur Adjoint',
    'Directeur Pédagogique',
    'Directeur Administratif',
  ],
  admin: [
    'Secrétaire Général',
    'Secrétaire',
    'Comptable',
    'Assistant Administratif',
    'Responsable RH',
    'CPE (Conseiller Principal d\'Éducation)',
    'Surveillant Général',
    'Intendant',
    'Économe',
    'Archiviste',
  ],
  teacher: [
    'Professeur Principal',
    'Professeur',
    'Professeur Certifié',
    'Professeur Agrégé',
    'Maître de Conférences',
    'Vacataire',
    'Formateur',
    'Répétiteur',
    'Assistant Pédagogique',
  ],
  student: [
    'Élève',
    'Étudiant',
    'Délégué de Classe',
    'Stagiaire',
  ],
  tutor: [
    'Parent',
    'Tuteur Légal',
    'Représentant Légal',
  ],
  technical: [
    'Agent d\'Entretien',
    'Gardien',
    'Agent de Sécurité',
    'Cuisinier',
    'Responsable Cantine',
    'Infirmier',
    'Médecin Scolaire',
    'Psychologue Scolaire',
    'Technicien Informatique',
    'Bibliothécaire',
    'Documentaliste',
  ],
};

export const CONTRACT_TYPES = [
  { value: 'permanent', label: 'CDI / Permanent' },
  { value: 'temporary', label: 'CDD / Temporaire' },
  { value: 'contractor', label: 'Prestataire / Consultant' },
  { value: 'intern', label: 'Stagiaire' },
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
  group_id: null,
  options: [],
  latitude: null,
  longitude: null,
  nameElementsOrder: ['type', 'qualification', 'designation', 'name'],
};
