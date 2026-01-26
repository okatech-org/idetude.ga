import { useState, useRef } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ChevronDown, 
  ChevronRight, 
  User, 
  Building2, 
  FolderTree,
  Briefcase,
  Users,
  Maximize2,
  Minimize2,
  Search,
  Download,
  ZoomIn,
  ZoomOut,
  UserPlus,
  Mail,
  Phone
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  searchTerm: string;
  scale: number;
}

const DepartmentNode = ({ 
  department, 
  departments, 
  positions, 
  userPositions, 
  level,
  onPositionClick,
  searchTerm,
  scale
}: DepartmentNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  
  const childDepartments = departments.filter(d => d.parent_id === department.id);
  const deptPositions = positions.filter(p => p.department_id === department.id);
  const hasChildren = childDepartments.length > 0 || deptPositions.length > 0;
  
  const Icon = typeIcons[department.type] || FolderTree;
  const colorClass = typeColors[department.type] || typeColors.department;

  // Filter based on search
  const matchesSearch = searchTerm === "" || 
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deptPositions.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    userPositions.some(up => 
      deptPositions.some(p => p.id === up.position_id) &&
      (`${up.profiles?.first_name} ${up.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))
    );

  const hasMatchingChildren = childDepartments.some(child => {
    const childPositions = positions.filter(p => p.department_id === child.id);
    return child.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      childPositions.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  if (searchTerm && !matchesSearch && !hasMatchingChildren) {
    return null;
  }

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
          "hover:shadow-lg hover:scale-[1.01]",
          matchesSearch && searchTerm && "ring-2 ring-primary/50"
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
              {department.code && (
                <Badge variant="secondary" className="text-xs">
                  {department.code}
                </Badge>
              )}
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
                  const positionMatchesSearch = searchTerm && 
                    (position.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    assignedUsers.some(up => 
                      `${up.profiles?.first_name} ${up.profiles?.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
                    ));
                  
                  return (
                    <div
                      key={position.id}
                      className={cn(
                        "p-3 rounded-lg bg-background/60 border border-border/50",
                        "hover:bg-background/80 transition-colors cursor-pointer group",
                        positionMatchesSearch && "ring-2 ring-primary/50"
                      )}
                      onClick={() => onPositionClick?.(position)}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium text-sm truncate">{position.name}</span>
                          {position.is_head && (
                            <Badge variant="secondary" className="text-xs">Chef</Badge>
                          )}
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-primary/10 rounded">
                                <UserPlus className="h-4 w-4 text-primary" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Affecter un utilisateur</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      
                      {/* Assigned users with details */}
                      {assignedUsers.length > 0 ? (
                        <div className="mt-2 space-y-2">
                          {assignedUsers.map(up => (
                            <div key={up.id} className="flex items-center gap-3 p-2 rounded-md bg-muted/30">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {up.profiles?.first_name} {up.profiles?.last_name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Mail className="h-3 w-3" />
                                  <span className="truncate">{up.profiles?.email}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-2 p-2 rounded-md bg-muted/20 border border-dashed border-border/50">
                          <p className="text-xs text-muted-foreground italic flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Poste vacant - Cliquez pour affecter
                          </p>
                        </div>
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
              searchTerm={searchTerm}
              scale={scale}
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
  const [searchTerm, setSearchTerm] = useState("");
  const [scale, setScale] = useState(1);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const rootDepartments = departments.filter(d => !d.parent_id);
  
  // Statistics
  const totalStaff = userPositions.length;
  const vacantPositions = positions.filter(
    p => !userPositions.some(up => up.position_id === p.id)
  ).length;
  const filledPositions = positions.length - vacantPositions;
  
  if (departments.length === 0) {
    return (
      <GlassCard className="p-8 text-center" solid>
        <FolderTree className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Aucune structure administrative définie</p>
        <p className="text-sm text-muted-foreground mt-1">
          Commencez par créer des départements dans l'onglet Administration
        </p>
      </GlassCard>
    );
  }

  const content = (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-lg text-foreground">
              {establishmentName || "Organigramme"}
            </h2>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{departments.length} départements</span>
              <span>•</span>
              <span className="text-green-600">{filledPositions} postes pourvus</span>
              <span>•</span>
              <span className="text-amber-600">{vacantPositions} vacants</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 w-[200px]"
            />
          </div>
          
          {/* Zoom controls */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setScale(Math.max(0.5, scale - 0.1))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setScale(Math.min(1.5, scale + 0.1))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
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
      </div>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-3 pb-4 border-b border-border/50">
        {Object.entries(typeLabels).map(([type, label]) => {
          const Icon = typeIcons[type];
          const count = departments.filter(d => d.type === type).length;
          return (
            <div key={type} className="flex items-center gap-2 text-sm">
              <div className={cn(
                "w-6 h-6 rounded flex items-center justify-center bg-gradient-to-br border",
                typeColors[type]
              )}>
                <Icon className="h-3 w-3" />
              </div>
              <span className="text-muted-foreground">{label}</span>
              <Badge variant="secondary" className="text-xs">{count}</Badge>
            </div>
          );
        })}
      </div>
      
      {/* Org Chart */}
      <div 
        ref={contentRef}
        className="space-y-4 overflow-auto"
        style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
      >
        {rootDepartments.map(dept => (
          <DepartmentNode
            key={dept.id}
            department={dept}
            departments={departments}
            positions={positions}
            userPositions={userPositions}
            level={0}
            onPositionClick={onPositionClick}
            searchTerm={searchTerm}
            scale={scale}
          />
        ))}
      </div>
      
      {searchTerm && rootDepartments.every(dept => {
        const deptPositions = positions.filter(p => p.department_id === dept.id);
        return !dept.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !deptPositions.some(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
      }) && (
        <div className="text-center py-8 text-muted-foreground">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Aucun résultat pour "{searchTerm}"</p>
        </div>
      )}
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
