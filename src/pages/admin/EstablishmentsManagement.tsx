import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Search,
  Building2,
  MapPin,
  Users,
  GraduationCap,
  School as SchoolIcon,
  Plus,
  ChevronRight,
} from "lucide-react";
import { countries, type Country, type School as SchoolType, type SchoolGroup } from "@/data/demo-accounts";
import { useEffect } from "react";

const typeLabels: Record<string, { label: string; color: string }> = {
  primaire: { label: "Primaire", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  college: { label: "Collège", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  lycee: { label: "Lycée", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  superieur: { label: "Supérieur", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  technique: { label: "Technique", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
};

const EstablishmentsManagement = () => {
  const navigate = useNavigate();
  const { user, roles: userRoles, isLoading: authLoading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !userRoles.includes("super_admin"))) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, userRoles, authLoading, navigate]);

  // Get all schools from all countries
  const getAllSchools = () => {
    const schools: { school: SchoolType; country: Country; group?: SchoolGroup }[] = [];
    
    countries.forEach((country) => {
      // Schools from groups
      country.schoolGroups.forEach((group) => {
        group.schools.forEach((school) => {
          schools.push({ school, country, group });
        });
      });
      
      // Independent schools
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

  // Calculate stats
  const stats = {
    totalSchools: allSchools.length,
    totalGroups: countries.reduce((acc, c) => acc + c.schoolGroups.length, 0),
    totalStudents: allSchools.reduce((acc, item) => acc + item.school.studentCount, 0),
    byType: {
      primaire: allSchools.filter((s) => s.school.type === "primaire").length,
      college: allSchools.filter((s) => s.school.type === "college").length,
      lycee: allSchools.filter((s) => s.school.type === "lycee").length,
      superieur: allSchools.filter((s) => s.school.type === "superieur").length,
      technique: allSchools.filter((s) => s.school.type === "technique").length,
    },
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !userRoles.includes("super_admin")) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4">
              <GlassButton variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </GlassButton>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-primary" />
                  Gestion des Établissements
                </h1>
                <p className="text-muted-foreground">
                  {stats.totalSchools} établissement(s) • {stats.totalGroups} groupe(s) scolaire(s)
                </p>
              </div>
            </div>
            <GlassButton variant="primary">
              <Plus className="h-4 w-4" />
              Nouvel établissement
            </GlassButton>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <GlassCard className="p-4 text-center" solid>
              <SchoolIcon className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stats.totalSchools}</p>
              <p className="text-xs text-muted-foreground">Établissements</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" solid>
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{stats.totalStudents.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Élèves</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" solid>
              <p className="text-2xl font-bold text-green-600">{stats.byType.primaire}</p>
              <p className="text-xs text-muted-foreground">Primaires</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" solid>
              <p className="text-2xl font-bold text-blue-600">{stats.byType.college}</p>
              <p className="text-xs text-muted-foreground">Collèges</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" solid>
              <p className="text-2xl font-bold text-purple-600">{stats.byType.lycee + stats.byType.superieur + stats.byType.technique}</p>
              <p className="text-xs text-muted-foreground">Lycées+</p>
            </GlassCard>
          </div>

          {/* Filters */}
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

          {/* School Groups */}
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
                      className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
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

          {/* Schools List */}
          <GlassCard className="p-6" solid>
            <h2 className="text-lg font-bold text-foreground mb-4">
              Tous les Établissements ({filteredSchools.length})
            </h2>
            <div className="grid gap-3">
              {filteredSchools.map((item) => (
                <div
                  key={item.school.id}
                  className="p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
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
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default EstablishmentsManagement;
