import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  UserX,
  Plus,
  Search,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  Filter,
} from "lucide-react";

interface Absence {
  id: string;
  student_id: string;
  recorded_by: string;
  absence_date: string;
  start_time: string | null;
  end_time: string | null;
  absence_type: string;
  is_justified: boolean;
  justification: string | null;
  justified_by: string | null;
  justified_at: string | null;
  created_at: string;
  student?: { first_name: string; last_name: string };
  recorder?: { first_name: string; last_name: string };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const Absences = () => {
  const navigate = useNavigate();
  const { user, roles, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const [absences, setAbsences] = useState<Absence[]>([]);
  const [students, setStudents] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterJustified, setFilterJustified] = useState<string>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showJustifyModal, setShowJustifyModal] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);

  // Form state
  const [formStudentId, setFormStudentId] = useState("");
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]);
  const [formStartTime, setFormStartTime] = useState("");
  const [formEndTime, setFormEndTime] = useState("");
  const [formType, setFormType] = useState<"absence" | "retard">("absence");
  const [formJustification, setFormJustification] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const isTeacher = roles.includes("teacher") || roles.includes("main_teacher");
  const isCPE = roles.includes("cpe");
  const isAdmin = roles.includes("super_admin") || roles.includes("school_admin") || roles.includes("school_director");
  const canManageAbsences = isTeacher || isCPE || isAdmin;
  const canJustify = isCPE || isAdmin;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAbsences();
      if (canManageAbsences) {
        fetchStudents();
      }
    }
  }, [user, canManageAbsences]);

  const fetchAbsences = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("absences")
        .select("*")
        .order("absence_date", { ascending: false });

      if (error) throw error;

      // Fetch student and recorder profiles
      const userIds = new Set<string>();
      data?.forEach((a) => {
        userIds.add(a.student_id);
        userIds.add(a.recorded_by);
      });

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", Array.from(userIds));

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));

      const absencesWithProfiles = data?.map((absence) => ({
        ...absence,
        student: profilesMap.get(absence.student_id),
        recorder: profilesMap.get(absence.recorded_by),
      })) || [];

      setAbsences(absencesWithProfiles);
    } catch (error) {
      console.error("Error fetching absences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
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

  const handleAddAbsence = async () => {
    if (!user || !formStudentId || !formDate) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase.from("absences").insert({
        student_id: formStudentId,
        recorded_by: user.id,
        absence_date: formDate,
        start_time: formStartTime || null,
        end_time: formEndTime || null,
        absence_type: formType,
      });

      if (error) throw error;

      toast({ title: formType === "absence" ? "Absence enregistrée" : "Retard enregistré" });
      setShowAddModal(false);
      resetForm();
      fetchAbsences();
    } catch (error) {
      console.error("Error adding absence:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleJustify = async () => {
    if (!user || !selectedAbsence || !formJustification.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez fournir une justification",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("absences")
        .update({
          is_justified: true,
          justification: formJustification.trim(),
          justified_by: user.id,
          justified_at: new Date().toISOString(),
        })
        .eq("id", selectedAbsence.id);

      if (error) throw error;

      toast({ title: "Absence justifiée" });
      setShowJustifyModal(false);
      setSelectedAbsence(null);
      setFormJustification("");
      fetchAbsences();
    } catch (error) {
      console.error("Error justifying absence:", error);
      toast({
        title: "Erreur",
        description: "Impossible de justifier l'absence",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormStudentId("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setFormStartTime("");
    setFormEndTime("");
    setFormType("absence");
  };

  const openJustifyModal = (absence: Absence) => {
    setSelectedAbsence(absence);
    setFormJustification(absence.justification || "");
    setShowJustifyModal(true);
  };

  const filteredAbsences = absences.filter((absence) => {
    const matchesSearch =
      absence.student?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      absence.student?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "all" || absence.absence_type === filterType;
    const matchesJustified =
      filterJustified === "all" ||
      (filterJustified === "justified" && absence.is_justified) ||
      (filterJustified === "unjustified" && !absence.is_justified);

    return matchesSearch && matchesType && matchesJustified;
  });

  // Statistics
  const totalAbsences = absences.filter((a) => a.absence_type === "absence").length;
  const totalRetards = absences.filter((a) => a.absence_type === "retard").length;
  const unjustifiedCount = absences.filter((a) => !a.is_justified).length;
  const justifiedCount = absences.filter((a) => a.is_justified).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-500/5 flex items-center justify-center">
                <UserX className="h-6 w-6 text-orange-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Suivi des Absences</h1>
                <p className="text-sm text-muted-foreground">
                  {canManageAbsences ? "Enregistrement et gestion" : "Consultation de vos absences"}
                </p>
              </div>
            </div>
            {canManageAbsences && (
              <GlassButton onClick={() => { resetForm(); setShowAddModal(true); }}>
                <Plus className="h-4 w-4" />
                Enregistrer une absence
              </GlassButton>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <UserX className="h-5 w-5 text-red-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Absences</p>
                  <p className="text-xl font-bold text-foreground">{totalAbsences}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Retards</p>
                  <p className="text-xl font-bold text-foreground">{totalRetards}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Non justifiées</p>
                  <p className="text-xl font-bold text-orange-500">{unjustifiedCount}</p>
                </div>
              </div>
            </GlassCard>
            <GlassCard className="p-4" solid>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Justifiées</p>
                  <p className="text-xl font-bold text-green-500">{justifiedCount}</p>
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
                  placeholder="Rechercher un élève..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous types</SelectItem>
                  <SelectItem value="absence">Absences</SelectItem>
                  <SelectItem value="retard">Retards</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterJustified} onValueChange={setFilterJustified}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous statuts</SelectItem>
                  <SelectItem value="justified">Justifiées</SelectItem>
                  <SelectItem value="unjustified">Non justifiées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </GlassCard>

          {/* Absences List */}
          <GlassCard className="p-4" solid>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredAbsences.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <UserX className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucune absence enregistrée</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAbsences.map((absence) => (
                  <div
                    key={absence.id}
                    className={`p-4 rounded-xl border transition-all ${
                      absence.is_justified
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-orange-500/5 border-orange-500/20"
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            absence.absence_type === "retard"
                              ? "bg-yellow-500/20"
                              : "bg-red-500/20"
                          }`}
                        >
                          {absence.absence_type === "retard" ? (
                            <Clock className="h-5 w-5 text-yellow-500" />
                          ) : (
                            <UserX className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">
                            {absence.student?.first_name} {absence.student?.last_name}
                          </p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            {new Date(absence.absence_date).toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                            {absence.start_time && (
                              <span>• {absence.start_time.slice(0, 5)}</span>
                            )}
                            {absence.end_time && (
                              <span>- {absence.end_time.slice(0, 5)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={absence.absence_type === "retard" ? "secondary" : "destructive"}
                        >
                          {absence.absence_type === "retard" ? "Retard" : "Absence"}
                        </Badge>
                        <Badge
                          variant={absence.is_justified ? "default" : "outline"}
                          className={absence.is_justified ? "bg-green-500" : "text-orange-500 border-orange-500"}
                        >
                          {absence.is_justified ? (
                            <>
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Justifiée
                            </>
                          ) : (
                            <>
                              <XCircle className="h-3 w-3 mr-1" />
                              Non justifiée
                            </>
                          )}
                        </Badge>
                        {canJustify && !absence.is_justified && (
                          <GlassButton
                            size="sm"
                            variant="outline"
                            onClick={() => openJustifyModal(absence)}
                          >
                            <FileText className="h-3 w-3" />
                            Justifier
                          </GlassButton>
                        )}
                      </div>
                    </div>
                    {absence.is_justified && absence.justification && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/30">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Justification :</span> {absence.justification}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Add Absence Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5" />
              Enregistrer une absence/retard
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

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Type
              </label>
              <Select value={formType} onValueChange={(v) => setFormType(v as "absence" | "retard")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="absence">Absence</SelectItem>
                  <SelectItem value="retard">Retard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Date *
              </label>
              <GlassInput
                type="date"
                value={formDate}
                onChange={(e) => setFormDate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Heure début
                </label>
                <GlassInput
                  type="time"
                  value={formStartTime}
                  onChange={(e) => setFormStartTime(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Heure fin
                </label>
                <GlassInput
                  type="time"
                  value={formEndTime}
                  onChange={(e) => setFormEndTime(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <GlassButton variant="outline" onClick={() => setShowAddModal(false)}>
                Annuler
              </GlassButton>
              <GlassButton onClick={handleAddAbsence} disabled={isSaving}>
                {isSaving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  "Enregistrer"
                )}
              </GlassButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Justify Modal */}
      <Dialog open={showJustifyModal} onOpenChange={setShowJustifyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Justifier l'absence
            </DialogTitle>
          </DialogHeader>
          {selectedAbsence && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/30">
                <p className="font-medium">
                  {selectedAbsence.student?.first_name} {selectedAbsence.student?.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(selectedAbsence.absence_date).toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Justification *
                </label>
                <Textarea
                  placeholder="Motif de l'absence..."
                  value={formJustification}
                  onChange={(e) => setFormJustification(e.target.value)}
                  rows={4}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <GlassButton variant="outline" onClick={() => setShowJustifyModal(false)}>
                  Annuler
                </GlassButton>
                <GlassButton onClick={handleJustify} disabled={isSaving}>
                  {isSaving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Valider
                    </>
                  )}
                </GlassButton>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default Absences;
