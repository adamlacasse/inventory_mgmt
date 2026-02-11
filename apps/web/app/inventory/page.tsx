import { InventoryPageView } from "../../src/modules/inventory/InventoryPageView";
import { sampleInventoryRows } from "../../src/modules/inventory/data";

export default function InventoryPage() {
  return <InventoryPageView rows={sampleInventoryRows} />;
}
