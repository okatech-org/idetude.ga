import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ViewEstablishmentModal } from "@/components/admin/ViewEstablishmentModal";
import { CreateEstablishmentModal } from "@/components/admin/CreateEstablishmentModal";
import { CreateGroupModal } from "@/components/admin/CreateGroupModal";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Search,
  Building2,
  MapPin,
  Users,
  GraduationCap,
  School as SchoolIcon,
  Plus,
  ChevronRight,
  Settings,
  FolderOpen,
  Database,
  FileJson,
} from "lucide-react";
import { countries, type Country, type School as SchoolType, type SchoolGroup } from "@/data/demo-accounts";

const typeLabels: Record<string, { label: string; color: string }> = {
  maternelle: { label: "Maternelle", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  primaire: { label: "Primaire", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  college: { label: "Collège", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  lycee: { label: "Lycée", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  superieur: { label: "Supérieur", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  universite: { label: "Université", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
};

// Parser les types avec qualifications (format: "type:qualification,type2,type3:qual")
const parseEstablishmentTypes = (typeString: string) => {
  return typeString.split(",").map(part => {
    const [type, qualification] = part.split(":");
    const typeInfo = typeLabels[type];
    const label = qualification 
      ? `${typeInfo?.label || type} ${qualification}` 
      : typeInfo?.label || type;
    return { type, qualification: qualification || "", label, color: typeInfo?.color || "" };
  });
};

interface DbEstablishment {
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

interface DbGroup {
  id: string;
  name: string;
  location: string | null;
  country_code: string;
}

const EstablishmentsManagement = () => {
  const navigate = useNavigate();
  const { user, roles: userRoles, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<{ school: SchoolType; group?: SchoolGroup; countryFlag?: string } | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCreateEstablishmentModal, setShowCreateEstablishmentModal] = useState(false);
  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);

  // Database data
  const [dbEstablishments, setDbEstablishments] = useState<DbEstablishment[]>([]);
  const [dbGroups, setDbGroups] = useState<DbGroup[]>([]);
  const [loadingDb, setLoadingDb] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !userRoles.includes("super_admin"))) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, userRoles, authLoading, navigate]);

  useEffect(() => {
    if (user && userRoles.includes("super_admin")) {
      fetchDbData();
    }
  }, [user, userRoles]);

  const fetchDbData = async () => {
    setLoadingDb(true);
    try {
      // Fetch groups
      const { data: groupsData, error: groupsError } = await supabase
        .from("establishment_groups")
        .select("*")
        .order("name");

      if (groupsError) throw groupsError;
      setDbGroups(groupsData || []);

      // Fetch establishments
      const { data: estData, error: estError } = await supabase
        .from("establishments")
        .select("*")
        .order("name");

      if (estError) throw estError;
      setDbEstablishments(estData || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoadingDb(false);
    }
  };

  // Get all schools from demo data
  const getAllSchools = () => {
    const schools: { school: SchoolType; country: Country; group?: SchoolGroup }[] = [];
    
    countries.forEach((country) => {
      country.schoolGroups.forEach((group) => {
        group.schools.forEach((school) => {
          schools.push({ school, country, group });
        });
      });
      country.independentSchools.forEach((school) => {
        schools.push({ school, country });
      });
    });
    
    return schools;
  };

  const allSchools = getAllSchools();
  
  const filteredSchools = allSchools.filter((item) => {
    const matchesSearch =
      item.school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.school.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.country.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCountry = !selectedCountry || item.country.code === selectedCountry.code;
    return matchesSearch && matchesCountry;
  });

  const filteredDbEstablishments = dbEstablishments.filter((est) =>
    est.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (est.address && est.address.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Calculate stats
  const stats = {
    totalSchools: allSchools.length + dbEstablishments.length,
    totalGroups: countries.reduce((acc, c) => acc + c.schoolGroups.length, 0) + dbGroups.length,
    demoSchools: allSchools.length,
    dbSchools: dbEstablishments.length,
    dbGroups: dbGroups.length,
  };

  if (authLoading) {
    return (
      <UserLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </UserLayout>
    );
  }

  if (!user || !userRoles.includes("super_admin")) {
    return null;
  }

  return (
    <UserLayout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Building2 className="h-6 w-6 text-primary" />
              Gestion des Établissements
            </h1>
            <p className="text-muted-foreground">
              {stats.totalSchools} établissement(s) • {stats.totalGroups} groupe(s) scolaire(s)
            </p>
          </div>
          <div className="flex gap-2">
            <GlassButton variant="outline" onClick={() => setShowCreateGroupModal(true)}>
              <FolderOpen className="h-4 w-4" />
              Nouveau groupe
            </GlassButton>
            <GlassButton variant="primary" onClick={() => setShowCreateEstablishmentModal(true)}>
              <Plus className="h-4 w-4" />
              Nouvel établissement
            </GlassButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <GlassCard className="p-4 text-center" solid>
            <SchoolIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{stats.totalSchools}</p>
            <p className="text-xs text-muted-foreground">Total Établissements</p>
          </GlassCard>
          <GlassCard className="p-4 text-center" solid>
            <FolderOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{stats.totalGroups}</p>
            <p className="text-xs text-muted-foreground">Groupes Scolaires</p>
          </GlassCard>
          <GlassCard className="p-4 text-center" solid>
            <Database className="h-6 w-6 mx-auto mb-2 text-green-600" />
            <p className="text-2xl font-bold text-foreground">{stats.dbSchools}</p>
            <p className="text-xs text-muted-foreground">Base de données</p>
          </GlassCard>
          <GlassCard className="p-4 text-center" solid>
            <FileJson className="h-6 w-6 mx-auto mb-2 text-blue-600" />
            <p className="text-2xl font-bold text-foreground">{stats.demoSchools}</p>
            <p className="text-xs text-muted-foreground">Données démo</p>
          </GlassCard>
        </div>

        {/* Search */}
        <GlassCard className="p-4" solid>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <GlassInput
                icon={Search}
                placeholder="Rechercher un établissement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <GlassButton
                variant={!selectedCountry ? "primary" : "outline"}
                onClick={() => setSelectedCountry(null)}
                size="sm"
              >
                Tous
              </GlassButton>
              {countries.map((country) => (
                <GlassButton
                  key={country.code}
                  variant={selectedCountry?.code === country.code ? "primary" : "outline"}
                  onClick={() => setSelectedCountry(country)}
                  size="sm"
                >
                  {country.flag} {country.name}
                </GlassButton>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Tabs for DB vs Demo data */}
        <Tabs defaultValue="database" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="database" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Base de données ({dbEstablishments.length})
            </TabsTrigger>
            <TabsTrigger value="demo" className="flex items-center gap-2">
              <FileJson className="h-4 w-4" />
              Données démo ({allSchools.length})
            </TabsTrigger>
          </TabsList>

          {/* Database Tab */}
          <TabsContent value="database" className="space-y-4">
            {/* DB Groups */}
            {dbGroups.length > 0 && (
              <GlassCard className="p-6" solid>
                <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                  <FolderOpen className="h-5 w-5 text-primary" />
                  Groupes Scolaires ({dbGroups.length})
                </h2>
                <div className="grid gap-3">
                  {dbGroups.map((group) => {
                    const groupEstablishments = dbEstablishments.filter((e) => e.group_id === group.id);
                    return (
                      <div
                        key={group.id}
                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{group.name}</p>
                              {group.location && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {group.location}
                                </p>
                              )}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            {groupEstablishments.length} établissement(s)
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}

            {/* DB Establishments */}
            <GlassCard className="p-6" solid>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Établissements ({filteredDbEstablishments.length})
              </h2>
              {loadingDb ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : filteredDbEstablishments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun établissement dans la base de données</p>
                  <p className="text-sm mt-1">Créez votre premier établissement pour commencer</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {filteredDbEstablishments.map((est) => {
                    const group = dbGroups.find((g) => g.id === est.group_id);
                    return (
                      <div
                        key={est.id}
                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                        onClick={() => navigate(`/admin/establishments/config?id=${est.id}`)}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <SchoolIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{est.name}</p>
                              {est.address && (
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {est.address}
                                </p>
                              )}
                              {group && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  Groupe : {group.name}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-lg">{est.country_code === "GA" ? "🇬🇦" : "🇨🇩"}</span>
                            {parseEstablishmentTypes(est.type).map((typeInfo, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className={typeInfo.color}
                              >
                                {typeInfo.label}
                              </Badge>
                            ))}
                            {est.student_capacity && (
                              <Badge variant="secondary" className="flex items-center gap-1">
                                <GraduationCap className="h-3 w-3" />
                                {est.student_capacity}
                              </Badge>
                            )}
                            <GlassButton
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/admin/establishments/config?id=${est.id}`);
                              }}
                            >
                              <Settings className="h-4 w-4" />
                            </GlassButton>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </TabsContent>

          {/* Demo Data Tab */}
          <TabsContent value="demo" className="space-y-4">
            {/* Demo Groups */}
            {countries.map((country) => (
              (!selectedCountry || selectedCountry.code === country.code) && country.schoolGroups.length > 0 && (
                <GlassCard key={`groups-${country.code}`} className="p-6" solid>
                  <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <span className="text-2xl">{country.flag}</span>
                    Groupes Scolaires - {country.name}
                  </h2>
                  <div className="grid gap-3">
                    {country.schoolGroups.map((group) => (
                      <div
                        key={group.id}
                        className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                              <Building2 className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{group.name}</p>
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {group.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary">
                              {group.schools.length} établissement(s)
                            </Badge>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              )
            ))}

            {/* Demo Schools List */}
            <GlassCard className="p-6" solid>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Établissements Démo ({filteredSchools.length})
              </h2>
              <div className="grid gap-3">
                {filteredSchools.map((item) => (
                  <div
                    key={item.school.id}
                    className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedSchool({ school: item.school, group: item.group, countryFlag: item.country.flag });
                      setShowViewModal(true);
                    }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                          <SchoolIcon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{item.school.name}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {item.school.address}
                          </p>
                          {item.group && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Groupe : {item.group.name}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg">{item.country.flag}</span>
                        <Badge
                          variant="outline"
                          className={typeLabels[item.school.type]?.color || ""}
                        >
                          {typeLabels[item.school.type]?.label || item.school.type}
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <GraduationCap className="h-3 w-3" />
                          {item.school.studentCount}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {item.school.levels}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </TabsContent>
        </Tabs>
      </div>

      {/* View Modal for demo data */}
      <ViewEstablishmentModal
        open={showViewModal}
        onOpenChange={setShowViewModal}
        school={selectedSchool?.school || null}
        group={selectedSchool?.group}
        countryFlag={selectedSchool?.countryFlag}
      />

      {/* Create Establishment Modal */}
      <CreateEstablishmentModal
        open={showCreateEstablishmentModal}
        onOpenChange={setShowCreateEstablishmentModal}
        onSuccess={fetchDbData}
      />

      {/* Create Group Modal */}
      <CreateGroupModal
        open={showCreateGroupModal}
        onOpenChange={setShowCreateGroupModal}
        onSuccess={fetchDbData}
      />
    </UserLayout>
  );
};

export default EstablishmentsManagement;
