import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Check, Star } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  {
    name: "Découverte",
    price: "GRATUIT",
    period: "",
    description: "Pour tester la plateforme",
    features: [
      "50 élèves maximum",
      "Fonctions de base",
      "30 jours d'essai",
      "Support email",
    ],
    cta: { text: "Essayer", href: "/demo" },
    popular: false,
  },
  {
    name: "Standard",
    price: "15 000",
    currency: "FCFA",
    period: "/élève/an",
    description: "Pour les établissements",
    features: [
      "Élèves illimités",
      "Toutes les fonctionnalités",
      "Support email prioritaire",
      "Formation incluse",
      "Mises à jour gratuites",
    ],
    cta: { text: "Choisir", href: "#contact" },
    popular: true,
  },
  {
    name: "Premium",
    price: "Sur devis",
    period: "",
    description: "Pour les groupes scolaires",
    features: [
      "Multi-établissements",
      "API personnalisée",
      "Support dédié 24/7",
      "Formation sur site",
      "Personnalisation avancée",
    ],
    cta: { text: "Nous contacter", href: "#contact" },
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            💰 Tarification simple et transparente
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choisissez le plan adapté à votre établissement
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
          {plans.map((plan, index) => (
            <GlassCard
              key={plan.name}
              className={cn(
                "p-6 animate-fade-in-up relative",
                plan.popular && "ring-2 ring-primary"
              )}
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3" /> POPULAIRE
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-2">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  {plan.currency && <span className="text-lg text-muted-foreground">{plan.currency}</span>}
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <GlassButton
                href={plan.cta.href}
                variant={plan.popular ? "primary" : "outline"}
                className="w-full"
              >
                {plan.cta.text}
              </GlassButton>
            </GlassCard>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground">
          💡 Paiement annuel ou trimestriel • Réductions groupes scolaires
        </p>
      </div>
    </section>
  );
};
