/**
 * EstablishmentSearch - Recherche intelligente multi-catégorie
 * Recherche dans: personnel, élèves, classes, matières
 */

import React, { useState, useMemo, useCallback } from "react";
import { Search, Users, GraduationCap, BookOpen, Building, User, X, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { GlassCard } from "@/components/ui/glass-card";

interface SearchResult {
    id: string;
    type: "staff" | "student" | "class" | "subject" | "teacher";
    title: string;
    subtitle?: string;
    badges?: string[];
    meta?: string;
}

interface EstablishmentSearchProps {
    staff: any[];
    students: any[];
    classes: any[];
    subjects: any[];
    classTeachers: any[];
    onSelect?: (result: SearchResult) => void;
}

const CATEGORY_ICONS = {
    staff: Building,
    student: GraduationCap,
    class: Users,
    subject: BookOpen,
    teacher: User,
};

const CATEGORY_LABELS = {
    staff: "Personnel",
    student: "Élève",
    class: "Classe",
    subject: "Matière",
    teacher: "Enseignant",
};

const CATEGORY_COLORS = {
    staff: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    student: "bg-green-500/10 text-green-500 border-green-500/20",
    class: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    subject: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    teacher: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
};

export const EstablishmentSearch: React.FC<EstablishmentSearchProps> = ({
    staff,
    students,
    classes,
    subjects,
    classTeachers,
    onSelect,
}) => {
    const [query, setQuery] = useState("");
    const [isOpen, setIsOpen] = useState(false);

    const searchResults = useMemo(() => {
        if (!query || query.length < 2) return [];

        const normalizedQuery = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const results: SearchResult[] = [];

        // Search in staff (admin + teachers)
        staff.forEach((s) => {
            const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const position = (s.position || "").toLowerCase();
            const department = (s.department || "").toLowerCase();
            const staffType = (s.staff_type || "").toLowerCase();

            if (fullName.includes(normalizedQuery) || position.includes(normalizedQuery) || department.includes(normalizedQuery)) {
                const isTeacher = staffType === "teacher";
                results.push({
                    id: s.id || s.user_id,
                    type: isTeacher ? "teacher" : "staff",
                    title: `${s.first_name} ${s.last_name}`,
                    subtitle: s.position || (isTeacher ? "Enseignant" : s.staff_type),
                    badges: s.department ? [s.department] : [],
                    meta: s.email,
                });
            }
        });

        // Search in students
        students.forEach((s) => {
            const fullName = `${s.first_name || ""} ${s.last_name || ""}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const regNumber = (s.registration_number || "").toLowerCase();

            if (fullName.includes(normalizedQuery) || regNumber.includes(normalizedQuery)) {
                results.push({
                    id: s.id,
                    type: "student",
                    title: `${s.first_name} ${s.last_name}`,
                    subtitle: s.class_name || "Élève",
                    badges: s.is_delegate ? ["Délégué"] : [],
                    meta: s.registration_number,
                });
            }
        });

        // Search in classes
        classes.forEach((c) => {
            const className = (c.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const level = (c.level || "").toLowerCase();
            const section = (c.section || "").toLowerCase();

            if (className.includes(normalizedQuery) || level.includes(normalizedQuery) || section.includes(normalizedQuery)) {
                // Find PP for this class
                const pp = classTeachers.find((ct) => ct.class_id === c.id && ct.is_main_teacher);
                results.push({
                    id: c.id,
                    type: "class",
                    title: c.name,
                    subtitle: `${c.level} ${c.section || ""}`.trim(),
                    badges: pp ? [`PP: ${pp.profiles?.first_name || pp.first_name} ${(pp.profiles?.last_name || pp.last_name || "").charAt(0)}.`] : [],
                    meta: `${c.capacity || "?"} places`,
                });
            }
        });

        // Search in subjects
        subjects.forEach((s) => {
            const subjectName = (s.name || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const code = (s.code || "").toLowerCase();

            if (subjectName.includes(normalizedQuery) || code.includes(normalizedQuery)) {
                // Find teachers for this subject
                const teachersForSubject = classTeachers
                    .filter((ct) => ct.subject_id === s.id)
                    .map((ct) => `${ct.profiles?.first_name || ct.first_name} ${(ct.profiles?.last_name || ct.last_name || "").charAt(0)}.`)
                    .filter((name, i, arr) => arr.indexOf(name) === i)
                    .slice(0, 2);

                results.push({
                    id: s.id,
                    type: "subject",
                    title: s.name,
                    subtitle: s.code || undefined,
                    badges: s.coefficient ? [`Coef. ${s.coefficient}`] : [],
                    meta: teachersForSubject.length > 0 ? teachersForSubject.join(", ") : undefined,
                });
            }
        });

        return results.slice(0, 10); // Limit to 10 results
    }, [query, staff, students, classes, subjects, classTeachers]);

    const handleSelect = useCallback((result: SearchResult) => {
        onSelect?.(result);
        setQuery("");
        setIsOpen(false);
    }, [onSelect]);

    return (
        <div className="relative w-full max-w-md">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    type="text"
                    placeholder="Rechercher un élève, prof, classe, matière..."
                    className="pl-10 pr-10 bg-card/50 backdrop-blur-sm border-border/50"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery("");
                            setIsOpen(false);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {/* Search Results Dropdown */}
            {isOpen && searchResults.length > 0 && (
                <GlassCard className="absolute top-full mt-2 left-0 right-0 z-50 max-h-80 overflow-auto shadow-xl">
                    <div className="py-2">
                        {searchResults.map((result) => {
                            const Icon = CATEGORY_ICONS[result.type];
                            const colorClass = CATEGORY_COLORS[result.type];
                            return (
                                <button
                                    key={`${result.type}-${result.id}`}
                                    onClick={() => handleSelect(result)}
                                    className="w-full px-4 py-3 flex items-start gap-3 hover:bg-primary/5 transition-colors text-left"
                                >
                                    <div className={`p-2 rounded-lg ${colorClass}`}>
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium truncate">{result.title}</span>
                                            {result.badges?.map((badge) => (
                                                <Badge key={badge} variant="secondary" className="text-xs shrink-0">
                                                    {badge}
                                                </Badge>
                                            ))}
                                        </div>
                                        {result.subtitle && (
                                            <p className="text-sm text-muted-foreground truncate">{result.subtitle}</p>
                                        )}
                                        {result.meta && (
                                            <p className="text-xs text-muted-foreground/70 truncate">{result.meta}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                                </button>
                            );
                        })}
                    </div>
                </GlassCard>
            )}

            {/* No results message */}
            {isOpen && query.length >= 2 && searchResults.length === 0 && (
                <GlassCard className="absolute top-full mt-2 left-0 right-0 z-50 shadow-xl">
                    <div className="py-6 text-center text-muted-foreground">
                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>Aucun résultat pour "{query}"</p>
                        <p className="text-xs mt-1">Essayez avec un autre terme</p>
                    </div>
                </GlassCard>
            )}
        </div>
    );
};
