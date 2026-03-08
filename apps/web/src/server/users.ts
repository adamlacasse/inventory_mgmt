import bcrypt from "bcryptjs";
import { ApiError } from "./errors";
import { prisma } from "./prisma";
import { ROLES, type Role } from "./roles";

export type CreateUserInput = {
  email: string;
  name: string;
  password: string;
  role: Role;
};

export type UpdateUserInput = {
  name?: string;
  role?: Role;
  password?: string;
};

export type UserDetail = {
  id: string;
  email: string;
  name: string;
  role: string;
  active: boolean;
  createdAt: Date;
};

const userSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  active: true,
  createdAt: true,
} as const;

export async function listUsers(): Promise<UserDetail[]> {
  return prisma.user.findMany({
    select: userSelect,
    orderBy: { createdAt: "asc" },
  });
}

export async function createUser(input: CreateUserInput): Promise<UserDetail> {
  if (!input.email || !input.name || !input.password) {
    throw new ApiError("INVALID_PAYLOAD", 400, "email, name, and password are required.");
  }
  if (!(ROLES as readonly string[]).includes(input.role)) {
    throw new ApiError("INVALID_PAYLOAD", 400, `role must be one of: ${ROLES.join(", ")}.`);
  }
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) {
    throw new ApiError("CONFLICT", 409, "A user with that email already exists.");
  }
  const passwordHash = await bcrypt.hash(input.password, 12);
  return prisma.user.create({
    data: { email: input.email, name: input.name, passwordHash, role: input.role },
    select: userSelect,
  });
}

export async function updateUser(id: string, input: UpdateUserInput): Promise<UserDetail> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError("NOT_FOUND", 404, "User not found.");
  }
  // Guard: cannot demote the last admin
  if (input.role && input.role !== "admin" && user.role === "admin") {
    const adminCount = await prisma.user.count({
      where: { role: "admin", active: true },
    });
    if (adminCount <= 1) {
      throw new ApiError("CONFLICT", 409, "Cannot change role of the last admin.");
    }
  }
  const data: {
    name?: string;
    role?: string;
    passwordHash?: string;
  } = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.role !== undefined) data.role = input.role;
  if (input.password !== undefined) data.passwordHash = await bcrypt.hash(input.password, 12);
  if (Object.keys(data).length === 0) {
    throw new ApiError(
      "INVALID_PAYLOAD",
      400,
      "At least one of name, role, or password must be provided.",
    );
  }
  return prisma.user.update({
    where: { id },
    data,
    select: userSelect,
  });
}

export async function deactivateUser(id: string, actorId: string): Promise<UserDetail> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw new ApiError("NOT_FOUND", 404, "User not found.");
  }
  if (id === actorId) {
    throw new ApiError("CONFLICT", 409, "Cannot deactivate your own account.");
  }
  if (user.role === "admin") {
    const adminCount = await prisma.user.count({
      where: { role: "admin", active: true },
    });
    if (adminCount <= 1) {
      throw new ApiError("CONFLICT", 409, "Cannot deactivate the last admin.");
    }
  }
  return prisma.user.update({
    where: { id },
    data: { active: false },
    select: userSelect,
  });
}
