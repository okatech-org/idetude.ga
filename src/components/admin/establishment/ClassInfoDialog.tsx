/**
 * ClassInfoDialog - Modal affichant les infos détaillées d'une classe
 * Stats, enseignants, élèves, matières
 */

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
    Users,
    GraduationCap,
    BookOpen,
    Star,
    Calendar,
    School,
    User,
    Clock,
    Target,
    TrendingUp,
    Percent,
} from "lucide-react";

interface Teacher {
    id: string;
    subject_id?: string;
    subject?: string;
    is_main_teacher: boolean;
    profiles?: {
        first_name: string;
        last_name: string;
        email: string;
    };
}

interface Student {
    id: string;
    profiles?: {
        first_name: string;
        last_name: string;
        email: string;
    };
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

interface ClassInfoDialogProps {
    isOpen: boolean;
    onClose: () => void;
    classInfo: ClassInfo | null;
    teachers: Teacher[];
    students: Student[];
}

export const ClassInfoDialog = ({
    isOpen,
    onClose,
    classInfo,
    teachers,
    students,
}: ClassInfoDialogProps) => {
    if (!classInfo) return null;

    const mainTeacher = teachers.find((t) => t.is_main_teacher);
    const uniqueSubjects = [...new Set(teachers.map((t) => t.subject).filter(Boolean))];
    const occupancyRate = classInfo.capacity
        ? Math.round((students.length / classInfo.capacity) * 100)
        : 0;

    // Calculate mock stats (these would be real in production)
    const avgGrade = 13.5;
    const attendanceRate = 94;
    const homeworkCompletionRate = 87;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                            <GraduationCap className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-xl font-bold">{classInfo.name}</p>
                            <p className="text-sm text-muted-foreground font-normal">
                                {classInfo.level} {classInfo.section && `• ${classInfo.section}`}
                            </p>
                        </div>
                    </DialogTitle>
                    <DialogDescription>
                        Informations détaillées et statistiques de la classe
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Main Info Cards */}
                    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
                        <GlassCard className="p-3 text-center" solid>
                            <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
                            <p className="text-2xl font-bold text-foreground">{students.length}</p>
                            <p className="text-xs text-muted-foreground">Élèves</p>
                        </GlassCard>
                        <GlassCard className="p-3 text-center" solid>
                            <BookOpen className="h-5 w-5 mx-auto mb-1 text-green-500" />
                            <p className="text-2xl font-bold text-foreground">{uniqueSubjects.length}</p>
                            <p className="text-xs text-muted-foreground">Matières</p>
                        </GlassCard>
                        <GlassCard className="p-3 text-center" solid>
                            <User className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                            <p className="text-2xl font-bold text-foreground">{teachers.length}</p>
                            <p className="text-xs text-muted-foreground">Enseignants</p>
                        </GlassCard>
                        <GlassCard className="p-3 text-center" solid>
                            <Target className="h-5 w-5 mx-auto mb-1 text-orange-500" />
                            <p className="text-2xl font-bold text-foreground">{classInfo.capacity || "∞"}</p>
                            <p className="text-xs text-muted-foreground">Capacité</p>
                        </GlassCard>
                    </div>

                    {/* Occupancy */}
                    {classInfo.capacity && (
                        <GlassCard className="p-4" solid>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium">Taux de remplissage</p>
                                <Badge variant={occupancyRate > 90 ? "destructive" : occupancyRate > 70 ? "secondary" : "outline"}>
                                    {occupancyRate}%
                                </Badge>
                            </div>
                            <Progress value={occupancyRate} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-2">
                                {students.length} élèves sur {classInfo.capacity} places
                            </p>
                        </GlassCard>
                    )}

                    {/* Main Teacher */}
                    {mainTeacher && (
                        <GlassCard className="p-4" solid>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                                    <Star className="h-5 w-5 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Professeur Principal</p>
                                    <p className="font-semibold text-foreground">
                                        {mainTeacher.profiles?.first_name} {mainTeacher.profiles?.last_name}
                                    </p>
                                    {mainTeacher.profiles?.email && (
                                        <p className="text-xs text-muted-foreground">{mainTeacher.profiles.email}</p>
                                    )}
                                </div>
                            </div>
                        </GlassCard>
                    )}

                    {/* Academic Stats */}
                    <GlassCard className="p-4" solid>
                        <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Indicateurs de performance
                        </h4>
                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Moyenne générale</span>
                                    <span className="font-medium">{avgGrade}/20</span>
                                </div>
                                <Progress value={(avgGrade / 20) * 100} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Taux de présence</span>
                                    <span className="font-medium">{attendanceRate}%</span>
                                </div>
                                <Progress value={attendanceRate} className="h-2" />
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-muted-foreground">Devoirs rendus</span>
                                    <span className="font-medium">{homeworkCompletionRate}%</span>
                                </div>
                                <Progress value={homeworkCompletionRate} className="h-2" />
                            </div>
                        </div>
                    </GlassCard>

                    {/* Subjects & Teachers */}
                    {teachers.length > 0 && (
                        <GlassCard className="p-4" solid>
                            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                                <BookOpen className="h-4 w-4" />
                                Équipe enseignante ({teachers.length})
                            </h4>
                            <div className="space-y-2">
                                {teachers.map((t) => (
                                    <div
                                        key={t.id}
                                        className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-foreground">
                                                {t.profiles?.first_name} {t.profiles?.last_name}
                                            </span>
                                            {t.is_main_teacher && (
                                                <Badge className="text-xs bg-yellow-500/20 text-yellow-600">
                                                    <Star className="h-2 w-2 mr-1" />
                                                    PP
                                                </Badge>
                                            )}
                                        </div>
                                        {t.subject && (
                                            <Badge variant="outline" className="text-xs">
                                                {t.subject}
                                            </Badge>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </GlassCard>
                    )}

                    {/* Info Row */}
                    <div className="flex flex-wrap gap-2 justify-center">
                        <Badge variant="secondary" className="gap-1">
                            <Calendar className="h-3 w-3" />
                            {classInfo.school_year}
                        </Badge>
                        {classInfo.room && (
                            <Badge variant="outline" className="gap-1">
                                <School className="h-3 w-3" />
                                Salle {classInfo.room}
                            </Badge>
                        )}
                        <Badge variant="outline" className="gap-1">
                            <Clock className="h-3 w-3" />
                            32h/semaine
                        </Badge>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ClassInfoDialog;
