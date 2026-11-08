import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { Category } from "../../../shared/planner.ts";
import { Badge } from "../../ui/Badge/Badge.tsx";
import { Button } from "../../ui/Button/Button.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { Heading } from "../../ui/Heading/Heading.tsx";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { Swatch } from "../../ui/Swatch/Swatch.tsx";
import { Text } from "../../ui/Text/Text.tsx";
import type { Pip, TrayState } from "../model/tray.ts";
import styles from "./Tray.module.css";

export interface TrayRow {
  key: string;
  name: string;
  category: Category;
  timesPerWeek: number;
  /** Placements this week, done ones included. */
  placed: number;
  durationLabel: string;
  pips: Pip[];
  state: TrayState;
}

export interface TrayProps {
  rows: TrayRow[];
  /** Times still to place this week. */
  left: number;
}

const pipClass: Record<Pip, string | undefined> = {
  done: styles.done,
  placed: styles.placed,
  open: undefined,
};

export function Tray({ rows, left }: TrayProps) {
  const { t } = useTranslation();
  const headingId = useId();

  function meta(row: TrayRow): string {
    if (row.state === "allDone") return t("tray.allDone");
    if (row.state === "allPlaced") return t("tray.allPlaced");
    const values = { times: row.timesPerWeek, duration: row.durationLabel };
    return row.placed > 0
      ? t("tray.metaPlaced", { ...values, placed: row.placed })
      : t("tray.meta", values);
  }

  return (
    <Card as="aside" padding="md" aria-labelledby={headingId}>
      <div className={styles.tray}>
        <div className={styles.header}>
          <Heading level={2} size="card" id={headingId}>
            {t("tray.title")}
          </Heading>
          <Badge tone="count">{t("tray.left", { n: left })}</Badge>
        </div>
        <div className={styles.hint}>
          <Text size="sm" tone="muted">
            {t("tray.hint")}
          </Text>
        </div>
        <div className={styles.items}>
          {rows.length === 0 ? (
            <Text size="sm" tone="muted">
              {t("tray.empty")}
            </Text>
          ) : (
            rows.map((row) => {
              const open = row.state === "open";
              return (
                <div
                  key={row.key}
                  className={[styles.item, !open && styles.full]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <div className={styles.grip}>
                    {open ? (
                      <Icon name="grip" />
                    ) : (
                      <Swatch tone={row.category} shape="square" />
                    )}
                  </div>
                  <Text
                    as="div"
                    weight="medium"
                    truncate
                    tone={open ? "default" : "muted"}
                  >
                    {row.name}
                  </Text>
                  {open && (
                    <div className={styles.find}>
                      <Button variant="accent" size="sm" inert>
                        {t("tray.findTime")}
                      </Button>
                    </div>
                  )}
                  <div className={styles.meta}>
                    <Text size="xs" tone="muted">
                      {meta(row)}
                    </Text>
                  </div>
                  <div className={styles.pips} aria-hidden="true">
                    {row.pips.map((pip, i) => (
                      <div
                        key={i}
                        className={[styles.pip, pipClass[pip]]
                          .filter(Boolean)
                          .join(" ")}
                      />
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <Button variant="dashed" inert>
          {t("tray.newFlexible")}
        </Button>
      </div>
    </Card>
  );
}
