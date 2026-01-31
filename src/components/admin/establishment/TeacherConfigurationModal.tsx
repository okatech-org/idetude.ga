/**
 * TeacherConfigurationModal - Modal de configuration complète d'un enseignant
 * Gestion des matières enseignées et des classes assignées
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    BookOpen,
    User,
    Plus,
    Trash2,
    Save,
    Star,
    Users,
    Settings,
    GraduationCap,
    Check,
    School,
    X,
} from "lucide-react";

interface Subject {
    id: string;
    name: string;
    code?: string;
}

interface ClassInfo {
    id: string;
    name: string;
    level: string;
    capacity?: number;
}

interface TeacherAssignment {
    id?: string;
    class_id: string;
    class_name: string;
    subject_id: string;
    subject_name: string;
    is_main_teacher: boolean;
}

interface TeacherInfo {
    id: string;
    user_id: string;
    first_name?: string;
    last_name?: string;
    email?: string;
    position?: string;
}

interface TeacherConfigurationModalProps {
    isOpen: boolean;
    onClose: () => void;
    teacher: TeacherInfo | null;
    establishmentId: string;
    onSave?: () => void;
}

export const TeacherConfigurationModal = ({
    isOpen,
    onClose,
    teacher,
    establishmentId,
    onSave,
}: TeacherConfigurationModalProps) => {
    const [activeTab, setActiveTab] = useState("assignments");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [classes, setClasses] = useState<ClassInfo[]>([]);
    const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form states for adding new assignment
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [isMainTeacher, setIsMainTeacher] = useState(false);

    // Teacher's primary subjects (can teach multiple)
    const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);

    useEffect(() => {
        if (isOpen && teacher) {
            fetchData();
        }
    }, [isOpen, teacher]);

    const fetchData = async () => {
        if (!teacher) return;
        setIsLoading(true);
        try {
            // Fetch all subjects
            const subjectsRes = await fetch(`/api/db/establishments/${establishmentId}/subjects`);
            if (subjectsRes.ok) {
                setSubjects(await subjectsRes.json());
            }

            // Fetch all classes
            const classesRes = await fetch(`/api/db/establishments/${establishmentId}/classes`);
            if (classesRes.ok) {
                setClasses(await classesRes.json());
            }

            // Fetch current teacher assignments
            const assignmentsRes = await fetch(`/api/db/establishments/${establishmentId}/teacher-assignments`);
            if (assignmentsRes.ok) {
                const allAssignments = await assignmentsRes.json();
                const teacherAssignments = allAssignments.filter(
                    (a: any) => a.teacher_id === teacher.user_id
                );
                setAssignments(teacherAssignments.map((a: any) => ({
                    id: a.id,
                    class_id: a.class_id,
                    class_name: a.class_name,
                    subject_id: a.subject_id,
                    subject_name: a.subject_name,
                    is_main_teacher: a.is_main_teacher,
                })));

                // Extract unique subjects from assignments
                const subjectIds = [...new Set(teacherAssignments.map((a: any) => a.subject_id))] as string[];
                const validSubjectIds = subjectIds.filter(Boolean);
                setTeacherSubjects(validSubjectIds);

                // Auto-select if only one subject
                if (validSubjectIds.length === 1) {
                    setSelectedSubject(validSubjectIds[0]);
                }
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setIsLoading(false);
        }
    };

    const getTeacherName = () => {
        if (!teacher) return "";
        return teacher.first_name && teacher.last_name
            ? `${teacher.first_name} ${teacher.last_name}`
            : teacher.email || "Enseignant";
    };

    const handleAddAssignment = async () => {
        if (!selectedClass || !selectedSubject || !teacher) {
            toast.error("Veuillez sélectionner une classe et une matière");
            return;
        }

        // Check for duplicate
        const exists = assignments.some(
            (a) => a.class_id === selectedClass && a.subject_id === selectedSubject
        );
        if (exists) {
            toast.error("Cette assignation existe déjà");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/db/classes/${selectedClass}/teachers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacher_id: teacher.user_id,
                    subject_id: selectedSubject,
                    is_main_teacher: isMainTeacher,
                }),
            });

            if (res.ok) {
                toast.success("Assignation ajoutée");
                // Add to local state
                const className = classes.find((c) => c.id === selectedClass)?.name || "";
                const subjectName = subjects.find((s) => s.id === selectedSubject)?.name || "";
                setAssignments([
                    ...assignments,
                    {
                        class_id: selectedClass,
                        class_name: className,
                        subject_id: selectedSubject,
                        subject_name: subjectName,
                        is_main_teacher: isMainTeacher,
                    },
                ]);
                // Reset form
                setSelectedClass("");
                setSelectedSubject("");
                setIsMainTeacher(false);
            } else {
                throw new Error("Failed to add assignment");
            }
        } catch (error) {
            toast.error("Erreur lors de l'ajout de l'assignation");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveAssignment = async (assignment: TeacherAssignment) => {
        if (!confirm("Supprimer cette assignation ?")) return;

        try {
            // Find the class_teachers entry to delete
            const res = await fetch(`/api/db/classes/${assignment.class_id}/teachers`);
            if (res.ok) {
                const classTeachers = await res.json();
                const entry = classTeachers.find(
                    (ct: any) => ct.id === teacher?.user_id && ct.subject_id === assignment.subject_id
                );
                if (entry?.ct_id) {
                    await fetch(`/api/db/class-teachers/${entry.ct_id}`, { method: "DELETE" });
                }
            }

            // Remove from local state
            setAssignments(assignments.filter(
                (a) => !(a.class_id === assignment.class_id && a.subject_id === assignment.subject_id)
            ));
            toast.success("Assignation supprimée");
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleToggleMainTeacher = async (assignment: TeacherAssignment) => {
        try {
            const res = await fetch(`/api/db/classes/${assignment.class_id}/main-teacher`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    teacher_id: teacher?.user_id,
                }),
            });

            if (res.ok) {
                toast.success(
                    assignment.is_main_teacher
                        ? "Professeur principal retiré"
                        : "Défini comme professeur principal"
                );
                // Update local state
                setAssignments(assignments.map((a) => ({
                    ...a,
                    is_main_teacher:
                        a.class_id === assignment.class_id
                            ? !a.is_main_teacher
                            : a.is_main_teacher,
                })));
            }
        } catch (error) {
            toast.error("Erreur lors de la mise à jour");
        }
    };

    const handleSubjectToggle = (subjectId: string) => {
        if (teacherSubjects.includes(subjectId)) {
            setTeacherSubjects(teacherSubjects.filter((s) => s !== subjectId));
        } else {
            setTeacherSubjects([...teacherSubjects, subjectId]);
        }
    };

    const handleSave = () => {
        onSave?.();
        onClose();
    };

    // Group assignments by class
    const assignmentsByClass = assignments.reduce((acc, a) => {
        if (!acc[a.class_id]) {
            acc[a.class_id] = { class_name: a.class_name, assignments: [] };
        }
        acc[a.class_id].assignments.push(a);
        return acc;
    }, {} as Record<string, { class_name: string; assignments: TeacherAssignment[] }>);

    // Group classes by level
    const classesByLevel = classes.reduce((acc, c) => {
        const level = c.level || "Autre";
        if (!acc[level]) acc[level] = [];
        acc[level].push(c);
        return acc;
    }, {} as Record<string, ClassInfo[]>);

    // Get unassigned classes for the selected subject
    const availableClasses = classes.filter((c) =>
        !assignments.some((a) => a.class_id === c.id && a.subject_id === selectedSubject)
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configuration de {getTeacherName()}
                    </DialogTitle>
                    <DialogDescription>
                        Gérez les matières enseignées et les classes assignées à cet enseignant
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="assignments" className="gap-2">
                            <School className="h-4 w-4" />
                            Classes Assignées ({assignments.length})
                        </TabsTrigger>
                        <TabsTrigger value="subjects" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Matières ({teacherSubjects.length})
                        </TabsTrigger>
                    </TabsList>

                    {/* Assignments Tab */}
                    <TabsContent value="assignments" className="flex-1 overflow-auto space-y-4">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                            </div>
                        ) : (
                            <>
                                {/* Add new assignment */}
                                <GlassCard className="p-4" solid>
                                    <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                        <Plus className="h-4 w-4" />
                                        Ajouter une assignation
                                    </h4>
                                    <div className="grid gap-3 md:grid-cols-4">
                                        {/* Subject - auto-selected if only one */}
                                        <div className="space-y-1">
                                            <Label className="text-xs">Matière</Label>
                                            {teacherSubjects.length === 1 ? (
                                                // Single subject - show as badge
                                                <div className="h-10 flex items-center">
                                                    <Badge className="bg-primary/10 text-primary">
                                                        {subjects.find(s => s.id === teacherSubjects[0])?.name || "Matière"}
                                                    </Badge>
                                                </div>
                                            ) : teacherSubjects.length > 1 ? (
                                                // Multiple subjects - show selector with only teacher's subjects
                                                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subjects
                                                            .filter(s => teacherSubjects.includes(s.id))
                                                            .map((s) => (
                                                                <SelectItem key={s.id} value={s.id}>
                                                                    {s.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                // No subjects assigned yet - show all to allow first assignment
                                                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {subjects.map((s) => (
                                                            <SelectItem key={s.id} value={s.id}>
                                                                {s.name}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <Label className="text-xs">Classe</Label>
                                            <Select value={selectedClass} onValueChange={setSelectedClass}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {availableClasses.map((c) => (
                                                        <SelectItem key={c.id} value={c.id}>
                                                            {c.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="flex items-end">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <Checkbox
                                                    checked={isMainTeacher}
                                                    onCheckedChange={(v) => setIsMainTeacher(v as boolean)}
                                                />
                                                <span className="text-sm flex items-center gap-1">
                                                    <Star className="h-3 w-3 text-yellow-500" />
                                                    Prof. Principal
                                                </span>
                                            </label>
                                        </div>
                                        <div className="flex items-end">
                                            <GlassButton
                                                variant="primary"
                                                size="sm"
                                                onClick={handleAddAssignment}
                                                disabled={isSaving || !selectedClass || !selectedSubject}
                                                className="w-full"
                                            >
                                                <Plus className="h-4 w-4 mr-1" />
                                                Ajouter
                                            </GlassButton>
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Current assignments */}
                                {assignments.length === 0 ? (
                                    <GlassCard className="p-8 text-center" solid>
                                        <School className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                                        <p className="text-muted-foreground">Aucune classe assignée</p>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Utilisez le formulaire ci-dessus pour assigner des classes
                                        </p>
                                    </GlassCard>
                                ) : (
                                    <div className="space-y-3">
                                        <h4 className="font-medium text-foreground flex items-center gap-2">
                                            <Users className="h-4 w-4" />
                                            Classes assignées ({Object.keys(assignmentsByClass).length})
                                        </h4>
                                        <div className="grid gap-2">
                                            {Object.entries(assignmentsByClass).map(([classId, data]) => (
                                                <GlassCard key={classId} className="p-3" solid>
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                                                <School className="h-5 w-5 text-primary" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-foreground">
                                                                    {data.class_name}
                                                                </p>
                                                                <div className="flex flex-wrap gap-1 mt-1">
                                                                    {data.assignments.map((a, idx) => (
                                                                        <Badge
                                                                            key={idx}
                                                                            variant="secondary"
                                                                            className={`text-xs ${a.is_main_teacher ? 'bg-yellow-500/20 text-yellow-600' : ''}`}
                                                                        >
                                                                            {a.subject_name}
                                                                            {a.is_main_teacher && (
                                                                                <Star className="h-2 w-2 ml-1" />
                                                                            )}
                                                                        </Badge>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            {data.assignments.some((a) => a.is_main_teacher) ? (
                                                                <Badge variant="outline" className="text-xs bg-yellow-500/10 text-yellow-600">
                                                                    <Star className="h-3 w-3 mr-1" />
                                                                    PP
                                                                </Badge>
                                                            ) : (
                                                                <GlassButton
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => handleToggleMainTeacher(data.assignments[0])}
                                                                    title="Définir comme Prof. Principal"
                                                                >
                                                                    <Star className="h-3 w-3" />
                                                                </GlassButton>
                                                            )}
                                                            <GlassButton
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => handleRemoveAssignment(data.assignments[0])}
                                                            >
                                                                <Trash2 className="h-3 w-3 text-destructive" />
                                                            </GlassButton>
                                                        </div>
                                                    </div>
                                                </GlassCard>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </TabsContent>

                    {/* Subjects Tab */}
                    <TabsContent value="subjects" className="flex-1 overflow-auto space-y-4">
                        <GlassCard className="p-4" solid>
                            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Matières que peut enseigner {getTeacherName()}
                            </h4>
                            <p className="text-sm text-muted-foreground mb-4">
                                Sélectionnez les matières que cet enseignant est qualifié pour enseigner.
                            </p>
                            <ScrollArea className="h-[300px] pr-4">
                                <div className="grid gap-2 md:grid-cols-2">
                                    {subjects.map((subject) => {
                                        const isSelected = teacherSubjects.includes(subject.id);
                                        const assignmentCount = assignments.filter(
                                            (a) => a.subject_id === subject.id
                                        ).length;

                                        return (
                                            <div
                                                key={subject.id}
                                                className={`p-3 rounded-lg border cursor-pointer transition-colors ${isSelected
                                                    ? 'bg-primary/10 border-primary/50'
                                                    : 'bg-muted/30 border-border/50 hover:bg-muted/50'
                                                    }`}
                                                onClick={() => handleSubjectToggle(subject.id)}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <Checkbox checked={isSelected} />
                                                        <span className="font-medium text-foreground">
                                                            {subject.name}
                                                        </span>
                                                    </div>
                                                    {assignmentCount > 0 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {assignmentCount} classe{assignmentCount > 1 ? 's' : ''}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </GlassCard>

                        {/* Summary */}
                        <GlassCard className="p-4" solid>
                            <h4 className="font-medium text-foreground mb-3">Résumé</h4>
                            <div className="grid gap-2 md:grid-cols-3">
                                <div className="p-3 rounded-lg bg-muted/30 text-center">
                                    <p className="text-2xl font-bold text-primary">{teacherSubjects.length}</p>
                                    <p className="text-xs text-muted-foreground">Matières</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/30 text-center">
                                    <p className="text-2xl font-bold text-primary">{Object.keys(assignmentsByClass).length}</p>
                                    <p className="text-xs text-muted-foreground">Classes</p>
                                </div>
                                <div className="p-3 rounded-lg bg-muted/30 text-center">
                                    <p className="text-2xl font-bold text-yellow-500">
                                        {assignments.filter((a) => a.is_main_teacher).length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Prof. Principal</p>
                                </div>
                            </div>
                        </GlassCard>
                    </TabsContent>
                </Tabs>

                <DialogFooter className="pt-4 border-t">
                    <GlassButton variant="ghost" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Fermer
                    </GlassButton>
                    <GlassButton variant="primary" onClick={handleSave}>
                        <Save className="h-4 w-4 mr-2" />
                        Terminé
                    </GlassButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default TeacherConfigurationModal;
