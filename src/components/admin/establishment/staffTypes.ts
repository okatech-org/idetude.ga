// Types et constantes pour la gestion du personnel d'établissement
// Organisé en deux catégories : Administratif et Éducatif

export type StaffCategory = 'administrative' | 'educational';

export type StaffType = 
  | 'direction' 
  | 'admin' 
  | 'teacher' 
  | 'technical' 
  | 'student' 
  | 'tutor' 
  | 'private_teacher';

export interface StaffMember {
  id?: string;
  establishment_id?: string;
  user_id?: string;
  staff_type: StaffType;
  category: StaffCategory;
  position?: string;
  department?: string;
  contract_type?: 'permanent' | 'temporary' | 'contractor' | 'intern';
  start_date?: string;
  end_date?: string;
  is_active: boolean;
  is_class_principal?: boolean;
  linked_student_id?: string; // Pour tuteurs et professeurs particuliers
  metadata?: Record<string, unknown>;
  // Champs temporaires pour le formulaire
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
}

// Catégories de personnel
export const STAFF_CATEGORIES = [
  { 
    value: 'administrative' as StaffCategory, 
    label: 'Administratif', 
    icon: '🏢', 
    description: 'Personnel de la structure (Direction, Administration, Technique)' 
  },
  { 
    value: 'educational' as StaffCategory, 
    label: 'Éducatif', 
    icon: '📚', 
    description: 'Acteurs des classes (Enseignants, Élèves, Tuteurs)' 
  },
] as const;

// Types de personnel par catégorie
export const STAFF_TYPES_BY_CATEGORY: Record<StaffCategory, {
  value: StaffType;
  label: string;
  icon: string;
  description: string;
}[]> = {
  administrative: [
    { value: 'direction', label: 'Direction', icon: '👔', description: 'Directeur, Proviseur, Principal' },
    { value: 'admin', label: 'Administration', icon: '📋', description: 'Secrétaire, Comptable, RH' },
    { value: 'teacher', label: 'Enseignant', icon: '👨‍🏫', description: 'Corps enseignant de l\'établissement' },
    { value: 'technical', label: 'Technique', icon: '🔧', description: 'Maintenance, sécurité, cantine' },
  ],
  educational: [
    { value: 'teacher', label: 'Enseignant', icon: '👨‍🏫', description: 'Professeur Principal ou Remplaçant' },
    { value: 'student', label: 'Élève', icon: '🎓', description: 'Étudiants inscrits' },
    { value: 'tutor', label: 'Tuteur', icon: '👨‍👩‍👧', description: 'Parent ou tuteur légal (rattaché à l\'élève)' },
    { value: 'private_teacher', label: 'Prof. Particulier', icon: '👩‍🏫', description: 'Professeur particulier (rattaché à l\'élève)' },
  ],
};

// Tous les types de personnel (pour compatibilité)
export const STAFF_TYPES = [
  { value: 'direction' as StaffType, label: 'Direction', icon: '👔', description: 'Directeur, Proviseur, Principal', category: 'administrative' as StaffCategory },
  { value: 'admin' as StaffType, label: 'Administration', icon: '📋', description: 'Secrétaire, Comptable, RH', category: 'administrative' as StaffCategory },
  { value: 'teacher' as StaffType, label: 'Enseignant', icon: '👨‍🏫', description: 'Professeurs et formateurs', category: 'administrative' as StaffCategory },
  { value: 'technical' as StaffType, label: 'Technique', icon: '🔧', description: 'Maintenance, sécurité, cantine', category: 'administrative' as StaffCategory },
  { value: 'student' as StaffType, label: 'Élève', icon: '🎓', description: 'Étudiants inscrits', category: 'educational' as StaffCategory },
  { value: 'tutor' as StaffType, label: 'Tuteur', icon: '👨‍👩‍👧', description: 'Parents et tuteurs légaux', category: 'educational' as StaffCategory },
  { value: 'private_teacher' as StaffType, label: 'Prof. Particulier', icon: '👩‍🏫', description: 'Professeur particulier de l\'élève', category: 'educational' as StaffCategory },
] as const;

// Postes disponibles par type de personnel
export const POSITIONS_BY_TYPE: Record<StaffType, string[]> = {
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
    'Père',
    'Mère',
    'Tuteur Légal',
    'Représentant Légal',
    'Oncle',
    'Tante',
    'Grand-parent',
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
  private_teacher: [
    'Professeur de Mathématiques',
    'Professeur de Français',
    'Professeur d\'Anglais',
    'Professeur de Sciences',
    'Professeur de Langues',
    'Coach scolaire',
    'Répétiteur',
  ],
};

// Types de contrat
export const CONTRACT_TYPES = [
  { value: 'permanent', label: 'CDI / Permanent' },
  { value: 'temporary', label: 'CDD / Temporaire' },
  { value: 'contractor', label: 'Prestataire / Consultant' },
  { value: 'intern', label: 'Stagiaire' },
];

// Relations parenté pour les tuteurs
export const TUTOR_RELATIONS = [
  'Père',
  'Mère',
  'Tuteur légal',
  'Grand-père',
  'Grand-mère',
  'Oncle',
  'Tante',
  'Frère/Sœur majeur(e)',
  'Autre représentant légal',
];

// Helper: Déterminer si un type nécessite un lien avec un élève
export const requiresStudentLink = (staffType: StaffType): boolean => {
  return staffType === 'tutor' || staffType === 'private_teacher';
};

// Helper: Déterminer si un type a un contrat
export const hasContract = (staffType: StaffType): boolean => {
  return !['student', 'tutor'].includes(staffType);
};

// Helper: Obtenir la catégorie d'un type
export const getCategoryForType = (staffType: StaffType): StaffCategory => {
  if (['student', 'tutor', 'private_teacher'].includes(staffType)) {
    return 'educational';
  }
  return 'administrative';
};

// Helper: Obtenir les types administratifs uniquement
export const getAdministrativeTypes = () => STAFF_TYPES_BY_CATEGORY.administrative;

// Helper: Obtenir les types éducatifs uniquement
export const getEducationalTypes = () => STAFF_TYPES_BY_CATEGORY.educational;
