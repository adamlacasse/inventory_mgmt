export interface IntakeService {
  createDraftTransaction(): Promise<string>;
}
