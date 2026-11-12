import { describe, expect, it } from "vitest";
import i18n from "../../i18n/index.ts";
import type { ActivityDraft } from "./form.ts";
import { newActivityDraft } from "./form.ts";
import { activityPreviewParts } from "./preview.ts";

function line(draft: ActivityDraft, lang: string): string {
  // The keys are typed for `t` in components; the tests render any key.
  const t = i18n.getFixedT(lang) as (
    key: string,
    values?: Record<string, unknown>,
  ) => string;
  return activityPreviewParts(draft, (d) => t(d.key, d.values))
    .map((part) => t(part.key, part.values))
    .join(" · ");
}

const run: ActivityDraft = {
  name: "Run 5 km",
  timesPerWeek: 2,
  duration: 45,
  category: "movement",
};

describe("activityPreviewParts", () => {
  it("names the activity, its times a week, each time's length and its kind", () => {
    expect(line(run, "en")).toBe(
      "Run 5 km · 2× a week · 45 min each · Movement",
    );
  });

  it("follows pt-BR", () => {
    expect(line(run, "pt-BR")).toBe(
      "Run 5 km · 2× por semana · 45 min cada · Movimento",
    );
  });

  it("calls an empty name Untitled", () => {
    expect(line(newActivityDraft(), "en")).toBe(
      "Untitled · 1× a week · 30 min each · Movement",
    );
    expect(line({ ...run, name: "   " }, "pt-BR")).toBe(
      "Sem nome · 2× por semana · 45 min cada · Movimento",
    );
  });

  it("trims the name and renders hours", () => {
    expect(
      line(
        { name: "  Read ", timesPerWeek: 3, duration: 90, category: "rest" },
        "en",
      ),
    ).toBe("Read · 3× a week · 1 h 30 min each · Rest");
  });
});
