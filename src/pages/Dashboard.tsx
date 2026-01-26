import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import {
  User,
  LogOut,
  Shield,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  Settings,
} from "lucide-react";
import { useEffect } from "react";

const roleLabels: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  super_admin: { label: "Super Administrateur", icon: Shield, color: "from-red-500/20 to-red-500/5" },
  regional_admin: { label: "Administrateur Régional", icon: Building2, color: "from-purple-500/20 to-purple-500/5" },
  school_director: { label: "Directeur d'Établissement", icon: Building2, color: "from-blue-500/20 to-blue-500/5" },
  school_admin: { label: "Administrateur Scolaire", icon: Settings, color: "from-green-500/20 to-green-500/5" },
  cpe: { label: "CPE", icon: Users, color: "from-amber-500/20 to-amber-500/5" },
  main_teacher: { label: "Professeur Principal", icon: BookOpen, color: "from-indigo-500/20 to-indigo-500/5" },
  teacher: { label: "Enseignant", icon: BookOpen, color: "from-cyan-500/20 to-cyan-500/5" },
  external_tutor: { label: "Tuteur Externe", icon: User, color: "from-pink-500/20 to-pink-500/5" },
  student: { label: "Élève", icon: GraduationCap, color: "from-emerald-500/20 to-emerald-500/5" },
  parent_primary: { label: "Parent Principal", icon: Users, color: "from-orange-500/20 to-orange-500/5" },
  parent_secondary: { label: "Parent Secondaire", icon: Users, color: "from-rose-500/20 to-rose-500/5" },
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, profile, roles, signOut, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth", { replace: true });
    }
  }, [user, isLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Welcome Card */}
          <GlassCard className="p-8" solid>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
                  <User className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Bienvenue, {profile?.first_name || "Utilisateur"} !
                  </h1>
                  <p className="text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <GlassButton variant="outline" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </GlassButton>
            </div>
          </GlassCard>

          {/* Roles Card */}
          <GlassCard className="p-6" solid>
            <h2 className="text-lg font-bold text-foreground mb-4">Vos rôles</h2>
            {roles.length > 0 ? (
              <div className="grid gap-3">
                {roles.map((role) => {
                  const config = roleLabels[role] || {
                    label: role,
                    icon: User,
                    color: "from-gray-500/20 to-gray-500/5",
                  };
                  const Icon = config.icon;
                  return (
                    <div
                      key={role}
                      className="flex items-center gap-4 p-4 rounded-xl bg-muted/30"
                    >
                      <div
                        className={`w-12 h-12 rounded-xl bg-gradient-to-br ${config.color} flex items-center justify-center`}
                      >
                        <Icon className="h-6 w-6 text-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{config.label}</p>
                        <p className="text-sm text-muted-foreground">Rôle actif</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun rôle attribué pour le moment.</p>
                <p className="text-sm mt-1">
                  Contactez votre administrateur pour obtenir des accès.
                </p>
              </div>
            )}
          </GlassCard>

          {/* Super Admin Section */}
          {roles.includes("super_admin") && (
            <GlassCard className="p-6 border-2 border-red-500/20" solid>
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-red-500" />
                <h2 className="text-lg font-bold text-foreground">
                  Panneau Super Administrateur
                </h2>
              </div>
              <p className="text-muted-foreground mb-4">
                Vous avez accès à toutes les fonctionnalités d'administration de la plateforme.
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                <GlassButton 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => navigate("/admin/users")}
                >
                  <Users className="h-4 w-4" />
                  Gérer les utilisateurs
                </GlassButton>
                <GlassButton 
                  variant="outline" 
                  className="justify-start"
                  onClick={() => navigate("/admin/establishments")}
                >
                  <Building2 className="h-4 w-4" />
                  Gérer les établissements
                </GlassButton>
                <GlassButton variant="outline" className="justify-start">
                  <Settings className="h-4 w-4" />
                  Configuration système
                </GlassButton>
                <GlassButton variant="outline" className="justify-start">
                  <GraduationCap className="h-4 w-4" />
                  Statistiques globales
                </GlassButton>
              </div>
            </GlassCard>
          )}

          {/* Profile Info */}
          {profile && (
            <GlassCard className="p-6" solid>
              <h2 className="text-lg font-bold text-foreground mb-4">
                Informations du profil
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Prénom</p>
                  <p className="font-medium text-foreground">{profile.first_name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Nom</p>
                  <p className="font-medium text-foreground">{profile.last_name || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{profile.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Téléphone</p>
                  <p className="font-medium text-foreground">{profile.phone || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type de compte</p>
                  <p className="font-medium text-foreground">
                    {profile.is_demo ? "Compte Démo" : "Compte Standard"}
                  </p>
                </div>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;
