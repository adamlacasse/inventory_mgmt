import { failure } from "../../../../src/server/http";
import { services } from "../../../../src/server/services";

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams;
    const csv = await services.reporting.inventoryCsv(query);

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="current-inventory.csv"',
      },
    });
  } catch (error) {
    return failure(error);
  }
}
