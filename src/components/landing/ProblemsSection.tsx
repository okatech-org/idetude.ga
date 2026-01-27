import { GlassCard } from "@/components/ui/glass-card";
import { FileText, PhoneOff, PenTool, Search, Wallet, Clock } from "lucide-react";

const problems = [
  {
    icon: FileText,
    title: "Bulletins manuels",
    description: "Des heures à calculer les moyennes et remplir les bulletins à la main chaque trimestre",
  },
  {
    icon: PhoneOff,
    title: "Parents impossibles à joindre",
    description: "SMS ignorés, carnets jamais signés, réunions parents-profs désertées",
  },
  {
    icon: PenTool,
    title: "Notes sur papier",
    description: "Calculs de moyennes interminables avec risque constant d'erreurs",
  },
  {
    icon: Search,
    title: "Élèves 'fantômes'",
    description: "Impossible de savoir en temps réel qui est présent ou absent",
  },
  {
    icon: Wallet,
    title: "Frais impayés",
    description: "Relances manuelles épuisantes et suivi des paiements chaotique",
  },
  {
    icon: Clock,
    title: "Absences non signalées",
    description: "Parents prévenus trop tard quand leur enfant sèche les cours",
  },
];

export const ProblemsSection = () => {
  return (
    <section className="py-16 md:py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            😩 Vous en avez assez de...
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Ces problèmes quotidiens épuisent le personnel éducatif et 
            créent une distance entre l'école et les familles.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {problems.map((problem, index) => (
            <GlassCard
              key={problem.title}
              className="p-6 animate-fade-in-up border-destructive/20 hover:border-destructive/40"
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-4">
                <problem.icon className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-muted-foreground text-sm">{problem.description}</p>
            </GlassCard>
          ))}
        </div>
      </div>
    </section>
  );
};
