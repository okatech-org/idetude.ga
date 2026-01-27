import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { toast } from "sonner";
import {
  Globe,
  Plus,
  Edit,
  Building2,
  MapPin,
  Search,
  Map,
  List,
  Layers,
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

// Positions approximatives des pays sur une carte stylisée (coordonnées simplifiées pour l'affichage)
const COUNTRY_POSITIONS: Record<string, { x: number; y: number }> = {
  GA: { x: 48, y: 52 }, // Gabon
  CD: { x: 58, y: 55 }, // RDC
  CG: { x: 50, y: 54 }, // Congo
  CM: { x: 46, y: 45 }, // Cameroun
  CI: { x: 32, y: 48 }, // Côte d'Ivoire
  SN: { x: 22, y: 35 }, // Sénégal
  FR: { x: 45, y: 15 }, // France
  BE: { x: 48, y: 12 }, // Belgique
};

const CountriesManagement = () => {
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
      
      if (error) throw error;
      return data as unknown as Country[];
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

  // Countries with activity (establishments or groups)
  const activeCountries = countries.filter(
    (country) => countryStats[country.code]?.establishments > 0 || countryStats[country.code]?.groups > 0
  );

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
                  {activeCountries.length} pays actifs sur {countries.length} configurés
                </p>
              </div>
            </div>
            <GlassButton onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un pays
            </GlassButton>
          </div>
        </GlassCard>

        {/* Tabs: Carte / Liste */}
        <Tabs defaultValue="map" className="space-y-4">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="map" className="gap-2">
              <Map className="h-4 w-4" />
              Cartographie
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              Liste complète
            </TabsTrigger>
          </TabsList>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-4">
            {/* Map Visualization */}
            <GlassCard className="p-6" solid>
              <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-500" />
                Répartition géographique
              </h2>
              
              {/* Stylized Map */}
              <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-950/20 to-blue-900/10 rounded-2xl border border-border/50 overflow-hidden">
                {/* Grid lines for effect */}
                <div className="absolute inset-0 opacity-10">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={`h-${i}`}
                      className="absolute w-full border-t border-blue-500/30"
                      style={{ top: `${(i + 1) * 10}%` }}
                    />
                  ))}
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={`v-${i}`}
                      className="absolute h-full border-l border-blue-500/30"
                      style={{ left: `${(i + 1) * 10}%` }}
                    />
                  ))}
                </div>

                {/* Countries with activity */}
                {activeCountries.map((country) => {
                  const pos = COUNTRY_POSITIONS[country.code];
                  const stats = countryStats[country.code] || { establishments: 0, groups: 0 };
                  const total = stats.establishments + stats.groups;
                  const size = Math.min(80, 40 + total * 5);
                  
                  if (!pos) return null;

                  return (
                    <div
                      key={country.code}
                      className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    >
                      {/* Pulse effect */}
                      <div
                        className="absolute rounded-full bg-primary/20 animate-ping"
                        style={{ width: size, height: size, left: -size/2, top: -size/2 }}
                      />
                      
                      {/* Country marker */}
                      <div
                        className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-110"
                        style={{ width: size * 0.8, height: size * 0.8 }}
                      >
                        <span className="text-2xl">{country.flag_emoji}</span>
                      </div>

                      {/* Tooltip */}
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                        <div className="bg-popover border border-border rounded-lg p-3 shadow-xl min-w-[160px]">
                          <p className="font-semibold text-foreground text-sm">{country.name}</p>
                          <div className="mt-2 space-y-1 text-xs">
                            <div className="flex justify-between text-muted-foreground">
                              <span>Groupes</span>
                              <Badge variant="secondary" className="h-5">{stats.groups}</Badge>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>Établissements</span>
                              <Badge variant="secondary" className="h-5">{stats.establishments}</Badge>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Légende</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-3 h-3 rounded-full bg-primary" />
                    <span>Pays avec établissements</span>
                  </div>
                </div>

                {/* Stats */}
                <div className="absolute bottom-4 right-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-foreground">{activeCountries.length}</p>
                      <p className="text-xs text-muted-foreground">Pays actifs</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {Object.values(countryStats).reduce((acc, s) => acc + s.establishments, 0)}
                      </p>
                      <p className="text-xs text-muted-foreground">Établissements</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>

            {/* Active Countries Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeCountries.map((country) => {
                const stats = countryStats[country.code] || { establishments: 0, groups: 0 };
                return (
                  <GlassCard key={country.code} className="p-4" solid>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-3xl">{country.flag_emoji}</span>
                      <div>
                        <p className="font-semibold text-foreground">{country.name}</p>
                        <p className="text-xs text-muted-foreground">{country.currency} • {country.timezone}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <Layers className="h-4 w-4 mx-auto mb-1 text-purple-500" />
                        <p className="text-lg font-bold text-foreground">{stats.groups}</p>
                        <p className="text-xs text-muted-foreground">Groupes</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50 text-center">
                        <Building2 className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                        <p className="text-lg font-bold text-foreground">{stats.establishments}</p>
                        <p className="text-xs text-muted-foreground">Établissements</p>
                      </div>
                    </div>
                  </GlassCard>
                );
              })}
              
              {activeCountries.length === 0 && (
                <GlassCard className="p-8 col-span-full text-center" solid>
                  <Globe className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p className="text-muted-foreground">Aucun pays avec des établissements configurés</p>
                  <p className="text-sm text-muted-foreground mt-1">Créez des groupes ou établissements pour les voir ici</p>
                </GlassCard>
              )}
            </div>
          </TabsContent>

          {/* List Tab */}
          <TabsContent value="list" className="space-y-4">
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
                      const hasActivity = stats.establishments > 0 || stats.groups > 0;
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
                              <Layers className="h-3 w-3" />
                              {stats.groups}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="gap-1">
                              <Building2 className="h-3 w-3" />
                              {stats.establishments}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={hasActivity ? "default" : "secondary"}
                              className={hasActivity ? "bg-green-500/10 text-green-600 border-green-500/20" : ""}
                            >
                              {hasActivity ? "Actif" : "Inactif"}
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
          </TabsContent>
        </Tabs>

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