import type { ComponentProps } from "react";
import styles from "./Card.module.css";

export interface CardProps extends Omit<
  ComponentProps<"div">,
  "className" | "style"
> {
  as?: "div" | "section" | "aside";
  /** `md` is 16 px; `lg` is 18 px by 20 px, 16 px on phones. Left out, the content touches the border. */
  padding?: "md" | "lg";
}

/** The bordered surface that holds a section of a page. */
export function Card({
  as: Element = "div",
  padding,
  children,
  ...rest
}: CardProps) {
  const className = [styles.card, padding && styles[padding]]
    .filter(Boolean)
    .join(" ");

  return (
    <Element {...rest} className={className}>
      {children}
    </Element>
  );
}
