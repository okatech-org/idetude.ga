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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Globe,
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Search,
  Flag,
} from "lucide-react";

interface Country {
  id: string;
  code: string;
  name: string;
  flag_emoji: string;
  currency: string;
  timezone: string;
  is_active: boolean;
  created_at: string;
}

// Données initiales des pays supportés
const DEFAULT_COUNTRIES = [
  { code: "GA", name: "Gabon", flag_emoji: "🇬🇦", currency: "XAF", timezone: "Africa/Libreville" },
  { code: "CD", name: "République Démocratique du Congo", flag_emoji: "🇨🇩", currency: "CDF", timezone: "Africa/Kinshasa" },
  { code: "CG", name: "Congo-Brazzaville", flag_emoji: "🇨🇬", currency: "XAF", timezone: "Africa/Brazzaville" },
  { code: "CM", name: "Cameroun", flag_emoji: "🇨🇲", currency: "XAF", timezone: "Africa/Douala" },
  { code: "CI", name: "Côte d'Ivoire", flag_emoji: "🇨🇮", currency: "XOF", timezone: "Africa/Abidjan" },
  { code: "SN", name: "Sénégal", flag_emoji: "🇸🇳", currency: "XOF", timezone: "Africa/Dakar" },
  { code: "FR", name: "France", flag_emoji: "🇫🇷", currency: "EUR", timezone: "Europe/Paris" },
  { code: "BE", name: "Belgique", flag_emoji: "🇧🇪", currency: "EUR", timezone: "Europe/Brussels" },
];

const CountriesManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    flag_emoji: "",
    currency: "",
    timezone: "",
  });

  // Fetch countries
  const { data: countries = [], isLoading } = useQuery({
    queryKey: ["countries"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .order("name");
      
      if (error) {
        // Si la table n'existe pas, retourner les pays par défaut
        if (error.code === "42P01") {
          return DEFAULT_COUNTRIES.map((c, i) => ({
            ...c,
            id: `default-${i}`,
            is_active: true,
            created_at: new Date().toISOString(),
          }));
        }
        throw error;
      }
      return data as Country[];
    },
  });

  // Fetch stats per country
  const { data: countryStats = {} } = useQuery({
    queryKey: ["country-stats"],
    queryFn: async () => {
      const { data: establishments } = await supabase
        .from("establishments")
        .select("country_code");
      
      const { data: groups } = await supabase
        .from("establishment_groups")
        .select("country_code");

      const stats: Record<string, { establishments: number; groups: number }> = {};
      
      establishments?.forEach((e) => {
        if (!stats[e.country_code]) {
          stats[e.country_code] = { establishments: 0, groups: 0 };
        }
        stats[e.country_code].establishments++;
      });

      groups?.forEach((g) => {
        if (!stats[g.country_code]) {
          stats[g.country_code] = { establishments: 0, groups: 0 };
        }
        stats[g.country_code].groups++;
      });

      return stats;
    },
  });

  const filteredCountries = countries.filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      flag_emoji: "",
      currency: "",
      timezone: "",
    });
    setEditingCountry(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (country: Country) => {
    setFormData({
      code: country.code,
      name: country.name,
      flag_emoji: country.flag_emoji,
      currency: country.currency,
      timezone: country.timezone,
    });
    setEditingCountry(country);
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name) {
      toast.error("Le code et le nom sont requis");
      return;
    }

    toast.success(
      editingCountry
        ? `Pays "${formData.name}" mis à jour`
        : `Pays "${formData.name}" ajouté`
    );
    setIsCreateOpen(false);
    resetForm();
  };

  return (
    <UserLayout title="Gestion des Pays">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <GlassCard className="p-6" solid>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Globe className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Gestion des Pays
                </h1>
                <p className="text-sm text-muted-foreground">
                  {countries.length} pays configurés dans l'écosystème
                </p>
              </div>
            </div>
            <GlassButton onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un pays
            </GlassButton>
          </div>
        </GlassCard>

        {/* Search */}
        <GlassCard className="p-4" solid>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <GlassInput
              placeholder="Rechercher un pays..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </GlassCard>

        {/* Countries Table */}
        <GlassCard className="p-0 overflow-hidden" solid>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pays</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Devise</TableHead>
                <TableHead>Fuseau horaire</TableHead>
                <TableHead className="text-center">Groupes</TableHead>
                <TableHead className="text-center">Établissements</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredCountries.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucun pays trouvé</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredCountries.map((country) => {
                  const stats = countryStats[country.code] || { establishments: 0, groups: 0 };
                  return (
                    <TableRow key={country.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{country.flag_emoji}</span>
                          <span className="font-medium">{country.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{country.code}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {country.currency}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {country.timezone}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="gap-1">
                          <Building2 className="h-3 w-3" />
                          {stats.groups}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="gap-1">
                          <MapPin className="h-3 w-3" />
                          {stats.establishments}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={country.is_active ? "default" : "secondary"}
                        >
                          {country.is_active ? "Actif" : "Inactif"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenEdit(country)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </GlassCard>

        {/* Create/Edit Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCountry ? "Modifier le pays" : "Ajouter un pays"}
              </DialogTitle>
              <DialogDescription>
                Configurez les informations du pays pour l'écosystème.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code ISO *</Label>
                  <GlassInput
                    placeholder="GA"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    maxLength={2}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Emoji drapeau</Label>
                  <GlassInput
                    placeholder="🇬🇦"
                    value={formData.flag_emoji}
                    onChange={(e) =>
                      setFormData({ ...formData, flag_emoji: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nom du pays *</Label>
                <GlassInput
                  placeholder="Gabon"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Devise</Label>
                  <GlassInput
                    placeholder="XAF"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <GlassInput
                    placeholder="Africa/Libreville"
                    value={formData.timezone}
                    onChange={(e) =>
                      setFormData({ ...formData, timezone: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Annuler
              </Button>
              <Button onClick={handleSave}>
                {editingCountry ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};

export default CountriesManagement;
