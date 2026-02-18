import { describe, expect, it, vi } from "vitest";
import type { AuditRepository } from "../src/modules/audit/repo";
import { TransactionLockedError, createAuditService } from "../src/modules/audit/service";

function createInMemoryAuditRepository(): AuditRepository {
  const lockStates = new Map<string, boolean>();

  return {
    async getLockState(transactionId) {
      return lockStates.get(transactionId) ?? false;
    },
    async setLockState(transactionId, locked) {
      lockStates.set(transactionId, locked);
    },
  };
}

describe("audit service", () => {
  it("locks a transaction", async () => {
    const repository = createInMemoryAuditRepository();
    const service = createAuditService(repository);

    await service.lockTransaction("tx-001");

    await expect(repository.getLockState("tx-001")).resolves.toBe(true);
  });

  it("blocks mutation while transaction is locked", async () => {
    const repository = createInMemoryAuditRepository();
    const service = createAuditService(repository);
    const mutate = vi.fn(async () => "updated");

    await service.lockTransaction("tx-001");

    await expect(service.runMutation("tx-001", mutate)).rejects.toBeInstanceOf(
      TransactionLockedError,
    );
    expect(mutate).not.toHaveBeenCalled();
  });

  it("allows mutation after explicit unlock", async () => {
    const repository = createInMemoryAuditRepository();
    const service = createAuditService(repository);
    const mutate = vi.fn(async () => "updated");

    await service.lockTransaction("tx-001");
    await service.unlockTransaction("tx-001");

    await expect(service.runMutation("tx-001", mutate)).resolves.toBe("updated");
    expect(mutate).toHaveBeenCalledOnce();
  });
});
