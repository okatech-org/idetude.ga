import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ImportUsersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

interface ParsedUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: "pending" | "success" | "error";
  error?: string;
}

const roleMap: Record<string, string> = {
  "super_admin": "Super Administrateur",
  "regional_admin": "Administrateur Régional",
  "school_director": "Directeur",
  "school_admin": "Administrateur Scolaire",
  "cpe": "CPE",
  "main_teacher": "Professeur Principal",
  "teacher": "Enseignant",
  "student": "Élève",
  "parent_primary": "Parent Principal",
  "parent_secondary": "Parent Secondaire",
};

export const ImportUsersModal = ({ open, onOpenChange, onSuccess }: ImportUsersModalProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [parsedUsers, setParsedUsers] = useState<ParsedUser[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split("\n").filter((line) => line.trim());
    const users: ParsedUser[] = [];

    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      if (values.length >= 5) {
        users.push({
          email: values[0],
          password: values[1],
          firstName: values[2],
          lastName: values[3],
          role: values[4],
          status: "pending",
        });
      }
    }

    setParsedUsers(users);
  };

  const handleImport = async () => {
    if (parsedUsers.length === 0) return;

    setIsImporting(true);
    setProgress(0);

    const updatedUsers = [...parsedUsers];

    for (let i = 0; i < updatedUsers.length; i++) {
      const user = updatedUsers[i];
      
      try {
        const displayRole = roleMap[user.role] || user.role;
        
        await supabase.functions.invoke("init-demo-accounts", {
          body: {
            action: "init",
            email: user.email,
            password: user.password,
            name: `${user.firstName} ${user.lastName}`,
            displayRole,
          },
        });

        updatedUsers[i] = { ...user, status: "success" };
      } catch (error) {
        updatedUsers[i] = { 
          ...user, 
          status: "error", 
          error: error instanceof Error ? error.message : "Erreur inconnue" 
        };
      }

      setParsedUsers([...updatedUsers]);
      setProgress(Math.round(((i + 1) / updatedUsers.length) * 100));
    }

    setIsImporting(false);
    
    const successCount = updatedUsers.filter((u) => u.status === "success").length;
    const errorCount = updatedUsers.filter((u) => u.status === "error").length;
    
    if (errorCount === 0) {
      toast.success(`${successCount} utilisateur(s) importé(s) avec succès`);
      onSuccess();
      onOpenChange(false);
      setParsedUsers([]);
    } else {
      toast.warning(`${successCount} réussis, ${errorCount} erreurs`);
    }
  };

  const downloadTemplate = () => {
    const template = `email,password,firstName,lastName,role
enseignant@exemple.com,MotDePasse123,Jean,DUPONT,teacher
eleve@exemple.com,MotDePasse123,Marie,MARTIN,student
parent@exemple.com,MotDePasse123,Pierre,DURAND,parent_primary`;
    
    const blob = new Blob([template], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_import_utilisateurs.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Importer des utilisateurs
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Template Download */}
          <GlassCard className="p-4" solid>
            <p className="text-sm text-muted-foreground mb-2">
              Format CSV attendu : email, mot de passe, prénom, nom, rôle
            </p>
            <GlassButton variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-4 w-4" />
              Télécharger le modèle
            </GlassButton>
          </GlassCard>

          {/* File Upload */}
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
            <Upload className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Cliquez ou glissez-déposez un fichier CSV
            </p>
          </div>

          {/* Preview */}
          {parsedUsers.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                {parsedUsers.length} utilisateur(s) à importer
              </p>
              
              {isImporting && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground text-center">
                    {progress}% terminé
                  </p>
                </div>
              )}

              <div className="max-h-48 overflow-y-auto space-y-2">
                {parsedUsers.map((user, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-sm"
                  >
                    <div>
                      <span className="font-medium">{user.firstName} {user.lastName}</span>
                      <span className="text-muted-foreground ml-2">({user.email})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{user.role}</span>
                      {user.status === "success" && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                      {user.status === "error" && (
                        <span title={user.error}>
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <GlassButton
              type="button"
              variant="ghost"
              onClick={() => {
                onOpenChange(false);
                setParsedUsers([]);
              }}
            >
              Annuler
            </GlassButton>
            <GlassButton
              variant="primary"
              disabled={parsedUsers.length === 0 || isImporting}
              onClick={handleImport}
            >
              {isImporting && <Loader2 className="h-4 w-4 animate-spin" />}
              Importer {parsedUsers.length} utilisateur(s)
            </GlassButton>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
