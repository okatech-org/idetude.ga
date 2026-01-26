import { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Building2, 
  FolderTree,
  Briefcase,
  Users,
  Maximize2,
  Minimize2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Department {
  id: string;
  establishment_id: string;
  parent_id: string | null;
  name: string;
  code: string | null;
  type: string;
  description: string | null;
  order_index: number;
}

interface Position {
  id: string;
  department_id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_head: boolean;
  order_index: number;
}

interface UserPosition {
  id: string;
  user_id: string;
  position_id: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface OrgChartProps {
  departments: Department[];
  positions: Position[];
  userPositions: UserPosition[];
  establishmentName?: string;
  onPositionClick?: (position: Position) => void;
}

const typeColors: Record<string, string> = {
  direction: "from-blue-500/20 to-blue-600/10 border-blue-500/30",
  department: "from-purple-500/20 to-purple-600/10 border-purple-500/30",
  service: "from-green-500/20 to-green-600/10 border-green-500/30",
  bureau: "from-amber-500/20 to-amber-600/10 border-amber-500/30",
};

const typeIcons: Record<string, typeof Building2> = {
  direction: Building2,
  department: FolderTree,
  service: Briefcase,
  bureau: Users,
};

const typeLabels: Record<string, string> = {
  direction: "Direction",
  department: "Département",
  service: "Service",
  bureau: "Bureau",
};

interface DepartmentNodeProps {
  department: Department;
  departments: Department[];
  positions: Position[];
  userPositions: UserPosition[];
  level: number;
  onPositionClick?: (position: Position) => void;
}

const DepartmentNode = ({ 
  department, 
  departments, 
  positions, 
  userPositions, 
  level,
  onPositionClick 
}: DepartmentNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const childDepartments = departments.filter(d => d.parent_id === department.id);
  const deptPositions = positions.filter(p => p.department_id === department.id);
  const hasChildren = childDepartments.length > 0 || deptPositions.length > 0;
  
  const Icon = typeIcons[department.type] || FolderTree;
  const colorClass = typeColors[department.type] || typeColors.department;

  return (
    <div className={cn("relative", level > 0 && "ml-8")}>
      {/* Connector line */}
      {level > 0 && (
        <div className="absolute left-[-20px] top-0 h-6 w-5 border-l-2 border-b-2 border-border/50 rounded-bl-lg" />
      )}
      
      {/* Department card */}
      <div
        className={cn(
          "relative p-4 rounded-xl bg-gradient-to-br border-2 transition-all duration-200",
          colorClass,
          "hover:shadow-lg hover:scale-[1.01]"
        )}
      >
        <div className="flex items-start gap-3">
          {hasChildren && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-1 p-1 hover:bg-background/50 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
          )}
          
          <div className="w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-foreground" />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-semibold text-foreground truncate">{department.name}</h3>
              <Badge variant="outline" className="text-xs whitespace-nowrap">
                {typeLabels[department.type] || department.type}
              </Badge>
            </div>
            {department.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {department.description}
              </p>
            )}
            
            {/* Positions */}
            {deptPositions.length > 0 && isExpanded && (
              <div className="mt-3 space-y-2">
                {deptPositions.map(position => {
                  const assignedUsers = userPositions.filter(up => up.position_id === position.id);
                  
                  return (
                    <div
                      key={position.id}
                      className={cn(
                        "p-3 rounded-lg bg-background/60 border border-border/50",
                        "hover:bg-background/80 transition-colors cursor-pointer"
                      )}
                      onClick={() => onPositionClick?.(position)}
                    >
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="font-medium text-sm">{position.name}</span>
                        {position.is_head && (
                          <Badge variant="secondary" className="text-xs">Chef</Badge>
                        )}
                      </div>
                      
                      {/* Assigned users */}
                      {assignedUsers.length > 0 ? (
                        <div className="mt-2 space-y-1">
                          {assignedUsers.map(up => (
                            <div key={up.id} className="flex items-center gap-2 text-sm">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-3 w-3 text-primary" />
                              </div>
                              <span className="text-foreground">
                                {up.profiles?.first_name} {up.profiles?.last_name}
                              </span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground mt-1 italic">
                          Poste vacant
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Child departments */}
      {isExpanded && childDepartments.length > 0 && (
        <div className="mt-3 space-y-3 relative">
          {/* Vertical connector */}
          <div className="absolute left-[20px] top-0 bottom-3 border-l-2 border-border/50" />
          
          {childDepartments.map(child => (
            <DepartmentNode
              key={child.id}
              department={child}
              departments={departments}
              positions={positions}
              userPositions={userPositions}
              level={level + 1}
              onPositionClick={onPositionClick}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const OrgChart = ({ 
  departments, 
  positions, 
  userPositions, 
  establishmentName,
  onPositionClick 
}: OrgChartProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const rootDepartments = departments.filter(d => !d.parent_id);
  
  if (departments.length === 0) {
    return (
      <GlassCard className="p-8 text-center" solid>
        <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Aucune structure administrative définie</p>
        <p className="text-sm text-muted-foreground mt-1">
          Commencez par créer des départements
        </p>
      </GlassCard>
    );
  }

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">
              {establishmentName || "Organigramme"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {departments.length} départements • {positions.length} postes • {userPositions.length} affectations
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsFullscreen(!isFullscreen)}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 pb-4 border-b border-border/50">
        {Object.entries(typeLabels).map(([type, label]) => {
          const Icon = typeIcons[type];
          return (
            <div key={type} className="flex items-center gap-2 text-sm">
              <div className={cn(
                "w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br border",
                typeColors[type]
              )}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-muted-foreground">{label}</span>
            </div>
          );
        })}
      </div>
      
      {/* Org Chart */}
      <div className="space-y-4 overflow-auto">
        {rootDepartments.map(dept => (
          <DepartmentNode
            key={dept.id}
            department={dept}
            departments={departments}
            positions={positions}
            userPositions={userPositions}
            level={0}
            onPositionClick={onPositionClick}
          />
        ))}
      </div>
    </div>
  );

  if (isFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm overflow-auto p-6">
        {content}
      </div>
    );
  }

  return (
    <GlassCard className="p-6" solid>
      {content}
    </GlassCard>
  );
};
