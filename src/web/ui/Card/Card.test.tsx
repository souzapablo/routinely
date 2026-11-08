import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, type CardProps } from "./Card.tsx";
import styles from "./Card.module.css";

function renderCard(props: Omit<CardProps, "children"> = {}): HTMLElement {
  render(
    <Card data-testid="card" {...props}>
      <span>Fit in this week</span>
    </Card>,
  );
  return screen.getByTestId("card");
}

describe("Card", () => {
  it("renders a div with its children and only the surface class by default", () => {
    const card = renderCard();
    expect(card.tagName).toBe("DIV");
    expect(card).toHaveTextContent("Fit in this week");
    expect(styles.card).toBeTruthy();
    expect(card.className).toBe(styles.card);
  });

  it.each(["div", "section", "aside"] as const)(
    "renders as %s when asked",
    (as) => {
      expect(renderCard({ as }).tagName).toBe(as.toUpperCase());
    },
  );

  it.each(["md", "lg"] as const)(
    "padding %s adds its own class only",
    (padding) => {
      const other = padding === "md" ? "lg" : "md";
      const card = renderCard({ padding });
      expect(styles[padding]).toBeTruthy();
      expect(card.className).toBe(`${styles.card} ${styles[padding]}`);
      expect(card).not.toHaveClass(styles[other]);
    },
  );

  it("passes aria-labelledby through so a landmark can be named", () => {
    render(
      <Card as="aside" aria-labelledby="tray-h">
        <h3 id="tray-h">Fit in this week</h3>
      </Card>,
    );
    expect(
      screen.getByRole("complementary", { name: "Fit in this week" }).tagName,
    ).toBe("ASIDE");
  });
});
