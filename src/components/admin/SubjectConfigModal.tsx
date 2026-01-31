import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GlassButton } from "@/components/ui/glass-button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Languages,
  Palette,
  Music,
  Dumbbell,
  Wrench,
  Plus,
  Trash2,
  GraduationCap,
  Edit,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Download,
  X
} from "lucide-react";
import { GlassCard } from "@/components/ui/glass-card";
import { MultiFileImport, AnalysisResult } from "./MultiFileImport";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";

interface SubjectConfigModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  establishmentId: string;
  onSuccess: () => void;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  category: string;
  is_language: boolean;
  language_code: string | null;
  language_level: string | null;
  coefficient: number;
  hours_per_week: number | null;
  is_mandatory: boolean;
  color: string | null;
  icon: string | null;
  description: string | null;
  order_index: number;
}

interface CSVSubject {
  name: string;
  code: string;
  category: string;
  coefficient: number;
  hours_per_week: number;
  is_mandatory: boolean;
  isValid: boolean;
  error?: string;
}

const CATEGORIES = [
  { value: "general", label: "Enseignement général", icon: BookOpen, color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  { value: "language", label: "Langues", icon: Languages, color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
  { value: "technical", label: "Enseignement technique", icon: Wrench, color: "bg-orange-500/10 text-orange-600 border-orange-500/20" },
  { value: "artistic", label: "Arts", icon: Palette, color: "bg-pink-500/10 text-pink-600 border-pink-500/20" },
  { value: "sport", label: "Éducation physique", icon: Dumbbell, color: "bg-green-500/10 text-green-600 border-green-500/20" },
  { value: "music", label: "Musique", icon: Music, color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
];

const LANGUAGE_LEVELS = [
  { value: "LV1", label: "LV1 - Langue vivante 1", description: "Langue principale obligatoire" },
  { value: "LV2", label: "LV2 - Langue vivante 2", description: "Seconde langue obligatoire" },
  { value: "LV3", label: "LV3 - Langue vivante 3", description: "Troisième langue optionnelle" },
  { value: "option", label: "Option", description: "Langue en option facultative" },
  { value: "specialite", label: "Spécialité", description: "Langue de spécialisation" },
];

const LANGUAGES = [
  { value: "fr", label: "Français", icon: "🇫🇷" },
  { value: "en", label: "Anglais", icon: "🇬🇧" },
  { value: "ar", label: "Arabe", icon: "🇸🇦" },
  { value: "es", label: "Espagnol", icon: "🇪🇸" },
  { value: "de", label: "Allemand", icon: "🇩🇪" },
  { value: "zh", label: "Chinois", icon: "🇨🇳" },
  { value: "pt", label: "Portugais", icon: "🇵🇹" },
  { value: "ru", label: "Russe", icon: "🇷🇺" },
  { value: "ja", label: "Japonais", icon: "🇯🇵" },
  { value: "ko", label: "Coréen", icon: "🇰🇷" },
  { value: "it", label: "Italien", icon: "🇮🇹" },
  { value: "la", label: "Latin", icon: "📜" },
  { value: "gr", label: "Grec ancien", icon: "🏛️" },
];

const DEFAULT_SUBJECTS = [
  { name: "Mathématiques", code: "MATH", category: "general", coefficient: 4, is_mandatory: true },
  { name: "Français", code: "FR", category: "general", coefficient: 4, is_mandatory: true },
  { name: "Histoire-Géographie", code: "HG", category: "general", coefficient: 3, is_mandatory: true },
  { name: "Sciences de la Vie et de la Terre", code: "SVT", category: "general", coefficient: 2, is_mandatory: true },
  { name: "Physique-Chimie", code: "PC", category: "general", coefficient: 3, is_mandatory: true },
  { name: "Éducation Physique et Sportive", code: "EPS", category: "sport", coefficient: 2, is_mandatory: true },
  { name: "Éducation Civique et Morale", code: "ECM", category: "general", coefficient: 1, is_mandatory: true },
  { name: "Arts Plastiques", code: "ARTS", category: "artistic", coefficient: 1, is_mandatory: false },
  { name: "Éducation Musicale", code: "MUS", category: "music", coefficient: 1, is_mandatory: false },
  { name: "Technologie", code: "TECH", category: "technical", coefficient: 1, is_mandatory: false },
];

export const SubjectConfigModal = ({
  open,
  onOpenChange,
  establishmentId,
  onSuccess,
}: SubjectConfigModalProps) => {
  const [loading, setLoading] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [activeTab, setActiveTab] = useState("list");
  const [editingSubject, setEditingSubject] = useState<Partial<Subject> | null>(null);

  // CSV Import state
  const [csvSubjects, setCsvSubjects] = useState<CSVSubject[]>([]);
  const [csvImporting, setCsvImporting] = useState(false);
  const [csvProgress, setCsvProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    name: "",
    code: "",
    category: "general",
    is_language: false,
    language_code: "",
    language_level: "",
    coefficient: 1,
    hours_per_week: 2,
    is_mandatory: true,
    color: "",
    description: "",
  });

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/db/establishments/${establishmentId}/subjects`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      // Sort by category then order_index
      const sorted = (data || []).sort((a: Subject, b: Subject) => {
        if (a.category !== b.category) return (a.category || '').localeCompare(b.category || '');
        return (a.order_index || 0) - (b.order_index || 0);
      });
      setSubjects(sorted);
    } catch (error) {
      console.error("Error fetching subjects:", error);
    }
  };

  useEffect(() => {
    if (open && establishmentId) {
      fetchSubjects();
    }
  }, [open, establishmentId]);

  const resetForm = () => {
    setForm({
      name: "",
      code: "",
      category: "general",
      is_language: false,
      language_code: "",
      language_level: "",
      coefficient: 1,
      hours_per_week: 2,
      is_mandatory: true,
      color: "",
      description: "",
    });
    setEditingSubject(null);
  };

  const handleAddSubject = async () => {
    if (!form.name) {
      toast.error("Le nom de la matière est requis");
      return;
    }

    if (form.is_language && !form.language_code) {
      toast.error("Sélectionnez une langue");
      return;
    }

    setLoading(true);
    try {
      const subjectData = {
        establishment_id: establishmentId,
        name: form.name,
        code: form.code || null,
        category: form.category,
        is_language: form.is_language,
        language_code: form.is_language ? form.language_code : null,
        language_level: form.is_language ? form.language_level : null,
        coefficient: form.coefficient,
        hours_per_week: form.hours_per_week,
        is_mandatory: form.is_mandatory,
        color: form.color || null,
        description: form.description || null,
        order_index: subjects.length,
      };

      if (editingSubject?.id) {
        const response = await fetch(`/api/db/subjects/${editingSubject.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subjectData),
        });
        if (!response.ok) throw new Error('Failed to update subject');
        toast.success("Matière modifiée avec succès");
      } else {
        const response = await fetch(`/api/db/establishments/${establishmentId}/subjects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subjectData),
        });
        if (!response.ok) throw new Error('Failed to create subject');
        toast.success("Matière ajoutée avec succès");
      }

      resetForm();
      fetchSubjects();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving subject:", error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubject = async (id: string) => {
    if (!confirm("Supprimer cette matière ?")) return;

    try {
      const response = await fetch(`/api/db/subjects/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete subject');
      toast.success("Matière supprimée");
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
      toast.error("Erreur lors de la suppression");
    }
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setForm({
      name: subject.name,
      code: subject.code || "",
      category: subject.category,
      is_language: subject.is_language,
      language_code: subject.language_code || "",
      language_level: subject.language_level || "",
      coefficient: subject.coefficient,
      hours_per_week: subject.hours_per_week || 2,
      is_mandatory: subject.is_mandatory,
      color: subject.color || "",
      description: subject.description || "",
    });
    setActiveTab("add");
  };

  const handleAddDefaultSubjects = async () => {
    setLoading(true);
    try {
      const subjectsToInsert = DEFAULT_SUBJECTS.map((s, index) => ({
        establishment_id: establishmentId,
        name: s.name,
        code: s.code,
        category: s.category,
        coefficient: s.coefficient,
        is_mandatory: s.is_mandatory,
        is_language: false,
        order_index: index,
      }));

      const response = await fetch(`/api/db/establishments/${establishmentId}/subjects/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subjectsToInsert),
      });
      if (!response.ok) throw new Error('Failed to add default subjects');

      toast.success("Matières par défaut ajoutées");
      fetchSubjects();
    } catch (error) {
      console.error("Error adding default subjects:", error);
      toast.error("Erreur lors de l'ajout des matières");
    } finally {
      setLoading(false);
    }
  };

  // === CSV Import Functions ===
  const parseCSV = (text: string): CSVSubject[] => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return [];

    const headerLine = lines[0].toLowerCase();
    const headers = headerLine.split(/[,;]/).map(h => h.trim().replace(/"/g, ''));

    // Flexible column detection
    const findColumnIndex = (possibleNames: string[]): number => {
      return headers.findIndex(h =>
        possibleNames.some(name => h.includes(name))
      );
    };

    const nameIdx = findColumnIndex(['nom', 'name', 'matière', 'matiere', 'subject']);
    const codeIdx = findColumnIndex(['code', 'abbreviation', 'abbr', 'sigle']);
    const categoryIdx = findColumnIndex(['catégorie', 'categorie', 'category', 'type']);
    const coefficientIdx = findColumnIndex(['coefficient', 'coef', 'coeff']);
    const hoursIdx = findColumnIndex(['heures', 'hours', 'volume', 'horaire']);
    const mandatoryIdx = findColumnIndex(['obligatoire', 'mandatory', 'required']);

    if (nameIdx === -1) {
      toast.error("Colonne 'Nom' non trouvée dans le CSV");
      return [];
    }

    const existingNames = new Set(subjects.map(s => s.name.toLowerCase()));

    return lines.slice(1).map((line, idx) => {
      const values = line.split(/[,;]/).map(v => v.trim().replace(/"/g, ''));
      const name = values[nameIdx] || '';
      const code = codeIdx >= 0 ? values[codeIdx] : '';
      const categoryRaw = categoryIdx >= 0 ? values[categoryIdx]?.toLowerCase() : 'general';
      const coeffRaw = coefficientIdx >= 0 ? parseFloat(values[coefficientIdx]) : 1;
      const hoursRaw = hoursIdx >= 0 ? parseFloat(values[hoursIdx]) : 2;
      const mandatoryRaw = mandatoryIdx >= 0 ?
        ['oui', 'yes', 'true', '1', 'o', 'y'].includes(values[mandatoryIdx]?.toLowerCase()) : true;

      // Map category
      const categoryMap: Record<string, string> = {
        'général': 'general', 'general': 'general', 'enseignement général': 'general',
        'langue': 'language', 'langues': 'language', 'language': 'language',
        'technique': 'technical', 'technical': 'technical', 'enseignement technique': 'technical',
        'art': 'artistic', 'arts': 'artistic', 'artistic': 'artistic', 'artistique': 'artistic',
        'sport': 'sport', 'eps': 'sport', 'éducation physique': 'sport',
        'musique': 'music', 'music': 'music',
      };
      const category = categoryMap[categoryRaw] || 'general';

      // Validation
      const isValid = name.length >= 2;
      const isDuplicate = existingNames.has(name.toLowerCase());

      return {
        name,
        code: code.toUpperCase(),
        category,
        coefficient: isNaN(coeffRaw) ? 1 : Math.max(0.5, Math.min(10, coeffRaw)),
        hours_per_week: isNaN(hoursRaw) ? 2 : Math.max(0.5, Math.min(20, hoursRaw)),
        is_mandatory: mandatoryRaw,
        isValid: isValid && !isDuplicate,
        error: !isValid ? 'Nom trop court' : isDuplicate ? 'Existe déjà' : undefined,
      };
    }).filter(s => s.name.length > 0);
  };

  const handleCSVFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const parsed = parseCSV(text);
      setCsvSubjects(parsed);

      if (parsed.length > 0) {
        const validCount = parsed.filter(s => s.isValid).length;
        toast.success(`${parsed.length} matières détectées (${validCount} valides)`);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCSVBulkImport = async () => {
    const validSubjects = csvSubjects.filter(s => s.isValid);
    if (validSubjects.length === 0) {
      toast.error("Aucune matière valide à importer");
      return;
    }

    setCsvImporting(true);
    setCsvProgress(0);

    try {
      const subjectsToInsert = validSubjects.map((s, index) => ({
        establishment_id: establishmentId,
        name: s.name,
        code: s.code || null,
        category: s.category,
        coefficient: s.coefficient,
        hours_per_week: s.hours_per_week,
        is_mandatory: s.is_mandatory,
        is_language: false,
        order_index: subjects.length + index,
      }));

      // Insert in batches
      const batchSize = 10;
      let inserted = 0;

      for (let i = 0; i < subjectsToInsert.length; i += batchSize) {
        const batch = subjectsToInsert.slice(i, i + batchSize);
        const { error } = await supabase.from("subjects").insert(batch);
        if (error) throw error;

        inserted += batch.length;
        setCsvProgress((inserted / subjectsToInsert.length) * 100);
      }

      toast.success(`${inserted} matières importées avec succès`);
      setCsvSubjects([]);
      fetchSubjects();
      setActiveTab("list");
    } catch (error) {
      console.error("Error importing subjects:", error);
      toast.error("Erreur lors de l'importation");
    } finally {
      setCsvImporting(false);
      setCsvProgress(0);
    }
  };

  const removeCSVSubject = (index: number) => {
    setCsvSubjects(prev => prev.filter((_, i) => i !== index));
  };

  const downloadCSVTemplate = () => {
    const template = `Nom,Code,Catégorie,Coefficient,Heures,Obligatoire
Mathématiques,MATH,Général,4,4,Oui
Français,FR,Général,4,5,Oui
Anglais,ENG,Langues,3,3,Oui
Histoire-Géographie,HG,Général,3,3,Oui
Physique-Chimie,PC,Général,3,3,Oui
SVT,SVT,Général,2,2,Oui
EPS,EPS,Sport,2,2,Oui
Arts Plastiques,ARTS,Arts,1,1,Non`;

    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'modele_matieres.csv';
    link.click();
  };

  const groupedSubjects = subjects.reduce((acc, subject) => {
    const category = subject.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(subject);
    return acc;
  }, {} as Record<string, Subject[]>);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <BookOpen className="h-5 w-5" />
            Configuration des matières
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Matières ({subjects.length})
            </TabsTrigger>
            <TabsTrigger value="languages" className="flex items-center gap-2">
              <Languages className="h-4 w-4" />
              Langues
            </TabsTrigger>
            <TabsTrigger value="add" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              {editingSubject ? "Modifier" : "Ajouter"}
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Import IA
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[55vh] mt-4 pr-4">
            {/* Liste des matières */}
            <TabsContent value="list" className="space-y-4 mt-0">
              {subjects.length === 0 ? (
                <div className="text-center py-8">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground mb-4">Aucune matière configurée</p>
                  <GlassButton onClick={handleAddDefaultSubjects} disabled={loading}>
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter les matières par défaut
                  </GlassButton>
                </div>
              ) : (
                Object.entries(groupedSubjects).map(([category, categorySubjects]) => {
                  const categoryInfo = CATEGORIES.find(c => c.value === category);
                  const Icon = categoryInfo?.icon || BookOpen;

                  return (
                    <GlassCard key={category} className="p-4" solid>
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-5 w-5" />
                        <h4 className="font-semibold">{categoryInfo?.label || category}</h4>
                        <Badge variant="secondary">{categorySubjects.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {categorySubjects.map(subject => (
                          <div
                            key={subject.id}
                            className={cn(
                              "flex items-center justify-between p-3 rounded-lg border",
                              categoryInfo?.color || "bg-muted/30"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              {subject.is_language && (
                                <span className="text-lg">
                                  {LANGUAGES.find(l => l.value === subject.language_code)?.icon || "🗣️"}
                                </span>
                              )}
                              <div>
                                <p className="font-medium text-sm">{subject.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  Coef. {subject.coefficient}
                                  {subject.is_language && subject.language_level && (
                                    <> • {subject.language_level}</>
                                  )}
                                  {!subject.is_mandatory && <> • Option</>}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleEditSubject(subject)}
                                className="p-1.5 rounded hover:bg-background/50"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteSubject(subject.id)}
                                className="p-1.5 rounded hover:bg-destructive/20 text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </GlassCard>
                  );
                })
              )}
            </TabsContent>

            {/* Langues uniquement */}
            <TabsContent value="languages" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Langues enseignées comme matière</h4>
                    <p className="text-sm text-muted-foreground">
                      Configurez les langues proposées (LV1, LV2, LV3, Options)
                    </p>
                  </div>
                  <GlassButton
                    size="sm"
                    onClick={() => {
                      setForm({ ...form, is_language: true, category: "language" });
                      setActiveTab("add");
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une langue
                  </GlassButton>
                </div>

                {/* Langues par niveau */}
                {LANGUAGE_LEVELS.map(level => {
                  const levelSubjects = subjects.filter(
                    s => s.is_language && s.language_level === level.value
                  );

                  return (
                    <GlassCard key={level.value} className="p-4" solid>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h5 className="font-medium">{level.label}</h5>
                          <p className="text-xs text-muted-foreground">{level.description}</p>
                        </div>
                        <Badge variant="outline">{levelSubjects.length} langue(s)</Badge>
                      </div>
                      {levelSubjects.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {levelSubjects.map(subject => (
                            <Badge
                              key={subject.id}
                              variant="secondary"
                              className="gap-2 pr-1"
                            >
                              <span>{LANGUAGES.find(l => l.value === subject.language_code)?.icon}</span>
                              <span>{subject.name}</span>
                              <button
                                onClick={() => handleDeleteSubject(subject.id)}
                                className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                              >
                                ✕
                              </button>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic mt-2">
                          Aucune langue configurée pour ce niveau
                        </p>
                      )}
                    </GlassCard>
                  );
                })}
              </div>
            </TabsContent>

            {/* Formulaire d'ajout/modification */}
            <TabsContent value="add" className="space-y-4 mt-0">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom de la matière *</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Ex: Mathématiques"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Code (optionnel)</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: MATH"
                    maxLength={10}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) => setForm({ ...form, category: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <div className="flex items-center gap-2">
                            <cat.icon className="h-4 w-4" />
                            {cat.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Coefficient</Label>
                  <Input
                    type="number"
                    min={0.5}
                    max={10}
                    step={0.5}
                    value={form.coefficient}
                    onChange={(e) => setForm({ ...form, coefficient: parseFloat(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Section langue */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 border">
                <Checkbox
                  id="is_language"
                  checked={form.is_language}
                  onCheckedChange={(checked) => setForm({
                    ...form,
                    is_language: !!checked,
                    category: checked ? "language" : form.category
                  })}
                />
                <Label htmlFor="is_language" className="cursor-pointer">
                  Cette matière est une langue enseignée
                </Label>
              </div>

              {form.is_language && (
                <div className="grid grid-cols-2 gap-4 p-4 rounded-lg border bg-purple-500/5">
                  <div className="space-y-2">
                    <Label>Langue *</Label>
                    <Select
                      value={form.language_code}
                      onValueChange={(v) => {
                        const lang = LANGUAGES.find(l => l.value === v);
                        setForm({
                          ...form,
                          language_code: v,
                          name: form.name || lang?.label || ""
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une langue" />
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
                  <div className="space-y-2">
                    <Label>Niveau</Label>
                    <Select
                      value={form.language_level}
                      onValueChange={(v) => setForm({ ...form, language_level: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un niveau" />
                      </SelectTrigger>
                      <SelectContent>
                        {LANGUAGE_LEVELS.map(level => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Heures par semaine</Label>
                  <Input
                    type="number"
                    min={0.5}
                    max={20}
                    step={0.5}
                    value={form.hours_per_week}
                    onChange={(e) => setForm({ ...form, hours_per_week: parseFloat(e.target.value) || 2 })}
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Checkbox
                    id="is_mandatory"
                    checked={form.is_mandatory}
                    onCheckedChange={(checked) => setForm({ ...form, is_mandatory: !!checked })}
                  />
                  <Label htmlFor="is_mandatory" className="cursor-pointer">
                    Matière obligatoire
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description (optionnel)</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Description de la matière..."
                  rows={2}
                />
              </div>
            </TabsContent>

            {/* Import CSV */}
            <TabsContent value="import" className="space-y-4 mt-0">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">Import CSV en masse</h4>
                    <p className="text-sm text-muted-foreground">
                      Importez un fichier CSV pour créer plusieurs matières à la fois
                    </p>
                  </div>
                  <GlassButton variant="outline" size="sm" onClick={downloadCSVTemplate}>
                    <Download className="h-4 w-4 mr-2" />
                    Modèle CSV
                  </GlassButton>
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleCSVFileSelect}
                />

                {/* Drop zone */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
                    "hover:border-primary hover:bg-primary/5",
                    csvSubjects.length > 0 ? "border-green-500/50 bg-green-500/5" : "border-muted-foreground/30"
                  )}
                >
                  <FileSpreadsheet className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium">Cliquez pour sélectionner un fichier CSV</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    ou glissez-déposez votre fichier ici
                  </p>
                </div>

                {/* CSV Preview */}
                {csvSubjects.length > 0 && (
                  <GlassCard className="p-4" solid>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                        <span className="font-medium">
                          {csvSubjects.length} matières détectées
                        </span>
                        <Badge variant="secondary">
                          {csvSubjects.filter(s => s.isValid).length} valides
                        </Badge>
                        {csvSubjects.some(s => !s.isValid) && (
                          <Badge variant="destructive">
                            {csvSubjects.filter(s => !s.isValid).length} erreurs
                          </Badge>
                        )}
                      </div>
                      <GlassButton
                        variant="ghost"
                        size="sm"
                        onClick={() => setCsvSubjects([])}
                      >
                        <X className="h-4 w-4" />
                      </GlassButton>
                    </div>

                    <div className="max-h-[250px] overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Nom</TableHead>
                            <TableHead>Code</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Coef.</TableHead>
                            <TableHead>Heures</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {csvSubjects.map((subject, idx) => {
                            const categoryInfo = CATEGORIES.find(c => c.value === subject.category);
                            return (
                              <TableRow key={idx} className={!subject.isValid ? "bg-destructive/10" : ""}>
                                <TableCell className="font-medium">{subject.name}</TableCell>
                                <TableCell>{subject.code || "-"}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className={cn("text-xs", categoryInfo?.color)}>
                                    {categoryInfo?.label || subject.category}
                                  </Badge>
                                </TableCell>
                                <TableCell>{subject.coefficient}</TableCell>
                                <TableCell>{subject.hours_per_week}h</TableCell>
                                <TableCell>
                                  {subject.isValid ? (
                                    <Badge variant="secondary" className="text-xs">
                                      <CheckCircle2 className="h-3 w-3 mr-1" />
                                      Valide
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive" className="text-xs">
                                      <AlertCircle className="h-3 w-3 mr-1" />
                                      {subject.error}
                                    </Badge>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <button
                                    onClick={() => removeCSVSubject(idx)}
                                    className="text-muted-foreground hover:text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {csvImporting && (
                      <div className="mt-4">
                        <Progress value={csvProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground mt-1 text-center">
                          Import en cours... {Math.round(csvProgress)}%
                        </p>
                      </div>
                    )}
                  </GlassCard>
                )}

                {/* Import avec IA */}
                <div className="border-t pt-4 mt-4">
                  <h5 className="font-medium text-sm mb-3 flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Ou utilisez l'import IA pour d'autres formats
                  </h5>
                  <MultiFileImport
                    context="subjects"
                    establishmentId={establishmentId}
                    onAnalysisComplete={(result: AnalysisResult) => {
                      if (result.success && Array.isArray(result.data)) {
                        // Pre-fill subjects from AI analysis
                        result.data.forEach((item: any) => {
                          if (item.name) {
                            setForm({
                              name: item.name || "",
                              code: item.code || "",
                              category: item.category || "general",
                              is_language: item.is_language || false,
                              language_code: item.language_code || "",
                              language_level: item.language_level || "",
                              coefficient: item.coefficient || 1,
                              hours_per_week: item.hours_per_week || 2,
                              is_mandatory: item.is_mandatory !== false,
                              color: "",
                              description: item.description || "",
                            });
                          }
                        });

                        if (result.data.length > 0) {
                          toast.success(`${result.data.length} matière(s) détectée(s). Vérifiez et ajoutez-les.`);
                          setActiveTab("add");
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter>
          <GlassButton variant="outline" onClick={() => onOpenChange(false)}>
            Fermer
          </GlassButton>
          {activeTab === "import" && csvSubjects.length > 0 && (
            <GlassButton
              onClick={handleCSVBulkImport}
              disabled={csvImporting || csvSubjects.filter(s => s.isValid).length === 0}
            >
              {csvImporting ? "Import en cours..." : `Importer ${csvSubjects.filter(s => s.isValid).length} matières`}
            </GlassButton>
          )}
          {activeTab === "add" && (
            <GlassButton onClick={handleAddSubject} disabled={loading}>
              {loading ? "Enregistrement..." : editingSubject ? "Modifier" : "Ajouter"}
            </GlassButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
