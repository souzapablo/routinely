import { expect, type Page, test } from "@playwright/test";
import { resetAnchors, type SeedAnchor } from "./anchors.ts";

// Monday morning, so a Monday anchor is in the Today strip.
const MONDAY_MORNING = new Date(2026, 10, 9, 7, 30);

const WORK: SeedAnchor = {
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

async function openPlanner(page: Page) {
  await page.goto("/");
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
}

function drawer(page: Page) {
  return page.getByRole("dialog");
}

/** The week grid, without the Today strip. */
function grid(page: Page) {
  return page.locator('[class*="_scroll_"]');
}

/** The grid's blocks for an anchor, one per day it is on. */
function blocks(page: Page, name: string) {
  return grid(page).getByRole("button", { name: `Edit ${name}`, exact: true });
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(MONDAY_MORNING);
  await page.setViewportSize({ width: 1280, height: 900 });
});

test("draws stored anchors", async ({ page, request }) => {
  await resetAnchors(request, [
    WORK,
    { name: "Choir", days: [1, 6], start: 1140, end: 1230 },
  ]);
  await openPlanner(page);

  await expect(blocks(page, "Work")).toHaveCount(5);
  await expect(blocks(page, "Choir")).toHaveCount(2);

  const today = page.getByRole("region", { name: /^Today/ });
  await expect(today.getByText("Work", { exact: true })).toBeVisible();
  await expect(today.getByText("Choir", { exact: true })).toBeVisible();
});

test("adds an anchor", async ({ page, request }) => {
  await resetAnchors(request, []);
  await openPlanner(page);

  await page.getByRole("button", { name: "Add activity" }).click();
  await expect(drawer(page)).toHaveAccessibleName("Add anchor");
  await expect(page.getByLabel("Name")).toBeFocused();
  await page.getByLabel("Name").fill("Work");
  await drawer(page).getByRole("button", { name: "Save anchor" }).click();

  await expect(drawer(page)).toBeHidden();
  await expect(page.getByText("Saved Work.")).toBeVisible();
  await expect(blocks(page, "Work")).toHaveCount(5);
  await expect(grid(page).getByText(/^9:00\sAM\s–\s6:00\sPM$/)).toHaveCount(5);

  await page.reload();
  await expect(blocks(page, "Work")).toHaveCount(5);
});

test("edits an anchor", async ({ page, request }) => {
  await resetAnchors(request, [WORK]);
  await openPlanner(page);

  await blocks(page, "Work").first().click();
  await expect(drawer(page)).toHaveAccessibleName("Edit anchor");
  await expect(page.getByLabel("Name")).toHaveValue("Work");
  await expect(page.getByLabel("Start")).toHaveValue("09:00");
  await page.getByLabel("End").fill("17:00");
  await drawer(page).getByRole("button", { name: "Save anchor" }).click();

  await expect(drawer(page)).toBeHidden();
  await expect(page.getByText("Saved Work.")).toBeVisible();
  await expect(grid(page).getByText(/^9:00\sAM\s–\s5:00\sPM$/)).toHaveCount(5);
  await expect(grid(page).getByText(/^9:00\sAM\s–\s6:00\sPM$/)).toHaveCount(0);

  await page.reload();
  await expect(grid(page).getByText(/^9:00\sAM\s–\s5:00\sPM$/)).toHaveCount(5);
});

test("refuses an overlap and accepts touching", async ({ page, request }) => {
  await resetAnchors(request, [WORK]);
  await openPlanner(page);
  const posts: string[] = [];
  page.on("request", (sent) => {
    if (sent.method() === "POST") posts.push(sent.url());
  });

  await page.getByRole("button", { name: "Add activity" }).click();
  await page.getByLabel("Name").fill("Gym");
  for (const day of ["Tue", "Wed", "Thu", "Fri"]) {
    await drawer(page).getByRole("button", { name: day }).click();
  }
  await page.getByLabel("Start").fill("17:00");
  await page.getByLabel("End").fill("18:30");
  await drawer(page).getByRole("button", { name: "Save anchor" }).click();

  await expect(drawer(page).getByRole("status")).toHaveText(
    "This overlaps Work on Mon. Anchors can't share time.",
  );
  await expect(drawer(page)).toBeVisible();
  expect(posts).toEqual([]);
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();

  await page.getByLabel("Start").fill("18:00");
  await page.getByLabel("End").fill("19:00");
  await drawer(page).getByRole("button", { name: "Save anchor" }).click();

  await expect(drawer(page)).toBeHidden();
  await expect(page.getByText("Saved Gym.")).toBeVisible();
  await expect(blocks(page, "Gym")).toHaveCount(1);
  await expect(blocks(page, "Work")).toHaveCount(5);
});

test("deletes with two clicks", async ({ page, request }) => {
  await resetAnchors(request, [WORK]);
  await openPlanner(page);

  await blocks(page, "Work").first().click();
  const del = drawer(page).getByRole("button", { name: "Delete" });
  await del.click();

  const armed = drawer(page).getByRole("button", {
    name: "Click again to delete",
  });
  await expect(armed).toBeVisible();
  await expect(blocks(page, "Work")).toHaveCount(5);
  const listed = await request.get("/api/anchors");
  expect(await listed.json()).toHaveLength(1);

  await armed.click();
  await expect(drawer(page)).toBeHidden();
  await expect(page.getByText("Deleted Work.")).toBeVisible();
  await expect(blocks(page, "Work")).toHaveCount(0);

  await page.reload();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  await expect(blocks(page, "Work")).toHaveCount(0);
});
