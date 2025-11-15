import productsData from '@/products.json'; // make sure to have products.json in src/data/

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
  async getProducts(page = -1): Promise<PageResult<Product>> {
    let data: Product[] = [];
    if (page === -1) {
      data = products;
    } else {
      const start = page * 20;
      const end = start + 20;
      data = products.slice(start, end);
    }

    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve({
            data: data as Product[],
            page: page,
            total: (products as Product[]).length,
            pageSize: 20,
          }),
        500,
      ); // simulate network delay
    });
  }
  async searchProducts(query: string): Promise<Product[]> {
    const parts = query
      .toLocaleLowerCase()
      .split(/\s+/)
      .filter((p) => p.length);

    return new Promise((resolve) => {
      setTimeout(
        () =>
          resolve(
            products
              .filter((product) => {
                return parts.every((part) =>
                  product.names?.some((name) => name.value.toLocaleLowerCase().includes(part)),
                );
              })
              .slice(0, 50),
          ),
        300,
      ); // simulate network delay
    });
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
