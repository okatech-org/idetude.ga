import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import {
  Building2,
  Search,
  MapPin,
  Settings,
  Plus,
  Eye,
  Globe,
  GraduationCap,
  Layers,
  Users,
} from "lucide-react";

interface Establishment {
  id: string;
  name: string;
  code: string | null;
  type: string;
  address: string | null;
  country_code: string;
  levels: string | null;
  student_capacity: number | null;
  group_id: string | null;
}

interface SchoolGroup {
  id: string;
  name: string;
}

interface Country {
  code: string;
  name: string;
  flag_emoji: string;
}

const typeLabels: Record<string, { label: string; color: string }> = {
  maternelle: { label: "Maternelle", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  primaire: { label: "Primaire", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  college: { label: "Collège", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  lycee: { label: "Lycée", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  superieur: { label: "Supérieur", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  universite: { label: "Université", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
};

const parseEstablishmentTypes = (typeString: string) => {
  return typeString.split(",").map(part => {
    const [type, qualification] = part.split(":");
    const typeInfo = typeLabels[type];
    const label = qualification 
      ? `${typeInfo?.label || type} ${qualification}` 
      : typeInfo?.label || type;
    return { type, label, color: typeInfo?.color || "" };
  });
};

const EstablishmentsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Fetch establishments
  const { data: establishments = [], isLoading } = useQuery({
    queryKey: ["establishments-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishments")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as Establishment[];
    },
  });

  // Fetch groups for reference
  const { data: groups = [] } = useQuery({
    queryKey: ["groups-for-establishments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishment_groups")
        .select("id, name");
      if (error) throw error;
      return data as SchoolGroup[];
    },
  });

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ["countries-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("code, name, flag_emoji")
        .order("name");
      if (error) throw error;
      return data as Country[];
    },
  });

  const getGroupName = (groupId: string | null) => {
    if (!groupId) return null;
    return groups.find(g => g.id === groupId)?.name || null;
  };

  const getCountryInfo = (code: string) => {
    return countries.find(c => c.code === code);
  };

  const filteredEstablishments = establishments.filter((est) => {
    const matchesSearch = 
      est.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (est.address && est.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (est.code && est.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCountry = countryFilter === "all" || est.country_code === countryFilter;
    const matchesType = typeFilter === "all" || est.type.includes(typeFilter);
    return matchesSearch && matchesCountry && matchesType;
  });

  // Stats
  const totalEstablishments = establishments.length;
  const totalCapacity = establishments.reduce((acc, e) => acc + (e.student_capacity || 0), 0);
  const countriesWithEstablishments = [...new Set(establishments.map(e => e.country_code))].length;
  const establishmentsInGroups = establishments.filter(e => e.group_id).length;

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Liste des Établissements</h1>
              <p className="text-sm text-muted-foreground">
                Vue d'ensemble de tous les établissements
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/establishments/config")}>
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
            <Button onClick={() => navigate("/admin/establishments/config")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouvel établissement
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Building2 className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEstablishments}</p>
                <p className="text-sm text-muted-foreground">Établissements</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalCapacity.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Capacité totale</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Globe className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{countriesWithEstablishments}</p>
                <p className="text-sm text-muted-foreground">Pays</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10">
                <Layers className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{establishmentsInGroups}</p>
                <p className="text-sm text-muted-foreground">Dans un groupe</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un établissement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Pays" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les pays</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.flag_emoji} {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  {Object.entries(typeLabels).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Establishments Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Établissements</CardTitle>
            <CardDescription>
              {filteredEstablishments.length} établissement(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Établissement</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead>Groupe</TableHead>
                  <TableHead className="text-center">Capacité</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEstablishments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <Building2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Aucun établissement trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEstablishments.map((est) => {
                    const country = getCountryInfo(est.country_code);
                    const groupName = getGroupName(est.group_id);
                    const types = parseEstablishmentTypes(est.type);
                    
                    return (
                      <TableRow key={est.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                              <Building2 className="h-5 w-5 text-amber-500" />
                            </div>
                            <div>
                              <p className="font-medium">{est.name}</p>
                              {est.code && (
                                <p className="text-xs text-muted-foreground">
                                  Code: {est.code}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {types.map((t, idx) => (
                              <Badge key={idx} variant="outline" className={t.color}>
                                {t.label}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          {est.address ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="max-w-[200px] truncate">{est.address}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {country ? (
                            <div className="flex items-center gap-2">
                              <span>{country.flag_emoji}</span>
                              <span className="text-sm">{country.name}</span>
                            </div>
                          ) : (
                            <Badge variant="outline">{est.country_code}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {groupName ? (
                            <div className="flex items-center gap-1 text-sm">
                              <Layers className="h-3 w-3 text-muted-foreground" />
                              {groupName}
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Indépendant</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {est.student_capacity ? (
                            <Badge variant="secondary">
                              <GraduationCap className="h-3 w-3 mr-1" />
                              {est.student_capacity}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/establishments/config?id=${est.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/establishments/config?id=${est.id}`)}
                            >
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
};

export default EstablishmentsList;
