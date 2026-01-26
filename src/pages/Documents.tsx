import { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Share2,
  Search,
  Filter,
  File,
  Image,
  FileSpreadsheet,
  Presentation,
  Folder,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface SharedDocument {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  file_name: string;
  file_size: number;
  file_type: string;
  uploaded_by: string;
  shared_with: string | null;
  is_public: boolean;
  category: string;
  created_at: string;
  uploader?: {
    first_name: string;
    last_name: string;
  };
}

const categoryLabels: Record<string, string> = {
  general: "Général",
  homework: "Devoirs",
  report: "Bulletins",
  administrative: "Administratif",
  resource: "Ressources",
};

const getFileIcon = (fileType: string) => {
  if (fileType.includes("image")) return Image;
  if (fileType.includes("spreadsheet") || fileType.includes("excel"))
    return FileSpreadsheet;
  if (fileType.includes("presentation") || fileType.includes("powerpoint"))
    return Presentation;
  return FileText;
};

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
};

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadData, setUploadData] = useState({
    title: "",
    description: "",
    category: "general",
    isPublic: false,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, categoryFilter]);

  const fetchDocuments = async () => {
    try {
      let query = supabase
        .from("shared_documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (categoryFilter !== "all") {
        query = query.eq("category", categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Erreur lors du chargement des documents");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Le fichier ne doit pas dépasser 10 MB");
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
    if (!selectedFile || !user || !uploadData.title) {
      toast.error("Veuillez remplir tous les champs requis");
      return;
    }

    setIsUploading(true);
    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split(".").pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("documents")
        .upload(fileName, selectedFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("documents")
        .getPublicUrl(fileName);

      // Save document record
      const { error: insertError } = await supabase
        .from("shared_documents")
        .insert({
          title: uploadData.title,
          description: uploadData.description || null,
          file_url: urlData.publicUrl,
          file_name: selectedFile.name,
          file_size: selectedFile.size,
          file_type: selectedFile.type,
          uploaded_by: user.id,
          category: uploadData.category,
          is_public: uploadData.isPublic,
        });

      if (insertError) throw insertError;

      toast.success("Document téléchargé avec succès");
      setIsUploadOpen(false);
      setSelectedFile(null);
      setUploadData({
        title: "",
        description: "",
        category: "general",
        isPublic: false,
      });
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading document:", error);
      toast.error("Erreur lors du téléchargement");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (doc: SharedDocument) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;

    try {
      // Delete from storage
      const filePath = doc.file_url.split("/").slice(-2).join("/");
      await supabase.storage.from("documents").remove([filePath]);

      // Delete record
      const { error } = await supabase
        .from("shared_documents")
        .delete()
        .eq("id", doc.id);

      if (error) throw error;

      toast.success("Document supprimé");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleDownload = async (doc: SharedDocument) => {
    try {
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = doc.file_name;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading document:", error);
      toast.error("Erreur lors du téléchargement");
    }
  };

  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.file_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <UserLayout title="Documents partagés">
        <GlassCard className="p-8 text-center">
          <p>Veuillez vous connecter pour accéder aux documents.</p>
        </GlassCard>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Documents partagés">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-muted-foreground">
            Partagez et accédez aux documents de l'établissement
            </p>
          </div>

          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <GlassButton>
                <Upload className="h-4 w-4 mr-2" />
                Télécharger un document
              </GlassButton>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Télécharger un document</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Fichier *</Label>
                  <div className="mt-2 border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <input
                      type="file"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      {selectedFile ? (
                        <p className="text-sm font-medium">{selectedFile.name}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Cliquez pour sélectionner un fichier
                        </p>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <Label>Titre *</Label>
                  <GlassInput
                    value={uploadData.title}
                    onChange={(e) =>
                      setUploadData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Titre du document"
                    className="mt-1"
                  />
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
                    placeholder="Description optionnelle"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={uploadData.category}
                    onValueChange={(value) =>
                      setUploadData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    Rendre ce document accessible à tous
                  </Label>
                </div>

                <GlassButton
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !uploadData.title}
                  className="w-full"
                >
                  {isUploading ? "Téléchargement..." : "Télécharger"}
                </GlassButton>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <GlassInput
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {Object.entries(categoryLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Documents Grid */}
        {isLoading ? (
          <div className="text-center py-12">Chargement...</div>
        ) : filteredDocuments.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <Folder className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium">Aucun document trouvé</p>
            <p className="text-muted-foreground mt-1">
              {searchQuery
                ? "Essayez avec d'autres termes de recherche"
                : "Téléchargez votre premier document"}
            </p>
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => {
              const FileIcon = getFileIcon(doc.file_type);
              return (
                <GlassCard key={doc.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-3 rounded-lg bg-primary/10">
                      <FileIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium truncate">{doc.title}</h3>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.file_name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{categoryLabels[doc.category]}</span>
                      </div>
                      {doc.description && (
                        <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                          {doc.description}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDistanceToNow(new Date(doc.created_at), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(doc)}
                      className="flex-1"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                    {doc.uploaded_by === user.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(doc)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
    </UserLayout>
  );
};

export default Documents;
