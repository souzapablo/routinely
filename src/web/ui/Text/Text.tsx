import type { ReactNode } from "react";
import styles from "./Text.module.css";

export interface TextProps {
  as?: "p" | "span" | "div";
  tone?: "default" | "muted" | "faint";
  size?: "md" | "sm" | "xs";
  mono?: boolean;
  weight?: "regular" | "medium" | "semibold";
  /** One line, cut with an ellipsis when it does not fit. */
  truncate?: boolean;
  strike?: boolean;
  children: ReactNode;
}

/** Body text. A prop left out inherits from the parent, so text inside a colored block keeps its color. */
export function Text({
  as: Element = "p",
  tone = "default",
  size,
  mono = false,
  weight,
  truncate = false,
  strike = false,
  children,
}: TextProps) {
  const className = [
    styles.text,
    tone !== "default" && styles[tone],
    size && styles[size],
    mono && styles.mono,
    weight && styles[weight],
    truncate && styles.truncate,
    strike && styles.strike,
  ]
    .filter(Boolean)
    .join(" ");

  return <Element className={className}>{children}</Element>;
}
