import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Anchor } from "../../shared/planner.ts";
import i18n from "../i18n/index.ts";
import buttonStyles from "../ui/Button/Button.module.css";
import messageStyles from "../ui/MessageLine/MessageLine.module.css";
import { AnchorDrawer } from "./AnchorDrawer.tsx";
import {
  type AnchorsContextValue,
  type DrawerOutcome,
  type DrawerState,
  useAnchors,
} from "./AnchorsProvider.tsx";
import type { SaveStatus } from "../week/model/saveStatus.ts";

vi.mock("./AnchorsProvider.tsx", () => ({ useAnchors: vi.fn() }));

const work: Anchor = {
  id: "w",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

const save = vi.fn<(draft: unknown) => Promise<DrawerOutcome>>();
const remove = vi.fn<() => Promise<DrawerOutcome>>();
const closeDrawer = vi.fn();

let drawer: DrawerState;
let status: SaveStatus;

function stub() {
  vi.mocked(useAnchors).mockReturnValue({
    anchors: [work],
    status,
    drawer,
    closeDrawer,
    save,
    remove,
  } as unknown as AnchorsContextValue);
}

function renderDrawer(state: DrawerState) {
  drawer = state;
  stub();
  const view = render(<AnchorDrawer />);
  return {
    ...view,
    /** Re-renders with a new drawer state or status, as the provider would. */
    update(next: { drawer?: DrawerState; status?: SaveStatus }) {
      if (next.drawer) drawer = next.drawer;
      if (next.status) status = next.status;
      stub();
      view.rerender(<AnchorDrawer />);
    },
  };
}

const dialog = () => screen.getByRole("dialog");
const nameField = () => screen.getByRole("textbox", { name: "Name" });
const startField = () => screen.getByLabelText("Start");
const endField = () => screen.getByLabelText("End");
const saveButton = () => screen.getByRole("button", { name: "Save anchor" });
const messageLine = () =>
  within(dialog())
    .getAllByRole("status")
    .find((el) => el.classList.contains(messageStyles.line))!;

function pressedDays(): string[] {
  const group = screen.getByRole("group", { name: "Repeats on" });
  return within(group)
    .getAllByRole("button")
    .filter((b) => b.getAttribute("aria-pressed") === "true")
    .map((b) => b.textContent ?? "");
}

beforeEach(() => {
  status = "saved";
  save.mockReset().mockResolvedValue({ kind: "closed" });
  remove.mockReset().mockResolvedValue({ kind: "closed" });
  closeDrawer.mockReset();
});

afterEach(async () => {
  localStorage.clear();
  await i18n.changeLanguage("en");
});

describe("AnchorDrawer opening", () => {
  it("adds with an empty name, Mon–Fri, 09:00–18:00, focus on the name and no Delete", () => {
    renderDrawer({ mode: "add" });

    expect(dialog()).toHaveAttribute("open");
    expect(
      within(dialog()).getByRole("heading", { name: "Add anchor" }),
    ).toBeInTheDocument();
    expect(nameField()).toHaveValue("");
    expect(nameField()).toHaveFocus();
    expect(nameField()).toHaveAttribute("maxLength", "60");
    expect(pressedDays()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    expect(startField()).toHaveValue("09:00");
    expect(endField()).toHaveValue("18:00");
    expect(screen.queryByRole("button", { name: "Delete" })).toBeNull();
  });

  it("lists the day toggles Sunday first", () => {
    renderDrawer({ mode: "add" });

    const group = screen.getByRole("group", { name: "Repeats on" });
    expect(
      within(group)
        .getAllByRole("button")
        .map((b) => b.textContent),
    ).toEqual(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
  });

  it("edits a stored anchor filled from it, with Delete", () => {
    renderDrawer({
      mode: "edit",
      anchor: { ...work, name: "Gym", days: [0, 3], start: 1080, end: 1170 },
    });

    expect(
      within(dialog()).getByRole("heading", { name: "Edit anchor" }),
    ).toBeInTheDocument();
    expect(nameField()).toHaveValue("Gym");
    expect(pressedDays()).toEqual(["Sun", "Wed"]);
    expect(startField()).toHaveValue("18:00");
    expect(endField()).toHaveValue("19:30");
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("shows the preview line and follows the draft", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });

    expect(dialog()).toHaveTextContent(
      "Untitled · Mon–Fri · 9:00 AM – 6:00 PM · every week",
    );
    await user.type(nameField(), "Work");
    expect(dialog()).toHaveTextContent(
      "Work · Mon–Fri · 9:00 AM – 6:00 PM · every week",
    );
  });

  it("closes through Cancel without saving", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(closeDrawer).toHaveBeenCalledTimes(1);
    expect(save).not.toHaveBeenCalled();
  });
});

describe("AnchorDrawer rules", () => {
  it("asks for a name, sends nothing and focuses the name field", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "   ");
    await user.click(saveButton());

    expect(messageLine()).toHaveTextContent(
      "Give it a name so you can recognize it on the calendar.",
    );
    expect(messageLine()).not.toHaveClass(messageStyles.error);
    expect(nameField()).toHaveFocus();
    expect(save).not.toHaveBeenCalled();
  });

  it("asks for at least one day", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "Work");
    for (const day of ["Mon", "Tue", "Wed", "Thu", "Fri"]) {
      await user.click(screen.getByRole("button", { name: day }));
    }
    await user.click(saveButton());

    expect(messageLine()).toHaveTextContent(
      "Pick at least one day it repeats on.",
    );
    expect(save).not.toHaveBeenCalled();
  });

  it("asks for both times", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "Work");
    await user.clear(endField());
    await user.click(saveButton());

    expect(messageLine()).toHaveTextContent("Set a start and end time.");
    expect(save).not.toHaveBeenCalled();
  });

  it("asks for 15-minute steps with times in the active language", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "Work");
    await user.clear(startField());
    await user.type(startField(), "09:10");
    await user.click(saveButton());

    expect(messageLine()).toHaveTextContent(
      "Times go in 15-minute steps, like 9:00 AM or 9:15 AM.",
    );
    expect(save).not.toHaveBeenCalled();
  });

  it("asks for an end after the start", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "Work");
    await user.clear(endField());
    await user.type(endField(), "09:00");
    await user.click(saveButton());

    expect(messageLine()).toHaveTextContent(
      "The end time needs to be after the start time.",
    );
    expect(save).not.toHaveBeenCalled();
  });

  it("names the overlapped anchor and the first shared day", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "Gym");
    await user.clear(startField());
    await user.type(startField(), "17:00");
    await user.clear(endField());
    await user.type(endField(), "18:30");
    await user.click(saveButton());

    expect(messageLine()).toHaveTextContent(
      "This overlaps Work on Mon. Anchors can't share time.",
    );
    expect(messageLine()).not.toHaveClass(messageStyles.error);
    expect(save).not.toHaveBeenCalled();
  });

  it("does not count the edited anchor's stored version as an overlap", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "edit", anchor: work });
    await user.clear(endField());
    await user.type(endField(), "17:00");
    await user.click(saveButton());

    expect(save).toHaveBeenCalledWith({
      name: "Work",
      days: [1, 2, 3, 4, 5],
      start: "09:00",
      end: "17:00",
    });
  });
});

describe("AnchorDrawer saving", () => {
  it("sends a valid draft to save", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "Gym");
    await user.click(screen.getByRole("button", { name: "Sat" }));
    await user.clear(startField());
    await user.type(startField(), "18:00");
    await user.clear(endField());
    await user.type(endField(), "19:00");
    await user.click(saveButton());

    expect(save).toHaveBeenCalledWith({
      name: "Gym",
      days: [1, 2, 3, 4, 5, 6],
      start: "18:00",
      end: "19:00",
    });
  });

  it("disables Save while saving", () => {
    const view = renderDrawer({ mode: "add" });
    expect(saveButton()).toBeEnabled();

    view.update({ status: "saving" });
    expect(saveButton()).toBeDisabled();
  });

  it("keeps every value and shows the failure in error tone when the save fails", async () => {
    const user = userEvent.setup();
    save.mockResolvedValueOnce({ kind: "failed" });
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "Gym");
    await user.click(screen.getByRole("button", { name: "Sat" }));
    await user.clear(startField());
    await user.type(startField(), "18:00");
    await user.clear(endField());
    await user.type(endField(), "19:00");
    await user.click(saveButton());

    expect(messageLine()).toHaveTextContent(
      "Not saved. Your changes are still here, so you can try again.",
    );
    expect(messageLine()).toHaveClass(messageStyles.error);
    expect(nameField()).toHaveValue("Gym");
    expect(pressedDays()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);
    expect(startField()).toHaveValue("18:00");
    expect(endField()).toHaveValue("19:00");
  });

  it("shows the server's overlap answer", async () => {
    const user = userEvent.setup();
    save.mockResolvedValueOnce({
      kind: "problem",
      problem: { code: "overlap", other: "Therapy", day: 3 },
    });
    renderDrawer({ mode: "add" });
    await user.type(nameField(), "Gym");
    await user.clear(startField());
    await user.type(startField(), "06:00");
    await user.clear(endField());
    await user.type(endField(), "07:00");
    await user.click(saveButton());

    expect(messageLine()).toHaveTextContent(
      "This overlaps Therapy on Wed. Anchors can't share time.",
    );
    expect(messageLine()).not.toHaveClass(messageStyles.error);
  });
});

describe("AnchorDrawer delete", () => {
  it("arms on the first click and deletes on the second", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "edit", anchor: work });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    const armed = screen.getByRole("button", { name: "Click again to delete" });
    expect(armed).toHaveClass(buttonStyles.danger);
    expect(remove).not.toHaveBeenCalled();

    await user.click(armed);
    expect(remove).toHaveBeenCalledTimes(1);
  });

  it("is disarmed when the drawer opens again", async () => {
    const user = userEvent.setup();
    const view = renderDrawer({ mode: "edit", anchor: work });
    await user.click(screen.getByRole("button", { name: "Delete" }));

    view.update({ drawer: { mode: "closed" } });
    view.update({ drawer: { mode: "edit", anchor: work } });

    const button = screen.getByRole("button", { name: "Delete" });
    expect(button).not.toHaveClass(buttonStyles.danger);
  });

  it("shows the failure when the delete fails", async () => {
    const user = userEvent.setup();
    remove.mockResolvedValueOnce({ kind: "failed" });
    renderDrawer({ mode: "edit", anchor: work });

    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      screen.getByRole("button", { name: "Click again to delete" }),
    );

    expect(messageLine()).toHaveTextContent(
      "Not deleted. Try again in a moment.",
    );
    expect(messageLine()).toHaveClass(messageStyles.error);
  });
});

describe("AnchorDrawer reopening", () => {
  it("starts from the defaults with no message after it reopens", async () => {
    const user = userEvent.setup();
    const view = renderDrawer({ mode: "add" });
    await user.type(nameField(), "Gym");
    await user.click(screen.getByRole("button", { name: "Mon" }));
    await user.clear(endField());
    await user.click(saveButton());
    expect(messageLine()).toHaveTextContent("Set a start and end time.");

    view.update({ drawer: { mode: "closed" } });
    view.update({ drawer: { mode: "add" } });

    expect(nameField()).toHaveValue("");
    expect(pressedDays()).toEqual(["Mon", "Tue", "Wed", "Thu", "Fri"]);
    expect(endField()).toHaveValue("18:00");
    expect(messageLine()).toHaveTextContent(/^$/);
  });
});

describe("AnchorDrawer language", () => {
  it("re-renders its labels, weekdays, preview and message in pt-BR", async () => {
    const user = userEvent.setup();
    renderDrawer({ mode: "edit", anchor: work });
    await user.clear(nameField());
    await user.click(saveButton());

    await act(() => i18n.changeLanguage("pt-BR"));

    expect(
      within(dialog()).getByRole("heading", { name: "Editar âncora" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Nome" })).toBeInTheDocument();
    const group = screen.getByRole("group", { name: "Repete em" });
    expect(within(group).getAllByRole("button")[0]).toHaveTextContent("dom.");
    expect(dialog()).toHaveTextContent(
      "Sem nome · seg.–sex. · 09:00 – 18:00 · toda semana",
    );
    expect(messageLine()).toHaveTextContent(
      "Dê um nome para reconhecer no calendário.",
    );
    expect(
      screen.getByRole("button", { name: "Salvar âncora" }),
    ).toBeInTheDocument();
  });
});
