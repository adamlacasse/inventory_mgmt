import type { AuditRepository } from "./repo";

export class TransactionLockedError extends Error {
  readonly transactionId: string;

  constructor(transactionId: string) {
    super(`Transaction ${transactionId} is locked and cannot be mutated.`);
    this.name = "TransactionLockedError";
    this.transactionId = transactionId;
  }
}

export interface AuditService {
  lockTransaction(transactionId: string): Promise<void>;
  unlockTransaction(transactionId: string): Promise<void>;
  assertTransactionUnlocked(transactionId: string): Promise<void>;
  runMutation<T>(transactionId: string, mutate: () => Promise<T>): Promise<T>;
}

function normalizeTransactionId(transactionId: string): string {
  const trimmedTransactionId = transactionId.trim();
  if (trimmedTransactionId.length === 0) {
    throw new Error("transactionId is required.");
  }

  return trimmedTransactionId;
}

export function createAuditService(repository: AuditRepository): AuditService {
  return {
    async lockTransaction(transactionId) {
      const validTransactionId = normalizeTransactionId(transactionId);
      await repository.setLockState(validTransactionId, true);
    },

    async unlockTransaction(transactionId) {
      const validTransactionId = normalizeTransactionId(transactionId);
      await repository.setLockState(validTransactionId, false);
    },

    async assertTransactionUnlocked(transactionId) {
      const validTransactionId = normalizeTransactionId(transactionId);
      const isLocked = await repository.getLockState(validTransactionId);
      if (isLocked) {
        throw new TransactionLockedError(validTransactionId);
      }
    },

    async runMutation(transactionId, mutate) {
      await this.assertTransactionUnlocked(transactionId);
      return mutate();
    },
  };
}
