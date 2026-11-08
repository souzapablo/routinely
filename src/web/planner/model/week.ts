import type { DayIndex, WeekKey } from "../../../shared/planner.ts";

// All rules work in local time: the week is the owner's calendar week.

export function dayIndex(date: Date): DayIndex {
  // getDay() has Sunday as 0; the planner's week starts on Monday.
  return ((date.getDay() + 6) % 7) as DayIndex;
}

function addDays(date: Date, days: number): Date {
  // Calendar arithmetic, not 24 h steps, so a DST change keeps midnight.
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfDay(date: Date): Date {
  return addDays(date, 0);
}

export function mondayOf(date: Date): Date {
  return addDays(date, -dayIndex(date));
}

export function weekKey(date: Date): WeekKey {
  const monday = mondayOf(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${monday.getFullYear()}-${pad(monday.getMonth() + 1)}-${pad(monday.getDate())}`;
}

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export interface WeekDay {
  index: DayIndex;
  date: Date;
  isToday: boolean;
}

export function weekDays(monday: Date, today: Date): WeekDay[] {
  const todayStart = startOfDay(today).getTime();
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i);
    return {
      index: i as DayIndex,
      date,
      isToday: date.getTime() === todayStart,
    };
  });
}
