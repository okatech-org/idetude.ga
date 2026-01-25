export interface Problematique {
  stat: string;
  description: string;
  impact: string;
}

export interface Solution {
  titre: string;
  description: string;
  icone: string;
}

export interface ImpactStat {
  value: string;
  label: string;
  description: string;
}

export const problematiques: Problematique[] = [
  {
    stat: "60%",
    description: "des établissements scolaires en Afrique subsaharienne n'utilisent aucun système numérique de gestion",
    impact: "Perte de temps, erreurs administratives, données non sécurisées",
  },
  {
    stat: "35%",
    description: "des dossiers élèves sont perdus ou endommagés chaque année faute de numérisation",
    impact: "Reconstitution coûteuse, retards dans les inscriptions, perte d'historique",
  },
  {
    stat: "72%",
    description: "des parents n'ont pas accès aux informations scolaires de leurs enfants en temps réel",
    impact: "Déconnexion famille-école, problèmes détectés tardivement",
  },
  {
    stat: "45%",
    description: "du temps des enseignants est consacré à des tâches administratives",
    impact: "Moins de temps pour l'enseignement et l'accompagnement personnalisé",
  },
];

export const solutions: Solution[] = [
  {
    titre: "Centralisation sécurisée",
    description: "Toutes les données stockées dans le cloud avec backup automatique et chiffrement de bout en bout.",
    icone: "Database",
  },
  {
    titre: "Communication instantanée",
    description: "Messagerie intégrée entre tous les acteurs : direction, enseignants, parents et élèves.",
    icone: "MessageCircle",
  },
  {
    titre: "Carte d'identité numérique",
    description: "QR code unique pour chaque élève permettant une traçabilité complète et sécurisée.",
    icone: "QrCode",
  },
  {
    titre: "Tableaux de bord intelligents",
    description: "Visualisation des performances en temps réel, alertes automatiques et aide à la décision.",
    icone: "BarChart3",
  },
];

export const impactStats: ImpactStat[] = [
  {
    value: "-70%",
    label: "Décrochage scolaire",
    description: "Réduction du décrochage grâce au suivi personnalisé",
  },
  {
    value: "+85%",
    label: "Engagement Parents",
    description: "Augmentation de l'implication des familles",
  },
  {
    value: "100%",
    label: "Traçabilité",
    description: "Documents et historiques toujours accessibles",
  },
];

export const testimonials = [
  {
    quote: "Depuis l'adoption d'iDETUDE, nous avons réduit de moitié le temps consacré à l'administration. Les enseignants peuvent enfin se concentrer sur leur mission première : enseigner.",
    author: "Jean-Baptiste NDONG",
    role: "Directeur, École Primaire Excellence",
    location: "Libreville, Gabon",
  },
  {
    quote: "En tant que parent, je peux enfin suivre les progrès de mes enfants en temps réel. Les notifications m'alertent immédiatement en cas d'absence ou de baisse de résultats.",
    author: "Marie KASONGO",
    role: "Parent d'élèves",
    location: "Kinshasa, RDC",
  },
  {
    quote: "La génération automatique des bulletins nous fait gagner des semaines de travail. Et les parents apprécient de pouvoir consulter les notes depuis leur téléphone.",
    author: "Claire OYANE",
    role: "Professeure de Français",
    location: "Libreville, Gabon",
  },
];
