import { MockProductService } from '@/services/product.service/MockProductService.ts';

export interface Product {
    [key: string]: any;
}
export interface PageResult<T> {
    data: T[];
    page: number;
    total: number;
    pageSize: number;
}

export interface IProductService {
    getProducts(page: number): Promise<PageResult<Product>>;
    getProductById(id: number): Promise<Product | undefined>;
}

export const ProductService = new MockProductService();
