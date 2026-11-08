import { useTranslation } from "react-i18next";
import { Button } from "../../ui/Button/Button.tsx";
import { Heading } from "../../ui/Heading/Heading.tsx";
import { Stack } from "../../ui/Stack/Stack.tsx";
import { Text } from "../../ui/Text/Text.tsx";
import styles from "./WeekHeader.module.css";

export interface WeekHeaderProps {
  /** The week's Sunday to Saturday, already formatted. */
  rangeLabel: string;
}

export function WeekHeader({ rangeLabel }: WeekHeaderProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.header}>
      <div>
        <Heading level={1} size="page">
          {t("weekHeader.title")}
        </Heading>
        <Text as="div" size="sm" tone="muted">
          {rangeLabel}
        </Text>
      </div>
      <Stack as="nav" direction="row" gap={3} align="center">
        <Button icon="chevronLeft" iconOnly inert>
          {t("weekHeader.previous")}
        </Button>
        {/* Faded, unlike the arrows: the prototype greys Today out on the current week. */}
        <Button disabled>{t("weekHeader.today")}</Button>
        <Button icon="chevronRight" iconOnly inert>
          {t("weekHeader.next")}
        </Button>
      </Stack>
    </div>
  );
}
