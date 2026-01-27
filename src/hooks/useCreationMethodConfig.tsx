import { useState, useEffect, useCallback, createContext, useContext, ReactNode } from "react";

export type CreationMethod = "1-step" | "2-step" | "3-step";
export type DisplayMode = "modal" | "fullpage";

export interface CreationMethodConfig {
  enabledMethods: CreationMethod[];
  setEnabledMethods: (methods: CreationMethod[]) => void;
  toggleMethod: (method: CreationMethod) => void;
  displayMode: DisplayMode;
  setDisplayMode: (mode: DisplayMode) => void;
  hasChanges: boolean;
  saveConfig: () => void;
  revertConfig: () => void;
  resetConfig: () => void;
}

const STORAGE_KEY = "establishment_creation_methods";
const DISPLAY_MODE_KEY = "establishment_display_mode";

const DEFAULT_METHODS: CreationMethod[] = ["1-step"];
const DEFAULT_DISPLAY_MODE: DisplayMode = "modal";

const CreationMethodContext = createContext<CreationMethodConfig | undefined>(undefined);

const getStoredMethods = (): CreationMethod[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as CreationMethod[];
      }
    } catch {
      // ignore parse errors
    }
  }
  return DEFAULT_METHODS;
};

const getStoredDisplayMode = (): DisplayMode => {
  const stored = localStorage.getItem(DISPLAY_MODE_KEY);
  if (stored === "modal" || stored === "fullpage") {
    return stored;
  }
  return DEFAULT_DISPLAY_MODE;
};

export const CreationMethodProvider = ({ children }: { children: ReactNode }) => {
  // Current working state
  const [enabledMethods, setEnabledMethodsState] = useState<CreationMethod[]>(getStoredMethods);
  const [displayMode, setDisplayModeState] = useState<DisplayMode>(getStoredDisplayMode);
  
  // Initial saved state (for tracking changes)
  const [savedMethods, setSavedMethods] = useState<CreationMethod[]>(getStoredMethods);
  const [savedDisplayMode, setSavedDisplayMode] = useState<DisplayMode>(getStoredDisplayMode);
  
  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  // Check for changes whenever state updates
  useEffect(() => {
    const methodsChanged = JSON.stringify(enabledMethods.sort()) !== JSON.stringify(savedMethods.sort());
    const displayChanged = displayMode !== savedDisplayMode;
    setHasChanges(methodsChanged || displayChanged);
  }, [enabledMethods, displayMode, savedMethods, savedDisplayMode]);

  const setEnabledMethods = useCallback((methods: CreationMethod[]) => {
    const finalMethods: CreationMethod[] = methods.length > 0 ? methods : ["1-step"];
    setEnabledMethodsState(finalMethods);
  }, []);

  const toggleMethod = useCallback((method: CreationMethod) => {
    setEnabledMethodsState(prev => {
      const newMethods = prev.includes(method)
        ? prev.filter(m => m !== method)
        : [...prev, method];
      return newMethods.length > 0 ? newMethods : ["1-step"];
    });
  }, []);

  const setDisplayMode = useCallback((mode: DisplayMode) => {
    setDisplayModeState(mode);
  }, []);

  const saveConfig = useCallback(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(enabledMethods));
    localStorage.setItem(DISPLAY_MODE_KEY, displayMode);
    setSavedMethods(enabledMethods);
    setSavedDisplayMode(displayMode);
  }, [enabledMethods, displayMode]);

  const revertConfig = useCallback(() => {
    setEnabledMethodsState(savedMethods);
    setDisplayModeState(savedDisplayMode);
  }, [savedMethods, savedDisplayMode]);

  const resetConfig = useCallback(() => {
    setEnabledMethodsState(DEFAULT_METHODS);
    setDisplayModeState(DEFAULT_DISPLAY_MODE);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_METHODS));
    localStorage.setItem(DISPLAY_MODE_KEY, DEFAULT_DISPLAY_MODE);
    setSavedMethods(DEFAULT_METHODS);
    setSavedDisplayMode(DEFAULT_DISPLAY_MODE);
  }, []);

  return (
    <CreationMethodContext.Provider value={{ 
      enabledMethods, 
      setEnabledMethods, 
      toggleMethod, 
      displayMode, 
      setDisplayMode,
      hasChanges,
      saveConfig,
      revertConfig,
      resetConfig,
    }}>
      {children}
    </CreationMethodContext.Provider>
  );
};

export const useCreationMethodConfig = (): CreationMethodConfig => {
  const context = useContext(CreationMethodContext);
  if (!context) {
    throw new Error("useCreationMethodConfig must be used within a CreationMethodProvider");
  }
  return context;
};

// Step configuration for each method
export const getStepsForMethod = (method: CreationMethod) => {
  switch (method) {
    case "1-step":
      return [
        {
          id: "all",
          label: "Configuration complète",
          tabs: ["informations", "niveaux", "modules", "administration"],
        },
      ];
    case "2-step":
      return [
        {
          id: "step1",
          label: "Informations",
          tabs: ["informations"],
        },
        {
          id: "step2",
          label: "Configuration",
          tabs: ["niveaux", "modules", "administration"],
        },
      ];
    case "3-step":
      return [
        {
          id: "step1",
          label: "Informations",
          tabs: ["informations"],
        },
        {
          id: "step2",
          label: "Structure",
          tabs: ["niveaux", "modules"],
        },
        {
          id: "step3",
          label: "Personnel",
          tabs: ["administration"],
        },
      ];
    default:
      return [
        {
          id: "all",
          label: "Configuration complète",
          tabs: ["informations", "niveaux", "modules", "administration"],
        },
      ];
  }
};

// Get method label
export const getMethodLabel = (method: CreationMethod): string => {
  switch (method) {
    case "1-step":
      return "1 étape (tout en un)";
    case "2-step":
      return "2 étapes";
    case "3-step":
      return "3 étapes";
    default:
      return method;
  }
};

// Get method description
export const getMethodDescription = (method: CreationMethod): string => {
  switch (method) {
    case "1-step":
      return "Informations + Niveaux + Modules + Personnel";
    case "2-step":
      return "(Informations) + (Niveaux + Modules + Personnel)";
    case "3-step":
      return "(Informations) + (Niveaux + Modules) + (Personnel)";
    default:
      return "";
  }
};

// Get short method label
export const getMethodShortLabel = (method: CreationMethod): string => {
  switch (method) {
    case "1-step":
      return "1 étape";
    case "2-step":
      return "2 étapes";
    case "3-step":
      return "3 étapes";
    default:
      return method;
  }
};
