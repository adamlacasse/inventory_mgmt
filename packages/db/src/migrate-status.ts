import process from "node:process";
import { verifyMigrationStatus } from "./migrations";

async function main(): Promise<void> {
  await verifyMigrationStatus();
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
