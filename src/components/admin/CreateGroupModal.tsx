import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassButton } from "@/components/ui/glass-button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateGroupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const CreateGroupModal = ({ open, onOpenChange, onSuccess }: CreateGroupModalProps) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    code: "",
    location: "",
    country_code: "GA",
    description: "",
  });

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setForm({
        name: "",
        code: "",
        location: "",
        country_code: "GA",
        description: "",
      });
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouveau groupe scolaire</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
            />
          </div>
        </div>

        <DialogFooter>
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
