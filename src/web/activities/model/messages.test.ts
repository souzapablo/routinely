import { describe, expect, it } from "vitest";
import type { ActivityProblemCode } from "../../../shared/activities.ts";
import i18n from "../../i18n/index.ts";
import { activityProblemMessage } from "./messages.ts";

function render(
  message: { key: string; values: Record<string, unknown> },
  lang: string,
): string {
  // The keys are typed for `t` in components; the tests render any key.
  const t = i18n.getFixedT(lang) as (
    key: string,
    values: Record<string, unknown>,
  ) => string;
  return t(message.key, message.values);
}

describe("activityProblemMessage", () => {
  it.each<[ActivityProblemCode, string, string]>([
    [
      "nameEmpty",
      "Give it a name so you can recognize it on the calendar.",
      "Dê um nome para reconhecer no calendário.",
    ],
    [
      "nameTooLong",
      "Keep the name to 60 characters or fewer.",
      "Use no máximo 60 caracteres no nome.",
    ],
    [
      "timesOutOfRange",
      "Pick from 1 to 14 times a week.",
      "Escolha de 1 a 14 vezes por semana.",
    ],
    [
      "durationNotAllowed",
      "Pick how long each time takes.",
      "Escolha quanto tempo cada vez leva.",
    ],
    ["categoryUnknown", "Pick a kind.", "Escolha um tipo."],
  ])("renders %s in en and pt-BR", (code, en, ptBR) => {
    const message = activityProblemMessage({ code });
    expect(render(message, "en")).toBe(en);
    expect(render(message, "pt-BR")).toBe(ptBR);
  });

  it("uses the same name texts as anchors", () => {
    expect(activityProblemMessage({ code: "nameEmpty" }).key).toBe(
      "drawer.rules.nameEmpty",
    );
    expect(activityProblemMessage({ code: "nameTooLong" }).key).toBe(
      "drawer.rules.nameTooLong",
    );
  });
});
