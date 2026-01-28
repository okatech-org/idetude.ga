// Composant de sélection des systèmes éducatifs
// Recommandation #11: Séparer composants (extrait du modal principal)

import React, { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import { Search, ChevronDown, ChevronRight, Check, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import { GLOBAL_EDUCATION_SYSTEM_CATEGORIES } from "./educationSystems";
import { useEducationSystemsI18n, type SupportedLocale } from "./i18n";

interface EducationSystemSelectorProps {
    selectedSystems: string[];
    onSystemToggle: (systemValue: string) => void;
    locale?: SupportedLocale;
    className?: string;
}

export const EducationSystemSelector: React.FC<EducationSystemSelectorProps> = ({
    selectedSystems,
    onSystemToggle,
    locale = "fr",
    className,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [expandedCategories, setExpandedCategories] = useState<string[]>([
        "afrique_francophone",
        "europe_occidentale",
        "international",
    ]);

    const { getRegionLabel, getSystemLabel, getSystemDescription } = useEducationSystemsI18n(locale);

    // Filtrer les catégories basé sur la recherche
    const filteredCategories = useMemo(() => {
        if (!searchTerm.trim()) return GLOBAL_EDUCATION_SYSTEM_CATEGORIES;

        const lowerSearch = searchTerm.toLowerCase();
        return GLOBAL_EDUCATION_SYSTEM_CATEGORIES.map(category => ({
            ...category,
            systems: category.systems.filter(
                system =>
                    system.label.toLowerCase().includes(lowerSearch) ||
                    system.description.toLowerCase().includes(lowerSearch)
            ),
        })).filter(category => category.systems.length > 0);
    }, [searchTerm]);

    const toggleCategory = (categoryId: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    return (
        <div className={cn("space-y-4", className)}>
            {/* Recherche */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Rechercher un système éducatif..."
                    className="pl-10"
                />
            </div>

            {/* Systèmes sélectionnés */}
            {selectedSystems.length > 0 && (
                <div className="flex flex-wrap gap-2 p-3 rounded-lg bg-primary/5 border">
                    <Label className="text-xs text-muted-foreground w-full mb-1">
                        Systèmes sélectionnés ({selectedSystems.length})
                    </Label>
                    {selectedSystems.map(systemValue => {
                        const system = GLOBAL_EDUCATION_SYSTEM_CATEGORIES
                            .flatMap(c => c.systems)
                            .find(s => s.value === systemValue);
                        return system ? (
                            <Badge
                                key={systemValue}
                                variant="secondary"
                                className="cursor-pointer hover:bg-destructive/20 transition-colors"
                                onClick={() => onSystemToggle(systemValue)}
                            >
                                {system.icon} {system.label} ×
                            </Badge>
                        ) : null;
                    })}
                </div>
            )}

            {/* Carousel des systèmes populaires */}
            <div className="space-y-2">
                <Label className="text-sm font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Systèmes populaires
                </Label>
                <Carousel className="w-full" opts={{ align: "start", loop: true }}>
                    <CarouselContent className="-ml-2">
                        {["gabonais", "francais", "britannique", "americain", "ib", "cambridge"].map(systemValue => {
                            const system = GLOBAL_EDUCATION_SYSTEM_CATEGORIES
                                .flatMap(c => c.systems)
                                .find(s => s.value === systemValue);
                            if (!system) return null;
                            const isSelected = selectedSystems.includes(systemValue);
                            return (
                                <CarouselItem key={systemValue} className="pl-2 basis-1/3">
                                    <button
                                        type="button"
                                        onClick={() => onSystemToggle(systemValue)}
                                        className={cn(
                                            "w-full p-3 rounded-lg border-2 transition-all text-left",
                                            isSelected
                                                ? "border-primary bg-primary/10"
                                                : "border-border hover:border-primary/50 hover:bg-muted/50"
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-xl">{system.icon}</span>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">{system.label}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {system.description}
                                                </p>
                                            </div>
                                            {isSelected && (
                                                <Check className="h-4 w-4 text-primary flex-shrink-0" />
                                            )}
                                        </div>
                                    </button>
                                </CarouselItem>
                            );
                        })}
                    </CarouselContent>
                    <CarouselPrevious className="-left-4" />
                    <CarouselNext className="-right-4" />
                </Carousel>
            </div>

            {/* Liste complète par catégorie */}
            <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                    {filteredCategories.map(category => {
                        const isExpanded = expandedCategories.includes(category.id);
                        const selectedInCategory = category.systems.filter(s =>
                            selectedSystems.includes(s.value)
                        ).length;

                        return (
                            <div key={category.id} className="border rounded-lg overflow-hidden">
                                {/* Header de catégorie */}
                                <button
                                    type="button"
                                    onClick={() => toggleCategory(category.id)}
                                    className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{category.icon}</span>
                                        <span className="font-medium">{getRegionLabel(category.id)}</span>
                                        <Badge variant="outline" className="text-xs">
                                            {category.systems.length}
                                        </Badge>
                                        {selectedInCategory > 0 && (
                                            <Badge variant="default" className="text-xs">
                                                {selectedInCategory} sélectionné{selectedInCategory > 1 ? "s" : ""}
                                            </Badge>
                                        )}
                                    </div>
                                    {isExpanded ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </button>

                                {/* Liste des systèmes */}
                                {isExpanded && (
                                    <div className="border-t bg-muted/20 p-2 grid grid-cols-2 gap-2">
                                        {category.systems.map(system => {
                                            const isSelected = selectedSystems.includes(system.value);
                                            return (
                                                <button
                                                    key={system.value}
                                                    type="button"
                                                    onClick={() => onSystemToggle(system.value)}
                                                    className={cn(
                                                        "flex items-center gap-2 p-2 rounded-md text-left transition-all",
                                                        isSelected
                                                            ? "bg-primary text-primary-foreground"
                                                            : "hover:bg-muted"
                                                    )}
                                                >
                                                    <span>{system.icon}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-medium truncate">
                                                            {getSystemLabel(system)}
                                                        </p>
                                                        <p
                                                            className={cn(
                                                                "text-xs truncate",
                                                                isSelected
                                                                    ? "text-primary-foreground/80"
                                                                    : "text-muted-foreground"
                                                            )}
                                                        >
                                                            {getSystemDescription(system)}
                                                        </p>
                                                    </div>
                                                    {isSelected && <Check className="h-4 w-4 flex-shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );
};

export default EducationSystemSelector;
