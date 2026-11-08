import { useTranslation } from "react-i18next";
import type { Language } from "./i18n/detectLanguage.ts";
import { Button } from "./ui/Button/Button.tsx";
import { Stack } from "./ui/Stack/Stack.tsx";

// Each language is named in itself, so it reads the same in both languages
// and isn't a translated string.
const options: readonly { language: Language; label: string }[] = [
  { language: "en", label: "English" },
  { language: "pt-BR", label: "Português" },
];

export function LanguageSwitch() {
  const { i18n } = useTranslation();

  return (
    <Stack as="nav" direction="row" gap={3} justify="end">
      {options.map(({ language, label }) => (
        <Button
          key={language}
          size="sm"
          lang={language}
          pressed={i18n.language === language}
          onClick={() => void i18n.changeLanguage(language)}
        >
          {label}
        </Button>
      ))}
    </Stack>
  );
}
