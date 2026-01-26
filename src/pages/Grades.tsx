import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  GraduationCap,
  Plus,
  Search,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Minus,
  Edit,
  Trash2,
  FileText,
  Calculator,
} from "lucide-react";

interface Grade {
  id: string;
  student_id: string;
  teacher_id: string;
  subject: string;
  grade: number;
  coefficient: number;
  grade_type: string;
  description: string | null;
  trimester: number;
  school_year: string;
  created_at: string;
  student?: { first_name: string; last_name: string };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const SUBJECTS = [
  "Mathématiques",
  "Français",
  "Histoire-Géographie",
  "Sciences",
  "Physique-Chimie",
  "SVT",
  "Anglais",
  "Espagnol",
  "Allemand",
  "EPS",
  "Arts Plastiques",
  "Musique",
  "Technologie",
  "Philosophie",
];

const GRADE_TYPES = [
  { value: "devoir", label: "Devoir" },
  { value: "controle", label: "Contrôle" },
  { value: "examen", label: "Examen" },
  { value: "oral", label: "Oral" },
  { value: "tp", label: "TP" },
];

const Grades = () => {
  const { user, roles, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [grades, setGrades] = useState<Grade[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTrimester, setSelectedTrimester] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingGrade, setEditingGrade] = useState<Grade | null>(null);

  // Form state
  const [formStudentId, setFormStudentId] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formGrade, setFormGrade] = useState("");
  const [formCoefficient, setFormCoefficient] = useState("1");
  const [formGradeType, setFormGradeType] = useState("devoir");
  const [formDescription, setFormDescription] = useState("");
  const [formTrimester, setFormTrimester] = useState("1");
  const [formSchoolYear, setFormSchoolYear] = useState("2025-2026");
  const [isSaving, setIsSaving] = useState(false);

  const isTeacher = roles.includes("teacher") || roles.includes("main_teacher");
  const isSuperAdmin = roles.includes("super_admin");
  const canManageGrades = isTeacher || isSuperAdmin;

  useEffect(() => {
    if (user) {
      fetchGrades();
      if (canManageGrades) {
        fetchStudents();
      }
    }
  }, [user, canManageGrades]);

  const fetchGrades = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("grades")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch student profiles
      const studentIds = new Set(data?.map((g) => g.student_id) || []);
      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", Array.from(studentIds));

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));

      const gradesWithStudents = data?.map((grade) => ({
        ...grade,
        student: profilesMap.get(grade.student_id),
      })) || [];

      setGrades(gradesWithStudents);
    } catch (error) {
      console.error("Error fetching grades:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      // Get all users with student role
      const { data: studentRoles } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "student");

      if (studentRoles && studentRoles.length > 0) {
        const studentIds = studentRoles.map((r) => r.user_id);
        const { data, error } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .in("id", studentIds);

        if (error) throw error;
        setStudents(data || []);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const handleSaveGrade = async () => {
    if (!user || !formStudentId || !formSubject || !formGrade) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const gradeValue = parseFloat(formGrade);
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > 20) {
      toast({
        title: "Erreur",
        description: "La note doit être comprise entre 0 et 20",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const gradeData = {
        student_id: formStudentId,
        teacher_id: user.id,
        subject: formSubject,
        grade: gradeValue,
        coefficient: parseFloat(formCoefficient) || 1,
        grade_type: formGradeType,
        description: formDescription || null,
        trimester: parseInt(formTrimester),
        school_year: formSchoolYear,
      };

      if (editingGrade) {
        const { error } = await supabase
          .from("grades")
          .update(gradeData)
          .eq("id", editingGrade.id);

        if (error) throw error;
        toast({ title: "Note modifiée avec succès" });
      } else {
        const { error } = await supabase.from("grades").insert(gradeData);

        if (error) throw error;
        toast({ title: "Note ajoutée avec succès" });
      }

      setShowAddModal(false);
      resetForm();
      fetchGrades();
    } catch (error) {
      console.error("Error saving grade:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la note",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGrade = async (gradeId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette note ?")) return;

    try {
      const { error } = await supabase.from("grades").delete().eq("id", gradeId);

      if (error) throw error;
      toast({ title: "Note supprimée" });
      fetchGrades();
    } catch (error) {
      console.error("Error deleting grade:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (grade: Grade) => {
    setEditingGrade(grade);
    setFormStudentId(grade.student_id);
    setFormSubject(grade.subject);
    setFormGrade(grade.grade.toString());
    setFormCoefficient(grade.coefficient.toString());
    setFormGradeType(grade.grade_type);
    setFormDescription(grade.description || "");
    setFormTrimester(grade.trimester.toString());
    setFormSchoolYear(grade.school_year);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setEditingGrade(null);
    setFormStudentId("");
    setFormSubject("");
    setFormGrade("");
    setFormCoefficient("1");
    setFormGradeType("devoir");
    setFormDescription("");
    setFormTrimester("1");
    setFormSchoolYear("2025-2026");
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 16) return "text-green-500";
    if (grade >= 14) return "text-emerald-500";
    if (grade >= 12) return "text-blue-500";
    if (grade >= 10) return "text-yellow-500";
    if (grade >= 8) return "text-orange-500";
    return "text-red-500";
  };

  const getGradeTrend = (grade: number) => {
    if (grade >= 14) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (grade >= 10) return <Minus className="h-4 w-4 text-yellow-500" />;
    return <TrendingDown className="h-4 w-4 text-red-500" />;
  };

  const filteredGrades = grades.filter((grade) => {
    const matchesSearch =
      grade.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTrimester =
      selectedTrimester === "all" || grade.trimester.toString() === selectedTrimester;
    const matchesSubject =
      selectedSubject === "all" || grade.subject === selectedSubject;

    return matchesSearch && matchesTrimester && matchesSubject;
  });

  // Calculate statistics
  const averageGrade =
    filteredGrades.length > 0
      ? filteredGrades.reduce((sum, g) => sum + g.grade * g.coefficient, 0) /
        filteredGrades.reduce((sum, g) => sum + g.coefficient, 0)
      : 0;

  const subjectAverages = SUBJECTS.map((subject) => {
    const subjectGrades = filteredGrades.filter((g) => g.subject === subject);
    if (subjectGrades.length === 0) return null;
    const avg =
      subjectGrades.reduce((sum, g) => sum + g.grade * g.coefficient, 0) /
      subjectGrades.reduce((sum, g) => sum + g.coefficient, 0);
    return { subject, average: avg, count: subjectGrades.length };
  }).filter(Boolean);

  if (authLoading) {
    return null; // UserLayout handles loading
  }

  if (!user) return null;

  return (
    <UserLayout title="Gestion des Notes">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Gestion des Notes</h1>
                <p className="text-sm text-muted-foreground">
                  {canManageGrades ? "Saisie et consultation des notes" : "Consultation de vos notes"}
                </p>
              </div>
            </div>
            {canManageGrades && (
              <GlassButton onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="h-4 w-4" />
                Nouvelle note
              </GlassButton>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calculator className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Moyenne générale</p>
                  <p className={`text-xl font-bold ${getGradeColor(averageGrade)}`}>
                    {averageGrade.toFixed(2)}/20
                  </p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Meilleure note</p>
                  <p className="text-xl font-bold text-green-500">
                    {filteredGrades.length > 0 ? Math.max(...filteredGrades.map((g) => g.grade)).toFixed(1) : "—"}/20
                  </p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total notes</p>
                  <p className="text-xl font-bold text-foreground">{filteredGrades.length}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Matières</p>
                  <p className="text-xl font-bold text-foreground">{subjectAverages.length}</p>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Filters */}
          <GlassCard className="p-4" solid>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <GlassInput
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Trimestre" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les trimestres</SelectItem>
                  <SelectItem value="1">Trimestre 1</SelectItem>
                  <SelectItem value="2">Trimestre 2</SelectItem>
                  <SelectItem value="3">Trimestre 3</SelectItem>
                </SelectContent>
              </Select>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Matière" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les matières</SelectItem>
                  {SUBJECTS.map((subject) => (
                    <SelectItem key={subject} value={subject}>
                      {subject}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </GlassCard>

          {/* Grades Tabs */}
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list">Liste des notes</TabsTrigger>
              <TabsTrigger value="subjects">Par matière</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-4">
              <GlassCard className="p-4" solid>
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredGrades.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Aucune note enregistrée</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border/50">
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Élève</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Matière</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Type</th>
                          <th className="text-center p-3 text-sm font-medium text-muted-foreground">Note</th>
                          <th className="text-center p-3 text-sm font-medium text-muted-foreground">Coef.</th>
                          <th className="text-left p-3 text-sm font-medium text-muted-foreground">Trimestre</th>
                          {canManageGrades && (
                            <th className="text-right p-3 text-sm font-medium text-muted-foreground">Actions</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredGrades.map((grade) => (
                          <tr key={grade.id} className="border-b border-border/30 hover:bg-muted/20">
                            <td className="p-3">
                              <p className="font-medium text-foreground">
                                {grade.student?.first_name} {grade.student?.last_name}
                              </p>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-muted-foreground" />
                                <span>{grade.subject}</span>
                              </div>
                            </td>
                            <td className="p-3 text-sm text-muted-foreground capitalize">
                              {grade.grade_type}
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <span className={`font-bold ${getGradeColor(grade.grade)}`}>
                                  {grade.grade.toFixed(1)}
                                </span>
                                <span className="text-muted-foreground">/20</span>
                                {getGradeTrend(grade.grade)}
                              </div>
                            </td>
                            <td className="p-3 text-center text-sm">{grade.coefficient}</td>
                            <td className="p-3 text-sm">T{grade.trimester}</td>
                            {canManageGrades && (
                              <td className="p-3">
                                <div className="flex justify-end gap-2">
                                  <GlassButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEdit(grade)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </GlassButton>
                                  <GlassButton
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteGrade(grade.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </GlassButton>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </TabsContent>

            <TabsContent value="subjects" className="mt-4">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {subjectAverages.map((item) => (
                  <GlassCard key={item!.subject} className="p-4" solid>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        <span className="font-medium">{item!.subject}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {item!.count} note(s)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-bold ${getGradeColor(item!.average)}`}>
                        {item!.average.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">/20</span>
                      {getGradeTrend(item!.average)}
                    </div>
                    <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item!.average >= 14
                            ? "bg-green-500"
                            : item!.average >= 10
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${(item!.average / 20) * 100}%` }}
                      />
                    </div>
                  </GlassCard>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      {/* Add/Edit Grade Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              {editingGrade ? "Modifier la note" : "Nouvelle note"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Élève *
              </label>
              <Select value={formStudentId} onValueChange={setFormStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un élève" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((student) => (
                    <SelectItem key={student.id} value={student.id}>
                      {student.first_name} {student.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Matière *
                </label>
                <Select value={formSubject} onValueChange={setFormSubject}>
                  <SelectTrigger>
                    <SelectValue placeholder="Matière" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((subject) => (
                      <SelectItem key={subject} value={subject}>
                        {subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Type
                </label>
                <Select value={formGradeType} onValueChange={setFormGradeType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Note *
                </label>
                <GlassInput
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  placeholder="0-20"
                  value={formGrade}
                  onChange={(e) => setFormGrade(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Coefficient
                </label>
                <GlassInput
                  type="number"
                  min="0.5"
                  max="10"
                  step="0.5"
                  value={formCoefficient}
                  onChange={(e) => setFormCoefficient(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Trimestre
                </label>
                <Select value={formTrimester} onValueChange={setFormTrimester}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">T1</SelectItem>
                    <SelectItem value="2">T2</SelectItem>
                    <SelectItem value="3">T3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Description (optionnel)
              </label>
              <GlassInput
                placeholder="Ex: Contrôle chapitre 3"
                value={formDescription}
                onChange={(e) => setFormDescription(e.target.value)}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <GlassButton variant="outline" onClick={() => setShowAddModal(false)}>
                Annuler
              </GlassButton>
              <GlassButton onClick={handleSaveGrade} disabled={isSaving}>
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    {editingGrade ? "Modifier" : "Enregistrer"}
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default Grades;
