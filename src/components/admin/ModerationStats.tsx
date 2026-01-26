import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { format, subDays, eachDayOfInterval, startOfDay } from "date-fns";
import { fr } from "date-fns/locale";
import { Flag, EyeOff, AlertTriangle, TrendingUp } from "lucide-react";

interface Comment {
  id: string;
  is_flagged: boolean;
  is_hidden: boolean;
  flag_reason: string | null;
  flagged_at: string | null;
  hidden_at: string | null;
  created_at: string;
  user_id: string;
  profiles: { first_name: string; last_name: string } | null;
}

interface ModerationStatsProps {
  comments: Comment[];
}

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--warning))", "hsl(var(--accent))"];

const chartConfig = {
  flagged: { label: "Signalés", color: "hsl(var(--destructive))" },
  hidden: { label: "Masqués", color: "hsl(var(--muted-foreground))" },
  resolved: { label: "Résolus", color: "hsl(var(--primary))" },
};

export const ModerationStats = ({ comments }: ModerationStatsProps) => {
  // Données pour le graphique d'évolution temporelle (30 derniers jours)
  const timeSeriesData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = subDays(today, 30);
    const days = eachDayOfInterval({ start: thirtyDaysAgo, end: today });

    return days.map((day) => {
      const dayStart = startOfDay(day);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const flaggedCount = comments.filter((c) => {
        if (!c.flagged_at) return false;
        const flagDate = new Date(c.flagged_at);
        return flagDate >= dayStart && flagDate < dayEnd;
      }).length;

      const hiddenCount = comments.filter((c) => {
        if (!c.hidden_at) return false;
        const hideDate = new Date(c.hidden_at);
        return hideDate >= dayStart && hideDate < dayEnd;
      }).length;

      return {
        date: format(day, "dd/MM", { locale: fr }),
        fullDate: format(day, "d MMMM", { locale: fr }),
        flagged: flaggedCount,
        hidden: hiddenCount,
      };
    });
  }, [comments]);

  // Données pour la répartition par raison de signalement
  const reasonDistribution = useMemo(() => {
    const reasons: Record<string, number> = {};
    comments
      .filter((c) => c.is_flagged && c.flag_reason)
      .forEach((c) => {
        const reason = c.flag_reason || "Non spécifié";
        reasons[reason] = (reasons[reason] || 0) + 1;
      });

    return Object.entries(reasons).map(([name, value]) => ({ name, value }));
  }, [comments]);

  // Top utilisateurs avec le plus de commentaires signalés
  const topFlaggedUsers = useMemo(() => {
    const userCounts: Record<string, { count: number; name: string }> = {};
    comments
      .filter((c) => c.is_flagged)
      .forEach((c) => {
        const userId = c.user_id;
        const name = c.profiles ? `${c.profiles.first_name} ${c.profiles.last_name}` : "Utilisateur inconnu";
        if (!userCounts[userId]) {
          userCounts[userId] = { count: 0, name };
        }
        userCounts[userId].count++;
      });

    return Object.entries(userCounts)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [comments]);

  // Stats globales
  const stats = useMemo(() => {
    const total = comments.length;
    const flagged = comments.filter((c) => c.is_flagged).length;
    const hidden = comments.filter((c) => c.is_hidden).length;
    const resolved = comments.filter((c) => c.is_flagged && c.is_hidden).length;

    return { total, flagged, hidden, resolved };
  }, [comments]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Commentaires</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Signalés</CardTitle>
            <Flag className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.flagged}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.flagged / stats.total) * 100).toFixed(1) : 0}% du total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Masqués</CardTitle>
            <EyeOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hidden}</div>
            <p className="text-xs text-muted-foreground">
              {stats.flagged > 0 ? ((stats.hidden / stats.flagged) * 100).toFixed(1) : 0}% des signalés
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de résolution</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.flagged > 0 ? ((stats.resolved / stats.flagged) * 100).toFixed(0) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Graphiques */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Évolution temporelle */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Évolution des signalements (30 jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[250px]">
              <AreaChart data={timeSeriesData}>
                <defs>
                  <linearGradient id="flaggedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="hiddenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="flagged"
                  name="Signalés"
                  stroke="hsl(var(--destructive))"
                  fill="url(#flaggedGradient)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="hidden"
                  name="Masqués"
                  stroke="hsl(var(--primary))"
                  fill="url(#hiddenGradient)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Répartition par raison */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Répartition par raison</CardTitle>
          </CardHeader>
          <CardContent>
            {reasonDistribution.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={reasonDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {reasonDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                Aucun signalement avec raison
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top utilisateurs signalés */}
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Utilisateurs les plus signalés</CardTitle>
        </CardHeader>
        <CardContent>
          {topFlaggedUsers.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px]">
              <BarChart data={topFlaggedUsers} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={120}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" name="Signalements" fill="hsl(var(--destructive))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ChartContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted-foreground">
              Aucun utilisateur signalé
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
