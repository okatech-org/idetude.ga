import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Play,
  School,
  Bell,
  Clock,
  MessageSquareOff,
  Eye,
  AlertTriangle,
  CheckCircle,
  Star,
  BookOpen,
  MapPin,
  ClipboardCheck,
  Users,
  CreditCard,
  Languages,
  Smartphone,
  Lock,
  Send,
  Quote,
  ChevronDown,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PersonaPricing, PARENT_PLANS } from "@/components/landing/PersonaPricing";

const problemsParents = [
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Informations en retard",
    description: "Vous découvrez les problèmes seulement au bulletin, quand il est souvent trop tard pour réagir.",
    stat: "3 mois",
    statLabel: "avant d'être informé"
  },
  {
    icon: <MessageSquareOff className="h-6 w-6" />,
    title: "Communication difficile",
    description: "Impossible de joindre les professeurs facilement. Les carnets ne sont jamais signés à temps.",
    stat: "72%",
    statLabel: "messages non lus"
  },
  {
    icon: <Eye className="h-6 w-6" />,
    title: "Manque de visibilité",
    description: "Vous ne savez pas ce qui se passe à l'école : devoirs, comportement, absences passent inaperçus.",
    stat: "0",
    statLabel: "suivi en temps réel"
  },
  {
    icon: <AlertTriangle className="h-6 w-6" />,
    title: "Mauvaises surprises",
    description: "Découvrir une chute de moyenne ou des absences répétées après plusieurs semaines est stressant.",
    stat: "85%",
    statLabel: "parents stressés"
  }
];

const solutionsParents = [
  {
    title: "Notifications Instantanées",
    description: "Recevez une alerte dès que votre enfant est absent, en retard, ou a une nouvelle note. Réagissez immédiatement.",
    features: [
      "Alertes absence en temps réel",
      "Nouvelles notes notifiées",
      "Rappels devoirs et examens",
      "Personnalisation des alertes"
    ]
  },
  {
    title: "Consultation des Notes 24/7",
    description: "Accédez aux notes, moyennes et bulletins depuis votre téléphone à tout moment. Plus besoin d'attendre le papier.",
    features: [
      "Notes par matière et période",
      "Moyenne générale et de classe",
      "Bulletins téléchargeables",
      "Historique complet"
    ]
  },
  {
    title: "Communication Directe",
    description: "Échangez avec les enseignants et l'administration sans chercher de numéros. Tout est centralisé.",
    features: [
      "Messagerie intégrée",
      "Demande de RDV en 1 clic",
      "Justificatifs d'absence en ligne",
      "Historique des échanges"
    ]
  },
  {
    title: "Suivi de la Progression",
    description: "Visualisez l'évolution de votre enfant sur les semaines et mois. Identifiez les matières à renforcer.",
    features: [
      "Graphiques d'évolution",
      "Comparaison avec la classe",
      "Alertes en cas de baisse",
      "Conseils personnalisés"
    ]
  }
];

const journeeParent = [
  {
    heure: "07:45",
    action: "Notification d'arrivée",
    description: "Votre enfant a scanné son QR code à l'entrée de l'école. Vous savez qu'il est bien arrivé.",
    icon: <MapPin className="h-5 w-5" />
  },
  {
    heure: "10:30",
    action: "Nouvelle note reçue",
    description: "Notification : 'Emma a obtenu 16/20 en Mathématiques'. Vous pouvez la féliciter ce soir !",
    icon: <Star className="h-5 w-5" />
  },
  {
    heure: "14:00",
    action: "Rappel de devoir",
    description: "iDETUDE vous rappelle : 'Devoir de SVT pour demain'. Vous vérifierez ce soir qu'il est fait.",
    icon: <BookOpen className="h-5 w-5" />
  },
  {
    heure: "16:30",
    action: "Fin des cours",
    description: "Notification de sortie de l'école. Vous savez que votre enfant a terminé sa journée.",
    icon: <School className="h-5 w-5" />
  },
  {
    heure: "20:00",
    action: "Bilan de la semaine",
    description: "Vous consultez le résumé hebdomadaire : présences, notes, comportement. Tout va bien !",
    icon: <ClipboardCheck className="h-5 w-5" />
  }
];

const temoignagesParents = [
  {
    quote: "Avant, j'apprenais les problèmes de mon fils une fois par trimestre. Maintenant, je reçois une notification dès qu'il a une mauvaise note et je peux réagir tout de suite. C'est un changement énorme !",
    author: "Françoise MABIKA",
    role: "Mère de 3 enfants",
    location: "Pointe-Noire, Congo"
  },
  {
    quote: "Je voyage beaucoup pour le travail. Avec iDETUDE, je reste connecté à la scolarité de mes enfants même à distance. Je peux voir les notes, échanger avec les profs, tout depuis mon téléphone.",
    author: "Emmanuel NDOYE",
    role: "Père de 2 enfants",
    location: "Libreville, Gabon"
  },
  {
    quote: "La notification d'absence en temps réel m'a permis de découvrir que mon fils séchait les cours. Sans iDETUDE, je ne l'aurais su qu'au conseil de classe !",
    author: "Solange BONGO",
    role: "Mère d'un adolescent",
    location: "Franceville, Gabon"
  }
];

const featuresParents = [
  {
    icon: <Bell className="h-6 w-6" />,
    title: "Alertes Personnalisables",
    description: "Choisissez les notifications que vous voulez recevoir : toutes les notes, seulement les mauvaises, absences uniquement...",
    badge: null
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: "Multi-Enfants",
    description: "Suivez tous vos enfants depuis le même compte, même s'ils sont dans des écoles différentes.",
    badge: null
  },
  {
    icon: <CreditCard className="h-6 w-6" />,
    title: "Paiement en Ligne",
    description: "Réglez les frais de scolarité directement depuis l'app. Historique et reçus disponibles.",
    badge: "Bientôt"
  },
  {
    icon: <Languages className="h-6 w-6" />,
    title: "Multi-Langues",
    description: "Interface disponible en français, anglais, et bientôt dans les langues locales.",
    badge: null
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Fonctionne par SMS",
    description: "Pas de smartphone ? Recevez les infos essentielles par SMS et consultez via navigateur web.",
    badge: null
  },
  {
    icon: <Lock className="h-6 w-6" />,
    title: "Données Protégées",
    description: "Vos informations familiales sont chiffrées et ne sont jamais partagées avec des tiers.",
    badge: null
  }
];

const faqParents = [
  {
    question: "Dois-je avoir un smartphone pour utiliser iDETUDE ?",
    answer: "Non ! Vous pouvez recevoir les notifications par SMS et consulter les informations via un navigateur web sur n'importe quel téléphone. L'application mobile offre plus de fonctionnalités mais n'est pas obligatoire."
  },
  {
    question: "Est-ce gratuit pour les parents ?",
    answer: "Oui, iDETUDE est entièrement gratuit pour les parents. C'est l'établissement qui souscrit à la plateforme et vous y avez accès automatiquement."
  },
  {
    question: "Mon école n'utilise pas encore iDETUDE, que faire ?",
    answer: "Vous pouvez suggérer iDETUDE à la direction de l'école de votre enfant. Utilisez notre formulaire 'Suggérer à mon école' et nous les contacterons pour leur présenter la solution."
  },
  {
    question: "Puis-je suivre plusieurs enfants ?",
    answer: "Absolument ! Vous pouvez suivre tous vos enfants depuis le même compte, même s'ils sont dans des écoles différentes (si ces écoles utilisent iDETUDE)."
  },
  {
    question: "Les deux parents peuvent-ils avoir accès ?",
    answer: "Oui, les deux parents (ou tuteurs légaux) peuvent avoir leur propre accès avec leurs identifiants personnels. Les droits peuvent être configurés différemment si nécessaire."
  },
  {
    question: "Comment puis-je justifier une absence ?",
    answer: "Directement depuis l'application ! Vous sélectionnez l'absence, ajoutez le motif, et si nécessaire, joignez un document (certificat médical par exemple). L'école reçoit la justification instantanément."
  }
];

const Parents = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <span className="inline-flex items-center px-4 py-2 rounded-full glass-card text-sm font-medium">
                👨‍👩‍👧 Pour les Parents et Tuteurs
              </span>
              
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Suivez la scolarité de vos enfants{" "}
                <span className="text-primary">en temps réel</span>
              </h1>
              
              <p className="text-xl text-muted-foreground">
                Plus besoin d'attendre les réunions ou de chercher le carnet. 
                Notes, absences, devoirs : tout dans votre poche, 24h/24.
              </p>
              
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">3 sec</p>
                  <p className="text-sm text-muted-foreground">pour voir les notes</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">100%</p>
                  <p className="text-sm text-muted-foreground">absences notifiées</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">89%</p>
                  <p className="text-sm text-muted-foreground">parents + impliqués</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <GlassButton href="/demo?role=parent" size="lg">
                  <Play className="mr-2 h-5 w-5" /> Voir l'Application Parent
                </GlassButton>
                <GlassButton href="#suggest" variant="outline" size="lg">
                  <School className="mr-2 h-5 w-5" /> Suggérer à mon École
                </GlassButton>
              </div>
            </div>
            
            <div className="relative animate-fade-in delay-200">
              <GlassCard className="p-8 relative overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <Users className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-lg font-medium">Suivi en temps réel</p>
                    <p className="text-sm text-muted-foreground">Notes • Absences • Devoirs</p>
                  </div>
                </div>
              </GlassCard>
              
              <div className="absolute -top-4 -right-4 glass-card p-4 animate-bounce">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Nouvelle note : 16/20 ✨</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-destructive mb-2 block">
              ⚠️ LES FRUSTRATIONS QUOTIDIENNES
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ce que vivent les parents aujourd'hui
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ces situations vous parlent ? Vous n'êtes pas seuls.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemsParents.map((problem, i) => (
              <GlassCard key={i} className="p-6 hover:border-destructive/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive">
                    {problem.icon}
                  </div>
                </div>
                <h3 className="font-semibold mb-2">{problem.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">{problem.description}</p>
                <div className="flex items-center gap-2 text-destructive font-medium">
                  <span className="text-2xl">{problem.stat}</span>
                  <span className="text-xs">{problem.statLabel}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              ✨ LA SOLUTION iDETUDE
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Restez connecté à la scolarité de vos enfants
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Des outils simples pour être informé et impliqué au quotidien
            </p>
          </div>
          
          <div className="space-y-16">
            {solutionsParents.map((solution, i) => (
              <div 
                key={i}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <GlassCard className="p-8 aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="text-center">
                      <Bell className="h-16 w-16 text-primary mx-auto mb-4" />
                      <p className="text-lg font-medium">{solution.title}</p>
                    </div>
                  </GlassCard>
                </div>
                
                <div className={`space-y-6 ${i % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <h3 className="text-2xl font-bold">{solution.title}</h3>
                  <p className="text-muted-foreground">{solution.description}</p>
                  <ul className="space-y-3">
                    {solution.features.map((feature, j) => (
                      <li key={j} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              📅 VOTRE QUOTIDIEN SIMPLIFIÉ
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Une journée type avec iDETUDE
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment iDETUDE vous accompagne tout au long de la journée
            </p>
          </div>
          
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-primary/20" />
            
            {journeeParent.map((etape, i) => (
              <div key={i} className="relative flex gap-6 mb-8">
                <div className="relative z-10 flex items-center justify-center w-16 h-16 rounded-full glass-card border-2 border-primary shrink-0">
                  <div className="text-primary">{etape.icon}</div>
                </div>
                
                <GlassCard className="flex-1 p-6 hover:scale-[1.02] transition-transform">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                      {etape.heure}
                    </span>
                    <h4 className="font-semibold">{etape.action}</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">{etape.description}</p>
                </GlassCard>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              💬 ILS TÉMOIGNENT
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              La parole aux parents
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {temoignagesParents.map((temoignage, i) => (
              <GlassCard key={i} className="p-6 flex flex-col">
                <div className="flex-1 mb-6">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-muted-foreground italic">"{temoignage.quote}"</p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{temoignage.author}</p>
                    <p className="text-xs text-muted-foreground">{temoignage.role}</p>
                    <p className="text-xs text-muted-foreground">{temoignage.location}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              ⚡ FONCTIONNALITÉS POUR PARENTS
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tout pour rester connecté
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresParents.map((feature, i) => (
              <GlassCard key={i} className="p-6 hover:scale-105 transition-transform">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <span className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary">
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <span className="text-sm font-medium text-primary mb-2 block">
              ❓ QUESTIONS FRÉQUENTES
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Vous avez des questions ?
            </h2>
          </div>
          
          <Accordion type="single" collapsible className="space-y-4">
            {faqParents.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="glass-card rounded-xl px-6">
                <AccordionTrigger className="text-left hover:no-underline">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Pricing Section */}
      <PersonaPricing
        title="Des options pour tous les parents"
        subtitle="Gratuit de base, Premium pour un suivi optimal"
        plans={PARENT_PLANS}
        persona="parent"
      />

      {/* CTA Section */}
      <section id="suggest" className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold mb-6">
                Votre école n'est pas encore sur iDETUDE ?
              </h2>
              <p className="text-xl text-muted-foreground mb-6">
                Suggérez iDETUDE à l'établissement de votre enfant. 
                Nous les contacterons pour leur présenter la solution.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Démarche simple et rapide</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Nous contactons l'école pour vous</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Notification quand l'école adopte iDETUDE</span>
                </li>
              </ul>
            </div>
            
            <GlassCard className="p-8">
              <h3 className="text-xl font-semibold mb-6">Suggérer iDETUDE à mon école</h3>
              <form className="space-y-4">
                <Input placeholder="Votre nom" className="glass-card border-border/30" />
                <Input placeholder="Votre email ou téléphone" className="glass-card border-border/30" />
                <Input placeholder="Nom de l'école de votre enfant" className="glass-card border-border/30" />
                <Input placeholder="Ville / Pays" className="glass-card border-border/30" />
                <Textarea placeholder="Message (optionnel)" className="glass-card border-border/30" />
                <GlassButton className="w-full">
                  <Send className="mr-2 h-5 w-5" /> Envoyer la suggestion
                </GlassButton>
              </form>
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Parents;
