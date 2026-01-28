// State Machine pour le Wizard de création d'établissement
// Recommandation #10: Wizard state machine (reducer pattern)

import { useReducer, useCallback } from "react";
import { EstablishmentFormData, DEFAULT_FORM_VALUES, StaffMember } from "./validation";

// Types pour les étapes du wizard
export type WizardStep =
    | "method_selection"
    | "informations"
    | "niveaux"
    | "modules"
    | "administration"
    | "confirmation"
    | "success";

export type CreationMethod = "1-step" | "2-step" | "3-step";

export type DisplayMode = "modal" | "fullpage";

// État du wizard
export interface WizardState {
    // Navigation
    currentStep: WizardStep;
    wizardStepIndex: number;
    creationMethod: CreationMethod | null;
    displayMode: DisplayMode;

    // Données
    formData: EstablishmentFormData;
    staff: StaffMember[];

    // UI State
    isLoading: boolean;
    isSaving: boolean;
    isDirty: boolean;
    showDrafts: boolean;
    showConfirmation: boolean;
    showSuccess: boolean;

    // Résultat
    createdEstablishmentId: string | null;
    createdEstablishmentName: string | null;

    // Erreurs
    errors: Record<string, string>;

    // Draft
    draftId: string | null;
    lastSaved: Date | null;
}

// Actions du wizard
type WizardAction =
    | { type: "SET_STEP"; payload: WizardStep }
    | { type: "NEXT_STEP" }
    | { type: "PREV_STEP" }
    | { type: "SET_WIZARD_INDEX"; payload: number }
    | { type: "SET_CREATION_METHOD"; payload: CreationMethod }
    | { type: "SET_DISPLAY_MODE"; payload: DisplayMode }
    | { type: "UPDATE_FORM_DATA"; payload: Partial<EstablishmentFormData> }
    | { type: "SET_FORM_DATA"; payload: EstablishmentFormData }
    | { type: "UPDATE_STAFF"; payload: StaffMember[] }
    | { type: "ADD_STAFF"; payload: StaffMember }
    | { type: "REMOVE_STAFF"; payload: string }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_SAVING"; payload: boolean }
    | { type: "SET_DIRTY"; payload: boolean }
    | { type: "TOGGLE_DRAFTS" }
    | { type: "SET_SHOW_CONFIRMATION"; payload: boolean }
    | { type: "SET_SHOW_SUCCESS"; payload: boolean }
    | { type: "SET_CREATED_ESTABLISHMENT"; payload: { id: string; name: string } }
    | { type: "SET_ERRORS"; payload: Record<string, string> }
    | { type: "CLEAR_ERROR"; payload: string }
    | { type: "SET_DRAFT"; payload: { id: string; lastSaved: Date } }
    | { type: "RESET" }
    | { type: "LOAD_DRAFT"; payload: { formData: EstablishmentFormData; staff: StaffMember[]; draftId: string } };

// État initial
const initialState: WizardState = {
    currentStep: "method_selection",
    wizardStepIndex: 0,
    creationMethod: null,
    displayMode: "modal",
    formData: DEFAULT_FORM_VALUES,
    staff: [],
    isLoading: false,
    isSaving: false,
    isDirty: false,
    showDrafts: false,
    showConfirmation: false,
    showSuccess: false,
    createdEstablishmentId: null,
    createdEstablishmentName: null,
    errors: {},
    draftId: null,
    lastSaved: null,
};

// Configuration des étapes par méthode
export const WIZARD_STEPS_CONFIG: Record<CreationMethod, { id: WizardStep; label: string; tabs: WizardStep[] }[]> = {
    "1-step": [
        { id: "informations", label: "Configuration", tabs: ["informations", "niveaux", "modules", "administration"] },
    ],
    "2-step": [
        { id: "informations", label: "Identité & Niveaux", tabs: ["informations", "niveaux"] },
        { id: "modules", label: "Modules & Personnel", tabs: ["modules", "administration"] },
    ],
    "3-step": [
        { id: "informations", label: "Identité", tabs: ["informations"] },
        { id: "niveaux", label: "Structure", tabs: ["niveaux", "modules"] },
        { id: "administration", label: "Personnel", tabs: ["administration"] },
    ],
};

// Ordre des étapes pour navigation
const STEP_ORDER: WizardStep[] = [
    "method_selection",
    "informations",
    "niveaux",
    "modules",
    "administration",
    "confirmation",
    "success",
];

// Reducer
function wizardReducer(state: WizardState, action: WizardAction): WizardState {
    switch (action.type) {
        case "SET_STEP":
            return { ...state, currentStep: action.payload, isDirty: true };

        case "NEXT_STEP": {
            const currentIndex = STEP_ORDER.indexOf(state.currentStep);
            const nextStep = STEP_ORDER[currentIndex + 1] || state.currentStep;
            return { ...state, currentStep: nextStep };
        }

        case "PREV_STEP": {
            const currentIndex = STEP_ORDER.indexOf(state.currentStep);
            const prevStep = STEP_ORDER[Math.max(0, currentIndex - 1)];
            return { ...state, currentStep: prevStep };
        }

        case "SET_WIZARD_INDEX":
            return { ...state, wizardStepIndex: action.payload };

        case "SET_CREATION_METHOD":
            return {
                ...state,
                creationMethod: action.payload,
                currentStep: "informations",
                wizardStepIndex: 0,
            };

        case "SET_DISPLAY_MODE":
            return { ...state, displayMode: action.payload };

        case "UPDATE_FORM_DATA":
            return {
                ...state,
                formData: { ...state.formData, ...action.payload },
                isDirty: true,
            };

        case "SET_FORM_DATA":
            return { ...state, formData: action.payload, isDirty: true };

        case "UPDATE_STAFF":
            return { ...state, staff: action.payload, isDirty: true };

        case "ADD_STAFF":
            return {
                ...state,
                staff: [...state.staff, action.payload],
                isDirty: true,
            };

        case "REMOVE_STAFF":
            return {
                ...state,
                staff: state.staff.filter(s => s.id !== action.payload),
                isDirty: true,
            };

        case "SET_LOADING":
            return { ...state, isLoading: action.payload };

        case "SET_SAVING":
            return { ...state, isSaving: action.payload };

        case "SET_DIRTY":
            return { ...state, isDirty: action.payload };

        case "TOGGLE_DRAFTS":
            return { ...state, showDrafts: !state.showDrafts };

        case "SET_SHOW_CONFIRMATION":
            return { ...state, showConfirmation: action.payload };

        case "SET_SHOW_SUCCESS":
            return { ...state, showSuccess: action.payload };

        case "SET_CREATED_ESTABLISHMENT":
            return {
                ...state,
                createdEstablishmentId: action.payload.id,
                createdEstablishmentName: action.payload.name,
            };

        case "SET_ERRORS":
            return { ...state, errors: action.payload };

        case "CLEAR_ERROR": {
            const { [action.payload]: _, ...remainingErrors } = state.errors;
            return { ...state, errors: remainingErrors };
        }

        case "SET_DRAFT":
            return {
                ...state,
                draftId: action.payload.id,
                lastSaved: action.payload.lastSaved,
                isDirty: false,
            };

        case "LOAD_DRAFT":
            return {
                ...state,
                formData: action.payload.formData,
                staff: action.payload.staff,
                draftId: action.payload.draftId,
                isDirty: false,
                currentStep: "informations",
            };

        case "RESET":
            return { ...initialState };

        default:
            return state;
    }
}

// Hook principal
export function useWizardStateMachine(initialDisplayMode: DisplayMode = "modal") {
    const [state, dispatch] = useReducer(wizardReducer, {
        ...initialState,
        displayMode: initialDisplayMode,
    });

    // Actions mémorisées
    const actions = {
        setStep: useCallback((step: WizardStep) => {
            dispatch({ type: "SET_STEP", payload: step });
        }, []),

        nextStep: useCallback(() => {
            dispatch({ type: "NEXT_STEP" });
        }, []),

        prevStep: useCallback(() => {
            dispatch({ type: "PREV_STEP" });
        }, []),

        setWizardIndex: useCallback((index: number) => {
            dispatch({ type: "SET_WIZARD_INDEX", payload: index });
        }, []),

        setCreationMethod: useCallback((method: CreationMethod) => {
            dispatch({ type: "SET_CREATION_METHOD", payload: method });
        }, []),

        toggleDisplayMode: useCallback(() => {
            dispatch({
                type: "SET_DISPLAY_MODE",
                payload: state.displayMode === "modal" ? "fullpage" : "modal",
            });
        }, [state.displayMode]),

        updateFormData: useCallback((data: Partial<EstablishmentFormData>) => {
            dispatch({ type: "UPDATE_FORM_DATA", payload: data });
        }, []),

        setFormData: useCallback((data: EstablishmentFormData) => {
            dispatch({ type: "SET_FORM_DATA", payload: data });
        }, []),

        updateStaff: useCallback((staff: StaffMember[]) => {
            dispatch({ type: "UPDATE_STAFF", payload: staff });
        }, []),

        addStaff: useCallback((staff: StaffMember) => {
            dispatch({ type: "ADD_STAFF", payload: staff });
        }, []),

        removeStaff: useCallback((id: string) => {
            dispatch({ type: "REMOVE_STAFF", payload: id });
        }, []),

        setLoading: useCallback((loading: boolean) => {
            dispatch({ type: "SET_LOADING", payload: loading });
        }, []),

        setSaving: useCallback((saving: boolean) => {
            dispatch({ type: "SET_SAVING", payload: saving });
        }, []),

        toggleDrafts: useCallback(() => {
            dispatch({ type: "TOGGLE_DRAFTS" });
        }, []),

        showConfirmation: useCallback(() => {
            dispatch({ type: "SET_SHOW_CONFIRMATION", payload: true });
        }, []),

        hideConfirmation: useCallback(() => {
            dispatch({ type: "SET_SHOW_CONFIRMATION", payload: false });
        }, []),

        showSuccess: useCallback((id: string, name: string) => {
            dispatch({ type: "SET_CREATED_ESTABLISHMENT", payload: { id, name } });
            dispatch({ type: "SET_SHOW_SUCCESS", payload: true });
        }, []),

        setErrors: useCallback((errors: Record<string, string>) => {
            dispatch({ type: "SET_ERRORS", payload: errors });
        }, []),

        clearError: useCallback((field: string) => {
            dispatch({ type: "CLEAR_ERROR", payload: field });
        }, []),

        setDraft: useCallback((id: string) => {
            dispatch({ type: "SET_DRAFT", payload: { id, lastSaved: new Date() } });
        }, []),

        loadDraft: useCallback((formData: EstablishmentFormData, staff: StaffMember[], draftId: string) => {
            dispatch({ type: "LOAD_DRAFT", payload: { formData, staff, draftId } });
        }, []),

        reset: useCallback(() => {
            dispatch({ type: "RESET" });
        }, []),
    };

    // Computed values
    const computed = {
        canGoNext: state.currentStep !== "success" && state.currentStep !== "confirmation",
        canGoPrev: state.currentStep !== "method_selection" && state.currentStep !== "success",
        isFirstStep: state.currentStep === "method_selection" || state.currentStep === "informations",
        isLastStep: state.currentStep === "administration",
        currentStepConfig: state.creationMethod
            ? WIZARD_STEPS_CONFIG[state.creationMethod][state.wizardStepIndex]
            : null,
        stepCount: state.creationMethod ? WIZARD_STEPS_CONFIG[state.creationMethod].length : 0,
    };

    return { state, actions, computed };
}

export type WizardStateMachine = ReturnType<typeof useWizardStateMachine>;
