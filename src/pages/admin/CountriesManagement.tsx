import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
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
  Users,
  ChevronRight,
  ArrowLeft,
  Settings,
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

interface Region {
  id: string;
  name: string;
  code: string;
  country_code: string;
  capital: string | null;
  is_active: boolean;
}

interface EstablishmentGroup {
  id: string;
  name: string;
  code: string | null;
  country_code: string;
  location: string | null;
}

interface Establishment {
  id: string;
  name: string;
  code: string | null;
  type: string;
  country_code: string;
  group_id: string | null;
}

// Navigation state type
type ViewLevel = "countries" | "regions" | "institutions" | "details";

// Positions approximatives des pays sur une carte stylisée
const COUNTRY_POSITIONS: Record<string, { x: number; y: number }> = {
  GA: { x: 48, y: 52 },
  CD: { x: 58, y: 55 },
  CG: { x: 50, y: 54 },
  CM: { x: 46, y: 45 },
  CI: { x: 32, y: 48 },
  SN: { x: 22, y: 35 },
  FR: { x: 45, y: 15 },
  BE: { x: 48, y: 12 },
};

const CountriesManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);

  // Hierarchical navigation state
  const [viewLevel, setViewLevel] = useState<ViewLevel>("countries");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null);
  const [regionFilter, setRegionFilter] = useState<string>("all");

  const [formData, setFormData] = useState({
    code: "",
    name: "",
    flag_emoji: "",
    currency: "",
    timezone: "",
  });

  // Fetch countries
  const { data: countries = [], isLoading: loadingCountries } = useQuery({
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

  // Fetch regions
  const { data: regions = [] } = useQuery({
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

  // Fetch establishment groups
  const { data: groups = [] } = useQuery({
    queryKey: ["establishment-groups"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishment_groups")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as EstablishmentGroup[];
    },
  });

  // Fetch establishments
  const { data: establishments = [] } = useQuery({
    queryKey: ["establishments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Establishment[];
    },
  });

  // Compute stats per country
  const countryStats = useMemo(() => {
    const stats: Record<string, { establishments: number; groups: number; regions: number }> = {};

    (regions || []).forEach((r) => {
      if (!stats[r.country_code]) {
        stats[r.country_code] = { establishments: 0, groups: 0, regions: 0 };
      }
      stats[r.country_code].regions++;
    });

    (groups || []).forEach((g) => {
      if (!stats[g.country_code]) {
        stats[g.country_code] = { establishments: 0, groups: 0, regions: 0 };
      }
      stats[g.country_code].groups++;
    });

    (establishments || []).forEach((e) => {
      if (!stats[e.country_code]) {
        stats[e.country_code] = { establishments: 0, groups: 0, regions: 0 };
      }
      stats[e.country_code].establishments++;
    });

    return stats;
  }, [regions, groups, establishments]);

  // Compute region stats
  const regionStats = useMemo(() => {
    const stats: Record<string, { groups: number; establishments: number }> = {};

    (groups || []).forEach((g) => {
      const regionName = g.location || "Non assigné";
      const key = `${g.country_code}-${regionName}`;
      if (!stats[key]) {
        stats[key] = { groups: 0, establishments: 0 };
      }
      stats[key].groups++;
    });

    return stats;
  }, [groups]);

  // Countries with activity
  const activeCountries = (countries || []).filter(
    (country) => (countryStats[country.code]?.establishments || 0) > 0 ||
      (countryStats[country.code]?.groups || 0) > 0
  );

  // Filter regions by selected country
  const countryRegions = useMemo(() => {
    if (!selectedCountry) return [];
    return (regions || []).filter((r) => r.country_code === selectedCountry.code);
  }, [regions, selectedCountry]);

  // Filter institutions by country and optionally by region
  const filteredInstitutions = useMemo(() => {
    if (!selectedCountry) return { groups: [], establishments: [] };

    let filteredGroups = (groups || []).filter((g) => g.country_code === selectedCountry.code);
    let filteredEstablishments = (establishments || []).filter((e) => e.country_code === selectedCountry.code);

    if (regionFilter !== "all" && selectedRegion) {
      filteredGroups = filteredGroups.filter((g) => g.location === selectedRegion.name);
    }

    return { groups: filteredGroups, establishments: filteredEstablishments };
  }, [groups, establishments, selectedCountry, selectedRegion, regionFilter]);

  const filteredCountries = (countries || []).filter(
    (country) =>
      country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      country.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigation handlers
  const handleSelectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedRegion(null);
    setRegionFilter("all");
    setViewLevel("regions");
  };

  const handleSelectRegion = (region: Region) => {
    setSelectedRegion(region);
    setRegionFilter(region.name);
    setViewLevel("institutions");
  };

  const handleBack = () => {
    if (viewLevel === "institutions") {
      setSelectedRegion(null);
      setRegionFilter("all");
      setViewLevel("regions");
    } else if (viewLevel === "regions") {
      setSelectedCountry(null);
      setViewLevel("countries");
    }
  };

  const handleManageGroup = (groupId: string) => {
    navigate(`/admin/groups/config?id=${groupId}`);
  };

  const handleManageEstablishment = (establishmentId: string) => {
    navigate(`/admin/establishments/config?id=${establishmentId}`);
  };

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

  // Render breadcrumb
  const renderBreadcrumb = () => (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            onClick={() => { setViewLevel("countries"); setSelectedCountry(null); setSelectedRegion(null); }}
            className="cursor-pointer hover:text-foreground"
          >
            Pays
          </BreadcrumbLink>
        </BreadcrumbItem>
        {selectedCountry && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {viewLevel === "regions" ? (
                <BreadcrumbPage>{selectedCountry.flag_emoji} {selectedCountry.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  onClick={() => { setViewLevel("regions"); setSelectedRegion(null); setRegionFilter("all"); }}
                  className="cursor-pointer hover:text-foreground"
                >
                  {selectedCountry.flag_emoji} {selectedCountry.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </>
        )}
        {selectedRegion && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{selectedRegion.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );

  // ==================== COUNTRIES VIEW ====================
  const renderCountriesView = () => (
    <>
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
                {activeCountries.length} pays actifs sur {(countries || []).length} configurés
              </p>
            </div>
          </div>
          <GlassButton onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un pays
          </GlassButton>
        </div>
      </GlassCard>

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
          <GlassCard className="p-6" solid>
            <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Map className="h-5 w-5 text-blue-500" />
              Répartition géographique
            </h2>

            <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-950/20 to-blue-900/10 rounded-2xl border border-border/50 overflow-hidden">
              {/* Grid */}
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

              {/* Countries */}
              {activeCountries.map((country) => {
                const pos = COUNTRY_POSITIONS[country.code];
                const stats = countryStats[country.code] || { establishments: 0, groups: 0, regions: 0 };
                const total = stats.establishments + stats.groups;
                const size = Math.min(80, 40 + total * 5);

                if (!pos) return null;

                return (
                  <div
                    key={country.code}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                    onClick={() => handleSelectCountry(country)}
                  >
                    <div
                      className="absolute rounded-full bg-primary/20 animate-ping"
                      style={{ width: size, height: size, left: -size / 2, top: -size / 2 }}
                    />
                    <div
                      className="relative flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/70 text-white shadow-lg shadow-primary/30 transition-transform group-hover:scale-110"
                      style={{ width: size * 0.8, height: size * 0.8 }}
                    >
                      <span className="text-2xl">{country.flag_emoji}</span>
                    </div>

                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-popover border border-border rounded-lg p-3 shadow-xl min-w-[180px]">
                        <p className="font-semibold text-foreground text-sm flex items-center gap-2">
                          {country.name}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </p>
                        <div className="mt-2 space-y-1 text-xs">
                          <div className="flex justify-between text-muted-foreground">
                            <span>Régions</span>
                            <Badge variant="secondary" className="h-5">{stats.regions}</Badge>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Groupes</span>
                            <Badge variant="secondary" className="h-5">{stats.groups}</Badge>
                          </div>
                          <div className="flex justify-between text-muted-foreground">
                            <span>Établissements</span>
                            <Badge variant="secondary" className="h-5">{stats.establishments}</Badge>
                          </div>
                        </div>
                        <p className="text-xs text-primary mt-2">Cliquez pour explorer</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm rounded-lg p-3 border border-border">
                <p className="text-xs font-medium text-muted-foreground mb-2">Cliquez sur un pays pour explorer</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span>Pays avec institutions</span>
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
              const stats = countryStats[country.code] || { establishments: 0, groups: 0, regions: 0 };
              return (
                <GlassCard
                  key={country.code}
                  className="p-4 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
                  solid
                  onClick={() => handleSelectCountry(country)}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{country.flag_emoji}</span>
                      <div>
                        <p className="font-semibold text-foreground">{country.name}</p>
                        <p className="text-xs text-muted-foreground">{stats.regions} régions</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
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
              </GlassCard>
            )}
          </div>
        </TabsContent>

        {/* List Tab */}
        <TabsContent value="list" className="space-y-4">
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

          <GlassCard className="p-0 overflow-hidden" solid>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pays</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-center">Régions</TableHead>
                  <TableHead className="text-center">Groupes</TableHead>
                  <TableHead className="text-center">Établissements</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingCountries ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredCountries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Globe className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Aucun pays trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCountries.map((country) => {
                    const stats = countryStats[country.code] || { establishments: 0, groups: 0, regions: 0 };
                    const hasActivity = stats.establishments > 0 || stats.groups > 0;
                    return (
                      <TableRow
                        key={country.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSelectCountry(country)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{country.flag_emoji}</span>
                            <span className="font-medium">{country.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{country.code}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            {stats.regions}
                          </Badge>
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
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEdit(country);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCountry(country);
                              }}
                            >
                              <ChevronRight className="h-4 w-4" />
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
    </>
  );

  // ==================== REGIONS VIEW ====================
  const renderRegionsView = () => (
    <>
      <GlassCard className="p-6" solid>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <span className="text-2xl">{selectedCountry?.flag_emoji}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {selectedCountry?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {countryRegions.length} régions configurées
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Regions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {countryRegions.map((region) => {
          const stats = regionStats[`${region.country_code}-${region.name}`] || { groups: 0, establishments: 0 };
          return (
            <GlassCard
              key={region.id}
              className="p-4 cursor-pointer hover:ring-2 hover:ring-primary/50 transition-all"
              solid
              onClick={() => handleSelectRegion(region)}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{region.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {region.capital && `Capitale: ${region.capital}`}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex gap-2">
                <Badge variant="secondary" className="gap-1">
                  <Layers className="h-3 w-3" />
                  {stats.groups} groupes
                </Badge>
              </div>
            </GlassCard>
          );
        })}

        {countryRegions.length === 0 && (
          <GlassCard className="p-8 col-span-full text-center" solid>
            <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">Aucune région configurée pour ce pays</p>
          </GlassCard>
        )}
      </div>

      {/* Direct access to all institutions in this country */}
      <GlassCard className="p-4" solid>
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-blue-500" />
          Toutes les institutions de {selectedCountry?.name}
        </h3>

        <div className="flex flex-wrap gap-2 mb-4">
          <Select value={regionFilter} onValueChange={(v) => {
            setRegionFilter(v);
            if (v !== "all") {
              const region = countryRegions.find(r => r.name === v);
              if (region) setSelectedRegion(region);
            } else {
              setSelectedRegion(null);
            }
          }}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrer par région" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les régions</SelectItem>
              {countryRegions.map((r) => (
                <SelectItem key={r.id} value={r.name}>{r.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          {filteredInstitutions.groups.slice(0, 5).map((group) => (
            <div
              key={group.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium text-foreground">{group.name}</p>
                  <p className="text-xs text-muted-foreground">{group.location || "Non localisé"}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleManageGroup(group.id)}>
                <Settings className="h-4 w-4 mr-2" />
                Gestion
              </Button>
            </div>
          ))}
          {filteredInstitutions.establishments.slice(0, 5).map((est) => (
            <div
              key={est.id}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium text-foreground">{est.name}</p>
                  <p className="text-xs text-muted-foreground">{est.type}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => handleManageEstablishment(est.id)}>
                <Settings className="h-4 w-4 mr-2" />
                Gestion
              </Button>
            </div>
          ))}
          {filteredInstitutions.groups.length === 0 && filteredInstitutions.establishments.length === 0 && (
            <p className="text-center text-muted-foreground py-4">Aucune institution dans cette sélection</p>
          )}
        </div>
      </GlassCard>
    </>
  );

  // ==================== INSTITUTIONS VIEW ====================
  const renderInstitutionsView = () => (
    <>
      <GlassCard className="p-6" solid>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <MapPin className="h-6 w-6 text-emerald-500" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">
                {selectedRegion?.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {selectedCountry?.flag_emoji} {selectedCountry?.name} • {selectedRegion?.capital && `Capitale: ${selectedRegion.capital}`}
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Institutions List */}
      <div className="space-y-4">
        <GlassCard className="p-4" solid>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-500" />
            Groupes Scolaires
          </h3>
          <div className="space-y-2">
            {filteredInstitutions.groups.map((group) => (
              <div
                key={group.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Layers className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="font-medium text-foreground">{group.name}</p>
                    <p className="text-xs text-muted-foreground">{group.code || "Sans code"}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleManageGroup(group.id)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Gestion
                </Button>
              </div>
            ))}
            {filteredInstitutions.groups.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucun groupe scolaire</p>
            )}
          </div>
        </GlassCard>

        <GlassCard className="p-4" solid>
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-blue-500" />
            Établissements
          </h3>
          <div className="space-y-2">
            {filteredInstitutions.establishments.map((est) => (
              <div
                key={est.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="font-medium text-foreground">{est.name}</p>
                    <p className="text-xs text-muted-foreground">{est.type}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" onClick={() => handleManageEstablishment(est.id)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Gestion
                </Button>
              </div>
            ))}
            {filteredInstitutions.establishments.length === 0 && (
              <p className="text-center text-muted-foreground py-4">Aucun établissement</p>
            )}
          </div>
        </GlassCard>
      </div>
    </>
  );

  return (
    <UserLayout title="Gestion des Pays">
      <div className="max-w-6xl mx-auto space-y-6">
        {viewLevel !== "countries" && renderBreadcrumb()}

        {viewLevel === "countries" && renderCountriesView()}
        {viewLevel === "regions" && renderRegionsView()}
        {viewLevel === "institutions" && renderInstitutionsView()}

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
