import { useState, createContext, useContext, ReactNode } from "react";

export type CreationMethod = "1-step" | "2-step" | "3-step";

export interface CreationMethodConfig {
  enabledMethods: CreationMethod[];
  setEnabledMethods: (methods: CreationMethod[]) => void;
  toggleMethod: (method: CreationMethod) => void;
}

const STORAGE_KEY = "establishment_creation_methods";

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
  return ["1-step"];
};

export const CreationMethodProvider = ({ children }: { children: ReactNode }) => {
  const [enabledMethods, setEnabledMethodsState] = useState<CreationMethod[]>(getStoredMethods);

  const setEnabledMethods = (methods: CreationMethod[]) => {
    const finalMethods: CreationMethod[] = methods.length > 0 ? methods : ["1-step"];
    setEnabledMethodsState(finalMethods);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(finalMethods));
  };

  const toggleMethod = (method: CreationMethod) => {
    const newMethods = enabledMethods.includes(method)
      ? enabledMethods.filter(m => m !== method)
      : [...enabledMethods, method];
    setEnabledMethods(newMethods);
  };

  return (
    <CreationMethodContext.Provider value={{ enabledMethods, setEnabledMethods, toggleMethod }}>
      {children}
    </CreationMethodContext.Provider>
  );
};

export const useCreationMethodConfig = (): CreationMethodConfig => {
  const context = useContext(CreationMethodContext);
  if (!context) {
    // Fallback if not wrapped in provider
    const enabledMethods = getStoredMethods();
    return {
      enabledMethods,
      setEnabledMethods: (m: CreationMethod[]) => {
        const final = m.length > 0 ? m : ["1-step"];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
      },
      toggleMethod: (method: CreationMethod) => {
        const current = getStoredMethods();
        const newMethods = current.includes(method)
          ? current.filter(m => m !== method)
          : [...current, method];
        const final = newMethods.length > 0 ? newMethods : ["1-step"];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(final));
      },
    };
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
