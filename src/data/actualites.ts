export interface Actualite {
  id: number;
  titre: string;
  extrait: string;
  image: string;
  date: string;
  categorie: 'mise-a-jour' | 'evenement' | 'partenariat' | 'annonce';
  featured?: boolean;
}

export const actualites: Actualite[] = [
  {
    id: 1,
    titre: "iDETUDE s'étend en République Démocratique du Congo",
    extrait: "Nous sommes fiers d'annoncer notre partenariat avec le Ministère de l'Éducation de la RDC pour déployer notre plateforme dans 4 établissements pilotes à Kinshasa.",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    date: "2025-01-25",
    categorie: "partenariat",
    featured: true,
  },
  {
    id: 2,
    titre: "Nouvelle fonctionnalité : Appel automatisé par IA",
    extrait: "Découvrez comment notre système d'appel intelligent réduit de 80% le temps administratif grâce à la reconnaissance faciale et vocale.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&q=80",
    date: "2025-01-20",
    categorie: "mise-a-jour",
  },
  {
    id: 3,
    titre: "Webinaire : Transformation numérique des écoles",
    extrait: "Rejoignez-nous le 15 février pour un webinaire gratuit sur la digitalisation des établissements scolaires en Afrique.",
    image: "https://images.unsplash.com/photo-1591115765373-5207764f72e7?w=800&q=80",
    date: "2025-01-18",
    categorie: "evenement",
  },
  {
    id: 4,
    titre: "Groupe Scolaire Excellence Gabon adopte iDETUDE",
    extrait: "3 établissements du Groupe Excellence à Libreville intègrent désormais notre solution pour gérer plus de 1600 élèves.",
    image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80",
    date: "2025-01-15",
    categorie: "partenariat",
  },
  {
    id: 5,
    titre: "Mise à jour v2.5 : Bulletins personnalisables",
    extrait: "Personnalisez entièrement vos bulletins avec notre nouveau système de templates. Choisissez parmi 20 modèles ou créez le vôtre.",
    image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80",
    date: "2025-01-10",
    categorie: "mise-a-jour",
  },
  {
    id: 6,
    titre: "iDETUDE conforme aux normes CNIL/RGPD",
    extrait: "Notre engagement pour la protection des données des mineurs est désormais certifié par un audit indépendant.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&q=80",
    date: "2025-01-05",
    categorie: "annonce",
  },
];

export const categoriesLabels: Record<string, string> = {
  'mise-a-jour': 'Mise à jour',
  'evenement': 'Événement',
  'partenariat': 'Partenariat',
  'annonce': 'Annonce',
};
