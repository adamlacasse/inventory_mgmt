import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock prisma
vi.mock("./prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock bcrypt
vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(async (pw: string) => `hashed:${pw}`),
    compare: vi.fn(),
  },
}));

import { prisma } from "./prisma";
import { createUser, deactivateUser, listUsers, updateUser } from "./users";

const mockUser = {
  id: "u1",
  email: "a@b.com",
  name: "Alice",
  role: "operator",
  active: true,
  createdAt: new Date(),
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("listUsers", () => {
  it("returns users from prisma", async () => {
    vi.mocked(prisma.user.findMany).mockResolvedValue([mockUser] as never);
    const result = await listUsers();
    expect(result).toHaveLength(1);
    expect(result[0]?.email).toBe("a@b.com");
  });
});

describe("createUser", () => {
  it("creates a user with hashed password", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null as never);
    vi.mocked(prisma.user.create).mockResolvedValue(mockUser as never);
    await createUser({ email: "a@b.com", name: "Alice", password: "secret", role: "operator" });
    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ passwordHash: "hashed:secret" }) }),
    );
  });

  it("throws CONFLICT when email already exists", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    await expect(
      createUser({ email: "a@b.com", name: "Alice", password: "x", role: "operator" }),
    ).rejects.toMatchObject({ code: "CONFLICT" });
  });
});

describe("updateUser", () => {
  it("updates name and role", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.user.count).mockResolvedValue(2 as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, role: "viewer" } as never);
    const result = await updateUser("u1", { role: "viewer" });
    expect(result.role).toBe("viewer");
  });

  it("blocks demoting the last admin", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, role: "admin" } as never);
    vi.mocked(prisma.user.count).mockResolvedValue(1 as never);
    await expect(updateUser("u1", { role: "operator" })).rejects.toMatchObject({
      code: "CONFLICT",
    });
  });

  it("rejects empty updates", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    await expect(updateUser("u1", {})).rejects.toMatchObject({
      code: "INVALID_PAYLOAD",
      status: 400,
    });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe("deactivateUser", () => {
  it("sets active = false", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    vi.mocked(prisma.user.count).mockResolvedValue(2 as never);
    vi.mocked(prisma.user.update).mockResolvedValue({ ...mockUser, active: false } as never);
    const result = await deactivateUser("u1", "u2");
    expect(result.active).toBe(false);
  });

  it("blocks self-deactivation", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser as never);
    await expect(deactivateUser("u1", "u1")).rejects.toMatchObject({ code: "CONFLICT" });
  });

  it("blocks deactivating the last admin", async () => {
    vi.mocked(prisma.user.findUnique).mockResolvedValue({ ...mockUser, role: "admin" } as never);
    vi.mocked(prisma.user.count).mockResolvedValue(1 as never);
    await expect(deactivateUser("u1", "u2")).rejects.toMatchObject({ code: "CONFLICT" });
  });
});
