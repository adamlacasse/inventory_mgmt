import { z } from "zod";

export const outtakeLineSchema = z.object({
  productId: z.string().trim().min(1),
  units: z.number().positive(),
});

export const createOuttakeDraftTransactionInputSchema = z.object({
  date: z.coerce.date(),
  notes: z.string().trim().optional(),
  lineItems: z.array(outtakeLineSchema).min(1),
});

export type OuttakeLine = z.infer<typeof outtakeLineSchema>;
export type CreateOuttakeDraftTransactionInput = z.infer<
  typeof createOuttakeDraftTransactionInputSchema
>;

export interface OuttakeDraftTransaction {
  id: string;
  type: "outtake";
  status: "draft";
  date: Date;
  notes?: string;
  lineItems: OuttakeLine[];
}
