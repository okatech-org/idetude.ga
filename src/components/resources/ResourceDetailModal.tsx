import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Star,
  Send,
  Download,
  ExternalLink,
  FileText,
  Video,
  Link as LinkIcon,
  Image,
  Trash2,
  MessageSquare,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PedagogicalResource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  subject: string;
  class_level: string;
  file_url: string | null;
  external_url: string | null;
  tags: string[] | null;
  is_public: boolean;
  uploaded_by: string;
  downloads_count: number;
  created_at: string;
}

interface Comment {
  id: string;
  resource_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profile?: {
    first_name: string;
    last_name: string;
  };
}

interface Rating {
  id: string;
  resource_id: string;
  user_id: string;
  rating: number;
}

interface ResourceDetailModalProps {
  resource: PedagogicalResource | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (resource: PedagogicalResource) => void;
}

const resourceTypes = {
  document: { label: "Document", icon: FileText },
  video: { label: "Vidéo", icon: Video },
  link: { label: "Lien externe", icon: LinkIcon },
  image: { label: "Image", icon: Image },
};

export const ResourceDetailModal = ({
  resource,
  isOpen,
  onClose,
  onDownload,
}: ResourceDetailModalProps) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [newComment, setNewComment] = useState("");
  const [userRating, setUserRating] = useState<number | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploaderProfile, setUploaderProfile] = useState<{
    first_name: string;
    last_name: string;
  } | null>(null);

  useEffect(() => {
    if (resource && isOpen) {
      fetchComments();
      fetchRatings();
      fetchUploaderProfile();
    }
  }, [resource, isOpen]);

  const fetchUploaderProfile = async () => {
    if (!resource) return;
    try {
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name")
        .eq("id", resource.uploaded_by)
        .maybeSingle();
      setUploaderProfile(data);
    } catch (error) {
      console.error("Error fetching uploader profile:", error);
    }
  };

  const fetchComments = async () => {
    if (!resource) return;
    try {
      const { data: commentsData, error } = await supabase
        .from("resource_comments")
        .select("*")
        .eq("resource_id", resource.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch profiles for comments
      if (commentsData && commentsData.length > 0) {
        const userIds = [...new Set(commentsData.map((c) => c.user_id))];
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name")
          .in("id", userIds);

        const profileMap = new Map(
          profiles?.map((p) => [p.id, { first_name: p.first_name, last_name: p.last_name }])
        );

        const commentsWithProfiles = commentsData.map((comment) => ({
          ...comment,
          profile: profileMap.get(comment.user_id),
        }));

        setComments(commentsWithProfiles);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };

  const fetchRatings = async () => {
    if (!resource) return;
    try {
      const { data, error } = await supabase
        .from("resource_ratings")
        .select("*")
        .eq("resource_id", resource.id);

      if (error) throw error;
      setRatings(data || []);

      // Set user's rating if exists
      const userRatingData = data?.find((r) => r.user_id === user?.id);
      setUserRating(userRatingData?.rating || null);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const handleSubmitComment = async () => {
    if (!user || !resource || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("resource_comments").insert({
        resource_id: resource.id,
        user_id: user.id,
        content: newComment.trim(),
      });

      if (error) throw error;

      toast.success("Commentaire ajouté");
      setNewComment("");
      fetchComments();
    } catch (error) {
      console.error("Error submitting comment:", error);
      toast.error("Erreur lors de l'ajout du commentaire");
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
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleRating = async (rating: number) => {
    if (!user || !resource) return;

    try {
      const existingRating = ratings.find((r) => r.user_id === user.id);

      if (existingRating) {
        const { error } = await supabase
          .from("resource_ratings")
          .update({ rating })
          .eq("id", existingRating.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("resource_ratings").insert({
          resource_id: resource.id,
          user_id: user.id,
          rating,
        });

        if (error) throw error;
      }

      setUserRating(rating);
      fetchRatings();
      toast.success("Note enregistrée");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Erreur lors de la notation");
    }
  };

  const averageRating =
    ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

  if (!resource) return null;

  const TypeIcon =
    resourceTypes[resource.resource_type as keyof typeof resourceTypes]?.icon ||
    FileText;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="p-3 rounded-lg bg-primary/10">
              <TypeIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{resource.title}</DialogTitle>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{resource.subject}</Badge>
                <Badge variant="outline">{resource.class_level}</Badge>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6 py-4">
            {/* Description */}
            {resource.description && (
              <div>
                <p className="text-muted-foreground">{resource.description}</p>
              </div>
            )}

            {/* Uploader info */}
            {uploaderProfile && (
              <div className="text-sm text-muted-foreground">
                Partagé par{" "}
                <span className="font-medium text-foreground">
                  {uploaderProfile.first_name} {uploaderProfile.last_name}
                </span>{" "}
                {formatDistanceToNow(new Date(resource.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </div>
            )}

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {resource.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Rating Section */}
            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500" />
                    Évaluation
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {ratings.length > 0
                      ? `${averageRating.toFixed(1)}/5 (${ratings.length} avis)`
                      : "Aucune évaluation"}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(null)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={cn(
                          "h-6 w-6 transition-colors",
                          (hoverRating || userRating || 0) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "text-muted-foreground"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Download Button */}
            <Button
              onClick={() => onDownload(resource)}
              className="w-full"
              size="lg"
            >
              {resource.external_url ? (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir le lien externe
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger ({resource.downloads_count} téléchargements)
                </>
              )}
            </Button>

            {/* Comments Section */}
            <div className="border-t border-border pt-6">
              <h4 className="font-medium flex items-center gap-2 mb-4">
                <MessageSquare className="h-4 w-4" />
                Commentaires ({comments.length})
              </h4>

              {/* New Comment */}
              <div className="flex gap-2 mb-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="min-h-[80px]"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  size="icon"
                  className="h-auto"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Comments List */}
              <div className="space-y-4">
                {comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Aucun commentaire. Soyez le premier à commenter !
                  </p>
                ) : (
                  comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="flex gap-3 p-3 rounded-lg bg-muted/30"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {comment.profile?.first_name?.[0]}
                          {comment.profile?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="font-medium text-sm">
                              {comment.profile?.first_name}{" "}
                              {comment.profile?.last_name}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {formatDistanceToNow(new Date(comment.created_at), {
                                addSuffix: true,
                                locale: fr,
                              })}
                            </span>
                          </div>
                          {comment.user_id === user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteComment(comment.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
