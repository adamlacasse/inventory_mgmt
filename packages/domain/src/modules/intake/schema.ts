import { z } from "zod";

export const intakeLineSchema = z.object({
  productId: z.string().trim().min(1),
  units: z.number().positive(),
});

export const createIntakeDraftTransactionInputSchema = z.object({
  date: z.coerce.date(),
  notes: z.string().trim().optional(),
  lineItems: z.array(intakeLineSchema).min(1),
});

export type IntakeLine = z.infer<typeof intakeLineSchema>;
export type CreateIntakeDraftTransactionInput = z.infer<
  typeof createIntakeDraftTransactionInputSchema
>;

export interface IntakeDraftTransaction {
  id: string;
  type: "intake";
  status: "draft";
  date: Date;
  notes?: string;
  lineItems: IntakeLine[];
}
