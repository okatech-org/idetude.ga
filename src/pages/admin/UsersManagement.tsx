import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Badge } from "@/components/ui/badge";
import { CreateUserModal } from "@/components/admin/CreateUserModal";
import { ImportUsersModal } from "@/components/admin/ImportUsersModal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Search,
  Users,
  Shield,
  User,
  Building2,
  GraduationCap,
  BookOpen,
  RefreshCw,
  Filter,
  Plus,
  Upload,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserWithRole {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  is_demo: boolean;
  created_at: string;
  roles: string[];
}

const roleLabels: Record<string, { label: string; color: string }> = {
  super_admin: { label: "Super Admin", color: "bg-red-500/10 text-red-600 border-red-500/20" },
  regional_admin: { label: "Admin Régional", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  school_director: { label: "Directeur", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  school_admin: { label: "Admin Scolaire", color: "bg-green-500/10 text-green-600 border-green-500/20" },
  cpe: { label: "CPE", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  main_teacher: { label: "Prof. Principal", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
  teacher: { label: "Enseignant", color: "bg-cyan-500/10 text-cyan-600 border-cyan-500/20" },
  external_tutor: { label: "Tuteur Externe", color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  student: { label: "Élève", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
  parent_primary: { label: "Parent Principal", color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  parent_secondary: { label: "Parent Secondaire", color: "bg-rose-500/10 text-rose-600 border-rose-500/20" },
};

const UsersManagement = () => {
  const navigate = useNavigate();
  const { user, roles: userRoles, isLoading: authLoading } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !userRoles.includes("super_admin"))) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, userRoles, authLoading, navigate]);

  useEffect(() => {
    if (user && userRoles.includes("super_admin")) {
      fetchUsers();
    }
  }, [user, userRoles]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      // Fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all roles
      const { data: allRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => ({
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        is_demo: profile.is_demo,
        created_at: profile.created_at,
        roles: allRoles
          ?.filter((r) => r.user_id === profile.id)
          .map((r) => r.role) || [],
      }));

      setUsers(usersWithRoles);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === "all" || u.roles.includes(roleFilter);
    
    return matchesSearch && matchesRole;
  });

  const getRoleIcon = (roles: string[]) => {
    if (roles.includes("super_admin")) return Shield;
    if (roles.includes("regional_admin") || roles.includes("school_director")) return Building2;
    if (roles.includes("teacher") || roles.includes("main_teacher")) return BookOpen;
    if (roles.includes("student")) return GraduationCap;
    return User;
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
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <GlassButton variant="ghost" onClick={() => navigate("/dashboard")}>
                <ArrowLeft className="h-4 w-4" />
              </GlassButton>
              <div>
                <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  Gestion des Utilisateurs
                </h1>
                <p className="text-muted-foreground">
                  {users.length} utilisateur(s) enregistré(s)
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <GlassButton variant="outline" onClick={() => setShowImportModal(true)}>
                <Upload className="h-4 w-4" />
                Importer CSV
              </GlassButton>
              <GlassButton variant="primary" onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4" />
                Nouvel utilisateur
              </GlassButton>
            </div>
          </div>

          {/* Filters */}
          <GlassCard className="p-4" solid>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <GlassInput
                  icon={Search}
                  placeholder="Rechercher par nom ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-[200px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filtrer par rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  {Object.entries(roleLabels).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <GlassButton variant="outline" onClick={fetchUsers}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                Actualiser
              </GlassButton>
            </div>
          </GlassCard>

          {/* Users Table */}
          <GlassCard className="p-0 overflow-hidden" solid>
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Chargement des utilisateurs...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">Aucun utilisateur trouvé</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Utilisateur</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rôles</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Inscription</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => {
                      const Icon = getRoleIcon(u.roles);
                      return (
                        <TableRow key={u.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {u.first_name} {u.last_name}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {u.email}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {u.roles.length > 0 ? (
                                u.roles.map((role) => {
                                  const config = roleLabels[role] || {
                                    label: role,
                                    color: "bg-muted text-muted-foreground",
                                  };
                                  return (
                                    <Badge
                                      key={role}
                                      variant="outline"
                                      className={config.color}
                                    >
                                      {config.label}
                                    </Badge>
                                  );
                                })
                              ) : (
                                <span className="text-muted-foreground text-sm">
                                  Aucun rôle
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {u.is_demo ? (
                              <Badge variant="secondary">Démo</Badge>
                            ) : (
                              <Badge variant="outline">Standard</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(u.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <GlassCard className="p-4 text-center" solid>
              <p className="text-2xl font-bold text-foreground">{users.length}</p>
              <p className="text-sm text-muted-foreground">Total utilisateurs</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" solid>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.is_demo).length}
              </p>
              <p className="text-sm text-muted-foreground">Comptes démo</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" solid>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.roles.includes("teacher") || u.roles.includes("main_teacher")).length}
              </p>
              <p className="text-sm text-muted-foreground">Enseignants</p>
            </GlassCard>
            <GlassCard className="p-4 text-center" solid>
              <p className="text-2xl font-bold text-foreground">
                {users.filter((u) => u.roles.includes("student")).length}
              </p>
              <p className="text-sm text-muted-foreground">Élèves</p>
            </GlassCard>
          </div>
        </div>
      </div>

      <Footer />

      {/* Modals */}
      <CreateUserModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onSuccess={fetchUsers}
      />
      <ImportUsersModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onSuccess={fetchUsers}
      />
    </div>
  );
};

export default UsersManagement;
