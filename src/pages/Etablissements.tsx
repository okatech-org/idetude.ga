import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Calendar,
  Play,
  CheckCircle,
  TrendingUp,
  FileStack,
  PhoneOff,
  Database,
  Wallet,
  Shield,
  Eye,
  LayoutDashboard,
  Bell,
  FileCheck,
  MessageSquare,
  ClipboardCheck,
  Quote,
  Building2,
  Users,
  FileBarChart,
  Plug,
  GraduationCap,
  FileText,
  Clock,
} from "lucide-react";
import { PersonaPricing, ETABLISSEMENT_PLANS } from "@/components/landing/PersonaPricing";

// Problems data
const problemsEtablissements = [
  {
    icon: FileStack,
    title: "Administration chronophage",
    description:
      "Vos équipes passent des heures sur les bulletins, attestations, convocations au lieu de se concentrer sur l'accompagnement des élèves.",
    stat: "40%",
    statLabel: "du temps perdu en admin",
  },
  {
    icon: PhoneOff,
    title: "Communication compliquée",
    description:
      "SMS ignorés, parents injoignables, carnets non signés. La distance entre l'école et les familles se creuse.",
    stat: "72%",
    statLabel: "des parents non informés",
  },
  {
    icon: Database,
    title: "Données dispersées",
    description:
      "Informations dans des cahiers, fichiers Excel éparpillés, clés USB perdues. Impossible d'avoir une vue d'ensemble.",
    stat: "35%",
    statLabel: "des dossiers perdus/an",
  },
  {
    icon: Wallet,
    title: "Recouvrement laborieux",
    description:
      "Relances manuelles interminables, suivi chaotique des paiements, trésorerie imprévisible.",
    stat: "60%",
    statLabel: "de retards de paiement",
  },
  {
    icon: Shield,
    title: "Sécurité des données",
    description:
      "Données sensibles sur des ordinateurs non protégés, pas de sauvegarde, risque de perte totale.",
    stat: "0%",
    statLabel: "de backup automatique",
  },
  {
    icon: Eye,
    title: "Manque de visibilité",
    description:
      "Impossible de piloter sans indicateurs. Décisions prises au feeling plutôt qu'avec des données.",
    stat: "?",
    statLabel: "Aucun tableau de bord",
  },
];

// Solutions data
const solutionsEtablissements = [
  {
    title: "Tableaux de Bord Temps Réel",
    description:
      "Visualisez instantanément les indicateurs clés de votre établissement : taux de présence, moyennes par classe, état des paiements, alertes.",
    features: [
      "Vue globale et détaillée par classe",
      "Alertes automatiques (décrochage, absences)",
      "Export des rapports en PDF/Excel",
      "Comparaison inter-périodes",
    ],
    demo: "/demo?role=admin&section=dashboard",
  },
  {
    title: "Bulletins Automatisés",
    description:
      "Fini les week-ends à calculer les moyennes. Les bulletins se génèrent automatiquement avec toutes les notes saisies.",
    features: [
      "Calcul automatique des moyennes",
      "Templates personnalisables",
      "Génération PDF en 1 clic",
      "Envoi numérique aux parents",
    ],
    demo: "/demo?role=admin&section=bulletins",
  },
  {
    title: "Carte d'Identité Numérique",
    description:
      "Chaque élève reçoit un QR code unique. Identification sécurisée, moderne, et valorisante pour votre établissement.",
    features: [
      "QR code unique et sécurisé",
      "Photo et infos essentielles",
      "Scan pour présences/cantine",
      "Application parent associée",
    ],
    demo: "/demo?role=admin&section=cartes",
  },
  {
    title: "Gestion Financière",
    description:
      "Suivez les frais de scolarité, automatisez les relances, améliorez votre taux de recouvrement.",
    features: [
      "Suivi des paiements en temps réel",
      "Relances automatiques par SMS",
      "Échéanciers personnalisés",
      "Rapports financiers",
    ],
    demo: "/demo?role=admin&section=finance",
  },
  {
    title: "Communication Centralisée",
    description:
      "Une plateforme unique pour communiquer avec tous : enseignants, parents, élèves. Plus de SMS dispersés.",
    features: [
      "Messagerie intégrée",
      "Notifications push/SMS",
      "Annonces groupées",
      "Historique des échanges",
    ],
    demo: "/demo?role=admin&section=messages",
  },
  {
    title: "Sécurité & Conformité",
    description:
      "Vos données sont chiffrées, sauvegardées automatiquement, et hébergées en Afrique. Conformité RGPD.",
    features: [
      "Chiffrement de bout en bout",
      "Sauvegardes quotidiennes",
      "Hébergement Afrique",
      "Gestion des droits d'accès",
    ],
    demo: "/demo?role=admin&section=settings",
  },
];

// Timeline data
const journeeDirecteur = [
  {
    heure: "07:30",
    action: "Consultation du dashboard",
    description:
      "En arrivant, vous consultez les indicateurs clés : absences du jour, alertes, messages importants. Vue d'ensemble en 30 secondes.",
    icon: LayoutDashboard,
  },
  {
    heure: "09:00",
    action: "Notification automatique",
    description:
      "iDETUDE vous alerte : 3 élèves absents non justifiés. Les parents ont déjà été notifiés automatiquement par SMS.",
    icon: Bell,
  },
  {
    heure: "11:00",
    action: "Validation de documents",
    description:
      "Depuis votre téléphone, vous validez les attestations de scolarité demandées par les parents. Génération PDF instantanée.",
    icon: FileCheck,
  },
  {
    heure: "14:00",
    action: "Point financier",
    description:
      "Consultation rapide de l'état des paiements. 5 familles en retard, relance automatique programmée pour demain.",
    icon: Wallet,
  },
  {
    heure: "16:00",
    action: "Communication parents",
    description:
      "Envoi d'une notification groupée pour rappeler la réunion de demain. 85% des parents reçoivent l'info instantanément.",
    icon: MessageSquare,
  },
  {
    heure: "18:00",
    action: "Bilan de la journée",
    description:
      "Rapport automatique : taux de présence 94%, 12 nouveaux paiements, 0 incident majeur. Vous partez serein.",
    icon: ClipboardCheck,
  },
];

// Testimonials data
const temoignagesEtablissements = [
  {
    quote:
      "Depuis qu'on utilise iDETUDE, notre secrétariat a divisé par 3 le temps passé sur les bulletins. Les parents sont plus impliqués et notre taux de recouvrement a augmenté de 25%. C'est un vrai changement !",
    author: "Jean-Baptiste NDONG",
    role: "Directeur Général",
    etablissement: "Groupe Scolaire La Réussite",
    location: "Libreville, Gabon",
    stats: { temps: "-66%", satisfaction: "98%", recouvrement: "+25%" },
  },
  {
    quote:
      "Au début, j'étais sceptique. Encore un logiciel ! Mais l'équipe iDETUDE nous a accompagnés pas à pas. Aujourd'hui, je ne pourrais plus m'en passer. Mes enseignants gagnent un temps précieux.",
    author: "Marie-Claire OBIANG",
    role: "Proviseure",
    etablissement: "Lycée Technique de la Réconciliation",
    location: "Kinshasa, RDC",
    stats: { temps: "-50%", satisfaction: "95%", adoption: "100%" },
  },
  {
    quote:
      "La carte d'identité numérique a été un game-changer pour nous. Les parents adorent, les élèves sont fiers, et nous avons enfin un suivi précis des présences.",
    author: "Patrick MBOUMBA",
    role: "Fondateur & Directeur",
    etablissement: "École Internationale Horizon",
    location: "Port-Gentil, Gabon",
    stats: { presences: "+15%", fraude: "-100%", image: "⭐⭐⭐⭐⭐" },
  },
];

// Exclusive features data
const featuresExclusives = [
  {
    icon: Building2,
    title: "Multi-Établissements",
    description:
      "Gérez plusieurs écoles depuis un seul compte. Idéal pour les groupes scolaires et fondateurs.",
    badge: "Premium",
  },
  {
    icon: Users,
    title: "Gestion des Droits",
    description:
      "Définissez précisément qui peut voir et modifier quoi. Secrétariat, CPE, Direction : chacun son périmètre.",
    badge: null,
  },
  {
    icon: FileBarChart,
    title: "Rapports Personnalisés",
    description:
      "Créez vos propres rapports avec les indicateurs qui comptent pour votre établissement.",
    badge: null,
  },
  {
    icon: Plug,
    title: "API & Intégrations",
    description:
      "Connectez iDETUDE à vos autres outils : comptabilité, cantine, transport scolaire.",
    badge: "Premium",
  },
  {
    icon: GraduationCap,
    title: "Gestion Orientation",
    description:
      "Suivez les vœux d'orientation, générez les fiches de dialogue, préparez les conseils de classe.",
    badge: null,
  },
  {
    icon: Calendar,
    title: "Emplois du Temps",
    description:
      "Créez et gérez les emplois du temps. Notifications automatiques en cas de changement.",
    badge: "Bientôt",
  },
];

// FAQ data
const faqEtablissements = [
  {
    question: "Combien de temps pour mettre en place iDETUDE ?",
    answer:
      "Le déploiement standard prend 2 à 4 semaines, incluant l'import de vos données, la formation de vos équipes, et une période de test. Notre équipe vous accompagne à chaque étape.",
  },
  {
    question: "Comment migrer nos données existantes ?",
    answer:
      "Nous importons gratuitement vos données depuis Excel, Word, ou tout autre système. Listes d'élèves, enseignants, historiques de notes : tout est transféré sans perte.",
  },
  {
    question: "L'outil fonctionne-t-il hors connexion ?",
    answer:
      "Oui ! L'application mobile permet de saisir notes et présences même sans internet. Les données se synchronisent automatiquement dès qu'une connexion est disponible.",
  },
  {
    question: "Quel accompagnement proposez-vous ?",
    answer:
      "Tous les établissements bénéficient d'une formation initiale et d'un support par email/WhatsApp. Les comptes Premium ont un chef de projet dédié et des formations personnalisées.",
  },
  {
    question: "Peut-on personnaliser les bulletins et documents ?",
    answer:
      "Absolument ! Vous pouvez personnaliser les templates de bulletins, attestations, convocations avec votre logo, vos couleurs, et votre mise en page spécifique.",
  },
  {
    question: "Comment sont sécurisées nos données ?",
    answer:
      "Chiffrement de bout en bout, sauvegardes quotidiennes sur plusieurs serveurs en Afrique, conformité RGPD. Vos données vous appartiennent et sont exportables à tout moment.",
  },
];

const Etablissements = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* SECTION 1: HERO */}
      <section className="pt-24 pb-16 md:pt-32 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              {/* Badge */}
              <span className="inline-flex items-center px-4 py-2 rounded-full glass-card text-sm">
                🏫 Pour les Directeurs, Proviseurs et Fondateurs
              </span>

              {/* Titre */}
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Modernisez votre établissement et{" "}
                <span className="text-primary">gagnez en efficacité</span>
              </h1>

              {/* Sous-titre */}
              <p className="text-xl text-muted-foreground">
                Rejoignez les établissements africains qui ont fait le choix de
                la transformation numérique. Automatisez l'administration,
                pilotez avec des données, et valorisez votre image.
              </p>

              {/* Stats rapides */}
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">10h</p>
                  <p className="text-sm text-muted-foreground">
                    économisées/semaine
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">+25%</p>
                  <p className="text-sm text-muted-foreground">
                    taux de recouvrement
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">98%</p>
                  <p className="text-sm text-muted-foreground">
                    satisfaction directeurs
                  </p>
                </div>
              </div>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-4">
                <GlassButton variant="primary" size="lg" href="#contact">
                  <Calendar className="mr-2 h-5 w-5" /> Demander une Démo
                  Personnalisée
                </GlassButton>
                <GlassButton
                  variant="outline"
                  size="lg"
                  href="/demo?role=admin"
                >
                  <Play className="mr-2 h-5 w-5" /> Voir l'Interface Directeur
                </GlassButton>
              </div>
            </div>

            {/* Illustration placeholder */}
            <div className="relative animate-fade-in" style={{ animationDelay: "200ms" }}>
              <GlassCard className="p-8 aspect-square flex items-center justify-center">
                <div className="text-center space-y-4">
                  <Building2 className="h-24 w-24 mx-auto text-primary/50" />
                  <p className="text-muted-foreground">
                    Illustration Direction Moderne
                  </p>
                </div>
              </GlassCard>

              {/* Badges flottants */}
              <div className="absolute -bottom-4 -left-4 glass-card p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <CheckCircle className="text-green-500 h-5 w-5" />
                  <span className="text-sm font-medium">Bulletin généré</span>
                </div>
              </div>
              <div
                className="absolute -top-4 -right-4 glass-card p-4 animate-pulse"
                style={{ animationDelay: "200ms" }}
              >
                <div className="flex items-center gap-2">
                  <TrendingUp className="text-primary h-5 w-5" />
                  <span className="text-sm font-medium">+15% présences</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: PROBLÈMES */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-destructive mb-2 block">
              ⚠️ LES DÉFIS QUOTIDIENS
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Les problèmes que vous connaissez trop bien
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ces obstacles freinent votre établissement et épuisent vos équipes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {problemsEtablissements.map((problem, i) => (
              <GlassCard
                key={problem.title}
                className="p-6 group hover:border-destructive/30 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
                    <problem.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold">{problem.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {problem.description}
                </p>
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <span className="text-2xl">{problem.stat}</span>
                  <span className="text-xs">{problem.statLabel}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 3: SOLUTIONS */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              ✨ LA SOLUTION iDETUDE
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tout ce dont votre établissement a besoin
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des outils puissants et simples pour transformer votre gestion
              quotidienne
            </p>
          </div>

          {solutionsEtablissements.map((solution, i) => (
            <div
              key={solution.title}
              className={`grid lg:grid-cols-2 gap-12 items-center mb-16 lg:mb-24 ${
                i % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >
              {/* Image placeholder */}
              <div className="relative animate-fade-in">
                <GlassCard className="p-8 aspect-video flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <LayoutDashboard className="h-16 w-16 mx-auto text-primary/50" />
                    <p className="text-muted-foreground">{solution.title}</p>
                  </div>
                </GlassCard>
                {/* Badge démo */}
                <a
                  href={solution.demo}
                  className="absolute -bottom-4 left-1/2 -translate-x-1/2 glass-card px-4 py-2 
                           flex items-center gap-2 hover:bg-primary/10 transition-colors"
                >
                  <Play size={16} /> Voir en démo
                </a>
              </div>

              {/* Contenu */}
              <div className="space-y-6 animate-fade-in" style={{ animationDelay: "100ms" }}>
                <h3 className="text-2xl font-bold">{solution.title}</h3>
                <p className="text-muted-foreground">{solution.description}</p>
                <ul className="space-y-3">
                  {solution.features.map((feature, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <CheckCircle className="text-green-500 shrink-0 h-5 w-5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4: PARCOURS UTILISATEUR */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              📅 VOTRE QUOTIDIEN SIMPLIFIÉ
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Une journée type avec iDETUDE
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment iDETUDE s'intègre naturellement dans votre
              quotidien
            </p>
          </div>

          <div className="relative max-w-4xl mx-auto">
            {/* Ligne verticale */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20 hidden md:block" />

            {journeeDirecteur.map((etape, i) => (
              <div
                key={etape.heure}
                className="relative flex flex-col md:flex-row gap-4 md:gap-6 mb-8 animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Point sur la timeline */}
                <div
                  className="relative z-10 flex items-center justify-center w-16 h-16 
                              rounded-full glass-card border-2 border-primary shrink-0"
                >
                  <etape.icon className="text-primary h-6 w-6" />
                </div>

                {/* Contenu */}
                <GlassCard className="flex-1 p-4 md:p-6 glass-hover">
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {etape.heure}
                    </span>
                    <h4 className="font-semibold">{etape.action}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {etape.description}
                  </p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 5: TÉMOIGNAGES */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              💬 ILS TÉMOIGNENT
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              La parole aux directeurs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {temoignagesEtablissements.map((temoignage, i) => (
              <GlassCard
                key={temoignage.author}
                className="p-6 flex flex-col animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {/* Citation */}
                <div className="flex-1 mb-6">
                  <Quote className="text-primary/30 mb-4 h-8 w-8" />
                  <p className="text-muted-foreground italic">
                    "{temoignage.quote}"
                  </p>
                </div>

                {/* Auteur */}
                <div className="flex items-center gap-4 mb-4 pt-4 border-t border-border/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{temoignage.author}</p>
                    <p className="text-xs text-muted-foreground">
                      {temoignage.role}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {temoignage.etablissement}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 pt-4 border-t border-border/50">
                  {Object.entries(temoignage.stats).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <p className="text-lg font-bold text-primary">{value}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {key}
                      </p>
                    </div>
                  ))}
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 6: FONCTIONNALITÉS EXCLUSIVES */}
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              🎯 FONCTIONNALITÉS AVANCÉES
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Des outils pensés pour les directeurs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresExclusives.map((feature, i) => (
              <GlassCard
                key={feature.title}
                className="p-6 relative animate-fade-in"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                {feature.badge && (
                  <span
                    className={`absolute top-4 right-4 text-xs px-2 py-1 rounded-full ${
                      feature.badge === "Premium"
                        ? "bg-amber-500/10 text-amber-500"
                        : "bg-blue-500/10 text-blue-500"
                    }`}
                  >
                    {feature.badge}
                  </span>
                )}
                <div className="p-3 rounded-xl bg-primary/10 w-fit mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              ❓ FAQ
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Questions fréquentes des directeurs
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <Accordion type="single" collapsible className="space-y-4">
              {faqEtablissements.map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="glass-card rounded-xl px-6 border-none"
                >
                  <AccordionTrigger className="text-left hover:no-underline py-4">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* SECTION 8: TARIFICATION */}
      <PersonaPricing
        title="Choisissez le plan adapté à votre établissement"
        subtitle="Des solutions flexibles pour toutes les tailles d'établissement"
        plans={ETABLISSEMENT_PLANS}
        persona="etablissement"
      />

      {/* SECTION 9: CTA FINAL */}
      <section id="contact" className="py-16 md:py-24 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à moderniser votre établissement ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Rejoignez les écoles qui ont choisi l'efficacité. Démo gratuite,
              sans engagement.
            </p>

            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <GlassButton variant="primary" size="lg">
                <Calendar className="mr-2 h-5 w-5" /> Planifier une Démo (30
                min)
              </GlassButton>
              <GlassButton variant="outline" size="lg">
                <FileText className="mr-2 h-5 w-5" /> Télécharger la Brochure
              </GlassButton>
            </div>

            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="text-green-500 h-4 w-4" /> Démo
                personnalisée
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="text-green-500 h-4 w-4" /> Sans
                engagement
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="text-green-500 h-4 w-4" />{" "}
                Accompagnement inclus
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Etablissements;
