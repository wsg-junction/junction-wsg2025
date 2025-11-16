import productsData from '../products.json'; // make sure to have products.json in src/data/

export interface Product {
  categories: ProductCategory[];
  ean: string;
  price: number;
  vendor: Vendor;
  id: string;
  names: TranslatedName[];
  priceString?: string;
  image?: string;
}

export interface Vendor {
  code: string;
  name: string;
}

export interface TranslatedName {
  value: string;
  language: string;
}

export interface ProductCategory {
  code: string;
  name: string;
}
export interface PageResult<T> {
  data: T[];
  page: number;
  total: number;
  pageSize: number;
}

const products = productsData as Product[];
export class ProductService {
  getProducts(page = -1): PageResult<Product> {
    let data: Product[] = [];
    if (page === -1) {
      data = products;
    } else {
      const start = page * 20;
      const end = start + 20;
      data = products.slice(start, end);
    }

    return {
      data: data as Product[],
      page: page,
      total: (products as Product[]).length,
      pageSize: 20,
    };
  }
  async searchProducts(query: string): Promise<Product[]> {
    const parts = query
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter((p) => p.length);

    return products
      .filter((product) => {
        return parts.every((part) =>
          product.names?.some((name) => name.value.toLocaleLowerCase().includes(part)),
        );
      })
      .slice(0, 50);
  }

  getProductById(id: string): Product | undefined {
    const product = products.find((p) => p.id === id);
    if (!product) return undefined;

    const priceString = product.price ? product.price.toFixed(2) : '0.00';
    return {
      ...product,
      priceString: `${priceString} €`,
    };
  }
}
export const productService = new ProductService();

export class ProductCategoryService {
  findSimilarProductsById(productId: string, amount: number = 3): Product[] {
    const product = productService.getProductById(productId);
    if (!product) {
      return [];
    }

    const searchToken =
      product.names?.find((t) => t.language === 'en')?.value || product.names?.[0]?.value || '';

    const categoryCodes = product.categories.map((category) => category.code);

    const { data: products } = productService.getProducts();

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

    return similarProducts;
  }
}
export const productCategoryService = new ProductCategoryService();
