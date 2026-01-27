import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { 
  QrCode, FileSpreadsheet, Smartphone, 
  CheckSquare, MessageCircle, BarChart3, ArrowRight 
} from "lucide-react";

const features = [
  {
    icon: QrCode,
    title: "Carte d'Identité Numérique",
    description: "QR code unique pour chaque élève : identification rapide, sécurisée et moderne",
    badge: "Exclusif",
  },
  {
    icon: FileSpreadsheet,
    title: "Notes & Bulletins Automatiques",
    description: "Saisie simple, calculs automatiques, génération PDF en 1 clic",
    badge: null,
  },
  {
    icon: Smartphone,
    title: "Application Mobile",
    description: "iOS et Android pour tous : parents, enseignants, élèves",
    badge: "Bientôt",
  },
  {
    icon: CheckSquare,
    title: "Gestion des Présences",
    description: "Appel numérique, notifications d'absence en temps réel aux parents",
    badge: null,
  },
  {
    icon: MessageCircle,
    title: "Messagerie Intégrée",
    description: "Communication directe entre tous les acteurs, sans partager de numéros personnels",
    badge: null,
  },
  {
    icon: BarChart3,
    title: "Tableaux de Bord",
    description: "Statistiques en temps réel pour piloter votre établissement",
    badge: null,
  },
];

export const FeaturesSection = () => {
  return (
    <section id="fonctionnalites" className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ⚡ Tout ce dont vous avez besoin
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Une suite complète d'outils pour gérer efficacement votre établissement
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {features.map((feature, index) => (
            <GlassCard
              key={feature.title}
              className="p-6 animate-fade-in-up relative overflow-hidden"
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            >
              {feature.badge && (
                <span className={`absolute top-4 right-4 px-2 py-1 text-xs font-medium rounded-full ${
                  feature.badge === "Exclusif" ? "bg-primary/10 text-primary" : "bg-accent/10 text-accent"
                }`}>
                  {feature.badge}
                </span>
              )}
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </GlassCard>
          ))}
        </div>

        <div className="text-center">
          <GlassButton href="/demo" variant="outline">
            Voir toutes les fonctionnalités <ArrowRight className="h-4 w-4" />
          </GlassButton>
        </div>
      </div>
    </section>
  );
};
