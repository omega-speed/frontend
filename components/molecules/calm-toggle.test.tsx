// UX-001 · SEG-NEURO-000002/000009 — calm mode is the user's choice, persisted,
// and reflected on the root element so CSS can quiet the whole page.
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { CalmToggle } from "./calm-toggle";

describe("CalmToggle", () => {
  beforeEach(() => {
    cleanup();
    localStorage.clear();
    document.documentElement.removeAttribute("data-calm");
  });

  it("starts quiet-off and turns calm on with one tap, persisting the choice", () => {
    render(<CalmToggle />);
    const btn = screen.getByRole("button");
    expect(btn).toHaveAttribute("aria-pressed", "false");
    expect(document.documentElement.hasAttribute("data-calm")).toBe(false);

    fireEvent.click(btn);

    expect(btn).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.hasAttribute("data-calm")).toBe(true);
    expect(localStorage.getItem("qoollege-calm")).toBe("1");
  });

  it("restores a stored calm preference on mount (no shame, no reset)", () => {
    localStorage.setItem("qoollege-calm", "1");
    render(<CalmToggle />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
    expect(document.documentElement.hasAttribute("data-calm")).toBe(true);
  });

  it("turning it off restores the full experience", () => {
    localStorage.setItem("qoollege-calm", "1");
    render(<CalmToggle />);
    fireEvent.click(screen.getByRole("button"));
    expect(document.documentElement.hasAttribute("data-calm")).toBe(false);
    expect(localStorage.getItem("qoollege-calm")).toBe("0");
  });
});
