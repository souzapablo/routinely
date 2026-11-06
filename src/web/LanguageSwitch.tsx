import { useTranslation } from "react-i18next";
import type { Language } from "./i18n/detectLanguage.ts";

// Each language is named in itself, so it reads the same in both languages
// and isn't a translated string.
const options: readonly { language: Language; label: string }[] = [
  { language: "en", label: "English" },
  { language: "pt-BR", label: "Português" },
];

export function LanguageSwitch() {
  const { i18n } = useTranslation();

  return (
    <nav className="language-switch">
      {options.map(({ language, label }) => (
        <button
          key={language}
          type="button"
          lang={language}
          aria-pressed={i18n.language === language}
          onClick={() => void i18n.changeLanguage(language)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
