import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { EstablishmentFormData, EstablishmentDraft, DEFAULT_FORM_DATA, StaffMember } from "./types";
import { toast } from "sonner";
import { Json } from "@/integrations/supabase/types";

interface UseDraftOptions {
  autoSaveInterval?: number; // in milliseconds
  onAutoSave?: () => void;
}

export const useEstablishmentDraft = (options: UseDraftOptions = {}) => {
  const { autoSaveInterval = 30000, onAutoSave } = options;
  
  const [draftId, setDraftId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EstablishmentFormData>(DEFAULT_FORM_DATA);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [currentStep, setCurrentStep] = useState("informations");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  const formDataRef = useRef(formData);
  const staffRef = useRef(staff);
  const currentStepRef = useRef(currentStep);
  
  // Keep refs in sync
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);
  
  useEffect(() => {
    staffRef.current = staff;
  }, [staff]);
  
  useEffect(() => {
    currentStepRef.current = currentStep;
  }, [currentStep]);

  const saveDraft = useCallback(async (showToast = false) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      setIsSaving(true);
      
      const draftData = {
        user_id: user.id,
        name: formDataRef.current.name || null,
        data: {
          ...formDataRef.current,
          staff: staffRef.current,
        } as unknown as Json,
        last_step: currentStepRef.current,
        status: 'draft' as const,
      };

      let result;
      
      if (draftId) {
        const { data, error } = await supabase
          .from("establishment_drafts")
          .update(draftData)
          .eq("id", draftId)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        const { data, error } = await supabase
          .from("establishment_drafts")
          .insert(draftData)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
        setDraftId(data.id);
      }
      
      setLastSaved(new Date());
      setIsDirty(false);
      
      if (showToast) {
        toast.success("Brouillon enregistré");
      }
      
      onAutoSave?.();
      return result;
    } catch (error) {
      console.error("Error saving draft:", error);
      if (showToast) {
        toast.error("Erreur lors de la sauvegarde");
      }
      return null;
    } finally {
      setIsSaving(false);
    }
  }, [draftId, onAutoSave]);

  const loadDraft = useCallback((draft: EstablishmentDraft) => {
    setDraftId(draft.id);
    const data = draft.data as EstablishmentFormData & { staff?: StaffMember[] };
    setFormData({
      name: data.name || "",
      educationSystems: data.educationSystems || [],
      additionalTeachingLanguages: data.additionalTeachingLanguages || [],
      typesWithQualification: data.typesWithQualification || [],
      address: data.address || "",
      phone: data.phone || "",
      email: data.email || "",
      country_code: data.country_code || "GA",
      selectedLevels: data.selectedLevels || [],
      group_id: data.group_id || null,
      options: data.options || [],
      latitude: data.latitude || null,
      longitude: data.longitude || null,
      nameElementsOrder: data.nameElementsOrder || ['type', 'qualification', 'designation', 'name'],
    });
    setStaff(data.staff || []);
    setCurrentStep(draft.last_step || "informations");
    setLastSaved(new Date(draft.updated_at));
    setIsDirty(false);
  }, []);

  const deleteDraft = useCallback(async () => {
    if (!draftId) return;
    
    try {
      await supabase
        .from("establishment_drafts")
        .delete()
        .eq("id", draftId);
      
      setDraftId(null);
    } catch (error) {
      console.error("Error deleting draft:", error);
    }
  }, [draftId]);

  const resetDraft = useCallback(() => {
    setDraftId(null);
    setFormData(DEFAULT_FORM_DATA);
    setStaff([]);
    setCurrentStep("informations");
    setLastSaved(null);
    setIsDirty(false);
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (!isDirty || autoSaveInterval <= 0) return;
    
    const timer = setTimeout(() => {
      saveDraft(false);
    }, autoSaveInterval);
    
    return () => clearTimeout(timer);
  }, [isDirty, autoSaveInterval, saveDraft]);

  // Mark as dirty when form changes
  const updateFormData = useCallback((updates: Partial<EstablishmentFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  }, []);

  const updateStaff = useCallback((newStaff: StaffMember[]) => {
    setStaff(newStaff);
    setIsDirty(true);
  }, []);

  const updateStep = useCallback((step: string) => {
    setCurrentStep(step);
    setIsDirty(true);
  }, []);

  return {
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
  };
};
