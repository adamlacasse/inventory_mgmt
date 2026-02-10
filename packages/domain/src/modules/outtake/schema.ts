import { z } from "zod";

export const outtakeLineSchema = z.object({
  productId: z.string().min(1),
  units: z.number().positive(),
});
