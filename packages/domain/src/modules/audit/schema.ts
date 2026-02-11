import { z } from "zod";

export const transactionLockStateSchema = z.object({
  transactionId: z.string().trim().min(1),
  locked: z.boolean(),
});

export type TransactionLockState = z.infer<typeof transactionLockStateSchema>;
