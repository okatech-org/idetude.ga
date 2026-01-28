// Tests unitaires pour la validation Zod
// Recommandation #13: Tests unitaires complets

import { describe, it, expect } from "vitest";
import {
    establishmentFormSchema,
    staffMemberSchema,
    validateEstablishmentForm,
    getFormErrors,
    DEFAULT_FORM_VALUES,
    type EstablishmentFormData,
} from "../validation";

describe("Establishment Form Validation", () => {
    describe("establishmentFormSchema", () => {
        it("should validate a complete valid form", () => {
            const validData: EstablishmentFormData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Saint-Michel",
                educationSystems: ["gabonais", "francais"],
                typesWithQualification: [{ type: "primaire", qualification: "Bilingue" }],
                selectedLevels: ["cp", "ce1", "ce2"],
                latitude: 0.3924,
                longitude: 9.4536,
            };

            const result = establishmentFormSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject empty name", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject name with less than 2 characters", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "A",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject empty educationSystems", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: [],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject empty typesWithQualification", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject empty selectedLevels", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: [],
                latitude: 0.39,
                longitude: 9.45,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject null GPS coordinates", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: null,
                longitude: null,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject mismatched GPS coordinates", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: null,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject invalid latitude (> 90)", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 95,
                longitude: 9.45,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should reject invalid longitude (> 180)", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 200,
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should accept valid email", () => {
            const validData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
                email: "contact@ecole.ga",
            };

            const result = establishmentFormSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject invalid email", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
                email: "invalid-email",
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });

        it("should accept valid phone number", () => {
            const validData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
                phone: "+24107123456",
            };

            const result = establishmentFormSchema.safeParse(validData);
            expect(result.success).toBe(true);
        });

        it("should reject phone number less than 8 characters", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
                phone: "1234567",
            };

            const result = establishmentFormSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe("staffMemberSchema", () => {
        it("should validate a complete staff member", () => {
            const staffData = {
                id: "staff_123",
                staff_type: "teacher",
                category: "educational",
                position: "Professeur de Mathématiques",
                is_active: true,
            };

            const result = staffMemberSchema.safeParse(staffData);
            expect(result.success).toBe(true);
        });

        it("should reject invalid category", () => {
            const invalidData = {
                id: "staff_123",
                staff_type: "teacher",
                category: "invalid_category",
            };

            const result = staffMemberSchema.safeParse(invalidData);
            expect(result.success).toBe(false);
        });
    });

    describe("validateEstablishmentForm", () => {
        it("should return success for valid data", () => {
            const validData = {
                ...DEFAULT_FORM_VALUES,
                name: "École Test",
                educationSystems: ["gabonais"],
                typesWithQualification: [{ type: "primaire" }],
                selectedLevels: ["cp"],
                latitude: 0.39,
                longitude: 9.45,
            };

            const result = validateEstablishmentForm(validData);
            expect(result.success).toBe(true);
            expect(result.data).toBeDefined();
        });

        it("should return errors for invalid data", () => {
            const invalidData = {
                ...DEFAULT_FORM_VALUES,
                name: "",
            };

            const result = validateEstablishmentForm(invalidData);
            expect(result.success).toBe(false);
            expect(result.errors).toBeDefined();
        });
    });

    describe("getFormErrors", () => {
        it("should format errors by path", () => {
            const errors = [
                { path: ["name"], message: "Le nom est requis" },
                { path: ["email"], message: "Email invalide" },
            ] as any;

            const formErrors = getFormErrors(errors);
            expect(formErrors.name).toBe("Le nom est requis");
            expect(formErrors.email).toBe("Email invalide");
        });

        it("should handle nested paths", () => {
            const errors = [
                { path: ["typesWithQualification", 0, "type"], message: "Type requis" },
            ] as any;

            const formErrors = getFormErrors(errors);
            expect(formErrors["typesWithQualification.0.type"]).toBe("Type requis");
        });
    });

    describe("DEFAULT_FORM_VALUES", () => {
        it("should have correct default values", () => {
            expect(DEFAULT_FORM_VALUES.name).toBe("");
            expect(DEFAULT_FORM_VALUES.country_code).toBe("GA");
            expect(DEFAULT_FORM_VALUES.educationSystems).toEqual([]);
            expect(DEFAULT_FORM_VALUES.enabledModules).toContain("messages");
            expect(DEFAULT_FORM_VALUES.enabledModules).toContain("grades");
        });
    });
});
