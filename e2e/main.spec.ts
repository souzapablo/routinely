import { expect, type Page, test } from "@playwright/test";

// Sunday morning of the example week, in the machine's local time zone (the
// browser uses the same zone).
const SUNDAY_MORNING = new Date(2026, 10, 8, 7, 48);

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(SUNDAY_MORNING);
});

async function openPlanner(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /This week|Esta semana/ }),
  ).toBeVisible();
}

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

test("has no horizontal scroll at 390 and 1280", async ({ page }) => {
  for (const width of [390, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await openPlanner(page);

    const overflow = await page
      .locator("html")
      .evaluate((html) => html.scrollWidth - html.clientWidth);
    expect(overflow, `horizontal overflow at ${width} px`).toBe(0);
  }

  // At 390 px the week is wider than the window and scrolls inside its card.
  await page.setViewportSize({ width: 390, height: 844 });
  await openPlanner(page);
  const scroller = page.locator('[class*="_scroll_"]');
  const sideways = await scroller.evaluate((el) => ({
    overflowX: getComputedStyle(el).overflowX,
    hidden: el.scrollWidth - el.clientWidth,
  }));
  expect(sideways.overflowX).toBe("auto");
  expect(sideways.hidden).toBeGreaterThan(0);
});

test("fits the window at desktop sizes, with the tray list scrolling inside", async ({
  page,
}) => {
  for (const [width, height] of [
    [1280, 800],
    [1440, 900],
    [1920, 1080],
  ] as const) {
    await page.setViewportSize({ width, height });
    await openPlanner(page);

    const overflow = await page
      .locator("html")
      .evaluate((html) => html.scrollHeight - html.clientHeight);
    expect(overflow, `vertical page scroll at ${width}x${height}`).toBe(0);

    // Every hour row is on screen: the grid body does not scroll.
    const body = page.locator('[class*="_body_"]');
    const hidden = await body.evaluate(
      (el) => el.scrollHeight - el.clientHeight,
    );
    expect(hidden, `grid hours cut at ${width}x${height}`).toBeLessThanOrEqual(
      1,
    );
    await expect(page.getByText("10 PM")).toBeInViewport();
  }

  // At 1280x800 the tray has more items than room; only its list scrolls.
  await page.setViewportSize({ width: 1280, height: 800 });
  await openPlanner(page);
  const list = page.locator('[class*="_items_"]');
  const scroll = await list.evaluate((el) => ({
    overflowY: getComputedStyle(el).overflowY,
    hidden: el.scrollHeight - el.clientHeight,
  }));
  expect(scroll.overflowY).toBe("auto");
  expect(scroll.hidden).toBeGreaterThan(0);
  await expect(page.getByText("+ New flexible activity")).toBeInViewport();
});

test("loads fonts from its own host", async ({ page, baseURL }) => {
  const origins = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.protocol.startsWith("http")) origins.add(url.origin);
  });

  await openPlanner(page);
  await page.evaluate(() => document.fonts.ready);

  expect([...origins]).toEqual([new URL(baseURL ?? "").origin]);
  // document.fonts.check() is also true for a family with no faces at all,
  // so the loaded faces are read directly.
  const loaded = await page.evaluate(() =>
    Array.from(document.fonts)
      .filter((face) => face.status === "loaded")
      .map((face) => face.family.replaceAll('"', "")),
  );
  for (const family of [
    "Bricolage Grotesque Variable",
    "Instrument Sans Variable",
    "JetBrains Mono",
  ]) {
    expect(loaded, `${family} is loaded`).toContain(family);
  }
});

test("follows a dark color scheme", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await openPlanner(page);

  await expect(page.locator("body")).toHaveCSS(
    "background-color",
    "rgb(15, 19, 26)",
  );
});

test("draws the now-line in the accent color at the current time", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openPlanner(page);

  const line = page.locator('[class*="_now_"]');
  await expect(line).toHaveCount(1);
  const placed = await line.evaluate((el) => {
    const column = el.parentElement;
    if (!column) throw new Error("the now-line has no column");
    const hour = column.parentElement?.querySelector('[class*="_hour_"]');
    if (!hour) throw new Error("the grid has no hour row");
    return {
      top: el.getBoundingClientRect().top - column.getBoundingClientRect().top,
      pxPerHour: hour.getBoundingClientRect().height,
      inToday: column.className.includes("_today_"),
      background: getComputedStyle(el).backgroundColor,
    };
  });

  // 07:48 is 1.8 hours after 06:00, at whatever height the hours fit into.
  expect(placed.top).toBeCloseTo(1.8 * placed.pxPerHour, 0);
  expect(placed.inToday).toBe(true);
  expect(placed.background).toBe(await tokenColor(page, "--accent"));
  expect(placed.background).toBe("rgb(31, 111, 107)");
});

test("shows no error red and no undone wording", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openPlanner(page);
  const bad = await tokenColor(page, "--bad");

  for (const language of ["English", "Português"]) {
    await page.getByRole("button", { name: language }).click();

    const red = await page.evaluate((badColor) => {
      const properties = [
        "color",
        "backgroundColor",
        "borderTopColor",
        "borderRightColor",
        "borderBottomColor",
        "borderLeftColor",
        "outlineColor",
        "fill",
        "stroke",
      ] as const;
      const found: string[] = [];
      for (const el of document.body.querySelectorAll("*")) {
        const style = getComputedStyle(el);
        for (const property of properties) {
          if (style[property] === badColor) {
            found.push(`${el.tagName}.${el.className.toString()} ${property}`);
          }
        }
      }
      return found;
    }, bad);
    expect(red, `elements in error red (${language})`).toEqual([]);

    const text = (await page.locator("body").innerText()).toLowerCase();
    expect(text).not.toMatch(
      /\b(missed|failed|overdue|late|skipped|perdido|falhou|atrasado|pulado)\b/,
    );
  }
});

test("shows pt-BR texts and 24-hour times", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openPlanner(page);

  await page.getByRole("button", { name: "Português" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "pt-BR");
  await expect(
    page.getByRole("heading", { level: 1, name: "Esta semana" }),
  ).toBeVisible();
  await expect(page.getByText("Semana de exemplo")).toBeVisible();
  await expect(page.getByText("Encaixe nesta semana")).toBeVisible();
  await expect(
    page.getByText(/^2 de nov\.\s–\s8 de nov\. de 2026$/),
  ).toBeVisible();
  await expect(page.getByText("Hoje · domingo, 8 de nov.")).toBeVisible();

  const hours = await page.locator('[class*="_hourLabel_"]').allTextContents();
  expect(hours[0]).toBe("06:00");
  expect(hours.at(-1)).toBe("22:00");
  await expect(page.getByText(/^09:00\s–\s18:00$/).first()).toBeVisible();

  const text = await page.locator("main").innerText();
  expect(text).not.toMatch(/\b(AM|PM)\b/);
});

test("cuts long names with an ellipsis", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await openPlanner(page);

  // A long name, and a time range too wide for its column.
  for (const text of [
    page.getByText("Therapy session", { exact: true }),
    page.getByText(/^9:00\sAM\s–\s6:00\sPM$/).first(),
  ]) {
    const cut = await text.evaluate((el) => {
      const style = getComputedStyle(el);
      return {
        textOverflow: style.textOverflow,
        whiteSpace: style.whiteSpace,
        overflows: el.scrollWidth > el.clientWidth,
        lines: Math.round(
          el.getBoundingClientRect().height / parseFloat(style.lineHeight),
        ),
      };
    });

    expect(cut).toEqual({
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
      overflows: true,
      lines: 1,
    });
  }
});
