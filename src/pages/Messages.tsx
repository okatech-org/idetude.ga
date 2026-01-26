import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Mail,
  Send,
  Inbox,
  SendHorizontal,
  Reply,
  Trash2,
  Search,
  Plus,
  User,
  Clock,
  Check,
  CheckCheck,
} from "lucide-react";

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  is_read: boolean;
  parent_message_id: string | null;
  created_at: string;
  sender?: { first_name: string; last_name: string; email: string };
  recipient?: { first_name: string; last_name: string; email: string };
}

interface Profile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const Messages = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"inbox" | "sent">("inbox");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  
  // Compose form state
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [replyTo, setReplyTo] = useState<Message | null>(null);

  useEffect(() => {
    if (user) {
      fetchMessages();
      fetchProfiles();
      
      // Subscribe to realtime updates
      const channel = supabase
        .channel('messages-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'messages',
          },
          () => {
            fetchMessages();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch sender and recipient profiles
      const userIds = new Set<string>();
      data?.forEach((msg) => {
        userIds.add(msg.sender_id);
        userIds.add(msg.recipient_id);
      });

      const { data: profilesData } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", Array.from(userIds));

      const profilesMap = new Map(profilesData?.map((p) => [p.id, p]));

      const messagesWithProfiles = data?.map((msg) => ({
        ...msg,
        sender: profilesMap.get(msg.sender_id),
        recipient: profilesMap.get(msg.recipient_id),
      })) || [];

      setMessages(messagesWithProfiles);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .neq("id", user?.id || "");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !recipientId || !subject.trim() || !content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setIsSending(true);
    try {
      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        recipient_id: recipientId,
        subject: subject.trim(),
        content: content.trim(),
        parent_message_id: replyTo?.id || null,
      });

      if (error) throw error;

      toast({
        title: "Message envoyé",
        description: "Votre message a été envoyé avec succès",
      });

      setShowComposeModal(false);
      resetComposeForm();
      fetchMessages();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      await supabase
        .from("messages")
        .update({ is_read: true })
        .eq("id", messageId);
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  };

  const handleReply = (message: Message) => {
    setReplyTo(message);
    setRecipientId(message.sender_id);
    setSubject(`Re: ${message.subject}`);
    setContent("");
    setShowViewModal(false);
    setShowComposeModal(true);
  };

  const resetComposeForm = () => {
    setRecipientId("");
    setSubject("");
    setContent("");
    setReplyTo(null);
  };

  const openMessage = (message: Message) => {
    setSelectedMessage(message);
    setShowViewModal(true);
    if (!message.is_read && message.recipient_id === user?.id) {
      handleMarkAsRead(message.id);
    }
  };

  const filteredMessages = messages.filter((msg) => {
    const isInbox = activeTab === "inbox" ? msg.recipient_id === user?.id : msg.sender_id === user?.id;
    const matchesSearch = 
      msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.sender?.last_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return isInbox && matchesSearch;
  });

  const unreadCount = messages.filter(
    (msg) => msg.recipient_id === user?.id && !msg.is_read
  ).length;

  if (authLoading) {
    return null; // UserLayout handles loading
  }

  if (!user) return null;

  return (
    <UserLayout title="Messagerie">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-foreground">Messagerie</h1>
                <p className="text-sm text-muted-foreground">
                  {unreadCount > 0 ? `${unreadCount} message(s) non lu(s)` : "Tous les messages sont lus"}
                </p>
              </div>
            </div>
            <GlassButton onClick={() => { resetComposeForm(); setShowComposeModal(true); }}>
              <Plus className="h-4 w-4" />
              Nouveau message
            </GlassButton>
          </div>

          {/* Tabs and Search */}
          <GlassCard className="p-4" solid>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2">
                <GlassButton
                  variant={activeTab === "inbox" ? "primary" : "outline"}
                  onClick={() => setActiveTab("inbox")}
                >
                  <Inbox className="h-4 w-4" />
                  Boîte de réception
                  {unreadCount > 0 && (
                    <Badge variant="destructive" className="ml-2">{unreadCount}</Badge>
                  )}
                </GlassButton>
                <GlassButton
                  variant={activeTab === "sent" ? "primary" : "outline"}
                  onClick={() => setActiveTab("sent")}
                >
                  <SendHorizontal className="h-4 w-4" />
                  Envoyés
                </GlassButton>
              </div>
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <GlassInput
                  placeholder="Rechercher un message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </GlassCard>

          {/* Messages List */}
          <GlassCard className="p-4" solid>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Mail className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Aucun message</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMessages.map((message) => {
                  const otherPerson = activeTab === "inbox" ? message.sender : message.recipient;
                  return (
                    <div
                      key={message.id}
                      onClick={() => openMessage(message)}
                      className={`p-4 rounded-xl cursor-pointer transition-all hover:bg-muted/50 ${
                        !message.is_read && activeTab === "inbox"
                          ? "bg-primary/5 border-l-4 border-primary"
                          : "bg-muted/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`font-medium truncate ${!message.is_read && activeTab === "inbox" ? "text-foreground" : "text-muted-foreground"}`}>
                              {otherPerson?.first_name} {otherPerson?.last_name}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Clock className="h-3 w-3" />
                              {new Date(message.created_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                          <p className={`text-sm truncate ${!message.is_read && activeTab === "inbox" ? "font-semibold text-foreground" : "text-muted-foreground"}`}>
                            {message.subject}
                          </p>
                          <p className="text-xs text-muted-foreground truncate mt-1">
                            {message.content}
                          </p>
                        </div>
                        {activeTab === "sent" && (
                          <div className="flex-shrink-0">
                            {message.is_read ? (
                              <CheckCheck className="h-4 w-4 text-primary" />
                            ) : (
                              <Check className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

      {/* Compose Modal */}
      <Dialog open={showComposeModal} onOpenChange={setShowComposeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              {replyTo ? "Répondre au message" : "Nouveau message"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Destinataire
              </label>
              <Select value={recipientId} onValueChange={setRecipientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un destinataire" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.id} value={profile.id}>
                      {profile.first_name} {profile.last_name} ({profile.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Sujet
              </label>
              <GlassInput
                placeholder="Sujet du message"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Message
              </label>
              <Textarea
                placeholder="Écrivez votre message..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                className="bg-background/50 border-border/50"
              />
            </div>
            <div className="flex justify-end gap-2">
              <GlassButton variant="outline" onClick={() => setShowComposeModal(false)}>
                Annuler
              </GlassButton>
              <GlassButton onClick={handleSendMessage} disabled={isSending}>
                {isSending ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer
                  </>
                )}
              </GlassButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Message Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          {selectedMessage && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMessage.subject}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {selectedMessage.sender?.first_name} {selectedMessage.sender?.last_name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedMessage.sender?.email}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(selectedMessage.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/20 min-h-[200px] whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
                <div className="flex justify-end gap-2">
                  {selectedMessage.sender_id !== user?.id && (
                    <GlassButton onClick={() => handleReply(selectedMessage)}>
                      <Reply className="h-4 w-4" />
                      Répondre
                    </GlassButton>
                  )}
                  <GlassButton variant="outline" onClick={() => setShowViewModal(false)}>
                    Fermer
                  </GlassButton>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
};

export default Messages;
