import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  BarChart3,
} from "lucide-react";
import { useState } from "react";

const COLORS = ["hsl(var(--primary))", "hsl(var(--secondary))", "hsl(var(--accent))", "#10b981", "#f59e0b", "#ef4444"];

export default function Analytics() {
  const { user, roles } = useAuth();
  const [selectedTrimester, setSelectedTrimester] = useState("1");
  const currentYear = new Date().getFullYear();
  const schoolYear = `${currentYear}-${currentYear + 1}`;

  const isAdmin = roles.some(r => ["super_admin", "school_director", "school_admin"].includes(r));

  // Fetch grades for analytics
  const { data: grades = [] } = useQuery({
    queryKey: ["analytics-grades", user?.id, selectedTrimester],
    queryFn: async () => {
      let query = supabase
        .from("grades")
        .select("*")
        .eq("trimester", parseInt(selectedTrimester));

      if (!isAdmin) {
        query = query.or(`student_id.eq.${user!.id},teacher_id.eq.${user!.id}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Fetch absences for analytics
  const { data: absences = [] } = useQuery({
    queryKey: ["analytics-absences", user?.id],
    queryFn: async () => {
      let query = supabase.from("absences").select("*");

      if (!isAdmin) {
        query = query.or(`student_id.eq.${user!.id},recorded_by.eq.${user!.id}`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Calculate grade statistics by subject
  const gradesBySubject = grades.reduce((acc, grade) => {
    if (!acc[grade.subject]) {
      acc[grade.subject] = { total: 0, count: 0 };
    }
    acc[grade.subject].total += Number(grade.grade);
    acc[grade.subject].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  const subjectAverages = Object.entries(gradesBySubject).map(([subject, data]) => ({
    subject: subject.length > 12 ? subject.substring(0, 12) + "..." : subject,
    fullSubject: subject,
    average: Math.round((data.total / data.count) * 10) / 10,
  }));

  // Calculate grade distribution
  const gradeDistribution = [
    { range: "0-5", count: grades.filter(g => Number(g.grade) <= 5).length },
    { range: "6-10", count: grades.filter(g => Number(g.grade) > 5 && Number(g.grade) <= 10).length },
    { range: "11-14", count: grades.filter(g => Number(g.grade) > 10 && Number(g.grade) <= 14).length },
    { range: "15-17", count: grades.filter(g => Number(g.grade) > 14 && Number(g.grade) <= 17).length },
    { range: "18-20", count: grades.filter(g => Number(g.grade) > 17).length },
  ];

  // Calculate absence statistics
  const absenceStats = {
    total: absences.length,
    justified: absences.filter(a => a.is_justified).length,
    unjustified: absences.filter(a => !a.is_justified).length,
    absences: absences.filter(a => a.absence_type === "absence").length,
    retards: absences.filter(a => a.absence_type === "retard").length,
  };

  const absencePieData = [
    { name: "Justifiées", value: absenceStats.justified },
    { name: "Non justifiées", value: absenceStats.unjustified },
  ];

  const absenceTypeData = [
    { name: "Absences", value: absenceStats.absences },
    { name: "Retards", value: absenceStats.retards },
  ];

  // Monthly absence trend
  const monthlyAbsences = absences.reduce((acc, absence) => {
    const month = new Date(absence.absence_date).toLocaleDateString("fr-FR", { month: "short" });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const absenceTrend = Object.entries(monthlyAbsences).map(([month, count]) => ({
    month,
    count,
  }));

  // Calculate overall average
  const overallAverage = grades.length > 0
    ? Math.round((grades.reduce((sum, g) => sum + Number(g.grade), 0) / grades.length) * 10) / 10
    : 0;

  return (
    <UserLayout title="Tableau de bord analytique">

        {/* Filter */}
        <div className="flex justify-end mb-6">
          <Select value={selectedTrimester} onValueChange={setSelectedTrimester}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Trimestre 1</SelectItem>
              <SelectItem value="2">Trimestre 2</SelectItem>
              <SelectItem value="3">Trimestre 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{overallAverage}/20</p>
                <p className="text-xs text-muted-foreground">Moyenne générale</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <BookOpen className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{grades.length}</p>
                <p className="text-xs text-muted-foreground">Notes enregistrées</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{absenceStats.total}</p>
                <p className="text-xs text-muted-foreground">Total absences</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard className="p-4" solid>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {absenceStats.total > 0
                    ? Math.round((absenceStats.justified / absenceStats.total) * 100)
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Taux justification</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Grade by Subject */}
          <GlassCard className="p-6" solid>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Moyennes par matière
            </h3>
            {subjectAverages.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={subjectAverages} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 20]} stroke="hsl(var(--muted-foreground))" />
                  <YAxis
                    type="category"
                    dataKey="subject"
                    width={100}
                    stroke="hsl(var(--muted-foreground))"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-background border border-border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{payload[0].payload.fullSubject}</p>
                            <p className="text-primary">Moyenne: {payload[0].value}/20</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="average" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </GlassCard>

          {/* Grade Distribution */}
          <GlassCard className="p-6" solid>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Distribution des notes
            </h3>
            {grades.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={gradeDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="range" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]}>
                    {gradeDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </GlassCard>

          {/* Absence Pie Chart */}
          <GlassCard className="p-6" solid>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Répartition des absences
            </h3>
            {absences.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-center text-muted-foreground mb-2">Par justification</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={absencePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#ef4444" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="text-sm text-center text-muted-foreground mb-2">Par type</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={absenceTypeData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        <Cell fill="hsl(var(--primary))" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--background))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Aucune absence enregistrée
              </div>
            )}
          </GlassCard>

          {/* Absence Trend */}
          <GlassCard className="p-6" solid>
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-amber-500" />
              Tendance mensuelle des absences
            </h3>
            {absenceTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={absenceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--background))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--primary))" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                Aucune donnée disponible
              </div>
            )}
          </GlassCard>
        </div>

        {/* Summary Table */}
        <GlassCard className="p-6" solid>
          <h3 className="font-bold mb-4">Résumé par matière</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium">Matière</th>
                  <th className="text-center p-3 font-medium">Nombre de notes</th>
                  <th className="text-center p-3 font-medium">Moyenne</th>
                  <th className="text-center p-3 font-medium">Tendance</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(gradesBySubject).map(([subject, data]) => {
                  const avg = Math.round((data.total / data.count) * 10) / 10;
                  return (
                    <tr key={subject} className="border-b border-border/50">
                      <td className="p-3">{subject}</td>
                      <td className="p-3 text-center">{data.count}</td>
                      <td className="p-3 text-center">
                        <Badge variant={avg >= 10 ? "secondary" : "destructive"}>
                          {avg}/20
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        {avg >= 12 ? (
                          <TrendingUp className="h-4 w-4 text-green-500 mx-auto" />
                        ) : avg >= 10 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500 mx-auto" />
                        )}
                      </td>
                    </tr>
                  );
                })}
                {Object.keys(gradesBySubject).length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-6 text-center text-muted-foreground">
                      Aucune note enregistrée pour ce trimestre
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
    </UserLayout>
  );
}
