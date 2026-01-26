import { GlassCard } from "@/components/ui/glass-card";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DemoAccordionProps {
  title: string;
  icon: React.ElementType;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  badge?: string;
  count?: number;
}

export const DemoAccordion = ({
  title,
  icon: Icon,
  expanded,
  onToggle,
  children,
  badge,
  count,
}: DemoAccordionProps) => (
  <GlassCard className="overflow-hidden" hover={false} solid>
    <button
      onClick={onToggle}
      className="w-full p-5 flex items-center justify-between text-left hover:bg-primary/5 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center ring-1 ring-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <span className="font-bold text-foreground text-lg">{title}</span>
          {(badge || count !== undefined) && (
            <div className="flex items-center gap-2 mt-1">
              {badge && (
                <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {badge}
                </span>
              )}
              {count !== undefined && (
                <span className="text-xs text-muted-foreground">
                  {count} compte{count > 1 ? "s" : ""}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className={cn(
        "w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center transition-all duration-300",
        expanded && "bg-primary/10 rotate-180"
      )}>
        <ChevronDown className={cn(
          "h-5 w-5 transition-colors",
          expanded ? "text-primary" : "text-muted-foreground"
        )} />
      </div>
    </button>
    <div
      className={cn(
        "grid transition-all duration-300 ease-in-out",
        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      )}
    >
      <div className="overflow-hidden">
        <div className="px-5 pb-5 pt-0 space-y-3">{children}</div>
      </div>
    </div>
  </GlassCard>
);
