import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Drawer, type DrawerProps } from "./Drawer.tsx";

function renderDrawer(props: Partial<DrawerProps> = {}) {
  const onClose = vi.fn();
  const all: DrawerProps = {
    open: true,
    title: "Add anchor",
    onClose,
    closeLabel: "Close",
    children: <div data-testid="content">Form</div>,
    ...props,
  };
  const view = render(<Drawer {...all} />);
  return { ...view, onClose, props: all };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Drawer", () => {
  it("opening calls showModal and names the dialog with the title", () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    renderDrawer();
    expect(showModal).toHaveBeenCalledTimes(1);
    const dialog = screen.getByRole("dialog", { name: "Add anchor" });
    expect(dialog.tagName).toBe("DIALOG");
    expect(dialog).toHaveAttribute("open");
  });

  it("stays shut and does not call showModal while open is false", () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, "showModal");
    const { container } = renderDrawer({ open: false });
    expect(showModal).not.toHaveBeenCalled();
    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("turning open off calls close", () => {
    const close = vi.spyOn(HTMLDialogElement.prototype, "close");
    const { rerender, props, container } = renderDrawer();
    rerender(<Drawer {...props} open={false} />);
    expect(close).toHaveBeenCalledTimes(1);
    expect(container.querySelector("dialog")).not.toHaveAttribute("open");
  });

  it("the cancel event (Escape) calls onClose and leaves the dialog to the open prop", () => {
    const { onClose } = renderDrawer();
    const dialog = screen.getByRole("dialog");
    const cancel = new Event("cancel", { cancelable: true });
    fireEvent(dialog, cancel);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(cancel.defaultPrevented).toBe(true);
  });

  it("the close button calls onClose", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDrawer();
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("a click on the dialog element itself (the backdrop) calls onClose", () => {
    const { onClose } = renderDrawer();
    fireEvent.click(screen.getByRole("dialog"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("a click inside the panel does not call onClose", async () => {
    const user = userEvent.setup();
    const { onClose } = renderDrawer();
    await user.click(screen.getByTestId("content"));
    await user.click(screen.getByRole("heading", { name: "Add anchor" }));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("shows the footer", () => {
    renderDrawer({ footer: <div data-testid="footer">Save</div> });
    expect(screen.getByRole("dialog")).toContainElement(
      screen.getByTestId("footer"),
    );
  });

  it("closing focuses the element that was focused before opening", () => {
    const opener = document.createElement("button");
    document.body.append(opener);
    opener.focus();
    const { rerender, props } = renderDrawer();
    screen.getByRole("button", { name: "Close" }).focus();

    rerender(<Drawer {...props} open={false} />);
    expect(opener).toHaveFocus();
    opener.remove();
  });

  it("closing focuses the fallback when that element has left the page", () => {
    const opener = document.createElement("button");
    const fallback = document.createElement("button");
    document.body.append(opener, fallback);
    const fallbackRef = { current: fallback };
    opener.focus();
    const { rerender, props } = renderDrawer({
      returnFocusFallback: fallbackRef,
    });

    opener.remove();
    rerender(<Drawer {...props} open={false} />);
    expect(fallback).toHaveFocus();
    fallback.remove();
  });
});
