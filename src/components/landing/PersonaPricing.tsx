import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Check, Star, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  popular?: boolean;
  icon?: React.ReactNode;
  badge?: string;
}

interface PersonaPricingProps {
  title: string;
  subtitle: string;
  plans: PricingPlan[];
  persona: "etablissement" | "parent" | "professeur" | "eleve";
}

export const PersonaPricing = ({ title, subtitle, plans, persona }: PersonaPricingProps) => {
  const getGradient = () => {
    switch (persona) {
      case "etablissement":
        return "from-blue-500/10 to-indigo-500/10";
      case "parent":
        return "from-green-500/10 to-emerald-500/10";
      case "professeur":
        return "from-purple-500/10 to-violet-500/10";
      case "eleve":
        return "from-pink-500/10 to-rose-500/10";
      default:
        return "from-primary/10 to-secondary/10";
    }
  };

  return (
    <section className={cn("py-20 px-4 bg-gradient-to-br", getGradient())}>
      <div className="container mx-auto">
        <div className="text-center mb-16">
          <span className="text-sm font-medium text-primary mb-2 block">
            💰 TARIFICATION
          </span>
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{title}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className={cn(
          "grid gap-8 max-w-5xl mx-auto",
          plans.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3"
        )}>
          {plans.map((plan, i) => (
            <GlassCard
              key={i}
              className={cn(
                "p-8 relative flex flex-col transition-all duration-300 hover:scale-105",
                plan.popular && "ring-2 ring-primary shadow-xl scale-[1.02]"
              )}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" /> Populaire
                </div>
              )}
              
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-medium flex items-center gap-1">
                  <Crown className="h-4 w-4" /> {plan.badge}
                </div>
              )}

              <div className="text-center mb-6">
                {plan.icon && (
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                    {plan.icon}
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-muted-foreground">{plan.period}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 flex-1 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <GlassButton
                href={plan.ctaHref}
                variant={plan.popular ? "primary" : "outline"}
                className="w-full"
              >
                {plan.cta}
              </GlassButton>
            </GlassCard>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-8">
          Tous les prix sont en FCFA. TVA incluse. Sans engagement.
        </p>
      </div>
    </section>
  );
};

// Pre-configured pricing data for each persona
export const ETABLISSEMENT_PLANS: PricingPlan[] = [
  {
    name: "Découverte",
    price: "Gratuit",
    description: "Pour tester et découvrir la plateforme",
    features: [
      "Jusqu'à 50 élèves",
      "Gestion des notes basique",
      "1 utilisateur administrateur",
      "Bulletins PDF simples",
      "Support par email",
    ],
    cta: "Commencer Gratuitement",
    ctaHref: "/demo?role=admin",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    name: "Professionnel",
    price: "150 000",
    period: "FCFA/mois",
    description: "Pour les établissements en croissance",
    features: [
      "Jusqu'à 500 élèves",
      "Gestion complète (notes, absences, bulletins)",
      "5 utilisateurs administrateurs",
      "Communication parents (SMS, notifications)",
      "Gestion financière & relances",
      "Carte d'identité numérique",
      "Support prioritaire WhatsApp",
    ],
    cta: "Demander une Démo",
    ctaHref: "#contact",
    popular: true,
    icon: <Star className="h-6 w-6" />,
  },
  {
    name: "Premium",
    price: "Sur mesure",
    description: "Pour les groupes scolaires et grandes structures",
    features: [
      "Élèves illimités",
      "Multi-établissements",
      "Utilisateurs illimités",
      "API & intégrations personnalisées",
      "Rapports personnalisés",
      "Formation sur site",
      "Chef de projet dédié",
      "SLA garanti 99.9%",
    ],
    cta: "Nous Contacter",
    ctaHref: "#contact",
    badge: "Premium",
    icon: <Crown className="h-6 w-6" />,
  },
];

export const PARENT_PLANS: PricingPlan[] = [
  {
    name: "Gratuit",
    price: "Gratuit",
    description: "Accès de base via l'établissement",
    features: [
      "Consultation des notes",
      "Suivi des absences",
      "Notifications par email",
      "Bulletins téléchargeables",
      "1 enfant suivi",
    ],
    cta: "Accéder à mon Espace",
    ctaHref: "/connexion",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    name: "Premium Parent",
    price: "5 000",
    period: "FCFA/mois",
    description: "Pour un suivi optimal de vos enfants",
    features: [
      "Tout du plan Gratuit",
      "Notifications SMS instantanées",
      "Suivi multi-enfants illimité",
      "Graphiques d'évolution détaillés",
      "Alertes personnalisables",
      "Historique complet",
      "Conseils personnalisés",
      "Support prioritaire",
    ],
    cta: "Passer en Premium",
    ctaHref: "#contact",
    popular: true,
    icon: <Star className="h-6 w-6" />,
  },
];

export const PROFESSEUR_PLANS: PricingPlan[] = [
  {
    name: "Gratuit",
    price: "Gratuit",
    description: "Via l'abonnement de votre établissement",
    features: [
      "Saisie des notes",
      "Appel numérique basique",
      "Consultation des bulletins",
      "Messagerie parents",
      "Emploi du temps",
    ],
    cta: "Accéder à mon Espace",
    ctaHref: "/connexion",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    name: "Standard",
    price: "2 500",
    period: "FCFA/mois",
    description: "Outils avancés pour enseignants",
    features: [
      "Tout du plan Gratuit",
      "Appel QR code illimité",
      "Statistiques de classe",
      "Ressources pédagogiques",
      "Mode hors connexion avancé",
      "Export Excel/PDF",
      "Support prioritaire",
    ],
    cta: "Choisir Standard",
    ctaHref: "#contact",
    popular: true,
    icon: <Star className="h-6 w-6" />,
  },
  {
    name: "Expert",
    price: "15 000",
    period: "FCFA/mois",
    description: "Pour les enseignants qui veulent aller plus loin",
    features: [
      "Tout du plan Standard",
      "Création de quiz en ligne",
      "Correction automatique",
      "Bibliothèque de ressources illimitée",
      "Suivi individuel approfondi",
      "Alertes décrochage avancées",
      "Intégration agenda personnel",
      "Formation personnalisée",
    ],
    cta: "Passer Expert",
    ctaHref: "#contact",
    icon: <Crown className="h-6 w-6" />,
  },
];

export const ELEVE_PLANS: PricingPlan[] = [
  {
    name: "Gratuit",
    price: "Gratuit",
    description: "L'essentiel pour suivre ta scolarité",
    features: [
      "Consultation des notes",
      "Emploi du temps",
      "Rappels de devoirs",
      "Carte d'identité numérique",
      "Mode sombre 🌙",
    ],
    cta: "C'est parti !",
    ctaHref: "/demo?role=student",
    icon: <Zap className="h-6 w-6" />,
  },
  {
    name: "Étudiant+",
    price: "2 500",
    period: "FCFA/mois",
    description: "Pour les élèves motivés",
    features: [
      "Tout du plan Gratuit",
      "Graphiques de progression",
      "Objectifs personnels",
      "Comparaison anonyme classe",
      "Notifications personnalisables",
      "Stockage documents",
      "Badge de réussite 🏆",
    ],
    cta: "Devenir Étudiant+",
    ctaHref: "#contact",
    popular: true,
    icon: <Star className="h-6 w-6" />,
  },
  {
    name: "Champion",
    price: "15 000",
    period: "FCFA/mois",
    description: "Pour viser l'excellence 🚀",
    features: [
      "Tout du plan Étudiant+",
      "Fiches de révision intégrées",
      "Quiz d'entraînement",
      "Tutorat IA (bientôt)",
      "Conseils d'orientation",
      "Accès ressources premium",
      "Badge Champion exclusif 👑",
      "Support VIP",
    ],
    cta: "Devenir Champion",
    ctaHref: "#contact",
    icon: <Crown className="h-6 w-6" />,
  },
];
