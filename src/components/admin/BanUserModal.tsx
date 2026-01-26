import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Ban, Clock } from "lucide-react";
import { addDays, addHours, addWeeks, addMonths } from "date-fns";

interface BanUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  flaggedCount: number;
  onBanComplete: () => void;
}

const BAN_DURATIONS = [
  { value: "1h", label: "1 heure", fn: (date: Date) => addHours(date, 1) },
  { value: "24h", label: "24 heures", fn: (date: Date) => addHours(date, 24) },
  { value: "7d", label: "7 jours", fn: (date: Date) => addDays(date, 7) },
  { value: "30d", label: "30 jours", fn: (date: Date) => addMonths(date, 1) },
  { value: "90d", label: "3 mois", fn: (date: Date) => addMonths(date, 3) },
];

export const BanUserModal = ({
  isOpen,
  onClose,
  userId,
  userName,
  flaggedCount,
  onBanComplete,
}: BanUserModalProps) => {
  const [duration, setDuration] = useState("24h");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBan = async () => {
    if (!reason.trim()) {
      toast.error("Veuillez indiquer une raison pour le bannissement");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Non authentifié");

      const selectedDuration = BAN_DURATIONS.find((d) => d.value === duration);
      if (!selectedDuration) throw new Error("Durée invalide");

      const bannedUntil = selectedDuration.fn(new Date());

      const { error } = await supabase.from("user_bans").insert({
        user_id: userId,
        banned_by: user.id,
        ban_reason: reason.trim(),
        banned_until: bannedUntil.toISOString(),
      });

      if (error) throw error;

      toast.success(`${userName} a été banni jusqu'au ${bannedUntil.toLocaleDateString("fr-FR")}`);
      onBanComplete();
      onClose();
    } catch (error: any) {
      console.error("Erreur lors du bannissement:", error);
      toast.error("Erreur lors du bannissement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <Ban className="h-5 w-5" />
            Bannir temporairement
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-sm font-medium">{userName}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {flaggedCount} commentaire(s) signalé(s)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Durée du bannissement
            </Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BAN_DURATIONS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Raison du bannissement *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Expliquez la raison du bannissement..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Annuler
          </Button>
          <Button variant="destructive" onClick={handleBan} disabled={isSubmitting}>
            {isSubmitting ? "Bannissement..." : "Confirmer le bannissement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
