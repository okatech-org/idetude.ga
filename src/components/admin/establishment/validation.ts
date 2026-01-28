// Validation Zod pour la création d'établissement
// Recommandation #12: Type-safe forms

import { z } from "zod";

// Types de base
export const typeWithQualificationSchema = z.object({
    type: z.string().min(1, "Le type est requis"),
    qualification: z.string().optional(),
});

export const nameElementSchema = z.enum(["type", "qualification", "designation", "name"]);

export const classConfigSchema = z.object({
    id: z.string(),
    levelId: z.string(),
    name: z.string().min(1, "Le nom de classe est requis"),
    capacity: z.number().min(1).max(100).optional(),
    room: z.string().optional(),
    sections: z.array(z.string()).optional(),
});

export const levelClassesConfigSchema = z.object({
    levelId: z.string(),
    classes: z.array(classConfigSchema),
});

// Schéma principal du formulaire
export const establishmentFormSchema = z.object({
    // Informations de base
    name: z
        .string()
        .min(2, "Le nom doit contenir au moins 2 caractères")
        .max(200, "Le nom ne peut excéder 200 caractères"),

    // Systèmes éducatifs
    educationSystems: z
        .array(z.string())
        .min(1, "Sélectionnez au moins un système éducatif"),

    additionalTeachingLanguages: z.array(z.string()).default([]),

    // Types et qualifications
    typesWithQualification: z
        .array(typeWithQualificationSchema)
        .min(1, "Sélectionnez au moins un type d'établissement"),

    // Contact
    address: z.string().optional(),
    phone: z
        .string()
        .optional()
        .refine(
            (val) => !val || val.length >= 8,
            "Le numéro de téléphone doit contenir au moins 8 caractères"
        ),
    email: z
        .string()
        .optional()
        .refine(
            (val) => !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
            "Adresse email invalide"
        ),

    // Localisation
    country_code: z.string().default("GA"),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),

    // Niveaux et classes
    selectedLevels: z
        .array(z.string())
        .min(1, "Sélectionnez au moins un niveau"),

    classesConfig: z.array(levelClassesConfigSchema).default([]),

    // Options
    group_id: z.string().uuid().nullable(),
    options: z.array(z.string()).default([]),

    // Configuration du nom
    nameElementsOrder: z.array(nameElementSchema).default(["type", "qualification", "designation", "name"]),

    // Modules
    enabledModules: z.array(z.string()).default([
        "messages",
        "grades",
        "assignments",
        "absences",
        "schedule",
        "calendar",
    ]),
}).refine(
    (data) => {
        // Vérifier que latitude et longitude sont définis ensemble
        const hasLat = data.latitude !== null;
        const hasLng = data.longitude !== null;
        return hasLat === hasLng;
    },
    {
        message: "Latitude et longitude doivent être définis ensemble",
        path: ["latitude"],
    }
).refine(
    (data) => {
        // Localisation GPS obligatoire
        return data.latitude !== null && data.longitude !== null;
    },
    {
        message: "La localisation GPS est obligatoire",
        path: ["latitude"],
    }
);

// Types inférés
export type EstablishmentFormData = z.infer<typeof establishmentFormSchema>;
export type TypeWithQualification = z.infer<typeof typeWithQualificationSchema>;
export type ClassConfig = z.infer<typeof classConfigSchema>;
export type LevelClassesConfig = z.infer<typeof levelClassesConfigSchema>;
export type NameElement = z.infer<typeof nameElementSchema>;

// Schéma pour le personnel
export const staffMemberSchema = z.object({
    id: z.string(),
    staff_type: z.string(),
    category: z.enum(["administrative", "educational", "support"]).default("administrative"),
    position: z.string().optional(),
    department: z.string().optional(),
    contract_type: z.string().optional(),
    start_date: z.string().optional(),
    is_active: z.boolean().default(true),
    is_class_principal: z.boolean().default(false),
    linked_student_id: z.string().uuid().optional(),
    assigned_class_ids: z.array(z.string()).default([]),
    added_by_user_type: z.string().optional(),
    metadata: z.record(z.unknown()).default({}),
});

export type StaffMember = z.infer<typeof staffMemberSchema>;

// Schéma pour la création complète (avec staff)
export const createEstablishmentRequestSchema = z.object({
    establishment: establishmentFormSchema,
    staff: z.array(staffMemberSchema).default([]),
});

export type CreateEstablishmentRequest = z.infer<typeof createEstablishmentRequestSchema>;

// Helper pour valider le formulaire
export const validateEstablishmentForm = (data: unknown): {
    success: boolean;
    data?: EstablishmentFormData;
    errors?: z.ZodError["errors"];
} => {
    const result = establishmentFormSchema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, errors: result.error.errors };
};

// Helper pour obtenir les erreurs formatées
export const getFormErrors = (errors: z.ZodError["errors"]): Record<string, string> => {
    const formErrors: Record<string, string> = {};
    errors.forEach((error) => {
        const path = error.path.join(".");
        if (!formErrors[path]) {
            formErrors[path] = error.message;
        }
    });
    return formErrors;
};

// Valeurs par défaut
export const DEFAULT_FORM_VALUES: EstablishmentFormData = {
    name: "",
    educationSystems: [],
    additionalTeachingLanguages: [],
    typesWithQualification: [],
    address: "",
    phone: "",
    email: "",
    country_code: "GA",
    selectedLevels: [],
    classesConfig: [],
    group_id: null,
    options: [],
    latitude: null,
    longitude: null,
    nameElementsOrder: ["type", "qualification", "designation", "name"],
    enabledModules: ["messages", "grades", "assignments", "absences", "schedule", "calendar"],
};
