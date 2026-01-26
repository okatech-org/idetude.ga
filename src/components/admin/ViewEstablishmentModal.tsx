import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { type School as SchoolType, type SchoolGroup } from "@/data/demo-accounts";
import {
  School,
  MapPin,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  User,
} from "lucide-react";

const typeLabels: Record<string, { label: string; color: string }> = {
  primaire: { label: "Primaire", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  college: { label: "Collège", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  lycee: { label: "Lycée", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  superieur: { label: "Supérieur", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  technique: { label: "Technique", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
};

interface ViewEstablishmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school: SchoolType | null;
  group?: SchoolGroup;
  countryFlag?: string;
}

export const ViewEstablishmentModal = ({ 
  open, 
  onOpenChange, 
  school, 
  group,
  countryFlag 
}: ViewEstablishmentModalProps) => {
  if (!school) return null;

  const typeConfig = typeLabels[school.type] || { label: school.type, color: "" };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <School className="h-5 w-5 text-primary" />
            {school.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Main Info */}
          <GlassCard className="p-4" solid>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {countryFlag && <span className="text-lg">{countryFlag}</span>}
                  <Badge variant="outline" className={typeConfig.color}>
                    {typeConfig.label}
                  </Badge>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-sm">{school.address}</span>
                </div>
                {group && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span className="text-sm">{group.name}</span>
                  </div>
                )}
              </div>
            </div>
          </GlassCard>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3">
            <GlassCard className="p-3 text-center" solid>
              <GraduationCap className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{school.studentCount}</p>
              <p className="text-xs text-muted-foreground">Élèves</p>
            </GlassCard>
            <GlassCard className="p-3 text-center" solid>
              <BookOpen className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{school.teachers.length}</p>
              <p className="text-xs text-muted-foreground">Enseignants</p>
            </GlassCard>
            <GlassCard className="p-3 text-center" solid>
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-lg font-bold text-foreground">{school.administration.length}</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </GlassCard>
          </div>

          {/* Levels */}
          <GlassCard className="p-4" solid>
            <h4 className="font-semibold text-foreground mb-2">Niveaux</h4>
            <p className="text-muted-foreground">{school.levels}</p>
            {school.options && school.options.length > 0 && (
              <div className="mt-2">
                <p className="text-sm text-muted-foreground mb-1">Options :</p>
                <div className="flex flex-wrap gap-1">
                  {school.options.map((opt) => (
                    <Badge key={opt} variant="secondary">{opt}</Badge>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Administration */}
          <GlassCard className="p-4" solid>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Administration ({school.administration.length})
            </h4>
            <div className="space-y-2">
              {school.administration.map((admin) => (
                <div key={admin.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{admin.name}</p>
                    <p className="text-xs text-muted-foreground">{admin.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Teachers */}
          <GlassCard className="p-4" solid>
            <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Enseignants ({school.teachers.length})
            </h4>
            <div className="space-y-2">
              {school.teachers.map((teacher) => (
                <div key={teacher.id} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">{teacher.name}</p>
                    <p className="text-xs text-muted-foreground">{teacher.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </DialogContent>
    </Dialog>
  );
};
