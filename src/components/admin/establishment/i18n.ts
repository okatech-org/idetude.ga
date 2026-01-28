// Internationalisation des systèmes éducatifs
// Recommandation #14: Internationaliser educationSystems

import type { EducationSystem, EducationSystemCategory } from "./educationSystems";

// Types pour l'internationalisation
export type SupportedLocale = "fr" | "en" | "es" | "pt" | "ar";

export interface LocalizedEducationSystem extends EducationSystem {
    translations?: Partial<Record<SupportedLocale, {
        label: string;
        description: string;
    }>>;
}

export interface LocalizedEducationSystemCategory extends Omit<EducationSystemCategory, "systems"> {
    translations?: Partial<Record<SupportedLocale, {
        label: string;
    }>>;
    systems: LocalizedEducationSystem[];
}

// Labels des régions traduits
const REGION_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
    afrique_francophone: {
        fr: "Afrique Francophone",
        en: "French-speaking Africa",
        es: "África Francófona",
        pt: "África Francófona",
        ar: "أفريقيا الفرنكوفونية",
    },
    afrique_anglophone: {
        fr: "Afrique Anglophone",
        en: "English-speaking Africa",
        es: "África Anglófona",
        pt: "África Anglófona",
        ar: "أفريقيا الناطقة بالإنجليزية",
    },
    afrique_lusophone: {
        fr: "Afrique Lusophone",
        en: "Portuguese-speaking Africa",
        es: "África Lusófona",
        pt: "África Lusófona",
        ar: "أفريقيا الناطقة بالبرتغالية",
    },
    afrique_arabe: {
        fr: "Afrique Arabe / Maghreb",
        en: "Arab Africa / Maghreb",
        es: "África Árabe / Magreb",
        pt: "África Árabe / Magrebe",
        ar: "أفريقيا العربية / المغرب العربي",
    },
    europe_occidentale: {
        fr: "Europe Occidentale",
        en: "Western Europe",
        es: "Europa Occidental",
        pt: "Europa Ocidental",
        ar: "أوروبا الغربية",
    },
    europe_nordique: {
        fr: "Europe Nordique",
        en: "Northern Europe",
        es: "Europa Nórdica",
        pt: "Europa Nórdica",
        ar: "أوروبا الشمالية",
    },
    europe_orientale: {
        fr: "Europe Centrale & Orientale",
        en: "Central & Eastern Europe",
        es: "Europa Central y Oriental",
        pt: "Europa Central e Oriental",
        ar: "أوروبا الوسطى والشرقية",
    },
    amerique_nord: {
        fr: "Amérique du Nord",
        en: "North America",
        es: "América del Norte",
        pt: "América do Norte",
        ar: "أمريكا الشمالية",
    },
    amerique_latine: {
        fr: "Amérique Latine",
        en: "Latin America",
        es: "América Latina",
        pt: "América Latina",
        ar: "أمريكا اللاتينية",
    },
    asie_est: {
        fr: "Asie de l'Est",
        en: "East Asia",
        es: "Asia Oriental",
        pt: "Ásia Oriental",
        ar: "شرق آسيا",
    },
    asie_sud: {
        fr: "Asie du Sud",
        en: "South Asia",
        es: "Asia del Sur",
        pt: "Ásia do Sul",
        ar: "جنوب آسيا",
    },
    moyen_orient: {
        fr: "Moyen-Orient",
        en: "Middle East",
        es: "Medio Oriente",
        pt: "Oriente Médio",
        ar: "الشرق الأوسط",
    },
    oceanie: {
        fr: "Océanie",
        en: "Oceania",
        es: "Oceanía",
        pt: "Oceania",
        ar: "أوقيانوسيا",
    },
    international: {
        fr: "Internationaux",
        en: "International",
        es: "Internacionales",
        pt: "Internacionais",
        ar: "دولي",
    },
};

// Labels des cycles traduits
export const CYCLE_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
    maternelle: {
        fr: "Maternelle",
        en: "Kindergarten",
        es: "Preescolar",
        pt: "Educação Infantil",
        ar: "الحضانة",
    },
    primaire: {
        fr: "Primaire",
        en: "Primary School",
        es: "Primaria",
        pt: "Ensino Fundamental",
        ar: "الابتدائية",
    },
    college: {
        fr: "Collège",
        en: "Middle School",
        es: "Secundaria",
        pt: "Ensino Fundamental II",
        ar: "المتوسطة",
    },
    lycee: {
        fr: "Lycée",
        en: "High School",
        es: "Bachillerato",
        pt: "Ensino Médio",
        ar: "الثانوية",
    },
    technique: {
        fr: "Technique/Professionnel",
        en: "Technical/Vocational",
        es: "Técnico/Profesional",
        pt: "Técnico/Profissional",
        ar: "التقني/المهني",
    },
    superieur: {
        fr: "Études Supérieures",
        en: "Higher Education",
        es: "Educación Superior",
        pt: "Ensino Superior",
        ar: "التعليم العالي",
    },
};

// Labels des types d'établissement traduits
export const ESTABLISHMENT_TYPE_TRANSLATIONS: Record<string, Record<SupportedLocale, string>> = {
    maternelle: {
        fr: "Maternelle",
        en: "Kindergarten",
        es: "Jardín de Infantes",
        pt: "Jardim de Infância",
        ar: "روضة أطفال",
    },
    primaire: {
        fr: "École Primaire",
        en: "Primary School",
        es: "Escuela Primaria",
        pt: "Escola Primária",
        ar: "المدرسة الابتدائية",
    },
    college: {
        fr: "Collège",
        en: "Middle School",
        es: "Colegio",
        pt: "Colégio",
        ar: "المتوسطة",
    },
    lycee: {
        fr: "Lycée",
        en: "High School",
        es: "Liceo",
        pt: "Liceu",
        ar: "الثانوية",
    },
    superieur: {
        fr: "Enseignement Supérieur",
        en: "Higher Education",
        es: "Educación Superior",
        pt: "Ensino Superior",
        ar: "التعليم العالي",
    },
    universite: {
        fr: "Université",
        en: "University",
        es: "Universidad",
        pt: "Universidade",
        ar: "الجامعة",
    },
    complexe: {
        fr: "Complexe Scolaire",
        en: "School Complex",
        es: "Complejo Escolar",
        pt: "Complexo Escolar",
        ar: "مجمع مدرسي",
    },
    groupe: {
        fr: "Groupe Scolaire",
        en: "School Group",
        es: "Grupo Escolar",
        pt: "Grupo Escolar",
        ar: "مجموعة مدارس",
    },
};

// Hook pour obtenir les labels traduits
export function useEducationSystemsI18n(locale: SupportedLocale = "fr") {
    const getRegionLabel = (regionId: string): string => {
        return REGION_TRANSLATIONS[regionId]?.[locale] || regionId;
    };

    const getCycleLabel = (cycleId: string): string => {
        return CYCLE_TRANSLATIONS[cycleId]?.[locale] || cycleId;
    };

    const getTypeLabel = (typeId: string): string => {
        return ESTABLISHMENT_TYPE_TRANSLATIONS[typeId]?.[locale] || typeId;
    };

    const getSystemLabel = (system: LocalizedEducationSystem): string => {
        return system.translations?.[locale]?.label || system.label;
    };

    const getSystemDescription = (system: LocalizedEducationSystem): string => {
        return system.translations?.[locale]?.description || system.description;
    };

    return {
        getRegionLabel,
        getCycleLabel,
        getTypeLabel,
        getSystemLabel,
        getSystemDescription,
        currentLocale: locale,
        supportedLocales: ["fr", "en", "es", "pt", "ar"] as SupportedLocale[],
    };
}

// Exporter les traductions pour usage externe
export { REGION_TRANSLATIONS };
