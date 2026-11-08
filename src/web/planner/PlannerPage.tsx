import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { GridDay } from "./components/WeekGrid.tsx";
import { TodayStrip } from "./components/TodayStrip.tsx";
import { Tray } from "./components/Tray.tsx";
import { WeekGrid } from "./components/WeekGrid.tsx";
import { WeekHeader } from "./components/WeekHeader.tsx";
import { exampleWeek } from "./model/exampleWeek.ts";
import {
  durationParts,
  formatDayNumber,
  formatHourLabel,
  formatTimeRange,
  formatTodayDate,
  formatWeekday,
  formatWeekRange,
} from "./model/format.ts";
import {
  blockGeometry,
  fitHourHeight,
  GRID_END,
  GRID_START,
  isNow,
  isTinyBlock,
  nowOffset,
} from "./model/grid.ts";
import { daysShowedUp, todaySummary, weekProgress } from "./model/progress.ts";
import { itemsForDay } from "./model/schedule.ts";
import { trayItems, trayLeft } from "./model/tray.ts";
import {
  dayIndex,
  minutesOfDay,
  mondayOf,
  weekDays,
  weekKey,
} from "./model/week.ts";
import { useElementHeight } from "./useElementHeight.ts";
import { useMediaQuery } from "./useMediaQuery.ts";
import { useNow } from "./useNow.ts";
import styles from "./PlannerPage.module.css";

// Matches the breakpoint in PlannerPage.module.css.
const FITS_WINDOW = "(min-width: 981px)";

export function PlannerPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const now = useNow();
  // The example is dated to the week the page opened in; the clock still
  // moves the now-line and the Now pill every minute.
  const [data] = useState(() => exampleWeek(now));
  // On wide screens the page fills the window and the hours stretch or shrink
  // to the height left under the day names; narrow screens scroll the page.
  const fitsWindow = useMediaQuery(FITS_WINDOW);
  const gridBody = useRef<HTMLDivElement>(null);
  const pxPerHour = fitHourHeight(useElementHeight(gridBody, fitsWindow));

  const week = weekKey(now);
  const minutes = minutesOfDay(now);
  const days = weekDays(mondayOf(now), now);
  const time = (start: number, end: number) =>
    formatTimeRange(start, end, lang);

  const gridDays: GridDay[] = days.map((day) => ({
    key: week + day.index,
    weekday: formatWeekday(day.date, lang, "short"),
    dayNumber: formatDayNumber(day.date, lang),
    isToday: day.isToday,
    blocks: itemsForDay(data, week, day.index).flatMap((item) => {
      const geometry = blockGeometry(item.start, item.end, pxPerHour);
      if (!geometry) return [];
      return [
        {
          key: item.key,
          kind: item.kind,
          name: item.name,
          timeLabel: time(item.start, item.end),
          category: item.category,
          done: item.done,
          ...geometry,
          tiny: isTinyBlock(geometry.height),
        },
      ];
    }),
  }));

  const hourLabels: string[] = [];
  for (let m = GRID_START; m < GRID_END; m += 60) {
    hourLabels.push(formatHourLabel(m, lang));
  }

  const todayItems = itemsForDay(data, week, dayIndex(now));
  const showedUp = daysShowedUp(data, week);
  const tray = trayItems(data, week);

  return (
    <main className={styles.page}>
      <WeekHeader rangeLabel={formatWeekRange(mondayOf(now), lang)} />
      <div className={styles.today}>
        <TodayStrip
          dateLabel={formatTodayDate(now, lang)}
          rows={todayItems.map((item) => ({
            key: item.key,
            name: item.name,
            timeLabel: time(item.start, item.end),
            tone: item.category,
            done: item.done,
            isNow: isNow(item, minutes),
          }))}
          summary={todaySummary(todayItems)}
          showedUp={{
            count: showedUp.count,
            days: days.map((day) => ({
              label: formatWeekday(day.date, lang, "narrow"),
              on: showedUp.days[day.index] ?? false,
              isToday: day.isToday,
            })),
          }}
          week={weekProgress(data, week)}
        />
      </div>
      <div className={styles.planner}>
        <div className={styles.grid}>
          <WeekGrid
            days={gridDays}
            hourLabels={hourLabels}
            nowOffset={nowOffset(minutes, pxPerHour)}
            pxPerHour={pxPerHour}
            bodyRef={gridBody}
          />
        </div>
        <div className={styles.tray}>
          <Tray
            rows={tray.map((item) => {
              const parts = durationParts(item.activity.duration);
              return {
                key: item.activity.id,
                name: item.activity.name,
                category: item.activity.category,
                timesPerWeek: item.activity.timesPerWeek,
                placed: item.placed,
                durationLabel: t(parts.key, parts.values),
                pips: item.pips,
                state: item.state,
              };
            })}
            left={trayLeft(tray)}
          />
        </div>
      </div>
    </main>
  );
}
