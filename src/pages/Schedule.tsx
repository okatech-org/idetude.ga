import { useState } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Calendar, Plus, Clock, MapPin, BookOpen, Trash2 } from "lucide-react";

const DAYS = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const HOURS = Array.from({ length: 12 }, (_, i) => `${(i + 7).toString().padStart(2, "0")}:00`);

const SUBJECTS = [
  "Mathématiques",
  "Français",
  "Anglais",
  "Histoire-Géographie",
  "Sciences Physiques",
  "SVT",
  "Éducation Physique",
  "Arts Plastiques",
  "Musique",
  "Philosophie",
  "Économie",
  "Informatique",
];

interface ScheduleItem {
  id: string;
  teacher_id: string;
  class_name: string;
  subject: string;
  room: string | null;
  day_of_week: number;
  start_time: string;
  end_time: string;
  school_year: string;
}

export default function Schedule() {
  const { user, roles } = useAuth();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  
  const [newClass, setNewClass] = useState({
    class_name: "",
    subject: "",
    room: "",
    day_of_week: "1",
    start_time: "08:00",
    end_time: "09:00",
  });

  const isTeacher = roles.some(r => ["teacher", "main_teacher", "super_admin"].includes(r));
  const currentYear = new Date().getFullYear();
  const schoolYear = `${currentYear}-${currentYear + 1}`;

  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ["schedules", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("schedules")
        .select("*")
        .order("start_time");
      
      if (error) throw error;
      return data as ScheduleItem[];
    },
    enabled: !!user,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("schedules").insert({
        teacher_id: user!.id,
        class_name: newClass.class_name,
        subject: newClass.subject,
        room: newClass.room || null,
        day_of_week: parseInt(newClass.day_of_week),
        start_time: newClass.start_time,
        end_time: newClass.end_time,
        school_year: schoolYear,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Cours ajouté avec succès");
      setIsAddOpen(false);
      setNewClass({
        class_name: "",
        subject: "",
        room: "",
        day_of_week: "1",
        start_time: "08:00",
        end_time: "09:00",
      });
    },
    onError: () => toast.error("Erreur lors de l'ajout du cours"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("schedules").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      toast.success("Cours supprimé");
    },
    onError: () => toast.error("Erreur lors de la suppression"),
  });

  const getScheduleForDayAndTime = (day: number, hour: string) => {
    return schedules.filter(s => {
      const startHour = s.start_time.substring(0, 5);
      return s.day_of_week === day && startHour === hour;
    });
  };

  const getDaySchedule = (day: number) => {
    return schedules
      .filter(s => s.day_of_week === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  return (
    <UserLayout title="Emploi du temps">

        {/* Actions */}
        {isTeacher && (
          <div className="flex justify-end mb-6">
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un cours
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nouveau cours</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Classe</Label>
                      <Input
                        placeholder="Ex: 3ème A"
                        value={newClass.class_name}
                        onChange={(e) =>
                          setNewClass({ ...newClass, class_name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Salle</Label>
                      <Input
                        placeholder="Ex: Salle 102"
                        value={newClass.room}
                        onChange={(e) =>
                          setNewClass({ ...newClass, room: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Matière</Label>
                    <Select
                      value={newClass.subject}
                      onValueChange={(v) => setNewClass({ ...newClass, subject: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une matière" />
                      </SelectTrigger>
                      <SelectContent>
                        {SUBJECTS.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Jour</Label>
                    <Select
                      value={newClass.day_of_week}
                      onValueChange={(v) => setNewClass({ ...newClass, day_of_week: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DAYS.slice(1, 6).map((day, idx) => (
                          <SelectItem key={day} value={(idx + 1).toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Heure de début</Label>
                      <Select
                        value={newClass.start_time}
                        onValueChange={(v) => setNewClass({ ...newClass, start_time: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Heure de fin</Label>
                      <Select
                        value={newClass.end_time}
                        onValueChange={(v) => setNewClass({ ...newClass, end_time: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map((h) => (
                            <SelectItem key={h} value={h}>
                              {h}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    className="w-full"
                    onClick={() => addMutation.mutate()}
                    disabled={!newClass.class_name || !newClass.subject || addMutation.isPending}
                  >
                    {addMutation.isPending ? "Ajout..." : "Ajouter le cours"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}

        {/* Day Selector (Mobile) */}
        <div className="md:hidden mb-4">
          <Select
            value={selectedDay.toString()}
            onValueChange={(v) => setSelectedDay(parseInt(v))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DAYS.slice(1, 6).map((day, idx) => (
                <SelectItem key={day} value={(idx + 1).toString()}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Mobile View */}
        <div className="md:hidden space-y-3">
          {getDaySchedule(selectedDay).length === 0 ? (
            <GlassCard className="p-6 text-center" solid>
              <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
              <p className="text-muted-foreground">Aucun cours ce jour</p>
            </GlassCard>
          ) : (
            getDaySchedule(selectedDay).map((schedule) => (
              <GlassCard key={schedule.id} className="p-4" solid>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary">{schedule.subject}</Badge>
                    </div>
                    <p className="font-medium">{schedule.class_name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {schedule.start_time.substring(0, 5)} - {schedule.end_time.substring(0, 5)}
                      </span>
                      {schedule.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {schedule.room}
                        </span>
                      )}
                    </div>
                  </div>
                  {isTeacher && schedule.teacher_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(schedule.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </GlassCard>
            ))
          )}
        </div>

        {/* Desktop Calendar View */}
        <div className="hidden md:block overflow-x-auto">
          <GlassCard className="p-4" solid>
            <table className="w-full">
              <thead>
                <tr>
                  <th className="w-20 p-2 text-left text-muted-foreground text-sm font-medium">
                    Heure
                  </th>
                  {DAYS.slice(1, 6).map((day) => (
                    <th
                      key={day}
                      className="p-2 text-center text-sm font-medium border-l border-border"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour} className="border-t border-border">
                    <td className="p-2 text-sm text-muted-foreground align-top">
                      {hour}
                    </td>
                    {[1, 2, 3, 4, 5].map((day) => {
                      const classes = getScheduleForDayAndTime(day, hour);
                      return (
                        <td
                          key={day}
                          className="p-1 border-l border-border align-top min-h-[60px]"
                        >
                          {classes.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="bg-primary/10 rounded-lg p-2 mb-1 group relative"
                            >
                              <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="text-xs">
                                  {schedule.subject}
                                </Badge>
                                {isTeacher && schedule.teacher_id === user?.id && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => deleteMutation.mutate(schedule.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                )}
                              </div>
                              <p className="text-sm font-medium mt-1">{schedule.class_name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                {schedule.start_time.substring(0, 5)} -{" "}
                                {schedule.end_time.substring(0, 5)}
                              </div>
                              {schedule.room && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <MapPin className="h-3 w-3" />
                                  {schedule.room}
                                </div>
                              )}
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </GlassCard>
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          </div>
        )}
    </UserLayout>
  );
}
