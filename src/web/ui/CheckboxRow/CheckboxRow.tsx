import type { ReactNode } from "react";
import { Text } from "../Text/Text.tsx";
import styles from "./CheckboxRow.module.css";

export interface CheckboxRowProps {
  title: string;
  meta: string;
  checked: boolean;
  onChange?: (checked: boolean) => void;
  /** Shown at the end of the row, such as a category dot or a pill. */
  trailing?: ReactNode;
  disabled?: boolean;
  /**
   * Drawn as usual but does nothing and is skipped by Tab, for a control
   * whose feature is not built yet. Unlike `disabled`, it is not faded.
   */
  inert?: boolean;
}

export function CheckboxRow({
  title,
  meta,
  checked,
  onChange,
  trailing,
  disabled = false,
  inert = false,
}: CheckboxRowProps) {
  const className = [
    styles.row,
    checked && styles.done,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className={className}>
      <input
        type="checkbox"
        className={styles.box}
        checked={checked}
        readOnly={!onChange}
        onChange={onChange && ((event) => onChange(event.target.checked))}
        disabled={disabled || inert}
        // The label also wraps the meta line and trailing slot; the name is the title alone.
        aria-label={title}
      />
      <span className={styles.text}>
        <Text
          as="span"
          weight="medium"
          truncate
          strike={checked}
          tone={checked ? "muted" : "default"}
        >
          {title}
        </Text>
        <Text as="span" size="xs" mono tone="muted">
          {meta}
        </Text>
      </span>
      {trailing}
    </label>
  );
}
