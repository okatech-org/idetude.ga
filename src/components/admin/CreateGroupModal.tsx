import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassButton } from "@/components/ui/glass-button";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Maximize2, Minimize2 } from "lucide-react";
import { useCreationMethodConfig, DisplayMode } from "@/hooks/useCreationMethodConfig";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateGroupModal = ({ open, onOpenChange, onSuccess }: CreateGroupModalProps) => {
  const [loading, setLoading] = useState(false);
  const [currentDisplayMode, setCurrentDisplayMode] = useState<DisplayMode>("modal");
  const { displayMode } = useCreationMethodConfig();
  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "",
    country_code: "GA",
    description: "",
  });

  const toggleDisplayMode = () => {
    setCurrentDisplayMode(prev => prev === "modal" ? "fullpage" : "modal");
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setForm({
        name: "",
        code: "",
        location: "",
        country_code: "GA",
        description: "",
      });
      setCurrentDisplayMode(displayMode);
    }
    onOpenChange(isOpen);
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Le nom est requis");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("establishment_groups").insert({
        name: form.name,
        code: form.code || null,
        location: form.location || null,
        country_code: form.country_code,
        description: form.description || null,
      });

      if (error) throw error;

      toast.success("Groupe scolaire créé avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className={cn(
        "transition-all duration-300",
        currentDisplayMode === "fullpage" 
          ? "max-w-[100vw] w-[100vw] h-[100vh] max-h-[100vh] rounded-none flex flex-col" 
          : "max-w-lg"
      )}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Nouveau groupe scolaire</DialogTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleDisplayMode}
                    className="h-8 w-8"
                  >
                    {currentDisplayMode === "fullpage" ? (
                      <Minimize2 className="h-4 w-4" />
                    ) : (
                      <Maximize2 className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {currentDisplayMode === "fullpage" ? "Réduire en bloc flottant" : "Étendre en pleine page"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </DialogHeader>

        <div className={cn(
          "space-y-4 py-4",
          currentDisplayMode === "fullpage" && "flex-1 max-w-2xl mx-auto w-full"
        )}>
          <div className="space-y-2">
            <Label>Nom du groupe *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Groupe Scolaire Excellence"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Ex: GSE"
              />
            </div>
            <div className="space-y-2">
              <Label>Pays</Label>
              <Select
                value={form.country_code}
                onValueChange={(v) => setForm({ ...form, country_code: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GA">🇬🇦 Gabon</SelectItem>
                  <SelectItem value="CD">🇨🇩 RDC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Localisation</Label>
            <Input
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Ex: Libreville, Kinshasa..."
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Description du groupe scolaire..."
              className={cn(currentDisplayMode === "fullpage" && "min-h-[150px]")}
            />
          </div>
        </div>

        <DialogFooter className={cn(currentDisplayMode === "fullpage" && "max-w-2xl mx-auto w-full")}>
          <GlassButton variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </GlassButton>
          <GlassButton variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer"}
          </GlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
