/**
 * Cloud SQL Client Service for iEtude
 * Provides typed database access for frontend via API proxy
 */

import { CLOUDSQL_API_URL } from './config';
import type {
    Establishment,
    EstablishmentGroup,
    Profile,
    UserRole,
    Class,
    UserEstablishment
} from './types';

interface QueryResult<T> {
    data: T[] | null;
    error: Error | null;
    count?: number;
}

interface SingleResult<T> {
    data: T | null;
    error: Error | null;
}

/**
 * Cloud SQL Client for direct database operations
 * Uses API proxy for secure server-side database access
 */
class CloudSqlClient {
    private baseUrl: string;

    constructor(apiUrl: string = CLOUDSQL_API_URL) {
        this.baseUrl = apiUrl;
    }

    private async request<T>(
        method: 'GET' | 'POST' | 'PUT' | 'DELETE',
        endpoint: string,
        body?: unknown
    ): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        if (!response.ok) {
            throw new Error(`Database error: ${response.statusText}`);
        }

        return response.json();
    }

    // ==================== ESTABLISHMENTS ====================

    /**
     * Get all active (non-archived) establishments
     */
    async getEstablishments(includeArchived = false): Promise<QueryResult<Establishment>> {
        try {
            const data = await this.request<Establishment[]>(
                'GET',
                `/establishments?includeArchived=${includeArchived}`
            );
            return { data, error: null, count: data.length };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    /**
     * Get establishment by ID
     */
    async getEstablishment(id: string): Promise<SingleResult<Establishment>> {
        try {
            const data = await this.request<Establishment>('GET', `/establishments/${id}`);
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    /**
     * Create a new establishment
     */
    async createEstablishment(
        establishment: Omit<Establishment, 'id' | 'created_at' | 'updated_at' | 'is_archived' | 'archived_at' | 'archived_by'>
    ): Promise<SingleResult<Establishment>> {
        try {
            const data = await this.request<Establishment>('POST', '/establishments', establishment);
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    /**
     * Update an establishment
     */
    async updateEstablishment(
        id: string,
        updates: Partial<Establishment>
    ): Promise<SingleResult<Establishment>> {
        try {
            const data = await this.request<Establishment>('PUT', `/establishments/${id}`, updates);
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    /**
     * Archive an establishment (soft delete)
     */
    async archiveEstablishment(id: string, archivedBy: string): Promise<SingleResult<Establishment>> {
        try {
            const data = await this.request<Establishment>('POST', `/establishments/${id}/archive`, {
                archived_by: archivedBy,
            });
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    /**
     * Restore an archived establishment
     */
    async restoreEstablishment(id: string): Promise<SingleResult<Establishment>> {
        try {
            const data = await this.request<Establishment>('POST', `/establishments/${id}/restore`);
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    /**
     * Permanently delete an establishment
     */
    async deleteEstablishment(id: string): Promise<{ error: Error | null }> {
        try {
            await this.request('DELETE', `/establishments/${id}`);
            return { error: null };
        } catch (error) {
            return { error: error as Error };
        }
    }

    // ==================== ESTABLISHMENT GROUPS ====================

    async getEstablishmentGroups(): Promise<QueryResult<EstablishmentGroup>> {
        try {
            const data = await this.request<EstablishmentGroup[]>('GET', '/establishment-groups');
            return { data, error: null, count: data.length };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    // ==================== PROFILES ====================

    async getProfile(userId: string): Promise<SingleResult<Profile>> {
        try {
            const data = await this.request<Profile>('GET', `/profiles/${userId}`);
            return { data, error: null };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    // ==================== USER ROLES ====================

    async getUserRoles(userId: string): Promise<QueryResult<UserRole>> {
        try {
            const data = await this.request<UserRole[]>('GET', `/users/${userId}/roles`);
            return { data, error: null, count: data.length };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    // ==================== CLASSES ====================

    async getClasses(establishmentId: string): Promise<QueryResult<Class>> {
        try {
            const data = await this.request<Class[]>(
                'GET',
                `/establishments/${establishmentId}/classes`
            );
            return { data, error: null, count: data.length };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }

    // ==================== USER ESTABLISHMENTS ====================

    async getUserEstablishments(userId: string): Promise<QueryResult<UserEstablishment>> {
        try {
            const data = await this.request<UserEstablishment[]>(
                'GET',
                `/users/${userId}/establishments`
            );
            return { data, error: null, count: data.length };
        } catch (error) {
            return { data: null, error: error as Error };
        }
    }
}

// Export singleton instance
export const cloudSql = new CloudSqlClient();

// Export class for custom instances
export { CloudSqlClient };
