import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassButton } from "@/components/ui/glass-button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CreateEstablishmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  groupId?: string | null;
}

interface EstablishmentGroup {
  id: string;
  name: string;
}

export const CreateEstablishmentModal = ({
  open,
  onOpenChange,
  onSuccess,
  groupId,
}: CreateEstablishmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<EstablishmentGroup[]>([]);
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "college" as string,
    address: "",
    phone: "",
    email: "",
    country_code: "GA",
    levels: "",
    student_capacity: 500,
    group_id: groupId || null as string | null,
  });

  const fetchGroups = async () => {
    const { data } = await supabase
      .from("establishment_groups")
      .select("id, name")
      .order("name");
    setGroups(data || []);
  };

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      fetchGroups();
      setForm({
        name: "",
        code: "",
        type: "college",
        address: "",
        phone: "",
        email: "",
        country_code: "GA",
        levels: "",
        student_capacity: 500,
        group_id: groupId || null,
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
      const { error } = await supabase.from("establishments").insert({
        name: form.name,
        code: form.code || null,
        type: form.type,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        country_code: form.country_code,
        levels: form.levels || null,
        student_capacity: form.student_capacity,
        group_id: form.group_id,
      });

      if (error) throw error;

      toast.success("Établissement créé avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating establishment:", error);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nouvel établissement</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label>Nom de l'établissement *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Lycée Excellence"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Code</Label>
              <Input
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                placeholder="Ex: LYC-EXC"
              />
            </div>
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="primaire">Primaire</SelectItem>
                  <SelectItem value="college">Collège</SelectItem>
                  <SelectItem value="lycee">Lycée</SelectItem>
                  <SelectItem value="superieur">Supérieur</SelectItem>
                  <SelectItem value="technique">Technique</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Groupe scolaire</Label>
            <Select
              value={form.group_id || "none"}
              onValueChange={(v) => setForm({ ...form, group_id: v === "none" ? null : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Aucun groupe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun groupe (indépendant)</SelectItem>
                {groups.map((g) => (
                  <SelectItem key={g.id} value={g.id}>
                    {g.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
            <div className="space-y-2">
              <Label>Capacité élèves</Label>
              <Input
                type="number"
                value={form.student_capacity}
                onChange={(e) => setForm({ ...form, student_capacity: parseInt(e.target.value) || 500 })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Niveaux</Label>
            <Input
              value={form.levels}
              onChange={(e) => setForm({ ...form, levels: e.target.value })}
              placeholder="Ex: 6ème → 3ème ou CP → CM2"
            />
          </div>

          <div className="space-y-2">
            <Label>Adresse</Label>
            <Textarea
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Adresse complète..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+241..."
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="contact@..."
              />
            </div>
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
