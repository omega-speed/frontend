import { describe, expect, it } from "vitest";
import { recomputeFit } from "./ollie-shortlist";

// The popover's math must match the backend's recomputeFitScore exactly
// (same double rounding as the ranking engine). One inconsistency here is the
// failure mode the whole transparency story guards against.
describe("recomputeFit", () => {
  it("weighted average over counted rows, unknowns excluded", () => {
    expect(
      recomputeFit([
        { value: 80, weight: 1 },
        { value: 90, weight: 1 },
        { value: 40, weight: 1 },
        { value: null, weight: 1 },
      ]),
    ).toBe(70);
  });

  it("all unknown → null", () => {
    expect(recomputeFit([{ value: null, weight: 1 }])).toBeNull();
  });

  it("double-rounds like the engine (2dp then ×100)", () => {
    // 55.5/100 and 55.4/100 land differently only with the engine's rounding.
    expect(recomputeFit([{ value: 56, weight: 1 }, { value: 55, weight: 1 }])).toBe(56);
  });
});
