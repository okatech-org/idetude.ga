import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Play,
  Eye,
  QrCode,
  LineChart,
  MessageCircle,
  FileText,
  Building2,
  Users,
  GraduationCap,
  BookOpen,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

const stats = [
  { value: "2", label: "Pays", icon: Building2 },
  { value: "7", label: "Établissements", icon: GraduationCap },
  { value: "5000+", label: "Élèves", icon: Users },
  { value: "100+", label: "Enseignants", icon: BookOpen },
];

const features = [
  {
    icon: QrCode,
    title: "Carte d'identité numérique",
    description: "QR code unique pour chaque élève, accès sécurisé et traçabilité complète.",
  },
  {
    icon: LineChart,
    title: "Suivi académique temps réel",
    description: "Visualisez les notes, moyennes et progressions instantanément.",
  },
  {
    icon: Users,
    title: "Gestion des présences IA",
    description: "Appel automatisé intelligent réduisant de 80% le temps administratif.",
  },
  {
    icon: MessageCircle,
    title: "Communication parents-école",
    description: "Messagerie intégrée pour une relation famille-école renforcée.",
  },
  {
    icon: FileText,
    title: "Bulletins automatisés",
    description: "Génération automatique avec 20+ modèles personnalisables.",
  },
  {
    icon: Building2,
    title: "Multi-établissements",
    description: "Gérez plusieurs écoles depuis une seule interface centralisée.",
  },
];

const testimonials = [
  {
    quote: "Depuis l'adoption d'iDETUDE, nous avons réduit de moitié le temps consacré à l'administration.",
    author: "Jean-Baptiste NDONG",
    role: "Directeur, École Primaire Excellence",
    location: "Libreville, Gabon",
  },
  {
    quote: "Je peux enfin suivre les progrès de mes enfants en temps réel depuis mon téléphone.",
    author: "Marie KASONGO",
    role: "Parent d'élèves",
    location: "Kinshasa, RDC",
  },
  {
    quote: "La génération automatique des bulletins nous fait gagner des semaines de travail.",
    author: "Claire OYANE",
    role: "Professeure de Français",
    location: "Libreville, Gabon",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 hero-pattern overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-glass-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <span className="text-sm text-muted-foreground">Disponible au Gabon et en RDC</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Révolutionnez la{" "}
                <span className="text-gradient">gestion scolaire</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
                Une plateforme complète pour connecter établissements, enseignants, 
                élèves et parents. Simplifiez votre quotidien éducatif.
              </p>
              <div className="flex flex-wrap gap-4">
                <GlassButton href="/demo" size="lg">
                  <Play className="h-5 w-5" />
                  Découvrir la Démo
                </GlassButton>
                <GlassButton href="#fonctionnalites" variant="outline" size="lg">
                  <Eye className="h-5 w-5" />
                  Voir les Fonctionnalités
                </GlassButton>
              </div>
            </div>

            {/* Hero Illustration */}
            <div className="relative animate-glass-in delay-200">
              <div className="relative">
                <GlassCard className="p-8 animate-float">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                      <div className="h-24 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-12 w-12 text-primary" />
                      </div>
                      <div className="h-16 rounded-lg bg-accent/20"></div>
                    </div>
                    <div className="space-y-4">
                      <div className="h-16 rounded-lg bg-accent/20"></div>
                      <div className="h-24 rounded-lg bg-primary/10 flex items-center justify-center">
                        <LineChart className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="h-3 rounded bg-primary/20 w-3/4"></div>
                    <div className="h-3 rounded bg-primary/10 w-1/2"></div>
                  </div>
                </GlassCard>
                
                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 w-20 h-20 rounded-2xl glass-card flex items-center justify-center animate-float-delayed">
                  <QrCode className="h-10 w-10 text-primary" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-xl glass-card flex items-center justify-center animate-float">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, index) => (
              <GlassCard
                key={stat.label}
                className="p-6 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <div className="stat-number mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="fonctionnalites" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Fonctionnalités Puissantes
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Tout ce dont vous avez besoin pour gérer efficacement votre établissement scolaire
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <GlassCard
                key={feature.title}
                className="p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Countries Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Présent en Afrique
            </h2>
            <p className="text-lg text-muted-foreground">
              iDETUDE accompagne la transformation numérique de l'éducation
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <GlassCard className="p-8 text-center">
              <div className="text-6xl mb-4">🇬🇦</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">Gabon</h3>
              <p className="text-muted-foreground mb-4">
                1 groupe scolaire • 3 établissements
              </p>
              <GlassButton href="/demo" variant="outline" size="sm">
                Explorer <ArrowRight className="h-4 w-4" />
              </GlassButton>
            </GlassCard>

            <GlassCard className="p-8 text-center">
              <div className="text-6xl mb-4">🇨🇩</div>
              <h3 className="text-2xl font-bold text-foreground mb-2">RDC</h3>
              <p className="text-muted-foreground mb-4">
                4 établissements indépendants
              </p>
              <GlassButton href="/demo" variant="outline" size="sm">
                Explorer <ArrowRight className="h-4 w-4" />
              </GlassButton>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ce qu'ils disent de nous
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <GlassCard
                key={index}
                className="p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <p className="text-foreground mb-6 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold text-foreground">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  <p className="text-xs text-accent">{testimonial.location}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <GlassCard className="p-8 md:p-12 text-center max-w-4xl mx-auto" solid>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Prêt à transformer votre établissement ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez les établissements qui ont déjà adopté iDETUDE et découvrez 
              une nouvelle façon de gérer l'éducation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <GlassButton href="/demo" size="lg">
                <Play className="h-5 w-5" />
                Essayer Gratuitement
              </GlassButton>
              <GlassButton href="/connexion" variant="outline" size="lg">
                Nous Contacter
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
