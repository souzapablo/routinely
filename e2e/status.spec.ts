import { expect, test } from "@playwright/test";

test("shows server and database connected", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Routinely" })).toBeVisible();
  await expect(page.getByText("Server: connected")).toBeVisible();
  await expect(page.getByText("Database: connected")).toBeVisible();
});

test("fits 360 px and 1280 px without horizontal scroll", async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await expect(page.getByText("Database: connected")).toBeVisible();

    const overflow = await page
      .locator("html")
      .evaluate((html) => html.scrollWidth - html.clientWidth);
    expect(overflow, `horizontal overflow at ${width} px`).toBe(0);
  }
});

test("keeps the picked language after a reload", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Server: connected")).toBeVisible();

  await page.getByRole("button", { name: "Português" }).click();
  await expect(page.getByText("Servidor: conectado")).toBeVisible();

  await page.reload();

  await expect(page.getByText("Servidor: conectado")).toBeVisible();
  await expect(page.getByText("Banco de dados: conectado")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});
