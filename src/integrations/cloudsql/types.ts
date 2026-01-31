/**
 * Cloud SQL Database Types for iEtude
 * Mirrors the schema created in bootstrap_idetude_cloud_sql.sql
 */

// User Role Enum
export type AppRole =
    | 'super_admin'
    | 'regional_admin'
    | 'school_director'
    | 'school_admin'
    | 'cpe'
    | 'main_teacher'
    | 'teacher'
    | 'external_tutor'
    | 'student'
    | 'parent_primary'
    | 'parent_secondary';

// Establishment Type
export type EstablishmentType =
    | 'primaire'
    | 'college'
    | 'lycee'
    | 'superieur'
    | 'technique';

// Auth User (mock schema)
export interface AuthUser {
    id: string;
    email: string | null;
    encrypted_password: string | null;
    raw_user_meta_data: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

// Profile
export interface Profile {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone: string | null;
    avatar_url: string | null;
    is_demo: boolean;
    created_at: string;
    updated_at: string;
}

// User Role
export interface UserRole {
    id: string;
    user_id: string;
    role: AppRole;
    created_at: string;
}

// Establishment Group
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

// Establishment (with archiving support)
export interface Establishment {
    id: string;
    group_id: string | null;
    name: string;
    code: string | null;
    type: EstablishmentType;
    address: string | null;
    phone: string | null;
    email: string | null;
    country_code: string;
    levels: string | null;
    options: string[] | null;
    enabled_modules: string[] | null;
    student_capacity: number | null;
    logo_url: string | null;
    is_archived: boolean;
    archived_at: string | null;
    archived_by: string | null;
    created_at: string;
    updated_at: string;
}

// Class
export interface Class {
    id: string;
    establishment_id: string;
    name: string;
    code: string | null;
    level: string;
    section: string | null;
    school_year: string;
    capacity: number | null;
    room: string | null;
    created_at: string;
    updated_at: string;
}

// User Establishment Association
export interface UserEstablishment {
    id: string;
    user_id: string;
    establishment_id: string;
    is_primary: boolean;
    created_at: string;
}

// Database schema for type safety
export interface CloudSqlDatabase {
    auth: {
        users: AuthUser;
    };
    public: {
        profiles: Profile;
        user_roles: UserRole;
        establishment_groups: EstablishmentGroup;
        establishments: Establishment;
        classes: Class;
        user_establishments: UserEstablishment;
    };
}
