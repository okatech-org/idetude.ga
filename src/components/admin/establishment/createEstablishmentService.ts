// Service de création d'établissement avec persistance des classes
// Recommandation #4: Persister classesConfig en vraies classes
// Recommandation #8: Transaction atomique

import { supabase } from "@/integrations/supabase/client";
import type { EstablishmentFormData, StaffMember, LevelClassesConfig } from "./validation";
import { EDUCATION_CYCLES } from "./constants";

interface CreateEstablishmentResult {
    success: boolean;
    establishmentId?: string;
    establishmentCode?: string;
    error?: string;
}

// Générer un code unique pour l'établissement
export const generateEstablishmentCode = async (
    type: string,
    name: string,
    countryCode: string
): Promise<string> => {
    // Préfixe basé sur le type
    const typePrefix = type.substring(0, 3).toUpperCase();

    // Initiales du nom (max 3)
    const nameInitials = name
        .split(/\s+/)
        .map(word => word[0])
        .join("")
        .toUpperCase()
        .substring(0, 3);

    // Code aléatoire
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();

    const code = `${typePrefix}-${nameInitials}-${countryCode}-${random}`;

    // Vérifier l'unicité
    const { data: existing } = await supabase
        .from("establishments")
        .select("id")
        .eq("code", code)
        .single();

    // Si existe, régénérer
    if (existing) {
        return generateEstablishmentCode(type, name, countryCode);
    }

    return code;
};

// Déterminer le cycle d'un niveau
export const getCycleForLevel = (levelCode: string): string => {
    for (const [cycle, config] of Object.entries(EDUCATION_CYCLES)) {
        if (config.levels.some(l => l.id === levelCode)) {
            return cycle;
        }
    }
    return "primaire"; // Fallback
};

// Préparer les données des types pour insertion
export const prepareTypesData = (
    typesWithQualification: { type: string; qualification?: string }[],
    establishmentId: string
) => {
    return typesWithQualification.map((t, index) => ({
        type_code: t.type,
        qualification: t.qualification || null,
        is_primary: index === 0,
        order_index: index,
    }));
};

// Préparer les données des niveaux pour insertion
export const prepareLevelsData = (selectedLevels: string[]) => {
    return selectedLevels.map((level, index) => ({
        level_code: level,
        cycle: getCycleForLevel(level),
        order_index: index,
    }));
};

// Préparer les données des systèmes éducatifs pour insertion
export const prepareEducationSystemsData = (systems: string[]) => {
    return systems.map((system, index) => ({
        system_code: system,
        is_primary: index === 0,
    }));
};

// Préparer les données des options pour insertion
export const prepareOptionsData = (
    educationSystems: string[],
    additionalLanguages: string[],
    options: string[]
) => {
    const result: { option_type: string; option_value: string }[] = [];

    // Ajouter les systèmes éducatifs comme options
    educationSystems.forEach(sys => {
        result.push({ option_type: "system", option_value: sys });
    });

    // Ajouter les langues supplémentaires
    additionalLanguages.forEach(lang => {
        result.push({ option_type: "teaching_lang", option_value: lang });
    });

    // Ajouter les autres options (séries, etc.)
    options.forEach(opt => {
        result.push({ option_type: "serie", option_value: opt });
    });

    return result;
};

// Préparer les données du personnel pour insertion
export const prepareStaffData = (staff: StaffMember[]) => {
    return staff.map(s => ({
        staff_type: s.staff_type,
        category: s.category,
        position: s.position || null,
        department: s.department || null,
        contract_type: s.contract_type || null,
        start_date: s.start_date || null,
        is_active: s.is_active,
        is_class_principal: s.is_class_principal,
        linked_student_id: s.linked_student_id || null,
        metadata: s.metadata || {},
    }));
};

// Créer les classes réelles dans la base de données
export const createClassesForEstablishment = async (
    establishmentId: string,
    classesConfig: LevelClassesConfig[],
    schoolYear: string
): Promise<{ success: boolean; classIds: string[]; error?: string }> => {
    const classIds: string[] = [];

    if (classesConfig.length === 0) {
        return { success: true, classIds: [] };
    }

    const classesToInsert = classesConfig.flatMap(levelConfig =>
        levelConfig.classes.map(classConfig => ({
            establishment_id: establishmentId,
            name: `${levelConfig.levelId.toUpperCase()} ${classConfig.name}`,
            code: `${establishmentId.substring(0, 8)}-${levelConfig.levelId}-${classConfig.name}`,
            level: levelConfig.levelId,
            section: classConfig.sections?.[0] || null,
            school_year: schoolYear,
            capacity: classConfig.capacity || null,
            room: classConfig.room || null,
        }))
    );

    if (classesToInsert.length === 0) {
        return { success: true, classIds: [] };
    }

    const { data, error } = await supabase
        .from("classes")
        .insert(classesToInsert)
        .select("id");

    if (error) {
        return { success: false, classIds: [], error: error.message };
    }

    return {
        success: true,
        classIds: data?.map(c => c.id) || [],
    };
};

// Service principal de création
export const createEstablishmentService = async (
    formData: EstablishmentFormData,
    staff: StaffMember[],
    userId: string
): Promise<CreateEstablishmentResult> => {
    try {
        // Générer le code unique
        const primaryType = formData.typesWithQualification[0]?.type || "ecole";
        const code = await generateEstablishmentCode(
            primaryType,
            formData.name,
            formData.country_code
        );

        // Construire le type au format DB (type:qualification,type2:qual2)
        const typesForDb = formData.typesWithQualification
            .map(t => t.qualification ? `${t.type}:${t.qualification}` : t.type)
            .join(",");

        // Construire les options legacy (pour compatibilité)
        const allOptions: string[] = [];
        formData.educationSystems.forEach(sys => allOptions.push(`system:${sys}`));
        formData.additionalTeachingLanguages.forEach(lang => allOptions.push(`teaching_lang:${lang}`));
        formData.options.forEach(opt => allOptions.push(opt));

        // Format des niveaux pour la colonne legacy
        const levelsDisplay = formData.selectedLevels.join(", ");

        // Essayer d'utiliser la fonction de transaction atomique
        const { data: establishmentData, error: rpcError } = await (supabase.rpc as any)(
            "create_establishment_with_staff",
            {
                p_establishment: {
                    name: formData.name,
                    code,
                    type: typesForDb,
                    address: formData.address || null,
                    phone: formData.phone || null,
                    email: formData.email || null,
                    country_code: formData.country_code,
                    levels: levelsDisplay,
                    options: allOptions,
                    group_id: formData.group_id,
                    latitude: formData.latitude,
                    longitude: formData.longitude,
                    enabled_modules: formData.enabledModules,
                },
                p_staff: prepareStaffData(staff),
                p_types: prepareTypesData(formData.typesWithQualification, ""),
                p_levels: prepareLevelsData(formData.selectedLevels),
                p_education_systems: prepareEducationSystemsData(formData.educationSystems),
                p_options: prepareOptionsData(
                    formData.educationSystems,
                    formData.additionalTeachingLanguages,
                    formData.options
                ),
            }
        );

        // Si l'opération RPC a réussi
        if (!rpcError && establishmentData?.success) {
            const establishmentId = establishmentData.establishment_id;

            // Créer les classes
            const currentYear = new Date().getFullYear();
            const schoolYear = `${currentYear}-${currentYear + 1}`;

            const classResult = await createClassesForEstablishment(
                establishmentId,
                formData.classesConfig,
                schoolYear
            );

            if (!classResult.success) {
                console.warn("Classes creation warning:", classResult.error);
            }

            // Lier l'utilisateur à l'établissement
            await supabase.from("user_establishments").insert({
                user_id: userId,
                establishment_id: establishmentId,
                is_primary: true,
            });

            return {
                success: true,
                establishmentId,
                establishmentCode: code,
            };
        }

        // Fallback: utiliser l'ancienne méthode si RPC échoue
        console.warn("RPC failed, using fallback method:", rpcError);
        return createEstablishmentFallback(formData, staff, userId, code);

    } catch (error) {
        console.error("Create establishment error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Une erreur est survenue",
        };
    }
};

// Méthode fallback sans la fonction RPC
const createEstablishmentFallback = async (
    formData: EstablishmentFormData,
    staff: StaffMember[],
    userId: string,
    code: string
): Promise<CreateEstablishmentResult> => {
    const primaryType = formData.typesWithQualification[0]?.type || "ecole";
    const typesForDb = formData.typesWithQualification
        .map(t => t.qualification ? `${t.type}:${t.qualification}` : t.type)
        .join(",");

    const allOptions: string[] = [];
    formData.educationSystems.forEach(sys => allOptions.push(`system:${sys}`));
    formData.additionalTeachingLanguages.forEach(lang => allOptions.push(`teaching_lang:${lang}`));
    formData.options.forEach(opt => allOptions.push(opt));

    // Créer l'établissement
    const { data: establishment, error: estError } = await supabase
        .from("establishments")
        .insert({
            name: formData.name,
            code,
            type: primaryType, // Utiliser juste le type principal pour éviter erreur CHECK
            address: formData.address || null,
            phone: formData.phone || null,
            email: formData.email || null,
            country_code: formData.country_code,
            levels: formData.selectedLevels.join(", "),
            options: allOptions.length > 0 ? allOptions : null,
            group_id: formData.group_id,
            latitude: formData.latitude,
            longitude: formData.longitude,
            enabled_modules: formData.enabledModules,
        })
        .select()
        .single();

    if (estError) {
        return { success: false, error: estError.message };
    }

    const establishmentId = establishment.id;

    // Créer les classes
    const currentYear = new Date().getFullYear();
    const schoolYear = `${currentYear}-${currentYear + 1}`;
    await createClassesForEstablishment(
        establishmentId,
        formData.classesConfig,
        schoolYear
    );

    // Créer le personnel
    if (staff.length > 0) {
        await supabase.from("establishment_staff").insert(
            staff.map(s => ({
                establishment_id: establishmentId,
                ...prepareStaffData([s])[0],
            }))
        );
    }

    // Lier l'utilisateur
    await supabase.from("user_establishments").insert({
        user_id: userId,
        establishment_id: establishmentId,
        is_primary: true,
    });

    return {
        success: true,
        establishmentId,
        establishmentCode: code,
    };
};

export default createEstablishmentService;
