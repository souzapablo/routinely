import { useId } from "react";
import styles from "../TextField/TextField.module.css";

export interface TimeFieldProps {
  label: string;
  /** `"HH:MM"`, or `""` while the field is empty. */
  value: string;
  onChange: (value: string) => void;
}

/** A labelled time input in 15-minute steps. */
export function TimeField({ label, value, onChange }: TimeFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className={styles.input}
        type="time"
        step={900}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
