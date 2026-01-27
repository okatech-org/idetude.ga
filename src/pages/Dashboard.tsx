import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { TeacherDashboard } from "@/components/dashboard/TeacherDashboard";
import { StudentDashboard } from "@/components/dashboard/StudentDashboard";
import { ParentDashboard } from "@/components/dashboard/ParentDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import {
  User,
  Shield,
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

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

// System alerts for Super Admin
const systemAlerts = [
  { id: '1', type: 'warning', title: '3 établissements sans directeur', link: '/admin/establishments' },
  { id: '2', type: 'info', title: '12 utilisateurs en attente de validation', link: '/admin/users' },
  { id: '3', type: 'warning', title: '5 commentaires signalés à modérer', link: '/admin/moderation' },
];

const Dashboard = () => {
  const { user, profile, roles } = useAuth();
  const navigate = useNavigate();

  // Determine which role-specific dashboard to show
  const isTeacher = roles.includes("teacher") || roles.includes("main_teacher");
  const isStudent = roles.includes("student");
  const isParent = roles.includes("parent_primary") || roles.includes("parent_secondary");
  const isSuperAdmin = roles.includes("super_admin");

  return (
    <UserLayout title="Tableau de bord">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Welcome Card */}
        <GlassCard className="p-6 md:p-8" solid>
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
            {/* Left - User info */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center ring-2 ring-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Bienvenue, {profile?.first_name || "Utilisateur"} !
                </h1>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
                {roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {roles.map((role) => {
                      const config = roleLabels[role];
                      return (
                        <span
                          key={role}
                          className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium"
                        >
                          {config?.label || role}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right - Super Admin info */}
            {isSuperAdmin && (
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <h2 className="text-lg font-bold text-foreground">Panneau Super Administrateur</h2>
                    <p className="text-sm text-muted-foreground">
                      Vue d'ensemble de l'écosystème • {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="p-2 rounded-xl bg-red-500/10">
                    <Shield className="h-6 w-6 text-red-500" />
                  </div>
                </div>
                {/* System Alerts */}
                <div className="flex flex-wrap justify-end gap-2">
                  {systemAlerts.map((alert) => (
                    <button
                      key={alert.id}
                      onClick={() => navigate(alert.link)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        alert.type === 'warning' 
                          ? 'bg-amber-500/10 text-amber-600 hover:bg-amber-500/20' 
                          : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                      }`}
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {alert.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Super Admin Dashboard */}
        {isSuperAdmin && <SuperAdminDashboard />}

        {/* Role-specific Dashboard */}
        {isTeacher && !isSuperAdmin && <TeacherDashboard />}
        {isStudent && <StudentDashboard />}
        {isParent && <ParentDashboard />}

        {/* Generic fallback for other roles */}
        {!isTeacher && !isStudent && !isParent && !isSuperAdmin && (
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
        )}

        {/* Profile Info (collapsed for role dashboards) */}
        {profile && !isTeacher && !isStudent && !isParent && (
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
    </UserLayout>
  );
};

export default Dashboard;
