import { useState, useEffect } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Target,
  Plus,
  Award,
  Search,
  Filter,
  Star,
  Users,
  Edit,
  History,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Competency {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  class_level: string;
  max_level: number;
  created_by: string;
}

interface StudentCompetency {
  id: string;
  student_id: string;
  competency_id: string;
  current_level: number;
  evaluated_at: string;
  notes: string | null;
  competency?: Competency;
}

interface CompetencyHistoryItem {
  id: string;
  student_competency_id: string;
  previous_level: number;
  new_level: number;
  notes: string | null;
  created_at: string;
}

interface StudentProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const subjects = [
  "Mathématiques",
  "Français",
  "Histoire-Géographie",
  "Sciences",
  "Anglais",
  "Physique-Chimie",
  "SVT",
];

const classLevels = [
  "6ème",
  "5ème",
  "4ème",
  "3ème",
  "2nde",
  "1ère",
  "Terminale",
];

const levelLabels = ["Non acquis", "En cours", "Acquis", "Maîtrisé", "Expert"];
const levelColors = [
  "bg-destructive",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-primary",
];

const Competencies = () => {
  const { user, roles } = useAuth();
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [studentCompetencies, setStudentCompetencies] = useState<StudentCompetency[]>([]);
  const [competencyHistory, setCompetencyHistory] = useState<CompetencyHistoryItem[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEvaluateOpen, setIsEvaluateOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedCompetency, setSelectedCompetency] = useState<Competency | null>(null);
  const [evaluationData, setEvaluationData] = useState({
    level: 0,
    notes: "",
  });
  const [newCompetency, setNewCompetency] = useState({
    name: "",
    description: "",
    subject: "",
    class_level: "",
    max_level: 4,
  });

  const isTeacher = roles.includes("teacher") || roles.includes("super_admin") || roles.includes("main_teacher");

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, subjectFilter]);

  const fetchData = async () => {
    try {
      let query = supabase
        .from("competencies")
        .select("*")
        .order("subject", { ascending: true });

      if (subjectFilter !== "all") {
        query = query.eq("subject", subjectFilter);
      }

      const { data: compData, error: compError } = await query;
      if (compError) throw compError;
      setCompetencies(compData || []);

      if (isTeacher) {
        // Fetch students for teachers
        const { data: studentsData } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email")
          .order("last_name", { ascending: true });
        setStudents(studentsData || []);

        // Fetch all student competencies for teacher view
        const { data: allStudentComps } = await supabase
          .from("student_competencies")
          .select("*");
        setStudentCompetencies(allStudentComps || []);
      } else {
        // Fetch student's own competencies
        const { data: studentData, error: studentError } = await supabase
          .from("student_competencies")
          .select("*, competency:competencies(*)")
          .eq("student_id", user.id);

        if (studentError) throw studentError;
        setStudentCompetencies(studentData || []);

        // Fetch history for student view
        if (studentData && studentData.length > 0) {
          const scIds = studentData.map((sc) => sc.id);
          const { data: historyData } = await supabase
            .from("competency_history")
            .select("*")
            .in("student_competency_id", scIds)
            .order("created_at", { ascending: true });
          setCompetencyHistory(historyData || []);
        }
      }
    } catch (error) {
      console.error("Error fetching competencies:", error);
      toast.error("Erreur lors du chargement des compétences");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCompetency = async () => {
    if (!user || !newCompetency.name || !newCompetency.subject || !newCompetency.class_level) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    try {
      const { error } = await supabase.from("competencies").insert({
        name: newCompetency.name,
        description: newCompetency.description || null,
        subject: newCompetency.subject,
        class_level: newCompetency.class_level,
        max_level: newCompetency.max_level,
        created_by: user.id,
      });

      if (error) throw error;

      toast.success("Compétence créée avec succès");
      setIsCreateOpen(false);
      setNewCompetency({
        name: "",
        description: "",
        subject: "",
        class_level: "",
        max_level: 4,
      });
      fetchData();
    } catch (error) {
      console.error("Error creating competency:", error);
      toast.error("Erreur lors de la création");
    }
  };

  const handleEvaluate = async () => {
    if (!user || !selectedStudent || !selectedCompetency) {
      toast.error("Veuillez sélectionner un élève et une compétence");
      return;
    }

    try {
      // Check if evaluation exists
      const { data: existing } = await supabase
        .from("student_competencies")
        .select("*")
        .eq("student_id", selectedStudent)
        .eq("competency_id", selectedCompetency.id)
        .maybeSingle();

      if (existing) {
        // Update existing and add to history
        await supabase.from("competency_history").insert({
          student_competency_id: existing.id,
          previous_level: existing.current_level,
          new_level: evaluationData.level,
          notes: evaluationData.notes || null,
          evaluated_by: user.id,
        });

        await supabase
          .from("student_competencies")
          .update({
            current_level: evaluationData.level,
            notes: evaluationData.notes || null,
            evaluated_at: new Date().toISOString(),
          })
          .eq("id", existing.id);
      } else {
        // Create new evaluation
        const { data: newEval } = await supabase
          .from("student_competencies")
          .insert({
            student_id: selectedStudent,
            competency_id: selectedCompetency.id,
            current_level: evaluationData.level,
            notes: evaluationData.notes || null,
            evaluated_by: user.id,
          })
          .select()
          .single();

        if (newEval) {
          await supabase.from("competency_history").insert({
            student_competency_id: newEval.id,
            previous_level: 0,
            new_level: evaluationData.level,
            notes: evaluationData.notes || null,
            evaluated_by: user.id,
          });
        }
      }

      toast.success("Évaluation enregistrée");
      setIsEvaluateOpen(false);
      setEvaluationData({ level: 0, notes: "" });
      setSelectedStudent("");
      setSelectedCompetency(null);
      fetchData();
    } catch (error) {
      console.error("Error evaluating:", error);
      toast.error("Erreur lors de l'évaluation");
    }
  };

  const openEvaluationDialog = (comp: Competency) => {
    setSelectedCompetency(comp);
    setIsEvaluateOpen(true);
  };

  const getStudentLevel = (competencyId: string) => {
    const sc = studentCompetencies.find((s) => s.competency_id === competencyId);
    return sc?.current_level || 0;
  };

  const filteredCompetencies = competencies.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const groupedCompetencies = filteredCompetencies.reduce((acc, comp) => {
    if (!acc[comp.subject]) {
      acc[comp.subject] = [];
    }
    acc[comp.subject].push(comp);
    return acc;
  }, {} as Record<string, Competency[]>);

  const overallProgress =
    studentCompetencies.length > 0
      ? Math.round(
          (studentCompetencies.reduce((sum, sc) => sum + sc.current_level, 0) /
            (studentCompetencies.length * 4)) *
            100
        )
      : 0;

  // Prepare chart data for student
  const getProgressChartData = () => {
    const byMonth: Record<string, { month: string; level: number; count: number }> = {};
    
    competencyHistory.forEach((h) => {
      const monthKey = format(new Date(h.created_at), "MMM yyyy", { locale: fr });
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { month: monthKey, level: 0, count: 0 };
      }
      byMonth[monthKey].level += h.new_level;
      byMonth[monthKey].count += 1;
    });

    return Object.values(byMonth).map((m) => ({
      month: m.month,
      niveau: Math.round((m.level / m.count) * 25), // Convert to percentage
    }));
  };

  // Get subject progress for radar-like display
  const getSubjectProgress = () => {
    const subjectStats: Record<string, { total: number; sum: number }> = {};
    
    studentCompetencies.forEach((sc) => {
      const comp = sc.competency || competencies.find((c) => c.id === sc.competency_id);
      if (comp) {
        if (!subjectStats[comp.subject]) {
          subjectStats[comp.subject] = { total: 0, sum: 0 };
        }
        subjectStats[comp.subject].total += 4;
        subjectStats[comp.subject].sum += sc.current_level;
      }
    });

    return Object.entries(subjectStats).map(([subject, stats]) => ({
      subject,
      progress: Math.round((stats.sum / stats.total) * 100),
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <GlassCard className="p-8 text-center">
            <p>Veuillez vous connecter pour accéder au suivi des compétences.</p>
          </GlassCard>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Suivi des compétences</h1>
            <p className="text-muted-foreground mt-1">
              {isTeacher
                ? "Définissez et évaluez les compétences des élèves"
                : "Suivez votre progression par matière"}
            </p>
          </div>

          <div className="flex gap-2">
            {isTeacher && (
              <>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                  <DialogTrigger asChild>
                    <GlassButton>
                      <Plus className="h-4 w-4 mr-2" />
                      Nouvelle compétence
                    </GlassButton>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Créer une compétence</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nom de la compétence *</Label>
                        <GlassInput
                          value={newCompetency.name}
                          onChange={(e) =>
                            setNewCompetency((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          placeholder="Ex: Résoudre une équation du 2nd degré"
                          className="mt-1"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Matière *</Label>
                          <Select
                            value={newCompetency.subject}
                            onValueChange={(value) =>
                              setNewCompetency((prev) => ({ ...prev, subject: value }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {subjects.map((subject) => (
                                <SelectItem key={subject} value={subject}>
                                  {subject}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>Niveau *</Label>
                          <Select
                            value={newCompetency.class_level}
                            onValueChange={(value) =>
                              setNewCompetency((prev) => ({
                                ...prev,
                                class_level: value,
                              }))
                            }
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue placeholder="Sélectionner" />
                            </SelectTrigger>
                            <SelectContent>
                              {classLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label>Description</Label>
                        <Textarea
                          value={newCompetency.description}
                          onChange={(e) =>
                            setNewCompetency((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          placeholder="Description de la compétence"
                          className="mt-1"
                        />
                      </div>

                      <GlassButton onClick={handleCreateCompetency} className="w-full">
                        Créer la compétence
                      </GlassButton>
                    </div>
                  </DialogContent>
                </Dialog>
              </>
            )}

            {!isTeacher && competencyHistory.length > 0 && (
              <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <History className="h-4 w-4 mr-2" />
                    Historique
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Historique de progression</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {competencyHistory.slice(-10).reverse().map((h) => (
                      <div key={h.id} className="flex items-center gap-4 p-3 rounded-lg bg-muted/50">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge className={levelColors[h.previous_level]}>
                              {levelLabels[h.previous_level]}
                            </Badge>
                            <span>→</span>
                            <Badge className={levelColors[h.new_level]}>
                              {levelLabels[h.new_level]}
                            </Badge>
                          </div>
                          {h.notes && (
                            <p className="text-sm text-muted-foreground mt-1">{h.notes}</p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(h.created_at), "dd MMM yyyy", { locale: fr })}
                        </span>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Evaluate Dialog for Teachers */}
        <Dialog open={isEvaluateOpen} onOpenChange={setIsEvaluateOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Évaluer une compétence</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {selectedCompetency && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="font-medium">{selectedCompetency.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCompetency.subject} - {selectedCompetency.class_level}
                  </p>
                </div>
              )}

              <div>
                <Label>Élève *</Label>
                <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                  <SelectTrigger className="mt-1">
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

              <div>
                <Label>Niveau d'acquisition *</Label>
                <div className="grid grid-cols-5 gap-2 mt-2">
                  {levelLabels.map((label, index) => (
                    <button
                      key={index}
                      onClick={() => setEvaluationData((prev) => ({ ...prev, level: index }))}
                      className={`p-2 rounded-lg text-xs text-center transition-all ${
                        evaluationData.level === index
                          ? `${levelColors[index]} text-white`
                          : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Commentaire</Label>
                <Textarea
                  value={evaluationData.notes}
                  onChange={(e) =>
                    setEvaluationData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Observations sur l'acquisition..."
                  className="mt-1"
                />
              </div>

              <GlassButton onClick={handleEvaluate} className="w-full">
                Enregistrer l'évaluation
              </GlassButton>
            </div>
          </DialogContent>
        </Dialog>

        {/* Student Progress Overview with Charts */}
        {!isTeacher && studentCompetencies.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <Award className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Progression globale</h2>
                    <p className="text-sm text-muted-foreground">
                      {studentCompetencies.length} compétences évaluées
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-primary">{overallProgress}%</div>
                  <p className="text-sm text-muted-foreground">de maîtrise</p>
                </div>
              </div>
              <Progress value={overallProgress} className="h-3 mb-4" />
              
              {/* Subject breakdown */}
              <div className="space-y-3 mt-4">
                {getSubjectProgress().map(({ subject, progress }) => (
                  <div key={subject}>
                    <div className="flex justify-between text-sm mb-1">
                      <span>{subject}</span>
                      <span className="font-medium">{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* Progress Chart */}
            {getProgressChartData().length > 1 && (
              <GlassCard className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-lg bg-primary/10">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">Évolution temporelle</h2>
                    <p className="text-sm text-muted-foreground">Progression mensuelle</p>
                  </div>
                </div>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getProgressChartData()}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" className="text-xs" />
                      <YAxis domain={[0, 100]} className="text-xs" />
                      <Tooltip />
                      <Line
                        type="monotone"
                        dataKey="niveau"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        dot={{ fill: "hsl(var(--primary))" }}
                        name="Niveau moyen (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </GlassCard>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <GlassInput
              placeholder="Rechercher une compétence..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[200px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Matière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Competencies by Subject */}
        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : Object.keys(groupedCompetencies).length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Aucune compétence trouvée</p>
            <p className="text-muted-foreground mt-1">
              {isTeacher
                ? "Créez votre première compétence"
                : "Aucune compétence n'a été définie pour l'instant"}
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedCompetencies).map(([subject, comps]) => (
              <div key={subject}>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  {subject}
                </h2>
                <div className="grid gap-4">
                  {comps.map((comp) => {
                    const studentLevel = getStudentLevel(comp.id);
                    const progressPercent = (studentLevel / comp.max_level) * 100;

                    return (
                      <GlassCard key={comp.id} className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{comp.name}</h3>
                              <Badge variant="outline" className="text-xs">
                                {comp.class_level}
                              </Badge>
                            </div>
                            {comp.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {comp.description}
                              </p>
                            )}

                            {!isTeacher && (
                              <div className="mt-4">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-sm text-muted-foreground">
                                    Niveau actuel
                                  </span>
                                  <Badge
                                    className={`${levelColors[studentLevel]} text-white`}
                                  >
                                    {levelLabels[studentLevel]}
                                  </Badge>
                                </div>
                                <Progress value={progressPercent} className="h-2" />
                                <div className="flex justify-between mt-1">
                                  {Array.from({ length: comp.max_level + 1 }).map(
                                    (_, i) => (
                                      <div
                                        key={i}
                                        className={`w-2 h-2 rounded-full ${
                                          i <= studentLevel
                                            ? levelColors[i]
                                            : "bg-muted"
                                        }`}
                                      />
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {isTeacher && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEvaluationDialog(comp)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Évaluer
                            </Button>
                          )}
                        </div>
                      </GlassCard>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Competencies;
