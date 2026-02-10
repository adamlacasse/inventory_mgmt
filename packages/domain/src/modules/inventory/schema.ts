import { z } from "zod";

export const inventoryMovementSchema = z.object({
  productId: z.string().min(1),
  units: z.number().positive(),
  movementType: z.enum(["intake", "outtake"]),
});

export type InventoryMovement = z.infer<typeof inventoryMovementSchema>;
