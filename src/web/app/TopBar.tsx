import { useTranslation } from "react-i18next";
import { LanguageSwitch } from "../LanguageSwitch.tsx";
import { BrandMark } from "../ui/BrandMark/BrandMark.tsx";
import { Button } from "../ui/Button/Button.tsx";
import { StatusIndicator } from "../ui/StatusIndicator/StatusIndicator.tsx";
import styles from "./TopBar.module.css";

export function TopBar() {
  const { t } = useTranslation();

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <BrandMark />
        {t("topBar.brand")}
      </div>
      <div className={styles.status}>
        <StatusIndicator tone="neutral">
          {t("topBar.exampleWeek")}
        </StatusIndicator>
      </div>
      <Button variant="primary" icon="plus" collapseLabel inert>
        {t("topBar.addActivity")}
      </Button>
      <div className={styles.language}>
        <LanguageSwitch />
      </div>
    </header>
  );
}
