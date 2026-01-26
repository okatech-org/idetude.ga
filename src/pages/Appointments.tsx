import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserLayout } from "@/components/layout/UserLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarDays, Clock, Plus, User, MapPin, CheckCircle, XCircle, CalendarIcon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, isToday, isFuture, isPast } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface Appointment {
  id: string;
  parent_id: string;
  teacher_id: string;
  student_id: string | null;
  appointment_date: string;
  start_time: string;
  end_time: string;
  subject: string;
  notes: string | null;
  status: string;
  location: string | null;
  created_at: string;
  teacher?: Profile;
  parent?: Profile;
}

const Appointments = () => {
  const navigate = useNavigate();
  const { user, roles, isLoading } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [teachers, setTeachers] = useState<Profile[]>([]);
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [formData, setFormData] = useState({
    teacher_id: "",
    appointment_date: new Date(),
    start_time: "09:00",
    end_time: "09:30",
    subject: "",
    notes: "",
    location: "",
  });

  const isTeacher = roles.includes("teacher") || roles.includes("main_teacher");
  const isParent = roles.includes("parent_primary") || roles.includes("parent_secondary");

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/auth");
    }
  }, [user, isLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAppointments();
      if (isParent) {
        fetchTeachers();
      }
    }
  }, [user, isParent]);

  const fetchAppointments = async () => {
    if (!user) return;

    let query = supabase.from("appointments").select("*");

    if (isTeacher) {
      query = query.eq("teacher_id", user.id);
    } else if (isParent) {
      query = query.eq("parent_id", user.id);
    }

    const { data, error } = await query.order("appointment_date", { ascending: true });

    if (error) {
      console.error("Error fetching appointments:", error);
      return;
    }

    // Fetch related profiles
    const appointmentsWithProfiles = await Promise.all(
      (data || []).map(async (apt) => {
        const { data: teacher } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", apt.teacher_id)
          .single();
        const { data: parent } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", apt.parent_id)
          .single();
        return { ...apt, teacher, parent };
      })
    );

    setAppointments(appointmentsWithProfiles);
  };

  const fetchTeachers = async () => {
    // Fetch users with teacher role
    const { data: teacherRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .in("role", ["teacher", "main_teacher"]);

    if (rolesError || !teacherRoles) return;

    const teacherIds = teacherRoles.map((r) => r.user_id);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .in("id", teacherIds);

    if (error) {
      console.error("Error fetching teachers:", error);
      return;
    }

    setTeachers(data || []);
  };

  const handleCreateAppointment = async () => {
    if (!user || !formData.teacher_id || !formData.subject) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("appointments").insert({
      parent_id: user.id,
      teacher_id: formData.teacher_id,
      appointment_date: format(formData.appointment_date, "yyyy-MM-dd"),
      start_time: formData.start_time,
      end_time: formData.end_time,
      subject: formData.subject,
      notes: formData.notes || null,
      location: formData.location || null,
      status: "pending",
    });

    if (error) {
      console.error("Error creating appointment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer le rendez-vous",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rendez-vous créé",
      description: "Votre demande de rendez-vous a été envoyée",
    });

    setIsNewDialogOpen(false);
    setFormData({
      teacher_id: "",
      appointment_date: new Date(),
      start_time: "09:00",
      end_time: "09:30",
      subject: "",
      notes: "",
      location: "",
    });
    fetchAppointments();
  };

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    const { error } = await supabase
      .from("appointments")
      .update({ status })
      .eq("id", appointmentId);

    if (error) {
      console.error("Error updating appointment:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rendez-vous",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Rendez-vous mis à jour",
      description: `Le rendez-vous a été ${status === "confirmed" ? "confirmé" : "annulé"}`,
    });

    fetchAppointments();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500/10 text-green-600 border-green-500/20">Confirmé</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
      case "completed":
        return <Badge variant="secondary">Terminé</Badge>;
      default:
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">En attente</Badge>;
    }
  };

  const upcomingAppointments = appointments.filter(
    (a) => isFuture(new Date(a.appointment_date)) || isToday(new Date(a.appointment_date))
  );
  const pastAppointments = appointments.filter((a) => isPast(new Date(a.appointment_date)) && !isToday(new Date(a.appointment_date)));

  // Get dates with appointments for calendar
  const appointmentDates = appointments.map((a) => new Date(a.appointment_date));

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <UserLayout title="Rendez-vous">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarDays className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-muted-foreground">
              {isTeacher ? "Gérez vos rendez-vous avec les parents" : "Prenez rendez-vous avec les enseignants"}
            </p>
          </div>
        </div>

        {isParent && (
          <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouveau rendez-vous
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Demander un rendez-vous</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Enseignant *</Label>
                      <Select
                        value={formData.teacher_id}
                        onValueChange={(v) => setFormData({ ...formData, teacher_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez un enseignant" />
                        </SelectTrigger>
                        <SelectContent>
                          {teachers.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.first_name} {t.last_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.appointment_date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.appointment_date
                              ? format(formData.appointment_date, "PPP", { locale: fr })
                              : "Sélectionnez une date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.appointment_date}
                            onSelect={(d) => d && setFormData({ ...formData, appointment_date: d })}
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Heure de début *</Label>
                        <Select
                          value={formData.start_time}
                          onValueChange={(v) => setFormData({ ...formData, start_time: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 20 }, (_, i) => {
                              const hour = Math.floor(i / 2) + 8;
                              const min = (i % 2) * 30;
                              const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Heure de fin *</Label>
                        <Select
                          value={formData.end_time}
                          onValueChange={(v) => setFormData({ ...formData, end_time: v })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 20 }, (_, i) => {
                              const hour = Math.floor(i / 2) + 8;
                              const min = (i % 2) * 30;
                              const time = `${hour.toString().padStart(2, "0")}:${min.toString().padStart(2, "0")}`;
                              return (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              );
                            })}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Sujet *</Label>
                      <Input
                        placeholder="Ex: Discussion sur les résultats"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Lieu</Label>
                      <Input
                        placeholder="Ex: Bureau du professeur"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Notes</Label>
                      <Textarea
                        placeholder="Informations supplémentaires..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      />
                    </div>

                    <Button onClick={handleCreateAppointment} className="w-full">
                      Demander le rendez-vous
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Calendrier</CardTitle>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  modifiers={{
                    appointment: appointmentDates,
                  }}
                  modifiersStyles={{
                    appointment: {
                      fontWeight: "bold",
                      backgroundColor: "hsl(var(--primary) / 0.1)",
                      color: "hsl(var(--primary))",
                    },
                  }}
                  className="rounded-md border pointer-events-auto"
                />
              </CardContent>
            </Card>

            {/* Appointments List */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Rendez-vous à venir ({upcomingAppointments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      Aucun rendez-vous à venir
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {upcomingAppointments.map((apt) => (
                        <div
                          key={apt.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-semibold text-foreground">{apt.subject}</h3>
                                {getStatusBadge(apt.status)}
                              </div>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <CalendarDays className="h-4 w-4" />
                                  {format(new Date(apt.appointment_date), "dd MMMM yyyy", {
                                    locale: fr,
                                  })}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  {apt.start_time} - {apt.end_time}
                                </span>
                                {apt.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    {apt.location}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1 mt-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {isTeacher ? (
                                  <span>
                                    Parent: {apt.parent?.first_name} {apt.parent?.last_name}
                                  </span>
                                ) : (
                                  <span>
                                    Enseignant: {apt.teacher?.first_name} {apt.teacher?.last_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            {isTeacher && apt.status === "pending" && (
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Confirmer
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                                >
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Annuler
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Past Appointments */}
              {pastAppointments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg text-muted-foreground">
                      Rendez-vous passés ({pastAppointments.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 opacity-60">
                      {pastAppointments.slice(0, 5).map((apt) => (
                        <div key={apt.id} className="p-4 border rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-foreground">{apt.subject}</h3>
                            {getStatusBadge(apt.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(apt.appointment_date), "dd MMMM yyyy", { locale: fr })} •{" "}
                            {apt.start_time}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
      </div>
    </UserLayout>
  );
};

export default Appointments;
