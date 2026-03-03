import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiError } from "./errors";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(),
}));

describe("requireSession", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("throws UNAUTHENTICATED ApiError when no session user exists", async () => {
    const { cookies } = await import("next/headers");
    const { getIronSession } = await import("iron-session");

    vi.mocked(cookies).mockResolvedValue({} as never);
    vi.mocked(getIronSession).mockResolvedValue({ user: undefined } as never);

    const { requireSession } = await import("./auth");

    await expect(requireSession()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
      status: 401,
    } satisfies Partial<ApiError>);
  });

  it("returns the session user when a valid session exists", async () => {
    const { cookies } = await import("next/headers");
    const { getIronSession } = await import("iron-session");

    const mockUser = {
      id: "user-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
    };

    vi.mocked(cookies).mockResolvedValue({} as never);
    vi.mocked(getIronSession).mockResolvedValue({ user: mockUser } as never);

    const { requireSession } = await import("./auth");
    const result = await requireSession();

    expect(result).toEqual(mockUser);
  });
});
