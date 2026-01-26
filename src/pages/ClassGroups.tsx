import { useState, useEffect, useRef } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Send,
  Pin,
  AlertTriangle,
  MoreVertical,
  MessageSquare,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface ClassGroup {
  id: string;
  name: string;
  description: string | null;
  class_name: string;
  teacher_id: string;
  is_active: boolean;
  created_at: string;
}

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  content: string;
  is_pinned: boolean;
  is_moderated: boolean;
  created_at: string;
  sender?: {
    first_name: string;
    last_name: string;
  };
}

const ClassGroups = () => {
  const { user, roles } = useAuth();
  const [groups, setGroups] = useState<ClassGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ClassGroup | null>(null);
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: "", description: "", class_name: "" });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isTeacher = roles.some(r => ["teacher", "main_teacher", "super_admin", "school_director"].includes(r));

  useEffect(() => {
    if (user) {
      fetchGroups();
    }
  }, [user]);

  useEffect(() => {
    if (selectedGroup) {
      fetchMessages(selectedGroup.id);
      subscribeToMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("class_groups")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGroups(data || []);
      if (data && data.length > 0 && !selectedGroup) {
        setSelectedGroup(data[0]);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from("group_messages")
        .select(`
          *,
          sender:profiles!group_messages_sender_id_fkey(first_name, last_name)
        `)
        .eq("group_id", groupId)
        .eq("is_moderated", false)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const subscribeToMessages = (groupId: string) => {
    const channel = supabase
      .channel(`group-messages-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        async (payload) => {
          const { data: senderData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", (payload.new as GroupMessage).sender_id)
            .single();

          const newMsg = {
            ...payload.new as GroupMessage,
            sender: senderData,
          };
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleCreateGroup = async () => {
    if (!user || !newGroup.name || !newGroup.class_name) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    try {
      const { error } = await supabase.from("class_groups").insert({
        name: newGroup.name,
        description: newGroup.description || null,
        class_name: newGroup.class_name,
        teacher_id: user.id,
      });

      if (error) throw error;

      toast.success("Groupe créé avec succès");
      setIsCreateOpen(false);
      setNewGroup({ name: "", description: "", class_name: "" });
      fetchGroups();
    } catch (error) {
      console.error("Error creating group:", error);
      toast.error("Erreur lors de la création du groupe");
    }
  };

  const handleSendMessage = async () => {
    if (!user || !selectedGroup || !newMessage.trim()) return;

    try {
      const { error } = await supabase.from("group_messages").insert({
        group_id: selectedGroup.id,
        sender_id: user.id,
        content: newMessage.trim(),
      });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Erreur lors de l'envoi du message");
    }
  };

  const handlePinMessage = async (messageId: string, isPinned: boolean) => {
    try {
      const { error } = await supabase
        .from("group_messages")
        .update({ is_pinned: !isPinned })
        .eq("id", messageId);

      if (error) throw error;
      fetchMessages(selectedGroup!.id);
      toast.success(isPinned ? "Message désépinglé" : "Message épinglé");
    } catch (error) {
      console.error("Error pinning message:", error);
    }
  };

  const handleModerateMessage = async (messageId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("group_messages")
        .update({
          is_moderated: true,
          moderated_by: user.id,
          moderated_at: new Date().toISOString(),
        })
        .eq("id", messageId);

      if (error) throw error;
      fetchMessages(selectedGroup!.id);
      toast.success("Message modéré");
    } catch (error) {
      console.error("Error moderating message:", error);
    }
  };

  if (!user) {
    return (
      <UserLayout title="Groupes de discussion">
        <GlassCard className="p-8 text-center">
          <p>Veuillez vous connecter pour accéder aux groupes de discussion.</p>
        </GlassCard>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Groupes de discussion">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Groupes de discussion</h1>
            <p className="text-muted-foreground mt-1">
              Communication avec votre classe
            </p>
          </div>

          {isTeacher && (
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <GlassButton>
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un groupe
                </GlassButton>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un groupe de discussion</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Nom du groupe *</Label>
                    <GlassInput
                      value={newGroup.name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Ex: Discussion Mathématiques"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Classe *</Label>
                    <GlassInput
                      value={newGroup.class_name}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, class_name: e.target.value }))}
                      placeholder="Ex: 3ème A"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={newGroup.description}
                      onChange={(e) => setNewGroup(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Description du groupe..."
                      className="mt-1"
                    />
                  </div>
                  <GlassButton onClick={handleCreateGroup} className="w-full">
                    Créer le groupe
                  </GlassButton>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Groups List */}
          <div className="lg:col-span-1 space-y-2">
            <h3 className="font-semibold mb-3">Mes groupes</h3>
            {isLoading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : groups.length === 0 ? (
              <GlassCard className="p-4 text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Aucun groupe</p>
              </GlassCard>
            ) : (
              groups.map((group) => (
                <GlassCard
                  key={group.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedGroup?.id === group.id
                      ? "border-primary bg-primary/5"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedGroup(group)}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{group.name}</p>
                      <p className="text-xs text-muted-foreground">{group.class_name}</p>
                    </div>
                  </div>
                </GlassCard>
              ))
            )}
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedGroup ? (
              <GlassCard className="flex flex-col h-[600px]">
                {/* Header */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{selectedGroup.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedGroup.class_name}</p>
                    </div>
                    <Badge variant="secondary">
                      <Users className="h-3 w-3 mr-1" />
                      Groupe
                    </Badge>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Aucun message dans ce groupe</p>
                      <p className="text-sm">Soyez le premier à écrire !</p>
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwn = message.sender_id === user.id;
                      const canModerate = isTeacher && selectedGroup.teacher_id === user.id && !isOwn;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg p-3 ${
                              isOwn
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                            } ${message.is_pinned ? "border-2 border-amber-500" : ""}`}
                          >
                            {!isOwn && (
                              <p className="text-xs font-medium mb-1 opacity-80">
                                {message.sender?.first_name} {message.sender?.last_name}
                              </p>
                            )}
                            <p className="text-sm">{message.content}</p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs opacity-70">
                                {formatDistanceToNow(new Date(message.created_at), {
                                  addSuffix: true,
                                  locale: fr,
                                })}
                              </span>
                              {(canModerate || message.is_pinned) && (
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    {canModerate && (
                                      <>
                                        <DropdownMenuItem
                                          onClick={() => handlePinMessage(message.id, message.is_pinned)}
                                        >
                                          <Pin className="h-4 w-4 mr-2" />
                                          {message.is_pinned ? "Désépingler" : "Épingler"}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          onClick={() => handleModerateMessage(message.id)}
                                          className="text-destructive"
                                        >
                                          <AlertTriangle className="h-4 w-4 mr-2" />
                                          Modérer
                                        </DropdownMenuItem>
                                      </>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <GlassInput
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Écrivez votre message..."
                      onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                      className="flex-1"
                    />
                    <GlassButton onClick={handleSendMessage} disabled={!newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </GlassButton>
                  </div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard className="h-[600px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez un groupe pour commencer</p>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
    </UserLayout>
  );
};

export default ClassGroups;
