import styles from "./Swatch.module.css";

/** The color tokens each category is drawn with: block background, text and swatch ink, border. */
export const categoryTones = {
  movement: { bg: "--sage-bg", ink: "--sage-ink", line: "--sage-line" },
  home: { bg: "--sky-bg", ink: "--sky-ink", line: "--sky-line" },
  errands: { bg: "--apricot-bg", ink: "--apricot-ink", line: "--apricot-line" },
  rest: { bg: "--lilac-bg", ink: "--lilac-ink", line: "--lilac-line" },
  people: { bg: "--rose-bg", ink: "--rose-ink", line: "--rose-line" },
} as const;

export type SwatchTone = keyof typeof categoryTones | "anchor";

export interface SwatchProps {
  tone: SwatchTone;
  /** `dot` is an 8 px circle; `square` a 10 px rounded square. */
  shape?: "dot" | "square";
}

/** A small decorative color mark for a category or an anchor. */
export function Swatch({ tone, shape = "dot" }: SwatchProps) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.swatch} ${styles[shape]} ${styles[tone]}`}
    />
  );
}
