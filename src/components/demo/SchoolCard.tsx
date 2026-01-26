import { ArrowRight, MapPin, Users, School as SchoolIcon } from "lucide-react";
import { type School } from "@/data/demo-accounts";
import { cn } from "@/lib/utils";

interface SchoolCardProps {
  school: School;
  onClick: () => void;
}

const schoolTypeIcons = {
  primaire: "🏫",
  college: "🎒",
  lycee: "🎓",
  superieur: "🏛️",
  technique: "⚙️",
};

const schoolTypeColors = {
  primaire: "from-blue-500/20 to-blue-500/5",
  college: "from-green-500/20 to-green-500/5",
  lycee: "from-purple-500/20 to-purple-500/5",
  superieur: "from-amber-500/20 to-amber-500/5",
  technique: "from-rose-500/20 to-rose-500/5",
};

export const SchoolCard = ({ school, onClick }: SchoolCardProps) => {
  const typeIcon = schoolTypeIcons[school.type] || "🏫";
  const typeColor = schoolTypeColors[school.type] || schoolTypeColors.primaire;

  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-xl bg-muted/30 hover:bg-muted/50 text-left transition-all group"
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <div className={cn(
          "w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-2xl shrink-0 ring-1 ring-primary/10 group-hover:scale-105 transition-transform",
          typeColor
        )}>
          {typeIcon}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-foreground group-hover:text-primary transition-colors truncate">
            {school.name}
          </h4>
          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {school.address.split(",")[0]}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {school.studentCount}
            </span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-medium">
              {school.levels}
            </span>
            {school.options?.slice(0, 2).map((opt) => (
              <span key={opt} className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                {opt}
              </span>
            ))}
            {school.options && school.options.length > 2 && (
              <span className="px-2 py-0.5 rounded-md bg-muted text-muted-foreground text-xs">
                +{school.options.length - 2}
              </span>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center group-hover:bg-primary/10 transition-colors shrink-0">
          <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </button>
  );
};
