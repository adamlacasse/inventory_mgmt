export interface InventoryRow {
  productName: string;
  category: string;
  lot: string;
  unitsOnHand: number;
}

export interface InventoryFilters {
  productName: string;
  category: string;
  lot: string;
}
