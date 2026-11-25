// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import React, { act, useState } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import Navbar from "../src/components/Navbar";
import Schedule from "../src/pages/Schedule";

const styles = readFileSync("src/index.css", "utf8");

const { booked, book } = vi.hoisted(() => ({
  booked: [{
    _id: "booking",
    date: String(Date.parse("2035-07-14T07:00:00Z")),
    time: "09:00",
    name: "Booked",
    email: "",
  }],
  book: vi.fn().mockResolvedValue({}),
}));


vi.mock("@apollo/client", async (importOriginal) => ({
  ...await importOriginal<typeof import("@apollo/client")>(),
  useMutation: () => [book, { loading: false }],
  useQuery: () => ({
    data: { getBookings: booked },
    loading: false,
    refetch: vi.fn().mockResolvedValue({}),
  }),
}));

const harness = globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean };
let container: HTMLDivElement;
let root: ReturnType<typeof createRoot>;

function Page() {
  const [ready, setReady] = useState(false);
  return (
    <MemoryRouter initialEntries={["/schedule"]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Navbar bookingReady={ready} />
      <Schedule onBookingReadyChange={setReady} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  harness.IS_REACT_ACT_ENVIRONMENT = true;
  vi.spyOn(Date, "now").mockReturnValue(Date.parse("2035-07-14T15:30:00Z")); // 8:30 a.m. at the studio
  container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  localStorage.clear();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  harness.IS_REACT_ACT_ENVIRONMENT = false;
});

const bookNow = () => container.querySelector<HTMLButtonElement>(".book-button")!;
const timeButton = (label: string) =>
  [...container.querySelectorAll<HTMLButtonElement>(".booking-time-slot")]
    .find((button) => button.textContent?.startsWith(label))!;

test("signed-out Book Now is yellow and prompts for sign-in", () => {
  act(() => root.render(<Page />));
  expect(bookNow().classList.contains("book-button--signed-out")).toBe(true);
  expect(styles).toMatch(/\.book-button--signed-out\s*{\s*background:\s*#facc15/);
  act(() => timeButton("10:00AM").click());
  expect(bookNow().classList.contains("book-button--ready")).toBe(false);
  act(() => bookNow().click());
  expect(container.querySelector('[role="alert"]')?.textContent).toContain("Please sign in");
  expect(book).not.toHaveBeenCalled();
});

test("signed-in Book Now turns green only for an available future studio slot", async () => {
  localStorage.setItem("token", `header.${btoa(JSON.stringify({ id: "user", email: "user@example.test" }))}.signature`);
  act(() => root.render(<Page />));
  expect(bookNow().className).toBe("book-button");
  expect(timeButton("8:00AM").disabled).toBe(true);
  expect(timeButton("9:00AM").disabled).toBe(true);
  act(() => timeButton("10:00AM").click());
  expect(bookNow().classList.contains("book-button--ready")).toBe(true);
  expect(styles).toMatch(/\.book-button--ready\s*{\s*background:\s*#15803d/);
  await act(async () => bookNow().click());
  expect(book).toHaveBeenCalledWith({
    variables: { input: { date: "2035-07-14", time: "10:00" } },
  });
  expect(bookNow().className).toBe("book-button");
});
