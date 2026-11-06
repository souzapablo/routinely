import { describe, expect, it } from "vitest";
import { detectLanguage } from "./detectLanguage.ts";

describe("detectLanguage", () => {
  it("picks pt-BR when the browser language starts with pt", () => {
    expect(detectLanguage(null, ["pt-BR", "en-US"])).toBe("pt-BR");
    expect(detectLanguage(null, ["pt-PT"])).toBe("pt-BR");
  });

  it("picks English when the browser language is not Portuguese", () => {
    expect(detectLanguage(null, ["en-US", "pt-BR"])).toBe("en");
    expect(detectLanguage(null, ["es"])).toBe("en");
    expect(detectLanguage(null, [])).toBe("en");
  });

  it("uses a saved language over the browser language", () => {
    expect(detectLanguage("en", ["pt-BR"])).toBe("en");
    expect(detectLanguage("pt-BR", ["en-US"])).toBe("pt-BR");
  });

  it("ignores a saved value other than en or pt-BR", () => {
    expect(detectLanguage("fr", ["pt-BR"])).toBe("pt-BR");
    expect(detectLanguage("fr", ["en-US"])).toBe("en");
  });
});
