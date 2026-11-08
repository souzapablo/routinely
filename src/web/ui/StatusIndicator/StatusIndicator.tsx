import type { ReactNode } from "react";
import styles from "./StatusIndicator.module.css";

export type StatusTone = "neutral" | "ok" | "busy" | "error";

export interface StatusIndicatorProps {
  /** Dot color: `neutral` faint grey, `ok` green, `busy` accent, `error` red (real errors only). */
  tone: StatusTone;
  children: ReactNode;
}

/** A colored dot and a short muted text, announced politely when it changes. */
export function StatusIndicator({ tone, children }: StatusIndicatorProps) {
  return (
    <span role="status" className={`${styles.status} ${styles[tone]}`}>
      <span aria-hidden="true" className={styles.dot} />
      {children}
    </span>
  );
}
