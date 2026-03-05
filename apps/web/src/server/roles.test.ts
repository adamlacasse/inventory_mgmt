import { describe, expect, it } from "vitest";
import type { ApiError } from "./errors";
import { requireRole } from "./roles";
import type { SessionUser } from "./session";

function makeUser(role: string): SessionUser {
  return { id: "u1", email: "test@example.com", name: "Test", role };
}

describe("requireRole", () => {
  it("allows viewer to access viewer-level routes", () => {
    expect(() => requireRole(makeUser("viewer"), "viewer")).not.toThrow();
  });

  it("allows operator to access viewer-level routes", () => {
    expect(() => requireRole(makeUser("operator"), "viewer")).not.toThrow();
  });

  it("allows admin to access operator-level routes", () => {
    expect(() => requireRole(makeUser("admin"), "operator")).not.toThrow();
  });

  it("denies viewer from operator-level routes", () => {
    expect(() => requireRole(makeUser("viewer"), "operator")).toThrow(
      expect.objectContaining({ code: "FORBIDDEN", status: 403 } satisfies Partial<ApiError>),
    );
  });

  it("denies operator from admin-level routes", () => {
    expect(() => requireRole(makeUser("operator"), "admin")).toThrow(
      expect.objectContaining({ code: "FORBIDDEN", status: 403 } satisfies Partial<ApiError>),
    );
  });

  it("denies unknown role from any level", () => {
    expect(() => requireRole(makeUser("unknown"), "viewer")).toThrow(
      expect.objectContaining({ code: "FORBIDDEN", status: 403 } satisfies Partial<ApiError>),
    );
  });
});
