export interface Tutoriel {
  id: number;
  titre: string;
  description: string;
  duree: string;
  profil: string[];
  categorie: string;
  videoUrl: string;
  vues: number;
  populaire?: boolean;
}

export interface FAQItem {
  question: string;
  reponse: string;
}

export const tutoriels: Tutoriel[] = [
  {
    id: 1,
    titre: "Première connexion à iDETUDE",
    description: "Apprenez à vous connecter et configurer votre espace personnel en quelques étapes simples.",
    duree: "5 min",
    profil: ["tous"],
    categorie: "demarrage",
    videoUrl: "/videos/tuto-connexion.mp4",
    vues: 1250,
    populaire: true,
  },
  {
    id: 2,
    titre: "Faire l'appel en classe",
    description: "Utilisez le système d'appel intelligent pour gagner du temps et automatiser le suivi des présences.",
    duree: "8 min",
    profil: ["enseignant"],
    categorie: "academique",
    videoUrl: "/videos/tuto-appel.mp4",
    vues: 890,
    populaire: true,
  },
  {
    id: 3,
    titre: "Suivre les notes de mon enfant",
    description: "Consultez les résultats scolaires et suivez la progression académique de vos enfants en temps réel.",
    duree: "3 min",
    profil: ["parent"],
    categorie: "suivi",
    videoUrl: "/videos/tuto-notes-parent.mp4",
    vues: 2100,
    populaire: true,
  },
  {
    id: 4,
    titre: "Générer les bulletins trimestriels",
    description: "Créez automatiquement des bulletins personnalisés avec calcul des moyennes et appréciations.",
    duree: "10 min",
    profil: ["direction", "enseignant"],
    categorie: "academique",
    videoUrl: "/videos/tuto-bulletins.mp4",
    vues: 560,
  },
  {
    id: 5,
    titre: "Ajouter un nouvel établissement",
    description: "Configuration complète d'un nouvel établissement au sein d'un groupe scolaire.",
    duree: "15 min",
    profil: ["direction"],
    categorie: "administration",
    videoUrl: "/videos/tuto-etablissement.mp4",
    vues: 340,
  },
  {
    id: 6,
    titre: "Consulter mon emploi du temps",
    description: "Naviguer dans l'agenda scolaire et visualiser les cours à venir chaque semaine.",
    duree: "4 min",
    profil: ["eleve"],
    categorie: "quotidien",
    videoUrl: "/videos/tuto-edt-eleve.mp4",
    vues: 1800,
    populaire: true,
  },
  {
    id: 7,
    titre: "Envoyer un message aux parents",
    description: "Utilisez la messagerie intégrée pour communiquer efficacement avec les familles.",
    duree: "6 min",
    profil: ["enseignant", "direction"],
    categorie: "communication",
    videoUrl: "/videos/tuto-messagerie.mp4",
    vues: 720,
  },
  {
    id: 8,
    titre: "Gérer les inscriptions",
    description: "Processus complet d'inscription des nouveaux élèves avec génération de la carte numérique.",
    duree: "12 min",
    profil: ["direction"],
    categorie: "administration",
    videoUrl: "/videos/tuto-inscriptions.mp4",
    vues: 480,
  },
];

export const faq: FAQItem[] = [
  {
    question: "Comment réinitialiser mon mot de passe ?",
    reponse: "Cliquez sur 'Mot de passe oublié' sur la page de connexion, entrez votre email et suivez les instructions reçues par mail. Le lien de réinitialisation est valable 24 heures.",
  },
  {
    question: "Comment ajouter une nouvelle classe ?",
    reponse: "Accédez à Administration > Classes > Nouvelle classe. Renseignez le niveau, la filière et l'effectif maximum. Vous pourrez ensuite y affecter des enseignants et des élèves.",
  },
  {
    question: "Comment exporter les données en fin d'année ?",
    reponse: "Dans Paramètres > Données > Export, sélectionnez la période et le format souhaité (Excel, PDF, CSV) puis cliquez sur Exporter. L'archive sera téléchargée automatiquement.",
  },
  {
    question: "Puis-je utiliser iDETUDE hors ligne ?",
    reponse: "Oui, notre application mobile fonctionne en mode hors-ligne pour les fonctionnalités essentielles. Les données se synchronisent automatiquement dès que vous retrouvez une connexion internet.",
  },
  {
    question: "Comment scanner le QR code d'un élève ?",
    reponse: "Utilisez l'application mobile iDETUDE et appuyez sur l'icône scanner. Pointez la caméra vers le QR code de la carte élève pour afficher instantanément son profil.",
  },
];

export const profilLabels: Record<string, string> = {
  tous: "Tous",
  direction: "Direction",
  enseignant: "Enseignants",
  parent: "Parents",
  eleve: "Élèves",
};

export const categorieLabels: Record<string, string> = {
  demarrage: "Démarrage rapide",
  academique: "Suivi académique",
  administration: "Administration",
  communication: "Communication",
  suivi: "Suivi",
  quotidien: "Quotidien",
};
