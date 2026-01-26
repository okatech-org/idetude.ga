import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  Upload, 
  User, 
  GraduationCap, 
  X, 
  Check, 
  AlertCircle,
  ArrowRight,
  FileSpreadsheet,
  Download
} from "lucide-react";

interface Class {
  id: string;
  establishment_id: string;
  name: string;
  code: string | null;
  level: string;
  section: string | null;
  school_year: string;
  capacity: number | null;
  room: string | null;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface ClassStudent {
  id: string;
  class_id: string;
  student_id: string;
  school_year: string;
  status: string | null;
  enrollment_date: string | null;
  profiles?: {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface StudentEnrollmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  classes: Class[];
  selectedClass: Class | null;
  currentStudents: ClassStudent[];
  onSuccess: () => void;
  establishmentId: string;
}

interface ImportResult {
  total: number;
  success: number;
  failed: number;
  errors: string[];
}

export const StudentEnrollmentModal = ({
  isOpen,
  onClose,
  classes,
  selectedClass,
  currentStudents,
  onSuccess,
  establishmentId,
}: StudentEnrollmentModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [importProgress, setImportProgress] = useState(0);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
      setImportResult(null);
    }
  }, [isOpen]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .order("last_name");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleEnrollStudent = async () => {
    if (!selectedClass || !selectedStudentId) {
      toast.error("Veuillez sélectionner un élève");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("class_students").insert({
        class_id: selectedClass.id,
        student_id: selectedStudentId,
        school_year: selectedClass.school_year,
        status: "active",
        enrollment_date: new Date().toISOString().split("T")[0],
      });

      if (error) throw error;

      toast.success("Élève inscrit à la classe");
      setSelectedStudentId("");
      onSuccess();
    } catch (error: any) {
      console.error("Error enrolling student:", error);
      if (error.code === "23505") {
        toast.error("Cet élève est déjà inscrit dans cette classe");
      } else {
        toast.error("Erreur lors de l'inscription");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveStudent = async (enrollmentId: string) => {
    if (!confirm("Retirer cet élève de la classe ?")) return;

    try {
      const { error } = await supabase
        .from("class_students")
        .delete()
        .eq("id", enrollmentId);

      if (error) throw error;

      toast.success("Élève retiré de la classe");
      onSuccess();
    } catch (error) {
      console.error("Error removing student:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleTransferStudent = async (enrollmentId: string) => {
    if (!targetClassId) {
      toast.error("Veuillez sélectionner une classe de destination");
      return;
    }

    const enrollment = currentStudents.find(s => s.id === enrollmentId);
    if (!enrollment) return;

    setLoading(true);
    try {
      // Remove from current class
      await supabase.from("class_students").delete().eq("id", enrollmentId);

      // Add to new class
      const targetClass = classes.find(c => c.id === targetClassId);
      const { error } = await supabase.from("class_students").insert({
        class_id: targetClassId,
        student_id: enrollment.student_id,
        school_year: targetClass?.school_year || selectedClass?.school_year,
        status: "active",
        enrollment_date: new Date().toISOString().split("T")[0],
      });

      if (error) throw error;

      toast.success("Élève transféré avec succès");
      setTargetClassId("");
      onSuccess();
    } catch (error) {
      console.error("Error transferring student:", error);
      toast.error("Erreur lors du transfert");
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = ["email", "first_name", "last_name"];
    const exampleData = [
      ["eleve1@ecole.com", "Jean", "Dupont"],
      ["eleve2@ecole.com", "Marie", "Martin"],
    ];

    const csvContent = [
      headers.join(","),
      ...exampleData.map(row => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_eleves.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedClass) return;

    setIsImporting(true);
    setImportProgress(0);
    setImportResult(null);

    const result: ImportResult = {
      total: 0,
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      const text = await file.text();
      const lines = text.split("\n").filter(line => line.trim());
      const headers = lines[0].split(",").map(h => h.trim().toLowerCase());

      const emailIndex = headers.indexOf("email");
      const firstNameIndex = headers.indexOf("first_name");
      const lastNameIndex = headers.indexOf("last_name");

      if (emailIndex === -1) {
        toast.error("Colonne 'email' manquante dans le fichier CSV");
        setIsImporting(false);
        return;
      }

      const dataLines = lines.slice(1);
      result.total = dataLines.length;

      for (let i = 0; i < dataLines.length; i++) {
        const values = dataLines[i].split(",").map(v => v.trim());
        const email = values[emailIndex];
        const firstName = firstNameIndex !== -1 ? values[firstNameIndex] : "";
        const lastName = lastNameIndex !== -1 ? values[lastNameIndex] : "";

        if (!email) {
          result.failed++;
          result.errors.push(`Ligne ${i + 2}: Email manquant`);
          continue;
        }

        try {
          // Check if profile exists
          let { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("email", email)
            .maybeSingle();

          if (!profile) {
            // Profile doesn't exist, skip or create minimal profile
            result.failed++;
            result.errors.push(`Ligne ${i + 2}: Utilisateur ${email} non trouvé`);
            continue;
          }

          // Check if already enrolled
          const { data: existing } = await supabase
            .from("class_students")
            .select("id")
            .eq("class_id", selectedClass.id)
            .eq("student_id", profile.id)
            .maybeSingle();

          if (existing) {
            result.failed++;
            result.errors.push(`Ligne ${i + 2}: ${email} déjà inscrit`);
            continue;
          }

          // Enroll student
          const { error } = await supabase.from("class_students").insert({
            class_id: selectedClass.id,
            student_id: profile.id,
            school_year: selectedClass.school_year,
            status: "active",
            enrollment_date: new Date().toISOString().split("T")[0],
          });

          if (error) throw error;

          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push(`Ligne ${i + 2}: ${error.message || "Erreur inconnue"}`);
        }

        setImportProgress(Math.round(((i + 1) / dataLines.length) * 100));
      }

      setImportResult(result);

      if (result.success > 0) {
        toast.success(`${result.success} élève(s) inscrit(s) avec succès`);
        onSuccess();
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} erreur(s) lors de l'import`);
      }
    } catch (error) {
      console.error("Error importing CSV:", error);
      toast.error("Erreur lors de la lecture du fichier");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Filter out already enrolled students
  const enrolledStudentIds = new Set(currentStudents.map(s => s.student_id));
  const availableProfiles = profiles.filter(p => !enrolledStudentIds.has(p.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Gestion des élèves : {selectedClass?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="students" className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="students">Élèves inscrits</TabsTrigger>
            <TabsTrigger value="enroll">Inscrire</TabsTrigger>
            <TabsTrigger value="import">Import CSV</TabsTrigger>
          </TabsList>

          {/* Current Students */}
          <TabsContent value="students" className="space-y-4">
            {currentStudents.length === 0 ? (
              <GlassCard className="p-6 text-center" solid>
                <User className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">Aucun élève inscrit</p>
              </GlassCard>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentStudents.map(student => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {student.profiles?.first_name} {student.profiles?.last_name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {student.profiles?.email}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {student.status || "actif"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Transfer dropdown */}
                      <Select 
                        value={targetClassId} 
                        onValueChange={setTargetClassId}
                      >
                        <SelectTrigger className="w-[140px] h-8 text-xs">
                          <SelectValue placeholder="Transférer..." />
                        </SelectTrigger>
                        <SelectContent>
                          {classes
                            .filter(c => c.id !== selectedClass?.id)
                            .map(c => (
                              <SelectItem key={c.id} value={c.id}>
                                {c.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      
                      {targetClassId && (
                        <GlassButton
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTransferStudent(student.id)}
                          disabled={loading}
                        >
                          <ArrowRight className="h-4 w-4" />
                        </GlassButton>
                      )}

                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveStudent(student.id)}
                      >
                        <X className="h-4 w-4 text-destructive" />
                      </GlassButton>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <p className="text-sm text-muted-foreground text-center">
              {currentStudents.length} / {selectedClass?.capacity || "∞"} élèves
            </p>
          </TabsContent>

          {/* Manual Enrollment */}
          <TabsContent value="enroll" className="space-y-4">
            <div className="space-y-2">
              <Label>Sélectionner un élève</Label>
              <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un élève..." />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Tous les utilisateurs sont déjà inscrits
                    </div>
                  ) : (
                    availableProfiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          {profile.first_name} {profile.last_name}
                          <span className="text-muted-foreground">({profile.email})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <GlassButton
              variant="primary"
              onClick={handleEnrollStudent}
              disabled={loading || !selectedStudentId}
              className="w-full"
            >
              {loading ? "Inscription..." : "Inscrire l'élève"}
            </GlassButton>
          </TabsContent>

          {/* CSV Import */}
          <TabsContent value="import" className="space-y-4">
            <GlassCard className="p-4" solid>
              <div className="flex items-start gap-3">
                <FileSpreadsheet className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="font-medium">Import par fichier CSV</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Importez plusieurs élèves en une fois à partir d'un fichier CSV.
                    Le fichier doit contenir au minimum une colonne "email".
                  </p>
                  <GlassButton
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={downloadTemplate}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger le modèle
                  </GlassButton>
                </div>
              </div>
            </GlassCard>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <GlassButton
              variant="primary"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isImporting ? "Import en cours..." : "Sélectionner un fichier CSV"}
            </GlassButton>

            {isImporting && (
              <div className="space-y-2">
                <Progress value={importProgress} className="h-2" />
                <p className="text-sm text-center text-muted-foreground">
                  {importProgress}% traité
                </p>
              </div>
            )}

            {importResult && (
              <GlassCard className="p-4 space-y-3" solid>
                <h4 className="font-medium">Résultat de l'import</h4>
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{importResult.success} réussis</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-destructive" />
                    <span>{importResult.failed} échoués</span>
                  </div>
                </div>

                {importResult.errors.length > 0 && (
                  <div className="max-h-32 overflow-y-auto text-xs space-y-1">
                    {importResult.errors.map((err, i) => (
                      <p key={i} className="text-destructive">
                        {err}
                      </p>
                    ))}
                  </div>
                )}
              </GlassCard>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <GlassButton variant="outline" onClick={onClose}>
            Fermer
          </GlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
