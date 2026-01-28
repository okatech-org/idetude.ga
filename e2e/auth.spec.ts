import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
    test("should display login page", async ({ page }) => {
        await page.goto("/auth");

        // Check page title or heading
        await expect(page.locator("h1, h2").first()).toBeVisible();

        // Check for email input
        const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]');
        await expect(emailInput).toBeVisible();

        // Check for password input
        const passwordInput = page.locator('input[type="password"]');
        await expect(passwordInput).toBeVisible();

        // Check for submit button
        const submitButton = page.locator('button[type="submit"], button:has-text("Connexion"), button:has-text("Se connecter")');
        await expect(submitButton.first()).toBeVisible();
    });

    test("should redirect to auth page when accessing protected route without login", async ({ page }) => {
        await page.goto("/dashboard");

        // Should either redirect to auth or show auth prompt
        // Wait for navigation or content
        await page.waitForTimeout(1000);

        // Check URL or content
        const url = page.url();
        const isAuthPage = url.includes("/auth") || url.includes("/connexion");
        const hasLoginForm = await page.locator('input[type="password"]').isVisible().catch(() => false);

        expect(isAuthPage || hasLoginForm).toBeTruthy();
    });

    test("should display landing page correctly", async ({ page }) => {
        await page.goto("/");

        // Check for hero section or main content
        await expect(page.locator("main, [role='main'], .hero, section").first()).toBeVisible();

        // Check for navigation
        const nav = page.locator("nav, header");
        await expect(nav.first()).toBeVisible();
    });
});
