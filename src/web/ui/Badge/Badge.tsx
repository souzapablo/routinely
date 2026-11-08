import type { ComponentProps } from "react";
import styles from "./Badge.module.css";

export interface BadgeProps extends Omit<
  ComponentProps<"span">,
  "className" | "style"
> {
  /** `count` is a quiet mono number, such as "4 left"; `now` marks what is happening now. */
  tone: "count" | "now";
}

/** A small rounded pill of text. */
export function Badge({ tone, children, ...rest }: BadgeProps) {
  return (
    <span {...rest} className={`${styles.badge} ${styles[tone]}`}>
      {children}
    </span>
  );
}
