/**
 * AdminStructureSection - Section optimisée pour la structure administrative
 * Affiche les départements et postes de manière interactive et intelligente
 */

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { QuickAssignDropdown } from "@/components/admin/QuickAssignDropdown";
import {
    FolderTree,
    Briefcase,
    Plus,
    Edit,
    Trash2,
    ChevronDown,
    ChevronRight,
    UserPlus,
    Users,
    Building2,
    Crown,
    User,
    CheckCircle2,
    AlertCircle,
    Sparkles,
} from "lucide-react";

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
    first_name?: string;
    last_name?: string;
    email?: string;
}

interface AdminStructureSectionProps {
    departments: Department[];
    positions: Position[];
    userPositions: UserPosition[];
    onAddDepartment: () => void;
    onEditDepartment: (dept: Department) => void;
    onDeleteDepartment: (id: string) => void;
    onAddPosition: (deptId: string) => void;
    onEditPosition: (pos: Position) => void;
    onDeletePosition: (id: string) => void;
    onPositionClick: (pos: Position) => void;
    onRefresh: () => void;
}

const TYPE_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    direction: { label: "Direction", color: "bg-purple-500/20 text-purple-600 border-purple-500/30", icon: <Crown className="h-4 w-4" /> },
    administration: { label: "Administration", color: "bg-blue-500/20 text-blue-600 border-blue-500/30", icon: <Building2 className="h-4 w-4" /> },
    pedagogique: { label: "Pédagogique", color: "bg-green-500/20 text-green-600 border-green-500/30", icon: <Sparkles className="h-4 w-4" /> },
    vie_scolaire: { label: "Vie Scolaire", color: "bg-orange-500/20 text-orange-600 border-orange-500/30", icon: <Users className="h-4 w-4" /> },
    technique: { label: "Technique", color: "bg-gray-500/20 text-gray-600 border-gray-500/30", icon: <Building2 className="h-4 w-4" /> },
    other: { label: "Autre", color: "bg-slate-500/20 text-slate-600 border-slate-500/30", icon: <FolderTree className="h-4 w-4" /> },
};

export const AdminStructureSection = ({
    departments,
    positions,
    userPositions,
    onAddDepartment,
    onEditDepartment,
    onDeleteDepartment,
    onAddPosition,
    onEditPosition,
    onDeletePosition,
    onPositionClick,
    onRefresh,
}: AdminStructureSectionProps) => {
    const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(departments.map(d => d.id)));

    // Helper functions
    const getPositionsForDepartment = (deptId: string) => {
        return positions.filter((p) => p.department_id === deptId).sort((a, b) => a.order_index - b.order_index);
    };

    const getUsersForPosition = (posId: string) => {
        return userPositions.filter((up) => up.position_id === posId);
    };

    const getSubDepartments = (deptId: string) => {
        return departments.filter((d) => d.parent_id === deptId).sort((a, b) => a.order_index - b.order_index);
    };

    const getRootDepartments = () => {
        return departments.filter((d) => !d.parent_id).sort((a, b) => a.order_index - b.order_index);
    };

    // Stats
    const stats = useMemo(() => {
        const totalPositions = positions.length;
        const filledPositions = positions.filter((p) => getUsersForPosition(p.id).length > 0).length;
        const totalDepts = departments.length;
        return { totalPositions, filledPositions, totalDepts };
    }, [positions, userPositions, departments]);

    const toggleExpand = (deptId: string) => {
        setExpandedDepts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(deptId)) {
                newSet.delete(deptId);
            } else {
                newSet.add(deptId);
            }
            return newSet;
        });
    };

    const getTypeConfig = (type: string) => {
        return TYPE_CONFIG[type] || TYPE_CONFIG.other;
    };

    const renderPosition = (pos: Position, isSubDept: boolean = false) => {
        const assignedUsers = getUsersForPosition(pos.id);
        const isFilled = assignedUsers.length > 0;

        return (
            <div
                key={pos.id}
                className={`group relative rounded-xl transition-all duration-200 hover:shadow-md ${isSubDept ? 'p-3 bg-background/50' : 'p-4 bg-muted/30 hover:bg-muted/50'
                    } ${pos.is_head ? 'border-l-4 border-primary' : ''}`}
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        {/* Position Icon */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isFilled ? 'bg-green-500/10' : 'bg-muted'
                            }`}>
                            {isFilled ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            ) : (
                                <Briefcase className="h-5 w-5 text-muted-foreground" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            {/* Position Name & Badges */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-medium text-foreground">{pos.name}</p>
                                {pos.is_head && (
                                    <Badge variant="secondary" className="text-xs gap-1">
                                        <Crown className="h-3 w-3 text-yellow-500" />
                                        Chef
                                    </Badge>
                                )}
                                {!isFilled && (
                                    <Badge variant="outline" className="text-xs text-orange-500 border-orange-500/30">
                                        Vacant
                                    </Badge>
                                )}
                            </div>

                            {/* Assigned Users */}
                            {isFilled ? (
                                <div className="mt-2 space-y-1">
                                    {assignedUsers.map((user) => (
                                        <div key={user.id} className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium text-primary">
                                                {user.first_name?.[0]}{user.last_name?.[0]}
                                            </div>
                                            <span className="text-sm text-muted-foreground">
                                                {user.first_name} {user.last_name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Aucun utilisateur assigné
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => onPositionClick(pos)}
                            title="Gérer les affectations"
                            className="h-8 w-8 p-0"
                        >
                            <UserPlus className="h-4 w-4" />
                        </GlassButton>
                        <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditPosition(pos)}
                            className="h-8 w-8 p-0"
                        >
                            <Edit className="h-4 w-4" />
                        </GlassButton>
                        <GlassButton
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeletePosition(pos.id)}
                            className="h-8 w-8 p-0"
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </GlassButton>
                    </div>
                </div>

                {/* Quick Assign (shown always for empty positions) */}
                {!isFilled && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <QuickAssignDropdown
                            positionId={pos.id}
                            positionName={pos.name}
                            currentAssignments={assignedUsers}
                            onSuccess={onRefresh}
                        />
                    </div>
                )}
            </div>
        );
    };

    const renderDepartmentCard = (dept: Department, level: number = 0) => {
        const isExpanded = expandedDepts.has(dept.id);
        const deptPositions = getPositionsForDepartment(dept.id);
        const subDepts = getSubDepartments(dept.id);
        const typeConfig = getTypeConfig(dept.type);
        const filledPositions = deptPositions.filter((p) => getUsersForPosition(p.id).length > 0).length;
        const totalPositionsInDept = deptPositions.length;
        const hasContent = deptPositions.length > 0 || subDepts.length > 0;

        return (
            <GlassCard
                key={dept.id}
                className={`overflow-hidden transition-all duration-300 ${level > 0 ? 'ml-4 mt-3' : ''}`}
                solid
            >
                {/* Department Header */}
                <div
                    className={`p-4 cursor-pointer select-none transition-colors ${isExpanded ? 'bg-muted/30' : 'hover:bg-muted/20'
                        }`}
                    onClick={() => hasContent && toggleExpand(dept.id)}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            {/* Expand/Collapse Icon */}
                            {hasContent && (
                                <div className="text-muted-foreground transition-transform duration-200">
                                    {isExpanded ? (
                                        <ChevronDown className="h-5 w-5" />
                                    ) : (
                                        <ChevronRight className="h-5 w-5" />
                                    )}
                                </div>
                            )}

                            {/* Department Icon */}
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.color}`}>
                                {typeConfig.icon}
                            </div>

                            {/* Department Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-semibold text-foreground">{dept.name}</p>
                                    <Badge variant="outline" className={`text-xs ${typeConfig.color}`}>
                                        {typeConfig.label}
                                    </Badge>
                                </div>
                                {dept.description && (
                                    <p className="text-sm text-muted-foreground truncate">{dept.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Stats & Actions */}
                        <div className="flex items-center gap-3">
                            {/* Position Stats */}
                            {totalPositionsInDept > 0 && (
                                <div className="hidden sm:flex items-center gap-2">
                                    <Badge
                                        variant={filledPositions === totalPositionsInDept ? "secondary" : "outline"}
                                        className={`text-xs gap-1 ${filledPositions === totalPositionsInDept
                                                ? 'bg-green-500/10 text-green-600'
                                                : 'text-muted-foreground'
                                            }`}
                                    >
                                        <Users className="h-3 w-3" />
                                        {filledPositions}/{totalPositionsInDept}
                                    </Badge>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                                <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onAddPosition(dept.id)}
                                    title="Ajouter un poste"
                                    className="h-8 px-2 gap-1"
                                >
                                    <Plus className="h-4 w-4" />
                                    <span className="hidden sm:inline text-xs">Poste</span>
                                </GlassButton>
                                <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onEditDepartment(dept)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Edit className="h-4 w-4" />
                                </GlassButton>
                                <GlassButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => onDeleteDepartment(dept.id)}
                                    className="h-8 w-8 p-0"
                                >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </GlassButton>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Collapsible Content */}
                {isExpanded && hasContent && (
                    <div className="border-t border-border/50 p-4 space-y-3 animate-in slide-in-from-top-2 duration-200">
                        {/* Positions Grid */}
                        {deptPositions.length > 0 && (
                            <div className="grid gap-3 md:grid-cols-2">
                                {deptPositions.map((pos) => renderPosition(pos))}
                            </div>
                        )}

                        {/* Sub-departments */}
                        {subDepts.length > 0 && (
                            <div className="space-y-3 mt-4">
                                {subDepts.map((subDept) => renderDepartmentCard(subDept, level + 1))}
                            </div>
                        )}
                    </div>
                )}
            </GlassCard>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header with Stats */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-lg font-semibold text-foreground">Structure Administrative</h2>
                    <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <FolderTree className="h-4 w-4" />
                            {stats.totalDepts} département{stats.totalDepts > 1 ? 's' : ''}
                        </span>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {stats.filledPositions}/{stats.totalPositions} postes pourvus
                        </span>
                    </div>
                </div>
                <GlassButton
                    variant="primary"
                    size="sm"
                    onClick={onAddDepartment}
                    className="gap-2"
                >
                    <Plus className="h-4 w-4" />
                    Nouveau département
                </GlassButton>
            </div>

            {/* Visual Progress Bar */}
            {stats.totalPositions > 0 && (
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${(stats.filledPositions / stats.totalPositions) * 100}%` }}
                    />
                </div>
            )}

            {/* Departments List */}
            {departments.length === 0 ? (
                <GlassCard className="p-12 text-center" solid>
                    <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <FolderTree className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                        Aucun département configuré
                    </h3>
                    <p className="text-muted-foreground mb-4 max-w-md mx-auto">
                        Créez votre structure administrative en ajoutant des départements et des postes.
                    </p>
                    <GlassButton variant="primary" onClick={onAddDepartment} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Créer le premier département
                    </GlassButton>
                </GlassCard>
            ) : (
                <div className="space-y-4">
                    {getRootDepartments().map((dept) => renderDepartmentCard(dept))}
                </div>
            )}
        </div>
    );
};

export default AdminStructureSection;
