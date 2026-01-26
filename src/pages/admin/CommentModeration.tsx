import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Shield,
  Flag,
  Eye,
  EyeOff,
  CheckCircle,
  Search,
  ArrowLeft,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  FileText,
  Loader2,
  RefreshCw,
  BarChart3,
  Ban,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ModerationStats } from "@/components/admin/ModerationStats";
import { BanUserModal } from "@/components/admin/BanUserModal";

interface FlaggedComment {
  id: string;
  content: string;
  created_at: string;
  is_flagged: boolean;
  flag_reason: string | null;
  flagged_at: string | null;
  is_hidden: boolean;
  hidden_at: string | null;
  resource_id: string;
  user_id: string;
  parent_id: string | null;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
  flagged_by_user: {
    first_name: string;
    last_name: string;
  } | null;
  hidden_by_user: {
    first_name: string;
    last_name: string;
  } | null;
  resource: {
    title: string;
    subject: string;
  } | null;
}

type ActionType = "hide" | "restore" | "dismiss";

const CommentModeration = () => {
  const navigate = useNavigate();
  const { user, roles, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [activeTab, setActiveTab] = useState("comments");
  const [confirmAction, setConfirmAction] = useState<{
    type: ActionType;
    ids: string[];
  } | null>(null);
  const [banModalData, setBanModalData] = useState<{
    userId: string;
    userName: string;
    flaggedCount: number;
  } | null>(null);

  const isAdmin = roles.includes("super_admin") || roles.includes("school_admin");

  // Fetch all flagged or hidden comments
  const { data: comments = [], isLoading, refetch } = useQuery({
    queryKey: ["flagged-comments", statusFilter],
    queryFn: async () => {
      let query = supabase
        .from("resource_comments")
        .select(`
          id,
          content,
          created_at,
          is_flagged,
          flag_reason,
          flagged_at,
          is_hidden,
          hidden_at,
          resource_id,
          user_id,
          parent_id,
          flagged_by,
          hidden_by
        `)
        .order("flagged_at", { ascending: false, nullsFirst: false });

      if (statusFilter === "flagged") {
        query = query.eq("is_flagged", true).eq("is_hidden", false);
      } else if (statusFilter === "hidden") {
        query = query.eq("is_hidden", true);
      } else if (statusFilter === "all") {
        query = query.or("is_flagged.eq.true,is_hidden.eq.true");
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch related data
      const userIds = [...new Set(data?.flatMap(c => [c.user_id, c.flagged_by, c.hidden_by].filter(Boolean)) || [])];
      const resourceIds = [...new Set(data?.map(c => c.resource_id) || [])];

      const [usersRes, resourcesRes] = await Promise.all([
        userIds.length > 0
          ? supabase.from("profiles").select("id, first_name, last_name, email").in("id", userIds)
          : { data: [] },
        resourceIds.length > 0
          ? supabase.from("pedagogical_resources").select("id, title, subject").in("id", resourceIds)
          : { data: [] },
      ]);

      const usersMap = new Map((usersRes.data || []).map(u => [u.id, u]));
      const resourcesMap = new Map((resourcesRes.data || []).map(r => [r.id, r]));

      return (data || []).map(comment => ({
        ...comment,
        user: usersMap.get(comment.user_id) || null,
        flagged_by_user: comment.flagged_by ? usersMap.get(comment.flagged_by) || null : null,
        hidden_by_user: comment.hidden_by ? usersMap.get(comment.hidden_by) || null : null,
        resource: resourcesMap.get(comment.resource_id) || null,
      })) as FlaggedComment[];
    },
    enabled: !!user && isAdmin,
  });

  // Batch action mutation
  const batchActionMutation = useMutation({
    mutationFn: async ({ type, ids }: { type: ActionType; ids: string[] }) => {
      const updates: Record<string, unknown> = {};
      
      if (type === "hide") {
        updates.is_hidden = true;
        updates.hidden_at = new Date().toISOString();
        updates.hidden_by = user?.id;
      } else if (type === "restore") {
        updates.is_hidden = false;
        updates.hidden_at = null;
        updates.hidden_by = null;
      } else if (type === "dismiss") {
        updates.is_flagged = false;
        updates.flag_reason = null;
        updates.flagged_at = null;
        updates.flagged_by = null;
      }

      const { error } = await supabase
        .from("resource_comments")
        .update(updates)
        .in("id", ids);

      if (error) throw error;
    },
    onSuccess: (_, { type, ids }) => {
      queryClient.invalidateQueries({ queryKey: ["flagged-comments"] });
      setSelectedIds(new Set());
      
      const actionLabels = {
        hide: "masqué(s)",
        restore: "restauré(s)",
        dismiss: "signalement(s) rejeté(s)",
      };
      
      toast.success(`${ids.length} commentaire(s) ${actionLabels[type]}`);
    },
    onError: () => {
      toast.error("Erreur lors de l'action");
    },
  });

  const filteredComments = comments.filter(comment => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      comment.content.toLowerCase().includes(term) ||
      comment.user?.first_name?.toLowerCase().includes(term) ||
      comment.user?.last_name?.toLowerCase().includes(term) ||
      comment.resource?.title?.toLowerCase().includes(term) ||
      comment.flag_reason?.toLowerCase().includes(term)
    );
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(filteredComments.map(c => c.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    const newSelected = new Set(selectedIds);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedIds(newSelected);
  };

  const handleBatchAction = (type: ActionType) => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) {
      toast.error("Sélectionnez au moins un commentaire");
      return;
    }
    setConfirmAction({ type, ids });
  };

  const executeAction = () => {
    if (confirmAction) {
      batchActionMutation.mutate(confirmAction);
      setConfirmAction(null);
    }
  };

  // Stats
  const stats = {
    total: comments.length,
    flagged: comments.filter(c => c.is_flagged && !c.is_hidden).length,
    hidden: comments.filter(c => c.is_hidden).length,
  };

  // Prepare data for ModerationStats component
  const statsComments = useMemo(() => 
    comments.map(c => ({
      id: c.id,
      is_flagged: c.is_flagged,
      is_hidden: c.is_hidden,
      flag_reason: c.flag_reason,
      flagged_at: c.flagged_at,
      hidden_at: c.hidden_at,
      created_at: c.created_at,
      user_id: c.user_id,
      profiles: c.user ? { first_name: c.user.first_name, last_name: c.user.last_name } : null,
    })), [comments]);

  // Get top flagged users for ban functionality
  const topFlaggedUsers = useMemo(() => {
    const userCounts: Record<string, { count: number; name: string }> = {};
    comments
      .filter((c) => c.is_flagged)
      .forEach((c) => {
        const userId = c.user_id;
        const name = c.user ? `${c.user.first_name} ${c.user.last_name}` : "Utilisateur inconnu";
        if (!userCounts[userId]) {
          userCounts[userId] = { count: 0, name };
        }
        userCounts[userId].count++;
      });

    return Object.entries(userCounts)
      .map(([userId, data]) => ({ userId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }, [comments]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 py-24">
          <GlassCard className="p-8 text-center" solid>
            <Shield className="h-16 w-16 mx-auto text-destructive mb-4" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Accès refusé</h1>
            <p className="text-muted-foreground mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <GlassButton onClick={() => navigate("/dashboard")}>
              Retour au tableau de bord
            </GlassButton>
          </GlassCard>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <GlassButton variant="outline" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="h-4 w-4" />
            </GlassButton>
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Shield className="h-6 w-6 text-primary" />
                Modération des commentaires
              </h1>
              <p className="text-muted-foreground">
                Gérez les commentaires signalés et modérés
              </p>
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="comments" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Commentaires
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Statistiques
              </TabsTrigger>
            </TabsList>

            <TabsContent value="stats" className="mt-6 space-y-6">
              <ModerationStats comments={statsComments} />

              {/* Gestion des bannissements */}
              <GlassCard className="p-6" solid>
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Ban className="h-5 w-5 text-destructive" />
                  Utilisateurs à risque
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Utilisateurs avec le plus de commentaires signalés. Cliquez pour bannir temporairement.
                </p>
                {topFlaggedUsers.length > 0 ? (
                  <div className="space-y-2">
                    {topFlaggedUsers.map((user) => (
                      <div
                        key={user.userId}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-full bg-destructive/10">
                            <User className="h-4 w-4 text-destructive" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{user.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {user.count} commentaire(s) signalé(s)
                            </p>
                          </div>
                        </div>
                        <GlassButton
                          size="sm"
                          variant="outline"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => setBanModalData({
                            userId: user.userId,
                            userName: user.name,
                            flaggedCount: user.count,
                          })}
                        >
                          <Ban className="h-4 w-4 mr-1" />
                          Bannir
                        </GlassButton>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Aucun utilisateur avec des commentaires signalés
                  </p>
                )}
              </GlassCard>
            </TabsContent>

            <TabsContent value="comments" className="mt-6 space-y-4">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <GlassCard className="p-4" solid>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/10">
                      <Flag className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Signalés</p>
                      <p className="text-2xl font-bold text-foreground">{stats.flagged}</p>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="p-4" solid>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-destructive/10">
                      <EyeOff className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Masqués</p>
                      <p className="text-2xl font-bold text-foreground">{stats.hidden}</p>
                    </div>
                  </div>
                </GlassCard>
                <GlassCard className="p-4" solid>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total en attente</p>
                      <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                    </div>
                  </div>
                </GlassCard>
              </div>

          {/* Filters & Actions */}
          <GlassCard className="p-4" solid>
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-1 gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Statut" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="flagged">Signalés</SelectItem>
                    <SelectItem value="hidden">Masqués</SelectItem>
                  </SelectContent>
                </Select>
                <GlassButton variant="outline" size="sm" onClick={() => refetch()}>
                  <RefreshCw className="h-4 w-4" />
                </GlassButton>
              </div>

              {selectedIds.size > 0 && (
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="px-3 py-1">
                    {selectedIds.size} sélectionné(s)
                  </Badge>
                  <GlassButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction("hide")}
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <EyeOff className="h-4 w-4 mr-1" />
                    Masquer
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction("restore")}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Restaurer
                  </GlassButton>
                  <GlassButton
                    size="sm"
                    variant="outline"
                    onClick={() => handleBatchAction("dismiss")}
                    className="text-green-600 hover:bg-green-500/10"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Rejeter signalement
                  </GlassButton>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Comments Table */}
          <GlassCard className="overflow-hidden" solid>
            {isLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                <p className="text-muted-foreground mt-2">Chargement...</p>
              </div>
            ) : filteredComments.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
                <p className="text-lg font-medium text-foreground">Aucun commentaire à modérer</p>
                <p className="text-sm text-muted-foreground">
                  Tous les commentaires signalés ont été traités.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={selectedIds.size === filteredComments.length && filteredComments.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Commentaire</TableHead>
                      <TableHead>Auteur</TableHead>
                      <TableHead>Ressource</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Raison</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredComments.map((comment) => (
                      <TableRow key={comment.id} className={comment.is_hidden ? "opacity-60" : ""}>
                        <TableCell>
                          <Checkbox
                            checked={selectedIds.has(comment.id)}
                            onCheckedChange={(checked) => handleSelectOne(comment.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="max-w-xs">
                          <p className="line-clamp-2 text-sm">{comment.content}</p>
                          {comment.parent_id && (
                            <Badge variant="outline" className="mt-1 text-xs">
                              Réponse
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">
                                {comment.user?.first_name} {comment.user?.last_name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {comment.user?.email}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium line-clamp-1">
                                {comment.resource?.title || "Ressource supprimée"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {comment.resource?.subject}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {comment.is_hidden && (
                              <Badge variant="destructive" className="w-fit">
                                <EyeOff className="h-3 w-3 mr-1" />
                                Masqué
                              </Badge>
                            )}
                            {comment.is_flagged && !comment.is_hidden && (
                              <Badge variant="secondary" className="w-fit bg-amber-500/10 text-amber-600">
                                <Flag className="h-3 w-3 mr-1" />
                                Signalé
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {comment.flag_reason ? (
                            <div className="flex items-start gap-1">
                              <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm line-clamp-2">{comment.flag_reason}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(comment.flagged_at || comment.created_at), "dd MMM yyyy", { locale: fr })}
                          </div>
                          {comment.flagged_by_user && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Par {comment.flagged_by_user.first_name} {comment.flagged_by_user.last_name}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </GlassCard>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Ban User Modal */}
      {banModalData && (
        <BanUserModal
          isOpen={!!banModalData}
          onClose={() => setBanModalData(null)}
          userId={banModalData.userId}
          userName={banModalData.userName}
          flaggedCount={banModalData.flaggedCount}
          onBanComplete={() => {
            refetch();
            setBanModalData(null);
          }}
        />
      )}

      {/* Confirmation Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={() => setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer l'action</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.type === "hide" && (
                <>Êtes-vous sûr de vouloir masquer {confirmAction.ids.length} commentaire(s) ? Ils ne seront plus visibles pour les utilisateurs.</>
              )}
              {confirmAction?.type === "restore" && (
                <>Êtes-vous sûr de vouloir restaurer {confirmAction.ids.length} commentaire(s) ? Ils seront à nouveau visibles.</>
              )}
              {confirmAction?.type === "dismiss" && (
                <>Êtes-vous sûr de vouloir rejeter le signalement de {confirmAction.ids.length} commentaire(s) ? Les commentaires resteront visibles.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>
              {batchActionMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Confirmer"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Footer />
    </div>
  );
};

export default CommentModeration;
