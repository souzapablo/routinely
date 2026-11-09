import { useId, type Ref } from "react";
import styles from "./TextField.module.css";

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  ref?: Ref<HTMLInputElement>;
}

/** A labelled one-line text input. */
export function TextField({
  label,
  value,
  onChange,
  maxLength,
  ref,
}: TextFieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={id}>
        {label}
      </label>
      <input
        ref={ref}
        id={id}
        className={styles.input}
        type="text"
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
