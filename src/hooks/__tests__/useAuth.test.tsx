import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
    supabase: {
        auth: {
            getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
            onAuthStateChange: vi.fn().mockReturnValue({
                data: { subscription: { unsubscribe: vi.fn() } },
            }),
            signInWithPassword: vi.fn(),
            signUp: vi.fn(),
            signOut: vi.fn(),
        },
        from: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
                }),
            }),
        }),
    },
}));

// Import after mocking
import { AuthProvider, useAuth } from "../useAuth";

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
    });
    return ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
    );
};

describe("useAuth", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should initialize with null user when not authenticated", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.user).toBeNull();
        expect(result.current.session).toBeNull();
        expect(result.current.profile).toBeNull();
        expect(result.current.roles).toEqual([]);
    });

    it("should provide hasRole function", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasRole("super_admin")).toBe(false);
        expect(result.current.hasRole("teacher")).toBe(false);
    });

    it("should provide signIn function", async () => {
        const { result } = renderHook(() => useAuth(), { wrapper: createWrapper() });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(typeof result.current.signIn).toBe("function");
        expect(typeof result.current.signUp).toBe("function");
        expect(typeof result.current.signOut).toBe("function");
    });
});
