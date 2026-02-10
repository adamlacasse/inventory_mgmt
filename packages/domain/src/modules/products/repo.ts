export interface ProductRepository {
  findByIdentity(): Promise<string | null>;
}
