import { useTranslation } from "react-i18next";
import { useHealth } from "./health/useHealth.ts";
import { Card } from "./ui/Card/Card.tsx";
import { Heading } from "./ui/Heading/Heading.tsx";
import { Stack } from "./ui/Stack/Stack.tsx";
import { Text } from "./ui/Text/Text.tsx";

export function StatusPage() {
  const { t, i18n } = useTranslation();
  const health = useHealth();

  return (
    <main>
      <Card padding="lg">
        <Stack gap={5}>
          <Heading level={1} size="page">
            {t("status.heading")}
          </Heading>
          {health.state === "checking" ? (
            <Text>{t("status.checking")}</Text>
          ) : (
            <>
              <Stack gap={1}>
                <Text tone={lineTone(health.view.server)}>
                  {t(`status.server.${health.view.server}`)}
                </Text>
                <Text tone={lineTone(health.view.db)}>
                  {t(`status.db.${health.view.db}`)}
                </Text>
              </Stack>
              <Text tone="muted" size="sm">
                {t("status.checkedAt", {
                  time: formatTime(health.checkedAt, i18n.language),
                })}
              </Text>
            </>
          )}
        </Stack>
      </Card>
    </main>
  );
}

// Red (--bad) is kept for real failures only.
function lineTone(state: "connected" | "unreachable"): "default" | "error" {
  return state === "unreachable" ? "error" : "default";
}

function formatTime(date: Date, language: string): string {
  return new Intl.DateTimeFormat(language, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
