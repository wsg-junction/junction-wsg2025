// src/services/ProductCategoryService.ts
import { type Product, productService } from '@/services/ProductService.ts'; // make sure to have products.json in src/data/

export class ProductCategoryService {
  async findSimilarProductsById(productId: string, amount: number = 3): Promise<Product[]> {
    const product = productService.getProductById(productId);
    if (!product) {
      return new Promise((resolve) => {
        setTimeout(() => resolve([]), 500);
      });
    }

    const searchToken =
      product.names?.find((t) => t.language === 'en')?.value || product.names?.[0]?.value || '';

    const categoryCodes = product.categories.map((category) => category.code);

    const { data: products } = await productService.getProducts();

    const tokens = (searchToken || '').toLowerCase().split(/\s+/).filter(Boolean);

    type Enriched = Product & {
      matchingCategories: string[];
      nameMatchCount: number;
    };

    const similarProducts: Product[] = products
      .map<Enriched>((p) => {
        const matchingCategories = p.categories
          .map((category) => category.code)
          .filter((code) => code.length > 3)
          .filter((code) => categoryCodes.includes(code));

        const name = p.names?.find((t) => t.language === 'en')?.value || p.names?.[0]?.value || '';

        const nameLower = (name || '').toLowerCase();
        const nameMatchCount = tokens.length
          ? tokens.reduce((acc, t) => acc + (nameLower.includes(t) ? 1 : 0), 0)
          : 0;

        return {
          ...p,
          matchingCategories,
          nameMatchCount,
        };
      })
      .filter((p) => p.id !== product.id && (p.matchingCategories.length > 0 || p.nameMatchCount > 0))
      .sort((a, b) => {
        if (b.matchingCategories.length !== a.matchingCategories.length) {
          return b.matchingCategories.length - a.matchingCategories.length;
        }
        return b.nameMatchCount - a.nameMatchCount;
      })
      .map((item) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { matchingCategories, nameMatchCount, ...orig } = item;
        return orig as Product;
      })
      .slice(0, amount);

    return new Promise((resolve) => {
      setTimeout(() => resolve(similarProducts), 500); // simulate network delay
    });
  }
}
export const productCategoryService = new ProductCategoryService();
