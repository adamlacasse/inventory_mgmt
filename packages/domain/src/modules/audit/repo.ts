export interface AuditRepository {
  updateLockState(transactionId: string, saved: boolean): Promise<void>;
}
