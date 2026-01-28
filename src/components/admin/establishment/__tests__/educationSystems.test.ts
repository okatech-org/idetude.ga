import { describe, it, expect } from "vitest";
import {
    ALL_EDUCATION_SYSTEMS,
    GLOBAL_EDUCATION_SYSTEM_CATEGORIES,
    getTeachingLanguagesFromSystems,
    getLanguageDesignation,
} from "../educationSystems";

describe("educationSystems", () => {
    describe("GLOBAL_EDUCATION_SYSTEM_CATEGORIES", () => {
        it("should have 19 categories", () => {
            expect(GLOBAL_EDUCATION_SYSTEM_CATEGORIES).toHaveLength(19);
        });

        it("should include African francophone systems", () => {
            const afriqueFrancophone = GLOBAL_EDUCATION_SYSTEM_CATEGORIES.find(
                (cat) => cat.id === "afrique_francophone"
            );
            expect(afriqueFrancophone).toBeDefined();
            expect(afriqueFrancophone!.systems.length).toBeGreaterThan(15);
        });

        it("should include Gabonais system", () => {
            const gabonais = ALL_EDUCATION_SYSTEMS.find((s) => s.value === "gabonais");
            expect(gabonais).toBeDefined();
            expect(gabonais!.label).toBe("Gabonais");
            expect(gabonais!.icon).toBe("🇬🇦");
            expect(gabonais!.mainLanguage).toBe("fr");
        });

        it("should include international programs", () => {
            const intl = GLOBAL_EDUCATION_SYSTEM_CATEGORIES.find(
                (cat) => cat.id === "international"
            );
            expect(intl).toBeDefined();
            expect(intl!.systems.some((s) => s.value === "ib_dp")).toBe(true);
            expect(intl!.systems.some((s) => s.value === "cambridge_igcse")).toBe(true);
        });
    });

    describe("ALL_EDUCATION_SYSTEMS", () => {
        it("should have more than 150 systems", () => {
            expect(ALL_EDUCATION_SYSTEMS.length).toBeGreaterThan(150);
        });

        it("should have unique values", () => {
            const values = ALL_EDUCATION_SYSTEMS.map((s) => s.value);
            const uniqueValues = new Set(values);
            expect(uniqueValues.size).toBe(values.length);
        });
    });

    describe("getTeachingLanguagesFromSystems", () => {
        it("should return French for Gabonais system", () => {
            const languages = getTeachingLanguagesFromSystems(["gabonais"]);
            expect(languages).toContain("fr");
        });

        it("should return English for Nigerian system", () => {
            const languages = getTeachingLanguagesFromSystems(["nigerien_en"]);
            expect(languages).toContain("en");
        });

        it("should return multiple languages for mixed systems", () => {
            const languages = getTeachingLanguagesFromSystems(["gabonais", "britannique"]);
            expect(languages).toContain("fr");
            expect(languages).toContain("en");
        });

        it("should exclude 'multi' language tag", () => {
            const languages = getTeachingLanguagesFromSystems(["ib_dp"]);
            expect(languages).not.toContain("multi");
        });
    });

    describe("getLanguageDesignation", () => {
        it("should return null for single language without mixing", () => {
            const result = getLanguageDesignation(["gabonais"], []);
            expect(result).toBeNull();
        });

        it("should return Bilingue for two languages", () => {
            const result = getLanguageDesignation(["gabonais"], ["en"]);
            expect(result).not.toBeNull();
            expect(result!.label).toBe("Bilingue");
            expect(result!.totalLanguages).toBe(2);
        });

        it("should return Trilingue for three languages", () => {
            const result = getLanguageDesignation(["gabonais", "allemand"], ["es"]);
            expect(result).not.toBeNull();
            expect(result!.label).toBe("Mixte Trilingue");
            expect(result!.totalLanguages).toBe(3);
        });

        it("should return Mixte for multiple systems with single language", () => {
            const result = getLanguageDesignation(["gabonais", "senegalais"], []);
            expect(result).not.toBeNull();
            expect(result!.label).toBe("Mixte / Hybride");
        });
    });
});
