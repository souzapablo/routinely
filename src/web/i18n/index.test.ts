import { afterEach, describe, expect, it, vi } from "vitest";
import en from "./en.json";
import i18n from "./index.ts";
import ptBR from "./pt-BR.json";

afterEach(async () => {
  vi.restoreAllMocks();
  localStorage.clear();
  await i18n.changeLanguage("en");
});

function keysOf(value: unknown, prefix = ""): string[] {
  if (typeof value !== "object" || value === null) {
    return [prefix];
  }
  return Object.entries(value)
    .flatMap(([key, child]) => keysOf(child, prefix ? `${prefix}.${key}` : key))
    .sort();
}

describe("i18n", () => {
  it("sets the html lang attribute to the active language", async () => {
    await i18n.changeLanguage("pt-BR");
    expect(document.documentElement.lang).toBe("pt-BR");
    expect(localStorage.getItem("routinely.lang")).toBe("pt-BR");

    await i18n.changeLanguage("en");
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("routinely.lang")).toBe("en");
  });

  it("still changes the language when localStorage throws", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });

    await i18n.changeLanguage("pt-BR");

    expect(i18n.language).toBe("pt-BR");
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("starts in pt-BR on a first visit from a Portuguese browser", async () => {
    vi.spyOn(Navigator.prototype, "languages", "get").mockReturnValue([
      "pt-BR",
      "en-US",
    ]);
    // Earlier tests leave a saved choice behind (afterEach switches back to
    // English, which saves it). A first visit has nothing saved.
    localStorage.clear();
    // A fresh copy of the module runs its start-up code again, this time
    // with the browser above and nothing saved.
    vi.resetModules();
    const fresh = (await import("./index.ts")).default;

    expect(fresh.language).toBe("pt-BR");
    expect(document.documentElement.lang).toBe("pt-BR");
  });

  it("has the same keys in English and pt-BR", () => {
    expect(keysOf(ptBR)).toEqual(keysOf(en));
  });
});
