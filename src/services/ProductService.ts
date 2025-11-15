import productsData from '@/products.json'; // make sure to have products.json in src/data/

export interface Product {
  [key: string]: any;
}
export interface PageResult<T> {
  data: T[];
  page: number;
  total: number;
  pageSize: number;
}

const products = productsData['products'] as Product[];
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

  getProductById(id: number): Product | undefined {
    return products.find((p) => p.id === id);
  }
}
export const productService = new ProductService();
