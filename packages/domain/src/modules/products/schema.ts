import { z } from "zod";

export const productIdentitySchema = z.object({
  productName: z.string().min(1),
  productCategory: z.string().min(1),
  lotNumber: z.string().min(1),
});
