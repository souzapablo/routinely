import type { DayIndex, WeekKey } from "../../../shared/planner.ts";

// All rules work in local time: the week is the owner's calendar week.

export function dayIndex(date: Date): DayIndex {
  return date.getDay() as DayIndex;
}

function addDays(date: Date, days: number): Date {
  // Calendar arithmetic, not 24 h steps, so a DST change keeps midnight.
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function startOfDay(date: Date): Date {
  return addDays(date, 0);
}

/** The Sunday on or before `date`, at midnight: the week starts on Sunday. */
export function weekStartOf(date: Date): Date {
  return addDays(date, -date.getDay());
}

export function weekKey(date: Date): WeekKey {
  const start = weekStartOf(date);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${start.getFullYear()}-${pad(start.getMonth() + 1)}-${pad(start.getDate())}`;
}

export function minutesOfDay(date: Date): number {
  return date.getHours() * 60 + date.getMinutes();
}

export interface WeekDay {
  index: DayIndex;
  date: Date;
  isToday: boolean;
}

export function weekDays(weekStart: Date, today: Date): WeekDay[] {
  const todayStart = startOfDay(today).getTime();
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i);
    return {
      index: dayIndex(date),
      date,
      isToday: date.getTime() === todayStart,
    };
  });
}
