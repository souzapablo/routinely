import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StatusIndicator } from "./StatusIndicator.tsx";
import styles from "./StatusIndicator.module.css";

const tones = ["neutral", "ok", "busy", "error"] as const;

describe("StatusIndicator", () => {
  it("is a status region whose text is the given text", () => {
    render(<StatusIndicator tone="neutral">Example week</StatusIndicator>);
    expect(screen.getByRole("status")).toHaveTextContent(/^Example week$/);
  });

  it.each(tones)("tone %s sets only its own class", (tone) => {
    render(<StatusIndicator tone={tone}>Saved</StatusIndicator>);
    const status = screen.getByRole("status");
    expect(styles[tone]).toBeTruthy();
    expect(status).toHaveClass(styles.status, styles[tone]);
    for (const other of tones.filter((t) => t !== tone)) {
      expect(status).not.toHaveClass(styles[other]);
    }
  });

  it("hides its dot from assistive tech", () => {
    render(<StatusIndicator tone="ok">Saved</StatusIndicator>);
    const dot = screen.getByRole("status").querySelector(`.${styles.dot}`);
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });
});
