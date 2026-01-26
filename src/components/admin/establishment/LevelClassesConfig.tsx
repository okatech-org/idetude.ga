import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, Trash2, GripVertical, Edit2, Check, X, Users, 
  DoorOpen, ChevronDown, ChevronRight
} from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { ClassConfig, generateClassId } from "./classConfigTypes";
import { EDUCATION_CYCLES } from "./constants";

interface LevelClassesConfigProps {
  levelId: string;
  classes: ClassConfig[];
  onChange: (classes: ClassConfig[]) => void;
  defaultExpanded?: boolean;
}

export const LevelClassesConfig = ({
  levelId,
  classes,
  onChange,
  defaultExpanded = false,
}: LevelClassesConfigProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ name: string; capacity: string; room: string }>({
    name: "",
    capacity: "",
    room: "",
  });

  // Trouver les infos du niveau
  const getLevelInfo = () => {
    for (const [_, cycle] of Object.entries(EDUCATION_CYCLES)) {
      const level = cycle.levels.find(l => l.id === levelId);
      if (level) {
        return { level, cycleColor: cycle.color };
      }
    }
    return null;
  };

  const levelInfo = getLevelInfo();
  if (!levelInfo) return null;

  const { level, cycleColor } = levelInfo;

  const addClass = () => {
    // Trouver le prochain nom disponible
    const existingNames = classes.map(c => c.name);
    let nextName = "";
    
    // Essayer les lettres A-Z
    for (let i = 0; i < 26; i++) {
      const letter = String.fromCharCode(65 + i);
      if (!existingNames.includes(letter)) {
        nextName = letter;
        break;
      }
    }
    
    // Si toutes les lettres sont prises, utiliser un numéro
    if (!nextName) {
      let num = 1;
      while (existingNames.includes(String(num))) {
        num++;
      }
      nextName = String(num);
    }

    const newClass: ClassConfig = {
      id: generateClassId(),
      levelId,
      name: nextName,
      capacity: undefined,
      room: undefined,
      sections: [],
    };

    onChange([...classes, newClass]);
  };

  const removeClass = (classId: string) => {
    onChange(classes.filter(c => c.id !== classId));
  };

  const startEditing = (classItem: ClassConfig) => {
    setEditingClassId(classItem.id);
    setEditValues({
      name: classItem.name,
      capacity: classItem.capacity?.toString() || "",
      room: classItem.room || "",
    });
  };

  const saveEditing = () => {
    if (!editingClassId) return;

    onChange(
      classes.map(c =>
        c.id === editingClassId
          ? {
              ...c,
              name: editValues.name || c.name,
              capacity: editValues.capacity ? parseInt(editValues.capacity, 10) : undefined,
              room: editValues.room || undefined,
            }
          : c
      )
    );
    setEditingClassId(null);
  };

  const cancelEditing = () => {
    setEditingClassId(null);
    setEditValues({ name: "", capacity: "", room: "" });
  };

  const getFullClassName = (className: string) => {
    return `${level.short} ${className}`;
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <CollapsibleTrigger asChild>
        <button
          type="button"
          className={cn(
            "w-full p-3 flex items-center justify-between rounded-lg border transition-colors",
            "hover:bg-muted/50",
            classes.length > 0 ? "border-primary/30 bg-primary/5" : "border-border"
          )}
        >
          <div className="flex items-center gap-3">
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Badge className={cn("text-xs", cycleColor)}>{level.short}</Badge>
            <span className="font-medium">{level.label}</span>
          </div>
          <div className="flex items-center gap-2">
            {classes.length > 0 && (
              <div className="flex gap-1">
                {classes.slice(0, 6).map(c => (
                  <Badge key={c.id} variant="secondary" className="text-xs">
                    {c.name}
                  </Badge>
                ))}
                {classes.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{classes.length - 6}
                  </Badge>
                )}
              </div>
            )}
            <Badge variant="outline" className="text-xs">
              {classes.length} classe{classes.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </button>
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="mt-2 p-3 border rounded-lg bg-muted/30 space-y-3">
          {/* Liste des classes */}
          {classes.length > 0 ? (
            <div className="space-y-2">
              {classes.map((classItem, index) => (
                <div
                  key={classItem.id}
                  className="flex items-center gap-2 p-2 bg-background rounded-md border"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  
                  {editingClassId === classItem.id ? (
                    // Mode édition
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 grid grid-cols-3 gap-2">
                        <div>
                          <Label className="text-xs text-muted-foreground">Nom</Label>
                          <Input
                            value={editValues.name}
                            onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
                            className="h-8 text-sm"
                            placeholder="A"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Capacité</Label>
                          <Input
                            type="number"
                            value={editValues.capacity}
                            onChange={(e) => setEditValues({ ...editValues, capacity: e.target.value })}
                            className="h-8 text-sm"
                            placeholder="30"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Salle</Label>
                          <Input
                            value={editValues.room}
                            onChange={(e) => setEditValues({ ...editValues, room: e.target.value })}
                            className="h-8 text-sm"
                            placeholder="101"
                          />
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600"
                        onClick={saveEditing}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground"
                        onClick={cancelEditing}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    // Mode affichage
                    <>
                      <div className="flex-1 flex items-center gap-3">
                        <Badge variant="default" className="font-semibold">
                          {getFullClassName(classItem.name)}
                        </Badge>
                        {classItem.capacity && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {classItem.capacity} places
                          </span>
                        )}
                        {classItem.room && (
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <DoorOpen className="h-3 w-3" />
                            Salle {classItem.room}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => startEditing(classItem)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeClass(classItem.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              Aucune classe configurée pour ce niveau
            </p>
          )}

          {/* Bouton ajouter */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={addClass}
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter une classe {level.short}
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
