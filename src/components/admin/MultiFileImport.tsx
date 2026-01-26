import { useState, useRef, useCallback } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  FileText,
  Image,
  X,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export interface ImportedFile {
  file: File;
  id: string;
  type: "csv" | "image" | "pdf" | "text" | "unknown";
  preview?: string;
  status: "pending" | "analyzing" | "done" | "error";
}

export interface AnalysisResult {
  success: boolean;
  data: any;
  suggestions?: string[];
  error?: string;
}

interface MultiFileImportProps {
  context: string; // e.g., "subjects", "students", "classes", "establishments"
  establishmentId?: string;
  onAnalysisComplete: (result: AnalysisResult) => void;
  acceptedTypes?: string[];
  maxFiles?: number;
  className?: string;
}

const FILE_ICONS = {
  csv: FileSpreadsheet,
  pdf: FileText,
  image: Image,
  text: FileText,
  unknown: FileText,
};

const getFileType = (file: File): ImportedFile["type"] => {
  const ext = file.name.split(".").pop()?.toLowerCase();
  const mimeType = file.type.toLowerCase();

  if (ext === "csv" || mimeType === "text/csv") return "csv";
  if (ext === "pdf" || mimeType === "application/pdf") return "pdf";
  if (mimeType.startsWith("image/")) return "image";
  if (mimeType.startsWith("text/") || ext === "txt" || ext === "json") return "text";
  return "unknown";
};

export const MultiFileImport = ({
  context,
  establishmentId,
  onAnalysisComplete,
  acceptedTypes = [".csv", ".pdf", ".png", ".jpg", ".jpeg", ".txt", ".json"],
  maxFiles = 5,
  className = "",
}: MultiFileImportProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<ImportedFile[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles) return;

      const newFiles: ImportedFile[] = [];
      const remaining = maxFiles - files.length;

      for (let i = 0; i < Math.min(selectedFiles.length, remaining); i++) {
        const file = selectedFiles[i];
        const type = getFileType(file);

        const importedFile: ImportedFile = {
          file,
          id: `${Date.now()}-${i}`,
          type,
          status: "pending",
        };

        // Generate preview for images
        if (type === "image") {
          const reader = new FileReader();
          reader.onload = (e) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === importedFile.id
                  ? { ...f, preview: e.target?.result as string }
                  : f
              )
            );
          };
          reader.readAsDataURL(file);
        }

        newFiles.push(importedFile);
      }

      setFiles((prev) => [...prev, ...newFiles]);
    },
    [files.length, maxFiles]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const analyzeFiles = async () => {
    if (files.length === 0) {
      toast.error("Veuillez ajouter au moins un fichier");
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    // Update all files to analyzing status
    setFiles((prev) => prev.map((f) => ({ ...f, status: "analyzing" })));

    try {
      // Prepare file contents for analysis
      const fileContents: { name: string; type: string; content: string }[] = [];

      for (let i = 0; i < files.length; i++) {
        const importedFile = files[i];
        setProgress(Math.round(((i + 1) / (files.length + 1)) * 50));

        if (importedFile.type === "csv" || importedFile.type === "text") {
          const text = await importedFile.file.text();
          fileContents.push({
            name: importedFile.file.name,
            type: importedFile.type,
            content: text.slice(0, 10000), // Limit content size
          });
        } else if (importedFile.type === "image" && importedFile.preview) {
          fileContents.push({
            name: importedFile.file.name,
            type: "image",
            content: importedFile.preview,
          });
        } else if (importedFile.type === "pdf") {
          // For PDF, we'll send the filename and let the AI know it's a PDF
          fileContents.push({
            name: importedFile.file.name,
            type: "pdf",
            content: `[PDF file: ${importedFile.file.name}]`,
          });
        }
      }

      setProgress(60);

      // Call edge function for AI analysis
      const { data, error } = await supabase.functions.invoke("analyze-import", {
        body: {
          context,
          establishmentId,
          files: fileContents,
        },
      });

      setProgress(100);

      if (error) throw error;

      // Update file statuses
      setFiles((prev) => prev.map((f) => ({ ...f, status: "done" })));

      toast.success("Analyse terminée avec succès");
      onAnalysisComplete({
        success: true,
        data: data.result,
        suggestions: data.suggestions,
      });
    } catch (error: any) {
      console.error("Error analyzing files:", error);
      setFiles((prev) => prev.map((f) => ({ ...f, status: "error" })));
      toast.error("Erreur lors de l'analyse");
      onAnalysisComplete({
        success: false,
        data: null,
        error: error.message,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearAll = () => {
    setFiles([]);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-xl p-6 text-center transition-all cursor-pointer
          ${dragOver 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-primary/50"
          }
        `}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(",")}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="font-medium text-foreground">
              Glissez-déposez vos fichiers ici
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              ou cliquez pour sélectionner (CSV, PDF, images...)
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1 mt-2">
            {acceptedTypes.slice(0, 5).map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <GlassCard className="p-4" solid>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-foreground">
              {files.length} fichier(s) sélectionné(s)
            </p>
            <GlassButton variant="ghost" size="sm" onClick={clearAll}>
              <X className="h-4 w-4" />
              Tout effacer
            </GlassButton>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {files.map((importedFile) => {
              const Icon = FILE_ICONS[importedFile.type];
              return (
                <div
                  key={importedFile.id}
                  className="flex items-center gap-3 p-2 rounded-lg bg-muted/50"
                >
                  {importedFile.type === "image" && importedFile.preview ? (
                    <img
                      src={importedFile.preview}
                      alt={importedFile.file.name}
                      className="w-10 h-10 rounded object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {importedFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(importedFile.file.size / 1024).toFixed(1)} Ko
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {importedFile.status === "analyzing" && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {importedFile.status === "done" && (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    )}
                    {importedFile.status === "error" && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(importedFile.id);
                      }}
                      disabled={isAnalyzing}
                    >
                      <X className="h-4 w-4" />
                    </GlassButton>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress */}
          {isAnalyzing && (
            <div className="mt-4 space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                Analyse IA en cours... {progress}%
              </p>
            </div>
          )}

          {/* Analyze Button */}
          <GlassButton
            variant="primary"
            className="w-full mt-4"
            onClick={analyzeFiles}
            disabled={isAnalyzing || files.length === 0}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyser avec l'IA
              </>
            )}
          </GlassButton>
        </GlassCard>
      )}
    </div>
  );
};
