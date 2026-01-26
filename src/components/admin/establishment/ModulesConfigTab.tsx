import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Mail,
  MessageSquare,
  BookOpen,
  ClipboardList,
  UserX,
  Calendar,
  FileText,
  Award,
  BookMarked,
  FolderOpen,
  CalendarCheck,
  Users,
  CreditCard,
  CalendarDays,
  BarChart3,
  Download,
  Sparkles,
} from "lucide-react";

export interface ModuleConfig {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: "communication" | "academic" | "resources" | "management";
  recommended?: boolean;
}

export const AVAILABLE_MODULES: ModuleConfig[] = [
  // Communication
  { 
    id: "messages", 
    label: "Messages", 
    description: "Messagerie interne entre utilisateurs",
    icon: Mail, 
    category: "communication",
    recommended: true,
  },
  { 
    id: "chat", 
    label: "Chat", 
    description: "Discussion instantanée en temps réel",
    icon: MessageSquare, 
    category: "communication",
  },
  
  // Academic
  { 
    id: "grades", 
    label: "Notes", 
    description: "Gestion des notes et évaluations",
    icon: BookOpen, 
    category: "academic",
    recommended: true,
  },
  { 
    id: "assignments", 
    label: "Devoirs", 
    description: "Suivi des devoirs et travaux à rendre",
    icon: ClipboardList, 
    category: "academic",
    recommended: true,
  },
  { 
    id: "absences", 
    label: "Absences", 
    description: "Enregistrement et suivi des absences",
    icon: UserX, 
    category: "academic",
    recommended: true,
  },
  { 
    id: "schedule", 
    label: "Emploi du temps", 
    description: "Planification des cours et activités",
    icon: Calendar, 
    category: "academic",
    recommended: true,
  },
  { 
    id: "report_cards", 
    label: "Bulletins", 
    description: "Génération et consultation des bulletins",
    icon: FileText, 
    category: "academic",
  },
  { 
    id: "competencies", 
    label: "Compétences", 
    description: "Évaluation par compétences",
    icon: Award, 
    category: "academic",
  },
  
  // Resources
  { 
    id: "resources", 
    label: "Ressources pédagogiques", 
    description: "Bibliothèque de ressources partagées",
    icon: BookMarked, 
    category: "resources",
  },
  { 
    id: "documents", 
    label: "Documents", 
    description: "Partage de documents administratifs",
    icon: FolderOpen, 
    category: "resources",
  },
  { 
    id: "calendar", 
    label: "Calendrier", 
    description: "Événements et dates importantes",
    icon: CalendarCheck, 
    category: "resources",
    recommended: true,
  },
  { 
    id: "groups", 
    label: "Groupes", 
    description: "Espaces de travail collaboratif",
    icon: Users, 
    category: "resources",
  },
  
  // Management
  { 
    id: "payments", 
    label: "Paiements", 
    description: "Gestion des frais et paiements",
    icon: CreditCard, 
    category: "management",
  },
  { 
    id: "appointments", 
    label: "Rendez-vous", 
    description: "Prise de rendez-vous parents-professeurs",
    icon: CalendarDays, 
    category: "management",
  },
  { 
    id: "analytics", 
    label: "Analytique", 
    description: "Tableaux de bord et statistiques",
    icon: BarChart3, 
    category: "management",
  },
  { 
    id: "export", 
    label: "Export", 
    description: "Export des données en CSV/JSON",
    icon: Download, 
    category: "management",
  },
];

const categoryLabels: Record<string, { label: string; description: string }> = {
  communication: { 
    label: "Communication", 
    description: "Outils d'échange entre utilisateurs" 
  },
  academic: { 
    label: "Scolarité", 
    description: "Gestion pédagogique et suivi académique" 
  },
  resources: { 
    label: "Ressources", 
    description: "Partage de documents et collaboration" 
  },
  management: { 
    label: "Gestion", 
    description: "Administration et pilotage" 
  },
};

interface ModulesConfigTabProps {
  enabledModules: string[];
  onModulesChange: (modules: string[]) => void;
  readOnly?: boolean;
}

export const ModulesConfigTab = ({
  enabledModules,
  onModulesChange,
  readOnly = false,
}: ModulesConfigTabProps) => {
  const toggleModule = (moduleId: string) => {
    if (readOnly) return;
    
    if (enabledModules.includes(moduleId)) {
      onModulesChange(enabledModules.filter((m) => m !== moduleId));
    } else {
      onModulesChange([...enabledModules, moduleId]);
    }
  };

  const enableRecommended = () => {
    const recommended = AVAILABLE_MODULES
      .filter((m) => m.recommended)
      .map((m) => m.id);
    onModulesChange(recommended);
  };

  const enableAll = () => {
    onModulesChange(AVAILABLE_MODULES.map((m) => m.id));
  };

  const disableAll = () => {
    onModulesChange([]);
  };

  const modulesByCategory = AVAILABLE_MODULES.reduce((acc, module) => {
    if (!acc[module.category]) acc[module.category] = [];
    acc[module.category].push(module);
    return acc;
  }, {} as Record<string, ModuleConfig[]>);

  const categories = ["communication", "academic", "resources", "management"];

  return (
    <div className="space-y-6">
      {/* Header with quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Modules et Services</h3>
          <p className="text-sm text-muted-foreground">
            Activez les fonctionnalités disponibles pour cet établissement
          </p>
        </div>
        {!readOnly && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={enableRecommended}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
            >
              <Sparkles className="h-3.5 w-3.5" />
              Recommandés
            </button>
            <button
              onClick={enableAll}
              className="px-3 py-1.5 text-sm rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              Tout activer
            </button>
            <button
              onClick={disableAll}
              className="px-3 py-1.5 text-sm rounded-lg text-muted-foreground hover:bg-muted transition-colors"
            >
              Tout désactiver
            </button>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
        <Badge variant="secondary" className="text-sm">
          {enabledModules.length} / {AVAILABLE_MODULES.length} modules activés
        </Badge>
      </div>

      {/* Modules by category */}
      <div className="space-y-6">
        {categories.map((categoryKey) => {
          const category = categoryLabels[categoryKey];
          const modules = modulesByCategory[categoryKey] || [];
          const enabledCount = modules.filter((m) => 
            enabledModules.includes(m.id)
          ).length;

          return (
            <GlassCard key={categoryKey} className="p-4" solid>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium">{category.label}</h4>
                  <p className="text-xs text-muted-foreground">{category.description}</p>
                </div>
                <Badge 
                  variant={enabledCount === modules.length ? "default" : "secondary"}
                  className="text-xs"
                >
                  {enabledCount}/{modules.length}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {modules.map((module) => {
                  const isEnabled = enabledModules.includes(module.id);
                  const Icon = module.icon;

                  return (
                    <div
                      key={module.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all",
                        isEnabled 
                          ? "border-primary/30 bg-primary/5" 
                          : "border-border/50 bg-background/50",
                        !readOnly && "cursor-pointer hover:border-primary/50"
                      )}
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                        isEnabled 
                          ? "bg-primary/20 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium text-sm",
                            isEnabled ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {module.label}
                          </span>
                          {module.recommended && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              Recommandé
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {module.description}
                        </p>
                      </div>

                      <Switch
                        checked={isEnabled}
                        disabled={readOnly}
                        onCheckedChange={() => toggleModule(module.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default ModulesConfigTab;
