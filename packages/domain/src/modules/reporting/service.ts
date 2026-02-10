export interface ReportingService {
  exportCurrentInventoryCsv(): Promise<string>;
}
