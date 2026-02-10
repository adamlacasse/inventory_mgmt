import { z } from "zod";

export const reportRangeSchema = z.object({
  startDate: z.string().date(),
  endDate: z.string().date(),
});
