export type Language = "en" | "pt-BR";

export const languages: readonly Language[] = ["en", "pt-BR"];

export function isLanguage(value: unknown): value is Language {
  return languages.includes(value as Language);
}

export function detectLanguage(
  saved: string | null,
  browserLanguages: readonly string[],
): Language {
  if (isLanguage(saved)) {
    return saved;
  }
  return browserLanguages[0]?.startsWith("pt") ? "pt-BR" : "en";
}
