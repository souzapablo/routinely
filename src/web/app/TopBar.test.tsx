import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type AnchorsContextValue,
  useAnchors,
} from "../anchors/AnchorsProvider.tsx";
import type { SaveStatus } from "../anchors/model/saveStatus.ts";
import i18n from "../i18n/index.ts";
import brandStyles from "../ui/BrandMark/BrandMark.module.css";
import statusStyles from "../ui/StatusIndicator/StatusIndicator.module.css";
import { TopBar } from "./TopBar.tsx";

vi.mock("../anchors/AnchorsProvider.tsx", () => ({ useAnchors: vi.fn() }));

const openAdd = vi.fn();

function stubAnchors(status: SaveStatus) {
  vi.mocked(useAnchors).mockReturnValue({
    status,
    openAdd,
  } as unknown as AnchorsContextValue);
}

beforeEach(() => {
  openAdd.mockReset();
  stubAnchors("saved");
});

afterEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage("en");
});

describe("TopBar", () => {
  it("shows the mark, the save status, Add activity and the language switch", () => {
    const { container } = render(<TopBar />);

    expect(container.querySelector(`.${brandStyles.mark}`)).not.toBeNull();
    expect(screen.getByRole("banner")).toHaveTextContent(/^Routinely/);
    expect(screen.getByRole("banner")).not.toHaveTextContent("Example week");

    const status = screen.getByRole("status");
    expect(status).toHaveTextContent(/^Saved$/);
    expect(status).toHaveClass(statusStyles.ok);

    const add = screen.getByRole("button", { name: "Add activity" });
    expect(add.querySelector("svg")).toHaveClass("lucide-plus");

    expect(screen.getByRole("button", { name: "English" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Português" })).toBeEnabled();
  });

  it.each([
    ["loading", "Loading your week…", "busy"],
    ["saving", "Saving…", "busy"],
    ["saved", "Saved", "ok"],
    ["notSaved", "Not saved", "error"],
    ["loadFailed", "Couldn't load your week", "error"],
  ] as const)("shows %s as %s with the %s dot", (status, text, tone) => {
    stubAnchors(status);
    render(<TopBar />);

    const indicator = screen.getByRole("status");
    expect(indicator).toHaveTextContent(new RegExp(`^${text}$`));
    expect(indicator).toHaveClass(statusStyles[tone]);
  });

  it("opens the drawer to add from the enabled + button", () => {
    render(<TopBar />);

    const add = screen.getByRole("button", { name: "Add activity" });
    expect(add).toBeEnabled();
    fireEvent.click(add);
    expect(openAdd).toHaveBeenCalledTimes(1);
  });

  it("shows its texts in pt-BR", async () => {
    await i18n.changeLanguage("pt-BR");
    render(<TopBar />);

    expect(screen.getByRole("status")).toHaveTextContent(/^Salvo$/);
    expect(
      screen.getByRole("button", { name: "Adicionar atividade" }),
    ).toBeEnabled();
  });
});
