import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  Play,
  School,
  BarChart2,
  Calendar,
  BookMarked,
  IdCard,
  Target,
  MessageCircle,
  Star,
  Zap,
  Moon,
  WifiOff,
  Lock,
  Quote,
  Users,
  CheckCircle,
  Smartphone,
  Trophy,
  Sparkles,
} from "lucide-react";

const beneficesEleves = [
  {
    icon: <BarChart2 className="h-5 w-5" />,
    title: "Tes notes en direct",
    description: "Plus besoin d'attendre : vois tes notes dès que le prof les saisit. Suis ta moyenne en temps réel.",
    emoji: "📊"
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: "Emploi du temps à jour",
    description: "Changements de salle, profs absents, nouveaux cours : tu es informé instantanément.",
    emoji: "📅"
  },
  {
    icon: <BookMarked className="h-5 w-5" />,
    title: "Rappels de devoirs",
    description: "N'oublie plus jamais un devoir ou une date d'examen. L'appli te rappelle tout !",
    emoji: "📚"
  },
  {
    icon: <IdCard className="h-5 w-5" />,
    title: "Ta carte numérique",
    description: "Un QR code unique qui prouve que tu es bien élève de ton établissement. Stylé et pratique !",
    emoji: "🪪"
  },
  {
    icon: <Target className="h-5 w-5" />,
    title: "Fixe-toi des objectifs",
    description: "Visualise ta progression et challenge-toi pour t'améliorer dans les matières qui comptent.",
    emoji: "🎯"
  },
  {
    icon: <MessageCircle className="h-5 w-5" />,
    title: "Pose tes questions",
    description: "Contacte tes profs facilement si tu as besoin d'aide sur un cours ou un exercice.",
    emoji: "💬"
  }
];

const appFeatures = [
  {
    icon: <Zap className="h-5 w-5" />,
    text: "Chargement ultra-rapide"
  },
  {
    icon: <Moon className="h-5 w-5" />,
    text: "Mode sombre disponible"
  },
  {
    icon: <WifiOff className="h-5 w-5" />,
    text: "Fonctionne hors connexion"
  },
  {
    icon: <Lock className="h-5 w-5" />,
    text: "Tes données restent privées"
  }
];

const temoignagesEleves = [
  {
    quote: "Avant je perdais toujours mes feuilles de notes. Maintenant tout est dans l'appli, je peux montrer mes progrès à mes parents et ça me motive à faire mieux !",
    author: "Sarah K.",
    classe: "3ème B",
    etablissement: "Collège Saint-Exupéry",
    location: "Kinshasa, RDC"
  },
  {
    quote: "Le rappel des devoirs, c'est trop bien ! Je ne me fais plus punir pour devoir oublié. Et je peux voir mes notes directement sans attendre que le prof rende les copies.",
    author: "Kevin M.",
    classe: "Seconde S",
    etablissement: "Lycée Blaise Pascal",
    location: "Libreville, Gabon"
  },
  {
    quote: "La carte numérique c'est stylé ! Mes potes dans d'autres écoles sont jaloux. Et le mode sombre de l'appli est vraiment cool.",
    author: "Fatou D.",
    classe: "1ère ES",
    etablissement: "Lycée National",
    location: "Franceville, Gabon"
  }
];

const funStats = [
  {
    emoji: "⭐",
    value: "4.9/5",
    label: "Noté par les élèves"
  },
  {
    emoji: "📱",
    value: "0",
    label: "Papier à transporter"
  },
  {
    emoji: "🕐",
    value: "24/7",
    label: "Accès à tes infos"
  },
  {
    emoji: "🚀",
    value: "3 sec",
    label: "Pour voir tes notes"
  }
];

const Eleves = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 animate-fade-in">
              <span className="inline-flex items-center px-4 py-2 rounded-full glass-card text-sm font-medium">
                🎓 Pour les Élèves et Étudiants
              </span>
              
              <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
                Ton école dans ta poche 📱
              </h1>
              
              <p className="text-xl text-muted-foreground">
                Notes en direct, emploi du temps toujours à jour, rappels de devoirs... 
                Tout ce qu'il te faut pour réussir, accessible partout, tout le temps.
              </p>
              
              <div className="flex flex-wrap gap-6">
                {funStats.map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-2xl mb-1">{stat.emoji}</p>
                    <p className="text-xl font-bold text-primary">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <GlassButton href="/demo?role=student" size="lg">
                  <Play className="mr-2 h-5 w-5" /> Découvrir l'Appli Élève
                </GlassButton>
                <GlassButton href="#suggest-student" variant="outline" size="lg">
                  <School className="mr-2 h-5 w-5" /> Demande à ton École
                </GlassButton>
              </div>
            </div>
            
            <div className="relative animate-fade-in delay-200">
              <GlassCard className="p-8 relative overflow-hidden">
                <div className="aspect-square bg-gradient-to-br from-primary/20 via-purple-500/10 to-pink-500/10 rounded-2xl flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="text-6xl animate-bounce">📱</div>
                    <p className="text-lg font-medium">L'école 2.0</p>
                    <p className="text-sm text-muted-foreground">Simple • Rapide • Fun</p>
                  </div>
                </div>
              </GlassCard>
              
              <div className="absolute -bottom-4 -left-4 glass-card p-4 animate-bounce">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  <span className="text-sm font-medium">Nouvelle note : 18/20 🎉</span>
                </div>
              </div>
              
              <div className="absolute -top-4 -right-4 glass-card p-4 animate-pulse">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Top 5 de ta classe !</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Tout ce dont tu as besoin pour réussir 🚀
            </h2>
            <p className="text-muted-foreground">
              iDETUDE, c'est ton assistant scolaire dans ta poche
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {beneficesEleves.map((benefice, i) => (
              <GlassCard key={i} className="p-6 hover:scale-105 transition-transform group">
                <div className="text-4xl mb-4 group-hover:animate-bounce">{benefice.emoji}</div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <span className="text-primary">{benefice.icon}</span>
                  {benefice.title}
                </h3>
                <p className="text-sm text-muted-foreground">{benefice.description}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm">
                <Sparkles className="h-4 w-4" /> Nouvelle version
              </div>
              <h2 className="text-3xl font-bold">
                Une appli pensée pour toi 📱
              </h2>
              <p className="text-muted-foreground">
                Interface simple et moderne, navigation intuitive, 
                tout est fait pour que tu trouves tes infos en 2 secondes.
              </p>
              <ul className="space-y-4">
                {appFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {feature.icon}
                    </div>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
              
              <div className="pt-4">
                <GlassButton href="/demo?role=student">
                  <Smartphone className="mr-2 h-5 w-5" /> Voir l'interface en action
                </GlassButton>
              </div>
            </div>
            
            <div className="relative flex justify-center">
              <GlassCard className="p-6 max-w-sm w-full">
                <div className="space-y-4">
                  {/* Mock Phone Screen */}
                  <div className="bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-sm font-medium">Mes Notes</span>
                      <span className="text-xs text-muted-foreground">Aujourd'hui</span>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <span className="text-sm">Mathématiques</span>
                        <span className="font-bold text-green-500">18/20</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <span className="text-sm">Français</span>
                        <span className="font-bold text-primary">15/20</span>
                      </div>
                      <div className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                        <span className="text-sm">Histoire-Géo</span>
                        <span className="font-bold text-primary">16/20</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-primary">16.3</p>
                    <p className="text-xs text-muted-foreground">Moyenne générale</p>
                  </div>
                  
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <div className="w-2 h-2 rounded-full bg-muted" />
                    <div className="w-2 h-2 rounded-full bg-muted" />
                  </div>
                </div>
              </GlassCard>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ce qu'en disent les élèves 💬
            </h2>
            <p className="text-muted-foreground">
              Des milliers d'élèves utilisent déjà iDETUDE
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {temoignagesEleves.map((temoignage, i) => (
              <GlassCard key={i} className="p-6 flex flex-col hover:scale-105 transition-transform">
                <div className="flex-1 mb-6">
                  <Quote className="h-8 w-8 text-primary/30 mb-4" />
                  <p className="text-muted-foreground italic">"{temoignage.quote}"</p>
                </div>
                
                <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-xl">
                    {temoignage.author.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{temoignage.author}</p>
                    <p className="text-xs text-muted-foreground">{temoignage.classe} • {temoignage.etablissement}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Digital ID Card Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <GlassCard className="p-8 max-w-sm mx-auto">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-3xl">
                    👤
                  </div>
                  <div>
                    <p className="font-bold text-lg">Prénom NOM</p>
                    <p className="text-sm text-muted-foreground">Élève de Terminale S</p>
                    <p className="text-xs text-muted-foreground">Lycée iDETUDE Academy</p>
                  </div>
                  <div className="p-4 bg-white rounded-xl">
                    <div className="w-32 h-32 mx-auto bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg flex items-center justify-center">
                      <IdCard className="h-12 w-12 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Scanne ce QR code pour vérifier ton identité
                  </p>
                </div>
              </GlassCard>
            </div>
            
            <div className="order-1 lg:order-2 space-y-6">
              <h2 className="text-3xl font-bold">
                Ta carte d'identité numérique 🪪
              </h2>
              <p className="text-muted-foreground">
                Fini les cartes en plastique qu'on perd ! Avec iDETUDE, ta carte d'élève 
                est directement dans ton téléphone. Moderne, pratique et impossible à oublier.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>QR code unique et sécurisé</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Toujours avec toi sur ton téléphone</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Scan rapide à l'entrée de l'école</span>
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span>Tes potes vont être jaloux 😎</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="suggest-student" className="py-20 px-4 bg-gradient-to-br from-primary/10 via-purple-500/5 to-pink-500/10">
        <div className="container mx-auto">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-6">🤔</div>
            <h2 className="text-3xl font-bold mb-6">
              Ton école n'utilise pas encore iDETUDE ?
            </h2>
            <p className="text-muted-foreground mb-8">
              Parles-en à tes profs ou à la direction ! Tu peux aussi 
              demander à tes parents de suggérer iDETUDE.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <GlassButton href="/demo?role=student" size="lg">
                <Play className="mr-2 h-5 w-5" /> Voir la Démo Élève
              </GlassButton>
              <GlassButton href="/parents#suggest" variant="outline" size="lg">
                <Users className="mr-2 h-5 w-5" /> Demander à mes Parents
              </GlassButton>
            </div>
            
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> 100% gratuit pour toi
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Facile à utiliser
              </span>
              <span className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" /> Mode sombre 🌙
              </span>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Eleves;
