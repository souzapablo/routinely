import type { ReactNode } from "react";
import styles from "./VisuallyHidden.module.css";

/** Text that screen readers announce but the screen does not show. */
export function VisuallyHidden({ children }: { children: ReactNode }) {
  return <span className={styles.hidden}>{children}</span>;
}
