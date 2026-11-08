import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Badge } from "../../ui/Badge/Badge.tsx";
import { Card } from "../../ui/Card/Card.tsx";
import { CheckboxRow } from "../../ui/CheckboxRow/CheckboxRow.tsx";
import { Heading } from "../../ui/Heading/Heading.tsx";
import { Meter } from "../../ui/Meter/Meter.tsx";
import { Swatch, type SwatchTone } from "../../ui/Swatch/Swatch.tsx";
import { Text } from "../../ui/Text/Text.tsx";
import type { Progress } from "../model/progress.ts";
import styles from "./TodayStrip.module.css";

export interface TodayRow {
  key: string;
  name: string;
  timeLabel: string;
  tone: SwatchTone;
  done: boolean;
  isNow: boolean;
}

export interface ShowedUpDay {
  /** One letter, such as "M". */
  label: string;
  on: boolean;
  isToday: boolean;
}

export interface TodayStripProps {
  /** Today's weekday, month and day, already formatted. */
  dateLabel: string;
  rows: TodayRow[];
  summary: Progress;
  showedUp: { days: ShowedUpDay[]; count: number };
  week: Progress;
}

export function TodayStrip({
  dateLabel,
  rows,
  summary,
  showedUp,
  week,
}: TodayStripProps) {
  const { t } = useTranslation();
  const headingId = useId();

  return (
    <Card as="section" padding="lg" aria-labelledby={headingId}>
      <div className={styles.strip}>
        <div className={styles.top}>
          <div>
            <Heading level={2} size="section" id={headingId}>
              {t("today.title", { date: dateLabel })}
            </Heading>
            <Text size="sm" tone="muted">
              {summary.total === 0
                ? t("today.freeDay")
                : t("today.summary", {
                    done: summary.done,
                    total: summary.total,
                  })}
            </Text>
          </div>
          <div className={styles.metrics}>
            <div className={styles.metric}>
              <div className={styles.label}>
                <Text as="span" size="xs">
                  {t("today.showedUp")}
                </Text>
                <Text as="span" size="xs" mono>
                  {t("today.showedUpCount", { days: showedUp.count })}
                </Text>
              </div>
              <div
                role="img"
                aria-label={t("today.showedUpLabel", { days: showedUp.count })}
                className={styles.dots}
              >
                {showedUp.days.map((day, i) => (
                  <div
                    key={i}
                    className={[
                      styles.dot,
                      day.on && styles.on,
                      day.isToday && styles.today,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  >
                    {day.label}
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.metric}>
              <div className={styles.label}>
                <Text as="span" size="xs">
                  {t("today.week")}
                </Text>
                <Text as="span" size="xs" mono>
                  {t("today.weekDone", { done: week.done, total: week.total })}
                </Text>
              </div>
              <Meter
                value={week.done}
                max={week.total}
                label={t("today.week")}
              />
            </div>
          </div>
        </div>
        {rows.length === 0 ? (
          <Text size="sm" tone="muted">
            {t("today.empty")}
          </Text>
        ) : (
          <div className={styles.rows}>
            {rows.map((row) => (
              <CheckboxRow
                key={row.key}
                title={row.name}
                meta={row.timeLabel}
                checked={row.done}
                inert
                trailing={
                  row.isNow ? (
                    <Badge tone="now">{t("today.now")}</Badge>
                  ) : (
                    <Swatch tone={row.tone} />
                  )
                }
              />
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
