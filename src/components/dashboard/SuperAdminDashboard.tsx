import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import {
  Shield,
  Globe,
  Building2,
  Users,
  Layers,
  MapPin,
  TrendingUp,
  TrendingDown,
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  UserPlus,
  Settings,
  FileText,
  MessageSquare,
  Activity,
  Flag,
  Eye,
  ArrowRight,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

const COLORS = ['hsl(var(--primary))', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

type ActivityType = 'user_created' | 'establishment_created' | 'settings_changed' | 'role_assigned' | 'document_uploaded' | 'message_sent';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  actor: { name: string; role: string };
  timestamp: Date;
}

const activityIcons: Record<ActivityType, React.ElementType> = {
  user_created: UserPlus,
  establishment_created: Building2,
  settings_changed: Settings,
  role_assigned: Shield,
  document_uploaded: FileText,
  message_sent: MessageSquare,
};

const activityColors: Record<ActivityType, string> = {
  user_created: 'bg-green-500/10 text-green-500',
  establishment_created: 'bg-blue-500/10 text-blue-500',
  settings_changed: 'bg-amber-500/10 text-amber-500',
  role_assigned: 'bg-purple-500/10 text-purple-500',
  document_uploaded: 'bg-cyan-500/10 text-cyan-500',
  message_sent: 'bg-rose-500/10 text-rose-500',
};

// Mock recent activities
const recentActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'establishment_created',
    title: 'Nouvel établissement',
    description: 'Lycée International de Libreville ajouté',
    actor: { name: 'Jean Moussavou', role: 'Super Admin' },
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
  },
  {
    id: '2',
    type: 'user_created',
    title: 'Nouveaux utilisateurs',
    description: '45 enseignants importés',
    actor: { name: 'Paul Ondo', role: 'Directeur' },
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
  },
  {
    id: '3',
    type: 'role_assigned',
    title: 'Rôle attribué',
    description: 'CPE assigné à Sylvie Mba',
    actor: { name: 'System', role: 'Automatique' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
  },
  {
    id: '4',
    type: 'settings_changed',
    title: 'Configuration modifiée',
    description: 'Modules mis à jour pour Collège Saint-Exupéry',
    actor: { name: 'Jean Moussavou', role: 'Super Admin' },
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
  },
];

// Mock alerts
const systemAlerts = [
  { id: '1', type: 'warning', title: '3 établissements sans directeur', link: '/admin/establishments' },
  { id: '2', type: 'info', title: '12 utilisateurs en attente de validation', link: '/admin/users' },
  { id: '3', type: 'warning', title: '5 commentaires signalés à modérer', link: '/admin/moderation' },
];

// Monthly growth mock data
const monthlyGrowthData = [
  { month: 'Jan', etablissements: 12, utilisateurs: 450 },
  { month: 'Fév', etablissements: 15, utilisateurs: 520 },
  { month: 'Mar', etablissements: 18, utilisateurs: 680 },
  { month: 'Avr', etablissements: 22, utilisateurs: 890 },
  { month: 'Mai', etablissements: 28, utilisateurs: 1050 },
  { month: 'Jun', etablissements: 35, utilisateurs: 1320 },
];

export const SuperAdminDashboard = () => {
  const navigate = useNavigate();

  // Fetch ecosystem stats
  const { data: countriesCount, isLoading: loadingCountries } = useQuery({
    queryKey: ['dashboard-countries'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('countries')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: regionsCount, isLoading: loadingRegions } = useQuery({
    queryKey: ['dashboard-regions'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('regions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: groupsCount, isLoading: loadingGroups } = useQuery({
    queryKey: ['dashboard-groups'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('establishment_groups')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: establishmentsCount, isLoading: loadingEstablishments } = useQuery({
    queryKey: ['dashboard-establishments'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('establishments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  const { data: usersCount, isLoading: loadingUsers } = useQuery({
    queryKey: ['dashboard-users'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch establishments by type for chart
  const { data: establishmentsByType } = useQuery({
    queryKey: ['dashboard-establishments-by-type'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('establishments')
        .select('type');
      if (error) throw error;
      
      const counts: Record<string, number> = {};
      data?.forEach(e => {
        counts[e.type] = (counts[e.type] || 0) + 1;
      });
      
      const typeLabels: Record<string, string> = {
        'maternelle': 'Maternelle',
        'primaire': 'Primaire',
        'college': 'Collège',
        'lycee': 'Lycée',
        'universite': 'Université',
        'complexe_scolaire': 'Complexe',
        'formation_pro': 'Formation Pro'
      };
      
      return Object.entries(counts).map(([type, count]) => ({
        name: typeLabels[type] || type,
        value: count
      }));
    }
  });

  // Fetch establishments by country
  const { data: establishmentsByCountry } = useQuery({
    queryKey: ['dashboard-establishments-by-country'],
    queryFn: async () => {
      const { data: establishments, error } = await supabase
        .from('establishments')
        .select('country_code');
      if (error) throw error;
      
      const { data: countries } = await supabase
        .from('countries')
        .select('code, name, flag_emoji');
      
      const countryMap = new Map(countries?.map(c => [c.code, c]) || []);
      const counts: Record<string, number> = {};
      
      establishments?.forEach(e => {
        counts[e.country_code] = (counts[e.country_code] || 0) + 1;
      });
      
      return Object.entries(counts).map(([code, count]) => ({
        name: countryMap.get(code)?.name || code,
        flag: countryMap.get(code)?.flag_emoji || '🏳️',
        value: count
      })).sort((a, b) => b.value - a.value).slice(0, 5);
    }
  });

  // Fetch recent notifications count
  const { data: notificationsCount } = useQuery({
    queryKey: ['dashboard-notifications'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('is_read', false);
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch flagged comments count
  const { data: flaggedCount } = useQuery({
    queryKey: ['dashboard-flagged-comments'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('resource_comments')
        .select('*', { count: 'exact', head: true })
        .eq('is_flagged', true)
        .eq('is_hidden', false);
      if (error) throw error;
      return count || 0;
    }
  });

  const isLoading = loadingCountries || loadingRegions || loadingGroups || loadingEstablishments || loadingUsers;

  const kpiStats = [
    { 
      title: "Pays", 
      value: countriesCount, 
      icon: Globe, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+2",
      trendUp: true,
      link: "/admin/countries"
    },
    { 
      title: "Régions", 
      value: regionsCount, 
      icon: MapPin, 
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "+5",
      trendUp: true,
      link: "/admin/countries"
    },
    { 
      title: "Groupes", 
      value: groupsCount, 
      icon: Layers, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "+3",
      trendUp: true,
      link: "/admin/groups"
    },
    { 
      title: "Établissements", 
      value: establishmentsCount, 
      icon: Building2, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      trend: "+12",
      trendUp: true,
      link: "/admin/establishments"
    },
    { 
      title: "Utilisateurs", 
      value: usersCount, 
      icon: Users, 
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      trend: "+48",
      trendUp: true,
      link: "/admin/users"
    },
  ];

  const quickActions = [
    { label: "Utilisateurs", icon: Users, link: "/admin/users", color: "text-blue-500" },
    { label: "Établissements", icon: Building2, link: "/admin/establishments", color: "text-green-500" },
    { label: "Modération", icon: Shield, link: "/admin/moderation", color: "text-amber-500" },
    { label: "Configuration", icon: Settings, link: "/admin/settings", color: "text-purple-500" },
    { label: "Analytique", icon: BarChart3, link: "/admin/analytics", color: "text-cyan-500" },
    { label: "Export", icon: FileText, link: "/admin/export", color: "text-rose-500" },
  ];

  return (
    <div className="space-y-6">
      {/* Header with alerts */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-500/10">
              <Shield className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">Panneau Super Administrateur</h2>
              <p className="text-sm text-muted-foreground">
                Vue d'ensemble de l'écosystème • {format(new Date(), "EEEE d MMMM yyyy", { locale: fr })}
              </p>
            </div>
          </div>
        </div>

        {/* System Alerts */}
        <div className="flex flex-wrap gap-2">
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

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kpiStats.map((stat) => (
          <Card 
            key={stat.title} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate(stat.link)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <div className={`flex items-center gap-1 text-xs ${stat.trendUp ? 'text-green-500' : 'text-red-500'}`}>
                  {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {stat.trend}
                </div>
              </div>
              <div className="mt-3">
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{stat.value}</p>
                )}
                <p className="text-xs text-muted-foreground">{stat.title}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <GlassCard className="p-4" solid>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Actions rapides</h3>
          <Badge variant="secondary" className="text-xs">
            <Bell className="h-3 w-3 mr-1" />
            {notificationsCount || 0} notifications
          </Badge>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {quickActions.map((action) => (
            <GlassButton
              key={action.label}
              variant="ghost"
              className="flex-col h-auto py-3 gap-1"
              onClick={() => navigate(action.link)}
            >
              <action.icon className={`h-5 w-5 ${action.color}`} />
              <span className="text-xs">{action.label}</span>
            </GlassButton>
          ))}
        </div>
      </GlassCard>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Charts */}
        <div className="lg:col-span-2 space-y-6">
          {/* Growth Chart */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Activity className="h-4 w-4 text-primary" />
                    Croissance Mensuelle
                  </CardTitle>
                  <CardDescription>Évolution des établissements et utilisateurs</CardDescription>
                </div>
                <GlassButton variant="ghost" size="sm" onClick={() => navigate('/admin/analytics')}>
                  <Eye className="h-4 w-4 mr-1" />
                  Détails
                </GlassButton>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyGrowthData}>
                    <defs>
                      <linearGradient id="colorEtab" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--background))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="utilisateurs" 
                      name="Utilisateurs"
                      stroke="#10b981" 
                      fillOpacity={1}
                      fill="url(#colorUsers)"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="etablissements" 
                      name="Établissements"
                      stroke="hsl(var(--primary))" 
                      fillOpacity={1}
                      fill="url(#colorEtab)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Distribution Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* By Type */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Types d'établissements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={establishmentsByType || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {(establishmentsByType || []).map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-2 justify-center mt-2">
                  {(establishmentsByType || []).slice(0, 4).map((item, idx) => (
                    <div key={item.name} className="flex items-center gap-1 text-xs">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* By Country */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Par pays</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={establishmentsByCountry || []} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis type="number" className="text-xs" />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        width={80}
                        className="text-xs"
                        tickFormatter={(value, index) => {
                          const item = establishmentsByCountry?.[index];
                          return item ? `${item.flag} ${value}` : value;
                        }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="value" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Column - Activity & Notifications */}
        <div className="space-y-6">
          {/* Moderation Status */}
          <Card className="border-amber-500/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Flag className="h-4 w-4 text-amber-500" />
                  Modération
                </CardTitle>
                <GlassButton variant="ghost" size="sm" onClick={() => navigate('/admin/moderation')}>
                  Voir
                  <ArrowRight className="h-3 w-3 ml-1" />
                </GlassButton>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/5">
                <div>
                  <p className="text-2xl font-bold text-amber-600">{flaggedCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Contenus signalés</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Activité récente
                </CardTitle>
                <GlassButton variant="ghost" size="sm" onClick={() => navigate('/admin/activity')}>
                  Tout voir
                </GlassButton>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[280px]">
                <div className="p-4 pt-0 space-y-3">
                  {recentActivities.map((activity) => {
                    const Icon = activityIcons[activity.type];
                    return (
                      <div
                        key={activity.id}
                        className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className={`p-1.5 rounded-lg ${activityColors[activity.type]}`}>
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {activity.description}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatDistanceToNow(activity.timestamp, { addSuffix: true, locale: fr })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-green-500" />
                État du système
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base de données</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Opérationnel
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Authentification</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Actif
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Stockage</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Disponible
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
