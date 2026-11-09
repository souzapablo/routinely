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

/** What a token computes to in the page, as `rgb(...)`. */
async function tokenColor(page: Page, token: string): Promise<string> {
  return page.evaluate((name) => {
    const probe = document.createElement("div");
    probe.style.color = `var(${name})`;
    document.body.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
  }, token);
}

test("keeps focus in the drawer", async ({ page, request }) => {
  await resetAnchors(request, [WORK]);
  await openPlanner(page);

  await page.getByRole("button", { name: "Add activity" }).click();
  await expect(page.getByLabel("Name")).toBeFocused();

  // More presses than the drawer has controls, both ways round. Past its
  // last control a modal dialog hands focus to the browser's own UI (the
  // page reads that as the body) and then wraps back to its first control;
  // no element of the page behind it ever gets focus.
  for (const key of ["Tab", "Shift+Tab"]) {
    let wrapped = false;
    let leftForBrowser = false;
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press(key);
      const where = await page.evaluate(() => {
        const focused = document.activeElement;
        if (focused === null || focused === document.body) return "browser";
        return document.querySelector("dialog[open]")?.contains(focused)
          ? "drawer"
          : "page";
      });
      expect(where, `focus after ${key} ×${i + 1}`).not.toBe("page");
      if (where === "browser") leftForBrowser = true;
      else if (leftForBrowser) wrapped = true;
    }
    expect(wrapped, `focus comes back into the drawer on ${key}`).toBe(true);
  }
});

test("returns focus when it closes", async ({ page, request }) => {
  await resetAnchors(request, [WORK]);
  await openPlanner(page);

  const add = page.getByRole("button", { name: "Add activity" });
  await add.click();
  await page.getByLabel("Name").fill("Not kept");
  await page.keyboard.press("Escape");
  await expect(drawer(page)).toBeHidden();
  await expect(add).toBeFocused();
  // Closing does not save.
  expect(await (await request.get("/api/anchors")).json()).toHaveLength(1);

  const tuesday = blocks(page, "Work").nth(1);
  await tuesday.focus();
  await page.keyboard.press("Enter");
  await expect(drawer(page)).toHaveAccessibleName("Edit anchor");
  await drawer(page).getByRole("button", { name: "Cancel" }).click();
  await expect(drawer(page)).toBeHidden();
  await expect(tuesday).toBeFocused();
});

test("fits a phone", async ({ page, request }) => {
  await resetAnchors(request, [WORK]);
  await page.setViewportSize({ width: 390, height: 844 });
  await openPlanner(page);

  await blocks(page, "Work").first().click();
  await expect(drawer(page)).toBeVisible();

  const box = await drawer(page).boundingBox();
  expect(box?.x).toBe(0);
  expect(box?.width).toBe(390);
  for (const name of ["Delete", "Cancel", "Save anchor"]) {
    await expect(drawer(page).getByRole("button", { name })).toBeInViewport({
      ratio: 1,
    });
  }
  const sideways = await page.evaluate(() => {
    const dialog = document.querySelector("dialog[open]");
    const html = document.documentElement;
    return {
      page: html.scrollWidth - html.clientWidth,
      drawer: dialog ? dialog.scrollWidth - dialog.clientWidth : -1,
    };
  });
  expect(sideways).toEqual({ page: 0, drawer: 0 });
});

test("follows a language change", async ({ page, request }) => {
  await resetAnchors(request, [WORK]);
  await openPlanner(page);

  await page.getByRole("button", { name: "Add activity" }).click();
  await drawer(page).getByRole("button", { name: "Save anchor" }).click();
  await expect(drawer(page).getByRole("status")).toHaveText(
    "Give it a name so you can recognize it on the calendar.",
  );

  // The open modal makes the top bar inert, so the switch is pressed from
  // script rather than with the mouse.
  await page.getByRole("button", { name: "Português" }).dispatchEvent("click");

  await expect(drawer(page)).toHaveAccessibleName("Adicionar âncora");
  await expect(drawer(page).getByLabel("Nome")).toBeVisible();
  await expect(drawer(page).getByLabel("Início")).toBeVisible();
  await expect(
    drawer(page).getByRole("button", { name: "Salvar âncora" }),
  ).toBeVisible();
  const monday = new Intl.DateTimeFormat("pt-BR", { weekday: "short" }).format(
    new Date(2026, 10, 9),
  );
  await expect(
    drawer(page).getByRole("button", { name: monday, exact: true }),
  ).toBeVisible();
  await expect(
    drawer(page).getByText(/^Sem nome · .+ · toda semana$/),
  ).toHaveText(/09:00\s–\s18:00/);
  await expect(drawer(page).getByRole("status")).toHaveText(
    "Dê um nome para reconhecer no calendário.",
  );
});

test("shows rule messages without error red", async ({ page, request }) => {
  await resetAnchors(request, [WORK]);
  await openPlanner(page);
  const bad = await tokenColor(page, "--bad");

  await page.getByRole("button", { name: "Add activity" }).click();
  await page.getByLabel("Name").fill("Gym");
  await drawer(page).getByRole("button", { name: "Save anchor" }).click();
  const line = drawer(page).getByRole("status");
  await expect(line).toHaveText(
    "This overlaps Work on Mon. Anchors can't share time.",
  );

  const colors = await line.evaluate((el) =>
    [el, ...el.querySelectorAll("*")].flatMap((node) => {
      const style = getComputedStyle(node);
      return [style.color, style.fill, style.stroke, style.backgroundColor];
    }),
  );
  expect(colors).not.toContain(bad);
  await expect(line).toHaveCSS("color", await tokenColor(page, "--muted"));
});
