import { type InventoryMovement, inventoryMovementSchema } from "./schema";

export function calculateUnitsOnHand(movements: InventoryMovement[]): number {
  return movements.reduce((unitsOnHand, movement) => {
    inventoryMovementSchema.parse(movement);
    if (movement.movementType === "intake") {
      return unitsOnHand + movement.units;
    }

    return unitsOnHand - movement.units;
  }, 0);
}

export function canOuttake(unitsOnHand: number, requestedUnits: number): boolean {
  if (requestedUnits <= 0) {
    return false;
  }

  return requestedUnits <= unitsOnHand;
}
