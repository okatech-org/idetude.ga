import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Building2, Users, GraduationCap, BookOpen,
  Clock, BarChart3, UsersRound, Shield, Wallet, QrCode,
  Bell, Smartphone, MessageCircle, CalendarCheck, CreditCard, Target,
  ClipboardCheck, ScanLine, LineChart, FileText, Send, Lock,
  Star, Calendar, ClipboardList, Fingerprint, TrendingUp, HelpCircle,
  Quote
} from "lucide-react";
import { cn } from "@/lib/utils";

const personas = {
  etablissements: {
    icon: Building2,
    headline: "Modernisez votre établissement et gagnez en efficacité",
    subheadline: "Rejoignez les établissements qui ont fait le choix de la transformation numérique",
    benefits: [
      { icon: Clock, title: "Gagnez 10h/semaine", description: "Automatisez les tâches administratives répétitives : bulletins, attestations, convocations" },
      { icon: BarChart3, title: "Pilotez avec des données", description: "Tableaux de bord en temps réel : taux de présence, moyennes par classe, paiements" },
      { icon: UsersRound, title: "Fédérez votre équipe", description: "Une plateforme unique pour tout le personnel : direction, secrétariat, CPE, enseignants" },
      { icon: Shield, title: "Sécurisez les données", description: "Conformité RGPD, données hébergées en Afrique, sauvegardes automatiques" },
      { icon: Wallet, title: "Optimisez vos recettes", description: "Suivi des frais de scolarité, relances automatiques, taux de recouvrement amélioré" },
      { icon: QrCode, title: "Valorisez votre image", description: "Carte d'identité numérique avec QR code pour vos élèves : moderne et sécurisé" },
    ],
    testimonial: {
      quote: "Depuis qu'on utilise iDETUDE, notre secrétariat a divisé par 3 le temps passé sur les bulletins. Les parents sont plus impliqués et notre taux de recouvrement a augmenté de 25%.",
      author: "M. Jean-Baptiste NDONG",
      role: "Directeur, Groupe Scolaire La Réussite",
      location: "Libreville, Gabon",
    },
    cta: { primary: { text: "Demander une démo personnalisée", href: "#contact" }, secondary: { text: "Voir les tarifs établissements", href: "#pricing" } },
    stats: [
      { value: "40%", label: "de temps administratif économisé" },
      { value: "25%", label: "d'amélioration du recouvrement" },
      { value: "98%", label: "de satisfaction des directeurs" },
    ],
  },
  parents: {
    icon: Users,
    headline: "Suivez la scolarité de vos enfants en temps réel",
    subheadline: "Plus besoin d'attendre les réunions ou de chercher le carnet de correspondance",
    benefits: [
      { icon: Bell, title: "Soyez alerté immédiatement", description: "Notification instantanée en cas d'absence, de retard ou de nouvelle note" },
      { icon: Smartphone, title: "Consultez les notes à tout moment", description: "Accédez aux notes, moyennes et bulletins depuis votre téléphone, 24h/24" },
      { icon: MessageCircle, title: "Communiquez facilement", description: "Échangez directement avec les enseignants et l'administration via l'application" },
      { icon: CalendarCheck, title: "Ne ratez plus rien", description: "Emploi du temps, devoirs, réunions : tout est dans votre poche" },
      { icon: CreditCard, title: "Payez en toute simplicité", description: "Réglez les frais de scolarité en ligne, suivez vos paiements" },
      { icon: Target, title: "Accompagnez mieux", description: "Identifiez rapidement les difficultés et réagissez avant qu'il ne soit trop tard" },
    ],
    testimonial: {
      quote: "Avant, j'apprenais les problèmes de mon fils une fois par trimestre. Maintenant, je reçois une notification dès qu'il a une mauvaise note et je peux réagir tout de suite. C'est un changement énorme !",
      author: "Mme Françoise MABIKA",
      role: "Mère de 3 enfants scolarisés",
      location: "Pointe-Noire, Congo",
    },
    cta: { primary: { text: "Télécharger l'application", href: "#download" }, secondary: { text: "Voir une démo parent", href: "/demo?role=parent" } },
    stats: [
      { value: "3 sec", label: "pour voir les notes de votre enfant" },
      { value: "100%", label: "des absences notifiées en temps réel" },
      { value: "89%", label: "des parents se sentent plus impliqués" },
    ],
  },
  professeurs: {
    icon: BookOpen,
    headline: "Concentrez-vous sur l'enseignement, pas la paperasse",
    subheadline: "Des outils simples qui vous font gagner du temps chaque jour",
    benefits: [
      { icon: ClipboardCheck, title: "Saisissez les notes facilement", description: "Interface intuitive sur téléphone ou ordinateur, même hors connexion" },
      { icon: ScanLine, title: "Faites l'appel en 30 secondes", description: "Scan du QR code ou liste de présence en un clic, fini les 10 minutes perdues" },
      { icon: LineChart, title: "Visualisez les progrès", description: "Graphiques d'évolution par élève et par classe pour adapter votre pédagogie" },
      { icon: FileText, title: "Bulletins pré-remplis", description: "Les moyennes sont calculées automatiquement, vous n'avez qu'à ajouter les appréciations" },
      { icon: Send, title: "Communiquez avec les parents", description: "Envoyez des messages groupés ou individuels en quelques clics" },
      { icon: Lock, title: "Vos données, votre contrôle", description: "Vous décidez quand rendre visibles les notes aux élèves et parents" },
    ],
    testimonial: {
      quote: "Je gagnais 1h par semaine rien que sur l'appel. Et pour les bulletins, c'est le jour et la nuit : avant je passais mes week-ends dessus, maintenant c'est fait en une soirée.",
      author: "M. Patrick MOUSSAVOU",
      role: "Professeur de Mathématiques",
      location: "Lycée National Léon Mba, Libreville",
    },
    cta: { primary: { text: "Essayer gratuitement", href: "/demo?role=teacher" }, secondary: { text: "Voir le tutoriel prof", href: "/tutoriels?filter=professeur" } },
    stats: [
      { value: "1h", label: "économisée par semaine sur l'appel" },
      { value: "80%", label: "de temps en moins sur les bulletins" },
      { value: "4.8/5", label: "note moyenne des enseignants" },
    ],
  },
  eleves: {
    icon: GraduationCap,
    headline: "Ton école dans ta poche 📱",
    subheadline: "Accède à tout ce dont tu as besoin pour réussir",
    benefits: [
      { icon: Star, title: "Suis tes notes en direct", description: "Plus besoin d'attendre : vois tes notes dès que le prof les saisit" },
      { icon: Calendar, title: "Ton emploi du temps toujours à jour", description: "Changements de salle, profs absents : tu es informé instantanément" },
      { icon: ClipboardList, title: "N'oublie plus tes devoirs", description: "Rappels automatiques pour les devoirs et les dates d'examens" },
      { icon: Fingerprint, title: "Ta carte d'identité numérique", description: "Un QR code unique qui prouve que tu es bien élève de ton établissement" },
      { icon: TrendingUp, title: "Fixe-toi des objectifs", description: "Visualise ta progression et challenge-toi pour t'améliorer" },
      { icon: HelpCircle, title: "Pose tes questions", description: "Contacte tes profs facilement si tu as besoin d'aide" },
    ],
    testimonial: {
      quote: "Avant je perdais toujours mes feuilles de notes. Maintenant tout est dans l'appli, je peux montrer mes progrès à mes parents et ça me motive à faire mieux !",
      author: "Sarah K.",
      role: "Élève de 3ème",
      location: "Collège Saint-Exupéry, Kinshasa",
    },
    cta: { primary: { text: "Découvrir l'appli élève", href: "/demo?role=student" }, secondary: { text: "Demande à ton école", href: "#suggest" } },
    stats: [
      { value: "⭐⭐⭐⭐⭐", label: "notée par les élèves" },
      { value: "0", label: "papier à transporter" },
      { value: "24/7", label: "accès à tes infos" },
    ],
  },
};

type PersonaKey = keyof typeof personas;

interface PersonaContentProps {
  persona: typeof personas[PersonaKey];
}

const PersonaContent = ({ persona }: PersonaContentProps) => (
  <div className="grid lg:grid-cols-3 gap-8">
    {/* Benefits */}
    <div className="lg:col-span-2">
      <h3 className="text-2xl font-bold text-foreground mb-2">{persona.headline}</h3>
      <p className="text-muted-foreground mb-6">{persona.subheadline}</p>
      
      <div className="grid sm:grid-cols-2 gap-4 mb-8">
        {persona.benefits.map((benefit, index) => (
          <div key={index} className="flex gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <benefit.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-semibold text-foreground text-sm">{benefit.title}</h4>
              <p className="text-xs text-muted-foreground">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="flex flex-wrap gap-6 mb-6">
        {persona.stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className="text-2xl font-bold text-primary">{stat.value}</div>
            <div className="text-xs text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-wrap gap-4">
        <GlassButton href={persona.cta.primary.href}>
          {persona.cta.primary.text}
        </GlassButton>
        <GlassButton href={persona.cta.secondary.href} variant="outline">
          {persona.cta.secondary.text}
        </GlassButton>
      </div>
    </div>

    {/* Testimonial */}
    <GlassCard className="p-6 h-fit">
      <Quote className="h-8 w-8 text-primary/30 mb-4" />
      <p className="text-foreground italic mb-6">"{persona.testimonial.quote}"</p>
      <div>
        <p className="font-semibold text-foreground">{persona.testimonial.author}</p>
        <p className="text-sm text-muted-foreground">{persona.testimonial.role}</p>
        <p className="text-xs text-accent">{persona.testimonial.location}</p>
      </div>
    </GlassCard>
  </div>
);

export const PersonaSection = () => {
  const [activeTab, setActiveTab] = useState<PersonaKey>("etablissements");

  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🎯 iDETUDE s'adapte à vos besoins
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment iDETUDE transforme le quotidien de chaque acteur
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as PersonaKey)} className="w-full">
          <TabsList className="w-full max-w-2xl mx-auto grid grid-cols-2 md:grid-cols-4 mb-8 h-auto p-1">
            <TabsTrigger value="etablissements" className="flex items-center gap-2 py-3">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Établissements</span>
              <span className="sm:hidden">Écoles</span>
            </TabsTrigger>
            <TabsTrigger value="parents" className="flex items-center gap-2 py-3">
              <Users className="h-4 w-4" />
              Parents
            </TabsTrigger>
            <TabsTrigger value="professeurs" className="flex items-center gap-2 py-3">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Professeurs</span>
              <span className="sm:hidden">Profs</span>
            </TabsTrigger>
            <TabsTrigger value="eleves" className="flex items-center gap-2 py-3">
              <GraduationCap className="h-4 w-4" />
              Élèves
            </TabsTrigger>
          </TabsList>

          {Object.entries(personas).map(([key, persona]) => (
            <TabsContent key={key} value={key} className="animate-fade-in">
              <GlassCard className="p-6 md:p-8">
                <PersonaContent persona={persona} />
              </GlassCard>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
