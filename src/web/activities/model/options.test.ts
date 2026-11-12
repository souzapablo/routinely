import { describe, expect, it } from "vitest";
import i18n from "../../i18n/index.ts";
import { categoryOptions, durationOptions } from "./options.ts";

function render(
  option: { key: string; values?: Record<string, unknown> },
  lang: string,
): string {
  // The keys are typed for `t` in components; the tests render any key.
  const t = i18n.getFixedT(lang) as (
    key: string,
    values?: Record<string, unknown>,
  ) => string;
  return t(option.key, option.values);
}

describe("durationOptions", () => {
  it("offers the seven durations in order, in English", () => {
    expect(durationOptions().map((o) => render(o, "en"))).toEqual([
      "15 min",
      "30 min",
      "45 min",
      "1 h",
      "1 h 30 min",
      "2 h",
      "3 h",
    ]);
  });

  it("offers the seven durations in pt-BR", () => {
    expect(durationOptions().map((o) => render(o, "pt-BR"))).toEqual([
      "15 min",
      "30 min",
      "45 min",
      "1 h",
      "1 h 30 min",
      "2 h",
      "3 h",
    ]);
  });

  it("carries each duration's minutes as its value", () => {
    expect(durationOptions().map((o) => o.minutes)).toEqual([
      15, 30, 45, 60, 90, 120, 180,
    ]);
  });
});

describe("categoryOptions", () => {
  it("offers the five kinds in order, in English", () => {
    expect(categoryOptions().map((o) => render(o, "en"))).toEqual([
      "Movement",
      "Home",
      "Errands",
      "Rest",
      "People",
    ]);
  });

  it("offers the five kinds in pt-BR", () => {
    expect(categoryOptions().map((o) => render(o, "pt-BR"))).toEqual([
      "Movimento",
      "Casa",
      "Tarefas",
      "Descanso",
      "Pessoas",
    ]);
  });

  it("carries each kind's category as its value", () => {
    expect(categoryOptions().map((o) => o.category)).toEqual([
      "movement",
      "home",
      "errands",
      "rest",
      "people",
    ]);
  });
});
