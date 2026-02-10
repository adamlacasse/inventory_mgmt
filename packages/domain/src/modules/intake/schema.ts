import { z } from "zod";

export const intakeLineSchema = z.object({
  productId: z.string().min(1),
  units: z.number().positive(),
});
