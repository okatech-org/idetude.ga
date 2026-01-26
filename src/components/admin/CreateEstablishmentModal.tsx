import { useState, useEffect } from "react";
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
import { Building2, MapPin, Users, GraduationCap, School } from "lucide-react";

interface CreateEstablishmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  groupId?: string | null;
}

interface EstablishmentGroup {
  id: string;
  name: string;
}

// Définition complète des cycles et niveaux scolaires
const EDUCATION_CYCLES = {
  maternelle: {
    label: "Maternelle",
    color: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    levels: [
      { id: "ps", label: "Petite Section (PS)", short: "PS" },
      { id: "ms", label: "Moyenne Section (MS)", short: "MS" },
      { id: "gs", label: "Grande Section (GS)", short: "GS" },
    ]
  },
  primaire: {
    label: "Primaire",
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    levels: [
      { id: "cp", label: "Cours Préparatoire (CP)", short: "CP" },
      { id: "ce1", label: "Cours Élémentaire 1 (CE1)", short: "CE1" },
      { id: "ce2", label: "Cours Élémentaire 2 (CE2)", short: "CE2" },
      { id: "cm1", label: "Cours Moyen 1 (CM1)", short: "CM1" },
      { id: "cm2", label: "Cours Moyen 2 (CM2)", short: "CM2" },
    ]
  },
  college: {
    label: "Collège",
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
    levels: [
      { id: "6eme", label: "Sixième (6ème)", short: "6ème" },
      { id: "5eme", label: "Cinquième (5ème)", short: "5ème" },
      { id: "4eme", label: "Quatrième (4ème)", short: "4ème" },
      { id: "3eme", label: "Troisième (3ème)", short: "3ème" },
    ]
  },
  lycee: {
    label: "Lycée",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
    levels: [
      { id: "2nde", label: "Seconde (2nde)", short: "2nde" },
      { id: "1ere", label: "Première (1ère)", short: "1ère" },
      { id: "tle", label: "Terminale (Tle)", short: "Tle" },
    ]
  },
  technique: {
    label: "Technique/Professionnel",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
    levels: [
      { id: "cap1", label: "CAP 1ère année", short: "CAP1" },
      { id: "cap2", label: "CAP 2ème année", short: "CAP2" },
      { id: "bep1", label: "BEP 1ère année", short: "BEP1" },
      { id: "bep2", label: "BEP 2ème année", short: "BEP2" },
      { id: "bac_pro1", label: "Bac Pro 1ère année", short: "BacPro1" },
      { id: "bac_pro2", label: "Bac Pro 2ème année", short: "BacPro2" },
      { id: "bac_pro3", label: "Bac Pro 3ème année", short: "BacPro3" },
    ]
  },
  superieur: {
    label: "Études Supérieures",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200",
    levels: [
      { id: "l1", label: "Licence 1 (L1)", short: "L1" },
      { id: "l2", label: "Licence 2 (L2)", short: "L2" },
      { id: "l3", label: "Licence 3 (L3)", short: "L3" },
      { id: "m1", label: "Master 1 (M1)", short: "M1" },
      { id: "m2", label: "Master 2 (M2)", short: "M2" },
      { id: "d1", label: "Doctorat 1ère année", short: "D1" },
      { id: "d2", label: "Doctorat 2ème année", short: "D2" },
      { id: "d3", label: "Doctorat 3ème année", short: "D3" },
      { id: "bts1", label: "BTS 1ère année", short: "BTS1" },
      { id: "bts2", label: "BTS 2ème année", short: "BTS2" },
      { id: "dut1", label: "DUT/BUT 1ère année", short: "DUT1" },
      { id: "dut2", label: "DUT/BUT 2ème année", short: "DUT2" },
      { id: "dut3", label: "DUT/BUT 3ème année", short: "DUT3" },
    ]
  }
};

// Types d'établissements avec leurs cycles associés par défaut
const ESTABLISHMENT_TYPES = [
  { value: "maternelle", label: "Maternelle", defaultCycles: ["maternelle"], icon: "🏒" },
  { value: "primaire", label: "École Primaire", defaultCycles: ["primaire"], icon: "📚" },
  { value: "maternelle_primaire", label: "Maternelle + Primaire", defaultCycles: ["maternelle", "primaire"], icon: "🏫" },
  { value: "college", label: "Collège", defaultCycles: ["college"], icon: "🎓" },
  { value: "lycee", label: "Lycée", defaultCycles: ["lycee"], icon: "📖" },
  { value: "college_lycee", label: "Collège + Lycée", defaultCycles: ["college", "lycee"], icon: "🏛️" },
  { value: "technique", label: "Lycée Technique/Professionnel", defaultCycles: ["technique"], icon: "🔧" },
  { value: "superieur", label: "Enseignement Supérieur", defaultCycles: ["superieur"], icon: "🎓" },
  { value: "complexe", label: "Complexe Scolaire (Tout)", defaultCycles: ["maternelle", "primaire", "college", "lycee"], icon: "🏢" },
  { value: "universite", label: "Université", defaultCycles: ["superieur"], icon: "🏛️" },
];

const COUNTRIES = [
  { code: "GA", name: "Gabon", flag: "🇬🇦" },
  { code: "CD", name: "République Démocratique du Congo", flag: "🇨🇩" },
  { code: "CG", name: "République du Congo", flag: "🇨🇬" },
  { code: "CM", name: "Cameroun", flag: "🇨🇲" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮" },
  { code: "SN", name: "Sénégal", flag: "🇸🇳" },
  { code: "ML", name: "Mali", flag: "🇲🇱" },
  { code: "BF", name: "Burkina Faso", flag: "🇧🇫" },
  { code: "TG", name: "Togo", flag: "🇹🇬" },
  { code: "BJ", name: "Bénin", flag: "🇧🇯" },
  { code: "GN", name: "Guinée", flag: "🇬🇳" },
  { code: "TD", name: "Tchad", flag: "🇹🇩" },
  { code: "CF", name: "République Centrafricaine", flag: "🇨🇫" },
  { code: "NE", name: "Niger", flag: "🇳🇪" },
  { code: "MG", name: "Madagascar", flag: "🇲🇬" },
  { code: "FR", name: "France", flag: "🇫🇷" },
  { code: "BE", name: "Belgique", flag: "🇧🇪" },
  { code: "CH", name: "Suisse", flag: "🇨🇭" },
  { code: "CA", name: "Canada", flag: "🇨🇦" },
];

const OPTIONS_LYCEE = [
  "Série A (Littéraire)",
  "Série B (Économique)",
  "Série C (Scientifique Math)",
  "Série D (Scientifique Bio)",
  "Série S (Scientifique)",
  "Série ES (Économique et Social)",
  "Série L (Littéraire)",
  "Série STI2D",
  "Série STMG",
  "Série STL",
  "Série ST2S",
];

export const CreateEstablishmentModal = ({
  open,
  onOpenChange,
  onSuccess,
  groupId,
}: CreateEstablishmentModalProps) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<EstablishmentGroup[]>([]);
  const [activeTab, setActiveTab] = useState("info");
  
  const [form, setForm] = useState({
    name: "",
    code: "",
    type: "college" as string,
    address: "",
    phone: "",
    email: "",
    country_code: "GA",
    selectedLevels: [] as string[],
    student_capacity: 500,
    group_id: groupId || null as string | null,
    options: [] as string[],
  });

  const fetchGroups = async () => {
    const { data } = await supabase
      .from("establishment_groups")
      .select("id, name")
      .order("name");
    setGroups(data || []);
  };

  // Mettre à jour les niveaux sélectionnés quand le type change
  useEffect(() => {
    const estType = ESTABLISHMENT_TYPES.find(t => t.value === form.type);
    if (estType) {
      const defaultLevels: string[] = [];
      estType.defaultCycles.forEach(cycle => {
        const cycleData = EDUCATION_CYCLES[cycle as keyof typeof EDUCATION_CYCLES];
        if (cycleData) {
          cycleData.levels.forEach(level => defaultLevels.push(level.id));
        }
      });
      setForm(prev => ({ ...prev, selectedLevels: defaultLevels }));
    }
  }, [form.type]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      fetchGroups();
      setActiveTab("info");
      setForm({
        name: "",
        code: "",
        type: "college",
        address: "",
        phone: "",
        email: "",
        country_code: "GA",
        selectedLevels: [],
        student_capacity: 500,
        group_id: groupId || null,
        options: [],
      });
    }
    onOpenChange(isOpen);
  };

  const toggleLevel = (levelId: string) => {
    setForm(prev => ({
      ...prev,
      selectedLevels: prev.selectedLevels.includes(levelId)
        ? prev.selectedLevels.filter(l => l !== levelId)
        : [...prev.selectedLevels, levelId]
    }));
  };

  const toggleCycle = (cycleKey: string) => {
    const cycle = EDUCATION_CYCLES[cycleKey as keyof typeof EDUCATION_CYCLES];
    if (!cycle) return;
    
    const cycleLevelIds = cycle.levels.map(l => l.id);
    const allSelected = cycleLevelIds.every(id => form.selectedLevels.includes(id));
    
    if (allSelected) {
      setForm(prev => ({
        ...prev,
        selectedLevels: prev.selectedLevels.filter(id => !cycleLevelIds.includes(id))
      }));
    } else {
      setForm(prev => ({
        ...prev,
        selectedLevels: [...new Set([...prev.selectedLevels, ...cycleLevelIds])]
      }));
    }
  };

  const toggleOption = (option: string) => {
    setForm(prev => ({
      ...prev,
      options: prev.options.includes(option)
        ? prev.options.filter(o => o !== option)
        : [...prev.options, option]
    }));
  };

  const getSelectedLevelsDisplay = () => {
    const levels: string[] = [];
    Object.entries(EDUCATION_CYCLES).forEach(([_, cycle]) => {
      cycle.levels.forEach(level => {
        if (form.selectedLevels.includes(level.id)) {
          levels.push(level.short);
        }
      });
    });
    return levels.join(", ") || "Aucun niveau sélectionné";
  };

  const handleSubmit = async () => {
    if (!form.name) {
      toast.error("Le nom est requis");
      return;
    }

    if (form.selectedLevels.length === 0) {
      toast.error("Veuillez sélectionner au moins un niveau");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("establishments").insert({
        name: form.name,
        code: form.code || null,
        type: form.type,
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        country_code: form.country_code,
        levels: getSelectedLevelsDisplay(),
        student_capacity: form.student_capacity,
        group_id: form.group_id,
        options: form.options.length > 0 ? form.options : null,
      });

      if (error) throw error;

      toast.success("Établissement créé avec succès");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating establishment:", error);
      toast.error("Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  const showOptions = ["lycee", "college_lycee", "technique", "complexe"].includes(form.type);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Building2 className="h-5 w-5" />
            Nouvel établissement
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Informations
            </TabsTrigger>
            <TabsTrigger value="levels" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Niveaux
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Contact
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[55vh] mt-4 pr-4">
            <TabsContent value="info" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Nom de l'établissement *</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: Lycée d'Excellence de Libreville"
                  className="text-base"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Code unique</Label>
                  <Input
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="Ex: LYC-EXC-LBV"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type d'établissement *</Label>
                  <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTABLISHMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <span className="flex items-center gap-2">
                            <span>{type.icon}</span>
                            <span>{type.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Groupe scolaire</Label>
                <Select
                  value={form.group_id || "none"}
                  onValueChange={(v) => setForm({ ...form, group_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Aucun groupe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Aucun groupe (indépendant)</SelectItem>
                    {groups.map((g) => (
                      <SelectItem key={g.id} value={g.id}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select
                    value={form.country_code}
                    onValueChange={(v) => setForm({ ...form, country_code: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          <span className="flex items-center gap-2">
                            <span>{country.flag}</span>
                            <span>{country.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Capacité d'élèves
                  </Label>
                  <Input
                    type="number"
                    value={form.student_capacity}
                    onChange={(e) => setForm({ ...form, student_capacity: parseInt(e.target.value) || 500 })}
                    min={1}
                  />
                </div>
              </div>

              {/* Résumé des niveaux sélectionnés */}
              <div className="p-4 rounded-lg bg-muted/50 border">
                <Label className="text-sm text-muted-foreground">Niveaux sélectionnés</Label>
                <p className="text-sm font-medium mt-1">
                  {getSelectedLevelsDisplay()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Modifiez dans l'onglet "Niveaux"
                </p>
              </div>
            </TabsContent>

            <TabsContent value="levels" className="space-y-4 mt-0">
              <div className="p-3 rounded-lg bg-muted/50 border mb-4">
                <p className="text-sm text-muted-foreground">
                  Sélectionnez les niveaux enseignés dans cet établissement. Cliquez sur un cycle pour tout sélectionner/désélectionner.
                </p>
              </div>

              {Object.entries(EDUCATION_CYCLES).map(([cycleKey, cycle]) => {
                const cycleLevelIds = cycle.levels.map(l => l.id);
                const selectedCount = cycleLevelIds.filter(id => form.selectedLevels.includes(id)).length;
                const allSelected = selectedCount === cycleLevelIds.length;
                const someSelected = selectedCount > 0 && !allSelected;

                return (
                  <div key={cycleKey} className="border rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={() => toggleCycle(cycleKey)}
                      className={`w-full p-3 flex items-center justify-between ${cycle.color} hover:opacity-90 transition-opacity`}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={allSelected}
                          className="pointer-events-none"
                          // @ts-ignore
                          indeterminate={someSelected}
                        />
                        <span className="font-semibold">{cycle.label}</span>
                      </div>
                      <Badge variant="secondary" className="bg-white/50">
                        {selectedCount}/{cycleLevelIds.length}
                      </Badge>
                    </button>
                    <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2 bg-background">
                      {cycle.levels.map((level) => (
                        <label
                          key={level.id}
                          className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                            form.selectedLevels.includes(level.id) ? "bg-muted" : ""
                          }`}
                        >
                          <Checkbox
                            checked={form.selectedLevels.includes(level.id)}
                            onCheckedChange={() => toggleLevel(level.id)}
                          />
                          <span className="text-sm">{level.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Options pour lycée */}
              {showOptions && (
                <div className="border rounded-lg overflow-hidden mt-4">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/50">
                    <span className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
                      <School className="h-4 w-4" />
                      Séries / Options disponibles
                    </span>
                  </div>
                  <div className="p-3 grid grid-cols-2 gap-2 bg-background">
                    {OPTIONS_LYCEE.map((option) => (
                      <label
                        key={option}
                        className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors ${
                          form.options.includes(option) ? "bg-muted" : ""
                        }`}
                      >
                        <Checkbox
                          checked={form.options.includes(option)}
                          onCheckedChange={() => toggleOption(option)}
                        />
                        <span className="text-sm">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="contact" className="space-y-4 mt-0">
              <div className="space-y-2">
                <Label>Adresse complète</Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Rue, quartier, ville, boîte postale..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+241 01 XX XX XX"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="contact@etablissement.com"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg border bg-muted/30">
                <h4 className="font-medium mb-2">Récapitulatif</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>{" "}
                    <span className="font-medium">
                      {ESTABLISHMENT_TYPES.find(t => t.value === form.type)?.label}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Pays:</span>{" "}
                    <span className="font-medium">
                      {COUNTRIES.find(c => c.code === form.country_code)?.flag}{" "}
                      {COUNTRIES.find(c => c.code === form.country_code)?.name}
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Niveaux:</span>{" "}
                    <span className="font-medium">{getSelectedLevelsDisplay()}</span>
                  </div>
                  {form.options.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Options:</span>{" "}
                      <span className="font-medium">{form.options.join(", ")}</span>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <DialogFooter className="mt-4">
          <GlassButton variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Annuler
          </GlassButton>
          <GlassButton variant="primary" onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer l'établissement"}
          </GlassButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
