import { useProductName } from '@/hooks/use-product-name';
import { firestore, useMyOrders, useQuery } from '@/lib/firebase';
import { collection } from 'firebase/firestore';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import type { Order } from '../orders/picking-dashboard';

export type Warning = {
  orderId?: string;
  itemId?: string;
  title: string;
  description: string;
};

export default function AimoWarningsPage() {
  const warnings = useQuery<Warning>(useMemo(() => collection(firestore, 'warnings'), []));
  const myOrders = useMyOrders();

  const warningsWidget = BuildWarning({ orders: myOrders, warnings });

  return (
    <div>
      <Header />
      <div className="flex flex-col gap-4 p-4">
        {warningsWidget}
        {warningsWidget.length === 0 && <div>No warnings</div>}
      </div>
    </div>
  );
}

function BuildWarning({ orders, warnings }: { orders: Order[]; warnings: Warning[] }) {
  const { i18n } = useTranslation();
  const getTranslatedProductName = useProductName(i18n);

  return orders
    .filter((it) => warnings.some((warning) => warning.orderId === it.id))
    .map((order) => {
      const orderWarnings = warnings.filter((it) => it.orderId === order.id);
      return (
        <div
          key={order.id}
          className="p-4 border rounded-lg bg-white shadow-sm">
          <div className="text-xl font-bold mb-2">Order: {order.id}</div>

          {order.products
            .filter((product) => orderWarnings.some((it) => it.itemId === product.id))
            .map((item) => {
              const warnings = orderWarnings.filter((it) => it.itemId === item.id);
              return (
                <div className="mb-3 pl-4">
                  <div className="text-lg font-semibold mb-1">Product: {getTranslatedProductName(item)}</div>
                  <div className="space-y-2 pl-4">
                    {warnings.map((w, idx) => (
                      <div
                        key={idx}
                        className="p-3 border border-yellow-400 bg-yellow-100 rounded">
                        <div className="text-md font-bold">{w.title}</div>
                        <div>{w.description}</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      );
    });
}
