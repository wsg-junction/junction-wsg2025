import type { IProductService, Product, PageResult } from './IProductService';
import { firestore } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export class FirebaseProductService implements IProductService {
    private readonly collectionName = 'products';

    async getProducts(page = 1, pageSize = 10): Promise<PageResult<Product>> {
        const querySnapshot = await getDocs(collection(firestore, this.collectionName));

        const allProducts: Product[] = [];
        querySnapshot.forEach((docSnap) => {
            allProducts.push({
                id: Number(docSnap.id),
                ...(docSnap.data() as Omit<Product, 'id'>),
            });
        });

        const total = allProducts.length;

        const start = (page - 1) * pageSize;
        const end = start + pageSize;

        const data = allProducts.slice(start, end);

        return {
            data,
            total,
            page,
            pageSize,
        };
    }

    async getProductById(id: number): Promise<Product | undefined> {
        const docRef = doc(firestore, this.collectionName, id.toString());
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) return undefined;

        return {
            id: Number(docSnap.id),
            ...(docSnap.data() as Omit<Product, 'id'>),
        };
    }
}
