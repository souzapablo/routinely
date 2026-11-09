import { describe, expect, it } from "vitest";
import i18n from "../../i18n/index.ts";
import { type SaveStatus, statusView } from "./saveStatus.ts";

describe("statusView", () => {
  it.each<[SaveStatus, string, string, string]>([
    ["loading", "busy", "Loading your week…", "Carregando sua semana…"],
    ["saving", "busy", "Saving…", "Salvando…"],
    ["saved", "ok", "Saved", "Salvo"],
    ["notSaved", "error", "Not saved", "Não salvo"],
    [
      "loadFailed",
      "error",
      "Couldn't load your week",
      "Não foi possível carregar sua semana",
    ],
  ])("shows %s with the %s tone", (status, tone, enText, ptText) => {
    const view = statusView(status);
    expect(view.tone).toBe(tone);
    expect(i18n.getFixedT("en")(view.key)).toBe(enText);
    expect(i18n.getFixedT("pt-BR")(view.key)).toBe(ptText);
  });
});
