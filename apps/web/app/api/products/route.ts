import { failure, ok, parseJson } from "../../../src/server/http";
import { services } from "../../../src/server/services";

export async function GET() {
  try {
    const products = await services.products.list();
    return ok({ products });
  } catch (error) {
    return failure(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = await parseJson(request);
    const product = await services.products.create(payload);
    return ok({ product }, 201);
  } catch (error) {
    return failure(error);
  }
}
