import type { ReactNode } from "react";
import styles from "./FieldGroup.module.css";

export interface FieldGroupProps {
  legend: string;
  children: ReactNode;
}

/** A set of related controls named by one legend, such as day toggles. */
export function FieldGroup({ legend, children }: FieldGroupProps) {
  return (
    <fieldset className={styles.group}>
      <legend className={styles.legend}>{legend}</legend>
      <div className={styles.controls}>{children}</div>
    </fieldset>
  );
}
