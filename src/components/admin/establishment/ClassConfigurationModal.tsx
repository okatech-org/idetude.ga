/**
 * ClassConfigurationModal - Modal de configuration complète d'une classe
 * Gestion des matières, enseignants et professeur principal
 */

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
} from "lucide-react";

interface Subject {
    id: string;
    name: string;
    code?: string;
}

interface Teacher {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
}

interface ClassTeacher {
    id: string;
    teacher_id: string;
    subject_id: string;
    is_main_teacher: boolean;
    subject_name?: string;
    teacher_first_name?: string;
    teacher_last_name?: string;
}

interface ClassInfo {
    id: string;
    name: string;
    level: string;
    section?: string;
    capacity?: number;
    room?: string;
    school_year: string;
}

interface ClassConfigurationModalProps {
    isOpen: boolean;
    onClose: () => void;
    classInfo: ClassInfo | null;
    establishmentId: string;
    onSave?: () => void;
}

export const ClassConfigurationModal = ({
    isOpen,
    onClose,
    classInfo,
    establishmentId,
    onSave,
}: ClassConfigurationModalProps) => {
    const [activeTab, setActiveTab] = useState("subjects");
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [classTeachers, setClassTeachers] = useState<ClassTeacher[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Form states for adding new subject-teacher
    const [selectedSubject, setSelectedSubject] = useState<string>("");
    const [selectedTeacher, setSelectedTeacher] = useState<string>("");

    // Class info editing
    const [editedClass, setEditedClass] = useState<ClassInfo | null>(null);

    useEffect(() => {
        if (isOpen && classInfo) {
            setEditedClass({ ...classInfo });
            fetchData();
        }
    }, [isOpen, classInfo]);

    const fetchData = async () => {
        if (!classInfo) return;
        setIsLoading(true);
        try {
            // Fetch all subjects
            const subjectsRes = await fetch('/api/db/subjects');
            if (subjectsRes.ok) {
                setSubjects(await subjectsRes.json());
            }

            // Fetch teachers (staff with teaching role)
            const teachersRes = await fetch(`/api/db/establishments/${establishmentId}/teachers`);
            if (teachersRes.ok) {
                setTeachers(await teachersRes.json());
            }

            // Fetch current class-teacher assignments
            const assignmentsRes = await fetch(`/api/db/classes/${classInfo.id}/teachers`);
            if (assignmentsRes.ok) {
                const data = await assignmentsRes.json();
                setClassTeachers(data.map((t: any) => ({
                    id: t.id,
                    teacher_id: t.id,
                    subject_id: t.subject_id,
                    is_main_teacher: t.is_main_teacher || false,
                    subject_name: t.subject_name,
                    teacher_first_name: t.first_name,
                    teacher_last_name: t.last_name,
                })));
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            toast.error("Erreur lors du chargement des données");
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddSubjectTeacher = async () => {
        if (!selectedSubject || !selectedTeacher || !classInfo) {
            toast.error("Veuillez sélectionner une matière et un enseignant");
            return;
        }

        // Check if assignment already exists
        const exists = classTeachers.some(
            ct => ct.subject_id === selectedSubject && ct.teacher_id === selectedTeacher
        );
        if (exists) {
            toast.error("Cette affectation existe déjà");
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch(`/api/db/classes/${classInfo.id}/teachers`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teacher_id: selectedTeacher,
                    subject_id: selectedSubject,
                    is_main_teacher: classTeachers.length === 0, // First teacher is main by default
                }),
            });

            if (res.ok) {
                toast.success("Enseignant affecté avec succès");
                fetchData();
                setSelectedSubject("");
                setSelectedTeacher("");
            } else {
                throw new Error("Erreur lors de l'affectation");
            }
        } catch (error) {
            toast.error("Erreur lors de l'affectation de l'enseignant");
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveAssignment = async (assignmentId: string) => {
        if (!confirm("Supprimer cette affectation ?")) return;

        try {
            const res = await fetch(`/api/db/class-teachers/${assignmentId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                toast.success("Affectation supprimée");
                fetchData();
            }
        } catch (error) {
            toast.error("Erreur lors de la suppression");
        }
    };

    const handleSetMainTeacher = async (teacherId: string) => {
        if (!classInfo) return;

        try {
            const res = await fetch(`/api/db/classes/${classInfo.id}/main-teacher`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ teacher_id: teacherId }),
            });

            if (res.ok) {
                toast.success("Professeur principal défini");
                fetchData();
            }
        } catch (error) {
            toast.error("Erreur lors de la modification");
        }
    };

    const handleSaveClassInfo = async () => {
        if (!editedClass) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/db/classes/${editedClass.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editedClass.name,
                    capacity: editedClass.capacity,
                    room: editedClass.room,
                }),
            });

            if (res.ok) {
                toast.success("Classe mise à jour");
                onSave?.();
            }
        } catch (error) {
            toast.error("Erreur lors de la sauvegarde");
        } finally {
            setIsSaving(false);
        }
    };

    // Get available subjects (not yet assigned)
    const availableSubjects = subjects.filter(
        s => !classTeachers.some(ct => ct.subject_id === s.id)
    );

    const mainTeacher = classTeachers.find(ct => ct.is_main_teacher);

    if (!classInfo) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Configuration de la classe {classInfo.name}
                    </DialogTitle>
                    <DialogDescription>
                        Gérez les matières, enseignants et informations de la classe
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
                    <TabsList className="w-full justify-start">
                        <TabsTrigger value="subjects" className="gap-2">
                            <BookOpen className="h-4 w-4" />
                            Matières & Enseignants
                        </TabsTrigger>
                        <TabsTrigger value="info" className="gap-2">
                            <GraduationCap className="h-4 w-4" />
                            Informations
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto mt-4">
                        {/* Subjects & Teachers Tab */}
                        <TabsContent value="subjects" className="space-y-4">
                            {/* Main Teacher Section */}
                            <GlassCard className="p-4" solid>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                            <Star className="h-5 w-5 text-yellow-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Professeur Principal</p>
                                            <p className="font-semibold">
                                                {mainTeacher
                                                    ? `${mainTeacher.teacher_first_name} ${mainTeacher.teacher_last_name}`
                                                    : "Non défini"}
                                            </p>
                                        </div>
                                    </div>
                                    {mainTeacher && (
                                        <Badge variant="secondary">{mainTeacher.subject_name}</Badge>
                                    )}
                                </div>
                            </GlassCard>

                            {/* Add Subject-Teacher */}
                            <GlassCard className="p-4" solid>
                                <h3 className="font-medium mb-3 flex items-center gap-2">
                                    <Plus className="h-4 w-4" />
                                    Ajouter une matière
                                </h3>
                                <div className="flex gap-3">
                                    <div className="flex-1">
                                        <Label className="text-xs">Matière</Label>
                                        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner une matière" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableSubjects.map(s => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex-1">
                                        <Label className="text-xs">Enseignant</Label>
                                        <Select value={selectedTeacher} onValueChange={setSelectedTeacher}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sélectionner un enseignant" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {teachers.map(t => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.first_name} {t.last_name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="flex items-end">
                                        <GlassButton
                                            variant="primary"
                                            size="sm"
                                            onClick={handleAddSubjectTeacher}
                                            disabled={!selectedSubject || !selectedTeacher || isSaving}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </GlassButton>
                                    </div>
                                </div>
                            </GlassCard>

                            {/* Current Assignments */}
                            <div className="space-y-2">
                                <h3 className="font-medium text-sm text-muted-foreground">
                                    Matières assignées ({classTeachers.length})
                                </h3>
                                {isLoading ? (
                                    <div className="text-center py-4 text-muted-foreground">
                                        Chargement...
                                    </div>
                                ) : classTeachers.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Aucune matière assignée</p>
                                        <p className="text-sm">Ajoutez des matières et leurs enseignants</p>
                                    </div>
                                ) : (
                                    <div className="grid gap-2">
                                        {classTeachers.map((ct) => (
                                            <GlassCard
                                                key={ct.id}
                                                className={`p-3 flex items-center justify-between ${ct.is_main_teacher ? 'border-yellow-500/50' : ''
                                                    }`}
                                                solid
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                                        <BookOpen className="h-4 w-4 text-primary" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-sm">{ct.subject_name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {ct.teacher_first_name} {ct.teacher_last_name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {ct.is_main_teacher ? (
                                                        <Badge variant="secondary" className="gap-1">
                                                            <Star className="h-3 w-3" />
                                                            PP
                                                        </Badge>
                                                    ) : (
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => handleSetMainTeacher(ct.teacher_id)}
                                                            title="Définir comme professeur principal"
                                                        >
                                                            <Star className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleRemoveAssignment(ct.id)}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </GlassCard>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </TabsContent>

                        {/* Class Info Tab */}
                        <TabsContent value="info" className="space-y-4">
                            {editedClass && (
                                <GlassCard className="p-4 space-y-4" solid>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Nom de la classe</Label>
                                            <Input
                                                value={editedClass.name}
                                                onChange={(e) => setEditedClass({ ...editedClass, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <Label>Niveau</Label>
                                            <Input value={editedClass.level} disabled className="bg-muted" />
                                        </div>
                                        <div>
                                            <Label>Salle</Label>
                                            <Input
                                                value={editedClass.room || ""}
                                                onChange={(e) => setEditedClass({ ...editedClass, room: e.target.value })}
                                                placeholder="Ex: Salle 101"
                                            />
                                        </div>
                                        <div>
                                            <Label>Capacité</Label>
                                            <Input
                                                type="number"
                                                value={editedClass.capacity || ""}
                                                onChange={(e) => setEditedClass({ ...editedClass, capacity: parseInt(e.target.value) || undefined })}
                                                placeholder="25"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t">
                                        <GlassButton
                                            variant="primary"
                                            onClick={handleSaveClassInfo}
                                            disabled={isSaving}
                                        >
                                            <Save className="h-4 w-4 mr-2" />
                                            Enregistrer les modifications
                                        </GlassButton>
                                    </div>
                                </GlassCard>
                            )}
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default ClassConfigurationModal;
