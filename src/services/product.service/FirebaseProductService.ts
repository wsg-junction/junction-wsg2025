// src/services/FirebaseProductService.ts
// src/services/FirebaseProductService.ts
import type { IProductService, Product } from './IProductService';
import { firestore } from '@/lib/firebase'; // your initialized Firestore instance
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export class FirebaseProductService implements IProductService {
    private readonly collectionName = 'products';

    async getProducts(): Promise<Product[]> {
        const querySnapshot = await getDocs(collection(firestore, this.collectionName));
        const products: Product[] = [];
        querySnapshot.forEach((docSnap) => {
            products.push({ id: Number(docSnap.id), ...(docSnap.data() as Omit<Product, 'id'>) });
        });
        return products;
    }

    async getProductById(id: number): Promise<Product | undefined> {
        const docRef = doc(firestore, this.collectionName, id.toString());
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) return undefined;
        return { id: Number(docSnap.id), ...(docSnap.data() as Omit<Product, 'id'>) };
    }
}
