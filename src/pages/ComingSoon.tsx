import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft, Clock, Bell } from "lucide-react";

interface ComingSoonProps {
  persona: string;
}

const ComingSoon = ({ persona }: ComingSoonProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <section className="pt-32 pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <GlassCard className="p-12 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Clock className="h-10 w-10 text-primary" />
              </div>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Page {persona} - Bientôt disponible
              </h1>

              <p className="text-lg text-muted-foreground mb-8">
                Nous travaillons activement sur cette page dédiée aux {persona.toLowerCase()}.
                Elle sera disponible très prochainement avec du contenu personnalisé
                pour répondre à vos besoins spécifiques.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GlassButton variant="primary" href="/">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour à l'accueil
                </GlassButton>
                <GlassButton variant="outline" href="#notify">
                  <Bell className="mr-2 h-4 w-4" />
                  Me notifier du lancement
                </GlassButton>
              </div>

              <p className="text-sm text-muted-foreground mt-8">
                En attendant, découvrez notre{" "}
                <a href="/demo" className="text-primary hover:underline">
                  démo interactive
                </a>{" "}
                ou explorez la page{" "}
                <a href="/etablissements" className="text-primary hover:underline">
                  Établissements
                </a>
                .
              </p>
            </GlassCard>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ComingSoon;
