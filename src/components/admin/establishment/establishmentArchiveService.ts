/**
 * Establishment Archive Service
 * 
 * Handles soft-delete (archiving), restore, and permanent delete operations
 * for establishments and their dependent entities.
 */

import { supabase } from "@/integrations/supabase/client";

export interface ArchiveStats {
    classesCount: number;
    staffCount: number;
    departmentsCount: number;
    subjectsCount: number;
    sectionsCount: number;
}

export interface ArchiveResult {
    success: boolean;
    stats: ArchiveStats;
    error?: string;
}

/**
 * Get statistics about dependent entities that will be affected
 */
export async function getEstablishmentArchiveStats(establishmentId: string): Promise<ArchiveStats> {
    const [classesResult, staffResult, departmentsResult, subjectsResult, sectionsResult] = await Promise.all([
        supabase.from("classes").select("id", { count: "exact", head: true }).eq("establishment_id", establishmentId),
        supabase.from("establishment_staff").select("id", { count: "exact", head: true }).eq("establishment_id", establishmentId),
        supabase.from("departments").select("id", { count: "exact", head: true }).eq("establishment_id", establishmentId),
        supabase.from("subjects").select("id", { count: "exact", head: true }).eq("establishment_id", establishmentId),
        supabase.from("linguistic_sections").select("id", { count: "exact", head: true }).eq("establishment_id", establishmentId),
    ]);

    return {
        classesCount: classesResult.count || 0,
        staffCount: staffResult.count || 0,
        departmentsCount: departmentsResult.count || 0,
        subjectsCount: subjectsResult.count || 0,
        sectionsCount: sectionsResult.count || 0,
    };
}

/**
 * Archive an establishment (soft delete)
 * Sets is_archived = true and records when/who archived it
 * NOTE: Requires migration to be run first to add is_archived, archived_at, archived_by columns
 */
export async function archiveEstablishment(
    establishmentId: string,
    userId: string
): Promise<ArchiveResult> {
    try {
        // Get stats before archiving
        const stats = await getEstablishmentArchiveStats(establishmentId);

        // Archive the establishment
        // Type assertion needed until Supabase types are regenerated after migration
        const updateData = {
            is_archived: true,
            archived_at: new Date().toISOString(),
            archived_by: userId,
        } as unknown as Record<string, unknown>;

        const { error } = await supabase
            .from("establishments")
            .update(updateData)
            .eq("id", establishmentId);

        if (error) {
            throw error;
        }

        // Cascade: Deactivate staff members
        if (stats.staffCount > 0) {
            await supabase
                .from("establishment_staff")
                .update({ is_active: false })
                .eq("establishment_id", establishmentId);
        }

        return { success: true, stats };
    } catch (error) {
        console.error("Error archiving establishment:", error);
        return {
            success: false,
            stats: { classesCount: 0, staffCount: 0, departmentsCount: 0, subjectsCount: 0, sectionsCount: 0 },
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Restore an archived establishment
 */
export async function restoreEstablishment(establishmentId: string): Promise<ArchiveResult> {
    try {
        // Get stats
        const stats = await getEstablishmentArchiveStats(establishmentId);

        // Restore the establishment
        // Type assertion needed until Supabase types are regenerated after migration
        const updateData = {
            is_archived: false,
            archived_at: null,
            archived_by: null,
        } as unknown as Record<string, unknown>;

        const { error } = await supabase
            .from("establishments")
            .update(updateData)
            .eq("id", establishmentId);

        if (error) {
            throw error;
        }

        // Cascade: Reactivate staff members
        if (stats.staffCount > 0) {
            await supabase
                .from("establishment_staff")
                .update({ is_active: true })
                .eq("establishment_id", establishmentId);
        }

        return { success: true, stats };
    } catch (error) {
        console.error("Error restoring establishment:", error);
        return {
            success: false,
            stats: { classesCount: 0, staffCount: 0, departmentsCount: 0, subjectsCount: 0, sectionsCount: 0 },
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Permanently delete an establishment and all related data
 * WARNING: This is irreversible!
 */
export async function permanentDeleteEstablishment(establishmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Delete in order of dependencies (leaf tables first)

        // 1. Delete class-related data
        const { data: classes } = await supabase
            .from("classes")
            .select("id")
            .eq("establishment_id", establishmentId);

        if (classes && classes.length > 0) {
            const classIds = classes.map((c) => c.id);

            // Delete class_students
            await supabase.from("class_students").delete().in("class_id", classIds);

            // Delete class_teachers
            await supabase.from("class_teachers").delete().in("class_id", classIds);

            // Delete class_sections
            await supabase.from("class_sections").delete().in("class_id", classIds);

            // Delete classes
            await supabase.from("classes").delete().eq("establishment_id", establishmentId);
        }

        // 2. Delete establishment_staff
        await supabase.from("establishment_staff").delete().eq("establishment_id", establishmentId);

        // 3. Delete positions (depends on departments)
        const { data: departments } = await supabase
            .from("departments")
            .select("id")
            .eq("establishment_id", establishmentId);

        if (departments && departments.length > 0) {
            const deptIds = departments.map((d) => d.id);
            await supabase.from("positions").delete().in("department_id", deptIds);
        }

        // 4. Delete departments
        await supabase.from("departments").delete().eq("establishment_id", establishmentId);

        // 5. Delete linguistic_sections
        await supabase.from("linguistic_sections").delete().eq("establishment_id", establishmentId);

        // 6. Delete subjects
        await supabase.from("subjects").delete().eq("establishment_id", establishmentId);

        // 7. Delete user_establishments
        await supabase.from("user_establishments").delete().eq("establishment_id", establishmentId);

        // 8. Finally, delete the establishment itself
        const { error } = await supabase.from("establishments").delete().eq("id", establishmentId);

        if (error) {
            throw error;
        }

        return { success: true };
    } catch (error) {
        console.error("Error permanently deleting establishment:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

/**
 * Fetch archived establishments
 * NOTE: Requires migration to be run first to add is_archived column
 */
export async function fetchArchivedEstablishments(): Promise<unknown[]> {
    try {
        // Use raw query approach to avoid type errors until Supabase types are regenerated
        const { data, error } = await supabase
            .from("establishments")
            .select("*")
            .filter("is_archived", "eq", true);

        if (error) {
            console.error("Error fetching archived establishments:", error);
            return [];
        }

        return data || [];
    } catch {
        return [];
    }
}
