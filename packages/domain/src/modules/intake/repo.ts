import type { IntakeDraftTransaction } from "./schema";

export interface IntakeRepository {
  save(transaction: IntakeDraftTransaction): Promise<void>;
}
