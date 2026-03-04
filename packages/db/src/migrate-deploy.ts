import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { type InStatement, createClient } from "@libsql/client/node";

type MigrationRecord = {
  checksum: string;
};

function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let start = 0;
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < sql.length; index += 1) {
    const current = sql[index];
    const next = sql[index + 1];
    const previous = sql[index - 1];

    if (inLineComment) {
      if (current === "\n") {
        inLineComment = false;
      }

      continue;
    }

    if (inBlockComment) {
      if (previous === "*" && current === "/") {
        inBlockComment = false;
      }

      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && current === "-" && next === "-") {
      inLineComment = true;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && current === "/" && next === "*") {
      inBlockComment = true;
      continue;
    }

    if (!inDoubleQuote && current === "'" && previous !== "\\") {
      inSingleQuote = !inSingleQuote;
      continue;
    }

    if (!inSingleQuote && current === '"' && previous !== "\\") {
      inDoubleQuote = !inDoubleQuote;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && current === ";") {
      const statement = sql.slice(start, index).trim();
      if (statement.length > 0) {
        statements.push(statement);
      }

      start = index + 1;
    }
  }

  const trailing = sql.slice(start).trim();
  if (trailing.length > 0) {
    statements.push(trailing);
  }

  return statements;
}

async function migrateLibsqlDatabase(databaseUrl: string): Promise<void> {
  const client = createClient({
    url: databaseUrl,
    ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}),
  });

  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_inventory_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrationsRoot = path.resolve(process.cwd(), "prisma/migrations");
  const entries = await readdir(migrationsRoot, { withFileTypes: true });
  const migrationDirectories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  for (const migrationId of migrationDirectories) {
    const migrationPath = path.join(migrationsRoot, migrationId, "migration.sql");
    const migrationSql = await readFile(migrationPath, "utf8");
    const checksum = createHash("sha256").update(migrationSql).digest("hex");

    const existing = await client.execute({
      sql: 'SELECT "checksum" FROM "_inventory_migrations" WHERE "id" = ?',
      args: [migrationId],
    });

    const record = existing.rows[0] as MigrationRecord | undefined;
    if (record) {
      if (record.checksum !== checksum) {
        throw new Error(
          `Checksum mismatch for applied migration "${migrationId}". Aborting deploy migration.`,
        );
      }

      console.log(`Skipping migration ${migrationId} (already applied).`);
      continue;
    }

    const statements: InStatement[] = splitSqlStatements(migrationSql).map((sql) => ({
      sql,
      args: [],
    }));
    statements.push({
      sql: 'INSERT INTO "_inventory_migrations" ("id", "checksum") VALUES (?, ?)',
      args: [migrationId, checksum],
    });

    await client.batch(statements, "write");
    console.log(`Applied migration ${migrationId}.`);
  }
}

async function main(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for db:migrate:deploy.");
  }

  if (databaseUrl.startsWith("file:")) {
    execSync("prisma migrate deploy --schema prisma/schema.prisma", { stdio: "inherit" });
    return;
  }

  if (databaseUrl.startsWith("libsql:")) {
    await migrateLibsqlDatabase(databaseUrl);
    return;
  }

  throw new Error(`Unsupported DATABASE_URL protocol for db:migrate:deploy: ${databaseUrl}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
