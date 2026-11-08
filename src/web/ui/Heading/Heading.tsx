import type { ComponentProps } from "react";
import styles from "./Heading.module.css";

export interface HeadingProps extends Omit<ComponentProps<"h1">, "className"> {
  /** The document outline level; it does not change the look. */
  level: 1 | 2 | 3;
  size?: "page" | "section" | "card";
}

/** Display-font heading. Without a size it inherits the font size and weight of its parent. */
export function Heading({ level, size, children, ...rest }: HeadingProps) {
  const Element = `h${level}` as const;
  const className = [styles.heading, size && styles[size]]
    .filter(Boolean)
    .join(" ");

  return (
    <Element {...rest} className={className}>
      {children}
    </Element>
  );
}
