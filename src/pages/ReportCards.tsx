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
  FileText,
  Download,
  Eye,
  Plus,
  Award,
  TrendingUp,
  Users,
  Calendar,
} from "lucide-react";

interface ReportCard {
  id: string;
  student_id: string;
  trimester: number;
  school_year: string;
  general_average: number | null;
  class_average: number | null;
  rank: number | null;
  teacher_comment: string | null;
  principal_comment: string | null;
  generated_at: string;
  student?: {
    first_name: string;
    last_name: string;
  };
}

interface Grade {
  subject: string;
  grade: number;
  coefficient: number;
}

export default function ReportCards() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTrimester, setSelectedTrimester] = useState("1");
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [selectedReportCard, setSelectedReportCard] = useState<ReportCard | null>(null);
  const [studentGrades, setStudentGrades] = useState<Grade[]>([]);
  
  const [generateData, setGenerateData] = useState({
    student_id: "",
    teacher_comment: "",
    principal_comment: "",
  });

  const currentYear = new Date().getFullYear();
  const schoolYear = `${currentYear}-${currentYear + 1}`;

  const isStaff = roles.some(r => 
    ["super_admin", "school_director", "school_admin", "teacher", "main_teacher"].includes(r)
  );

  // Fetch report cards
  const { data: reportCards = [], isLoading } = useQuery({
    queryKey: ["report-cards", user?.id, selectedTrimester],
    queryFn: async () => {
      let query = supabase
        .from("report_cards")
        .select("*")
        .eq("trimester", parseInt(selectedTrimester))
        .eq("school_year", schoolYear)
        .order("generated_at", { ascending: false });

      if (!isStaff) {
        query = query.eq("student_id", user!.id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ReportCard[];
    },
    enabled: !!user,
  });

  // Fetch students for generation (staff only)
  const { data: students = [] } = useQuery({
    queryKey: ["students-for-report"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name")
        .order("last_name");
      
      if (error) throw error;
      return data;
    },
    enabled: isStaff,
  });

  // Fetch grades for a specific student
  const fetchStudentGrades = async (studentId: string) => {
    const { data, error } = await supabase
      .from("grades")
      .select("subject, grade, coefficient")
      .eq("student_id", studentId)
      .eq("trimester", parseInt(selectedTrimester))
      .eq("school_year", schoolYear);

    if (error) throw error;
    setStudentGrades(data || []);
    return data || [];
  };

  // Generate report card
  const generateMutation = useMutation({
    mutationFn: async () => {
      const grades = await fetchStudentGrades(generateData.student_id);
      
      // Calculate weighted average
      let totalWeighted = 0;
      let totalCoeff = 0;
      grades.forEach(g => {
        totalWeighted += Number(g.grade) * Number(g.coefficient);
        totalCoeff += Number(g.coefficient);
      });
      const generalAverage = totalCoeff > 0 ? Math.round((totalWeighted / totalCoeff) * 100) / 100 : null;

      const { error } = await supabase.from("report_cards").upsert({
        student_id: generateData.student_id,
        trimester: parseInt(selectedTrimester),
        school_year: schoolYear,
        general_average: generalAverage,
        teacher_comment: generateData.teacher_comment || null,
        principal_comment: generateData.principal_comment || null,
        generated_by: user!.id,
        generated_at: new Date().toISOString(),
      }, {
        onConflict: "student_id,trimester,school_year",
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["report-cards"] });
      toast.success("Bulletin généré avec succès");
      setIsGenerateOpen(false);
      setGenerateData({ student_id: "", teacher_comment: "", principal_comment: "" });
    },
    onError: () => toast.error("Erreur lors de la génération du bulletin"),
  });

  // Generate PDF
  const generatePDF = (reportCard: ReportCard) => {
    const student = students.find(s => s.id === reportCard.student_id);
    const studentName = student ? `${student.first_name} ${student.last_name}` : "Élève";

    // Create PDF content using HTML
    const pdfContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bulletin Scolaire - ${studentName}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #1a365d; }
          .header p { margin: 5px 0; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-box { background: #f8f9fa; padding: 15px; border-radius: 8px; }
          .info-box label { font-size: 12px; color: #666; display: block; }
          .info-box span { font-size: 18px; font-weight: bold; }
          .grades-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .grades-table th, .grades-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          .grades-table th { background: #1a365d; color: white; }
          .grades-table tr:nth-child(even) { background: #f8f9fa; }
          .average { font-size: 24px; font-weight: bold; color: #1a365d; }
          .comments { margin-top: 30px; }
          .comment-box { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
          .comment-box h3 { margin: 0 0 10px 0; color: #333; font-size: 14px; }
          .footer { margin-top: 40px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>BULLETIN SCOLAIRE</h1>
          <p>Année scolaire ${reportCard.school_year} - Trimestre ${reportCard.trimester}</p>
        </div>
        
        <div class="info-grid">
          <div class="info-box">
            <label>Élève</label>
            <span>${studentName}</span>
          </div>
          <div class="info-box">
            <label>Moyenne Générale</label>
            <span class="average">${reportCard.general_average?.toFixed(2) || "N/A"}/20</span>
          </div>
          ${reportCard.class_average ? `
          <div class="info-box">
            <label>Moyenne de la classe</label>
            <span>${reportCard.class_average.toFixed(2)}/20</span>
          </div>
          ` : ""}
          ${reportCard.rank ? `
          <div class="info-box">
            <label>Rang</label>
            <span>${reportCard.rank}${reportCard.rank === 1 ? "er" : "ème"}</span>
          </div>
          ` : ""}
        </div>

        <div class="comments">
          ${reportCard.teacher_comment ? `
          <div class="comment-box">
            <h3>Appréciation du professeur principal</h3>
            <p>${reportCard.teacher_comment}</p>
          </div>
          ` : ""}
          ${reportCard.principal_comment ? `
          <div class="comment-box">
            <h3>Appréciation du chef d'établissement</h3>
            <p>${reportCard.principal_comment}</p>
          </div>
          ` : ""}
        </div>

        <div class="footer">
          <p>Document généré le ${new Date(reportCard.generated_at).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}</p>
          <p>Ce bulletin est un document officiel de l'établissement.</p>
        </div>
      </body>
      </html>
    `;

    // Open in new window and trigger print
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(pdfContent);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 250);
    } else {
      toast.error("Veuillez autoriser les popups pour télécharger le PDF");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <PageHeader
          title="Bulletins Scolaires"
          subtitle="Générez et consultez les bulletins de notes"
        />

        {/* Actions */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6">
          <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Trimestre 1</SelectItem>
              <SelectItem value="2">Trimestre 2</SelectItem>
              <SelectItem value="3">Trimestre 3</SelectItem>
            </SelectContent>
          </Select>

          {isStaff && (
            <Button onClick={() => setIsGenerateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Générer un bulletin
            </Button>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{reportCards.length}</p>
                <p className="text-xs text-muted-foreground">Bulletins générés</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reportCards.length > 0
                    ? (reportCards.reduce((sum, r) => sum + (r.general_average || 0), 0) / reportCards.length).toFixed(1)
                    : "—"}
                </p>
                <p className="text-xs text-muted-foreground">Moyenne globale</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Award className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {reportCards.filter(r => (r.general_average || 0) >= 14).length}
                </p>
                <p className="text-xs text-muted-foreground">Mentions TB</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">T{selectedTrimester}</p>
                <p className="text-xs text-muted-foreground">{schoolYear}</p>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Report Cards List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        ) : reportCards.length === 0 ? (
          <GlassCard className="p-12 text-center" solid>
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Aucun bulletin disponible</h3>
            <p className="text-muted-foreground mb-4">
              {isStaff
                ? "Générez un bulletin en cliquant sur le bouton ci-dessus"
                : "Les bulletins seront disponibles une fois générés par l'administration"}
            </p>
          </GlassCard>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reportCards.map((card) => {
              const student = students.find(s => s.id === card.student_id);
              return (
                <GlassCard key={card.id} className="p-6" solid>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold">
                        {student ? `${student.first_name} ${student.last_name}` : "Élève"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Trimestre {card.trimester} - {card.school_year}
                      </p>
                    </div>
                    <Badge variant={
                      (card.general_average || 0) >= 14 ? "secondary" :
                      (card.general_average || 0) >= 10 ? "default" : "destructive"
                    }>
                      {card.general_average?.toFixed(1) || "N/A"}/20
                    </Badge>
                  </div>

                  <div className="space-y-2 mb-4">
                    {card.rank && (
                      <div className="flex items-center gap-2 text-sm">
                        <Award className="h-4 w-4 text-amber-500" />
                        <span>Rang: {card.rank}{card.rank === 1 ? "er" : "ème"}</span>
                      </div>
                    )}
                    {card.class_average && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>Moyenne classe: {card.class_average.toFixed(1)}/20</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => setSelectedReportCard(card)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => generatePDF(card)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}

        {/* Generate Modal */}
        <Dialog open={isGenerateOpen} onOpenChange={setIsGenerateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Générer un bulletin</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Élève</Label>
                <Select
                  value={generateData.student_id}
                  onValueChange={(v) => {
                    setGenerateData({ ...generateData, student_id: v });
                    fetchStudentGrades(v);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un élève" />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.first_name} {s.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {studentGrades.length > 0 && (
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-medium mb-2">Notes du trimestre {selectedTrimester}:</p>
                  <div className="space-y-1 text-sm">
                    {studentGrades.map((g, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span>{g.subject}</span>
                        <span className="font-medium">{g.grade}/20 (coef. {g.coefficient})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Appréciation du professeur principal</Label>
                <Textarea
                  placeholder="Commentaire sur le travail et le comportement..."
                  value={generateData.teacher_comment}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, teacher_comment: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Appréciation du chef d'établissement</Label>
                <Textarea
                  placeholder="Commentaire général..."
                  value={generateData.principal_comment}
                  onChange={(e) =>
                    setGenerateData({ ...generateData, principal_comment: e.target.value })
                  }
                  rows={3}
                />
              </div>

              <Button
                className="w-full"
                onClick={() => generateMutation.mutate()}
                disabled={!generateData.student_id || generateMutation.isPending}
              >
                {generateMutation.isPending ? "Génération..." : "Générer le bulletin"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={!!selectedReportCard} onOpenChange={() => setSelectedReportCard(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Détails du bulletin</DialogTitle>
            </DialogHeader>
            {selectedReportCard && (
              <div className="space-y-4 py-4">
                <div className="text-center p-6 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Moyenne Générale</p>
                  <p className="text-4xl font-bold text-primary">
                    {selectedReportCard.general_average?.toFixed(2) || "N/A"}/20
                  </p>
                  {selectedReportCard.rank && (
                    <Badge variant="secondary" className="mt-2">
                      Rang: {selectedReportCard.rank}{selectedReportCard.rank === 1 ? "er" : "ème"}
                    </Badge>
                  )}
                </div>

                {selectedReportCard.teacher_comment && (
                  <div>
                    <Label className="text-muted-foreground">Professeur principal</Label>
                    <p className="mt-1 p-3 bg-muted/30 rounded-lg">
                      {selectedReportCard.teacher_comment}
                    </p>
                  </div>
                )}

                {selectedReportCard.principal_comment && (
                  <div>
                    <Label className="text-muted-foreground">Chef d'établissement</Label>
                    <p className="mt-1 p-3 bg-muted/30 rounded-lg">
                      {selectedReportCard.principal_comment}
                    </p>
                  </div>
                )}

                <div className="text-sm text-muted-foreground text-center">
                  Généré le {new Date(selectedReportCard.generated_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </div>

                <Button className="w-full" onClick={() => generatePDF(selectedReportCard)}>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger en PDF
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </main>
      <Footer />
    </div>
  );
}
