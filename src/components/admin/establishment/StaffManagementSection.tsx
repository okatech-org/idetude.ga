/**
 * StaffManagementSection - Section de gestion du personnel
 * Affiche les cartes du personnel administratif et enseignant avec édition complète
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    User,
    Users,
    GraduationCap,
    BookOpen,
    Briefcase,
    Mail,
    Phone,
    Building2,
    Plus,
    Edit,
    Trash2,
    Star,
    Calendar,
    School,
    ChevronRight,
    Save,
    X,
    Settings,
} from "lucide-react";
import { TeacherConfigurationModal } from "./TeacherConfigurationModal";

interface StaffMember {
    id: string;
    user_id: string;
    staff_type: string;
    category?: string;
    position?: string;
    department?: string;
    contract_type?: string;
    is_active: boolean;
    is_class_principal?: boolean;
    start_date?: string;
    metadata?: any;
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
}

interface TeacherAssignment {
    class_id: string;
    class_name: string;
    subject_id: string;
    subject_name: string;
    is_main_teacher: boolean;
}

interface StaffManagementSectionProps {
    establishmentId: string;
    establishmentStaff: StaffMember[];
    onRefresh?: () => void;
}

const STAFF_TYPE_OPTIONS = [
    { value: "direction", label: "Direction" },
    { value: "admin", label: "Administratif" },
    { value: "cpe", label: "CPE" },
    { value: "surveillant", label: "Surveillant" },
    { value: "teacher", label: "Enseignant" },
    { value: "maintenance", label: "Maintenance" },
    { value: "other", label: "Autre" },
];

const CATEGORY_OPTIONS = [
    { value: "cadre_superieur", label: "Cadre Supérieur" },
    { value: "cadre", label: "Cadre" },
    { value: "employe", label: "Employé" },
    { value: "stagiaire", label: "Stagiaire" },
];

const CONTRACT_OPTIONS = [
    { value: "permanent", label: "Permanent" },
    { value: "cdd", label: "CDD" },
    { value: "vacataire", label: "Vacataire" },
    { value: "stagiaire", label: "Stagiaire" },
];

const DEPARTMENT_OPTIONS = [
    "Direction Générale",
    "Administration",
    "Vie Scolaire",
    "Corps Enseignant",
    "Services Techniques",
];

const STAFF_TYPE_LABELS: Record<string, string> = {
    direction: "Direction",
    admin: "Administratif",
    teacher: "Enseignant",
    cpe: "CPE",
    surveillant: "Surveillant",
    maintenance: "Maintenance",
    other: "Autre",
};

const STAFF_TYPE_COLORS: Record<string, string> = {
    direction: "bg-purple-500/20 text-purple-600",
    admin: "bg-blue-500/20 text-blue-600",
    teacher: "bg-green-500/20 text-green-600",
    cpe: "bg-orange-500/20 text-orange-600",
    surveillant: "bg-yellow-500/20 text-yellow-600",
    maintenance: "bg-gray-500/20 text-gray-600",
    other: "bg-slate-500/20 text-slate-600",
};

const CATEGORY_LABELS: Record<string, string> = {
    cadre_superieur: "Cadre Supérieur",
    cadre: "Cadre",
    employe: "Employé",
    stagiaire: "Stagiaire",
};

export const StaffManagementSection = ({
    establishmentId,
    establishmentStaff,
    onRefresh,
}: StaffManagementSectionProps) => {
    const [activeTab, setActiveTab] = useState("admin");
    const [teacherAssignments, setTeacherAssignments] = useState<Record<string, TeacherAssignment[]>>({});
    const [isLoading, setIsLoading] = useState(false);

    // Edit modal state
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
    const [editForm, setEditForm] = useState({
        position: "",
        department: "",
        category: "",
        staff_type: "",
        contract_type: "",
        is_active: true,
    });
    const [isSaving, setIsSaving] = useState(false);

    // Delete confirmation state
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);

    // Teacher configuration modal state
    const [configModalOpen, setConfigModalOpen] = useState(false);
    const [configuringTeacher, setConfiguringTeacher] = useState<StaffMember | null>(null);

    // Separate staff by type
    const adminStaff = establishmentStaff.filter(
        (s) => ["direction", "admin", "cpe", "surveillant", "maintenance"].includes(s.staff_type)
    );
    const teachingStaff = establishmentStaff.filter((s) => s.staff_type === "teacher");

    useEffect(() => {
        if (teachingStaff.length > 0) {
            fetchTeacherAssignments();
        }
    }, [teachingStaff.length]);

    const fetchTeacherAssignments = async () => {
        setIsLoading(true);
        try {
            const assignments: Record<string, TeacherAssignment[]> = {};
            const res = await fetch(`/api/db/establishments/${establishmentId}/teacher-assignments`);
            if (res.ok) {
                const data = await res.json();
                data.forEach((a: any) => {
                    if (!assignments[a.teacher_id]) {
                        assignments[a.teacher_id] = [];
                    }
                    assignments[a.teacher_id].push({
                        class_id: a.class_id,
                        class_name: a.class_name,
                        subject_id: a.subject_id,
                        subject_name: a.subject_name,
                        is_main_teacher: a.is_main_teacher,
                    });
                });
            }
            setTeacherAssignments(assignments);
        } catch (error) {
            console.error("Error fetching teacher assignments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStaffName = (staff: StaffMember) => {
        if (staff.first_name && staff.last_name) {
            return `${staff.first_name} ${staff.last_name}`;
        }
        if (staff.metadata?.firstName && staff.metadata?.lastName) {
            return `${staff.metadata.firstName} ${staff.metadata.lastName}`;
        }
        return staff.email || "Non renseigné";
    };

    const getInitials = (staff: StaffMember) => {
        const name = getStaffName(staff);
        const parts = name.split(" ");
        if (parts.length >= 2) {
            return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    const getTeacherSubjects = (teacherId: string) => {
        const assignments = teacherAssignments[teacherId] || [];
        return [...new Set(assignments.map((a) => a.subject_name).filter(Boolean))];
    };

    const getTeacherLevels = (teacherId: string) => {
        const assignments = teacherAssignments[teacherId] || [];
        const levels = [...new Set(assignments.map((a) => {
            const match = a.class_name.match(/^(\d+(?:ère|ème|nde|e)?|Tle)/i);
            return match ? match[1] : a.class_name;
        }))];
        return levels;
    };

    const isMainTeacher = (teacherId: string) => {
        const assignments = teacherAssignments[teacherId] || [];
        return assignments.some((a) => a.is_main_teacher);
    };

    // Edit handlers
    const openEditModal = (staff: StaffMember) => {
        setEditingStaff(staff);
        setEditForm({
            position: staff.position || "",
            department: staff.department || "",
            category: staff.category || "",
            staff_type: staff.staff_type || "",
            contract_type: staff.contract_type || "",
            is_active: staff.is_active,
        });
        setEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editingStaff) return;
        setIsSaving(true);
        try {
            const res = await fetch(`/api/db/establishment-staff/${editingStaff.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editForm),
            });
            if (res.ok) {
                toast.success("Informations mises à jour avec succès");
                setEditModalOpen(false);
                onRefresh?.();
            } else {
                throw new Error("Failed to update");
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    // Delete handlers
    const openDeleteDialog = (staff: StaffMember) => {
        setStaffToDelete(staff);
        setDeleteDialogOpen(true);
    };

    const handleDelete = async () => {
        if (!staffToDelete) return;
        try {
            const res = await fetch(`/api/db/establishment-staff/${staffToDelete.id}`, {
                method: "DELETE",
            });
            if (res.ok) {
                toast.success("Personnel supprimé avec succès");
                setDeleteDialogOpen(false);
                onRefresh?.();
            } else {
                throw new Error("Failed to delete");
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const renderAdminCard = (staff: StaffMember) => (
        <GlassCard key={staff.id} className="p-4 group hover:shadow-lg transition-shadow" solid>
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm ${STAFF_TYPE_COLORS[staff.staff_type] || 'bg-primary/20 text-primary'}`}>
                    {getInitials(staff)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <p className="font-semibold text-foreground truncate">
                            {getStaffName(staff)}
                        </p>
                        {staff.staff_type === "direction" && (
                            <Star className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                        )}
                    </div>

                    {staff.position && (
                        <p className="text-sm text-muted-foreground truncate">
                            {staff.position}
                        </p>
                    )}

                    <div className="flex flex-wrap gap-1 mt-2">
                        <Badge className={`text-xs ${STAFF_TYPE_COLORS[staff.staff_type] || ''}`}>
                            {STAFF_TYPE_LABELS[staff.staff_type] || staff.staff_type}
                        </Badge>
                        {staff.category && (
                            <Badge variant="outline" className="text-xs">
                                {CATEGORY_LABELS[staff.category] || staff.category}
                            </Badge>
                        )}
                    </div>

                    {staff.department && (
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {staff.department}
                        </div>
                    )}

                    {(staff.email || staff.metadata?.email) && (
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span className="truncate">{staff.email || staff.metadata?.email}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Status & Actions */}
            <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                <Badge variant={staff.is_active ? "secondary" : "outline"} className={`text-xs ${staff.is_active ? 'bg-green-500/10 text-green-600' : ''}`}>
                    {staff.is_active ? "Actif" : "Inactif"}
                </Badge>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GlassButton variant="ghost" size="sm" onClick={() => openEditModal(staff)} title="Modifier">
                        <Edit className="h-3 w-3" />
                    </GlassButton>
                    <GlassButton variant="ghost" size="sm" onClick={() => openDeleteDialog(staff)} title="Supprimer">
                        <Trash2 className="h-3 w-3 text-destructive" />
                    </GlassButton>
                </div>
            </div>
        </GlassCard>
    );

    const renderTeacherCard = (teacher: StaffMember) => {
        const subjects = getTeacherSubjects(teacher.user_id);
        const levels = getTeacherLevels(teacher.user_id);
        const assignments = teacherAssignments[teacher.user_id] || [];
        const isPP = isMainTeacher(teacher.user_id);

        return (
            <GlassCard key={teacher.id} className={`p-4 group hover:shadow-lg transition-shadow ${isPP ? 'ring-1 ring-yellow-500/30' : ''}`} solid>
                <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-600 flex items-center justify-center font-semibold text-sm">
                        {getInitials(teacher)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground truncate">
                                {getStaffName(teacher)}
                            </p>
                            {isPP && (
                                <Badge variant="secondary" className="text-xs gap-1 bg-yellow-500/10 text-yellow-600">
                                    <Star className="h-3 w-3" />
                                    PP
                                </Badge>
                            )}
                        </div>

                        {/* Subjects */}
                        {subjects.length > 0 ? (
                            <div className="flex flex-wrap gap-1 mt-2">
                                {subjects.slice(0, 3).map((subject, idx) => (
                                    <Badge key={idx} className="text-xs bg-primary/10 text-primary">
                                        {subject}
                                    </Badge>
                                ))}
                                {subjects.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                        +{subjects.length - 3}
                                    </Badge>
                                )}
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground mt-1">
                                Aucune matière assignée
                            </p>
                        )}

                        {/* Levels */}
                        {levels.length > 0 && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                                <School className="h-3 w-3" />
                                <span>Niveaux : {levels.join(", ")}</span>
                            </div>
                        )}

                        {/* Classes count */}
                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />
                            <span>{assignments.length} classe{assignments.length > 1 ? 's' : ''} assignée{assignments.length > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Classes list */}
                {assignments.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                        <p className="text-xs text-muted-foreground mb-2">Classes :</p>
                        <div className="flex flex-wrap gap-1">
                            {assignments.slice(0, 5).map((a, idx) => (
                                <Badge
                                    key={idx}
                                    variant="outline"
                                    className={`text-xs ${a.is_main_teacher ? 'border-yellow-500/50 bg-yellow-500/10' : ''}`}
                                >
                                    {a.class_name}
                                    {a.is_main_teacher && <Star className="h-2 w-2 ml-1 text-yellow-500" />}
                                </Badge>
                            ))}
                            {assignments.length > 5 && (
                                <Badge variant="outline" className="text-xs">
                                    +{assignments.length - 5}
                                </Badge>
                            )}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                    <Badge variant={teacher.is_active ? "secondary" : "outline"} className={`text-xs ${teacher.is_active ? 'bg-green-500/10 text-green-600' : ''}`}>
                        {teacher.is_active ? "Actif" : "Inactif"}
                    </Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GlassButton
                            variant="primary"
                            size="sm"
                            onClick={() => {
                                setConfiguringTeacher(teacher);
                                setConfigModalOpen(true);
                            }}
                            title="Configurer matières et classes"
                        >
                            <Settings className="h-3 w-3" />
                        </GlassButton>
                        <GlassButton variant="ghost" size="sm" onClick={() => openEditModal(teacher)} title="Modifier">
                            <Edit className="h-3 w-3" />
                        </GlassButton>
                        <GlassButton variant="ghost" size="sm" onClick={() => openDeleteDialog(teacher)} title="Supprimer">
                            <Trash2 className="h-3 w-3 text-destructive" />
                        </GlassButton>
                    </div>
                </div>
            </GlassCard>
        );
    };

    return (
        <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start mb-4">
                    <TabsTrigger value="admin" className="gap-2">
                        <Briefcase className="h-4 w-4" />
                        Personnel Administratif ({adminStaff.length})
                    </TabsTrigger>
                    <TabsTrigger value="teachers" className="gap-2">
                        <GraduationCap className="h-4 w-4" />
                        Corps Enseignant ({teachingStaff.length})
                    </TabsTrigger>
                </TabsList>

                {/* Administrative Staff Tab */}
                <TabsContent value="admin" className="space-y-4">
                    {adminStaff.length === 0 ? (
                        <GlassCard className="p-8 text-center" solid>
                            <Briefcase className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Aucun personnel administratif enregistré</p>
                        </GlassCard>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {adminStaff.map(renderAdminCard)}
                        </div>
                    )}
                </TabsContent>

                {/* Teaching Staff Tab */}
                <TabsContent value="teachers" className="space-y-4">
                    {teachingStaff.length === 0 ? (
                        <GlassCard className="p-8 text-center" solid>
                            <GraduationCap className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground">Aucun enseignant enregistré</p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Ajoutez des enseignants via la configuration des classes
                            </p>
                        </GlassCard>
                    ) : (
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {teachingStaff.map(renderTeacherCard)}
                        </div>
                    )}
                </TabsContent>
            </Tabs>

            {/* Edit Modal */}
            <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Edit className="h-5 w-5" />
                            Modifier {editingStaff ? getStaffName(editingStaff) : ""}
                        </DialogTitle>
                        <DialogDescription>
                            Modifiez les informations du personnel
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        {/* Staff Type */}
                        <div className="space-y-2">
                            <Label>Type de personnel</Label>
                            <Select
                                value={editForm.staff_type}
                                onValueChange={(v) => setEditForm({ ...editForm, staff_type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {STAFF_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Position */}
                        <div className="space-y-2">
                            <Label>Poste / Fonction</Label>
                            <Input
                                value={editForm.position}
                                onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                                placeholder="Ex: Proviseur, Secrétaire, Professeur..."
                            />
                        </div>

                        {/* Department */}
                        <div className="space-y-2">
                            <Label>Service / Département</Label>
                            <Select
                                value={editForm.department}
                                onValueChange={(v) => setEditForm({ ...editForm, department: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {DEPARTMENT_OPTIONS.map((dept) => (
                                        <SelectItem key={dept} value={dept}>
                                            {dept}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <Label>Catégorie</Label>
                            <Select
                                value={editForm.category}
                                onValueChange={(v) => setEditForm({ ...editForm, category: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CATEGORY_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Contract Type */}
                        <div className="space-y-2">
                            <Label>Type de contrat</Label>
                            <Select
                                value={editForm.contract_type}
                                onValueChange={(v) => setEditForm({ ...editForm, contract_type: v })}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sélectionner" />
                                </SelectTrigger>
                                <SelectContent>
                                    {CONTRACT_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Active Status */}
                        <div className="flex items-center justify-between">
                            <Label>Statut actif</Label>
                            <Switch
                                checked={editForm.is_active}
                                onCheckedChange={(v) => setEditForm({ ...editForm, is_active: v })}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <GlassButton variant="ghost" onClick={() => setEditModalOpen(false)}>
                            <X className="h-4 w-4 mr-2" />
                            Annuler
                        </GlassButton>
                        <GlassButton variant="primary" onClick={handleSaveEdit} disabled={isSaving}>
                            <Save className="h-4 w-4 mr-2" />
                            {isSaving ? "Enregistrement..." : "Enregistrer"}
                        </GlassButton>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer {staffToDelete ? getStaffName(staffToDelete) : ""} de l'établissement ?
                            Cette action est irréversible.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Teacher Configuration Modal */}
            <TeacherConfigurationModal
                isOpen={configModalOpen}
                onClose={() => {
                    setConfigModalOpen(false);
                    setConfiguringTeacher(null);
                }}
                teacher={configuringTeacher}
                establishmentId={establishmentId}
                onSave={() => {
                    fetchTeacherAssignments();
                    onRefresh?.();
                }}
            />
        </div>
    );
};

export default StaffManagementSection;
