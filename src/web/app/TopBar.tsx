import type { Ref } from "react";
import { useTranslation } from "react-i18next";
import { useWeek } from "../week/WeekProvider.tsx";
import { statusView } from "../week/model/saveStatus.ts";
import { LanguageSwitch } from "../LanguageSwitch.tsx";
import { BrandMark } from "../ui/BrandMark/BrandMark.tsx";
import { Button } from "../ui/Button/Button.tsx";
import { StatusIndicator } from "../ui/StatusIndicator/StatusIndicator.tsx";
import styles from "./TopBar.module.css";

export interface TopBarProps {
  addButtonRef?: Ref<HTMLButtonElement>;
}

export function TopBar({ addButtonRef }: TopBarProps) {
  const { t } = useTranslation();
  const { status, openAdd } = useWeek();
  const view = statusView(status);

  return (
    <header className={styles.bar}>
      <div className={styles.brand}>
        <BrandMark />
        {t("topBar.brand")}
      </div>
      <div className={styles.status}>
        <StatusIndicator tone={view.tone}>{t(view.key)}</StatusIndicator>
      </div>
      <Button
        ref={addButtonRef}
        variant="primary"
        icon="plus"
        collapseLabel
        onClick={() => openAdd("anchor")}
      >
        {t("topBar.addActivity")}
      </Button>
      <div className={styles.language}>
        <LanguageSwitch />
      </div>
    </header>
  );
}
