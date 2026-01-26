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
  assigned_class_ids?: string[]; // Pour les enseignants - classes auxquelles ils sont assignés
  added_by_user_type?: 'parent' | 'student' | 'admin'; // Pour prof particulier - qui l'a ajouté
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
    description: 'Personnel de la structure (Direction, Administration, Enseignants, Technique)' 
  },
  { 
    value: 'educational' as StaffCategory, 
    label: 'Éducatif', 
    icon: '📚', 
    description: 'Acteurs des classes (Élèves, Tuteurs)' 
  },
] as const;

// Types de personnel par catégorie
// IMPORTANT: L'enseignant en mode Administratif = employé de la structure
// L'enseignant en mode Éducatif = assigné à des classes spécifiques
export const STAFF_TYPES_BY_CATEGORY: Record<StaffCategory, {
  value: StaffType;
  label: string;
  icon: string;
  description: string;
}[]> = {
  administrative: [
    { value: 'direction', label: 'Direction', icon: '👔', description: 'Directeur, Proviseur, Principal' },
    { value: 'admin', label: 'Administration', icon: '📋', description: 'Secrétaire, Comptable, RH' },
    { value: 'teacher', label: 'Enseignant', icon: '👨‍🏫', description: 'Corps enseignant (contrat avec l\'établissement, assigné aux classes)' },
    { value: 'technical', label: 'Technique', icon: '🔧', description: 'Maintenance, sécurité, cantine' },
  ],
  educational: [
    { value: 'student', label: 'Élève', icon: '🎓', description: 'Étudiants inscrits dans une classe' },
    { value: 'tutor', label: 'Tuteur', icon: '👨‍👩‍👧', description: 'Parent ou tuteur légal (min. 1, max. 2 par élève mineur)' },
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

// Types d'ajout pour les professeurs particuliers
export const PRIVATE_TEACHER_ADDED_BY = [
  { value: 'parent', label: 'Parent / Tuteur', description: 'Ajouté par un parent ou tuteur de l\'élève' },
  { value: 'student', label: 'Élève / Étudiant', description: 'Ajouté par l\'élève lui-même (majeur)' },
  { value: 'admin', label: 'Administration', description: 'Ajouté par l\'administration de l\'établissement' },
] as const;

// Helper: Déterminer si un type nécessite un lien avec un élève
export const requiresStudentLink = (staffType: StaffType): boolean => {
  return staffType === 'tutor' || staffType === 'private_teacher';
};

// Helper: Déterminer si un type peut être assigné à des classes (enseignants administratifs uniquement)
export const canBeAssignedToClasses = (staffType: StaffType): boolean => {
  return staffType === 'teacher';
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

// Helper: Vérifier si un élève est mineur (pour la logique d'ajout de prof particulier)
export const isStudentMinor = (birthDate?: string): boolean => {
  if (!birthDate) return true; // Par défaut, considérer comme mineur
  const birth = new Date(birthDate);
  const today = new Date();
  const age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    return age - 1 < 18;
  }
  return age < 18;
};

// Helper: Obtenir les types administratifs uniquement
export const getAdministrativeTypes = () => STAFF_TYPES_BY_CATEGORY.administrative;

// Helper: Obtenir les types éducatifs uniquement
export const getEducationalTypes = () => STAFF_TYPES_BY_CATEGORY.educational;

// Helper: Vérifier si un tuteur est requis pour un élève
export const studentRequiresTutor = (birthDate?: string): boolean => {
  return isStudentMinor(birthDate);
};

// Helper: Obtenir le nombre de tuteurs d'un élève
export const getTutorCountForStudent = (studentId: string, staff: StaffMember[]): number => {
  return staff.filter(s => s.staff_type === 'tutor' && s.linked_student_id === studentId).length;
};

// Helper: Valider qu'un élève mineur a au moins un tuteur
export const validateStudentHasTutor = (studentId: string, staff: StaffMember[]): boolean => {
  return getTutorCountForStudent(studentId, staff) > 0;
};
