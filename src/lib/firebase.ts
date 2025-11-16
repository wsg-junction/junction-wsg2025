import { useLocalStorage } from '@/hooks/use-local-storage';
import { firebaseConfig } from '@/lib/firebaseConfig';
import type { Order } from '@/pages/aimo/orders/picking-dashboard';
import { initializeApp } from 'firebase/app';
import {
  collection,
  doc,
  DocumentReference,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  Query,
  where,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { useEffect, useMemo, useState } from 'react';

const app = initializeApp(firebaseConfig);

export const firestore = getFirestore(app);
export const messaging = getMessaging(app);

export const vapidKey =
  'BGSdAzANBhS9CQnH6iZVeaWTc93rTlnhpgVqgFs6N5mQPzTgxSbFpBfSHv1nMuFr3b6pPtG45fulUlxvJRONhdA';

export function streamQuery<T>(
  query: Query<DocumentData, DocumentData>,
  onNext: (batches: T[]) => void,
): Unsubscribe {
  return onSnapshot(query, (snapshot) => {
    onNext(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as T));
  });
}

export function useQuery<T>(query: Query<DocumentData, DocumentData>): T[] {
  const [docs, setDocs] = useState<T[]>([]);
  useEffect(() => streamQuery(query, setDocs), [query]);
  return docs;
}

export function streamDoc<T>(
  query: DocumentReference<DocumentData, DocumentData>,
  onNext: (document: T | undefined) => void,
): Unsubscribe {
  return onSnapshot(query, (snapshot) => {
    onNext(snapshot.exists() ? ({ ...snapshot.data(), id: snapshot.id } as T) : undefined);
  });
}

export function useDoc<T>(query: DocumentReference<DocumentData, DocumentData>): T | undefined {
  const [doc, setDoc] = useState<T | undefined>(undefined);
  useEffect(() => streamDoc(query, setDoc), [query]);
  return doc;
}
export function useDocument<T>(collectionPath: string, docId: string): T | null {
  const [document, setDocument] = useState<T | null>(null);

  useEffect(() => {
    if (!docId) return;

    const docRef = doc(firestore, collectionPath, docId);
    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setDocument({ ...snapshot.data(), id: snapshot.id } as T);
      } else {
        setDocument(null); // doc doesn't exist
      }
    });

    return () => unsubscribe();
  }, [collectionPath, docId]);

  return document;
}

export function useMyOrders(): Order[] {
  const [myOrderIds] = useLocalStorage<string[]>('myOrderIds', []);
  return useQuery(
    useMemo(
      () =>
        query(
          collection(firestore, 'orders'),
          where('id', 'in', myOrderIds.length > 0 ? myOrderIds : ['']),
          orderBy('createdAt', 'desc'),
        ),
      [myOrderIds],
    ),
  );
}
export function useOrder(id: string | undefined): Order | undefined {
  return useDoc<Order>(useMemo(() => doc(firestore, 'orders', id ?? ''), [id]));
}
