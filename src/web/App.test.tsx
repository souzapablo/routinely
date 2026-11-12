import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { App } from "./App.tsx";
import "./i18n/index.ts";

const work = {
  id: "w",
  name: "Work",
  days: [1, 2, 3, 4, 5],
  start: 540,
  end: 1080,
};

/** A stand-in server: the health check and a list of anchors in memory. */
function stubServer(stored: (typeof work)[]) {
  let anchors = [...stored];
  vi.stubGlobal(
    "fetch",
    vi.fn((url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (url === "/api/health") {
        return Promise.resolve(Response.json({ status: "ok", db: "ok" }));
      }
      if (url === "/api/anchors" && method === "GET") {
        return Promise.resolve(Response.json(anchors));
      }
      if (url === "/api/anchors" && method === "POST") {
        const body = JSON.parse(init?.body as string) as Omit<
          typeof work,
          "id"
        >;
        const created = { ...body, id: "new" };
        anchors = [...anchors, created];
        return Promise.resolve(Response.json(created, { status: 201 }));
      }
      const id = url.split("/").pop();
      if (method === "DELETE") {
        anchors = anchors.filter((a) => a.id !== id);
        return Promise.resolve(new Response(null, { status: 204 }));
      }
      return Promise.resolve(new Response(null, { status: 500 }));
    }),
  );
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 8, 7, 48));
  stubServer([]);
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App", () => {
  it("loads the stored anchors at / and reads Saved", async () => {
    stubServer([work]);
    renderAt("/");

    expect(
      await screen.findAllByRole("button", { name: "Edit Work" }),
    ).toHaveLength(5);
    expect(
      within(screen.getByRole("banner")).getByText("Saved"),
    ).toBeInTheDocument();
  });

  it("opens Add activity from the + button and toasts after a save", async () => {
    const user = userEvent.setup();
    renderAt("/");
    await within(screen.getByRole("banner")).findByText("Saved");

    await user.click(screen.getByRole("button", { name: "Add activity" }));
    const dialog = screen.getByRole("dialog");
    expect(
      within(dialog).getByRole("heading", { name: "Add activity" }),
    ).toBeInTheDocument();

    await user.type(
      within(dialog).getByRole("textbox", { name: "Name" }),
      "Work",
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Save activity" }),
    );

    expect(await screen.findByText("Saved Work.")).toBeInTheDocument();
    expect(dialog).not.toHaveAttribute("open");
    expect(screen.getAllByRole("button", { name: "Edit Work" })).toHaveLength(
      5,
    );
  });

  it("returns focus to the + button when the opening block is deleted", async () => {
    const user = userEvent.setup();
    stubServer([work]);
    renderAt("/");

    const [block] = await screen.findAllByRole("button", { name: "Edit Work" });
    await user.click(block);
    await user.click(screen.getByRole("button", { name: "Delete" }));
    await user.click(
      screen.getByRole("button", { name: "Click again to delete" }),
    );

    expect(await screen.findByText("Deleted Work.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Edit Work" })).toBeNull();
    expect(screen.getByRole("button", { name: "Add activity" })).toHaveFocus();
  });

  it("shows the planner at /", () => {
    renderAt("/");

    expect(screen.getByRole("banner")).toHaveTextContent("Routinely");
    expect(
      screen.getByRole("heading", { level: 1, name: "This week" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Routinely" }),
    ).not.toBeInTheDocument();
  });

  it("shows the status page at /status under the top bar", async () => {
    const { container } = renderAt("/status");

    const banner = screen.getByRole("banner");
    expect(await within(banner).findByText("Saved")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Português" })).toBeVisible();
    const heading = screen.getByRole("heading", {
      level: 1,
      name: "Routinely",
    });
    expect(
      banner.compareDocumentPosition(heading) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(await screen.findByText("Server: connected")).toBeInTheDocument();
    expect(screen.getByText("Database: connected")).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "This week" }),
    ).not.toBeInTheDocument();
    expect(container.querySelectorAll("main")).toHaveLength(1);
  });

  it("sends unknown paths to the planner", () => {
    renderAt("/no/such/page");

    expect(
      screen.getByRole("heading", { level: 1, name: "This week" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Routinely" }),
    ).not.toBeInTheDocument();
  });
});
