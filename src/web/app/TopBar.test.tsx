import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import i18n from "../i18n/index.ts";
import brandStyles from "../ui/BrandMark/BrandMark.module.css";
import statusStyles from "../ui/StatusIndicator/StatusIndicator.module.css";
import { TopBar } from "./TopBar.tsx";

afterEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage("en");
});

describe("TopBar", () => {
  it("shows the mark, Example week, Add activity and the language switch", () => {
    const { container } = render(<TopBar />);

    expect(container.querySelector(`.${brandStyles.mark}`)).not.toBeNull();
    expect(screen.getByRole("banner")).toHaveTextContent(/^Routinely/);

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent("Example week");
    expect(status).toHaveClass(statusStyles.neutral);

    const add = screen.getByRole("button", { name: "Add activity" });
    expect(add).toBeDisabled();
    expect(add.querySelector("svg")).toHaveClass("lucide-plus");

    expect(screen.getByRole("button", { name: "English" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Português" })).toBeEnabled();
  });

  it("shows its texts in pt-BR", async () => {
    await i18n.changeLanguage("pt-BR");
    render(<TopBar />);

    expect(screen.getByRole("status")).toHaveTextContent("Semana de exemplo");
    expect(
      screen.getByRole("button", { name: "Adicionar atividade" }),
    ).toBeDisabled();
  });
});
