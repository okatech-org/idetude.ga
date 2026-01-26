import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User, Briefcase, X } from "lucide-react";

interface Position {
  id: string;
  department_id: string;
  name: string;
  code: string | null;
  description: string | null;
  is_head: boolean;
  order_index: number;
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface UserPosition {
  id: string;
  user_id: string;
  position_id: string;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  notes: string | null;
  profiles?: {
    id?: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface AssignUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: Position | null;
  currentAssignments: UserPosition[];
  onSuccess: () => void;
}

export const AssignUserModal = ({ 
  isOpen, 
  onClose, 
  position, 
  currentAssignments,
  onSuccess 
}: AssignUserModalProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
    }
  }, [isOpen]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .order("last_name");
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
      toast.error("Erreur lors du chargement des profils");
    }
  };

  const handleAssign = async () => {
    if (!position || !selectedUserId) {
      toast.error("Veuillez sélectionner un utilisateur");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("user_positions").insert({
        user_id: selectedUserId,
        position_id: position.id,
        start_date: startDate,
        is_active: true,
        notes: notes || null,
      });

      if (error) throw error;

      toast.success("Utilisateur affecté au poste");
      resetForm();
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error assigning user:", error);
      toast.error("Erreur lors de l'affectation");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string) => {
    if (!confirm("Retirer cette affectation ?")) return;

    try {
      const { error } = await supabase
        .from("user_positions")
        .update({ is_active: false, end_date: new Date().toISOString() })
        .eq("id", assignmentId);

      if (error) throw error;

      toast.success("Affectation retirée");
      onSuccess();
    } catch (error) {
      console.error("Error removing assignment:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const resetForm = () => {
    setSelectedUserId("");
    setStartDate(new Date().toISOString().split('T')[0]);
    setNotes("");
  };

  // Filter out already assigned users
  const assignedUserIds = new Set(currentAssignments.map(a => a.user_id));
  const availableProfiles = profiles.filter(p => !assignedUserIds.has(p.id));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            Affecter au poste : {position?.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Current assignments */}
          {currentAssignments.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">Affectations actuelles</Label>
              <div className="space-y-2">
                {currentAssignments.map(assignment => (
                  <div 
                    key={assignment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {assignment.profiles?.first_name} {assignment.profiles?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {assignment.profiles?.email}
                        </p>
                      </div>
                    </div>
                    <GlassButton
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveAssignment(assignment.id)}
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </GlassButton>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New assignment form */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <Label className="text-sm font-medium">Nouvelle affectation</Label>
            
            <div className="space-y-2">
              <Label>Utilisateur *</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un utilisateur" />
                </SelectTrigger>
                <SelectContent>
                  {availableProfiles.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Aucun utilisateur disponible
                    </div>
                  ) : (
                    availableProfiles.map(profile => (
                      <SelectItem key={profile.id} value={profile.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{profile.first_name} {profile.last_name}</span>
                          <span className="text-muted-foreground">({profile.email})</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date de début *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes supplémentaires..."
                rows={2}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <GlassButton variant="outline" onClick={onClose}>
            Fermer
          </GlassButton>
          <GlassButton 
            variant="primary" 
            onClick={handleAssign}
            disabled={loading || !selectedUserId}
          >
            {loading ? "Affectation..." : "Affecter"}
          </GlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
