import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { ArrowRight, Building2, School } from "lucide-react";
import { type Country, getCountryStats } from "@/data/demo-accounts";

interface CountrySelectorProps {
  countries: Country[];
  onSelect: (country: Country) => void;
}

export const CountrySelector = ({ countries, onSelect }: CountrySelectorProps) => {
  return (
    <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
      {countries.map((country, index) => {
        const stats = getCountryStats(country);
        return (
          <GlassCard
            key={country.code}
            className="p-8 cursor-pointer group animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` } as React.CSSProperties}
            onClick={() => onSelect(country)}
          >
            <div className="text-center space-y-4">
              {/* Flag with animated ring */}
              <div className="relative inline-block">
                <div className="text-8xl transform group-hover:scale-110 transition-transform duration-300">
                  {country.flag}
                </div>
                <div className="absolute inset-0 -m-4 border-2 border-primary/20 rounded-full group-hover:border-primary/40 group-hover:scale-110 transition-all duration-300" />
              </div>

              {/* Country name */}
              <h2 className="text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
                {country.name}
              </h2>

              {/* Stats */}
              <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  <span>{stats.totalSchools} établissements</span>
                </div>
                {stats.totalGroups > 0 && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{stats.totalGroups} groupe</span>
                  </div>
                )}
              </div>

              {/* CTA Button */}
              <GlassButton variant="primary" className="mt-4 group-hover:scale-105 transition-transform">
                Explorer <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </GlassButton>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
