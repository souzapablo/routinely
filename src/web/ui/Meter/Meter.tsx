import styles from "./Meter.module.css";

export interface MeterProps {
  value: number;
  max: number;
  /** Accessible name; the bar has no visible text of its own. */
  label: string;
}

/** Share of `value` in `max` as a percentage from 0 to 100; 0 when `max` is 0. */
export function meterPercent(value: number, max: number): number {
  if (max <= 0) return 0;
  return Math.min(100, Math.max(0, (value / max) * 100));
}

/** A thin bar filled to `value / max`. */
export function Meter({ value, max, label }: MeterProps) {
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={styles.meter}
    >
      <div
        className={styles.fill}
        style={{ width: `${meterPercent(value, max)}%` }}
      />
    </div>
  );
}
