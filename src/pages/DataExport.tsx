import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  FileSpreadsheet,
  FileText,
  Database,
  Users,
  GraduationCap,
  Calendar,
  CreditCard,
  MessageSquare,
  BookOpen,
  Clock,
} from "lucide-react";

interface ExportConfig {
  table: string;
  label: string;
  icon: React.ElementType;
  description: string;
  fields: { key: string; label: string; selected: boolean }[];
}

const exportConfigs: ExportConfig[] = [
  {
    table: "profiles",
    label: "Utilisateurs",
    icon: Users,
    description: "Profils des utilisateurs (élèves, enseignants, parents)",
    fields: [
      { key: "id", label: "ID", selected: true },
      { key: "email", label: "Email", selected: true },
      { key: "first_name", label: "Prénom", selected: true },
      { key: "last_name", label: "Nom", selected: true },
      { key: "phone", label: "Téléphone", selected: false },
      { key: "created_at", label: "Date de création", selected: true },
    ],
  },
  {
    table: "grades",
    label: "Notes",
    icon: GraduationCap,
    description: "Notes des élèves par matière et trimestre",
    fields: [
      { key: "id", label: "ID", selected: false },
      { key: "student_id", label: "ID Élève", selected: true },
      { key: "subject", label: "Matière", selected: true },
      { key: "grade", label: "Note", selected: true },
      { key: "coefficient", label: "Coefficient", selected: true },
      { key: "trimester", label: "Trimestre", selected: true },
      { key: "grade_type", label: "Type", selected: true },
      { key: "school_year", label: "Année scolaire", selected: true },
      { key: "created_at", label: "Date", selected: true },
    ],
  },
  {
    table: "absences",
    label: "Absences",
    icon: Clock,
    description: "Registre des absences et retards",
    fields: [
      { key: "id", label: "ID", selected: false },
      { key: "student_id", label: "ID Élève", selected: true },
      { key: "absence_date", label: "Date", selected: true },
      { key: "absence_type", label: "Type", selected: true },
      { key: "is_justified", label: "Justifié", selected: true },
      { key: "justification", label: "Justification", selected: true },
      { key: "start_time", label: "Heure début", selected: false },
      { key: "end_time", label: "Heure fin", selected: false },
    ],
  },
  {
    table: "school_fees",
    label: "Frais scolaires",
    icon: CreditCard,
    description: "Frais de scolarité et paiements",
    fields: [
      { key: "id", label: "ID", selected: false },
      { key: "student_id", label: "ID Élève", selected: true },
      { key: "title", label: "Titre", selected: true },
      { key: "amount", label: "Montant", selected: true },
      { key: "status", label: "Statut", selected: true },
      { key: "due_date", label: "Échéance", selected: true },
      { key: "fee_type", label: "Type", selected: true },
      { key: "school_year", label: "Année scolaire", selected: true },
    ],
  },
  {
    table: "payments",
    label: "Paiements",
    icon: CreditCard,
    description: "Historique des paiements effectués",
    fields: [
      { key: "id", label: "ID", selected: false },
      { key: "student_id", label: "ID Élève", selected: true },
      { key: "amount", label: "Montant", selected: true },
      { key: "payment_method", label: "Méthode", selected: true },
      { key: "paid_at", label: "Date de paiement", selected: true },
      { key: "transaction_reference", label: "Référence", selected: true },
    ],
  },
  {
    table: "school_events",
    label: "Événements",
    icon: Calendar,
    description: "Calendrier des événements scolaires",
    fields: [
      { key: "id", label: "ID", selected: false },
      { key: "title", label: "Titre", selected: true },
      { key: "description", label: "Description", selected: true },
      { key: "start_date", label: "Date début", selected: true },
      { key: "end_date", label: "Date fin", selected: true },
      { key: "event_type", label: "Type", selected: true },
      { key: "location", label: "Lieu", selected: true },
    ],
  },
  {
    table: "assignments",
    label: "Devoirs",
    icon: BookOpen,
    description: "Devoirs et travaux assignés",
    fields: [
      { key: "id", label: "ID", selected: false },
      { key: "title", label: "Titre", selected: true },
      { key: "subject", label: "Matière", selected: true },
      { key: "class_name", label: "Classe", selected: true },
      { key: "due_date", label: "Date limite", selected: true },
      { key: "description", label: "Description", selected: true },
      { key: "max_points", label: "Points max", selected: true },
    ],
  },
  {
    table: "messages",
    label: "Messages",
    icon: MessageSquare,
    description: "Communications entre utilisateurs",
    fields: [
      { key: "id", label: "ID", selected: false },
      { key: "sender_id", label: "Expéditeur", selected: true },
      { key: "recipient_id", label: "Destinataire", selected: true },
      { key: "subject", label: "Sujet", selected: true },
      { key: "is_read", label: "Lu", selected: true },
      { key: "created_at", label: "Date", selected: true },
    ],
  },
];

const DataExport = () => {
  const { user, roles } = useAuth();
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<"csv" | "json">("csv");
  const [isExporting, setIsExporting] = useState(false);
  const [configs, setConfigs] = useState(exportConfigs);

  const isAdmin = roles.includes("super_admin") || roles.includes("school_admin");

  const toggleExport = (table: string) => {
    setSelectedExports((prev) =>
      prev.includes(table)
        ? prev.filter((t) => t !== table)
        : [...prev, table]
    );
  };

  const toggleField = (table: string, fieldKey: string) => {
    setConfigs((prev) =>
      prev.map((config) =>
        config.table === table
          ? {
              ...config,
              fields: config.fields.map((f) =>
                f.key === fieldKey ? { ...f, selected: !f.selected } : f
              ),
            }
          : config
      )
    );
  };

  const convertToCSV = (data: Record<string, unknown>[], fields: string[]): string => {
    if (data.length === 0) return "";

    const headers = fields.join(",");
    const rows = data.map((row) =>
      fields
        .map((field) => {
          const value = row[field];
          if (value === null || value === undefined) return "";
          const stringValue = String(value);
          if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    );

    return [headers, ...rows].join("\n");
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleExport = async () => {
    if (selectedExports.length === 0) {
      toast.error("Veuillez sélectionner au moins une table à exporter");
      return;
    }

    setIsExporting(true);
    try {
      for (const tableName of selectedExports) {
        const config = configs.find((c) => c.table === tableName);
        if (!config) continue;

        const selectedFields = config.fields
          .filter((f) => f.selected)
          .map((f) => f.key);

        if (selectedFields.length === 0) {
          toast.error(`Aucun champ sélectionné pour ${config.label}`);
          continue;
        }

        const { data, error } = await supabase
          .from(tableName as "profiles" | "grades" | "absences" | "school_fees" | "payments" | "school_events" | "assignments" | "messages")
          .select(selectedFields.join(","))
          .limit(10000);

        if (error) {
          console.error(`Error exporting ${tableName}:`, error);
          toast.error(`Erreur lors de l'export de ${config.label}`);
          continue;
        }

        if (!data || data.length === 0) {
          toast.info(`Aucune donnée à exporter pour ${config.label}`);
          continue;
        }

        const exportData = data as unknown as Record<string, unknown>[];
        const timestamp = new Date().toISOString().split("T")[0];

        if (exportFormat === "csv") {
          const csv = convertToCSV(exportData, selectedFields);
          downloadFile(csv, `${tableName}_${timestamp}.csv`, "text/csv;charset=utf-8;");
        } else {
          const json = JSON.stringify(exportData, null, 2);
          downloadFile(json, `${tableName}_${timestamp}.json`, "application/json");
        }

        toast.success(`${config.label} exporté avec succès`);
      }
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Erreur lors de l'export");
    } finally {
      setIsExporting(false);
    }
  };

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <GlassCard className="p-8 text-center">
            <p>Accès réservé aux administrateurs.</p>
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
            <h1 className="text-3xl font-bold">Export des données</h1>
            <p className="text-muted-foreground mt-1">
              Exportez les données de l'établissement en CSV ou JSON
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <Label className="text-sm text-muted-foreground">Format</Label>
              <Select
                value={exportFormat}
                onValueChange={(v) => setExportFormat(v as "csv" | "json")}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      CSV
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      JSON
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <GlassButton
              onClick={handleExport}
              disabled={isExporting || selectedExports.length === 0}
            >
              {isExporting ? (
                "Export en cours..."
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter ({selectedExports.length})
                </>
              )}
            </GlassButton>
          </div>
        </div>

        {/* Export Options */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {configs.map((config) => {
            const Icon = config.icon;
            const isSelected = selectedExports.includes(config.table);

            return (
              <GlassCard
                key={config.table}
                className={`p-6 cursor-pointer transition-all ${
                  isSelected ? "ring-2 ring-primary" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                    onClick={() => toggleExport(config.table)}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div
                      className="flex items-center justify-between"
                      onClick={() => toggleExport(config.table)}
                    >
                      <div>
                        <h3 className="font-semibold">{config.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {config.description}
                        </p>
                      </div>
                      <Checkbox checked={isSelected} />
                    </div>

                    {isSelected && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <Label className="text-sm font-medium">
                          Champs à exporter
                        </Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {config.fields.map((field) => (
                            <Badge
                              key={field.key}
                              variant={field.selected ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => toggleField(config.table, field.key)}
                            >
                              {field.label}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Info */}
        <GlassCard className="mt-8 p-6">
          <div className="flex items-start gap-4">
            <Database className="h-6 w-6 text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold">Informations sur l'export</h3>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>• Les exports sont limités à 10 000 lignes par table</li>
                <li>• Le format CSV est compatible avec Excel et Google Sheets</li>
                <li>• Le format JSON est idéal pour l'intégration avec d'autres systèmes</li>
                <li>• Les données sensibles (mots de passe) ne sont jamais exportées</li>
              </ul>
            </div>
          </div>
        </GlassCard>
      </main>

      <Footer />
    </div>
  );
};

export default DataExport;
