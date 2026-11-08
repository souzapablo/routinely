import type { ComponentProps } from "react";
import styles from "./Stack.module.css";

type Align = "start" | "center" | "end" | "stretch" | "baseline";
type Justify = "start" | "center" | "end" | "between";

const alignClass: Record<Align, string | undefined> = {
  start: styles.alignStart,
  center: styles.alignCenter,
  end: styles.alignEnd,
  stretch: styles.alignStretch,
  baseline: styles.alignBaseline,
};

const justifyClass: Record<Justify, string | undefined> = {
  start: styles.justifyStart,
  center: styles.justifyCenter,
  end: styles.justifyEnd,
  between: styles.justifyBetween,
};

export interface StackProps extends Omit<
  ComponentProps<"div">,
  "className" | "style"
> {
  as?: "div" | "section" | "header" | "aside" | "nav";
  direction?: "column" | "row";
  /** A step of the spacing scale: 0, 4, 6, 8, 10, 12, 16, 20 px. */
  gap?: 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  align?: Align;
  justify?: Justify;
  wrap?: boolean;
}

/** Flex layout. A prop left out adds nothing, so the browser's flex defaults apply. */
export function Stack({
  as: Element = "div",
  direction = "column",
  gap,
  align,
  justify,
  wrap = false,
  children,
  ...rest
}: StackProps) {
  const className = [
    styles.stack,
    direction === "row" && styles.row,
    gap !== undefined && styles[`gap${gap}`],
    align && alignClass[align],
    justify && justifyClass[justify],
    wrap && styles.wrap,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Element {...rest} className={className}>
      {children}
    </Element>
  );
}
