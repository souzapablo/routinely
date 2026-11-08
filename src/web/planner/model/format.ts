import type { Minutes } from "../../../shared/planner.ts";

// Times of day are minutes since midnight; Intl needs a Date, and any fixed
// day without a DST change gives the same clock reading.
function atMinutes(minutes: Minutes): Date {
  return new Date(2000, 0, 3, Math.floor(minutes / 60), minutes % 60);
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function uses24Hours(lang: string): boolean {
  const { hourCycle } = new Intl.DateTimeFormat(lang, {
    hour: "numeric",
  }).resolvedOptions();
  return hourCycle === "h23" || hourCycle === "h24";
}

export function formatTimeRange(
  start: Minutes,
  end: Minutes,
  lang: string,
): string {
  return new Intl.DateTimeFormat(lang, {
    hour: "numeric",
    minute: "2-digit",
  }).formatRange(atMinutes(start), atMinutes(end));
}

export function formatHourLabel(minutes: Minutes, lang: string): string {
  // A bare 24-hour "06" reads as a number, so 24-hour languages get "06:00"
  // while 12-hour ones keep the short "6 AM".
  const options: Intl.DateTimeFormatOptions = uses24Hours(lang)
    ? { hour: "2-digit", minute: "2-digit" }
    : { hour: "numeric" };
  return new Intl.DateTimeFormat(lang, options).format(atMinutes(minutes));
}

export function formatWeekRange(monday: Date, lang: string): string {
  const sunday = addDays(monday, 6);
  const sameYear = monday.getFullYear() === sunday.getFullYear();
  // formatRange would shorten "Nov 2 – Nov 8" to "Nov 2 – 8"; the header
  // names both months. The thin spaces match Intl's own range separator.
  const from = new Intl.DateTimeFormat(lang, {
    month: "short",
    day: "numeric",
    year: sameYear ? undefined : "numeric",
  }).format(monday);
  const to = new Intl.DateTimeFormat(lang, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(sunday);
  return `${from}\u2009–\u2009${to}`;
}

export function formatTodayDate(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang, {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatDayNumber(date: Date, lang: string): string {
  return new Intl.DateTimeFormat(lang, { day: "numeric" }).format(date);
}

export function formatWeekday(
  date: Date,
  lang: string,
  width: "short" | "narrow",
): string {
  return new Intl.DateTimeFormat(lang, { weekday: width }).format(date);
}

export type DurationParts =
  | { key: "duration.minutes"; values: { minutes: number } }
  | { key: "duration.hours"; values: { hours: number } }
  | {
      key: "duration.hoursMinutes";
      values: { hours: number; minutes: number };
    };

/** An i18n key and its values, for `t(parts.key, parts.values)`. */
export function durationParts(total: Minutes): DurationParts {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return { key: "duration.minutes", values: { minutes } };
  if (minutes === 0) return { key: "duration.hours", values: { hours } };
  return { key: "duration.hoursMinutes", values: { hours, minutes } };
}
