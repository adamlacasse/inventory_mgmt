import { describe, expect, it } from "vitest";
import { calculateUnitsOnHand, canOuttake } from "../src/modules/inventory/service";

describe("inventory service", () => {
  it("calculates units on hand from intake and outtake movements", () => {
    const unitsOnHand = calculateUnitsOnHand([
      { productId: "p1", movementType: "intake", units: 20 },
      { productId: "p1", movementType: "outtake", units: 6 },
    ]);

    expect(unitsOnHand).toBe(14);
  });

  it("prevents outtake requests that exceed units on hand", () => {
    expect(canOuttake(8, 10)).toBe(false);
    expect(canOuttake(8, 8)).toBe(true);
  });

  it("rejects non-positive outtake requests", () => {
    expect(canOuttake(8, 0)).toBe(false);
    expect(canOuttake(8, -1)).toBe(false);
  });
});
