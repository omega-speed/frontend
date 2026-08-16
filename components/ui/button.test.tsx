// UX-001 — the shared Button: the loading state announces itself and blocks
// double-submits; buttons stay reachable and labeled for assistive tech.
import { describe, expect, it, vi, beforeEach } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  beforeEach(() => cleanup());

  it("renders an accessible button with its label", () => {
    render(<Button>Save to my profile</Button>);
    expect(screen.getByRole("button", { name: /save to my profile/i })).toBeInTheDocument();
  });

  it("loading disables interaction — no double submits under slow networks", () => {
    const onClick = vi.fn();
    render(
      <Button loading onClick={onClick}>
        Add to transcript
      </Button>,
    );
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("disabled is honored", () => {
    render(<Button disabled>Commit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
