import { describe, expect, it } from "vitest";
import type { DayIndex } from "../../../shared/planner.ts";
import i18n from "../../i18n/index.ts";
import { newDraft } from "./form.ts";
import { daysLabel, previewParts } from "./preview.ts";

// Intl puts thin and narrow no-break spaces in ranges and before AM/PM.
const plain = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, " ");

function render(
  part: { key: string; values: Record<string, unknown> },
  lang: string,
): string {
  // The keys are typed for `t` in components; the tests render any key.
  const t = i18n.getFixedT(lang) as (
    key: string,
    values: Record<string, unknown>,
  ) => string;
  return plain(t(part.key, part.values));
}

const days = (list: DayIndex[], lang = "en") =>
  render(daysLabel(list, lang), lang);

describe("daysLabel", () => {
  it("names all seven days as every day", () => {
    expect(days([0, 1, 2, 3, 4, 5, 6])).toBe("every day");
    expect(days([0, 1, 2, 3, 4, 5, 6], "pt-BR")).toBe("todo dia");
  });

  it("names exactly Monday to Friday as a range of short names", () => {
    expect(days([1, 2, 3, 4, 5])).toBe("Mon–Fri");
    expect(days([1, 2, 3, 4, 5], "pt-BR")).toBe("seg.–sex.");
  });

  it("names exactly Saturday and Sunday as weekends", () => {
    expect(days([0, 6])).toBe("weekends");
    expect(days([0, 6], "pt-BR")).toBe("fins de semana");
  });

  it("lists any other days by short name in week order", () => {
    expect(days([1, 3])).toBe("Mon, Wed");
    expect(days([3, 1])).toBe("Mon, Wed");
    expect(days([0, 1, 2, 3, 4, 5])).toBe("Sun, Mon, Tue, Wed, Thu, Fri");
    expect(days([1, 3], "pt-BR")).toBe("seg., qua.");
  });
});

describe("previewParts", () => {
  const line = (draft: Parameters<typeof previewParts>[0], lang = "en") =>
    previewParts(draft, lang).map((part) => render(part, lang));

  it("names the anchor, its days, its time range and every week", () => {
    expect(line({ ...newDraft(), name: " Work " })).toEqual([
      "Work",
      "Mon–Fri",
      "9:00 AM – 6:00 PM",
      "every week",
    ]);
  });

  it("follows pt-BR", () => {
    expect(line({ ...newDraft(), name: "Trabalho" }, "pt-BR")).toEqual([
      "Trabalho",
      "seg.–sex.",
      "09:00 – 18:00",
      "toda semana",
    ]);
  });

  it("calls an empty name Untitled", () => {
    expect(line({ ...newDraft(), name: "  " })[0]).toBe("Untitled");
  });

  it("leaves out the time range when a time is empty", () => {
    expect(line({ ...newDraft(), name: "Work", end: "" })).toEqual([
      "Work",
      "Mon–Fri",
      "every week",
    ]);
  });

  it("leaves out the time range when the end is not after the start", () => {
    expect(
      line({ ...newDraft(), name: "Work", start: "18:00", end: "09:00" }),
    ).toEqual(["Work", "Mon–Fri", "every week"]);
  });
});
