import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Building2, Users, Mail, Phone, Play, Lightbulb } from "lucide-react";

export const FinalCTASection = () => {
  return (
    <section id="contact" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🚀 Prêt à transformer votre établissement ?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Rejoignez les écoles qui ont choisi la modernité
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Building2 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Établissements</h3>
            <p className="text-muted-foreground mb-6">
              Demandez une démonstration personnalisée adaptée à vos besoins
            </p>
            <GlassButton href="/demo" className="w-full">
              <Play className="h-5 w-5" />
              Demander une démo
            </GlassButton>
          </GlassCard>

          <GlassCard className="p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-accent" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Parents</h3>
            <p className="text-muted-foreground mb-6">
              L'école de votre enfant n'est pas encore sur iDETUDE ? Suggérez-nous !
            </p>
            <GlassButton href="mailto:contact@idetude.com?subject=Suggestion%20école" variant="outline" className="w-full">
              <Lightbulb className="h-5 w-5" />
              Suggérer mon école
            </GlassButton>
          </GlassCard>
        </div>

        <div className="text-center space-y-4">
          <div className="flex flex-wrap justify-center gap-6 text-muted-foreground">
            <a href="mailto:contact@idetude.com" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Mail className="h-5 w-5" />
              contact@idetude.com
            </a>
            <a href="tel:+24100000000" className="flex items-center gap-2 hover:text-foreground transition-colors">
              <Phone className="h-5 w-5" />
              +241 XX XX XX XX
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
