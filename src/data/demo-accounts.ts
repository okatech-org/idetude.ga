// Demo accounts data structure for iDETUDE platform

export interface DemoAccount {
  id: string;
  role: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface School {
  id: string;
  name: string;
  type: 'primaire' | 'college' | 'lycee' | 'superieur' | 'technique';
  address: string;
  levels: string;
  studentCount: number;
  options?: string[];
  administration: DemoAccount[];
  teachers: DemoAccount[];
  studentAccounts: DemoAccount[];
  parents: DemoAccount[];
}

export interface SchoolGroup {
  id: string;
  name: string;
  location: string;
  direction: DemoAccount[];
  schools: School[];
}

export interface Region {
  id: string;
  name: string;
  accounts: DemoAccount[];
}

export interface Ministry {
  name: string;
  accounts: DemoAccount[];
}

export interface Country {
  code: string;
  name: string;
  flag: string;
  ministry: Ministry;
  regions: Region[];
  schoolGroups: SchoolGroup[];
  independentSchools: School[];
}

// Gabon Demo Data
const gabonMinistry: Ministry = {
  name: "Ministère de l'Éducation Nationale",
  accounts: [
    {
      id: "ga-min-1",
      role: "Inspecteur Général",
      name: "Jean-Baptiste NDONG",
      email: "inspecteur.general@demo.idetude.ga",
      password: "Demo2025!",
    },
    {
      id: "ga-min-2",
      role: "Directeur Enseignement",
      name: "Marie ONDO",
      email: "directeur.enseignement@demo.idetude.ga",
      password: "Demo2025!",
    },
    {
      id: "ga-min-3",
      role: "Conseiller Technique",
      name: "Pierre MBOUMBA",
      email: "conseiller.technique@demo.idetude.ga",
      password: "Demo2025!",
    },
  ],
};

const gabonRegions: Region[] = [
  {
    id: "ga-reg-estuaire",
    name: "Académie de l'Estuaire",
    accounts: [
      {
        id: "ga-reg-1",
        role: "Recteur",
        name: "François OBIANG",
        email: "recteur.estuaire@demo.idetude.ga",
        password: "Demo2025!",
      },
      {
        id: "ga-reg-2",
        role: "Inspecteur d'Académie",
        name: "Sylvie MINKO",
        email: "inspecteur.estuaire@demo.idetude.ga",
        password: "Demo2025!",
      },
    ],
  },
];

const gabonSchoolGroups: SchoolGroup[] = [
  {
    id: "ga-grp-excellence",
    name: "Groupe Scolaire Excellence",
    location: "Libreville",
    direction: [
      {
        id: "ga-grp-1",
        role: "Directeur Général",
        name: "Albert NZAMBA",
        email: "dg.excellence@demo.idetude.ga",
        password: "Demo2025!",
      },
      {
        id: "ga-grp-2",
        role: "DAF",
        name: "Jeanne ALLOGHO",
        email: "daf.excellence@demo.idetude.ga",
        password: "Demo2025!",
      },
    ],
    schools: [
      {
        id: "ga-sch-primaire",
        name: "École Primaire Excellence",
        type: "primaire",
        address: "Quartier Louis, Libreville",
        levels: "CP → CM2",
        studentCount: 450,
        administration: [
          { id: "ga-p-dir", role: "Directeur", name: "Paul MBAZOO", email: "directeur.primaire@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-p-sec", role: "Secrétaire", name: "Ange ESSONO", email: "secretaire.primaire@demo.idetude.ga", password: "Demo2025!" },
        ],
        teachers: [
          { id: "ga-p-prof1", role: "Prof. CM2-A", name: "Jacques EYENE", email: "prof.cm2a@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-p-prof2", role: "Prof. CE1-B", name: "Marthe NDONG", email: "prof.ce1b@demo.idetude.ga", password: "Demo2025!" },
        ],
        studentAccounts: [
          { id: "ga-p-elv1", role: "Élève CM2-A", name: "Kévin MOUSSAVOU", email: "kevin.m.eleve@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-p-elv2", role: "Élève CE1-B", name: "Estelle NZAMBA", email: "estelle.n.eleve@demo.idetude.ga", password: "Demo2025!" },
        ],
        parents: [
          { id: "ga-p-par1", role: "Parent de Kévin", name: "M. MOUSSAVOU", email: "parent.kevin@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-p-par2", role: "Parent d'Estelle", name: "Mme NZAMBA", email: "parent.estelle@demo.idetude.ga", password: "Demo2025!" },
        ],
      },
      {
        id: "ga-sch-college",
        name: "Collège Excellence",
        type: "college",
        address: "Quartier Louis, Libreville",
        levels: "6ème → 3ème",
        studentCount: 680,
        administration: [
          { id: "ga-c-dir", role: "Principal", name: "Christian OBAME", email: "principal.college@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-c-adj", role: "Principal Adjoint", name: "Léa MENGUE", email: "adjoint.college@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-c-cpe", role: "CPE", name: "Victor NTOUTOUME", email: "cpe.college@demo.idetude.ga", password: "Demo2025!" },
        ],
        teachers: [
          { id: "ga-c-prof1", role: "Prof. Maths 3ème-A", name: "Henri MBOULA", email: "prof.maths.3a@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-c-prof2", role: "Prof. Français", name: "Claire OYANE", email: "prof.francais@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-c-prof3", role: "Prof. SVT", name: "Bernard NDONG", email: "prof.svt@demo.idetude.ga", password: "Demo2025!" },
        ],
        studentAccounts: [
          { id: "ga-c-elv1", role: "Élève 3ème-A", name: "Olivier NDONG", email: "olivier.n.eleve@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-c-elv2", role: "Élève 6ème-B", name: "Marie ONDO", email: "marie.o.eleve@demo.idetude.ga", password: "Demo2025!" },
        ],
        parents: [
          { id: "ga-c-par1", role: "Parent d'Olivier", name: "Mme NDONG", email: "parent.olivier@demo.idetude.ga", password: "Demo2025!" },
        ],
      },
      {
        id: "ga-sch-lycee",
        name: "Lycée Excellence",
        type: "lycee",
        address: "Quartier Louis, Libreville",
        levels: "2nde → Terminale",
        studentCount: 520,
        options: ["S", "ES", "L"],
        administration: [
          { id: "ga-l-dir", role: "Proviseur", name: "Robert ESSONO", email: "proviseur.lycee@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-l-adj", role: "Proviseur Adjoint", name: "Nadège MOUNANGA", email: "adjoint.lycee@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-l-int", role: "Intendant", name: "Michel KOUMBA", email: "intendant.lycee@demo.idetude.ga", password: "Demo2025!" },
        ],
        teachers: [
          { id: "ga-l-prof1", role: "Prof. Principal Tle S", name: "Jean ENGONGA", email: "prof.tle.s@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-l-prof2", role: "Prof. Philosophie", name: "Elisabeth MBENG", email: "prof.philo@demo.idetude.ga", password: "Demo2025!" },
        ],
        studentAccounts: [
          { id: "ga-l-elv1", role: "Élève Terminale S", name: "Jean-Pierre MBAZOO", email: "jp.m.eleve@demo.idetude.ga", password: "Demo2025!" },
          { id: "ga-l-elv2", role: "Élève 2nde", name: "Sandrine ALLOGHO", email: "sandrine.a.eleve@demo.idetude.ga", password: "Demo2025!" },
        ],
        parents: [
          { id: "ga-l-par1", role: "Parent de Jean-Pierre", name: "M. MBAZOO", email: "parent.jp@demo.idetude.ga", password: "Demo2025!" },
        ],
      },
    ],
  },
];

// RDC Demo Data
const rdcMinistry: Ministry = {
  name: "Ministère de l'Enseignement Primaire, Secondaire et Technique",
  accounts: [
    {
      id: "cd-min-1",
      role: "Secrétaire Général",
      name: "Joseph KABONGO",
      email: "sg.enseignement@demo.idetude.cd",
      password: "Demo2025!",
    },
    {
      id: "cd-min-2",
      role: "Directeur Enseignement Primaire",
      name: "Marie KASONGO",
      email: "directeur.primaire@demo.idetude.cd",
      password: "Demo2025!",
    },
    {
      id: "cd-min-3",
      role: "Directeur Enseignement Secondaire",
      name: "Paul LUMUMBA",
      email: "directeur.secondaire@demo.idetude.cd",
      password: "Demo2025!",
    },
  ],
};

const rdcRegions: Region[] = [
  {
    id: "cd-reg-kinshasa",
    name: "Province de Kinshasa",
    accounts: [
      {
        id: "cd-reg-1",
        role: "Directeur Provincial",
        name: "Emmanuel TSHISEKEDI",
        email: "directeur.kinshasa@demo.idetude.cd",
        password: "Demo2025!",
      },
      {
        id: "cd-reg-2",
        role: "Inspecteur Provincial",
        name: "Jeanne MUKENDI",
        email: "inspecteur.kinshasa@demo.idetude.cd",
        password: "Demo2025!",
      },
    ],
  },
];

const rdcIndependentSchools: School[] = [
  {
    id: "cd-sch-stjoseph",
    name: "École Primaire Saint-Joseph",
    type: "primaire",
    address: "Avenue Kalemie, Gombe, Kinshasa",
    levels: "1ère → 6ème année",
    studentCount: 380,
    administration: [
      { id: "cd-sj-dir", role: "Directeur", name: "Père André LUKUSA", email: "directeur.stjoseph@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-sj-sec", role: "Secrétaire", name: "Sœur Marie NGOY", email: "secretaire.stjoseph@demo.idetude.cd", password: "Demo2025!" },
    ],
    teachers: [
      { id: "cd-sj-prof1", role: "Titulaire 6ème année", name: "Jean MUKENDI", email: "prof.6e.stjoseph@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-sj-prof2", role: "Titulaire 3ème année", name: "Claire TSHILUMBA", email: "prof.3e.stjoseph@demo.idetude.cd", password: "Demo2025!" },
    ],
    studentAccounts: [
      { id: "cd-sj-elv1", role: "Élève 6ème année", name: "Patrick KABONGO", email: "patrick.k.eleve@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-sj-elv2", role: "Élève 3ème année", name: "Grâce MUTOMBO", email: "grace.m.eleve@demo.idetude.cd", password: "Demo2025!" },
    ],
    parents: [
      { id: "cd-sj-par1", role: "Parent de Patrick", name: "M. KABONGO", email: "parent.patrick@demo.idetude.cd", password: "Demo2025!" },
    ],
  },
  {
    id: "cd-sch-reussite",
    name: "Collège de la Réussite",
    type: "college",
    address: "Boulevard du 30 Juin, Lingwala, Kinshasa",
    levels: "1ère → 4ème secondaire",
    studentCount: 550,
    administration: [
      { id: "cd-re-dir", role: "Préfet des Études", name: "Gabriel KASONGO", email: "prefet.reussite@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-re-dis", role: "Directeur Discipline", name: "Pascal MBUYI", email: "discipline.reussite@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-re-sec", role: "Secrétaire Académique", name: "Hélène NGANDU", email: "secretaire.reussite@demo.idetude.cd", password: "Demo2025!" },
    ],
    teachers: [
      { id: "cd-re-prof1", role: "Prof. Mathématiques", name: "David LUKUSA", email: "prof.maths.reussite@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-re-prof2", role: "Prof. Français", name: "Anne KALOMBO", email: "prof.francais.reussite@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-re-prof3", role: "Prof. Sciences", name: "Pierre NGOMA", email: "prof.sciences.reussite@demo.idetude.cd", password: "Demo2025!" },
    ],
    studentAccounts: [
      { id: "cd-re-elv1", role: "Élève 4ème secondaire", name: "Christian LUMUMBA", email: "christian.l.eleve@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-re-elv2", role: "Élève 2ème secondaire", name: "Esther KASONGO", email: "esther.k.eleve@demo.idetude.cd", password: "Demo2025!" },
    ],
    parents: [
      { id: "cd-re-par1", role: "Parent de Christian", name: "Mme LUMUMBA", email: "parent.christian@demo.idetude.cd", password: "Demo2025!" },
    ],
  },
  {
    id: "cd-sch-technique",
    name: "Lycée Technique Industriel",
    type: "technique",
    address: "Avenue de l'Université, Limete, Kinshasa",
    levels: "5ème → 6ème secondaire technique",
    studentCount: 420,
    options: ["Électricité", "Mécanique", "Informatique"],
    administration: [
      { id: "cd-te-dir", role: "Préfet", name: "François MBUYI", email: "prefet.technique@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-te-ate", role: "Chef d'Atelier", name: "Jacques NZUZI", email: "atelier.technique@demo.idetude.cd", password: "Demo2025!" },
    ],
    teachers: [
      { id: "cd-te-prof1", role: "Prof. Électricité", name: "Henri KASAI", email: "prof.elec.technique@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-te-prof2", role: "Prof. Informatique", name: "Marie LOMBOTO", email: "prof.info.technique@demo.idetude.cd", password: "Demo2025!" },
    ],
    studentAccounts: [
      { id: "cd-te-elv1", role: "Élève 6ème Électricité", name: "David MUKENDI", email: "david.m.eleve@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-te-elv2", role: "Élève 5ème Informatique", name: "Rachel TSHILUMBA", email: "rachel.t.eleve@demo.idetude.cd", password: "Demo2025!" },
    ],
    parents: [
      { id: "cd-te-par1", role: "Parent de David", name: "M. MUKENDI", email: "parent.david@demo.idetude.cd", password: "Demo2025!" },
    ],
  },
  {
    id: "cd-sch-isp",
    name: "Institut Supérieur Pédagogique (ISP Gombe)",
    type: "superieur",
    address: "Avenue de l'Enseignement, Gombe, Kinshasa",
    levels: "G1 → G3 (Graduat)",
    studentCount: 890,
    options: ["Lettres", "Sciences", "Pédagogie"],
    administration: [
      { id: "cd-isp-dg", role: "Directeur Général", name: "Prof. Jean KALOMBO", email: "dg.isp@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-isp-sga", role: "Secrétaire Général Académique", name: "Prof. Marie LUKUSA", email: "sga.isp@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-isp-de", role: "Directeur des Études", name: "Dr. Paul NGOMA", email: "de.isp@demo.idetude.cd", password: "Demo2025!" },
    ],
    teachers: [
      { id: "cd-isp-prof1", role: "Chef de Travaux Sciences", name: "Dr. André KABONGO", email: "ct.sciences.isp@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-isp-prof2", role: "Professeur Pédagogie", name: "Prof. Elisabeth MBUYI", email: "prof.pedagogie.isp@demo.idetude.cd", password: "Demo2025!" },
    ],
    studentAccounts: [
      { id: "cd-isp-elv1", role: "Étudiant G3 Sciences", name: "Alain TSHISEKEDI", email: "alain.t.etudiant@demo.idetude.cd", password: "Demo2025!" },
      { id: "cd-isp-elv2", role: "Étudiante G1 Lettres", name: "Béatrice NGOY", email: "beatrice.n.etudiant@demo.idetude.cd", password: "Demo2025!" },
    ],
    parents: [
      { id: "cd-isp-par1", role: "Parent d'Alain", name: "M. TSHISEKEDI", email: "parent.alain@demo.idetude.cd", password: "Demo2025!" },
    ],
  },
];

export const countries: Country[] = [
  {
    code: "GA",
    name: "Gabon",
    flag: "🇬🇦",
    ministry: gabonMinistry,
    regions: gabonRegions,
    schoolGroups: gabonSchoolGroups,
    independentSchools: [],
  },
  {
    code: "CD",
    name: "République Démocratique du Congo",
    flag: "🇨🇩",
    ministry: rdcMinistry,
    regions: rdcRegions,
    schoolGroups: [],
    independentSchools: rdcIndependentSchools,
  },
];

export const getCountryStats = (country: Country) => {
  let totalSchools = country.independentSchools.length;
  const totalGroups = country.schoolGroups.length;
  
  country.schoolGroups.forEach((group) => {
    totalSchools += group.schools.length;
  });

  return { totalSchools, totalGroups };
};
