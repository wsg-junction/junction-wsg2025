// src/services/MockProductService.ts
// src/services/MockProductService.ts
import type { IProductService, PageResult, Product } from './IProductService';
import productsData from '@/products.json'; // make sure to have products.json in src/data/

export class MockProductService implements IProductService {
    async getProducts(page = -1): Promise<PageResult<Product>> {
        const products = productsData['products'];
        let data: Product[] = [];
        if (page === -1) {
            data = products as Product[];
        } else {
            const start = page * 20;
            const end = start + 20;
            data = (products as Product[]).slice(start, end);
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

    async getProductById(id: number): Promise<Product | undefined> {
        const products = productsData['products'];
        return new Promise((resolve) => {
            setTimeout(() => {
                const product = (products as Product[]).find((p) => p.id === id);
                resolve(product);
            }, 500);
        });
    }
}
