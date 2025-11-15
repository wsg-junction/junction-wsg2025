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
                const lowerName = product.name.toLocaleLowerCase();
                return parts.every((part) => lowerName.includes(part));
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

    const imageName = product.images?.find((t) => t.format === 'product')?.savedImage ?? null;
    const priceString = product.price.value ? product.price.value.toFixed(2) : '0.00';
    return {
      ...product,
      imageUrl: imageName ? `/product_images/${imageName}` : null,
      // eslint-disable-next-line no-irregular-whitespace
      priceString: `${priceString} €`,
    };
  }
}
export const productService = new ProductService();
