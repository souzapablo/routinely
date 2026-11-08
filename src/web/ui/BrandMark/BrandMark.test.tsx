import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { BrandMark } from "./BrandMark.tsx";
import styles from "./BrandMark.module.css";

function markOf(container: HTMLElement): HTMLElement {
  const mark = container.firstElementChild;
  if (!(mark instanceof HTMLElement)) throw new Error("no mark rendered");
  return mark;
}

describe("BrandMark", () => {
  it("renders three bars in order", () => {
    const { container } = render(<BrandMark />);
    const bars = [...markOf(container).children];
    expect(bars).toHaveLength(3);
    expect(bars[0]).toHaveClass(styles.bar, styles.top);
    expect(bars[1]).toHaveClass(styles.bar, styles.middle);
    expect(bars[2]).toHaveClass(styles.bar, styles.bottom);
  });

  it("is hidden from assistive tech", () => {
    const { container } = render(<BrandMark />);
    expect(markOf(container)).toHaveAttribute("aria-hidden", "true");
  });
});
