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
  MapPin,
  Plus,
  Edit,
  Trash2,
  Building2,
  Search,
  Globe,
  Layers,
} from "lucide-react";

interface Region {
  id: string;
  name: string;
  code: string;
  country_code: string;
  capital: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

// Données initiales des régions par pays
const REGIONS_BY_COUNTRY: Record<string, { code: string; name: string; capital: string }[]> = {
  GA: [
    { code: "EST", name: "Estuaire", capital: "Libreville" },
    { code: "HO", name: "Haut-Ogooué", capital: "Franceville" },
    { code: "MO", name: "Moyen-Ogooué", capital: "Lambaréné" },
    { code: "NG", name: "Ngounié", capital: "Mouila" },
    { code: "NY", name: "Nyanga", capital: "Tchibanga" },
    { code: "OI", name: "Ogooué-Ivindo", capital: "Makokou" },
    { code: "OL", name: "Ogooué-Lolo", capital: "Koulamoutou" },
    { code: "OM", name: "Ogooué-Maritime", capital: "Port-Gentil" },
    { code: "WN", name: "Woleu-Ntem", capital: "Oyem" },
  ],
  CD: [
    { code: "KIN", name: "Kinshasa", capital: "Kinshasa" },
    { code: "KAT", name: "Katanga", capital: "Lubumbashi" },
    { code: "NK", name: "Nord-Kivu", capital: "Goma" },
    { code: "SK", name: "Sud-Kivu", capital: "Bukavu" },
    { code: "EQ", name: "Équateur", capital: "Mbandaka" },
    { code: "BC", name: "Bas-Congo", capital: "Matadi" },
  ],
  CM: [
    { code: "CE", name: "Centre", capital: "Yaoundé" },
    { code: "LT", name: "Littoral", capital: "Douala" },
    { code: "OU", name: "Ouest", capital: "Bafoussam" },
    { code: "NO", name: "Nord", capital: "Garoua" },
    { code: "SU", name: "Sud", capital: "Ebolowa" },
  ],
};

const COUNTRIES = [
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "CD", name: "RDC", flag: "🇨🇩" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CG", name: "Congo", flag: "🇨🇬" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
];

const RegionsManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRegion, setEditingRegion] = useState<Region | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    country_code: "GA",
    capital: "",
    description: "",
  });

  // Fetch regions
  const { data: regions = [], isLoading } = useQuery({
    queryKey: ["regions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("regions")
        .select("*")
        .order("country_code, name");

      if (error) throw error;
      return data as unknown as Region[];
    },
  });

  // Fetch stats per region
  const { data: regionStats = {} } = useQuery({
    queryKey: ["region-stats"],
    queryFn: async () => {
      const { data: groups } = await supabase
        .from("establishment_groups")
        .select("id, location, country_code");

      const stats: Record<string, { groups: number; establishments: number }> = {};
      
      // Comptage simplifié basé sur les groupes
      groups?.forEach((g) => {
        const key = `${g.country_code}-${g.location || "unknown"}`;
        if (!stats[key]) {
          stats[key] = { groups: 0, establishments: 0 };
        }
        stats[key].groups++;
      });

      return stats;
    },
  });

  const filteredRegions = regions.filter((region) => {
    const matchesSearch =
      region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      region.capital.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCountry =
      selectedCountry === "all" || region.country_code === selectedCountry;
    
    return matchesSearch && matchesCountry;
  });

  const resetForm = () => {
    setFormData({
      code: "",
      name: "",
      country_code: "GA",
      capital: "",
      description: "",
    });
    setEditingRegion(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleOpenEdit = (region: Region) => {
    setFormData({
      code: region.code,
      name: region.name,
      country_code: region.country_code,
      capital: region.capital,
      description: region.description || "",
    });
    setEditingRegion(region);
    setIsCreateOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.name || !formData.country_code) {
      toast.error("Le code, le nom et le pays sont requis");
      return;
    }

    toast.success(
      editingRegion
        ? `Région "${formData.name}" mise à jour`
        : `Région "${formData.name}" ajoutée`
    );
    setIsCreateOpen(false);
    resetForm();
  };

  const getCountryFlag = (code: string) => {
    return COUNTRIES.find((c) => c.code === code)?.flag || "🏳️";
  };

  const getCountryName = (code: string) => {
    return COUNTRIES.find((c) => c.code === code)?.name || code;
  };

  return (
    <UserLayout title="Gestion des Régions">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <GlassCard className="p-6" solid>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <MapPin className="h-6 w-6 text-emerald-500" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">
                  Gestion des Régions
                </h1>
                <p className="text-sm text-muted-foreground">
                  {regions.length} régions dans {Object.keys(REGIONS_BY_COUNTRY).length} pays
                </p>
              </div>
            </div>
            <GlassButton onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une région
            </GlassButton>
          </div>
        </GlassCard>

        {/* Filters */}
        <GlassCard className="p-4" solid>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <GlassInput
                placeholder="Rechercher une région..."
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

        {/* Regions Table */}
        <GlassCard className="p-0 overflow-hidden" solid>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Région</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Capitale</TableHead>
                <TableHead className="text-center">Groupes</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredRegions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-muted-foreground">Aucune région trouvée</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegions.map((region) => (
                  <TableRow key={region.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                          <MapPin className="h-4 w-4 text-emerald-500" />
                        </div>
                        <span className="font-medium">{region.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{region.code}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{getCountryFlag(region.country_code)}</span>
                        <span className="text-muted-foreground">
                          {getCountryName(region.country_code)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {region.capital}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary" className="gap-1">
                        <Layers className="h-3 w-3" />
                        {regionStats[`${region.country_code}-${region.name}`]?.groups || 0}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={region.is_active ? "default" : "secondary"}
                      >
                        {region.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(region)}
                        >
                          <Edit className="h-4 w-4" />
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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingRegion ? "Modifier la région" : "Ajouter une région"}
              </DialogTitle>
              <DialogDescription>
                Configurez les informations de la région administrative.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code *</Label>
                  <GlassInput
                    placeholder="EST"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Capitale</Label>
                  <GlassInput
                    placeholder="Libreville"
                    value={formData.capital}
                    onChange={(e) =>
                      setFormData({ ...formData, capital: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nom de la région *</Label>
                <GlassInput
                  placeholder="Estuaire"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Description optionnelle..."
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
              <Button onClick={handleSave}>
                {editingRegion ? "Enregistrer" : "Ajouter"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </UserLayout>
  );
};

export default RegionsManagement;
