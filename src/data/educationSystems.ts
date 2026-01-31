
export interface EducationSystemTemplate {
    id: string;
    name: string;
    description: string;
    departments: {
        name: string;
        description: string;
        type: string;
        positions: { title: string; is_head: boolean; description?: string }[];
    }[];
    classes: {
        level: string; // ex: "6eme"
        name_pattern: string[]; // ex: ["A", "B", "C"] -> donnera 6ème A, 6ème B...
        cycle: 'college' | 'lycee';
    }[];
    subjects: {
        name: string;
        code: string;
        category: string;
        defaultCoefficient: number;
        levels: string[]; // Niveaux concernés (ex: ["6eme", "5eme"])
    }[];
}

export const SYSTEMS: EducationSystemTemplate[] = [
    {
        id: 'gabon',
        name: 'Système Gabonais',
        description: 'Enseignement Secondaire Général (Collège & Lycée)',
        departments: [
            {
                name: 'Direction',
                type: 'administration',
                description: 'Administration générale de l\'établissement',
                positions: [
                    { title: 'Proviseur', is_head: true, description: 'Chef d\'établissement' },
                    { title: 'Censeur', is_head: false, description: 'Responsable pédagogique' },
                    { title: 'Intendant', is_head: false, description: 'Gestion financière et matérielle' },
                    { title: 'Secrétaire de Direction', is_head: false }
                ]
            },
            {
                name: 'Surveillance',
                type: 'vie_scolaire',
                description: 'Gestion de la vie scolaire et discipline',
                positions: [
                    { title: 'Surveillant Général', is_head: true },
                    { title: 'Surveillant', is_head: false }
                ]
            }
        ],
        classes: [
            // Collège
            { level: '6eme', cycle: 'college', name_pattern: ['A1', 'A2', 'B1', 'B2'] },
            { level: '5eme', cycle: 'college', name_pattern: ['A1', 'A2', 'B1', 'B2'] },
            { level: '4eme', cycle: 'college', name_pattern: ['A1', 'A2', 'B1', 'B2'] },
            { level: '3eme', cycle: 'college', name_pattern: ['A1', 'A2', 'B1', 'B2'] },
            // Lycée
            { level: '2nde', cycle: 'lycee', name_pattern: ['S', 'L', 'SES'] },
            { level: '1ere', cycle: 'lycee', name_pattern: ['S', 'L', 'SES'] },
            { level: 'tle', cycle: 'lycee', name_pattern: ['S', 'L', 'SES'] }
        ],
        subjects: [
            // Sciences
            { name: 'Mathématiques', code: 'MATH', category: 'scientifique', defaultCoefficient: 4, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Sciences de la Vie et de la Terre', code: 'SVT', category: 'scientifique', defaultCoefficient: 3, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Sciences Physiques', code: 'SP', category: 'scientifique', defaultCoefficient: 3, levels: ['4eme', '3eme', '2nde', '1ere', 'tle'] },
            // Lettres
            { name: 'Français', code: 'FR', category: 'litteraire', defaultCoefficient: 4, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Anglais', code: 'ANG', category: 'litteraire', defaultCoefficient: 3, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Espagnol', code: 'ESP', category: 'litteraire', defaultCoefficient: 2, levels: ['4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Philosophie', code: 'PHILO', category: 'litteraire', defaultCoefficient: 3, levels: ['1ere', 'tle'] },
            // Sciences Humaines
            { name: 'Histoire-Géographie', code: 'HG', category: 'litteraire', defaultCoefficient: 3, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Éducation Civique', code: 'EC', category: 'litteraire', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme'] },
            // Arts & Sport
            { name: 'Éducation Physique et Sportive', code: 'EPS', category: 'sportif', defaultCoefficient: 2, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Arts Plastiques', code: 'AP', category: 'artistique', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme'] },
            { name: 'Éducation Musicale', code: 'MUS', category: 'artistique', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme'] }
        ]
    },
    {
        id: 'france',
        name: 'Système Français',
        description: 'Collège & Lycée Général',
        departments: [
            {
                name: 'Direction',
                type: 'administration',
                description: 'Administration de l\'établissement',
                positions: [
                    { title: 'Principal / Proviseur', is_head: true },
                    { title: 'Principal / Proviseur Adjoint', is_head: false },
                    { title: 'Secrétaire Général', is_head: false }
                ]
            },
            {
                name: 'Vie Scolaire',
                type: 'vie_scolaire',
                description: 'Encadrement des élèves',
                positions: [
                    { title: 'CPE (Conseiller Principal d\'Éducation)', is_head: true },
                    { title: 'Assistant d\'Éducation (AED)', is_head: false }
                ]
            }
        ],
        classes: [
            // Collège
            { level: '6eme', cycle: 'college', name_pattern: ['1', '2', '3', '4'] },
            { level: '5eme', cycle: 'college', name_pattern: ['1', '2', '3', '4'] },
            { level: '4eme', cycle: 'college', name_pattern: ['1', '2', '3', '4'] },
            { level: '3eme', cycle: 'college', name_pattern: ['1', '2', '3', '4'] },
            // Lycée
            { level: '2nde', cycle: 'lycee', name_pattern: ['1', '2', '3', '4'] },
            { level: '1ere', cycle: 'lycee', name_pattern: ['1', '2', '3', '4'] },
            { level: 'tle', cycle: 'lycee', name_pattern: ['1', '2', '3', '4'] }
        ],
        subjects: [
            // Sciences
            { name: 'Mathématiques', code: 'MATH', category: 'scientifique', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'SVT', code: 'SVT', category: 'scientifique', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Physique-Chimie', code: 'PC', category: 'scientifique', defaultCoefficient: 1, levels: ['5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Technologie', code: 'TECH', category: 'technique', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme'] },
            // Lettres & Humaines
            { name: 'Français', code: 'FR', category: 'litteraire', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Histoire-Géographie', code: 'HG', category: 'litteraire', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'EMC', code: 'EMC', category: 'litteraire', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'LV1 (Anglais)', code: 'ANG', category: 'litteraire', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'LV2 (Espagnol/All)', code: 'LV2', category: 'litteraire', defaultCoefficient: 1, levels: ['5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Philosophie', code: 'PHILO', category: 'litteraire', defaultCoefficient: 1, levels: ['tle'] },
            // Arts & Sport
            { name: 'EPS', code: 'EPS', category: 'sportif', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme', '2nde', '1ere', 'tle'] },
            { name: 'Arts Plastiques', code: 'AP', category: 'artistique', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme'] },
            { name: 'Éducation Musicale', code: 'MUS', category: 'artistique', defaultCoefficient: 1, levels: ['6eme', '5eme', '4eme', '3eme'] }
        ]
    }
];
