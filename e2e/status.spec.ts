import { expect, test } from "@playwright/test";

test("shows server and database connected", async ({ page }) => {
  await page.goto("/status");

  await expect(page.getByRole("heading", { name: "Routinely" })).toBeVisible();
  await expect(page.getByText("Server: connected")).toBeVisible();
  await expect(page.getByText("Database: connected")).toBeVisible();
});

test("fits 360 px and 1280 px without horizontal scroll", async ({ page }) => {
  for (const width of [360, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/status");
    await expect(page.getByText("Database: connected")).toBeVisible();

    const overflow = await page
      .locator("html")
      .evaluate((html) => html.scrollWidth - html.clientWidth);
    expect(overflow, `horizontal overflow at ${width} px`).toBe(0);
  }
});

test("keeps the picked language after a reload", async ({ page }) => {
  await page.goto("/status");
  await expect(page.getByText("Server: connected")).toBeVisible();

  await page.getByRole("button", { name: "Português" }).click();
  await expect(page.getByText("Servidor: conectado")).toBeVisible();

  await page.reload();

  await expect(page.getByText("Servidor: conectado")).toBeVisible();
  await expect(page.getByText("Banco de dados: conectado")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
});

test("keeps the top bar parts apart on a phone", async ({ page }) => {
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/status");
    await expect(page.getByText("Server: connected")).toBeVisible();

    const bar = page.getByRole("banner");
    const parts = [
      bar.getByText("Routinely"),
      bar.getByRole("status"),
      bar.getByRole("button", { name: "Add activity" }),
      bar.getByRole("button", { name: "English" }),
      bar.getByRole("button", { name: "Português" }),
    ];
    const boxes = [];
    for (const part of parts) {
      const box = await part.boundingBox();
      if (!box) throw new Error("a top bar part is not drawn");
      boxes.push(box);
    }

    // The language switch takes its own row under the first one, on the right.
    const [, , add, english, portuguese] = boxes;
    expect(english.y).toBeGreaterThanOrEqual(add.y + add.height);
    expect(english.y).toBe(portuguese.y);
    expect(portuguese.x + portuguese.width).toBeCloseTo(add.x + add.width, 0);

    for (const box of boxes) {
      expect(box.x, `inside the window at ${width} px`).toBeGreaterThanOrEqual(
        0,
      );
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    for (let i = 0; i < boxes.length; i++) {
      for (let j = i + 1; j < boxes.length; j++) {
        const [a, b] = [boxes[i], boxes[j]];
        const apart =
          a.x + a.width <= b.x ||
          b.x + b.width <= a.x ||
          a.y + a.height <= b.y ||
          b.y + b.height <= a.y;
        expect(
          apart,
          `top bar parts ${i} and ${j} overlap at ${width} px`,
        ).toBe(true);
      }
    }
  }
});
