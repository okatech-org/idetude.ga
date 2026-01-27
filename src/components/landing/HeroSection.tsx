import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Play, Phone, CheckCircle, GraduationCap, LineChart, QrCode, Users, MessageCircle } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative pt-24 md:pt-32 pb-16 md:pb-24 hero-pattern overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-glass-in">
            {/* Badge d'accroche */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <span className="text-lg">🚀</span>
              <span className="text-sm text-muted-foreground">Nouveau : Disponible au Gabon et en RDC</span>
            </div>

            {/* Titre principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
              La gestion scolaire{" "}
              <span className="text-gradient">simplifiée pour l'Afrique</span>
            </h1>

            {/* Sous-titre */}
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-xl">
              Connectez établissements, enseignants, élèves et parents sur une 
              plateforme unique et intuitive. Fini les cahiers perdus, les bulletins 
              en retard et les communications manquées.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 mb-8">
              <GlassButton href="/demo" size="lg">
                <Play className="h-5 w-5" />
                Découvrir la Démo
              </GlassButton>
              <GlassButton href="#contact" variant="outline" size="lg">
                <Phone className="h-5 w-5" />
                Demander une Présentation
              </GlassButton>
            </div>

            {/* Réassurances */}
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Gratuit 30 jours</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Sans engagement</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span>Support inclus</span>
              </div>
            </div>
          </div>

          {/* Illustration */}
          <div className="relative animate-glass-in delay-200">
            <div className="relative">
              <GlassCard className="p-8 animate-float">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="h-24 rounded-lg bg-primary/10 flex items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-primary" />
                    </div>
                    <div className="h-16 rounded-lg bg-accent/20 flex items-center justify-center">
                      <Users className="h-8 w-8 text-accent" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="h-16 rounded-lg bg-accent/20 flex items-center justify-center">
                      <MessageCircle className="h-8 w-8 text-accent" />
                    </div>
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
  );
};
