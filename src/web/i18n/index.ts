import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { detectLanguage } from "./detectLanguage.ts";
import en from "./en.json";
import ptBR from "./pt-BR.json";

const storageKey = "routinely.lang";

// Teaches TypeScript the shape of our strings, so t("status.checkng")
// is a type error instead of a missing text on screen.
declare module "i18next" {
  interface CustomTypeOptions {
    resources: { translation: typeof en };
  }
}

// localStorage can throw (private windows, blocked site data). Losing the
// remembered language is fine; breaking the page is not.
function readSavedLanguage(): string | null {
  try {
    return localStorage.getItem(storageKey);
  } catch {
    return null;
  }
}

function saveLanguage(language: string): void {
  try {
    localStorage.setItem(storageKey, language);
  } catch {
    // Not remembered after a reload; still active for this visit.
  }
}

const initialLanguage = detectLanguage(
  readSavedLanguage(),
  navigator.languages,
);

// initAsync: false finishes init before this module returns, so the first
// render already has its strings and the listener below only sees changes
// the owner makes (the detected language is never saved as a choice).
await i18n.use(initReactI18next).init({
  lng: initialLanguage,
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    "pt-BR": { translation: ptBR },
  },
  interpolation: { escapeValue: false }, // React already escapes text
  initAsync: false,
});
document.documentElement.lang = initialLanguage;

i18n.on("languageChanged", (language) => {
  saveLanguage(language);
  document.documentElement.lang = language;
});

export default i18n;
