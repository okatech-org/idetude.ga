// Tests unitaires pour ClassConfigTab
// Recommandation #13: Tests unitaires complets

import { describe, it, expect, vi } from "vitest";
import {
    generateClassNames,
    generateClassId,
    getPresetsForSystem,
    CLASS_PRESETS_BY_SYSTEM,
    type ClassConfig,
    type LevelClassesConfig,
} from "../classConfigTypes";

describe("ClassConfigTypes", () => {
    describe("generateClassNames", () => {
        it("should generate alphabetic names (A, B, C...)", () => {
            const names = generateClassNames("alpha", 5);
            expect(names).toEqual(["A", "B", "C", "D", "E"]);
        });

        it("should generate numeric names (1, 2, 3...)", () => {
            const names = generateClassNames("numeric", 4);
            expect(names).toEqual(["1", "2", "3", "4"]);
        });

        it("should generate padded numeric names (01, 02, 03...)", () => {
            const names = generateClassNames("numeric_padded", 3);
            expect(names).toEqual(["01", "02", "03"]);
        });

        it("should generate roman numeral names (I, II, III...)", () => {
            const names = generateClassNames("roman", 5);
            expect(names).toEqual(["I", "II", "III", "IV", "V"]);
        });

        it("should generate house names for house pattern", () => {
            const names = generateClassNames("house", 4);
            expect(names).toEqual(["Red", "Blue", "Green", "Yellow"]);
        });

        it("should return empty array for custom pattern", () => {
            const names = generateClassNames("custom", 5);
            expect(names).toEqual([]);
        });

        it("should limit roman numerals to 10", () => {
            const names = generateClassNames("roman", 15);
            expect(names.length).toBe(10);
        });

        it("should limit house names to 6", () => {
            const names = generateClassNames("house", 10);
            expect(names.length).toBe(6);
        });

        it("should handle count of 0", () => {
            const names = generateClassNames("alpha", 0);
            expect(names).toEqual([]);
        });
    });

    describe("generateClassId", () => {
        it("should generate unique IDs", () => {
            const id1 = generateClassId();
            const id2 = generateClassId();
            expect(id1).not.toBe(id2);
        });

        it("should start with 'class_' prefix", () => {
            const id = generateClassId();
            expect(id.startsWith("class_")).toBe(true);
        });

        it("should contain timestamp", () => {
            const before = Date.now();
            const id = generateClassId();
            const after = Date.now();

            const timestampPart = id.split("_")[1];
            const timestamp = parseInt(timestampPart, 10);

            expect(timestamp).toBeGreaterThanOrEqual(before);
            expect(timestamp).toBeLessThanOrEqual(after);
        });
    });

    describe("getPresetsForSystem", () => {
        it("should return default presets for unknown system", () => {
            const presets = getPresetsForSystem(["unknown_system"]);
            expect(presets.length).toBeGreaterThan(0);
            expect(presets.some(p => p.id === "alpha")).toBe(true);
        });

        it("should include francophone presets", () => {
            const presets = getPresetsForSystem(["francophone"]);
            expect(presets.some(p => p.id === "alpha")).toBe(true);
            expect(presets.some(p => p.id === "numeric")).toBe(true);
        });

        it("should include britannique presets (forms and houses)", () => {
            const presets = getPresetsForSystem(["britannique"]);
            expect(presets.some(p => p.id === "house")).toBe(true);
        });

        it("should include americain presets", () => {
            const presets = getPresetsForSystem(["americain"]);
            expect(presets.some(p => p.id === "numeric_padded")).toBe(true);
        });

        it("should merge presets for multiple systems", () => {
            const presets = getPresetsForSystem(["francophone", "britannique"]);
            expect(presets.some(p => p.id === "alpha")).toBe(true);
            expect(presets.some(p => p.id === "house")).toBe(true);
        });

        it("should not duplicate presets", () => {
            const presets = getPresetsForSystem(["francophone", "francophone"]);
            const alphaCount = presets.filter(p => p.id === "alpha").length;
            expect(alphaCount).toBe(1);
        });

        it("should always include default presets", () => {
            const presets = getPresetsForSystem(["ib"]);
            expect(presets.some(p => p.id === "custom")).toBe(true);
            expect(presets.some(p => p.id === "roman")).toBe(true);
        });
    });

    describe("CLASS_PRESETS_BY_SYSTEM", () => {
        it("should have default presets", () => {
            expect(CLASS_PRESETS_BY_SYSTEM.default).toBeDefined();
            expect(CLASS_PRESETS_BY_SYSTEM.default.length).toBeGreaterThan(0);
        });

        it("should have francophone presets", () => {
            expect(CLASS_PRESETS_BY_SYSTEM.francophone).toBeDefined();
        });

        it("should have britannique presets", () => {
            expect(CLASS_PRESETS_BY_SYSTEM.britannique).toBeDefined();
        });

        it("should have valid preset structure", () => {
            CLASS_PRESETS_BY_SYSTEM.default.forEach(preset => {
                expect(preset).toHaveProperty("id");
                expect(preset).toHaveProperty("label");
                expect(preset).toHaveProperty("description");
                expect(preset).toHaveProperty("pattern");
                expect(preset).toHaveProperty("defaultCount");
                expect(preset).toHaveProperty("icon");
            });
        });
    });
});

describe("ClassConfig types", () => {
    it("should allow valid ClassConfig", () => {
        const config: ClassConfig = {
            id: "class_123",
            levelId: "6eme",
            name: "A",
            capacity: 30,
            room: "Salle 101",
            sections: ["francophone"],
        };

        expect(config.id).toBe("class_123");
        expect(config.name).toBe("A");
    });

    it("should allow ClassConfig without optional fields", () => {
        const config: ClassConfig = {
            id: "class_123",
            levelId: "6eme",
            name: "A",
        };

        expect(config.capacity).toBeUndefined();
        expect(config.room).toBeUndefined();
        expect(config.sections).toBeUndefined();
    });
});

describe("LevelClassesConfig types", () => {
    it("should allow valid LevelClassesConfig", () => {
        const config: LevelClassesConfig = {
            levelId: "6eme",
            classes: [
                { id: "class_1", levelId: "6eme", name: "A" },
                { id: "class_2", levelId: "6eme", name: "B" },
            ],
        };

        expect(config.levelId).toBe("6eme");
        expect(config.classes.length).toBe(2);
    });

    it("should allow empty classes array", () => {
        const config: LevelClassesConfig = {
            levelId: "6eme",
            classes: [],
        };

        expect(config.classes.length).toBe(0);
    });
});
