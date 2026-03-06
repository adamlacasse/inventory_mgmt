import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ApiError } from "./errors";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("iron-session", () => ({
  getIronSession: vi.fn(),
}));

vi.mock("./prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
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
    const { prisma } = await import("./prisma");

    const mockUser = {
      id: "user-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
    };
    const session = {
      user: mockUser,
      destroy: vi.fn(),
      save: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue({} as never);
    vi.mocked(getIronSession).mockResolvedValue(session as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, active: true } as never);

    const { requireSession } = await import("./auth");
    const result = await requireSession();

    expect(result).toEqual(mockUser);
    expect(session.save).not.toHaveBeenCalled();
    expect(session.destroy).not.toHaveBeenCalled();
  });

  it("refreshes the session snapshot when the user's role changes", async () => {
    const { cookies } = await import("next/headers");
    const { getIronSession } = await import("iron-session");
    const { prisma } = await import("./prisma");

    const session = {
      user: {
        id: "user-1",
        email: "admin@example.com",
        name: "Admin User",
        role: "operator",
      },
      destroy: vi.fn(),
      save: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue({} as never);
    vi.mocked(getIronSession).mockResolvedValue(session as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      active: true,
    } as never);

    const { requireSession } = await import("./auth");
    const result = await requireSession();

    expect(result.role).toBe("admin");
    expect(session.user.role).toBe("admin");
    expect(session.save).toHaveBeenCalledTimes(1);
    expect(session.destroy).not.toHaveBeenCalled();
  });

  it("clears the session when the user is inactive", async () => {
    const { cookies } = await import("next/headers");
    const { getIronSession } = await import("iron-session");
    const { prisma } = await import("./prisma");

    const session = {
      user: {
        id: "user-1",
        email: "admin@example.com",
        name: "Admin User",
        role: "admin",
      },
      destroy: vi.fn(),
      save: vi.fn(),
    };

    vi.mocked(cookies).mockResolvedValue({} as never);
    vi.mocked(getIronSession).mockResolvedValue(session as never);
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "user-1",
      email: "admin@example.com",
      name: "Admin User",
      role: "admin",
      active: false,
    } as never);

    const { requireSession } = await import("./auth");

    await expect(requireSession()).rejects.toMatchObject({
      code: "UNAUTHENTICATED",
      status: 401,
    } satisfies Partial<ApiError>);
    expect(session.destroy).toHaveBeenCalledTimes(1);
    expect(session.save).not.toHaveBeenCalled();
  });
});
