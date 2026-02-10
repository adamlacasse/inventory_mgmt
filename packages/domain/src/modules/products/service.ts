export interface ProductService {
  ensureProductExists(): Promise<string>;
}
