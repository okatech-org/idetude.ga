import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  BarChart3, 
  Building2, 
  Users, 
  Globe, 
  MapPin, 
  Layers,
  TrendingUp,
  TrendingDown,
  Activity
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
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
  LineChart,
  Line,
  Legend
} from "recharts";

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b', '#ef4444'];

export default function GlobalAnalytics() {
  // Fetch countries count
  const { data: countriesData, isLoading: loadingCountries } = useQuery({
    queryKey: ['admin-analytics-countries'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('countries')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch regions count
  const { data: regionsData, isLoading: loadingRegions } = useQuery({
    queryKey: ['admin-analytics-regions'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('regions')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch groups count
  const { data: groupsData, isLoading: loadingGroups } = useQuery({
    queryKey: ['admin-analytics-groups'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('establishment_groups')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch establishments count
  const { data: establishmentsData, isLoading: loadingEstablishments } = useQuery({
    queryKey: ['admin-analytics-establishments'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('establishments')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch users count
  const { data: usersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['admin-analytics-users'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    }
  });

  // Fetch establishments by country
  const { data: establishmentsByCountry } = useQuery({
    queryKey: ['admin-analytics-establishments-by-country'],
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
      })).sort((a, b) => b.value - a.value);
    }
  });

  // Fetch establishments by type
  const { data: establishmentsByType } = useQuery({
    queryKey: ['admin-analytics-establishments-by-type'],
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
        'formation_pro': 'Formation Pro'
      };
      
      return Object.entries(counts).map(([type, count]) => ({
        name: typeLabels[type] || type,
        value: count
      }));
    }
  });

  // Mock monthly growth data
  const monthlyGrowthData = [
    { month: 'Jan', etablissements: 12, utilisateurs: 450 },
    { month: 'Fév', etablissements: 15, utilisateurs: 520 },
    { month: 'Mar', etablissements: 18, utilisateurs: 680 },
    { month: 'Avr', etablissements: 22, utilisateurs: 890 },
    { month: 'Mai', etablissements: 28, utilisateurs: 1050 },
    { month: 'Jun', etablissements: 35, utilisateurs: 1320 },
  ];

  const isLoading = loadingCountries || loadingRegions || loadingGroups || loadingEstablishments || loadingUsers;

  const stats = [
    { 
      title: "Pays actifs", 
      value: countriesData, 
      icon: Globe, 
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      trend: "+2",
      trendUp: true
    },
    { 
      title: "Régions", 
      value: regionsData, 
      icon: MapPin, 
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      trend: "+5",
      trendUp: true
    },
    { 
      title: "Groupes Scolaires", 
      value: groupsData, 
      icon: Layers, 
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      trend: "+3",
      trendUp: true
    },
    { 
      title: "Établissements", 
      value: establishmentsData, 
      icon: Building2, 
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      trend: "+12",
      trendUp: true
    },
    { 
      title: "Utilisateurs", 
      value: usersData, 
      icon: Users, 
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      trend: "+48",
      trendUp: true
    },
  ];

  return (
    <UserLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-primary" />
            Analytique Globale
          </h1>
          <p className="text-muted-foreground mt-1">
            Vue d'ensemble de l'écosystème iDETUDE
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
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

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Establishments by Country */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Établissements par Pays</CardTitle>
              <CardDescription>Distribution géographique</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={establishmentsByCountry || []} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis 
                      type="category" 
                      dataKey="name" 
                      width={120}
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

          {/* Establishments by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Types d'Établissements</CardTitle>
              <CardDescription>Répartition par niveau</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={establishmentsByType || []}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      labelLine={false}
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
            </CardContent>
          </Card>
        </div>

        {/* Growth Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Croissance Mensuelle
            </CardTitle>
            <CardDescription>Évolution des établissements et utilisateurs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyGrowthData}>
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
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="etablissements" 
                    name="Établissements"
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="utilisateurs" 
                    name="Utilisateurs"
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserLayout>
  );
}
