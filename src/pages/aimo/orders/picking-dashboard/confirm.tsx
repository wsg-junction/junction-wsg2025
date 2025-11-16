import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useProductName } from '@/hooks/use-product-name.ts';
import { firestore } from '@/lib/firebase.ts';
import type { Notification } from '@/pages/customers/components/NotificationsPopover/NotificationsPopover.tsx';
import { useTour } from '@/pages/tour/TourController.tsx';
import { addDoc, collection } from 'firebase/firestore';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router';
import type { Order } from '.';
import { Header } from '../../components/Header';

export default function AimoPickingDashboardConfirmPage() {
  const { t } = useTranslation();
  const { state } = useLocation();
  const order = state as Order;
  const navigate = useNavigate();
  const { fulfillStep } = useTour();
  const getTranslatedProductName = useProductName();

  async function confirm() {
    try {
      const docRef = await addDoc(collection(firestore, 'notifications'), {
        title: 'Your order has missing items',
        message: 'Some items were not available. Click on this notification to select alternatives.',
        createdAt: Date.now(),
        read: false,
        orderId: order.id,
      } as Omit<Notification, 'id'>);
      console.log('Document written with ID: ', docRef.id);
    } catch (error) {
      console.error('Error adding document: ', error);
    }

    if (order.pushNotificationToken) {
      console.log('Sending notification to', order.pushNotificationToken, 'for order', order.id);

      fetch('https://sendpushnotification-3avmwyjhaq-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: order.pushNotificationToken,
          notification: {
            title: t('push_notifications.missing_items.title'),
            body: t('push_notifications.missing_items.body', { orderId: order.id }),
          },
          data: { orderId: order.id, hasMissingItems: 'true' },
          webpush: {
            notification: {
              // actions: [
              //   {
              //     action: 'view_order',
              //     title: 'View Order',
              //   },
              //   {
              //     action: 'select_alternatives',
              //     title: 'Select Alternatives',
              //   },
              // ],
              requireInteraction: true,
            },
          },
        }),
      });
    }

    if (order.telephone) {
      console.log('Calling', order.telephone, 'for order', order.id);

      fetch('https://helloworld-3avmwyjhaq-uc.a.run.app', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: order.lang.split('-')[0],
          phone_number: order.telephone,
          order_id: order.id,
        }),
      });
    }

    navigate('/aimo/orders');
    fulfillStep('warehouse_order_picking');
  }

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
              <BreadcrumbLink href="/aimo/orders">{t('warehouse_orders')}</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href={`/aimo/orders/${order.id}/picking-dashboard`}>
                {t('warehouse_order_picking')}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{t('warehouse_order_picking_confirmation_short')}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="hero mt-4">
          <h1 className={'text-lg font-bold'}>{t('warehouse_order_picking_confirmation')}</h1>
          <h3 className={'text-gray-800 dark:text-gray-400'}>
            {t('warehouse_order_picking_confirmation_subtitle')}
          </h3>
        </div>

        <div className="flex flex-col gap-4 mt-6">
          {Object.values(order.products).map((product) => (
            <div className="p-4 flex flex-row border rounded-lg">
              <h3 className="flex flex-2">{getTranslatedProductName(product)}</h3>
              <p className="flex flex-1">Ordered Quantity: {product.orderedQuantity}</p>
              <p className="flex flex-1">Picked Quantity: {product.pickEvent?.quantity ?? 0}</p>
            </div>
          ))}
          <Button
            onClick={confirm}
            className="w-64 self-end">
            Confirm and notify client
          </Button>
        </div>
      </div>
    </div>
  );
}
