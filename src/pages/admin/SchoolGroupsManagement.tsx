import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  Building2,
  Search,
  Globe,
  MapPin,
  ExternalLink,
  Eye,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SchoolGroup {
  id: string;
  name: string;
  code: string | null;
  country_code: string;
  location: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

const COUNTRIES = [
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "CD", name: "RDC", flag: "🇨🇩" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CG", name: "Congo", flag: "🇨🇬" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
];

const SchoolGroupsManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SchoolGroup | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    country_code: "GA",
    location: "",
    description: "",
  });

  // Fetch school groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["school-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishment_groups")
        .select("*")
        .order("country_code, name");

      if (error) throw error;
      return data as SchoolGroup[];
    },
  });

  // Fetch establishment counts per group
  const { data: groupStats = {} } = useQuery({
    queryKey: ["group-establishment-stats"],
    queryFn: async () => {
      const { data } = await supabase
        .from("establishments")
        .select("group_id");

      const stats: Record<string, number> = {};
      data?.forEach((e) => {
        if (e.group_id) {
          stats[e.group_id] = (stats[e.group_id] || 0) + 1;
        }
      });
      return stats;
    },
  });

  // Create group mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from("establishment_groups").insert({
        name: data.name,
        code: data.code || null,
        country_code: data.country_code,
        location: data.location || null,
        description: data.description || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-groups"] });
      toast.success("Groupe scolaire créé avec succès");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erreur lors de la création: " + error.message);
    },
  });

  // Update group mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const { error } = await supabase
        .from("establishment_groups")
        .update({
          name: data.name,
          code: data.code || null,
          country_code: data.country_code,
          location: data.location || null,
          description: data.description || null,
        })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-groups"] });
      toast.success("Groupe scolaire mis à jour");
      setIsCreateOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error("Erreur lors de la mise à jour: " + error.message);
    },
  });

  // Delete group mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("establishment_groups")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-groups"] });
      toast.success("Groupe scolaire supprimé");
    },
    onError: (error) => {
      toast.error("Erreur lors de la suppression: " + error.message);
    },
  });

  const filteredGroups = (groups || []).filter((group) => {
    const matchesSearch =
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.code?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
      (group.location?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);

    const matchesCountry =
      selectedCountry === "all" || group.country_code === selectedCountry;

    return matchesSearch && matchesCountry;
  });

  const resetForm = () => {
    setFormData({
      name: "",
      code: "",
      country_code: "GA",
      location: "",
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
      country_code: group.country_code,
      location: group.location || "",
      description: group.description || "",
    });
    setEditingGroup(group);
    setIsCreateOpen(true);
  };

  const handleSave = () => {
    if (!formData.name || !formData.country_code) {
      toast.error("Le nom et le pays sont requis");
      return;
    }

    if (editingGroup) {
      updateMutation.mutate({ id: editingGroup.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (group: SchoolGroup) => {
    const count = groupStats[group.id] || 0;
    if (count > 0) {
      toast.error(
        `Impossible de supprimer ce groupe : ${count} établissement(s) y sont rattachés`
      );
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${group.name}" ?`)) {
      deleteMutation.mutate(group.id);
    }
  };

  const getCountryFlag = (code: string) => {
    return COUNTRIES.find((c) => c.code === code)?.flag || "🏳️";
  };

  const getCountryName = (code: string) => {
    return COUNTRIES.find((c) => c.code === code)?.name || code;
  };

  return (
    <UserLayout title="Groupes Scolaires">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <GlassCard className="p-6" solid>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Layers className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Groupes Scolaires
                </h1>
                <p className="text-sm text-muted-foreground">
                  {(groups || []).length} groupes répartis dans {
                    new Set((groups || []).map((g) => g.country_code)).size
                  } pays
                </p>
              </div>
            </div>
            <GlassButton onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un groupe
            </GlassButton>
          </div>
        </GlassCard>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COUNTRIES.slice(0, 3).map((country) => {
            const countryGroups = (groups || []).filter(
              (g) => g.country_code === country.code
            );
            const totalEstablishments = countryGroups.reduce(
              (acc, g) => acc + (groupStats[g.id] || 0),
              0
            );
            return (
              <GlassCard key={country.code} className="p-4" solid>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{country.flag}</span>
                    <div>
                      <p className="font-medium text-foreground">{country.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {countryGroups.length} groupes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">
                      {totalEstablishments}
                    </p>
                    <p className="text-xs text-muted-foreground">établissements</p>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>

        {/* Filters */}
        <GlassCard className="p-4" solid>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <GlassInput
                placeholder="Rechercher un groupe scolaire..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtrer par pays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les pays</SelectItem>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.code}>
                    {country.flag} {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </GlassCard>

        {/* Groups Table */}
        <GlassCard className="p-0 overflow-hidden" solid>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Groupe Scolaire</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Région/Ville</TableHead>
                <TableHead className="text-center">Établissements</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucun groupe trouvé</p>
                    <Button
                      variant="link"
                      onClick={handleOpenCreate}
                      className="mt-2"
                    >
                      Créer le premier groupe
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => (
                  <TableRow key={group.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <Layers className="h-5 w-5 text-purple-500" />
                        </div>
                        <div>
                          <p className="font-medium">{group.name}</p>
                          {group.description && (
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {group.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {group.code ? (
                        <Badge variant="outline">{group.code}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getCountryFlag(group.country_code)}</span>
                        <span className="text-muted-foreground">
                          {getCountryName(group.country_code)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {group.location ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {group.location}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1">
                        <Building2 className="h-3 w-3" />
                        {groupStats[group.id] || 0}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/admin/groups/config?id=${group.id}`)}
                          className="gap-1"
                        >
                          <Settings className="h-3.5 w-3.5" />
                          Gestion
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(group)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(group)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </GlassCard>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>
                {editingGroup ? "Modifier le groupe" : "Créer un groupe scolaire"}
              </DialogTitle>
              <DialogDescription>
                Un groupe scolaire regroupe plusieurs établissements sous une même
                entité administrative.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nom du groupe *</Label>
                <GlassInput
                  placeholder="Groupe Scolaire La Réussite"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pays *</Label>
                  <Select
                    value={formData.country_code}
                    onValueChange={(v) =>
                      setFormData({ ...formData, country_code: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.flag} {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Code (optionnel)</Label>
                  <GlassInput
                    placeholder="GSR-LBV"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Région / Ville</Label>
                <GlassInput
                  placeholder="Libreville, Estuaire"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Description du groupe scolaire..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending
                  ? "Enregistrement..."
                  : editingGroup
                    ? "Enregistrer"
                    : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};

export default SchoolGroupsManagement;
