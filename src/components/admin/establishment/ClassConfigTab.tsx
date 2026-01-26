import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  GraduationCap, Wand2, Settings2, LayoutGrid, 
  ChevronDown, ChevronRight, Info, School
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { LevelClassesConfig } from "./LevelClassesConfig";
import { 
  ClassConfig, 
  LevelClassesConfig as LevelClassesConfigType,
  ClassPreset,
  getPresetsForSystem,
  generateClassNames,
  generateClassId 
} from "./classConfigTypes";
import { EDUCATION_CYCLES, OPTIONS_LYCEE } from "./constants";

interface ClassConfigTabProps {
  selectedLevels: string[];
  onSelectedLevelsChange: (levels: string[]) => void;
  classesConfig: LevelClassesConfigType[];
  onClassesConfigChange: (config: LevelClassesConfigType[]) => void;
  educationSystems: string[];
  options: string[];
  onOptionsChange: (options: string[]) => void;
  typesWithQualification: { type: string; qualification: string }[];
}

export const ClassConfigTab = ({
  selectedLevels,
  onSelectedLevelsChange,
  classesConfig,
  onClassesConfigChange,
  educationSystems,
  options,
  onOptionsChange,
  typesWithQualification,
}: ClassConfigTabProps) => {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [customClassCount, setCustomClassCount] = useState<number>(3);
  const [applyToAll, setApplyToAll] = useState(true);

  const presets = getPresetsForSystem(educationSystems);
  const showOptions = typesWithQualification.some(twq => ["lycee"].includes(twq.type));

  // Appliquer un preset à tous les niveaux sélectionnés
  const applyPreset = () => {
    const preset = presets.find(p => p.id === selectedPreset);
    if (!preset) return;

    const count = preset.pattern === "custom" ? customClassCount : preset.defaultCount;
    const classNames = generateClassNames(preset.pattern, count);

    const newConfig: LevelClassesConfigType[] = selectedLevels.map(levelId => {
      const existingConfig = classesConfig.find(c => c.levelId === levelId);
      
      if (!applyToAll && existingConfig && existingConfig.classes.length > 0) {
        return existingConfig;
      }

      return {
        levelId,
        classes: classNames.map(name => ({
          id: generateClassId(),
          levelId,
          name,
          capacity: undefined,
          room: undefined,
          sections: [],
        })),
      };
    });

    onClassesConfigChange(newConfig);
  };

  // Toggle niveau
  const toggleLevel = (levelId: string) => {
    const newLevels = selectedLevels.includes(levelId)
      ? selectedLevels.filter(l => l !== levelId)
      : [...selectedLevels, levelId];
    
    onSelectedLevelsChange(newLevels);

    // Ajouter/supprimer la config correspondante
    if (selectedLevels.includes(levelId)) {
      // Supprimer
      onClassesConfigChange(classesConfig.filter(c => c.levelId !== levelId));
    } else {
      // Ajouter une config vide
      onClassesConfigChange([
        ...classesConfig,
        { levelId, classes: [] }
      ]);
    }
  };

  // Toggle cycle complet
  const toggleCycle = (cycleKey: string) => {
    const cycle = EDUCATION_CYCLES[cycleKey as keyof typeof EDUCATION_CYCLES];
    if (!cycle) return;
    
    const cycleLevelIds = cycle.levels.map(l => l.id);
    const allSelected = cycleLevelIds.every(id => selectedLevels.includes(id));
    
    if (allSelected) {
      // Désélectionner tout le cycle
      const newLevels = selectedLevels.filter(id => !cycleLevelIds.includes(id));
      onSelectedLevelsChange(newLevels);
      onClassesConfigChange(classesConfig.filter(c => !cycleLevelIds.includes(c.levelId)));
    } else {
      // Sélectionner tout le cycle
      const newLevels = [...new Set([...selectedLevels, ...cycleLevelIds])];
      onSelectedLevelsChange(newLevels);
      
      // Ajouter les configs manquantes
      const newConfigs = [...classesConfig];
      cycleLevelIds.forEach(levelId => {
        if (!newConfigs.find(c => c.levelId === levelId)) {
          newConfigs.push({ levelId, classes: [] });
        }
      });
      onClassesConfigChange(newConfigs);
    }
  };

  // Mettre à jour les classes d'un niveau
  const updateLevelClasses = (levelId: string, classes: ClassConfig[]) => {
    const existingIndex = classesConfig.findIndex(c => c.levelId === levelId);
    
    if (existingIndex >= 0) {
      const newConfig = [...classesConfig];
      newConfig[existingIndex] = { levelId, classes };
      onClassesConfigChange(newConfig);
    } else {
      onClassesConfigChange([...classesConfig, { levelId, classes }]);
    }
  };

  // Toggle option lycée
  const toggleOption = (option: string) => {
    const newOptions = options.includes(option)
      ? options.filter(o => o !== option)
      : [...options, option];
    onOptionsChange(newOptions);
  };

  // Stats
  const totalClasses = classesConfig.reduce((acc, c) => acc + c.classes.length, 0);
  const configuredLevels = classesConfig.filter(c => c.classes.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Info box */}
      <Alert className="border-primary/30 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertDescription className="text-sm">
          <strong>Configuration des classes :</strong> Sélectionnez d'abord les niveaux enseignés, 
          puis configurez les classes de chaque niveau (ex: 6ème A, 6ème B, 6ème C).
        </AlertDescription>
      </Alert>

      {/* Pré-configuration rapide */}
      <div className="p-4 rounded-lg border bg-muted/30 space-y-4">
        <div className="flex items-center gap-2">
          <Wand2 className="h-4 w-4 text-primary" />
          <Label className="font-semibold">Configuration rapide</Label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Modèle de classes</Label>
            <Select value={selectedPreset} onValueChange={setSelectedPreset}>
              <SelectTrigger>
                <SelectValue placeholder="Choisir un modèle..." />
              </SelectTrigger>
              <SelectContent>
                {presets.map(preset => (
                  <SelectItem key={preset.id} value={preset.id}>
                    <div className="flex items-center gap-2">
                      <span>{preset.icon}</span>
                      <div>
                        <span className="font-medium">{preset.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {preset.description}
                        </span>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPreset === "custom" && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Nombre de classes</Label>
              <Input
                type="number"
                min={1}
                max={26}
                value={customClassCount}
                onChange={(e) => setCustomClassCount(parseInt(e.target.value) || 1)}
                className="h-10"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">&nbsp;</Label>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={applyToAll}
                  onCheckedChange={(checked) => setApplyToAll(checked === true)}
                />
                Remplacer existants
              </label>
              <Button
                type="button"
                onClick={applyPreset}
                disabled={!selectedPreset || selectedLevels.length === 0}
                className="flex-1"
              >
                <Wand2 className="h-4 w-4 mr-2" />
                Appliquer
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <Badge variant="outline" className="gap-1">
          <GraduationCap className="h-3 w-3" />
          {selectedLevels.length} niveaux sélectionnés
        </Badge>
        <Badge variant="outline" className="gap-1">
          <LayoutGrid className="h-3 w-3" />
          {totalClasses} classes configurées
        </Badge>
        <Badge variant={configuredLevels === selectedLevels.length ? "default" : "secondary"} className="gap-1">
          <Settings2 className="h-3 w-3" />
          {configuredLevels}/{selectedLevels.length} niveaux configurés
        </Badge>
      </div>

      {/* Sélection des niveaux et configuration des classes */}
      <Accordion type="multiple" defaultValue={Object.keys(EDUCATION_CYCLES)} className="space-y-2">
        {Object.entries(EDUCATION_CYCLES).map(([cycleKey, cycle]) => {
          const cycleLevelIds = cycle.levels.map(l => l.id);
          const selectedCount = cycleLevelIds.filter(id => selectedLevels.includes(id)).length;
          const allSelected = selectedCount === cycleLevelIds.length;
          const cycleClassCount = classesConfig
            .filter(c => cycleLevelIds.includes(c.levelId))
            .reduce((acc, c) => acc + c.classes.length, 0);

          return (
            <AccordionItem 
              key={cycleKey} 
              value={cycleKey}
              className="border rounded-lg overflow-hidden"
            >
              <AccordionTrigger className={cn("px-4 py-3 hover:no-underline", cycle.color)}>
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={allSelected}
                      onCheckedChange={() => toggleCycle(cycleKey)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="font-semibold">{cycle.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-white/50">
                      {selectedCount}/{cycleLevelIds.length} niveaux
                    </Badge>
                    {cycleClassCount > 0 && (
                      <Badge variant="default" className="bg-white/80 text-foreground">
                        {cycleClassCount} classes
                      </Badge>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 py-3 bg-background space-y-3">
                {cycle.levels.map((level) => {
                  const isSelected = selectedLevels.includes(level.id);
                  const levelConfig = classesConfig.find(c => c.levelId === level.id);
                  const levelClasses = levelConfig?.classes || [];

                  return (
                    <div key={level.id} className="space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleLevel(level.id)}
                        />
                        <span className={cn(
                          "text-sm font-medium",
                          isSelected ? "text-foreground" : "text-muted-foreground"
                        )}>
                          {level.label}
                        </span>
                        {isSelected && levelClasses.length > 0 && (
                          <div className="flex gap-1 ml-auto">
                            {levelClasses.slice(0, 5).map(c => (
                              <Badge key={c.id} variant="secondary" className="text-xs">
                                {level.short} {c.name}
                              </Badge>
                            ))}
                            {levelClasses.length > 5 && (
                              <Badge variant="outline" className="text-xs">
                                +{levelClasses.length - 5}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      
                      {isSelected && (
                        <div className="ml-6">
                          <LevelClassesConfig
                            levelId={level.id}
                            classes={levelClasses}
                            onChange={(classes) => updateLevelClasses(level.id, classes)}
                            defaultExpanded={levelClasses.length === 0}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* Options Lycée */}
      {showOptions && (
        <div className="border rounded-lg overflow-hidden">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/50">
            <span className="font-semibold text-amber-800 dark:text-amber-200 flex items-center gap-2">
              <School className="h-4 w-4" />
              Séries / Options disponibles
            </span>
          </div>
          <div className="p-3 grid grid-cols-2 md:grid-cols-3 gap-2 bg-background">
            {OPTIONS_LYCEE.map((option) => (
              <label
                key={option}
                className={cn(
                  "flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-muted transition-colors",
                  options.includes(option) && "bg-muted"
                )}
              >
                <Checkbox
                  checked={options.includes(option)}
                  onCheckedChange={() => toggleOption(option)}
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
