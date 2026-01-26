import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  Bell,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

interface SchoolEvent {
  id: string;
  title: string;
  description: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  all_day: boolean;
  location: string | null;
  target_audience: string;
  created_by: string;
  color: string;
  created_at: string;
}

const eventTypeLabels: Record<string, string> = {
  general: "Général",
  exam: "Examen",
  meeting: "Réunion",
  holiday: "Vacances",
  deadline: "Échéance",
  activity: "Activité",
};

const eventTypeColors: Record<string, string> = {
  general: "#3b82f6",
  exam: "#ef4444",
  meeting: "#8b5cf6",
  holiday: "#10b981",
  deadline: "#f59e0b",
  activity: "#ec4899",
};

const audienceLabels: Record<string, string> = {
  all: "Tous",
  students: "Élèves",
  teachers: "Enseignants",
  parents: "Parents",
};

const SchoolCalendar = () => {
  const { user, roles } = useAuth();
  const [events, setEvents] = useState<SchoolEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SchoolEvent | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    event_type: "general",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    all_day: false,
    location: "",
    target_audience: "all",
  });

  const canCreateEvents = roles.some(r => 
    ["super_admin", "school_director", "school_admin", "teacher", "main_teacher"].includes(r)
  );

  useEffect(() => {
    fetchEvents();
  }, [currentMonth]);

  const fetchEvents = async () => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    try {
      const { data, error } = await supabase
        .from("school_events")
        .select("*")
        .gte("start_date", start.toISOString())
        .lte("start_date", end.toISOString())
        .order("start_date", { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async () => {
    if (!user || !newEvent.title || !newEvent.start_date) {
      toast.error("Veuillez remplir les champs requis");
      return;
    }

    try {
      const startDateTime = newEvent.all_day 
        ? new Date(newEvent.start_date).toISOString()
        : new Date(`${newEvent.start_date}T${newEvent.start_time || "00:00"}`).toISOString();

      const endDateTime = newEvent.end_date 
        ? (newEvent.all_day 
            ? new Date(newEvent.end_date).toISOString()
            : new Date(`${newEvent.end_date}T${newEvent.end_time || "23:59"}`).toISOString())
        : null;

      const { error } = await supabase.from("school_events").insert({
        title: newEvent.title,
        description: newEvent.description || null,
        event_type: newEvent.event_type,
        start_date: startDateTime,
        end_date: endDateTime,
        all_day: newEvent.all_day,
        location: newEvent.location || null,
        target_audience: newEvent.target_audience,
        created_by: user.id,
        color: eventTypeColors[newEvent.event_type],
      });

      if (error) throw error;

      toast.success("Événement créé avec succès");
      setIsCreateOpen(false);
      setNewEvent({
        title: "",
        description: "",
        event_type: "general",
        start_date: "",
        start_time: "",
        end_date: "",
        end_time: "",
        all_day: false,
        location: "",
        target_audience: "all",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Erreur lors de la création de l'événement");
    }
  };

  const handleSetReminder = async (event: SchoolEvent) => {
    if (!user) return;

    try {
      const remindAt = new Date(event.start_date);
      remindAt.setHours(remindAt.getHours() - 24);

      const { error } = await supabase.from("event_reminders").insert({
        event_id: event.id,
        user_id: user.id,
        remind_at: remindAt.toISOString(),
      });

      if (error) throw error;
      toast.success("Rappel configuré pour 24h avant l'événement");
    } catch (error: any) {
      if (error.code === "23505") {
        toast.info("Un rappel existe déjà pour cet événement");
      } else {
        console.error("Error setting reminder:", error);
        toast.error("Erreur lors de la configuration du rappel");
      }
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter((event) => isSameDay(new Date(event.start_date), day));
  };

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedDayEvents = getEventsForDay(selectedDate);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Calendrier scolaire</h1>
            <p className="text-muted-foreground mt-1">
              Événements et échéances de l'établissement
            </p>
          </div>

          {canCreateEvents && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <GlassButton>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un événement
                </GlassButton>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Nouvel événement</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  <div>
                    <Label>Titre *</Label>
                    <GlassInput
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Titre de l'événement"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type d'événement</Label>
                      <Select
                        value={newEvent.event_type}
                        onValueChange={(value) => setNewEvent(prev => ({ ...prev, event_type: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(eventTypeLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Public cible</Label>
                      <Select
                        value={newEvent.target_audience}
                        onValueChange={(value) => setNewEvent(prev => ({ ...prev, target_audience: value }))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(audienceLabels).map(([value, label]) => (
                            <SelectItem key={value} value={value}>{label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={newEvent.all_day}
                      onCheckedChange={(checked) => setNewEvent(prev => ({ ...prev, all_day: checked }))}
                    />
                    <Label>Journée entière</Label>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de début *</Label>
                      <GlassInput
                        type="date"
                        value={newEvent.start_date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    {!newEvent.all_day && (
                      <div>
                        <Label>Heure de début</Label>
                        <GlassInput
                          type="time"
                          value={newEvent.start_time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Date de fin</Label>
                      <GlassInput
                        type="date"
                        value={newEvent.end_date}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, end_date: e.target.value }))}
                        className="mt-1"
                      />
                    </div>
                    {!newEvent.all_day && (
                      <div>
                        <Label>Heure de fin</Label>
                        <GlassInput
                          type="time"
                          value={newEvent.end_time}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, end_time: e.target.value }))}
                          className="mt-1"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Lieu</Label>
                    <GlassInput
                      value={newEvent.location}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                      placeholder="Lieu de l'événement"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description de l'événement..."
                      className="mt-1"
                    />
                  </div>

                  <GlassButton onClick={handleCreateEvent} className="w-full">
                    Créer l'événement
                  </GlassButton>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-xl font-semibold">
                  {format(currentMonth, "MMMM yyyy", { locale: fr })}
                </h2>
                <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              {/* Days Header */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() || 7 - 1)
                  .fill(null)
                  .map((_, i) => (
                    <div key={`empty-${i}`} className="aspect-square" />
                  ))}
                {daysInMonth.map((day) => {
                  const dayEvents = getEventsForDay(day);
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={`aspect-square p-1 rounded-lg transition-colors relative ${
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : isToday
                          ? "bg-primary/20"
                          : "hover:bg-muted"
                      }`}
                    >
                      <span className="text-sm">{format(day, "d")}</span>
                      {dayEvents.length > 0 && (
                        <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {dayEvents.slice(0, 3).map((event) => (
                            <div
                              key={event.id}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: event.color }}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </GlassCard>
          </div>

          {/* Events Sidebar */}
          <div className="space-y-4">
            <GlassCard className="p-4">
              <h3 className="font-semibold mb-3">
                {format(selectedDate, "EEEE d MMMM", { locale: fr })}
              </h3>
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-6 text-muted-foreground">
                  <CalendarIcon className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Aucun événement ce jour</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDayEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-3 rounded-lg border border-border/50"
                      style={{ borderLeftColor: event.color, borderLeftWidth: 4 }}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <Badge variant="secondary" className="mt-1 text-xs">
                            {eventTypeLabels[event.event_type]}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleSetReminder(event)}
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      </div>
                      {!event.all_day && (
                        <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.start_date), "HH:mm")}
                          {event.end_date && ` - ${format(new Date(event.end_date), "HH:mm")}`}
                        </p>
                      )}
                      {event.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </p>
                      )}
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {audienceLabels[event.target_audience]}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Upcoming Events */}
            <GlassCard className="p-4">
              <h3 className="font-semibold mb-3">Prochains événements</h3>
              <div className="space-y-2">
                {events
                  .filter((e) => new Date(e.start_date) >= new Date())
                  .slice(0, 5)
                  .map((event) => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelectedDate(new Date(event.start_date))}
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: event.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(event.start_date), "d MMM", { locale: fr })}
                        </p>
                      </div>
                    </div>
                  ))}
                {events.filter((e) => new Date(e.start_date) >= new Date()).length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun événement à venir
                  </p>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SchoolCalendar;
