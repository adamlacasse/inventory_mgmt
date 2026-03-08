import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { type Client, type InStatement, createClient } from "@libsql/client/node";

type MigrationFile = {
  checksum: string;
  id: string;
  sql: string;
};

type AppliedMigrationRecord = {
  checksum: string | null;
  source: "inventory" | "prisma";
};

type SqliteMasterRow = {
  name: string;
};

function resolveDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required.");
  }

  return databaseUrl;
}

export function createMigrationClient(): Client {
  return createClient({
    url: resolveDatabaseUrl(),
    ...(process.env.DATABASE_AUTH_TOKEN ? { authToken: process.env.DATABASE_AUTH_TOKEN } : {}),
  });
}

export function splitSqlStatements(sql: string): string[] {
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

export async function listMigrationFiles(): Promise<MigrationFile[]> {
  const migrationsRoot = path.resolve(process.cwd(), "prisma/migrations");
  const entries = await readdir(migrationsRoot, { withFileTypes: true });
  const migrationDirectories = entries
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right));

  return Promise.all(
    migrationDirectories.map(async (id) => {
      const migrationPath = path.join(migrationsRoot, id, "migration.sql");
      const sql = await readFile(migrationPath, "utf8");

      return {
        id,
        sql,
        checksum: createHash("sha256").update(sql).digest("hex"),
      };
    }),
  );
}

async function tableExists(client: Client, tableName: string): Promise<boolean> {
  const result = await client.execute({
    sql: "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    args: [tableName],
  });

  return result.rows.length > 0;
}

export async function ensureInventoryMigrationsTable(client: Client): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "_inventory_migrations" (
      "id" TEXT NOT NULL PRIMARY KEY,
      "checksum" TEXT NOT NULL,
      "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

export async function getAppliedMigrations(
  client: Client,
): Promise<Map<string, AppliedMigrationRecord>> {
  const applied = new Map<string, AppliedMigrationRecord>();

  if (await tableExists(client, "_inventory_migrations")) {
    const inventoryRows = await client.execute(
      'SELECT "id", "checksum" FROM "_inventory_migrations"',
    );

    for (const row of inventoryRows.rows) {
      const record = row as unknown as Record<string, unknown>;
      applied.set(String(row.id), {
        checksum: String(record.checksum),
        source: "inventory",
      });
    }
  }

  if (await tableExists(client, "_prisma_migrations")) {
    const prismaRows = await client.execute(
      'SELECT "migration_name", "checksum" FROM "_prisma_migrations" WHERE "finished_at" IS NOT NULL',
    );

    for (const row of prismaRows.rows) {
      const record = row as unknown as Record<string, unknown>;
      const id = String(row.migration_name);
      if (!applied.has(id)) {
        applied.set(id, {
          checksum:
            typeof record.checksum === "string" || record.checksum === null
              ? record.checksum
              : null,
          source: "prisma",
        });
      }
    }
  }

  return applied;
}

export async function applyPendingMigrations(): Promise<void> {
  const client = createMigrationClient();

  await ensureInventoryMigrationsTable(client);

  const files = await listMigrationFiles();
  const applied = await getAppliedMigrations(client);

  for (const migration of files) {
    const existing = applied.get(migration.id);

    if (existing) {
      if (existing.checksum && existing.checksum !== migration.checksum) {
        throw new Error(
          `Checksum mismatch for applied migration "${migration.id}" from ${existing.source} migrations.`,
        );
      }

      if (existing.source === "prisma") {
        await client.execute({
          sql: 'INSERT OR IGNORE INTO "_inventory_migrations" ("id", "checksum") VALUES (?, ?)',
          args: [migration.id, migration.checksum],
        });
      }

      console.log(`Skipping migration ${migration.id} (already applied via ${existing.source}).`);
      continue;
    }

    const statements: InStatement[] = splitSqlStatements(migration.sql).map((sql) => ({
      sql,
      args: [],
    }));
    statements.push({
      sql: 'INSERT INTO "_inventory_migrations" ("id", "checksum") VALUES (?, ?)',
      args: [migration.id, migration.checksum],
    });

    await client.batch(statements, "write");
    console.log(`Applied migration ${migration.id}.`);
  }
}

export async function verifyMigrationStatus(): Promise<void> {
  const client = createMigrationClient();
  const files = await listMigrationFiles();
  const applied = await getAppliedMigrations(client);

  const pending = files.filter((migration) => !applied.has(migration.id));
  const mismatched = files.filter((migration) => {
    const existing = applied.get(migration.id);
    return !!existing?.checksum && existing.checksum !== migration.checksum;
  });

  if (mismatched.length > 0) {
    throw new Error(
      `Migration checksum mismatch detected for: ${mismatched.map((migration) => migration.id).join(", ")}`,
    );
  }

  if (pending.length > 0) {
    throw new Error(`Pending migrations: ${pending.map((migration) => migration.id).join(", ")}`);
  }

  console.log(`Database is up to date. ${files.length} migration(s) applied.`);
}
