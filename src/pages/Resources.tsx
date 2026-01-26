import { useState, useEffect } from "react";
import { UserLayout } from "@/components/layout/UserLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { GlassButton } from "@/components/ui/glass-button";
import { GlassInput } from "@/components/ui/glass-input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Upload,
  Download,
  Trash2,
  Search,
  Filter,
  FileText,
  Video,
  Link as LinkIcon,
  Image,
  ExternalLink,
  Eye,
  Heart,
  Star,
  Sparkles,
  TrendingUp,
  MessageSquare,
  Settings,
  BarChart3,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { ResourceDetailModal } from "@/components/resources/ResourceDetailModal";
import { StarRating } from "@/components/resources/StarRating";

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

interface Favorite {
  id: string;
  resource_id: string;
}

interface ResourceRating {
  resource_id: string;
  avg_rating: number;
  count: number;
}

interface ResourceCommentCount {
  resource_id: string;
  count: number;
}

const resourceTypes = {
  document: { label: "Document", icon: FileText },
  video: { label: "Vidéo", icon: Video },
  link: { label: "Lien externe", icon: LinkIcon },
  image: { label: "Image", icon: Image },
};

const subjects = [
  "Mathématiques",
  "Français",
  "Histoire-Géographie",
  "Sciences",
  "Anglais",
  "Espagnol",
  "Physique-Chimie",
  "SVT",
  "EPS",
  "Arts",
  "Musique",
  "Philosophie",
];

const classLevels = [
  "6ème",
  "5ème",
  "4ème",
  "3ème",
  "2nde",
  "1ère",
  "Terminale",
];

const Resources = () => {
  const { user, roles } = useAuth();
  const [resources, setResources] = useState<PedagogicalResource[]>([]);
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [ratings, setRatings] = useState<Map<string, ResourceRating>>(new Map());
  const [commentCounts, setCommentCounts] = useState<Map<string, number>>(new Map());
  const [teacherSubjects, setTeacherSubjects] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isSubjectsOpen, setIsSubjectsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("all");
  const [selectedResource, setSelectedResource] = useState<PedagogicalResource | null>(null);
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    resource_type: "document",
    subject: "",
    class_level: "",
    external_url: "",
    tags: "",
    isPublic: true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isTeacher = roles.some((r) =>
    ["teacher", "main_teacher", "super_admin"].includes(r)
  );

  useEffect(() => {
    if (user) {
      fetchResources();
      fetchFavorites();
      fetchTeacherSubjects();
    }
  }, [user, subjectFilter, levelFilter]);

  useEffect(() => {
    if (resources.length > 0) {
      fetchRatingsAndComments();
    }
  }, [resources]);

  const fetchResources = async () => {
    try {
      let query = supabase
        .from("pedagogical_resources")
        .select("*")
        .order("created_at", { ascending: false });

      if (subjectFilter !== "all") {
        query = query.eq("subject", subjectFilter);
      }
      if (levelFilter !== "all") {
        query = query.eq("class_level", levelFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error("Error fetching resources:", error);
      toast.error("Erreur lors du chargement des ressources");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRatingsAndComments = async () => {
    const resourceIds = resources.map((r) => r.id);

    try {
      // Fetch ratings
      const { data: ratingsData } = await supabase
        .from("resource_ratings")
        .select("resource_id, rating")
        .in("resource_id", resourceIds);

      const ratingsMap = new Map<string, ResourceRating>();
      if (ratingsData) {
        const grouped = ratingsData.reduce((acc, r) => {
          if (!acc[r.resource_id]) {
            acc[r.resource_id] = { sum: 0, count: 0 };
          }
          acc[r.resource_id].sum += r.rating;
          acc[r.resource_id].count += 1;
          return acc;
        }, {} as Record<string, { sum: number; count: number }>);

        Object.entries(grouped).forEach(([id, { sum, count }]) => {
          ratingsMap.set(id, {
            resource_id: id,
            avg_rating: sum / count,
            count,
          });
        });
      }
      setRatings(ratingsMap);

      // Fetch comment counts
      const { data: commentsData } = await supabase
        .from("resource_comments")
        .select("resource_id")
        .in("resource_id", resourceIds);

      const commentsMap = new Map<string, number>();
      if (commentsData) {
        commentsData.forEach((c) => {
          commentsMap.set(c.resource_id, (commentsMap.get(c.resource_id) || 0) + 1);
        });
      }
      setCommentCounts(commentsMap);
    } catch (error) {
      console.error("Error fetching ratings and comments:", error);
    }
  };

  const fetchFavorites = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("resource_favorites")
        .select("id, resource_id")
        .eq("user_id", user.id);

      if (error) throw error;
      setFavorites(data || []);
    } catch (error) {
      console.error("Error fetching favorites:", error);
    }
  };

  const fetchTeacherSubjects = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from("teacher_subjects")
        .select("subject")
        .eq("teacher_id", user.id);

      if (error) throw error;
      setTeacherSubjects(data?.map((s) => s.subject) || []);
    } catch (error) {
      console.error("Error fetching teacher subjects:", error);
    }
  };

  const toggleTeacherSubject = async (subject: string) => {
    if (!user) return;

    try {
      if (teacherSubjects.includes(subject)) {
        await supabase
          .from("teacher_subjects")
          .delete()
          .eq("teacher_id", user.id)
          .eq("subject", subject);
        setTeacherSubjects(teacherSubjects.filter((s) => s !== subject));
      } else {
        await supabase.from("teacher_subjects").insert({
          teacher_id: user.id,
          subject,
        });
        setTeacherSubjects([...teacherSubjects, subject]);
      }
    } catch (error) {
      console.error("Error toggling subject:", error);
      toast.error("Erreur lors de la mise à jour");
    }
  };

  const toggleFavorite = async (resourceId: string) => {
    if (!user) return;

    const existingFav = favorites.find((f) => f.resource_id === resourceId);

    try {
      if (existingFav) {
        await supabase
          .from("resource_favorites")
          .delete()
          .eq("id", existingFav.id);
        setFavorites(favorites.filter((f) => f.id !== existingFav.id));
        toast.success("Retiré des favoris");
      } else {
        const { data, error } = await supabase
          .from("resource_favorites")
          .insert({ user_id: user.id, resource_id: resourceId })
          .select()
          .single();

        if (error) throw error;
        setFavorites([...favorites, data]);
        toast.success("Ajouté aux favoris");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Erreur lors de la mise à jour des favoris");
    }
  };

  const isFavorite = (resourceId: string) => {
    return favorites.some((f) => f.resource_id === resourceId);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 50 MB");
        return;
      }
      setSelectedFile(file);
      if (!uploadData.title) {
        setUploadData((prev) => ({
          ...prev,
          title: file.name.replace(/\.[^/.]+$/, ""),
        }));
      }
    }
  };

  const handleUpload = async () => {
    if (!user || !uploadData.title || !uploadData.subject || !uploadData.class_level) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    if (uploadData.resource_type !== "link" && !selectedFile) {
      toast.error("Veuillez sélectionner un fichier");
      return;
    }

    if (uploadData.resource_type === "link" && !uploadData.external_url) {
      toast.error("Veuillez fournir une URL");
      return;
    }

    setIsUploading(true);
    try {
      let fileUrl = null;

      if (selectedFile) {
        const fileExt = selectedFile.name.split(".").pop();
        const fileName = `${user.id}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("resources")
          .upload(fileName, selectedFile);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("resources")
          .getPublicUrl(fileName);

        fileUrl = urlData.publicUrl;
      }

      const tagsArray = uploadData.tags
        ? uploadData.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : null;

      const { error: insertError } = await supabase
        .from("pedagogical_resources")
        .insert({
          title: uploadData.title,
          description: uploadData.description || null,
          resource_type: uploadData.resource_type,
          subject: uploadData.subject,
          class_level: uploadData.class_level,
          file_url: fileUrl,
          external_url: uploadData.external_url || null,
          tags: tagsArray,
          is_public: uploadData.isPublic,
          uploaded_by: user.id,
        });

      if (insertError) throw insertError;

      toast.success("Ressource ajoutée avec succès");
      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadData({
        title: "",
        description: "",
        resource_type: "document",
        subject: "",
        class_level: "",
        external_url: "",
        tags: "",
        isPublic: true,
      });
      fetchResources();
    } catch (error) {
      console.error("Error uploading resource:", error);
      toast.error("Erreur lors de l'ajout de la ressource");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (resource: PedagogicalResource) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette ressource ?")) return;

    try {
      if (resource.file_url) {
        const filePath = resource.file_url.split("/").slice(-2).join("/");
        await supabase.storage.from("resources").remove([filePath]);
      }

      const { error } = await supabase
        .from("pedagogical_resources")
        .delete()
        .eq("id", resource.id);

      if (error) throw error;

      toast.success("Ressource supprimée");
      fetchResources();
    } catch (error) {
      console.error("Error deleting resource:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDownload = async (resource: PedagogicalResource) => {
    if (resource.external_url) {
      window.open(resource.external_url, "_blank");
      return;
    }

    if (resource.file_url) {
      window.open(resource.file_url, "_blank");

      await supabase
        .from("pedagogical_resources")
        .update({ downloads_count: resource.downloads_count + 1 })
        .eq("id", resource.id);
    }
  };

  // Filter resources
  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Get favorites only
  const favoriteResources = filteredResources.filter((r) => isFavorite(r.id));

  // Get recommendations (most downloaded + similar subjects)
  const getRecommendations = () => {
    const userFavSubjects = new Set(favoriteResources.map((r) => r.subject));

    return filteredResources
      .filter((r) => !isFavorite(r.id) && r.uploaded_by !== user?.id)
      .sort((a, b) => {
        const aRating = ratings.get(a.id)?.avg_rating || 0;
        const bRating = ratings.get(b.id)?.avg_rating || 0;
        const aScore =
          (userFavSubjects.has(a.subject) ? 10 : 0) +
          a.downloads_count +
          aRating * 2;
        const bScore =
          (userFavSubjects.has(b.subject) ? 10 : 0) +
          b.downloads_count +
          bRating * 2;
        return bScore - aScore;
      })
      .slice(0, 6);
  };

  // Get trending (most downloads recently)
  const getTrending = () => {
    return [...filteredResources]
      .sort((a, b) => {
        const aRating = ratings.get(a.id)?.avg_rating || 0;
        const bRating = ratings.get(b.id)?.avg_rating || 0;
        return b.downloads_count + bRating * 2 - (a.downloads_count + aRating * 2);
      })
      .slice(0, 6);
  };

  const displayResources =
    activeTab === "favorites"
      ? favoriteResources
      : activeTab === "recommendations"
      ? getRecommendations()
      : activeTab === "trending"
      ? getTrending()
      : filteredResources;

  if (!user) {
    return (
      <UserLayout title="Ressources pédagogiques">
        <GlassCard className="p-8 text-center">
          <p>Veuillez vous connecter pour accéder aux ressources.</p>
        </GlassCard>
      </UserLayout>
    );
  }

  const ResourceCard = ({ resource }: { resource: PedagogicalResource }) => {
    const TypeIcon =
      resourceTypes[resource.resource_type as keyof typeof resourceTypes]?.icon ||
      FileText;
    const isFav = isFavorite(resource.id);
    const resourceRating = ratings.get(resource.id);
    const commentCount = commentCounts.get(resource.id) || 0;

    return (
      <GlassCard
        className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setSelectedResource(resource)}
      >
        <div className="flex items-start gap-3">
          <div className="p-3 rounded-lg bg-primary/10">
            <TypeIcon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-medium truncate">{resource.title}</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(resource.id);
                }}
                className="ml-2 flex-shrink-0"
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFav
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground hover:text-red-500"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary" className="text-xs">
                {resource.subject}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {resource.class_level}
              </Badge>
            </div>
            {resource.description && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {resource.description}
              </p>
            )}

            {/* Rating and comments */}
            <div className="flex items-center gap-3 mt-2">
              {resourceRating && resourceRating.count > 0 ? (
                <div className="flex items-center gap-1">
                  <StarRating rating={resourceRating.avg_rating} size="sm" />
                  <span className="text-xs text-muted-foreground">
                    ({resourceRating.count})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-muted-foreground/30" />
                  <span className="text-xs text-muted-foreground">
                    Non noté
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MessageSquare className="h-3 w-3" />
                <span>{commentCount}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Eye className="h-3 w-3" />
              <span>{resource.downloads_count} vues</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(resource.created_at), {
                  addSuffix: true,
                  locale: fr,
                })}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(resource);
            }}
            className="flex-1"
          >
            {resource.external_url ? (
              <>
                <ExternalLink className="h-4 w-4 mr-1" />
                Ouvrir
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-1" />
                Télécharger
              </>
            )}
          </Button>
          {resource.uploaded_by === user.id && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(resource);
              }}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </GlassCard>
    );
  };

  return (
    <UserLayout title="Ressources pédagogiques">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Bibliothèque pédagogique</h1>
            <p className="text-muted-foreground mt-1">
              Partagez et découvrez des ressources éducatives
            </p>
          </div>

          <div className="flex gap-2 flex-wrap">
            {isTeacher && (
              <Button variant="outline" asChild>
                <Link to="/ressources/stats">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Mes statistiques
                </Link>
              </Button>
            )}
            {isTeacher && (
              <Dialog open={isSubjectsOpen} onOpenChange={setIsSubjectsOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Mes matières
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Matières enseignées</DialogTitle>
                  </DialogHeader>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sélectionnez vos matières pour recevoir des notifications
                    lorsque de nouvelles ressources sont ajoutées.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {subjects.map((subject) => (
                      <button
                        key={subject}
                        onClick={() => toggleTeacherSubject(subject)}
                        className={`p-2 rounded-lg border text-sm text-left transition-colors ${
                          teacherSubjects.includes(subject)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:bg-muted"
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
            )}

            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <GlassButton>
                  <Upload className="h-4 w-4 mr-2" />
                  Ajouter une ressource
                </GlassButton>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Ajouter une ressource</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type de ressource</Label>
                    <Select
                      value={uploadData.resource_type}
                      onValueChange={(value) =>
                        setUploadData((prev) => ({ ...prev, resource_type: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(resourceTypes).map(([value, { label }]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {uploadData.resource_type === "link" ? (
                    <div>
                      <Label>URL externe *</Label>
                      <GlassInput
                        value={uploadData.external_url}
                        onChange={(e) =>
                          setUploadData((prev) => ({
                            ...prev,
                            external_url: e.target.value,
                          }))
                        }
                        placeholder="https://..."
                        className="mt-1"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label>Fichier *</Label>
                      <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                        <input
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          id="resource-upload"
                        />
                        <label htmlFor="resource-upload" className="cursor-pointer">
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          {selectedFile ? (
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              Cliquez pour sélectionner (max 50 MB)
                            </p>
                          )}
                        </label>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label>Titre *</Label>
                    <GlassInput
                      value={uploadData.title}
                      onChange={(e) =>
                        setUploadData((prev) => ({ ...prev, title: e.target.value }))
                      }
                      placeholder="Titre de la ressource"
                      className="mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Matière *</Label>
                      <Select
                        value={uploadData.subject}
                        onValueChange={(value) =>
                          setUploadData((prev) => ({ ...prev, subject: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {subjects.map((subject) => (
                            <SelectItem key={subject} value={subject}>
                              {subject}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Niveau *</Label>
                      <Select
                        value={uploadData.class_level}
                        onValueChange={(value) =>
                          setUploadData((prev) => ({ ...prev, class_level: value }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionner" />
                        </SelectTrigger>
                        <SelectContent>
                          {classLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={uploadData.description}
                      onChange={(e) =>
                        setUploadData((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Description de la ressource"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label>Tags (séparés par des virgules)</Label>
                    <GlassInput
                      value={uploadData.tags}
                      onChange={(e) =>
                        setUploadData((prev) => ({ ...prev, tags: e.target.value }))
                      }
                      placeholder="algèbre, exercices, bac..."
                      className="mt-1"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="is-public"
                      checked={uploadData.isPublic}
                      onChange={(e) =>
                        setUploadData((prev) => ({
                          ...prev,
                          isPublic: e.target.checked,
                        }))
                      }
                      className="rounded"
                    />
                    <Label htmlFor="is-public" className="text-sm">
                      Partager avec tous les enseignants
                    </Label>
                  </div>

                  <GlassButton
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="w-full"
                  >
                    {isUploading ? "Ajout en cours..." : "Ajouter la ressource"}
                  </GlassButton>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="all" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Toutes
            </TabsTrigger>
            <TabsTrigger value="favorites" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Favoris ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="recommendations" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Recommandées
            </TabsTrigger>
            <TabsTrigger value="trending" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Populaires
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <GlassInput
              placeholder="Rechercher une ressource..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={subjectFilter} onValueChange={setSubjectFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Matière" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les matières</SelectItem>
              {subjects.map((subject) => (
                <SelectItem key={subject} value={subject}>
                  {subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={levelFilter} onValueChange={setLevelFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Niveau" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les niveaux</SelectItem>
              {classLevels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Resources Grid */}
        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : displayResources.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">
              {activeTab === "favorites"
                ? "Aucun favori"
                : activeTab === "recommendations"
                ? "Pas de recommandations disponibles"
                : "Aucune ressource trouvée"}
            </p>
            <p className="text-muted-foreground mt-1">
              {activeTab === "favorites"
                ? "Ajoutez des ressources à vos favoris en cliquant sur le cœur"
                : activeTab === "recommendations"
                ? "Ajoutez des favoris pour obtenir des recommandations personnalisées"
                : searchQuery
                ? "Essayez avec d'autres termes de recherche"
                : "Ajoutez votre première ressource pédagogique"}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        )}
      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
        onDownload={handleDownload}
      />
    </UserLayout>
  );
};

export default Resources;
