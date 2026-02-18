import { describe, expect, it } from "vitest";
import { ApiError } from "./errors";
import { parseHistoryFilters } from "./transactions";

describe("history filters", () => {
  it("parses valid filters", () => {
    const query = new URLSearchParams({
      type: "outtake",
      startDate: "2026-02-01",
      endDate: "2026-02-10",
    });

    expect(parseHistoryFilters(query)).toEqual({
      type: "outtake",
      startDate: "2026-02-01",
      endDate: "2026-02-10",
    });
  });

  it("rejects invalid type", () => {
    const query = new URLSearchParams({
      type: "invalid",
    });

    expect(() => parseHistoryFilters(query)).toThrowError(ApiError);
  });
});
