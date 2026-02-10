import { z } from "zod";

export const transactionLockSchema = z.object({
  transactionId: z.string().min(1),
  saved: z.boolean(),
});
