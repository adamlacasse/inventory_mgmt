export interface InventoryRepository {
  getUnitsOnHandByProduct(productId: string): Promise<number>;
}
