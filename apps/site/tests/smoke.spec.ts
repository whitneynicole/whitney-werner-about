import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Runs against a served build. CI sets SITE_URL; locally run `pnpm --filter site preview`.
const SITE_URL = process.env.SITE_URL ?? "http://localhost:4321";

test("home page renders its landmarks", async ({ page }) => {
  const response = await page.goto(SITE_URL + "/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveTitle(/\S/);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await expect(page.locator("main#main")).toHaveCount(1);
  await expect(page.getByRole("contentinfo")).toBeVisible();
  expect(await page.locator("h1").count()).toBeLessThanOrEqual(1);
});

test("home page has no WCAG 2.2 AA violations", async ({ page }) => {
  await page.goto(SITE_URL + "/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("home page has no horizontal scroll at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(SITE_URL + "/");
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
