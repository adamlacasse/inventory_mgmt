export interface AuditService {
  lockTransaction(transactionId: string): Promise<void>;
  unlockTransaction(transactionId: string): Promise<void>;
}
