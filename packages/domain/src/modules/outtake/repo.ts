import type { OuttakeDraftTransaction } from "./schema";

export interface OuttakeRepository {
  save(transaction: OuttakeDraftTransaction): Promise<void>;
}
