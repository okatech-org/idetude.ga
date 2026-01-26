import { useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Plus,
  FileText,
  Calendar,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Trash2,
  Users,
} from "lucide-react";
import { format, isPast, isToday, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

const SUBJECTS = [
  "Mathématiques",
  "Français",
  "Anglais",
  "Histoire-Géographie",
  "Sciences Physiques",
  "SVT",
  "Philosophie",
  "Économie",
  "Informatique",
];

interface Assignment {
  id: string;
  teacher_id: string;
  class_name: string;
  subject: string;
  title: string;
  description: string | null;
  due_date: string;
  max_points: number;
  created_at: string;
  submissions?: { id: string; student_id: string; status: string }[];
}

interface Submission {
  id: string;
  assignment_id: string;
  student_id: string;
  content: string | null;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
  status: string;
}

export default function Assignments() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");

  const [newAssignment, setNewAssignment] = useState({
    class_name: "",
    subject: "",
    title: "",
    description: "",
    due_date: "",
    max_points: "20",
  });

  const isTeacher = roles.some((r) =>
    ["teacher", "main_teacher", "super_admin", "school_admin"].includes(r)
  );

  // Fetch assignments
  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["assignments", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("assignments")
        .select("*, submissions(id, student_id, status)")
        .order("due_date", { ascending: true });

      if (error) throw error;
      return data as Assignment[];
    },
    enabled: !!user,
  });

  // Fetch my submissions (for students)
  const { data: mySubmissions = [] } = useQuery({
    queryKey: ["my-submissions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("student_id", user!.id);

      if (error) throw error;
      return data as Submission[];
    },
    enabled: !!user && !isTeacher,
  });

  // Create assignment mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("assignments").insert({
        teacher_id: user!.id,
        class_name: newAssignment.class_name,
        subject: newAssignment.subject,
        title: newAssignment.title,
        description: newAssignment.description || null,
        due_date: new Date(newAssignment.due_date).toISOString(),
        max_points: parseInt(newAssignment.max_points),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Devoir créé avec succès");
      setIsCreateOpen(false);
      setNewAssignment({
        class_name: "",
        subject: "",
        title: "",
        description: "",
        due_date: "",
        max_points: "20",
      });
    },
    onError: () => toast.error("Erreur lors de la création du devoir"),
  });

  // Submit assignment mutation
  const submitMutation = useMutation({
    mutationFn: async (assignmentId: string) => {
      const { error } = await supabase.from("submissions").upsert({
        assignment_id: assignmentId,
        student_id: user!.id,
        content: submissionContent,
        submitted_at: new Date().toISOString(),
        status: "submitted",
      }, {
        onConflict: "assignment_id,student_id",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-submissions"] });
      toast.success("Devoir soumis avec succès");
      setSelectedAssignment(null);
      setSubmissionContent("");
    },
    onError: () => toast.error("Erreur lors de la soumission"),
  });

  // Delete assignment mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assignments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["assignments"] });
      toast.success("Devoir supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const getStatusBadge = (assignment: Assignment) => {
    const dueDate = new Date(assignment.due_date);
    const submission = mySubmissions.find((s) => s.assignment_id === assignment.id);

    if (submission) {
      if (submission.status === "graded") {
        return (
          <Badge className="bg-green-500/10 text-green-600 border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Noté: {submission.grade}/{assignment.max_points}
          </Badge>
        );
      }
      return (
        <Badge variant="secondary">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Soumis
        </Badge>
      );
    }

    if (isPast(dueDate) && !isToday(dueDate)) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          En retard
        </Badge>
      );
    }

    const daysLeft = differenceInDays(dueDate, new Date());
    if (daysLeft <= 2) {
      return (
        <Badge className="bg-amber-500/10 text-amber-600 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          {daysLeft <= 0 ? "Aujourd'hui" : `${daysLeft}j restants`}
        </Badge>
      );
    }

    return (
      <Badge variant="outline">
        <Calendar className="h-3 w-3 mr-1" />
        {daysLeft}j restants
      </Badge>
    );
  };

  return (
    <UserLayout title="Devoirs et Exercices">

        {/* Actions */}
        <div className="flex justify-end mb-6">
          {isTeacher && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau devoir
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Créer un devoir</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Classe</Label>
                      <Input
                        placeholder="Ex: 3ème A"
                        value={newAssignment.class_name}
                        onChange={(e) =>
                          setNewAssignment({ ...newAssignment, class_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Matière</Label>
                      <Select
                        value={newAssignment.subject}
                        onValueChange={(v) =>
                          setNewAssignment({ ...newAssignment, subject: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {SUBJECTS.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Titre du devoir</Label>
                    <Input
                      placeholder="Ex: Exercices chapitre 5"
                      value={newAssignment.title}
                      onChange={(e) =>
                        setNewAssignment({ ...newAssignment, title: e.target.value })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Instructions détaillées..."
                      value={newAssignment.description}
                      onChange={(e) =>
                        setNewAssignment({ ...newAssignment, description: e.target.value })
                      }
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date limite</Label>
                      <Input
                        type="datetime-local"
                        value={newAssignment.due_date}
                        onChange={(e) =>
                          setNewAssignment({ ...newAssignment, due_date: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Points maximum</Label>
                      <Input
                        type="number"
                        value={newAssignment.max_points}
                        onChange={(e) =>
                          setNewAssignment({ ...newAssignment, max_points: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    onClick={() => createMutation.mutate()}
                    disabled={
                      !newAssignment.class_name ||
                      !newAssignment.subject ||
                      !newAssignment.title ||
                      !newAssignment.due_date ||
                      createMutation.isPending
                    }
                  >
                    {createMutation.isPending ? "Création..." : "Créer le devoir"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{assignments.length}</p>
                <p className="text-xs text-muted-foreground">Total devoirs</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {assignments.filter((a) => !isPast(new Date(a.due_date))).length}
                </p>
                <p className="text-xs text-muted-foreground">En cours</p>
              </div>
            </div>
          </GlassCard>
          {!isTeacher && (
            <>
              <GlassCard className="p-4" solid>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{mySubmissions.length}</p>
                    <p className="text-xs text-muted-foreground">Soumis</p>
                  </div>
                </div>
              </GlassCard>
              <GlassCard className="p-4" solid>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-destructive/10 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {
                        assignments.filter(
                          (a) =>
                            !mySubmissions.some((s) => s.assignment_id === a.id) &&
                            !isPast(new Date(a.due_date))
                        ).length
                      }
                    </p>
                    <p className="text-xs text-muted-foreground">À rendre</p>
                  </div>
                </div>
              </GlassCard>
            </>
          )}
          {isTeacher && (
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-secondary/10 rounded-lg">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {assignments.reduce((acc, a) => acc + (a.submissions?.length || 0), 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Soumissions</p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>

        {/* Assignments List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : assignments.length === 0 ? (
          <GlassCard className="p-12 text-center" solid>
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucun devoir</h3>
            <p className="text-muted-foreground">
              {isTeacher
                ? "Créez votre premier devoir en cliquant sur le bouton ci-dessus"
                : "Aucun devoir n'a été assigné pour le moment"}
            </p>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignments.map((assignment) => {
              const hasSubmitted = mySubmissions.some(
                (s) => s.assignment_id === assignment.id
              );

              return (
                <GlassCard key={assignment.id} className="p-6" solid>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="secondary" className="mb-2">
                        {assignment.subject}
                      </Badge>
                      <h3 className="font-bold line-clamp-1">{assignment.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {assignment.class_name}
                      </p>
                    </div>
                    {isTeacher && assignment.teacher_id === user?.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(assignment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  {assignment.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {assignment.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {format(new Date(assignment.due_date), "PPP à HH:mm", { locale: fr })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    {!isTeacher && getStatusBadge(assignment)}
                    {isTeacher && (
                      <Badge variant="outline">
                        <Users className="h-3 w-3 mr-1" />
                        {assignment.submissions?.length || 0} soumissions
                      </Badge>
                    )}

                    {!isTeacher && !hasSubmitted && !isPast(new Date(assignment.due_date)) && (
                      <Button
                        size="sm"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        <Send className="h-4 w-4 mr-1" />
                        Soumettre
                      </Button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Submission Modal */}
        <Dialog
          open={!!selectedAssignment}
          onOpenChange={() => setSelectedAssignment(null)}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Soumettre le devoir</DialogTitle>
            </DialogHeader>
            {selectedAssignment && (
              <div className="space-y-4 py-4">
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium">{selectedAssignment.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedAssignment.subject} • {selectedAssignment.class_name}
                  </p>
                  {selectedAssignment.description && (
                    <p className="text-sm mt-2">{selectedAssignment.description}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Votre réponse</Label>
                  <Textarea
                    placeholder="Rédigez votre réponse ici..."
                    value={submissionContent}
                    onChange={(e) => setSubmissionContent(e.target.value)}
                    rows={6}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={() => submitMutation.mutate(selectedAssignment.id)}
                  disabled={!submissionContent.trim() || submitMutation.isPending}
                >
                  {submitMutation.isPending ? "Envoi..." : "Envoyer ma réponse"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
