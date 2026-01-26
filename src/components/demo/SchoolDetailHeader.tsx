import { GlassCard } from "@/components/ui/glass-card";
import { MapPin, Users, BookOpen, GraduationCap } from "lucide-react";
import { type School } from "@/data/demo-accounts";
import { cn } from "@/lib/utils";

interface SchoolDetailHeaderProps {
  school: School;
}

const schoolTypeConfig = {
  primaire: { icon: "🏫", label: "École Primaire", color: "from-blue-500/20 to-blue-500/5" },
  college: { icon: "🎒", label: "Collège", color: "from-green-500/20 to-green-500/5" },
  lycee: { icon: "🎓", label: "Lycée", color: "from-purple-500/20 to-purple-500/5" },
  superieur: { icon: "🏛️", label: "Enseignement Supérieur", color: "from-amber-500/20 to-amber-500/5" },
  technique: { icon: "⚙️", label: "Technique", color: "from-rose-500/20 to-rose-500/5" },
};

export const SchoolDetailHeader = ({ school }: SchoolDetailHeaderProps) => {
  const config = schoolTypeConfig[school.type] || schoolTypeConfig.primaire;
  const totalAccounts =
    school.administration.length +
    school.teachers.length +
    school.studentAccounts.length +
    school.parents.length;

  return (
    <GlassCard className="p-6" solid>
      <div className="flex flex-col md:flex-row md:items-start gap-6">
        {/* Icon */}
        <div className={cn(
          "w-20 h-20 rounded-2xl bg-gradient-to-br flex items-center justify-center text-4xl shrink-0 ring-2 ring-primary/10",
          config.color
        )}>
          {config.icon}
        </div>

        {/* Main info */}
        <div className="flex-1 space-y-3">
          <div>
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-semibold mb-2">
              {config.label}
            </span>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              {school.name}
            </h2>
          </div>

          <p className="text-muted-foreground flex items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0" />
            {school.address}
          </p>

          {/* Stats badges */}
          <div className="flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm font-medium">
              <BookOpen className="h-4 w-4" />
              {school.levels}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-sm font-medium">
              <GraduationCap className="h-4 w-4" />
              {school.studentCount} élèves
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-sm font-medium">
              <Users className="h-4 w-4" />
              {totalAccounts} comptes démo
            </span>
          </div>

          {/* Options */}
          {school.options && school.options.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="text-sm text-muted-foreground">Filières :</span>
              {school.options.map((opt) => (
                <span
                  key={opt}
                  className="px-2.5 py-1 rounded-lg bg-muted/50 text-foreground text-sm"
                >
                  {opt}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </GlassCard>
  );
};
