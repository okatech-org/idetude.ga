import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Save,
  ArrowLeft,
  Settings,
} from "lucide-react";

interface SchoolGroup {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  country_code: string;
  description: string | null;
}

interface Country {
  code: string;
  name: string;
  flag_emoji: string;
}

const SchoolGroupsConfig = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedId = searchParams.get("id");
  const queryClient = useQueryClient();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SchoolGroup | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    location: "",
    country_code: "GA",
    description: "",
  });

  // Fetch groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["school-groups-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishment_groups")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as SchoolGroup[];
    },
  });

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ["countries-for-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("code, name, flag_emoji")
        .order("name");
      if (error) throw error;
      return data as Country[];
    },
  });

  // Fetch establishment count per group
  const { data: groupStats = {} } = useQuery({
    queryKey: ["group-stats-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishments")
        .select("group_id");
      if (error) throw error;
      
      const stats: Record<string, number> = {};
      data?.forEach((e) => {
        if (e.group_id) {
          stats[e.group_id] = (stats[e.group_id] || 0) + 1;
        }
      });
      return stats;
    },
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase
        .from("establishment_groups")
        .insert({
          name: data.name,
          code: data.code || null,
          location: data.location || null,
          country_code: data.country_code,
          description: data.description || null,
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-groups-config"] });
      toast.success("Groupe créé avec succès");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("establishment_groups")
        .update({
          name: data.name,
          code: data.code || null,
          location: data.location || null,
          country_code: data.country_code,
          description: data.description || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-groups-config"] });
      toast.success("Groupe mis à jour");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("establishment_groups")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-groups-config"] });
      toast.success("Groupe supprimé");
      setDeleteConfirmId(null);
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      location: "",
      country_code: "GA",
      description: "",
    });
    setEditingGroup(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (group: SchoolGroup) => {
    setFormData({
      name: group.name,
      code: group.code || "",
      location: group.location || "",
      country_code: group.country_code,
      description: group.description || "",
    });
    setEditingGroup(group);
    setIsCreateOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast.error("Le nom est requis");
      return;
    }

    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: string) => {
    const estCount = groupStats[id] || 0;
    if (estCount > 0) {
      toast.error("Impossible de supprimer un groupe avec des établissements");
      return;
    }
    setDeleteConfirmId(id);
  };

  const getCountryInfo = (code: string) => {
    return countries.find(c => c.code === code);
  };

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/groups")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Settings className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Configuration des Groupes</h1>
              <p className="text-sm text-muted-foreground">
                Créer, modifier et supprimer des groupes scolaires
              </p>
            </div>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau groupe
          </Button>
        </div>

        {/* Groups List */}
        <div className="grid gap-4">
          {isLoading ? (
            <Card>
              <CardContent className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </CardContent>
            </Card>
          ) : groups.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="font-semibold mb-2">Aucun groupe scolaire</h3>
                <p className="text-muted-foreground mb-4">
                  Créez votre premier groupe scolaire pour commencer
                </p>
                <Button onClick={handleOpenCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un groupe
                </Button>
              </CardContent>
            </Card>
          ) : (
            groups.map((group) => {
              const country = getCountryInfo(group.country_code);
              const estCount = groupStats[group.id] || 0;
              
              return (
                <Card key={group.id} className={selectedId === group.id ? "ring-2 ring-primary" : ""}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                          <Layers className="h-6 w-6 text-blue-500" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{group.name}</h3>
                          <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                            {group.code && (
                              <Badge variant="outline">{group.code}</Badge>
                            )}
                            {group.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {group.location}
                              </span>
                            )}
                            {country && (
                              <span>{country.flag_emoji} {country.name}</span>
                            )}
                          </div>
                          {group.description && (
                            <p className="text-sm text-muted-foreground mt-2">
                              {group.description}
                            </p>
                          )}
                          <div className="mt-3">
                            <Badge variant={estCount > 0 ? "default" : "secondary"}>
                              <Building2 className="h-3 w-3 mr-1" />
                              {estCount} établissement(s)
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon" onClick={() => handleOpenEdit(group)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          onClick={() => handleDelete(group.id)}
                          disabled={estCount > 0}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Modifier le groupe" : "Nouveau groupe scolaire"}
              </DialogTitle>
              <DialogDescription>
                Configurez les informations du groupe scolaire
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du groupe *</Label>
                <Input
                  placeholder="Groupe Scolaire Excellence"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code</Label>
                  <Input
                    placeholder="GSE"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Pays *</Label>
                  <Select 
                    value={formData.country_code} 
                    onValueChange={(v) => setFormData({ ...formData, country_code: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag_emoji} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Localisation</Label>
                <Input
                  placeholder="Libreville, Akanda"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Description du groupe scolaire..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={createMutation.isPending || updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {editingGroup ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogDescription>
                Êtes-vous sûr de vouloir supprimer ce groupe scolaire ?
                Cette action est irréversible.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirmId(null)}>
                Annuler
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deleteConfirmId && deleteMutation.mutate(deleteConfirmId)}
                disabled={deleteMutation.isPending}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};

export default SchoolGroupsConfig;
