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
  Layers,
  Search,
  Building2,
  MapPin,
  Settings,
  Plus,
  Eye,
  Globe,
} from "lucide-react";

interface SchoolGroup {
  id: string;
  name: string;
  code: string | null;
  location: string | null;
  country_code: string;
  description: string | null;
  created_at: string;
}

interface Country {
  code: string;
  name: string;
  flag_emoji: string;
}

const SchoolGroupsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState<string>("all");

  // Fetch groups
  const { data: groups = [], isLoading } = useQuery({
    queryKey: ["school-groups-list"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("establishment_groups")
        .select("*")
        .order("name");
      if (error) throw error;
      return data as SchoolGroup[];
    },
  });

  // Fetch countries for filter
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

  // Fetch establishment count per group
  const { data: groupStats = {} } = useQuery({
    queryKey: ["group-establishment-stats"],
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

  const getCountryInfo = (code: string) => {
    return countries.find(c => c.code === code);
  };

  const filteredGroups = groups.filter((group) => {
    const matchesSearch = 
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (group.location && group.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (group.code && group.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCountry = countryFilter === "all" || group.country_code === countryFilter;
    return matchesSearch && matchesCountry;
  });

  // Stats
  const totalGroups = groups.length;
  const totalEstablishments = Object.values(groupStats).reduce((a, b) => a + b, 0);
  const countriesWithGroups = [...new Set(groups.map(g => g.country_code))].length;

  return (
    <UserLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Layers className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Liste des Groupes Scolaires</h1>
              <p className="text-sm text-muted-foreground">
                Vue d'ensemble de tous les groupes scolaires
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/admin/groups/config")}>
              <Settings className="h-4 w-4 mr-2" />
              Configuration
            </Button>
            <Button onClick={() => navigate("/admin/groups/config")}>
              <Plus className="h-4 w-4 mr-2" />
              Nouveau groupe
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/10">
                <Layers className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalGroups}</p>
                <p className="text-sm text-muted-foreground">Groupes scolaires</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-amber-500/10">
                <Building2 className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalEstablishments}</p>
                <p className="text-sm text-muted-foreground">Établissements rattachés</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10">
                <Globe className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{countriesWithGroups}</p>
                <p className="text-sm text-muted-foreground">Pays concernés</p>
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
                  placeholder="Rechercher un groupe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={countryFilter} onValueChange={setCountryFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Filtrer par pays" />
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
            </div>
          </CardContent>
        </Card>

        {/* Groups Table */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Groupes Scolaires</CardTitle>
            <CardDescription>
              {filteredGroups.length} groupe(s) trouvé(s)
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Groupe</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Pays</TableHead>
                  <TableHead className="text-center">Établissements</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredGroups.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <Layers className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                      <p className="text-muted-foreground">Aucun groupe trouvé</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredGroups.map((group) => {
                    const country = getCountryInfo(group.country_code);
                    const establishmentCount = groupStats[group.id] || 0;
                    
                    return (
                      <TableRow key={group.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Layers className="h-5 w-5 text-blue-500" />
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
                          {group.location ? (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              {group.location}
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
                            <Badge variant="outline">{group.country_code}</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant={establishmentCount > 0 ? "default" : "secondary"}>
                            <Building2 className="h-3 w-3 mr-1" />
                            {establishmentCount}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/groups/config?id=${group.id}`)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => navigate(`/admin/groups/config?id=${group.id}`)}
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

export default SchoolGroupsList;
