import { useState, useEffect } from "react";
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
import { Building2, MapPin, Users, GraduationCap, School, Navigation, Loader2, MapPinned, AlertCircle, Map } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocationPickerMap } from "./LocationPickerMap";
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
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoAddress, setGeoAddress] = useState<string | null>(null);
  
  const [form, setForm] = useState({
    name: "",
    types: ["college"] as string[],
    address: "",
    phone: "",
    email: "",
    country_code: "GA",
    selectedLevels: [] as string[],
    group_id: groupId || null as string | null,
    options: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null,
  });

  // Génération automatique du code unique
  const generateUniqueCode = () => {
    const typePrefix = form.types[0]?.substring(0, 3).toUpperCase() || "ETB";
    const nameWords = form.name.trim().split(/\s+/);
    const nameInitials = nameWords
      .slice(0, 3)
      .map(word => word.charAt(0).toUpperCase())
      .join("");
    const countryCode = form.country_code.toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    
    return `${typePrefix}-${nameInitials || "XXX"}-${countryCode}-${randomSuffix}`;
  };

  const fetchGroups = async () => {
    try {
      console.log("Fetching groups...");
      const { data, error } = await supabase
        .from("establishment_groups")
        .select("id, name")
        .order("name");
      
      if (error) {
        console.error("Error fetching groups:", error);
        return;
      }
      
      console.log("Groups fetched:", data);
      setGroups(data || []);
    } catch (err) {
      console.error("Exception fetching groups:", err);
    }
  };

  // Charger les groupes au montage et quand le modal s'ouvre
  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  // Mettre à jour les niveaux sélectionnés quand les types changent
  useEffect(() => {
    const defaultLevels: string[] = [];
    form.types.forEach(typeValue => {
      const estType = ESTABLISHMENT_TYPES.find(t => t.value === typeValue);
      if (estType) {
        estType.defaultCycles.forEach(cycle => {
          const cycleData = EDUCATION_CYCLES[cycle as keyof typeof EDUCATION_CYCLES];
          if (cycleData) {
            cycleData.levels.forEach(level => {
              if (!defaultLevels.includes(level.id)) {
                defaultLevels.push(level.id);
              }
            });
          }
        });
      }
    });
    setForm(prev => ({ ...prev, selectedLevels: defaultLevels }));
  }, [form.types.join(",")]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      fetchGroups();
      setActiveTab("info");
      setGeoError(null);
      setGeoAddress(null);
      setForm({
        name: "",
        types: ["college"],
        address: "",
        phone: "",
        email: "",
        country_code: "GA",
        selectedLevels: [],
        group_id: groupId || null,
        options: [],
        latitude: null,
        longitude: null,
      });
    }
    onOpenChange(isOpen);
  };

  // Reverse geocoding pour obtenir l'adresse à partir des coordonnées
  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await response.json();
      if (data.address) {
        // Formater l'adresse au format standard français
        const addr = data.address;
        const parts: string[] = [];
        
        // Numéro + Rue
        const streetNumber = addr.house_number || '';
        const street = addr.road || addr.street || addr.pedestrian || '';
        if (streetNumber && street) {
          parts.push(`${streetNumber} ${street}`);
        } else if (street) {
          parts.push(street);
        }
        
        // Ville (prendre la première disponible)
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || '';
        if (city) {
          parts.push(city);
        }
        
        // Code postal
        const postcode = addr.postcode || '';
        if (postcode) {
          parts.push(postcode);
        }
        
        // Pays
        const country = addr.country || '';
        if (country) {
          parts.push(country);
        }
        
        const formattedAddress = parts.join(', ');
        setGeoAddress(formattedAddress);
        // Pré-remplir automatiquement l'adresse complète
        setForm(prev => ({ ...prev, address: formattedAddress }));
      }
    } catch (error) {
      console.error("Erreur de géocodage inverse:", error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas supportée par votre navigateur");
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setForm(prev => ({
          ...prev,
          latitude,
          longitude,
        }));
        setGeoLoading(false);
        toast.success("Position GPS capturée avec succès");
        // Récupérer l'adresse correspondante
        await reverseGeocode(latitude, longitude);
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Vous avez refusé l'accès à votre position. Veuillez autoriser la géolocalisation.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Les informations de localisation ne sont pas disponibles.");
            break;
          case error.TIMEOUT:
            setGeoError("La demande de localisation a expiré. Réessayez.");
            break;
          default:
            setGeoError("Une erreur inconnue s'est produite.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const clearLocation = () => {
    setForm(prev => ({ ...prev, latitude: null, longitude: null }));
    setGeoAddress(null);
    setGeoError(null);
  };

  // Handler pour la sélection sur la carte
  const handleMapLocationChange = async (lat: number, lng: number) => {
    setForm(prev => ({ ...prev, latitude: lat, longitude: lng }));
    toast.success("Position sélectionnée sur la carte");
    await reverseGeocode(lat, lng);
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

    if (form.latitude === null || form.longitude === null) {
      toast.error("La localisation GPS est obligatoire. Veuillez capturer la position de l'établissement.");
      setActiveTab("contact");
      return;
    }

    setLoading(true);
    try {
      const autoCode = generateUniqueCode();
      const { error } = await supabase.from("establishments").insert({
        name: form.name,
        code: autoCode,
        type: form.types.join(","),
        address: form.address || null,
        phone: form.phone || null,
        email: form.email || null,
        country_code: form.country_code,
        levels: getSelectedLevelsDisplay(),
        group_id: form.group_id,
        options: form.options.length > 0 ? form.options : null,
        latitude: form.latitude,
        longitude: form.longitude,
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

  const showOptions = form.types.some(t => ["lycee", "technique"].includes(t));

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

              <div className="space-y-2">
                <Label>Type(s) d'établissement * <span className="text-xs text-muted-foreground">(au moins un)</span></Label>
                <div className="flex flex-wrap gap-2">
                  {ESTABLISHMENT_TYPES.filter(t => !["complexe", "college_lycee", "primaire_college"].includes(t.value)).map((typeOption) => {
                    const isSelected = form.types.includes(typeOption.value);
                    return (
                      <button
                        key={typeOption.value}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            if (form.types.length > 1) {
                              setForm({ ...form, types: form.types.filter((t) => t !== typeOption.value) });
                            }
                          } else {
                            setForm({ ...form, types: [...form.types, typeOption.value] });
                          }
                        }}
                        className={cn(
                          "px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center gap-2",
                          isSelected
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                        )}
                      >
                        <span>{typeOption.icon}</span>
                        <span>{typeOption.label}</span>
                        {isSelected && <span>✓</span>}
                      </button>
                    );
                  })}
                </div>
                {form.types.length === 0 && (
                  <p className="text-sm text-destructive">Veuillez sélectionner au moins un type</p>
                )}
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
                  <SelectContent position="popper" className="max-h-60 z-[9999]">
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
              {/* Section GPS obligatoire */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-4 w-4 text-primary" />
                  <Label className="text-base font-semibold">Localisation GPS *</Label>
                </div>
                
                <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
                  <Navigation className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Important :</strong> Placez-vous à l'entrée principale de l'établissement (portail ou porte du bâtiment) avant de capturer la position GPS. Cette localisation servira de point de référence pour les visiteurs.
                  </AlertDescription>
                </Alert>

                {geoError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{geoError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-3">
                  {form.latitude !== null && form.longitude !== null ? (
                    <div className="p-4 rounded-lg border-2 border-green-500/50 bg-green-50 dark:bg-green-950/30">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
                            <MapPin className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-green-800 dark:text-green-200">Position capturée ✓</p>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              Lat: {form.latitude.toFixed(6)} | Long: {form.longitude.toFixed(6)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <GlassButton
                            variant="outline"
                            size="sm"
                            onClick={getCurrentLocation}
                            disabled={geoLoading}
                          >
                            {geoLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Recapturer"}
                          </GlassButton>
                          <GlassButton
                            variant="outline"
                            size="sm"
                            onClick={clearLocation}
                            className="text-destructive hover:text-destructive"
                          >
                            Effacer
                          </GlassButton>
                        </div>
                      </div>
                      {/* Carte interactive */}
                      <div className="mt-3">
                        <LocationPickerMap
                          latitude={form.latitude}
                          longitude={form.longitude}
                          onLocationChange={handleMapLocationChange}
                          className="[&_>_div:last-child]:h-[200px]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-6 rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 flex flex-col items-center gap-4">
                        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                          <Navigation className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                          <p className="font-medium">Aucune position GPS définie</p>
                          <p className="text-sm text-muted-foreground">
                            Capturez votre position actuelle ou sélectionnez sur la carte
                          </p>
                        </div>
                        <GlassButton
                          variant="primary"
                          onClick={getCurrentLocation}
                          disabled={geoLoading}
                          className="gap-2"
                        >
                          {geoLoading ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Recherche de la position...
                            </>
                          ) : (
                            <>
                              <Navigation className="h-4 w-4" />
                              Capturer ma position GPS
                            </>
                          )}
                        </GlassButton>
                      </div>

                      {/* Carte interactive pour sélection manuelle */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Ou sélectionner sur la carte</Label>
                        </div>
                        <LocationPickerMap
                          latitude={form.latitude}
                          longitude={form.longitude}
                          onLocationChange={handleMapLocationChange}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Adresse détectée + Coordonnées GPS (non modifiables) */}
                {form.latitude !== null && form.longitude !== null && (
                  <div className="pt-2 border-t space-y-3">
                    {geoAddress && (
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-foreground">{geoAddress}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Latitude</Label>
                        <Input
                          type="text"
                          value={form.latitude.toFixed(6)}
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Longitude</Label>
                        <Input
                          type="text"
                          value={form.longitude.toFixed(6)}
                          disabled
                          className="bg-muted cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>Adresse complète <span className="text-xs text-muted-foreground">(modifiable)</span></Label>
                <Textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Rue, quartier, ville, boîte postale..."
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Vous pouvez modifier ou compléter l'adresse pré-remplie ci-dessus.
                </p>
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
                    <span className="text-muted-foreground">Type(s):</span>{" "}
                    <span className="font-medium">
                      {form.types.map(t => ESTABLISHMENT_TYPES.find(et => et.value === t)?.label).filter(Boolean).join(", ")}
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
                  <div className="col-span-2">
                    <span className="text-muted-foreground">GPS:</span>{" "}
                    <span className={`font-medium ${form.latitude && form.longitude ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                      {form.latitude && form.longitude 
                        ? `${form.latitude.toFixed(6)}, ${form.longitude.toFixed(6)}` 
                        : "Non défini (obligatoire)"}
                    </span>
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
