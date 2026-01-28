// Hook de cache React Query pour les groupes d'établissements
// Recommandation #9: Cache local des groupes

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface EstablishmentGroup {
    id: string;
    name: string;
    code: string | null;
    location: string | null;
    country_code: string;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface EducationSystem {
    code: string;
    name: string;
    region: string;
    main_language: string;
    description: string | null;
    icon: string | null;
    is_active: boolean;
}

// Cache key constants
const QUERY_KEYS = {
    establishmentGroups: ["establishment-groups"] as const,
    educationSystems: ["education-systems"] as const,
    educationSystemsByRegion: (region: string) => ["education-systems", region] as const,
};

// Fetch all establishment groups with caching
export const useEstablishmentGroups = () => {
    return useQuery({
        queryKey: QUERY_KEYS.establishmentGroups,
        queryFn: async (): Promise<EstablishmentGroup[]> => {
            const { data, error } = await supabase
                .from("establishment_groups")
                .select("*")
                .order("name");

            if (error) throw error;
            return data || [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 30 * 60 * 1000, // 30 minutes (anciennement cacheTime)
        refetchOnWindowFocus: false,
    });
};

// Fetch education systems from database with caching
export const useEducationSystems = () => {
    return useQuery({
        queryKey: QUERY_KEYS.educationSystems,
        queryFn: async (): Promise<EducationSystem[]> => {
            const { data, error } = await (supabase as any)
                .from("education_systems")
                .select("*")
                .eq("is_active", true)
                .order("region")
                .order("name");

            if (error) {
                console.warn("education_systems table not found, using static data");
                return [];
            }
            return data || [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour (rarely changes)
        gcTime: 24 * 60 * 60 * 1000, // 24 hours
        refetchOnWindowFocus: false,
        retry: 1,
    });
};

// Fetch education systems by region
export const useEducationSystemsByRegion = (region: string) => {
    return useQuery({
        queryKey: QUERY_KEYS.educationSystemsByRegion(region),
        queryFn: async (): Promise<EducationSystem[]> => {
            const { data, error } = await (supabase as any)
                .from("education_systems")
                .select("*")
                .eq("region", region)
                .eq("is_active", true)
                .order("name");

            if (error) throw error;
            return data || [];
        },
        staleTime: 60 * 60 * 1000,
        gcTime: 24 * 60 * 60 * 1000,
        enabled: !!region,
    });
};

// Hook pour invalider le cache
export const useInvalidateEstablishmentCache = () => {
    const queryClient = useQueryClient();

    return {
        invalidateGroups: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.establishmentGroups });
        },
        invalidateSystems: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.educationSystems });
        },
        invalidateAll: () => {
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.establishmentGroups });
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.educationSystems });
        },
    };
};

// Prefetch hook for modal opening
export const usePrefetchEstablishmentData = () => {
    const queryClient = useQueryClient();

    return async () => {
        // Prefetch groups
        await queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.establishmentGroups,
            queryFn: async () => {
                const { data } = await supabase
                    .from("establishment_groups")
                    .select("*")
                    .order("name");
                return data || [];
            },
            staleTime: 5 * 60 * 1000,
        });

        // Prefetch education systems
        await queryClient.prefetchQuery({
            queryKey: QUERY_KEYS.educationSystems,
            queryFn: async () => {
                const { data } = await (supabase as any)
                    .from("education_systems")
                    .select("*")
                    .eq("is_active", true)
                    .order("region");
                return data || [];
            },
            staleTime: 60 * 60 * 1000,
        });
    };
};
