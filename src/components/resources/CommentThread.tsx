import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Send,
  Trash2,
  MoreVertical,
  Reply,
  Flag,
  EyeOff,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Comment {
  id: string;
  resource_id: string;
  user_id: string;
  content: string;
  created_at: string;
  parent_id: string | null;
  is_flagged: boolean;
  flag_reason: string | null;
  is_hidden: boolean;
  profile?: {
    first_name: string;
    last_name: string;
  };
  replies?: Comment[];
}

interface CommentThreadProps {
  comments: Comment[];
  resourceId: string;
  onRefresh: () => void;
}

export const CommentThread = ({
  comments,
  resourceId,
  onRefresh,
}: CommentThreadProps) => {
  const { user, roles } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flaggingCommentId, setFlaggingCommentId] = useState<string | null>(null);
  const [flagReason, setFlagReason] = useState("");

  const isAdmin = roles.some((r) =>
    ["super_admin", "school_admin", "school_director"].includes(r)
  );

  // Organize comments into threads
  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const topLevel: Comment[] = [];

    flatComments.forEach((c) => {
      commentMap.set(c.id, { ...c, replies: [] });
    });

    flatComments.forEach((c) => {
      const comment = commentMap.get(c.id)!;
      if (c.parent_id && commentMap.has(c.parent_id)) {
        const parent = commentMap.get(c.parent_id)!;
        parent.replies = parent.replies || [];
        parent.replies.push(comment);
      } else {
        topLevel.push(comment);
      }
    });

    return topLevel;
  };

  const threadedComments = organizeComments(comments);

  const handleSubmitComment = async (parentId: string | null = null) => {
    if (!user) return;

    const content = parentId ? replyContent : newComment;
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("resource_comments").insert({
        resource_id: resourceId,
        user_id: user.id,
        content: content.trim(),
        parent_id: parentId,
      });

      if (error) throw error;

      toast.success(parentId ? "Réponse ajoutée" : "Commentaire ajouté");
      if (parentId) {
        setReplyContent("");
        setReplyingTo(null);
      } else {
        setNewComment("");
      }
      onRefresh();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Erreur lors de l'ajout");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from("resource_comments")
        .delete()
        .eq("id", commentId);

      if (error) throw error;
      toast.success("Commentaire supprimé");
      onRefresh();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleFlagComment = async () => {
    if (!user || !flaggingCommentId) return;

    try {
      const { error } = await supabase
        .from("resource_comments")
        .update({
          is_flagged: true,
          flag_reason: flagReason,
          flagged_by: user.id,
          flagged_at: new Date().toISOString(),
        })
        .eq("id", flaggingCommentId);

      if (error) throw error;
      toast.success("Commentaire signalé");
      setFlagDialogOpen(false);
      setFlaggingCommentId(null);
      setFlagReason("");
      onRefresh();
    } catch (error) {
      console.error("Error flagging comment:", error);
      toast.error("Erreur lors du signalement");
    }
  };

  const handleToggleHidden = async (commentId: string, currentlyHidden: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("resource_comments")
        .update({
          is_hidden: !currentlyHidden,
          hidden_by: !currentlyHidden ? user.id : null,
          hidden_at: !currentlyHidden ? new Date().toISOString() : null,
        })
        .eq("id", commentId);

      if (error) throw error;
      toast.success(currentlyHidden ? "Commentaire restauré" : "Commentaire masqué");
      onRefresh();
    } catch (error) {
      console.error("Error toggling hidden:", error);
      toast.error("Erreur lors de la modération");
    }
  };

  const CommentItem = ({
    comment,
    depth = 0,
  }: {
    comment: Comment;
    depth?: number;
  }) => {
    const isOwn = comment.user_id === user?.id;
    const canModerate = isAdmin || isOwn;

    if (comment.is_hidden && !isAdmin) return null;

    return (
      <div
        className={cn(
          "relative",
          depth > 0 && "ml-8 pl-4 border-l-2 border-border/50"
        )}
      >
        <div
          className={cn(
            "p-3 rounded-lg",
            comment.is_hidden
              ? "bg-destructive/10 opacity-60"
              : comment.is_flagged
              ? "bg-amber-500/10"
              : "bg-muted/30"
          )}
        >
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {comment.profile?.first_name?.[0]}
                {comment.profile?.last_name?.[0]}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-sm">
                    {comment.profile?.first_name} {comment.profile?.last_name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(comment.created_at), {
                      addSuffix: true,
                      locale: fr,
                    })}
                  </span>
                  {comment.is_flagged && (
                    <span className="text-xs bg-amber-500/20 text-amber-600 px-2 py-0.5 rounded flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Signalé
                    </span>
                  )}
                  {comment.is_hidden && (
                    <span className="text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded flex items-center gap-1">
                      <EyeOff className="h-3 w-3" />
                      Masqué
                    </span>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setReplyingTo(comment.id);
                        setReplyContent("");
                      }}
                    >
                      <Reply className="h-4 w-4 mr-2" />
                      Répondre
                    </DropdownMenuItem>
                    {!isOwn && !comment.is_flagged && (
                      <DropdownMenuItem
                        onClick={() => {
                          setFlaggingCommentId(comment.id);
                          setFlagDialogOpen(true);
                        }}
                        className="text-amber-600"
                      >
                        <Flag className="h-4 w-4 mr-2" />
                        Signaler
                      </DropdownMenuItem>
                    )}
                    {isAdmin && (
                      <DropdownMenuItem
                        onClick={() => handleToggleHidden(comment.id, comment.is_hidden)}
                      >
                        {comment.is_hidden ? (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Restaurer
                          </>
                        ) : (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Masquer
                          </>
                        )}
                      </DropdownMenuItem>
                    )}
                    {canModerate && (
                      <DropdownMenuItem
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <p className="text-sm mt-1">{comment.content}</p>

              {comment.is_flagged && comment.flag_reason && isAdmin && (
                <p className="text-xs text-amber-600 mt-2 italic">
                  Raison : {comment.flag_reason}
                </p>
              )}
            </div>
          </div>

          {/* Reply input */}
          {replyingTo === comment.id && (
            <div className="mt-3 ml-11 flex gap-2">
              <Textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Votre réponse..."
                className="min-h-[60px] text-sm"
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  onClick={() => handleSubmitComment(comment.id)}
                  disabled={!replyContent.trim() || isSubmitting}
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setReplyingTo(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 space-y-2">
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* New comment input */}
      <div className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Ajouter un commentaire..."
          className="min-h-[80px]"
        />
        <Button
          onClick={() => handleSubmitComment(null)}
          disabled={!newComment.trim() || isSubmitting}
          size="icon"
          className="h-auto"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Comments list */}
      <div className="space-y-3">
        {threadedComments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Aucun commentaire. Soyez le premier à commenter !
          </p>
        ) : (
          threadedComments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} />
          ))
        )}
      </div>

      {/* Flag Dialog */}
      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              Signaler ce commentaire
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Raison du signalement</Label>
              <Textarea
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                placeholder="Expliquez pourquoi ce commentaire est inapproprié..."
                className="mt-2"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleFlagComment}
              disabled={!flagReason.trim()}
              className="bg-amber-500 hover:bg-amber-600"
            >
              Signaler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
