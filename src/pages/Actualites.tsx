import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHeader } from "@/components/layout/PageHeader";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { actualites, categoriesLabels, type Actualite } from "@/data/actualites";
import { Calendar, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

const categories = ["toutes", "mise-a-jour", "evenement", "partenariat", "annonce"];

const Actualites = () => {
  const [activeCategory, setActiveCategory] = useState("toutes");

  const filteredActualites = activeCategory === "toutes"
    ? actualites
    : actualites.filter((a) => a.categorie === activeCategory);

  const featuredArticle = actualites.find((a) => a.featured);
  const regularArticles = filteredActualites.filter((a) => !a.featured || activeCategory !== "toutes");

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <PageHeader
        title="Actualités & Annonces"
        subtitle="Restez informé des dernières nouveautés et mises à jour d'iDETUDE"
      />

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                  activeCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "glass-card hover:bg-primary/10"
                )}
              >
                {category === "toutes" ? "Toutes" : categoriesLabels[category]}
              </button>
            ))}
          </div>

          {/* Featured Article */}
          {featuredArticle && activeCategory === "toutes" && (
            <GlassCard className="mb-8 overflow-hidden animate-glass-in">
              <div className="grid md:grid-cols-2 gap-0">
                <div className="aspect-video md:aspect-auto">
                  <img
                    src={featuredArticle.image}
                    alt={featuredArticle.titre}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-green-500/10 text-green-600 text-xs font-medium">
                      NOUVEAU
                    </span>
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {categoriesLabels[featuredArticle.categorie]}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                    {featuredArticle.titre}
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    {featuredArticle.extrait}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {formatDate(featuredArticle.date)}
                    </div>
                    <GlassButton variant="outline" size="sm">
                      Lire la suite <ArrowRight className="h-4 w-4" />
                    </GlassButton>
                  </div>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
                formatDate={formatDate}
              />
            ))}
          </div>

          {regularArticles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Aucune actualité dans cette catégorie.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

interface ArticleCardProps {
  article: Actualite;
  index: number;
  formatDate: (date: string) => string;
}

const ArticleCard = ({ article, index, formatDate }: ArticleCardProps) => (
  <GlassCard
    className="overflow-hidden animate-fade-in-up"
    style={{ animationDelay: `${index * 100}ms` } as React.CSSProperties}
  >
    <div className="aspect-video overflow-hidden">
      <img
        src={article.image}
        alt={article.titre}
        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
      />
    </div>
    <div className="p-5">
      <div className="flex items-center gap-2 mb-3">
        <Tag className="h-3 w-3 text-accent" />
        <span className="text-xs text-accent font-medium">
          {categoriesLabels[article.categorie]}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2 line-clamp-2">
        {article.titre}
      </h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
        {article.extrait}
      </p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {formatDate(article.date)}
        </span>
        <button className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
          Lire <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  </GlassCard>
);

export default Actualites;
