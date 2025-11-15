import { firebaseConfig } from '@/lib/firebaseConfig';
import { initializeApp } from 'firebase/app';
import { getFirestore, onSnapshot, Query, type DocumentData, type Unsubscribe } from 'firebase/firestore';
import { getMessaging } from 'firebase/messaging';
import { useEffect, useState } from 'react';
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
