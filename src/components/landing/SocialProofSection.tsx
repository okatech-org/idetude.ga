import { GlassCard } from "@/components/ui/glass-card";
import { Building2, Users, GraduationCap, BookOpen, Quote } from "lucide-react";
import { useEffect, useState } from "react";

const stats = [
  { value: 2, suffix: "", label: "Pays", icon: Building2 },
  { value: 7, suffix: "", label: "Établissements", icon: GraduationCap },
  { value: 5000, suffix: "+", label: "Élèves", icon: Users },
  { value: 100, suffix: "+", label: "Enseignants", icon: BookOpen },
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

const AnimatedCounter = ({ value, suffix }: { value: number; suffix: string }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return <span>{count.toLocaleString()}{suffix}</span>;
};

export const SocialProofSection = () => {
  return (
    <section className="py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            🏆 Ils nous font confiance
          </h2>
        </div>

        {/* Stats + Countries */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          <GlassCard className="p-6 text-center">
            <div className="text-5xl mb-3">🇬🇦</div>
            <div className="font-bold text-foreground">Gabon</div>
          </GlassCard>
          <GlassCard className="p-6 text-center">
            <div className="text-5xl mb-3">🇨🇩</div>
            <div className="font-bold text-foreground">RDC</div>
          </GlassCard>
          {stats.slice(2).map((stat, index) => (
            <GlassCard
              key={stat.label}
              className="p-6 text-center animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl font-bold text-foreground mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <GlassCard
              key={index}
              className="p-6 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
            >
              <Quote className="h-8 w-8 text-primary/20 mb-4" />
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
  );
};
