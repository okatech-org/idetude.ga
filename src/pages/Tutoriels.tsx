import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/glass-card";
import { tutoriels, faq, profilLabels, type Tutoriel } from "@/data/tutoriels";
import {
  Search,
  Play,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  Users,
  GraduationCap,
  BookOpen,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

const profileIcons: Record<string, React.ElementType> = {
  tous: Home,
  direction: GraduationCap,
  enseignant: BookOpen,
  parent: Users,
  eleve: GraduationCap,
};

const Tutoriels = () => {
  const [activeProfile, setActiveProfile] = useState("tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const filteredTutoriels = tutoriels.filter((tuto) => {
    const matchesProfile = activeProfile === "tous" || tuto.profil.includes(activeProfile);
    const matchesSearch = searchQuery === "" || 
      tuto.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tuto.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProfile && matchesSearch;
  });

  const popularTutoriels = tutoriels.filter((t) => t.populaire);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Guides & Tutoriels"
        subtitle="Apprenez à maîtriser iDETUDE en quelques minutes"
      />

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Profile Filters */}
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {Object.entries(profilLabels).map(([key, label]) => {
              const Icon = profileIcons[key] || Home;
              return (
                <button
                  key={key}
                  onClick={() => setActiveProfile(key)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2",
                    activeProfile === key
                      ? "bg-primary text-primary-foreground"
                      : "glass-card hover:bg-primary/10"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div className="max-w-xl mx-auto mb-12">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Rechercher un tutoriel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-12"
              />
            </div>
          </div>

          {/* Popular Tutorials */}
          {activeProfile === "tous" && searchQuery === "" && (
            <div className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-6">
                📹 Tutoriels populaires
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {popularTutoriels.map((tuto, index) => (
                  <TutorialCard key={tuto.id} tutorial={tuto} index={index} compact />
                ))}
              </div>
            </div>
          )}

          {/* All Tutorials */}
          <div className="mb-12">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Tous les tutoriels
              {filteredTutoriels.length > 0 && (
                <span className="text-muted-foreground font-normal ml-2">
                  ({filteredTutoriels.length})
                </span>
              )}
            </h2>
            
            {filteredTutoriels.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTutoriels.map((tuto, index) => (
                  <TutorialCard key={tuto.id} tutorial={tuto} index={index} />
                ))}
              </div>
            ) : (
              <GlassCard className="p-8 text-center">
                <p className="text-muted-foreground">
                  Aucun tutoriel trouvé pour cette recherche.
                </p>
              </GlassCard>
            )}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">
              Questions fréquentes
            </h2>
            <div className="space-y-3">
              {faq.map((item, index) => (
                <GlassCard
                  key={index}
                  className="overflow-hidden"
                  hover={false}
                >
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                    className="w-full p-4 flex items-center justify-between text-left"
                  >
                    <span className="font-medium text-foreground">
                      {item.question}
                    </span>
                    {expandedFaq === index ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      expandedFaq === index ? "max-h-40" : "max-h-0"
                    )}
                  >
                    <div className="px-4 pb-4 text-muted-foreground">
                      {item.reponse}
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

interface TutorialCardProps {
  tutorial: Tutoriel;
  index: number;
  compact?: boolean;
}

const TutorialCard = ({ tutorial, index, compact = false }: TutorialCardProps) => (
  <GlassCard
    className={cn(
      "overflow-hidden animate-fade-in-up",
      compact ? "p-0" : ""
    )}
    style={{ animationDelay: `${index * 50}ms` } as React.CSSProperties}
  >
    <div className={cn(
      "aspect-video bg-primary/5 flex items-center justify-center relative group cursor-pointer",
      compact && "aspect-[4/3]"
    )}>
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 group-hover:from-primary/20 transition-all"></div>
      <div className="relative z-10 w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center group-hover:scale-110 transition-transform">
        <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
      </div>
      <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-background/80 text-xs font-medium">
        {tutorial.duree}
      </div>
    </div>
    <div className={cn("p-4", compact && "p-3")}>
      <h3 className={cn(
        "font-semibold text-foreground mb-1 line-clamp-2",
        compact ? "text-sm" : "text-base"
      )}>
        {tutorial.titre}
      </h3>
      {!compact && (
        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
          {tutorial.description}
        </p>
      )}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {tutorial.duree}
        </span>
        <span className="flex items-center gap-1">
          <Eye className="h-3 w-3" />
          {tutorial.vues.toLocaleString()}
        </span>
      </div>
    </div>
  </GlassCard>
);

export default Tutoriels;
