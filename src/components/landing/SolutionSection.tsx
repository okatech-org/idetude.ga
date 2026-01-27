import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { 
  FileText, Smartphone, PhoneOff, Bell, 
  ClipboardList, QrCode, LayoutDashboard, FileSpreadsheet,
  ArrowRight, Play
} from "lucide-react";

const transformations = [
  {
    before: { icon: FileText, text: "Bulletins papier", detail: "3 jours de travail" },
    after: { icon: Smartphone, text: "Bulletins automatiques", detail: "Générés en 1 clic" },
  },
  {
    before: { icon: PhoneOff, text: "Appels sans réponse", detail: "Parents non informés" },
    after: { icon: Bell, text: "Notifications instantanées", detail: "Parents impliqués" },
  },
  {
    before: { icon: ClipboardList, text: "Appel manuel", detail: "15 min par classe" },
    after: { icon: QrCode, text: "QR Code scan", detail: "3 secondes" },
  },
  {
    before: { icon: FileSpreadsheet, text: "Suivi papier", detail: "Infos dispersées" },
    after: { icon: LayoutDashboard, text: "Dashboard temps réel", detail: "Tout centralisé" },
  },
];

export const SolutionSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ✨ Avec iDETUDE, tout change
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Découvrez comment nous transformons le quotidien de votre établissement
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto mb-12">
          {transformations.map((t, index) => (
            <GlassCard
              key={index}
              className="p-6 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            >
              <div className="flex items-center gap-4">
                {/* Avant */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0">
                      <t.before.icon className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{t.before.text}</p>
                      <p className="text-xs text-muted-foreground">{t.before.detail}</p>
                    </div>
                  </div>
                </div>

                {/* Flèche */}
                <ArrowRight className="h-5 w-5 text-primary shrink-0" />

                {/* Après */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center shrink-0">
                      <t.after.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{t.after.text}</p>
                      <p className="text-xs text-green-600">{t.after.detail}</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>

        <div className="text-center">
          <GlassButton href="/demo" variant="outline" size="lg">
            <Play className="h-5 w-5" />
            Voir comment ça marche en vidéo
          </GlassButton>
        </div>
      </div>
    </section>
  );
};
