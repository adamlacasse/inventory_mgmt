export interface AuditRepository {
  getLockState(transactionId: string): Promise<boolean>;
  setLockState(transactionId: string, locked: boolean): Promise<void>;
}
