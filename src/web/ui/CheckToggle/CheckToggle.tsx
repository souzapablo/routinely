import type { ComponentProps } from "react";
import { Icon } from "../Icon/Icon.tsx";
import styles from "./CheckToggle.module.css";

export interface CheckToggleProps extends Omit<
  ComponentProps<"button">,
  | "className"
  | "style"
  | "children"
  | "aria-pressed"
  | "aria-label"
  | "disabled"
  | "inert"
> {
  pressed: boolean;
  /** The accessible name, such as "Mark Work done". */
  label: string;
  /**
   * Drawn as usual but does nothing and is skipped by Tab, for a control
   * whose feature is not built yet.
   */
  inert?: boolean;
}

/**
 * Round check drawn in `currentColor`, so it takes the color of the block
 * around it. When pressed, the tick is drawn in `--check-tick`, which the
 * block sets to its own background so the tick reads as cut out of the fill.
 */
export function CheckToggle({
  pressed,
  label,
  inert = false,
  type = "button",
  ...rest
}: CheckToggleProps) {
  return (
    <button
      {...rest}
      type={type}
      className={styles.toggle}
      disabled={inert}
      aria-pressed={pressed}
      aria-label={label}
    >
      <Icon name="check" size={12} />
    </button>
  );
}
