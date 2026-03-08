import { describe, expect, it } from "vitest";
import { shouldRenderSpeedInsights } from "./observability";

describe("shouldRenderSpeedInsights", () => {
  it("returns false outside Vercel", () => {
    expect(shouldRenderSpeedInsights({})).toBe(false);
  });

  it("returns false for local Vercel development", () => {
    expect(
      shouldRenderSpeedInsights({
        VERCEL: "1",
        VERCEL_ENV: "development",
      }),
    ).toBe(false);
  });

  it("returns true for Vercel preview deployments", () => {
    expect(
      shouldRenderSpeedInsights({
        VERCEL: "1",
        VERCEL_ENV: "preview",
      }),
    ).toBe(true);
  });

  it("returns true for Vercel production deployments", () => {
    expect(
      shouldRenderSpeedInsights({
        VERCEL: "1",
        VERCEL_ENV: "production",
      }),
    ).toBe(true);
  });
});
