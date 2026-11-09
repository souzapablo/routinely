import type { CSSProperties, Ref } from "react";
import { Card } from "../../ui/Card/Card.tsx";
import { GridBlock, type GridBlockModel } from "./GridBlock.tsx";
import styles from "./WeekGrid.module.css";

export interface GridDay {
  key: string;
  /** Short weekday, such as "Mon". */
  weekday: string;
  dayNumber: string;
  isToday: boolean;
  blocks: GridBlockModel[];
}

export interface WeekGridProps {
  /** Seven days, Sunday first. */
  days: GridDay[];
  /** One label per hour row, from the top of the grid. */
  hourLabels: string[];
  /** Pixels down today's column; null draws no now-line. */
  nowOffset: number | null;
  /** Height of one hour row; the blocks and the now-line use the same scale. */
  pxPerHour: number;
  /** The area under the day names, where the hour rows go. */
  bodyRef?: Ref<HTMLDivElement>;
  /** Opens an anchor block's anchor for editing. */
  onOpenAnchor?: (anchorId: string) => void;
}

export function WeekGrid({
  days,
  hourLabels,
  nowOffset,
  pxPerHour,
  bodyRef,
  onOpenAnchor,
}: WeekGridProps) {
  return (
    <Card>
      <div className={styles.scroll}>
        <div
          className={styles.grid}
          style={{ "--px": `${pxPerHour}px` } as CSSProperties}
        >
          <div className={styles.head}>
            <div className={styles.corner} />
            {days.map((day) => (
              <div
                key={day.key}
                className={[styles.day, day.isToday && styles.today]
                  .filter(Boolean)
                  .join(" ")}
              >
                <div className={styles.weekday}>{day.weekday}</div>
                <div className={styles.dayNumber}>{day.dayNumber}</div>
              </div>
            ))}
          </div>
          <div ref={bodyRef} className={styles.body}>
            <div className={styles.hours}>
              {hourLabels.map((label) => (
                <div key={label} className={styles.hour}>
                  <div className={styles.hourLabel}>{label}</div>
                </div>
              ))}
            </div>
            {days.map((day) => (
              <div
                key={day.key}
                className={[styles.column, day.isToday && styles.today]
                  .filter(Boolean)
                  .join(" ")}
              >
                {day.blocks.map((block) => (
                  <GridBlock
                    key={block.key}
                    block={block}
                    onOpen={onOpenAnchor}
                  />
                ))}
                {day.isToday && nowOffset !== null && (
                  <div className={styles.now} style={{ top: nowOffset }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
