import fs from "node:fs";
import path from "node:path";
import { createClient } from "@libsql/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as { prisma?: PrismaClient };

function findWorkspaceRoot(startDirectory: string): string | undefined {
  let currentDirectory = startDirectory;

  while (true) {
    if (fs.existsSync(path.join(currentDirectory, "pnpm-workspace.yaml"))) {
      return currentDirectory;
    }

    const parentDirectory = path.dirname(currentDirectory);
    if (parentDirectory === currentDirectory) {
      return undefined;
    }

    currentDirectory = parentDirectory;
  }
}

function resolveDatabaseUrl(): string | undefined {
  const configuredUrl = process.env.DATABASE_URL;

  if (!configuredUrl) {
    const workspaceRoot = findWorkspaceRoot(process.cwd());
    if (!workspaceRoot) {
      return undefined;
    }

    return `file:${path.join(workspaceRoot, "packages/db/prisma/dev.db")}`;
  }

  if (!configuredUrl.startsWith("file:")) {
    return configuredUrl;
  }

  const sqlitePath = configuredUrl.slice("file:".length);
  if (path.isAbsolute(sqlitePath)) {
    return configuredUrl;
  }

  const resolvedFromCwd = path.resolve(process.cwd(), sqlitePath);
  if (fs.existsSync(resolvedFromCwd) || fs.existsSync(path.dirname(resolvedFromCwd))) {
    return `file:${resolvedFromCwd}`;
  }

  const workspaceRoot = findWorkspaceRoot(process.cwd());
  if (!workspaceRoot) {
    return configuredUrl;
  }

  return `file:${path.join(workspaceRoot, "packages/db/prisma/dev.db")}`;
}

const databaseUrl = resolveDatabaseUrl();
const libsqlUrl = databaseUrl?.startsWith("libsql:") ? databaseUrl : undefined;

const prismaClient = libsqlUrl
  ? new PrismaClient({
      adapter: new PrismaLibSQL(
        createClient({
          url: libsqlUrl,
          ...(process.env.DATABASE_AUTH_TOKEN
            ? { authToken: process.env.DATABASE_AUTH_TOKEN }
            : {}),
        }),
      ),
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    })
  : new PrismaClient({
      ...(databaseUrl ? { datasources: { db: { url: databaseUrl } } } : {}),
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });

export const prisma = globalForPrisma.prisma ?? prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
