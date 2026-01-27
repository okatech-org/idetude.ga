import { useState, useEffect, createContext, useContext, ReactNode } from "react";

export type CreationMethod = "1-step" | "2-step" | "3-step";

export interface CreationMethodConfig {
  method: CreationMethod;
  setMethod: (method: CreationMethod) => void;
}

const STORAGE_KEY = "establishment_creation_method";

const CreationMethodContext = createContext<CreationMethodConfig | undefined>(undefined);

export const CreationMethodProvider = ({ children }: { children: ReactNode }) => {
  const [method, setMethodState] = useState<CreationMethod>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored as CreationMethod) || "1-step";
  });

  const setMethod = (newMethod: CreationMethod) => {
    setMethodState(newMethod);
    localStorage.setItem(STORAGE_KEY, newMethod);
  };

  return (
    <CreationMethodContext.Provider value={{ method, setMethod }}>
      {children}
    </CreationMethodContext.Provider>
  );
};

export const useCreationMethodConfig = (): CreationMethodConfig => {
  const context = useContext(CreationMethodContext);
  if (!context) {
    // Fallback if not wrapped in provider
    const stored = localStorage.getItem(STORAGE_KEY);
    const method = (stored as CreationMethod) || "1-step";
    return {
      method,
      setMethod: (m: CreationMethod) => localStorage.setItem(STORAGE_KEY, m),
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
