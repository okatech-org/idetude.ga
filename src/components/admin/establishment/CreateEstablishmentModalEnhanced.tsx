import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
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
  Building2, MapPin, Users, GraduationCap, School, Navigation, 
  Loader2, MapPinned, AlertCircle, Map, Search, ChevronDown, 
  ChevronRight, Save, Clock, FolderOpen, CheckCircle2, Eye, Settings
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LocationPickerMap } from "../LocationPickerMap";
import { 
  EstablishmentFormData, EstablishmentDraft, StaffMember, DEFAULT_FORM_DATA 
} from "./types";
import {
  EDUCATION_CYCLES, ESTABLISHMENT_TYPES, TYPE_QUALIFICATIONS,
  EDUCATION_SYSTEM_CATEGORIES, EDUCATION_SYSTEMS, LANGUAGES, COUNTRIES,
  OPTIONS_LYCEE, getTeachingLanguagesFromSystems, getLanguageDesignation,
  getSelectedLevelsDisplay
} from "./constants";
import { useEstablishmentDraft } from "./useEstablishmentDraft";
import { StaffManagementTab } from "./StaffManagementTab";
import { DraftsList } from "./DraftsList";
import { ClassConfigTab } from "./ClassConfigTab";
import { LevelClassesConfig as LevelClassesConfigType } from "./classConfigTypes";
import { ValidatedInputWrapper } from "./FieldValidation";
import { ConfirmationStep } from "./ConfirmationStep";
import { SuccessAnimation } from "./SuccessAnimation";
import { ModulesConfigTab } from "./ModulesConfigTab";

interface CreateEstablishmentModalEnhancedProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  groupId?: string | null;
}

interface EstablishmentGroup {
  id: string;
  name: string;
}

export const CreateEstablishmentModalEnhanced = ({
  open,
  onOpenChange,
  onSuccess,
  groupId,
}: CreateEstablishmentModalEnhancedProps) => {
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<EstablishmentGroup[]>([]);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoAddress, setGeoAddress] = useState<string | null>(null);
  const [systemSearchTerm, setSystemSearchTerm] = useState("");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["francophone", "anglophone", "international"]);
  const [showDrafts, setShowDrafts] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [createdEstablishmentId, setCreatedEstablishmentId] = useState<string | null>(null);
  const [createdEstablishmentName, setCreatedEstablishmentName] = useState("");

  const {
    draftId,
    formData,
    staff,
    currentStep,
    isSaving,
    lastSaved,
    isDirty,
    updateFormData,
    updateStaff,
    updateStep,
    saveDraft,
    loadDraft,
    deleteDraft,
    resetDraft,
  } = useEstablishmentDraft({ autoSaveInterval: 30000 });

  // Update group_id when prop changes
  useEffect(() => {
    if (groupId && !formData.group_id) {
      updateFormData({ group_id: groupId });
    }
  }, [groupId, formData.group_id, updateFormData]);

  // Computed values
  const systemTeachingLanguages = getTeachingLanguagesFromSystems(formData.educationSystems);
  const languageDesignation = getLanguageDesignation(formData.educationSystems, formData.additionalTeachingLanguages);

  // Validation helpers
  const validation = {
    name: formData.name.trim().length >= 2,
    educationSystems: formData.educationSystems.length > 0,
    types: formData.typesWithQualification.length > 0,
    levels: formData.selectedLevels.length > 0,
    location: formData.latitude !== null && formData.longitude !== null,
    email: !formData.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email),
    phone: !formData.phone || formData.phone.length >= 8,
  };

  const isFormValid = validation.name && validation.educationSystems && 
    validation.types && validation.levels && validation.location;

  // Get group name for display
  const selectedGroupName = groups.find(g => g.id === formData.group_id)?.name;

  // Filter categories based on search
  const filteredCategories = EDUCATION_SYSTEM_CATEGORIES.map(category => ({
    ...category,
    systems: category.systems.filter(system =>
      system.label.toLowerCase().includes(systemSearchTerm.toLowerCase()) ||
      system.description.toLowerCase().includes(systemSearchTerm.toLowerCase())
    )
  })).filter(category => category.systems.length > 0);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const generateUniqueCode = () => {
    const firstType = formData.typesWithQualification[0]?.type || "ETB";
    const typePrefix = firstType.substring(0, 3).toUpperCase();
    const nameWords = formData.name.trim().split(/\s+/);
    const nameInitials = nameWords
      .slice(0, 3)
      .map(word => word.charAt(0).toUpperCase())
      .join("");
    const countryCode = formData.country_code.toUpperCase();
    const randomSuffix = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${typePrefix}-${nameInitials || "XXX"}-${countryCode}-${randomSuffix}`;
  };

  const fetchGroups = async () => {
    try {
      const { data, error } = await supabase
        .from("establishment_groups")
        .select("id, name")
        .order("name");
      
      if (error) return;
      setGroups(data || []);
    } catch (err) {
      console.error("Exception fetching groups:", err);
    }
  };

  useEffect(() => {
    if (open) {
      fetchGroups();
    }
  }, [open]);

  // Update levels when types change
  useEffect(() => {
    const defaultLevels: string[] = [];
    formData.typesWithQualification.forEach(twq => {
      const estType = ESTABLISHMENT_TYPES.find(t => t.value === twq.type);
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
    if (defaultLevels.length > 0 && formData.selectedLevels.length === 0) {
      updateFormData({ selectedLevels: defaultLevels });
    }
  }, [JSON.stringify(formData.typesWithQualification)]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      fetchGroups();
      setGeoError(null);
      setGeoAddress(null);
      setSystemSearchTerm("");
      setExpandedCategories(["francophone", "anglophone", "international"]);
      setShowDrafts(false);
    }
    onOpenChange(isOpen);
  };

  const reverseGeocode = async (lat: number, lon: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
        { headers: { 'Accept-Language': 'fr' } }
      );
      const data = await response.json();
      if (data.address) {
        const addr = data.address;
        const parts: string[] = [];
        
        const streetNumber = addr.house_number || '';
        const street = addr.road || addr.street || addr.pedestrian || '';
        if (streetNumber && street) {
          parts.push(`${streetNumber} ${street}`);
        } else if (street) {
          parts.push(street);
        }
        
        const city = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || '';
        if (city) parts.push(city);
        
        const postcode = addr.postcode || '';
        if (postcode) parts.push(postcode);
        
        const country = addr.country || '';
        if (country) parts.push(country);
        
        const formattedAddress = parts.join(', ');
        setGeoAddress(formattedAddress);
        updateFormData({ address: formattedAddress });
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
        updateFormData({ latitude, longitude });
        setGeoLoading(false);
        toast.success("Position GPS capturée avec succès");
        await reverseGeocode(latitude, longitude);
      },
      (error) => {
        setGeoLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGeoError("Vous avez refusé l'accès à votre position.");
            break;
          case error.POSITION_UNAVAILABLE:
            setGeoError("Les informations de localisation ne sont pas disponibles.");
            break;
          case error.TIMEOUT:
            setGeoError("La demande de localisation a expiré.");
            break;
          default:
            setGeoError("Une erreur inconnue s'est produite.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const clearLocation = () => {
    updateFormData({ latitude: null, longitude: null });
    setGeoAddress(null);
    setGeoError(null);
  };

  const handleMapLocationChange = async (lat: number, lng: number) => {
    updateFormData({ latitude: lat, longitude: lng });
    toast.success("Position sélectionnée sur la carte");
    await reverseGeocode(lat, lng);
  };

  const toggleLevel = (levelId: string) => {
    updateFormData({
      selectedLevels: formData.selectedLevels.includes(levelId)
        ? formData.selectedLevels.filter(l => l !== levelId)
        : [...formData.selectedLevels, levelId]
    });
  };

  const toggleCycle = (cycleKey: string) => {
    const cycle = EDUCATION_CYCLES[cycleKey as keyof typeof EDUCATION_CYCLES];
    if (!cycle) return;
    
    const cycleLevelIds = cycle.levels.map(l => l.id);
    const allSelected = cycleLevelIds.every(id => formData.selectedLevels.includes(id));
    
    if (allSelected) {
      updateFormData({
        selectedLevels: formData.selectedLevels.filter(id => !cycleLevelIds.includes(id))
      });
    } else {
      updateFormData({
        selectedLevels: [...new Set([...formData.selectedLevels, ...cycleLevelIds])]
      });
    }
  };

  const toggleOption = (option: string) => {
    updateFormData({
      options: formData.options.includes(option)
        ? formData.options.filter(o => o !== option)
        : [...formData.options, option]
    });
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error("Le nom est requis");
      return;
    }

    if (formData.educationSystems.length === 0) {
      toast.error("Veuillez sélectionner au moins un système éducatif");
      return;
    }

    if (formData.typesWithQualification.length === 0) {
      toast.error("Veuillez sélectionner au moins un type d'établissement");
      return;
    }

    if (formData.selectedLevels.length === 0) {
      toast.error("Veuillez sélectionner au moins un niveau");
      return;
    }

    if (formData.latitude === null || formData.longitude === null) {
      toast.error("La localisation GPS est obligatoire");
      updateStep("informations");
      return;
    }

    setLoading(true);
    try {
      const autoCode = generateUniqueCode();
      const typesForDb = formData.typesWithQualification
        .map(twq => twq.qualification ? `${twq.type}:${twq.qualification}` : twq.type)
        .join(",");
      
      const allOptions = [...formData.options];
      formData.educationSystems.forEach(sys => allOptions.push(`system:${sys}`));
      formData.additionalTeachingLanguages.forEach(lang => allOptions.push(`teaching_lang:${lang}`));
      if (languageDesignation) {
        allOptions.push(`designation:${languageDesignation.label.toLowerCase().replace(/ \/ /g, "_").replace(/ /g, "_")}`);
      }
      
      // Create establishment
      const { data: establishment, error: estError } = await supabase
        .from("establishments")
        .insert({
          name: formData.name,
          code: autoCode,
          type: typesForDb,
          address: formData.address || null,
          phone: formData.phone || null,
          email: formData.email || null,
          country_code: formData.country_code,
          levels: getSelectedLevelsDisplay(formData.selectedLevels),
          group_id: formData.group_id,
          options: allOptions.length > 0 ? allOptions : null,
          latitude: formData.latitude,
          longitude: formData.longitude,
          enabled_modules: formData.enabledModules,
        })
        .select()
        .single();

      if (estError) throw estError;

      // Create staff records if any
      if (staff.length > 0 && establishment) {
        const staffRecords = staff.map(s => ({
          establishment_id: establishment.id,
          staff_type: s.staff_type,
          position: s.position || null,
          department: s.department || null,
          contract_type: s.contract_type || null,
          start_date: s.start_date || null,
          is_active: s.is_active,
          metadata: JSON.parse(JSON.stringify(s.metadata || {})),
        }));

        const { error: staffError } = await supabase
          .from("establishment_staff")
          .insert(staffRecords);

        if (staffError) {
          console.error("Error creating staff:", staffError);
          toast.warning("Établissement créé, mais erreur lors de l'ajout du personnel");
        }
      }

      // Delete draft if exists
      await deleteDraft();

      // Compute full name for success animation
      const elements: Record<string, string> = {
        type: formData.typesWithQualification[0]
          ? ESTABLISHMENT_TYPES.find(t => t.value === formData.typesWithQualification[0].type)?.label || ""
          : "",
        qualification: formData.typesWithQualification[0]?.qualification || "",
        designation: languageDesignation?.label || "",
        name: formData.name || "",
      };
      const fullName = formData.nameElementsOrder
        .map(key => elements[key])
        .filter(Boolean)
        .join(" ");

      setCreatedEstablishmentId(establishment.id);
      setCreatedEstablishmentName(fullName);
      setShowConfirmation(false);
      setShowSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error("Error creating establishment:", error);
      toast.error("Erreur lors de la création");
      setLoading(false);
    }
  };

  const handleResumeDraft = (draft: EstablishmentDraft) => {
    loadDraft(draft);
    setShowDrafts(false);
    toast.success("Brouillon chargé");
  };

  const handleSuccessContinue = () => {
    setShowSuccess(false);
    onSuccess();
    resetDraft();
    onOpenChange(false);
    // Navigate to establishment config page
    if (createdEstablishmentId) {
      window.location.href = `/admin/establishments?config=${createdEstablishmentId}`;
    }
  };

  const handleNavigateFromConfirmation = (tab: string) => {
    setShowConfirmation(false);
    updateStep(tab);
  };

  const showOptions = formData.typesWithQualification.some(twq => ["lycee"].includes(twq.type));

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Building2 className="h-5 w-5" />
              {draftId ? "Reprendre la création" : "Nouvel établissement"}
            </DialogTitle>
            <div className="flex items-center gap-2">
              {lastSaved && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Sauvé {format(lastSaved, "HH:mm", { locale: fr })}
                </span>
              )}
              <GlassButton
                variant="outline"
                size="sm"
                onClick={() => saveDraft(true)}
                disabled={isSaving || !isDirty}
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Enregistrer
              </GlassButton>
              <GlassButton
                variant="ghost"
                size="sm"
                onClick={() => setShowDrafts(!showDrafts)}
              >
                <FolderOpen className="h-4 w-4" />
                Brouillons
              </GlassButton>
            </div>
          </div>
        </DialogHeader>

        {showDrafts && (
          <div className="px-6 py-2">
            <DraftsList
              onResume={handleResumeDraft}
              onDelete={() => {}}
            />
          </div>
        )}

        <Tabs value={currentStep} onValueChange={updateStep} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="informations" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span className="hidden sm:inline">Informations</span>
              </TabsTrigger>
              <TabsTrigger value="niveaux" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="hidden sm:inline">Niveaux</span>
              </TabsTrigger>
              <TabsTrigger value="modules" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Modules</span>
              </TabsTrigger>
              <TabsTrigger value="administration" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Personnel</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[55vh] px-6 mt-4">
            {/* Tab: Informations */}
            <TabsContent value="informations" className="space-y-4 mt-0">
              {/* Progress Indicator */}
              {(() => {
                const steps = [
                  { label: "Nom", complete: formData.name.trim().length > 0, icon: "✏️" },
                  { label: "Système éducatif", complete: formData.educationSystems.length > 0, icon: "📚" },
                  { label: "Type", complete: formData.typesWithQualification.length > 0, icon: "🏫" },
                  { label: "Niveaux", complete: formData.selectedLevels.length > 0, icon: "🎓" },
                  { label: "Localisation GPS", complete: formData.latitude !== null && formData.longitude !== null, icon: "📍" },
                ];
                const completedCount = steps.filter(s => s.complete).length;
                const progressPercent = Math.round((completedCount / steps.length) * 100);

                return (
                  <div className="p-4 rounded-lg border bg-gradient-to-r from-primary/5 via-background to-secondary/5">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium">Progression</span>
                      <span className={cn(
                        "text-sm font-semibold px-2 py-0.5 rounded-full",
                        progressPercent === 100 
                          ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {completedCount}/{steps.length} champs requis
                      </span>
                    </div>
                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
                      <div 
                        className={cn(
                          "h-full transition-all duration-500 rounded-full",
                          progressPercent === 100 
                            ? "bg-green-500" 
                            : progressPercent >= 60 
                              ? "bg-primary" 
                              : "bg-amber-500"
                        )}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {steps.map((step, idx) => (
                        <div 
                          key={idx}
                          className={cn(
                            "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors",
                            step.complete 
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" 
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          <span>{step.icon}</span>
                          <span>{step.label}</span>
                          {step.complete && <span className="text-green-600 dark:text-green-400">✓</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              <ValidatedInputWrapper
                label="Nom de l'établissement"
                required
                isValid={validation.name}
                isTouched={formData.name.length > 0}
                validMessage="Nom valide"
                invalidMessage="Le nom doit contenir au moins 2 caractères"
                helpText="Entrez le nom propre de l'établissement (ex: Saint-Michel, La Réussite)"
              >
                <Input
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Ex: Saint-Michel"
                  className={cn(
                    "text-base",
                    formData.name.length > 0 && (validation.name 
                      ? "border-green-500 focus-visible:ring-green-500/20" 
                      : "border-destructive focus-visible:ring-destructive/20")
                  )}
                />
              </ValidatedInputWrapper>

              {/* Name preview */}
              {(formData.name || formData.typesWithQualification.length > 0 || languageDesignation) && (
                <div className="space-y-3 p-4 rounded-lg border bg-gradient-to-r from-primary/5 to-secondary/5">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold flex items-center gap-2">
                      <School className="h-4 w-4" />
                      Prévisualisation du nom complet
                    </Label>
                    <span className="text-xs text-muted-foreground">Réorganisez les éléments ci-dessous</span>
                  </div>
                  
                  <div className="p-3 rounded-lg bg-background border-2 border-primary/30">
                    <p className="text-lg font-semibold text-center">
                      {(() => {
                        const elements: Record<string, string> = {
                          type: formData.typesWithQualification[0] 
                            ? ESTABLISHMENT_TYPES.find(t => t.value === formData.typesWithQualification[0].type)?.label || ""
                            : "",
                          qualification: formData.typesWithQualification[0]?.qualification || "",
                          designation: languageDesignation?.label || "",
                          name: formData.name || "..."
                        };
                        
                        return formData.nameElementsOrder
                          .map(key => elements[key])
                          .filter(Boolean)
                          .join(" ");
                      })()}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">Cliquez sur les flèches pour réorganiser :</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.nameElementsOrder.map((element, index) => {
                        const elementLabels: Record<string, { label: string; color: string; value: string }> = {
                          type: { 
                            label: "Type", 
                            color: "bg-blue-500/10 border-blue-500/30 text-blue-700 dark:text-blue-300",
                            value: formData.typesWithQualification[0] 
                              ? ESTABLISHMENT_TYPES.find(t => t.value === formData.typesWithQualification[0].type)?.label || "—"
                              : "—"
                          },
                          qualification: { 
                            label: "Qualification", 
                            color: "bg-purple-500/10 border-purple-500/30 text-purple-700 dark:text-purple-300",
                            value: formData.typesWithQualification[0]?.qualification || "—"
                          },
                          designation: { 
                            label: "Désignation", 
                            color: "bg-green-500/10 border-green-500/30 text-green-700 dark:text-green-300",
                            value: languageDesignation?.label || "—"
                          },
                          name: { 
                            label: "Nom", 
                            color: "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300",
                            value: formData.name || "—"
                          },
                        };
                        
                        const info = elementLabels[element];
                        
                        return (
                          <div key={element} className={cn(
                            "flex items-center gap-1 px-2 py-1.5 rounded-lg border text-sm",
                            info.color
                          )}>
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => {
                                const newOrder = [...formData.nameElementsOrder];
                                [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
                                updateFormData({ nameElementsOrder: newOrder });
                              }}
                              className={cn(
                                "p-0.5 rounded hover:bg-background/50",
                                index === 0 && "opacity-30 cursor-not-allowed"
                              )}
                            >
                              ◀
                            </button>
                            
                            <div className="flex flex-col items-center min-w-[60px]">
                              <span className="text-[10px] font-medium opacity-70">{info.label}</span>
                              <span className="font-semibold text-xs truncate max-w-[80px]">{info.value}</span>
                            </div>
                            
                            <button
                              type="button"
                              disabled={index === formData.nameElementsOrder.length - 1}
                              onClick={() => {
                                const newOrder = [...formData.nameElementsOrder];
                                [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                updateFormData({ nameElementsOrder: newOrder });
                              }}
                              className={cn(
                                "p-0.5 rounded hover:bg-background/50",
                                index === formData.nameElementsOrder.length - 1 && "opacity-30 cursor-not-allowed"
                              )}
                            >
                              ▶
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Education Systems */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Système(s) éducatif(s) *</Label>
                  {languageDesignation && (
                    <Badge variant="outline" className="bg-primary/10 border-primary text-primary">
                      {languageDesignation.icon} {languageDesignation.label}
                    </Badge>
                  )}
                </div>
                
                {formData.educationSystems.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                    {formData.educationSystems.map(sysValue => {
                      const system = EDUCATION_SYSTEMS.find(s => s.value === sysValue);
                      return system ? (
                        <Badge key={sysValue} variant="secondary" className="gap-2 pr-1">
                          <span>{system.icon}</span>
                          <span>{system.label}</span>
                          <button
                            type="button"
                            onClick={() => updateFormData({
                              educationSystems: formData.educationSystems.filter(s => s !== sysValue)
                            })}
                            className="ml-1 hover:bg-destructive/20 rounded p-0.5"
                          >
                            ✕
                          </button>
                        </Badge>
                      ) : null;
                    })}
                  </div>
                )}

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={systemSearchTerm}
                    onChange={(e) => setSystemSearchTerm(e.target.value)}
                    placeholder="Rechercher un système éducatif..."
                    className="pl-10"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                  {filteredCategories.map((category) => {
                    const isExpanded = expandedCategories.includes(category.id) || systemSearchTerm.length > 0;
                    const selectedInCategory = category.systems.filter(s => formData.educationSystems.includes(s.value)).length;
                    
                    return (
                      <div key={category.id} className="border rounded-lg overflow-hidden">
                        <button
                          type="button"
                          onClick={() => toggleCategory(category.id)}
                          className="w-full p-2 flex items-center justify-between bg-muted/50 hover:bg-muted transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            <span className="text-lg">{category.icon}</span>
                            <span className="font-medium text-sm">{category.label}</span>
                          </div>
                          {selectedInCategory > 0 && (
                            <Badge variant="default" className="text-xs">
                              {selectedInCategory}
                            </Badge>
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="grid grid-cols-2 gap-2 p-2 bg-background">
                            {category.systems.map((system) => {
                              const isSelected = formData.educationSystems.includes(system.value);
                              return (
                                <button
                                  key={system.value}
                                  type="button"
                                  onClick={() => {
                                    if (isSelected) {
                                      updateFormData({
                                        educationSystems: formData.educationSystems.filter(s => s !== system.value)
                                      });
                                    } else {
                                      updateFormData({
                                        educationSystems: [...formData.educationSystems, system.value]
                                      });
                                    }
                                  }}
                                  className={cn(
                                    "p-2 rounded-lg border text-left transition-all text-sm",
                                    isSelected
                                      ? "bg-primary/10 border-primary"
                                      : "bg-muted/30 border-transparent hover:bg-muted/50"
                                  )}
                                >
                                  <div className="flex items-center gap-2">
                                    <span>{system.icon}</span>
                                    <span className="font-medium">{system.label}</span>
                                    {isSelected && <span className="text-primary ml-auto">✓</span>}
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Types */}
              <div className="space-y-3">
                <Label>Type(s) d'établissement *</Label>
                
                <div className="space-y-2">
                  {formData.typesWithQualification.map((twq, index) => {
                    const typeInfo = ESTABLISHMENT_TYPES.find(t => t.value === twq.type);
                    const suggestions = TYPE_QUALIFICATIONS[twq.type] || [];
                    return (
                      <div key={index} className="flex items-center gap-2 p-3 rounded-lg border bg-primary/5 border-primary/20">
                        <span className="text-lg">{typeInfo?.icon}</span>
                        <span className="font-medium min-w-[100px]">{typeInfo?.label}</span>
                        <Select
                          value={twq.qualification || "none"}
                          onValueChange={(v) => {
                            const updated = [...formData.typesWithQualification];
                            updated[index] = { ...twq, qualification: v === "none" ? "" : v };
                            updateFormData({ typesWithQualification: updated });
                          }}
                        >
                          <SelectTrigger className="flex-1 h-8">
                            <SelectValue placeholder="Sélectionner une qualification" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Sans qualification</SelectItem>
                            {suggestions.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <button
                          type="button"
                          onClick={() => {
                            updateFormData({
                              typesWithQualification: formData.typesWithQualification.filter((_, i) => i !== index)
                            });
                          }}
                          className="text-destructive hover:bg-destructive/10 p-1 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {ESTABLISHMENT_TYPES.map((typeOption) => (
                    <button
                      key={typeOption.value}
                      type="button"
                      onClick={() => {
                        updateFormData({
                          typesWithQualification: [
                            ...formData.typesWithQualification,
                            { type: typeOption.value, qualification: "" }
                          ]
                        });
                      }}
                      className="px-3 py-2 rounded-lg border text-sm font-medium transition-all flex items-center gap-2 bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"
                    >
                      <span>{typeOption.icon}</span>
                      <span>{typeOption.label}</span>
                      <span className="text-primary">+</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Group and Country */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Groupe scolaire</Label>
                  <Select
                    value={formData.group_id || "none"}
                    onValueChange={(v) => updateFormData({ group_id: v === "none" ? null : v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Aucun groupe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Aucun groupe</SelectItem>
                      {groups.map((g) => (
                        <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pays</Label>
                  <Select
                    value={formData.country_code}
                    onValueChange={(v) => updateFormData({ country_code: v })}
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

              {/* Section Contact & Localisation */}
              <div className="pt-6 border-t space-y-4">
                <div className="flex items-center gap-2">
                  <MapPinned className="h-5 w-5 text-primary" />
                  <h3 className="text-base font-semibold">Localisation & Contact</h3>
                </div>

                <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/30">
                  <Navigation className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800 dark:text-amber-200">
                    <strong>Important :</strong> Placez-vous à l'entrée principale de l'établissement avant de capturer la position GPS.
                  </AlertDescription>
                </Alert>

                {geoError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{geoError}</AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col gap-3">
                  {formData.latitude !== null && formData.longitude !== null ? (
                    <div className="space-y-3">
                      <LocationPickerMap
                        latitude={formData.latitude}
                        longitude={formData.longitude}
                        onLocationChange={handleMapLocationChange}
                      />
                      <div className="flex justify-end">
                        <GlassButton variant="ghost" size="sm" onClick={clearLocation}>
                          Effacer la position
                        </GlassButton>
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
                              Recherche...
                            </>
                          ) : (
                            <>
                              <Navigation className="h-4 w-4" />
                              Capturer ma position GPS
                            </>
                          )}
                        </GlassButton>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Map className="h-4 w-4 text-muted-foreground" />
                          <Label className="text-sm font-medium">Ou sélectionner sur la carte</Label>
                        </div>
                        <LocationPickerMap
                          latitude={formData.latitude}
                          longitude={formData.longitude}
                          onLocationChange={handleMapLocationChange}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {formData.latitude !== null && formData.longitude !== null && (
                  <div className="pt-2 border-t space-y-3">
                    {geoAddress && (
                      <div className="p-3 rounded-lg bg-muted/50 border">
                        <p className="text-sm text-foreground">{geoAddress}</p>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Latitude</Label>
                        <Input value={formData.latitude.toFixed(6)} disabled className="bg-muted" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Longitude</Label>
                        <Input value={formData.longitude.toFixed(6)} disabled className="bg-muted" />
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Adresse complète</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => updateFormData({ address: e.target.value })}
                    placeholder="Rue, quartier, ville..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => updateFormData({ phone: e.target.value })}
                      placeholder="+241 01 XX XX XX"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => updateFormData({ email: e.target.value })}
                      placeholder="contact@etablissement.com"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Tab: Niveaux et Classes */}
            <TabsContent value="niveaux" className="space-y-4 mt-0">
              <ClassConfigTab
                selectedLevels={formData.selectedLevels}
                onSelectedLevelsChange={(levels) => updateFormData({ selectedLevels: levels })}
                classesConfig={formData.classesConfig}
                onClassesConfigChange={(config) => updateFormData({ classesConfig: config })}
                educationSystems={formData.educationSystems}
                options={formData.options}
                onOptionsChange={(opts) => updateFormData({ options: opts })}
                typesWithQualification={formData.typesWithQualification}
              />
            </TabsContent>

            {/* Tab: Modules */}
            <TabsContent value="modules" className="space-y-4 mt-0">
              <ModulesConfigTab
                enabledModules={formData.enabledModules}
                onModulesChange={(modules) => updateFormData({ enabledModules: modules })}
              />
            </TabsContent>

            {/* Tab: Personnel */}
            <TabsContent value="administration" className="space-y-4 mt-0">
              <StaffManagementTab
                staff={staff}
                onChange={updateStaff}
              />
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Confirmation View */}
        {showConfirmation && !showSuccess && (
          <div className="px-6">
            <ScrollArea className="h-[55vh]">
              <ConfirmationStep
                formData={formData}
                staff={staff}
                languageDesignation={languageDesignation}
                groupName={selectedGroupName}
                onNavigateToTab={handleNavigateFromConfirmation}
              />
            </ScrollArea>
          </div>
        )}

        {/* Success Animation */}
        {showSuccess && (
          <SuccessAnimation
            establishmentName={createdEstablishmentName}
            onContinue={handleSuccessContinue}
            autoRedirectDelay={4000}
          />
        )}

        <DialogFooter className="p-6 pt-4 border-t">
          {showConfirmation ? (
            <>
              <GlassButton 
                variant="outline" 
                onClick={() => setShowConfirmation(false)} 
                disabled={loading}
              >
                ← Retour
              </GlassButton>
              <GlassButton 
                variant="primary" 
                onClick={handleSubmit} 
                disabled={loading || !isFormValid}
                className="gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirmer la création
                  </>
                )}
              </GlassButton>
            </>
          ) : (
            <>
              <GlassButton 
                variant="outline" 
                onClick={() => onOpenChange(false)} 
                disabled={loading}
              >
                Annuler
              </GlassButton>
              <GlassButton 
                variant="primary" 
                onClick={() => setShowConfirmation(true)}
                disabled={!isFormValid}
                className="gap-2"
              >
                <Eye className="h-4 w-4" />
                Vérifier et créer
              </GlassButton>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
