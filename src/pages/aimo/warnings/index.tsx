import { useProductName } from '@/hooks/use-product-name';
import { firestore, useMyOrders, useQuery } from '@/lib/firebase';
import { collection } from 'firebase/firestore';
import { t } from 'i18next';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Header } from '../components/Header';
import type { Order } from '../orders/picking-dashboard';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import i18n from '@/i18n';
import orders from '../orders';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from '@/components/ui/empty';
import type { Button } from 'react-day-picker';
import type { Link } from 'react-router';

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
      <div className="hero-container p-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/aimo">{t('warehouse_application')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('warehouse_warnings')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero mt-4">
          <h1 className={'text-lg font-bold'}>{t('warehouse_warnings')}</h1>
          <h3 className={'text-gray-800 dark:text-gray-400'}>{t('warehouse_warnings_subtitle')}</h3>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          {warningsWidget}
          {warningsWidget.length === 0 && (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{t('warnings_empty')}</EmptyTitle>
                <EmptyDescription>{t('warnings_empty_subtitle')}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </div>
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
                  <div className="text-lg font-semibold mb-1">
                    {t('product')}: {getTranslatedProductName(item)}
                  </div>
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
