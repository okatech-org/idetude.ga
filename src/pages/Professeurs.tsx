import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Play,
  BookOpen,
  Clock,
  Calculator,
  FileStack,
  MessageSquareOff,
  CheckCircle,
  QrCode,
  Edit,
  MessageSquare,
  BarChart2,
  FileCheck,
  Quote,
  Users,
  FolderOpen,
  Laptop,
  Calendar,
  Wifi,
  HelpCircle,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { PersonaPricing, PROFESSEUR_PLANS } from "@/components/landing/PersonaPricing";

const problemsProfs = [
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Appel qui s'éternise",
    description: "10-15 minutes par cours à faire l'appel sur papier. Du temps précieux perdu sur l'enseignement.",
    stat: "15 min",
    statLabel: "perdues par cours"
  },
  {
    icon: <Calculator className="h-6 w-6" />,
    title: "Calculs de moyennes",
    description: "Additions, coefficients, moyennes trimestrielles... Des heures de calculs avec risque d'erreurs.",
    stat: "3h",
    statLabel: "par bulletin"
  },
  {
    icon: <FileStack className="h-6 w-6" />,
    title: "Paperasse administrative",
    description: "Entre les bulletins, les relevés de notes et les fiches de suivi, l'administratif prend le dessus.",
    stat: "45%",
    statLabel: "du temps de travail"
  },
  {
    icon: <MessageSquareOff className="h-6 w-6" />,
    title: "Communication complexe",
    description: "Difficile de joindre les parents. Les carnets ne reviennent pas signés. Les messages se perdent.",
    stat: "60%",
    statLabel: "messages non lus"
  }
];

const solutionsProfs = [
  {
    title: "Appel Numérique en 30 Secondes",
    description: "Scan du QR code des élèves ou liste de présence en un clic. Plus besoin de papier, les absences sont automatiquement signalées aux parents et à l'administration.",
    features: [
      "Scan QR code ultra-rapide",
      "Liste de pointage en 1 clic",
      "Notification automatique aux parents",
      "Fonctionne hors connexion"
    ]
  },
  {
    title: "Saisie des Notes Simplifiée",
    description: "Interface intuitive sur téléphone ou ordinateur. Saisissez les notes même sans internet, elles se synchronisent automatiquement.",
    features: [
      "Interface simple et rapide",
      "Mode hors connexion",
      "Import depuis Excel",
      "Historique des modifications"
    ]
  },
  {
    title: "Bulletins Pré-Remplis",
    description: "Les moyennes sont calculées automatiquement. Vous n'avez qu'à ajouter vos appréciations. Fini les week-ends de calculs !",
    features: [
      "Calcul automatique des moyennes",
      "Coefficients personnalisables",
      "Appréciations pré-définies",
      "Génération PDF en 1 clic"
    ]
  },
  {
    title: "Suivi des Élèves",
    description: "Visualisez la progression de chaque élève et de vos classes. Identifiez rapidement les élèves en difficulté.",
    features: [
      "Graphiques d'évolution",
      "Alertes décrochage",
      "Comparaison inter-classes",
      "Export des statistiques"
    ]
  },
  {
    title: "Communication Facilitée",
    description: "Envoyez des messages aux parents individuellement ou par groupe. Sans partager votre numéro personnel.",
    features: [
      "Messagerie intégrée",
      "Messages groupés par classe",
      "Pas de numéro perso partagé",
      "Accusés de lecture"
    ]
  }
];

const journeeProf = [
  {
    heure: "08:00",
    action: "Premier cours - Appel express",
    description: "Les élèves scannent leur QR code en entrant. En 30 secondes, l'appel est fait. Vous commencez votre cours immédiatement.",
    icon: <QrCode className="h-5 w-5" />
  },
  {
    heure: "09:45",
    action: "Saisie de notes rapide",
    description: "Pendant l'interclasse, vous saisissez les notes du dernier devoir sur votre téléphone. 5 minutes suffisent.",
    icon: <Edit className="h-5 w-5" />
  },
  {
    heure: "12:00",
    action: "Notification parent",
    description: "Vous envoyez un message aux parents d'un élève en difficulté pour proposer un point. Envoi en 2 clics.",
    icon: <MessageSquare className="h-5 w-5" />
  },
  {
    heure: "15:30",
    action: "Consultation du tableau de bord",
    description: "En salle des profs, vous consultez les stats de vos classes. La 3ème B a baissé, il faudra en parler au conseil.",
    icon: <BarChart2 className="h-5 w-5" />
  },
  {
    heure: "18:00",
    action: "Préparation bulletin",
    description: "Les moyennes sont déjà calculées. Vous ajoutez juste vos appréciations. En 30 minutes, c'est bouclé.",
    icon: <FileCheck className="h-5 w-5" />
  }
];

const temoignagesProfs = [
  {
    quote: "Je gagnais 1h par semaine rien que sur l'appel. Et pour les bulletins, c'est le jour et la nuit : avant je passais mes week-ends dessus, maintenant c'est fait en une soirée.",
    author: "Patrick MOUSSAVOU",
    role: "Professeur de Mathématiques",
    etablissement: "Lycée National Léon Mba",
    location: "Libreville, Gabon"
  },
  {
    quote: "L'outil est vraiment intuitif. Même mes collègues les moins à l'aise avec la technologie ont adopté iDETUDE en quelques jours. Le support est réactif quand on a des questions.",
    author: "Jeanne MBONGO",
    role: "Professeure de Français",
    etablissement: "Collège Saint-Joseph",
    location: "Kinshasa, RDC"
  },
  {
    quote: "Ce que j'apprécie le plus, c'est le suivi des élèves. Je vois immédiatement qui décroche et je peux réagir avant qu'il ne soit trop tard. C'est un vrai outil pédagogique.",
    author: "Michel ONDO",
    role: "Professeur Principal de 3ème",
    etablissement: "Lycée Paul Indjendjet Gondjout",
    location: "Libreville, Gabon"
  }
];

const featuresProfs = [
  {
    icon: <FolderOpen className="h-6 w-6" />,
    title: "Ressources Partagées",
    description: "Partagez vos cours, exercices et supports avec vos collègues. Bibliothèque pédagogique collaborative.",
    badge: null
  },
  {
    icon: <Laptop className="h-6 w-6" />,
    title: "Exercices en Ligne",
    description: "Créez des exercices et quiz que les élèves peuvent faire en ligne. Correction automatique.",
    badge: "Bientôt"
  },
  {
    icon: <Calendar className="h-6 w-6" />,
    title: "Planning Personnel",
    description: "Gérez votre emploi du temps, vos cours et vos disponibilités depuis l'application.",
    badge: null
  },
  {
    icon: <BarChart2 className="h-6 w-6" />,
    title: "Statistiques Détaillées",
    description: "Analysez les performances de vos classes avec des graphiques et indicateurs précis.",
    badge: null
  },
  {
    icon: <Wifi className="h-6 w-6" />,
    title: "Mode Hors Connexion",
    description: "Travaillez même sans internet. Tout se synchronise automatiquement dès que vous êtes connecté.",
    badge: null
  },
  {
    icon: <HelpCircle className="h-6 w-6" />,
    title: "Support Dédié",
    description: "Une équipe disponible par email et WhatsApp pour répondre à toutes vos questions.",
    badge: null
  }
];

const faqProfs = [
  {
    question: "Dois-je être à l'aise avec la technologie ?",
    answer: "Pas du tout ! iDETUDE est conçu pour être simple et intuitif. La plupart des enseignants maîtrisent l'outil en moins d'une heure. Et notre équipe support est là pour vous aider à tout moment."
  },
  {
    question: "Puis-je saisir les notes hors connexion ?",
    answer: "Oui ! L'application mobile fonctionne même sans internet. Vous saisissez vos notes, et elles se synchronisent automatiquement dès que vous retrouvez une connexion."
  },
  {
    question: "Comment fonctionne l'appel par QR code ?",
    answer: "Chaque élève a un QR code unique sur son téléphone ou carte. Vous scannez leur code avec votre téléphone, et l'appel est enregistré automatiquement. C'est aussi simple que scanner un ticket de caisse !"
  },
  {
    question: "Les parents voient-ils les notes tout de suite ?",
    answer: "Vous contrôlez ! Vous pouvez choisir de rendre les notes visibles immédiatement ou de les \"publier\" plus tard, par exemple après correction de toutes les copies."
  },
  {
    question: "Est-ce que ça remplace le cahier de textes ?",
    answer: "Oui, iDETUDE inclut un cahier de textes numérique. Vous y notez le contenu de vos cours, les devoirs à faire, et tout est visible par les élèves et parents."
  },
  {
    question: "Mon établissement n'utilise pas encore iDETUDE, que faire ?",
    answer: "Parlez-en à votre direction ! Vous pouvez leur suggérer de demander une démo gratuite. De nombreux établissements ont été convaincus par leurs enseignants."
  }
];

const Professeurs = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <span className="inline-flex items-center px-4 py-2 rounded-full glass-card text-sm font-medium">
                👨‍🏫 Pour les Enseignants et Professeurs
              </span>
              
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Concentrez-vous sur l'enseignement,{" "}
                <span className="text-primary">pas la paperasse</span>
              </h1>
              
              <p className="text-xl text-muted-foreground">
                Des outils simples qui vous font gagner du temps chaque jour. 
                Saisissez les notes en un clic, faites l'appel en 30 secondes, 
                suivez vos élèves facilement.
              </p>
              
              <div className="flex flex-wrap gap-8">
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">1h</p>
                  <p className="text-sm text-muted-foreground">économisée/semaine</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">-80%</p>
                  <p className="text-sm text-muted-foreground">temps bulletins</p>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-primary">4.8/5</p>
                  <p className="text-sm text-muted-foreground">note enseignants</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <GlassButton href="/demo?role=teacher" size="lg">
                  <Play className="mr-2 h-5 w-5" /> Voir l'Interface Enseignant
                </GlassButton>
                <GlassButton href="/tutoriels?filter=professeur" variant="outline" size="lg">
                  <BookOpen className="mr-2 h-5 w-5" /> Voir les Tutoriels
                </GlassButton>
              </div>
            </div>
            
            <div className="relative animate-fade-in delay-200">
              <GlassCard className="p-8 relative overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 mx-auto rounded-full bg-primary/20 flex items-center justify-center">
                      <BookOpen className="h-12 w-12 text-primary" />
                    </div>
                    <p className="text-lg font-medium">Enseignement simplifié</p>
                    <p className="text-sm text-muted-foreground">Notes • Appel • Bulletins</p>
                  </div>
                </div>
              </GlassCard>
              
              <div className="absolute -bottom-4 -left-4 glass-card p-4 animate-bounce">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm font-medium">Appel terminé ✓</span>
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
              ⚠️ LES DÉFIS QUOTIDIENS
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ce que vivent les enseignants aujourd'hui
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              L'administratif prend trop de place sur le pédagogique
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {problemsProfs.map((problem, i) => (
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
              Des outils qui vous simplifient la vie
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Concentrez-vous sur ce qui compte vraiment : enseigner
            </p>
          </div>
          
          <div className="space-y-16">
            {solutionsProfs.map((solution, i) => (
              <div 
                key={i}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  i % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                <div className={`${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <GlassCard className="p-8 aspect-video flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="text-center">
                      <Edit className="h-16 w-16 text-primary mx-auto mb-4" />
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
            
            {journeeProf.map((etape, i) => (
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
              La parole aux enseignants
            </h2>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {temoignagesProfs.map((temoignage, i) => (
              <GlassCard key={i} className="p-6 flex flex-col">
                <div className="flex-1 mb-6">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-muted-foreground italic">"{temoignage.quote}"</p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{temoignage.author}</p>
                    <p className="text-xs text-muted-foreground">{temoignage.role}</p>
                    <p className="text-xs text-muted-foreground">{temoignage.etablissement}</p>
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
              ⚡ FONCTIONNALITÉS ENSEIGNANTS
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tout pour enseigner sereinement
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuresProfs.map((feature, i) => (
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
            {faqProfs.map((faq, i) => (
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
        title="Choisissez vos outils d'enseignant"
        subtitle="Gratuit via votre établissement, options avancées disponibles"
        plans={PROFESSEUR_PLANS}
        persona="professeur"
      />

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary/5">
        <div className="container mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Prêt à simplifier votre quotidien ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Découvrez comment iDETUDE peut vous faire gagner du temps 
              et améliorer votre enseignement.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <GlassButton href="/demo?role=teacher" size="lg">
                <Play className="mr-2 h-5 w-5" /> Essayer la Démo Enseignant
              </GlassButton>
              <GlassButton href="/tutoriels" variant="outline" size="lg">
                <BookOpen className="mr-2 h-5 w-5" /> Voir les Tutoriels
              </GlassButton>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Interface intuitive
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Mode hors connexion
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Support réactif
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Professeurs;
