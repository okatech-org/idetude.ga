import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  BookOpen,
  Calendar,
  MessageSquare,
  TrendingUp,
  Clock,
  FileText,
  Bell,
} from "lucide-react";

const mockGrades = [
  { subject: "Mathématiques", grade: 14.5, coef: 4, trend: "up" },
  { subject: "Français", grade: 12.0, coef: 4, trend: "stable" },
  { subject: "Histoire-Géo", grade: 15.5, coef: 3, trend: "up" },
  { subject: "Anglais", grade: 11.0, coef: 3, trend: "down" },
  { subject: "SVT", grade: 16.0, coef: 2, trend: "up" },
];

const mockSchedule = [
  { time: "08:00 - 09:00", subject: "Mathématiques", teacher: "M. MBOULA", room: "102" },
  { time: "09:00 - 10:00", subject: "Français", teacher: "Mme OYANE", room: "105" },
  { time: "10:30 - 11:30", subject: "Histoire-Géo", teacher: "M. NDONG", room: "201" },
  { time: "14:00 - 15:00", subject: "Anglais", teacher: "Mme ESSONO", room: "108" },
];

const mockHomework = [
  { subject: "Mathématiques", title: "Exercices p.45", due: "Demain", urgent: true },
  { subject: "Français", title: "Dissertation", due: "28/01", urgent: false },
  { subject: "SVT", title: "Exposé biodiversité", due: "30/01", urgent: false },
];

const mockMessages = [
  { from: "M. MBOULA", subject: "Rattrapage contrôle", time: "Il y a 2h", unread: true },
  { from: "Administration", subject: "Réunion parents-profs", time: "Hier", unread: false },
];

export const StudentDashboard = () => {
  const average = mockGrades.reduce((acc, g) => acc + g.grade * g.coef, 0) / 
                  mockGrades.reduce((acc, g) => acc + g.coef, 0);

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center" solid>
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold text-foreground">{average.toFixed(1)}</p>
          <p className="text-xs text-muted-foreground">Moyenne générale</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" solid>
          <GraduationCap className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">3ème</p>
          <p className="text-xs text-muted-foreground">3ème A</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" solid>
          <FileText className="h-6 w-6 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold text-foreground">3</p>
          <p className="text-xs text-muted-foreground">Devoirs à rendre</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" solid>
          <Bell className="h-6 w-6 mx-auto mb-2 text-blue-500" />
          <p className="text-2xl font-bold text-foreground">1</p>
          <p className="text-xs text-muted-foreground">Nouveau message</p>
        </GlassCard>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Today's Schedule */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Emploi du temps - Aujourd'hui</h3>
          </div>
          <div className="space-y-3">
            {mockSchedule.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-foreground">{slot.subject}</p>
                    <p className="text-sm text-muted-foreground">{slot.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{slot.teacher}</p>
                  <Badge variant="secondary">Salle {slot.room}</Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* My Grades */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Mes Notes</h3>
          </div>
          <div className="space-y-4">
            {mockGrades.map((grade, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{grade.subject}</span>
                  <span className="text-sm font-bold text-foreground">{grade.grade}/20</span>
                </div>
                <Progress value={grade.grade * 5} className="h-2" />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Homework */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-foreground">Devoirs à rendre</h3>
          </div>
          <div className="space-y-3">
            {mockHomework.map((hw, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  hw.urgent ? "bg-red-500/10 border border-red-500/20" : "bg-muted/30"
                }`}
              >
                <div>
                  <p className="font-medium text-foreground">{hw.title}</p>
                  <p className="text-sm text-muted-foreground">{hw.subject}</p>
                </div>
                <Badge variant={hw.urgent ? "destructive" : "secondary"}>
                  {hw.due}
                </Badge>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Messages */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-foreground">Messages</h3>
          </div>
          <div className="space-y-3">
            {mockMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  msg.unread ? "bg-blue-500/10 border border-blue-500/20" : "bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  {msg.unread && <div className="w-2 h-2 rounded-full bg-blue-500" />}
                  <div>
                    <p className="font-medium text-foreground">{msg.subject}</p>
                    <p className="text-sm text-muted-foreground">{msg.from}</p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{msg.time}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
