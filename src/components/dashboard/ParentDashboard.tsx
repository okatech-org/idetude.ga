import { GlassCard } from "@/components/ui/glass-card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  TrendingUp,
  AlertCircle,
  CreditCard,
  MessageSquare,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";

const mockChildren = [
  { 
    name: "Kevin MOUSSAVOU", 
    class: "CM2-A", 
    school: "École Primaire Excellence",
    average: 14.5,
    absences: 2,
    latePayment: false 
  },
  { 
    name: "Estelle NZAMBA", 
    class: "CE1-B", 
    school: "École Primaire Excellence",
    average: 15.2,
    absences: 0,
    latePayment: true 
  },
];

const mockGrades = [
  { child: "Kevin", subject: "Mathématiques", grade: 15, date: "22/01", comment: "Très bien" },
  { child: "Kevin", subject: "Français", grade: 12, date: "20/01", comment: "Peut mieux faire" },
  { child: "Estelle", subject: "Lecture", grade: 16, date: "21/01", comment: "Excellent" },
];

const mockAbsences = [
  { child: "Kevin", date: "15/01", reason: "Maladie", justified: true },
  { child: "Kevin", date: "10/01", reason: "Non justifiée", justified: false },
];

const mockPayments = [
  { label: "Frais de scolarité T2", amount: 250000, due: "15/02", status: "pending", child: "Kevin" },
  { label: "Frais de scolarité T2", amount: 200000, due: "15/02", status: "overdue", child: "Estelle" },
  { label: "Cantine Janvier", amount: 45000, due: "31/01", status: "paid", child: "Kevin" },
];

const mockMessages = [
  { from: "M. EYENE (Prof. CM2)", subject: "Comportement en classe", time: "Aujourd'hui", unread: true },
  { from: "Direction", subject: "Réunion parents-profs", time: "Hier", unread: false },
];

const mockEvents = [
  { title: "Réunion parents-profs", date: "02/02", time: "18:00" },
  { title: "Conseil de classe", date: "10/02", time: "17:00" },
];

export const ParentDashboard = () => {
  return (
    <div className="space-y-6">
      {/* Children Overview */}
      <div className="grid md:grid-cols-2 gap-4">
        {mockChildren.map((child, idx) => (
          <GlassCard key={idx} className="p-6" solid>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-bold text-foreground">{child.name}</p>
                  <p className="text-sm text-muted-foreground">{child.class} • {child.school}</p>
                </div>
              </div>
              {child.latePayment && (
                <Badge variant="destructive">Paiement en retard</Badge>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-green-600">{child.average}</p>
                <p className="text-xs text-muted-foreground">Moyenne</p>
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{child.absences}</p>
                <p className="text-xs text-muted-foreground">Absences</p>
              </div>
              <div>
                <Progress value={child.average * 5} className="h-2 mt-2" />
                <p className="text-xs text-muted-foreground mt-1">Progression</p>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Grades */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <h3 className="font-bold text-foreground">Notes Récentes</h3>
          </div>
          <div className="space-y-3">
            {mockGrades.map((grade, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div>
                  <p className="font-medium text-foreground">{grade.subject}</p>
                  <p className="text-sm text-muted-foreground">{grade.child} • {grade.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-foreground">{grade.grade}/20</p>
                  <p className="text-xs text-muted-foreground">{grade.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Absences */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <h3 className="font-bold text-foreground">Absences</h3>
          </div>
          <div className="space-y-3">
            {mockAbsences.length > 0 ? (
              mockAbsences.map((absence, idx) => (
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
                      <p className="font-medium text-foreground">{absence.child}</p>
                      <p className="text-sm text-muted-foreground">{absence.date}</p>
                    </div>
                  </div>
                  <Badge variant={absence.justified ? "secondary" : "outline"} className={absence.justified ? "" : "border-amber-500 text-amber-600"}>
                    {absence.justified ? "Justifiée" : "Non justifiée"}
                  </Badge>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">Aucune absence</p>
            )}
          </div>
        </GlassCard>

        {/* Payments */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Paiements</h3>
          </div>
          <div className="space-y-3">
            {mockPayments.map((payment, idx) => (
              <div
                key={idx}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  payment.status === "overdue" 
                    ? "bg-red-500/10 border border-red-500/20" 
                    : "bg-muted/30"
                }`}
              >
                <div>
                  <p className="font-medium text-foreground">{payment.label}</p>
                  <p className="text-sm text-muted-foreground">{payment.child} • Échéance: {payment.due}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-foreground">{payment.amount.toLocaleString()} FCFA</p>
                  <Badge 
                    variant={payment.status === "paid" ? "secondary" : payment.status === "overdue" ? "destructive" : "outline"}
                  >
                    {payment.status === "paid" ? "Payé" : payment.status === "overdue" ? "En retard" : "À payer"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Messages & Events */}
        <GlassCard className="p-6" solid>
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h3 className="font-bold text-foreground">Messages</h3>
          </div>
          <div className="space-y-3 mb-6">
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

          <div className="flex items-center gap-2 mb-4">
            <Calendar className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-foreground">Événements à venir</h3>
          </div>
          <div className="space-y-3">
            {mockEvents.map((event, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="font-medium text-foreground">{event.title}</p>
                </div>
                <Badge variant="secondary">{event.date} à {event.time}</Badge>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
