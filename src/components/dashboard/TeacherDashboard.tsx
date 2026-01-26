import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Users,
  Calendar,
  ClipboardList,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

const mockClasses = [
  { name: "3ème A", subject: "Mathématiques", students: 28, nextClass: "09:00" },
  { name: "3ème B", subject: "Mathématiques", students: 26, nextClass: "11:00" },
  { name: "4ème A", subject: "Mathématiques", students: 30, nextClass: "14:00" },
];

const mockSchedule = [
  { time: "08:00 - 09:00", class: "3ème A", room: "Salle 102" },
  { time: "09:00 - 10:00", class: "3ème B", room: "Salle 102" },
  { time: "10:30 - 11:30", class: "4ème A", room: "Salle 205" },
  { time: "14:00 - 15:00", class: "3ème A", room: "Salle 102" },
];

const mockAbsences = [
  { student: "Kevin M.", class: "3ème A", date: "Aujourd'hui", justified: false },
  { student: "Marie O.", class: "3ème B", date: "Hier", justified: true },
  { student: "Paul N.", class: "4ème A", date: "25/01", justified: false },
];

const mockGrades = [
  { class: "3ème A", assignment: "Contrôle Ch.5", average: 12.5, date: "22/01" },
  { class: "3ème B", assignment: "DS Géométrie", average: 14.2, date: "20/01" },
];

export const TeacherDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center" solid>
          <BookOpen className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">3</p>
          <p className="text-xs text-muted-foreground">Classes</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" solid>
          <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
          <p className="text-2xl font-bold text-foreground">84</p>
          <p className="text-xs text-muted-foreground">Élèves</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" solid>
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-green-500" />
          <p className="text-2xl font-bold text-foreground">13.2</p>
          <p className="text-xs text-muted-foreground">Moyenne générale</p>
        </GlassCard>
        <GlassCard className="p-4 text-center" solid>
          <AlertCircle className="h-6 w-6 mx-auto mb-2 text-amber-500" />
          <p className="text-2xl font-bold text-foreground">5</p>
          <p className="text-xs text-muted-foreground">Absences à traiter</p>
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
                    <p className="font-medium text-foreground">{slot.class}</p>
                    <p className="text-sm text-muted-foreground">{slot.time}</p>
                  </div>
                </div>
                <Badge variant="secondary">{slot.room}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* My Classes */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Mes Classes</h3>
          </div>
          <div className="space-y-3">
            {mockClasses.map((cls, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 cursor-pointer transition-colors"
              >
                <div>
                  <p className="font-medium text-foreground">{cls.name}</p>
                  <p className="text-sm text-muted-foreground">{cls.subject}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{cls.students} élèves</p>
                  <p className="text-xs text-muted-foreground">Prochain: {cls.nextClass}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Recent Grades */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Notes Récentes</h3>
          </div>
          <div className="space-y-3">
            {mockGrades.map((grade, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium text-foreground">{grade.assignment}</p>
                  <p className="text-sm text-muted-foreground">{grade.class} • {grade.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{grade.average}/20</p>
                  <p className="text-xs text-muted-foreground">Moyenne</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Absences to Handle */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-foreground">Absences à traiter</h3>
          </div>
          <div className="space-y-3">
            {mockAbsences.map((absence, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  {absence.justified ? (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-amber-500" />
                  )}
                  <div>
                    <p className="font-medium text-foreground">{absence.student}</p>
                    <p className="text-sm text-muted-foreground">{absence.class}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{absence.date}</p>
                  <Badge variant={absence.justified ? "secondary" : "outline"} className={absence.justified ? "" : "border-amber-500 text-amber-600"}>
                    {absence.justified ? "Justifiée" : "Non justifiée"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
