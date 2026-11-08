import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge } from "./Badge.tsx";
import styles from "./Badge.module.css";

describe("Badge", () => {
  it.each([
    ["count", "4 left"],
    ["now", "Now"],
  ] as const)("tone %s renders its text with its own class", (tone, text) => {
    const other = tone === "count" ? "now" : "count";
    render(<Badge tone={tone}>{text}</Badge>);
    const badge = screen.getByText(text);
    expect(badge.tagName).toBe("SPAN");
    expect(styles.badge).toBeTruthy();
    expect(styles[tone]).toBeTruthy();
    expect(badge.className).toBe(`${styles.badge} ${styles[tone]}`);
    expect(badge).not.toHaveClass(styles[other]);
  });
});
