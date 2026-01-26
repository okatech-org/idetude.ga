import { useState, useEffect } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { FileText, Trash2, Edit2, Clock, AlertCircle } from "lucide-react";
import { EstablishmentDraft, EstablishmentFormData } from "./types";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DraftsListProps {
  onResume: (draft: EstablishmentDraft) => void;
  onDelete: (draftId: string) => void;
}

const STEP_LABELS: Record<string, string> = {
  informations: "Informations",
  niveaux: "Niveaux",
  administration: "Administration",
  classes: "Classes",
};

export const DraftsList = ({ onResume, onDelete }: DraftsListProps) => {
  const [drafts, setDrafts] = useState<EstablishmentDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const fetchDrafts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("establishment_drafts")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "draft")
        .order("updated_at", { ascending: false });

      if (error) throw error;
      
      // Transform data to match our types
      const transformedDrafts: EstablishmentDraft[] = (data || []).map(d => ({
        ...d,
        data: d.data as unknown as EstablishmentFormData,
        status: d.status as 'draft' | 'completed',
      }));
      
      setDrafts(transformedDrafts);
    } catch (error) {
      console.error("Error fetching drafts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("establishment_drafts")
        .delete()
        .eq("id", id);

      if (error) throw error;
      
      setDrafts(drafts.filter(d => d.id !== id));
      onDelete(id);
      toast.success("Brouillon supprimé");
    } catch (error) {
      console.error("Error deleting draft:", error);
      toast.error("Erreur lors de la suppression");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <GlassCard className="p-6" solid>
        <div className="flex items-center gap-3 text-muted-foreground">
          <Clock className="h-5 w-5 animate-pulse" />
          <span>Chargement des brouillons...</span>
        </div>
      </GlassCard>
    );
  }

  if (drafts.length === 0) {
    return null;
  }

  return (
    <>
      <GlassCard className="p-4" solid>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Brouillons en cours</h3>
          <Badge variant="secondary">{drafts.length}</Badge>
        </div>

        <div className="space-y-2">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">
                    {draft.name || "Établissement sans nom"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>Étape : {STEP_LABELS[draft.last_step] || draft.last_step}</span>
                    <span>•</span>
                    <span>
                      Modifié {format(new Date(draft.updated_at), "PPP 'à' HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="outline"
                  size="sm"
                  onClick={() => onResume(draft)}
                >
                  <Edit2 className="h-4 w-4" />
                  Reprendre
                </GlassButton>
                <GlassButton
                  variant="ghost"
                  size="sm"
                  onClick={() => setDeleteId(draft.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </GlassButton>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Supprimer ce brouillon ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le brouillon sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
