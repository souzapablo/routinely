import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Swatch, categoryTones } from "./Swatch.tsx";
import styles from "./Swatch.module.css";

const tones = [
  "movement",
  "home",
  "errands",
  "rest",
  "people",
  "anchor",
] as const;

function swatchOf(container: HTMLElement): HTMLElement {
  const swatch = container.firstElementChild;
  if (!(swatch instanceof HTMLElement)) throw new Error("no swatch rendered");
  return swatch;
}

describe("Swatch", () => {
  it.each(tones)("tone %s sets only its own class", (tone) => {
    const { container } = render(<Swatch tone={tone} />);
    const swatch = swatchOf(container);
    expect(styles[tone]).toBeTruthy();
    expect(swatch).toHaveClass(styles.swatch, styles[tone]);
    for (const other of tones.filter((t) => t !== tone)) {
      expect(swatch).not.toHaveClass(styles[other]);
    }
  });

  it.each([
    ["dot", "square"],
    ["square", "dot"],
  ] as const)("shape %s sets its class and not %s", (shape, other) => {
    const { container } = render(<Swatch tone="rest" shape={shape} />);
    const swatch = swatchOf(container);
    expect(styles[shape]).toBeTruthy();
    expect(swatch).toHaveClass(styles[shape]);
    expect(swatch).not.toHaveClass(styles[other]);
  });

  it("is a dot when no shape is given", () => {
    const { container } = render(<Swatch tone="home" />);
    expect(swatchOf(container)).toHaveClass(styles.dot);
  });

  it("is hidden from assistive tech", () => {
    const { container } = render(<Swatch tone="anchor" shape="square" />);
    expect(swatchOf(container)).toHaveAttribute("aria-hidden", "true");
  });
});

describe("categoryTones", () => {
  it("maps each category to its color family", () => {
    expect(categoryTones).toEqual({
      movement: { bg: "--sage-bg", ink: "--sage-ink", line: "--sage-line" },
      home: { bg: "--sky-bg", ink: "--sky-ink", line: "--sky-line" },
      errands: {
        bg: "--apricot-bg",
        ink: "--apricot-ink",
        line: "--apricot-line",
      },
      rest: { bg: "--lilac-bg", ink: "--lilac-ink", line: "--lilac-line" },
      people: { bg: "--rose-bg", ink: "--rose-ink", line: "--rose-line" },
    });
  });
});
