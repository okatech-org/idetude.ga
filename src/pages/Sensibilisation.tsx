import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  problematiques,
  solutions,
  impactStats,
  testimonials,
} from "@/data/sensibilisation";
import {
  Database,
  MessageCircle,
  QrCode,
  BarChart3,
  Download,
  Users,
  Play,
  Quote,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ElementType> = {
  Database,
  MessageCircle,
  QrCode,
  BarChart3,
};

const Sensibilisation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Pourquoi digitaliser l'éducation en Afrique ?"
        subtitle="Découvrez les enjeux et les solutions pour une éducation moderne et accessible"
      />

      {/* Video Section */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <GlassCard className="max-w-4xl mx-auto overflow-hidden animate-glass-in">
            <div className="aspect-video bg-primary/5 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10"></div>
              <button className="relative z-10 w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-glass-lg group hover:scale-110 transition-transform">
                <Play className="h-8 w-8 text-primary-foreground ml-1" />
              </button>
              <p className="absolute bottom-6 text-muted-foreground text-sm">
                Vidéo de présentation - 3 minutes
              </p>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* Problematiques Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Les défis de l'éducation en Afrique
          </h2>

          <div className="space-y-8 max-w-5xl mx-auto">
            {problematiques.map((prob, index) => (
              <GlassCard
                key={index}
                className={cn(
                  "p-6 md:p-8 animate-fade-in-up",
                  index % 2 === 0 ? "md:mr-16" : "md:ml-16"
                )}
                style={{ animationDelay: `${index * 150}ms` } as React.CSSProperties}
              >
                <div className={cn(
                  "flex flex-col md:flex-row gap-6 items-center",
                  index % 2 !== 0 && "md:flex-row-reverse"
                )}>
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-primary/10 flex items-center justify-center">
                      <span className="text-4xl md:text-5xl font-bold text-gradient">
                        {prob.stat}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-lg text-foreground mb-2">
                      {prob.description}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Impact :</strong> {prob.impact}
                    </p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-16 hero-pattern">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-4">
            Les solutions iDETUDE
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Notre plateforme répond à chaque défi avec des outils modernes et adaptés
          </p>

          <div className="relative max-w-3xl mx-auto">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>

            <div className="space-y-8">
              {solutions.map((solution, index) => {
                const IconComponent = iconMap[solution.icone] || Database;
                return (
                  <div
                    key={index}
                    className={cn(
                      "relative flex items-center gap-6 animate-fade-in-up",
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    )}
                    style={{ animationDelay: `${index * 150}ms` } as React.CSSProperties}
                  >
                    {/* Timeline dot */}
                    <div className="absolute left-8 md:left-1/2 w-4 h-4 rounded-full bg-primary -translate-x-1/2 z-10"></div>

                    <div className={cn(
                      "flex-1 ml-16 md:ml-0",
                      index % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"
                    )}>
                      <GlassCard className="p-6 inline-block text-left">
                        <div className={cn(
                          "flex items-center gap-4 mb-3",
                          index % 2 === 0 && "md:flex-row-reverse"
                        )}>
                          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-primary" />
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">
                            {solution.titre}
                          </h3>
                        </div>
                        <p className="text-muted-foreground">
                          {solution.description}
                        </p>
                      </GlassCard>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Impact mesurable
          </h2>

          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {impactStats.map((stat, index) => (
              <GlassCard
                key={index}
                className="p-8 text-center animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <div className="stat-number text-5xl mb-2">{stat.value}</div>
                <div className="text-lg font-semibold text-foreground mb-2">
                  {stat.label}
                </div>
                <p className="text-sm text-muted-foreground">
                  {stat.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 hero-pattern">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-foreground text-center mb-12">
            Témoignages du terrain
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <GlassCard
                key={index}
                className="p-6 animate-fade-in-up"
                style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
              >
                <Quote className="h-8 w-8 text-primary/30 mb-4" />
                <p className="text-foreground mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div>
                  <p className="font-semibold text-foreground">
                    {testimonial.author}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role}
                  </p>
                  <p className="text-xs text-accent">{testimonial.location}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <GlassCard className="p-8 md:p-12 text-center max-w-4xl mx-auto" solid>
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Rejoignez le mouvement
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Ensemble, transformons l'éducation en Afrique pour les générations futures
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <GlassButton size="lg">
                <Download className="h-5 w-5" />
                Télécharger le Livre Blanc
              </GlassButton>
              <GlassButton variant="outline" size="lg">
                <Users className="h-5 w-5" />
                Devenir Partenaire
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Sensibilisation;
