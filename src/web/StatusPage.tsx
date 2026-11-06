import { useTranslation } from "react-i18next";
import { useHealth } from "./health/useHealth.ts";

export function StatusPage() {
  const { t, i18n } = useTranslation();
  const health = useHealth();

  return (
    <main className="status">
      <h1>{t("status.heading")}</h1>
      {health.state === "checking" ? (
        <p>{t("status.checking")}</p>
      ) : (
        <>
          <p className={lineClass(health.view.server)}>
            {t(`status.server.${health.view.server}`)}
          </p>
          <p className={lineClass(health.view.db)}>
            {t(`status.db.${health.view.db}`)}
          </p>
          <p className="muted">
            {t("status.checkedAt", {
              time: formatTime(health.checkedAt, i18n.language),
            })}
          </p>
        </>
      )}
    </main>
  );
}

// Red (--bad) is kept for real failures only.
function lineClass(state: "connected" | "unreachable"): string | undefined {
  return state === "unreachable" ? "bad" : undefined;
}

function formatTime(date: Date, language: string): string {
  return new Intl.DateTimeFormat(language, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
