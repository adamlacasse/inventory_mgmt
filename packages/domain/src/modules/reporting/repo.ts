export interface ReportingRepository {
  getInventorySnapshot(): Promise<unknown[]>;
}
