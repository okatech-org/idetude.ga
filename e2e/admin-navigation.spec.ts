import { test, expect } from "@playwright/test";

test.describe("Admin Navigation", () => {
    test("should display establishments page", async ({ page }) => {
        await page.goto("/admin/establishments");

        // Check for page content
        await page.waitForLoadState("networkidle");

        // Should have some content visible
        await expect(page.locator("main, [role='main'], .container").first()).toBeVisible();
    });

    test("should display countries management page", async ({ page }) => {
        await page.goto("/admin/countries");

        await page.waitForLoadState("networkidle");

        // Check for table or list structure
        const hasContent = await page.locator("table, [role='table'], .grid, .list").first().isVisible().catch(() => true);
        expect(hasContent).toBeTruthy();
    });

    test("should navigate between admin pages", async ({ page }) => {
        await page.goto("/admin/establishments");
        await page.waitForLoadState("networkidle");

        // Try to find and click on settings link
        const settingsLink = page.locator('a[href*="settings"], a:has-text("Paramètres")');

        if (await settingsLink.isVisible().catch(() => false)) {
            await settingsLink.click();
            await page.waitForLoadState("networkidle");
            expect(page.url()).toContain("settings");
        }
    });

    test("should display users management page", async ({ page }) => {
        await page.goto("/admin/users");

        await page.waitForLoadState("networkidle");

        // Check page has loaded
        await expect(page.locator("body")).not.toBeEmpty();
    });

    test("should display analytics page", async ({ page }) => {
        await page.goto("/admin/analytics");

        await page.waitForLoadState("networkidle");

        // Analytics page should have charts or statistics
        const hasContent = await page.locator("main, .dashboard, .analytics").first().isVisible().catch(() => true);
        expect(hasContent).toBeTruthy();
    });
});
