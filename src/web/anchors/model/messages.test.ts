import { describe, expect, it } from "vitest";
import type { ProblemCode } from "../../../shared/anchors.ts";
import en from "../../i18n/en.json";
import i18n from "../../i18n/index.ts";
import ptBR from "../../i18n/pt-BR.json";
import { failureMessage, problemMessage } from "./messages.ts";

// Intl puts a narrow no-break space before AM/PM.
const plain = (text: string) => text.replace(/[\u2009\u202f\u00a0]/g, " ");

function render(
  message: { key: string; values: Record<string, unknown> },
  lang: string,
): string {
  // The keys are typed for `t` in components; the tests render any key.
  const t = i18n.getFixedT(lang) as (
    key: string,
    values: Record<string, unknown>,
  ) => string;
  return plain(t(message.key, message.values));
}

describe("problemMessage", () => {
  it.each<[ProblemCode, string]>([
    ["nameEmpty", "Give it a name so you can recognize it on the calendar."],
    ["noDays", "Pick at least one day it repeats on."],
    ["timesMissing", "Set a start and end time."],
    ["endBeforeStart", "The end time needs to be after the start time."],
  ])("words %s as the spec does", (code, text) => {
    const message = problemMessage({ code }, "en");
    expect(message.key).toBe(`anchors.rules.${code}`);
    expect(render(message, "en")).toBe(text);
  });

  it("gives the 15-minute examples in the language's format", () => {
    const enMessage = problemMessage({ code: "timeStep" }, "en");
    expect(enMessage.key).toBe("anchors.rules.timeStep");
    expect(Object.values(enMessage.values).map(String).map(plain)).toEqual([
      "9:00 AM",
      "9:15 AM",
    ]);
    expect(render(enMessage, "en")).toBe(
      "Times go in 15-minute steps, like 9:00 AM or 9:15 AM.",
    );

    const ptMessage = problemMessage({ code: "timeStep" }, "pt-BR");
    expect(ptMessage.values).toEqual({ first: "09:00", second: "09:15" });
  });

  it("names the other anchor and the shared day", () => {
    const problem = { code: "overlap", other: "Work", day: 1 } as const;
    const enMessage = problemMessage(problem, "en");
    expect(enMessage.key).toBe("anchors.rules.overlap");
    expect(enMessage.values).toEqual({ other: "Work", weekday: "Mon" });
    expect(render(enMessage, "en")).toBe(
      "This overlaps Work on Mon. Anchors can't share time.",
    );

    expect(problemMessage(problem, "pt-BR").values).toEqual({
      other: "Work",
      weekday: "seg.",
    });
  });

  it("states the name limit", () => {
    const message = problemMessage({ code: "nameTooLong" }, "en");
    expect(message.key).toBe("anchors.rules.nameTooLong");
    expect(render(message, "en")).toBe(
      "Keep the name to 60 characters or fewer.",
    );
  });
});

describe("failureMessage", () => {
  it("words a failed save and a failed delete as the spec does", () => {
    expect(render(failureMessage("save"), "en")).toBe(
      "Not saved. Your changes are still here, so you can try again.",
    );
    expect(render(failureMessage("delete"), "en")).toBe(
      "Not deleted. Try again in a moment.",
    );
  });
});

describe("anchor message wording", () => {
  it("never calls anything missed, failed, overdue, late or skipped", () => {
    const strings = [
      ...Object.values(en.anchors.rules),
      ...Object.values(en.anchors.failure),
      ...Object.values(ptBR.anchors.rules),
      ...Object.values(ptBR.anchors.failure),
    ].join("\n");
    expect(strings.toLowerCase()).not.toMatch(
      /\b(missed|failed|overdue|late|skipped|perdid[oa]s?|falh(ou|a)|atrasad[oa]s?|pulad[oa]s?|vencid[oa]s?)\b/,
    );
  });
});
