import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Languages, 
  Plus,
  Trash2,
  Edit,
  GraduationCap,
  Upload
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { MultiFileImport, AnalysisResult } from "./MultiFileImport";

interface LinguisticSectionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  establishmentId: string;
  onSuccess: () => void;
}

interface LinguisticSection {
  id: string;
  name: string;
  code: string | null;
  teaching_language: string;
  is_default: boolean;
  description: string | null;
  color: string | null;
  order_index: number;
}

const LANGUAGES = [
  { value: "fr", label: "Français", icon: "🇫🇷" },
  { value: "en", label: "Anglais", icon: "🇬🇧" },
  { value: "ar", label: "Arabe", icon: "🇸🇦" },
  { value: "es", label: "Espagnol", icon: "🇪🇸" },
  { value: "de", label: "Allemand", icon: "🇩🇪" },
  { value: "zh", label: "Chinois", icon: "🇨🇳" },
  { value: "pt", label: "Portugais", icon: "🇵🇹" },
];

const SECTION_PRESETS = [
  { name: "Section Francophone", code: "FR", teaching_language: "fr" },
  { name: "Section Anglophone", code: "EN", teaching_language: "en" },
  { name: "Section Bilingue FR-EN", code: "BILING", teaching_language: "fr" },
  { name: "Section Arabophone", code: "AR", teaching_language: "ar" },
  { name: "Section Internationale", code: "INTL", teaching_language: "en" },
];

export const LinguisticSectionsModal = ({
  open,
  onOpenChange,
  establishmentId,
  onSuccess,
}: LinguisticSectionsModalProps) => {
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<LinguisticSection[]>([]);
  const [editingSection, setEditingSection] = useState<LinguisticSection | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"list" | "import">("list");
  
  const [form, setForm] = useState({
    name: "",
    code: "",
    teaching_language: "fr",
    is_default: false,
    description: "",
    color: "",
  });

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from("linguistic_sections")
        .select("*")
        .eq("establishment_id", establishmentId)
        .order("order_index");

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error("Error fetching sections:", error);
    }
  };

  useEffect(() => {
    if (open && establishmentId) {
      fetchSections();
    }
  }, [open, establishmentId]);

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      teaching_language: "fr",
      is_default: false,
      description: "",
      color: "",
    });
    setEditingSection(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Le nom de la section est requis");
      return;
    }

    setLoading(true);
    try {
      const sectionData = {
        establishment_id: establishmentId,
        name: form.name,
        code: form.code || null,
        teaching_language: form.teaching_language,
        is_default: form.is_default,
        description: form.description || null,
        color: form.color || null,
        order_index: sections.length,
      };

      if (editingSection?.id) {
        const { error } = await supabase
          .from("linguistic_sections")
          .update(sectionData)
          .eq("id", editingSection.id);
        if (error) throw error;
        toast.success("Section modifiée");
      } else {
        const { error } = await supabase.from("linguistic_sections").insert(sectionData);
        if (error) throw error;
        toast.success("Section créée");
      }

      resetForm();
      fetchSections();
    } catch (error) {
      console.error("Error saving section:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette section ?")) return;
    
    try {
      const { error } = await supabase.from("linguistic_sections").delete().eq("id", id);
      if (error) throw error;
      toast.success("Section supprimée");
      fetchSections();
    } catch (error) {
      console.error("Error deleting section:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleEdit = (section: LinguisticSection) => {
    setEditingSection(section);
    setForm({
      name: section.name,
      code: section.code || "",
      teaching_language: section.teaching_language,
      is_default: section.is_default,
      description: section.description || "",
      color: section.color || "",
    });
    setShowForm(true);
  };

  const handleAddPreset = async (preset: typeof SECTION_PRESETS[0]) => {
    setLoading(true);
    try {
      const { error } = await supabase.from("linguistic_sections").insert({
        establishment_id: establishmentId,
        name: preset.name,
        code: preset.code,
        teaching_language: preset.teaching_language,
        order_index: sections.length,
      });
      if (error) throw error;
      toast.success(`Section "${preset.name}" ajoutée`);
      fetchSections();
    } catch (error) {
      console.error("Error adding preset:", error);
      toast.error("Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Languages className="h-5 w-5" />
            Sections linguistiques
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "list" | "import")} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Sections ({sections.length})
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import IA
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[50vh] pr-4">
            <TabsContent value="list" className="mt-0">
              <div className="space-y-4">
                {/* Liste des sections */}
                {!showForm && (
                  <>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Définissez les sections linguistiques pour organiser vos classes par langue d'enseignement
                  </p>
                  <GlassButton size="sm" onClick={() => setShowForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvelle section
                  </GlassButton>
                </div>

                {sections.length === 0 ? (
                  <div className="space-y-4">
                    <div className="text-center py-6">
                      <Languages className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground mb-4">Aucune section linguistique</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Ajouter rapidement :</Label>
                      <div className="flex flex-wrap gap-2">
                        {SECTION_PRESETS.map(preset => (
                          <button
                            key={preset.code}
                            onClick={() => handleAddPreset(preset)}
                            disabled={loading}
                            className="px-3 py-2 rounded-lg border bg-muted/30 hover:bg-muted/50 text-sm flex items-center gap-2"
                          >
                            <span>{LANGUAGES.find(l => l.value === preset.teaching_language)?.icon}</span>
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {sections.map(section => (
                      <GlassCard key={section.id} className="p-4" solid>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">
                              {LANGUAGES.find(l => l.value === section.teaching_language)?.icon || "🗣️"}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold">{section.name}</p>
                                {section.code && (
                                  <Badge variant="outline" className="text-xs">{section.code}</Badge>
                                )}
                                {section.is_default && (
                                  <Badge className="text-xs">Par défaut</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Langue d'enseignement : {LANGUAGES.find(l => l.value === section.teaching_language)?.label}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEdit(section)}
                              className="p-2 rounded hover:bg-background/50"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(section.id)}
                              className="p-2 rounded hover:bg-destructive/20 text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Formulaire */}
            {showForm && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    {editingSection ? "Modifier la section" : "Nouvelle section"}
                  </h4>
                  <GlassButton variant="ghost" size="sm" onClick={resetForm}>
                    Annuler
                  </GlassButton>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom de la section *</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Ex: Section Francophone"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Code (optionnel)</Label>
                    <Input
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="Ex: FR"
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Langue d'enseignement principale *</Label>
                  <Select
                    value={form.teaching_language}
                    onValueChange={(v) => setForm({ ...form, teaching_language: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map(lang => (
                        <SelectItem key={lang.value} value={lang.value}>
                          <div className="flex items-center gap-2">
                            <span>{lang.icon}</span>
                            {lang.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Checkbox
                    id="is_default"
                    checked={form.is_default}
                    onCheckedChange={(checked) => setForm({ ...form, is_default: !!checked })}
                  />
                  <Label htmlFor="is_default" className="cursor-pointer">
                    Section par défaut (nouvelles classes)
                  </Label>
                </div>

                <GlassButton onClick={handleSave} disabled={loading} className="w-full">
                  {loading ? "Enregistrement..." : editingSection ? "Modifier" : "Créer la section"}
                </GlassButton>
              </div>
            )}
          </div>
        </TabsContent>

            <TabsContent value="import" className="mt-0">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold">Import intelligent de sections</h4>
                  <p className="text-sm text-muted-foreground">
                    Importez un fichier décrivant les sections linguistiques de votre établissement.
                  </p>
                </div>
                
                <MultiFileImport
                  context="linguistic_sections"
                  establishmentId={establishmentId}
                  onAnalysisComplete={(result: AnalysisResult) => {
                    if (result.success && Array.isArray(result.data)) {
                      result.data.forEach((item: any) => {
                        if (item.name) {
                          setForm({
                            name: item.name || "",
                            code: item.code || "",
                            teaching_language: item.teaching_language || "fr",
                            is_default: item.is_default || false,
                            description: item.description || "",
                            color: "",
                          });
                        }
                      });
                      
                      if (result.data.length > 0) {
                        toast.success(`${result.data.length} section(s) détectée(s).`);
                        setShowForm(true);
                        setActiveTab("list");
                      }
                    }
                  }}
                />
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <GlassButton variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </GlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
