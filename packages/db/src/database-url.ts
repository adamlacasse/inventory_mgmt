import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const defaultDatabasePath = path.join(packageRoot, "prisma", "dev.db");

export function resolvePrismaDatabaseUrl(
  configuredUrl: string | undefined = process.env.DATABASE_URL,
): string {
  const databaseUrl = configuredUrl?.trim();

  if (!databaseUrl) {
    return `file:${defaultDatabasePath}`;
  }

  if (!databaseUrl.startsWith("file:")) {
    return databaseUrl;
  }

  const sqlitePath = databaseUrl.slice("file:".length);

  if (path.isAbsolute(sqlitePath)) {
    return databaseUrl;
  }

  return `file:${path.resolve(packageRoot, sqlitePath)}`;
}
