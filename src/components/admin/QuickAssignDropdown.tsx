import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, X, User, Loader2 } from "lucide-react";

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
  profiles?: {
    first_name: string;
    last_name: string;
    email: string;
  };
}

interface QuickAssignDropdownProps {
  positionId: string;
  positionName: string;
  currentAssignments: UserPosition[];
  onSuccess: () => void;
}

export const QuickAssignDropdown = ({
  positionId,
  positionName,
  currentAssignments,
  onSuccess,
}: QuickAssignDropdownProps) => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen && profiles.length === 0) {
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
    }
  };

  const handleAssign = async () => {
    if (!selectedUserId) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("user_positions").insert({
        user_id: selectedUserId,
        position_id: positionId,
        start_date: new Date().toISOString().split("T")[0],
        is_active: true,
      });

      if (error) throw error;

      toast.success(`Utilisateur affecté au poste "${positionName}"`);
      setSelectedUserId("");
      setIsOpen(false);
      onSuccess();
    } catch (error: any) {
      console.error("Error assigning user:", error);
      if (error.code === "23505") {
        toast.error("Cet utilisateur est déjà affecté à ce poste");
      } else {
        toast.error("Erreur lors de l'affectation");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (assignmentId: string, userName: string) => {
    if (!confirm(`Retirer ${userName} de ce poste ?`)) return;

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

  const assignedUserIds = new Set(currentAssignments.map((a) => a.user_id));
  const availableProfiles = profiles.filter((p) => !assignedUserIds.has(p.id));

  return (
    <div className="space-y-2">
      {/* Current assignments */}
      {currentAssignments.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {currentAssignments.map((up) => (
            <Badge
              key={up.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <User className="h-3 w-3" />
              <span className="max-w-[100px] truncate">
                {up.profiles?.first_name} {up.profiles?.last_name}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemove(
                    up.id,
                    `${up.profiles?.first_name} ${up.profiles?.last_name}`
                  );
                }}
                className="ml-1 p-0.5 hover:bg-destructive/20 rounded-full transition-colors"
              >
                <X className="h-3 w-3 text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Quick assign dropdown */}
      <div className="flex items-center gap-2">
        <Select
          value={selectedUserId}
          onValueChange={setSelectedUserId}
          open={isOpen}
          onOpenChange={setIsOpen}
        >
          <SelectTrigger className="h-8 text-xs flex-1">
            <SelectValue placeholder="Affecter..." />
          </SelectTrigger>
          <SelectContent className="z-[9999]">
            {availableProfiles.length === 0 ? (
              <div className="p-2 text-sm text-muted-foreground text-center">
                {profiles.length === 0 ? "Chargement..." : "Aucun utilisateur disponible"}
              </div>
            ) : (
              availableProfiles.map((profile) => (
                <SelectItem key={profile.id} value={profile.id}>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    <span className="truncate">
                      {profile.first_name} {profile.last_name}
                    </span>
                  </div>
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>

        {selectedUserId && (
          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleAssign}
            disabled={loading}
            className="h-8 px-2"
          >
            {loading ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <UserPlus className="h-3 w-3" />
            )}
          </GlassButton>
        )}
      </div>
    </div>
  );
};
