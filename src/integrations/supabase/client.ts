/**
 * Supabase Client Stub - MOCK AUTH MODE
 * 
 * Ce projet utilise exclusivement Google Cloud SQL.
 * Ce fichier implémente un système d'authentification simulé (Mock Auth) pour les comptes démo.
 * 
 * @deprecated Use cloudSql client from @/integrations/cloudsql for database operations
 */

// ==================== Mock Auth State ====================
let mockSession: any = null;
const authListeners: Set<Function> = new Set();

// Mock Profile Data
const mockProfiles: Record<string, any> = {
    "global-super-admin": {
        id: "global-super-admin",
        email: "superadmin@demo.idetude.app",
        first_name: "Super",
        last_name: "Admin",
        avatar_url: null,
        is_demo: true,
        created_at: new Date().toISOString()
    }
};

const mockRoles: Record<string, any[]> = {
    "global-super-admin": [{ role: "super_admin" }]
};

// Notify all registered auth listeners
const notifyAuthListeners = (event: string, session: any) => {
    authListeners.forEach(callback => {
        try {
            callback(event, session);
        } catch (e) {
            console.error("[Mock Auth] Listener error:", e);
        }
    });
};

const createStubClient = () => {
    console.log("[Supabase Stub] Running in Cloud SQL Mock Mode");

    const stubQuery = (tableName: string) => {
        let currentData: any = null;
        let currentError: any = null;

        const chain: any = {
            select: (..._args: any[]) => chain,
            insert: (..._args: any[]) => chain,
            update: (..._args: any[]) => chain,
            delete: () => chain,
            eq: (col: string, val: any) => {
                if (tableName === 'profiles' && col === 'id') {
                    currentData = mockProfiles[val] || null;
                }
                if (tableName === 'user_roles' && col === 'user_id') {
                    currentData = mockRoles[val] || [];
                }
                return chain;
            },
            neq: () => chain,
            gt: () => chain,
            gte: () => chain,
            lt: () => chain,
            lte: () => chain,
            like: () => chain,
            ilike: () => chain,
            is: () => chain,
            in: () => chain,
            contains: () => chain,
            order: (..._args: any[]) => chain,
            limit: () => chain,
            single: () => {
                if (Array.isArray(currentData) && currentData.length > 0) currentData = currentData[0];
                return Promise.resolve({ data: currentData, error: currentError });
            },
            maybeSingle: () => {
                if (Array.isArray(currentData) && currentData.length > 0) currentData = currentData[0];
                return Promise.resolve({ data: currentData, error: currentError });
            },
            then: (resolve: (value: { data: any; error: any }) => void, reject?: (reason?: any) => void) => {
                return Promise.resolve({ data: currentData, error: currentError }).then(resolve, reject);
            },
        };
        return chain;
    };

    const stubStorage = {
        from: () => ({
            upload: () => Promise.resolve({ data: null, error: new Error("Storage not available in Mock Mode") }),
            download: () => Promise.resolve({ data: null, error: new Error("Storage not available in Mock Mode") }),
            remove: () => Promise.resolve({ data: null, error: new Error("Storage not available in Mock Mode") }),
            getPublicUrl: () => ({ data: { publicUrl: '' } }),
        }),
    };

    return {
        from: (table: string) => stubQuery(table),
        storage: stubStorage,
        channel: () => ({ on: () => ({ subscribe: () => { } }) }),
        removeChannel: () => { },
        auth: {
            getSession: () => Promise.resolve({ data: { session: mockSession }, error: null }),
            getUser: () => Promise.resolve({ data: { user: mockSession?.user || null }, error: null }),

            signInWithPassword: async ({ email, password }: any) => {
                console.log("[Mock Auth] Attempting login:", email);

                // Super Admin Login
                if (email === "superadmin@demo.idetude.app" && password === "Demo2025!") {
                    const user = {
                        id: "global-super-admin",
                        email: email,
                        aud: "authenticated",
                        created_at: new Date().toISOString(),
                    };
                    mockSession = {
                        access_token: "mock-token",
                        refresh_token: "mock-refresh",
                        user: user,
                    };

                    // Notify listeners of successful login
                    setTimeout(() => notifyAuthListeners('SIGNED_IN', mockSession), 0);

                    return { data: { session: mockSession, user }, error: null };
                }

                return {
                    data: { session: null, user: null },
                    error: { message: "Invalid login credentials (Mock)" }
                };
            },

            signOut: async () => {
                mockSession = null;
                // Notify listeners of signout
                setTimeout(() => notifyAuthListeners('SIGNED_OUT', null), 0);
                return { error: null };
            },

            onAuthStateChange: (callback: Function) => {
                // Register the listener
                authListeners.add(callback);

                // Trigger INITIAL_SESSION immediately with current state
                setTimeout(() => callback('INITIAL_SESSION', mockSession), 0);

                return {
                    data: {
                        subscription: {
                            unsubscribe: () => {
                                authListeners.delete(callback);
                            }
                        }
                    }
                };
            },
        },
    };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any = createStubClient();
