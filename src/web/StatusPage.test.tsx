import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import i18n from "./i18n/index.ts";
import { StatusPage } from "./StatusPage.tsx";

beforeEach(() => {
  // Only Date is faked: Testing Library's findBy* polls with real timers.
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date(2026, 10, 6, 14, 5));
});

afterEach(async () => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  await i18n.changeLanguage("en");
});

function answer(status: number, body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(() => Promise.resolve(Response.json(body, { status }))),
  );
}

describe("StatusPage", () => {
  it("shows the heading and Checking until the health check answers", async () => {
    let respond: (response: Response) => void = () => {};
    vi.stubGlobal(
      "fetch",
      vi.fn(
        () =>
          new Promise<Response>((resolve) => {
            respond = resolve;
          }),
      ),
    );

    render(<StatusPage />);

    expect(
      screen.getByRole("heading", { name: "Routinely" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Checking…")).toBeInTheDocument();

    respond(Response.json({ status: "ok", db: "ok" }));

    expect(await screen.findByText("Server: connected")).toBeInTheDocument();
    expect(screen.queryByText("Checking…")).not.toBeInTheDocument();
  });

  it("shows server and database connected on 200", async () => {
    answer(200, { status: "ok", db: "ok" });

    render(<StatusPage />);

    expect(await screen.findByText("Server: connected")).toBeInTheDocument();
    expect(screen.getByText("Database: connected")).toBeInTheDocument();
  });

  it("shows database can't connect on 503", async () => {
    answer(503, { status: "error", db: "error" });

    render(<StatusPage />);

    expect(await screen.findByText("Server: connected")).toBeInTheDocument();
    expect(screen.getByText("Database: can't connect")).toBeInTheDocument();
  });

  it("shows both can't connect on a network error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => Promise.reject(new TypeError("Failed to fetch"))),
    );

    render(<StatusPage />);

    expect(
      await screen.findByText("Server: can't connect"),
    ).toBeInTheDocument();
    expect(screen.getByText("Database: can't connect")).toBeInTheDocument();
  });

  it("shows the checked-at time in the active language", async () => {
    answer(200, { status: "ok", db: "ok" });

    const { unmount } = render(<StatusPage />);
    expect(await screen.findByText("Checked at 2:05 PM")).toBeInTheDocument();
    unmount();

    await i18n.changeLanguage("pt-BR");
    render(<StatusPage />);
    expect(await screen.findByText("Verificado às 14:05")).toBeInTheDocument();
  });
});
