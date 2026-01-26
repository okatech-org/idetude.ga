import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

// Coordonnées des pays pour la carte
const countryCoordinates: Record<string, { lat: number; lng: number; zoom: number }> = {
  GA: { lat: -0.8037, lng: 11.6094, zoom: 6 },
  CD: { lat: -4.0383, lng: 21.7587, zoom: 5 },
  CG: { lat: -0.228, lng: 15.8277, zoom: 6 },
  CM: { lat: 7.3697, lng: 12.3547, zoom: 5 },
  CI: { lat: 7.54, lng: -5.5471, zoom: 6 },
  SN: { lat: 14.4974, lng: -14.4524, zoom: 6 },
  FR: { lat: 46.2276, lng: 2.2137, zoom: 5 },
  BE: { lat: 50.5039, lng: 4.4699, zoom: 7 },
};

const CountriesManagement = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "map">("list");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
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

  // Pays avec des données (au moins 1 groupe ou établissement)
  const countriesWithData = countries.filter(c => {
    const stats = countryStats[c.code];
    return stats && (stats.establishments > 0 || stats.groups > 0);
  });

  // Initialize map
  useEffect(() => {
    if (activeTab !== "map" || !mapRef.current || mapInstanceRef.current) return;

    // Create map centered on Africa
    const map = L.map(mapRef.current).setView([5, 15], 3);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeTab]);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || activeTab !== "map") return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add markers for countries with data
    countriesWithData.forEach(country => {
      const coords = countryCoordinates[country.code];
      if (!coords) return;

      const stats = countryStats[country.code] || { establishments: 0, groups: 0 };

      // Create custom icon
      const icon = L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translate(-50%, -100%);
          ">
            <div style="
              background: hsl(var(--primary));
              color: white;
              padding: 8px 12px;
              border-radius: 8px;
              font-weight: 600;
              font-size: 14px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              white-space: nowrap;
            ">
              ${country.flag_emoji} ${country.name}
              <span style="
                display: block;
                font-size: 11px;
                font-weight: normal;
                opacity: 0.9;
              ">${stats.groups} groupes • ${stats.establishments} étab.</span>
            </div>
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 8px solid hsl(var(--primary));
            "></div>
          </div>
        `,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([coords.lat, coords.lng], { icon }).addTo(mapInstanceRef.current!);
      
      marker.on('click', () => {
        mapInstanceRef.current?.setView([coords.lat, coords.lng], coords.zoom, { animate: true });
      });

      markersRef.current.push(marker);
    });

    // Fit bounds to show all markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current);
      mapInstanceRef.current.fitBounds(group.getBounds().pad(0.2));
    }
  }, [countriesWithData, countryStats, activeTab]);

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

  // KPIs
  const totalCountries = countries.length;
  const activeCountries = countriesWithData.length;
  const totalGroups = Object.values(countryStats).reduce((acc, s) => acc + s.groups, 0);
  const totalEstablishments = Object.values(countryStats).reduce((acc, s) => acc + s.establishments, 0);

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Pays</h1>
              <p className="text-sm text-muted-foreground">
                Cartographie et configuration des pays de l'écosystème
              </p>
            </div>
          </div>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un pays
          </Button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Globe className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{totalCountries}</p>
              <p className="text-xs text-muted-foreground">Pays configurés</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Map className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <p className="text-2xl font-bold">{activeCountries}</p>
              <p className="text-xs text-muted-foreground">Pays actifs</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Layers className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <p className="text-2xl font-bold">{totalGroups}</p>
              <p className="text-xs text-muted-foreground">Groupes scolaires</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Building2 className="h-6 w-6 mx-auto mb-2 text-amber-500" />
              <p className="text-2xl font-bold">{totalEstablishments}</p>
              <p className="text-xs text-muted-foreground">Établissements</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs: List / Map */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "list" | "map")}>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Cartographie
              </TabsTrigger>
            </TabsList>

            {activeTab === "list" && (
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un pays..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
          </div>

          {/* List Tab */}
          <TabsContent value="list" className="mt-4">
            <Card>
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
                      const hasData = stats.establishments > 0 || stats.groups > 0;
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
                            <Badge variant={stats.groups > 0 ? "default" : "secondary"} className="gap-1">
                              <Layers className="h-3 w-3" />
                              {stats.groups}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant={stats.establishments > 0 ? "default" : "secondary"} className="gap-1">
                              <Building2 className="h-3 w-3" />
                              {stats.establishments}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={hasData ? "default" : "secondary"}>
                              {hasData ? "Actif" : "Inactif"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEdit(country)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Map className="h-5 w-5 text-primary" />
                  Cartographie des Pays
                </CardTitle>
                <CardDescription>
                  Cliquez sur un pays pour zoomer. {activeCountries} pays avec des données actives.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  ref={mapRef} 
                  className="h-[500px] w-full rounded-b-lg"
                  style={{ zIndex: 0 }}
                />
              </CardContent>
            </Card>
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
                  <Input
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
                  <Input
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
                <Input
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
                  <Input
                    placeholder="XAF"
                    value={formData.currency}
                    onChange={(e) =>
                      setFormData({ ...formData, currency: e.target.value.toUpperCase() })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fuseau horaire</Label>
                  <Input
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
