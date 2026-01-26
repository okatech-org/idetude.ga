import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  Download,
  Star,
  MessageSquare,
  TrendingUp,
  FileText,
  Heart,
  BarChart3,
} from "lucide-react";
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
} from "recharts";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ResourceStats {
  id: string;
  title: string;
  subject: string;
  class_level: string;
  downloads_count: number;
  created_at: string;
  views: number;
  avgRating: number;
  ratingCount: number;
  commentCount: number;
  favoriteCount: number;
}

const COLORS = [
  "hsl(var(--primary))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

const ResourceAnalytics = () => {
  const { user, roles } = useAuth();
  const [resources, setResources] = useState<ResourceStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  const isTeacher = roles.some((r) =>
    ["teacher", "main_teacher", "super_admin", "school_admin"].includes(r)
  );

  useEffect(() => {
    if (user && isTeacher) {
      fetchResourceStats();
    }
  }, [user, isTeacher, timeRange]);

  const fetchResourceStats = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Fetch teacher's resources
      let query = supabase
        .from("pedagogical_resources")
        .select("id, title, subject, class_level, downloads_count, created_at")
        .eq("uploaded_by", user.id);

      if (timeRange !== "all") {
        const daysAgo = parseInt(timeRange);
        const dateFilter = new Date();
        dateFilter.setDate(dateFilter.getDate() - daysAgo);
        query = query.gte("created_at", dateFilter.toISOString());
      }

      const { data: resourcesData, error } = await query;
      if (error) throw error;

      if (!resourcesData || resourcesData.length === 0) {
        setResources([]);
        setIsLoading(false);
        return;
      }

      const resourceIds = resourcesData.map((r) => r.id);

      // Fetch views
      const { data: viewsData } = await supabase
        .from("resource_views")
        .select("resource_id")
        .in("resource_id", resourceIds);

      const viewsMap = new Map<string, number>();
      viewsData?.forEach((v) => {
        viewsMap.set(v.resource_id, (viewsMap.get(v.resource_id) || 0) + 1);
      });

      // Fetch ratings
      const { data: ratingsData } = await supabase
        .from("resource_ratings")
        .select("resource_id, rating")
        .in("resource_id", resourceIds);

      const ratingsMap = new Map<string, { sum: number; count: number }>();
      ratingsData?.forEach((r) => {
        const current = ratingsMap.get(r.resource_id) || { sum: 0, count: 0 };
        ratingsMap.set(r.resource_id, {
          sum: current.sum + r.rating,
          count: current.count + 1,
        });
      });

      // Fetch comments
      const { data: commentsData } = await supabase
        .from("resource_comments")
        .select("resource_id")
        .in("resource_id", resourceIds)
        .eq("is_hidden", false);

      const commentsMap = new Map<string, number>();
      commentsData?.forEach((c) => {
        commentsMap.set(c.resource_id, (commentsMap.get(c.resource_id) || 0) + 1);
      });

      // Fetch favorites
      const { data: favoritesData } = await supabase
        .from("resource_favorites")
        .select("resource_id")
        .in("resource_id", resourceIds);

      const favoritesMap = new Map<string, number>();
      favoritesData?.forEach((f) => {
        favoritesMap.set(f.resource_id, (favoritesMap.get(f.resource_id) || 0) + 1);
      });

      // Combine data
      const statsData: ResourceStats[] = resourcesData.map((r) => {
        const ratingInfo = ratingsMap.get(r.id) || { sum: 0, count: 0 };
        return {
          ...r,
          views: viewsMap.get(r.id) || 0,
          avgRating: ratingInfo.count > 0 ? ratingInfo.sum / ratingInfo.count : 0,
          ratingCount: ratingInfo.count,
          commentCount: commentsMap.get(r.id) || 0,
          favoriteCount: favoritesMap.get(r.id) || 0,
        };
      });

      setResources(statsData);
    } catch (error) {
      console.error("Error fetching resource stats:", error);
      toast.error("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate totals
  const totals = resources.reduce(
    (acc, r) => ({
      views: acc.views + r.views,
      downloads: acc.downloads + r.downloads_count,
      ratings: acc.ratings + r.ratingCount,
      comments: acc.comments + r.commentCount,
      favorites: acc.favorites + r.favoriteCount,
    }),
    { views: 0, downloads: 0, ratings: 0, comments: 0, favorites: 0 }
  );

  // Subject distribution
  const subjectData = resources.reduce((acc, r) => {
    const existing = acc.find((s) => s.name === r.subject);
    if (existing) {
      existing.value += 1;
      existing.downloads += r.downloads_count;
    } else {
      acc.push({ name: r.subject, value: 1, downloads: r.downloads_count });
    }
    return acc;
  }, [] as { name: string; value: number; downloads: number }[]);

  // Top resources by engagement
  const topResources = [...resources]
    .sort((a, b) => b.downloads_count + b.views * 0.5 - (a.downloads_count + a.views * 0.5))
    .slice(0, 5);

  // Rating distribution
  const ratingDistribution = [
    { name: "5★", count: 0 },
    { name: "4★", count: 0 },
    { name: "3★", count: 0 },
    { name: "2★", count: 0 },
    { name: "1★", count: 0 },
  ];
  resources.forEach((r) => {
    if (r.avgRating >= 4.5) ratingDistribution[0].count += r.ratingCount;
    else if (r.avgRating >= 3.5) ratingDistribution[1].count += r.ratingCount;
    else if (r.avgRating >= 2.5) ratingDistribution[2].count += r.ratingCount;
    else if (r.avgRating >= 1.5) ratingDistribution[3].count += r.ratingCount;
    else if (r.avgRating >= 0.5) ratingDistribution[4].count += r.ratingCount;
  });

  if (!user || !isTeacher) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          <GlassCard className="p-8 text-center">
            <p>Accès réservé aux enseignants.</p>
          </GlassCard>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Statistiques de mes ressources
            </h1>
            <p className="text-muted-foreground mt-1">
              Suivez les performances de vos ressources pédagogiques
            </p>
          </div>

          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout le temps</SelectItem>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">3 derniers mois</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : resources.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Aucune ressource publiée</p>
            <p className="text-muted-foreground mt-1">
              Ajoutez des ressources dans la bibliothèque pédagogique pour voir vos statistiques.
            </p>
          </GlassCard>
        ) : (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <Eye className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.views}</p>
                    <p className="text-xs text-muted-foreground">Vues</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Download className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.downloads}</p>
                    <p className="text-xs text-muted-foreground">Téléchargements</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-500/10">
                    <Star className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.ratings}</p>
                    <p className="text-xs text-muted-foreground">Évaluations</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.comments}</p>
                    <p className="text-xs text-muted-foreground">Commentaires</p>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Heart className="h-5 w-5 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{totals.favorites}</p>
                    <p className="text-xs text-muted-foreground">Favoris</p>
                  </div>
                </div>
              </GlassCard>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Resources */}
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Top ressources par engagement
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topResources} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis type="number" />
                    <YAxis
                      type="category"
                      dataKey="title"
                      width={150}
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        value.length > 20 ? `${value.slice(0, 20)}...` : value
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar
                      dataKey="downloads_count"
                      name="Téléchargements"
                      fill="hsl(var(--primary))"
                      radius={[0, 4, 4, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </GlassCard>

              {/* Subject Distribution */}
              <GlassCard className="p-6">
                <h3 className="font-semibold mb-4">Répartition par matière</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={subjectData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} (${(percent * 100).toFixed(0)}%)`
                      }
                      labelLine={false}
                    >
                      {subjectData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--background))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </GlassCard>
            </div>

            {/* Rating Distribution */}
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Distribution des notes
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={ratingDistribution}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar
                    dataKey="count"
                    name="Nombre de notes"
                    fill="hsl(45, 93%, 47%)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            {/* Detailed Table */}
            <GlassCard className="p-6">
              <h3 className="font-semibold mb-4">Détail des ressources</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-2">Titre</th>
                      <th className="text-left py-3 px-2">Matière</th>
                      <th className="text-center py-3 px-2">Vues</th>
                      <th className="text-center py-3 px-2">Téléch.</th>
                      <th className="text-center py-3 px-2">Note</th>
                      <th className="text-center py-3 px-2">Comm.</th>
                      <th className="text-center py-3 px-2">Favoris</th>
                      <th className="text-left py-3 px-2">Ajouté</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resources.map((r) => (
                      <tr key={r.id} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 px-2 font-medium truncate max-w-[200px]">
                          {r.title}
                        </td>
                        <td className="py-3 px-2 text-muted-foreground">{r.subject}</td>
                        <td className="py-3 px-2 text-center">{r.views}</td>
                        <td className="py-3 px-2 text-center">{r.downloads_count}</td>
                        <td className="py-3 px-2 text-center">
                          {r.ratingCount > 0 ? (
                            <span className="flex items-center justify-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {r.avgRating.toFixed(1)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-center">{r.commentCount}</td>
                        <td className="py-3 px-2 text-center">{r.favoriteCount}</td>
                        <td className="py-3 px-2 text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(r.created_at), {
                            addSuffix: true,
                            locale: fr,
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default ResourceAnalytics;
